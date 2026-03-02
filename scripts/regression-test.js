#!/usr/bin/env node
"use strict";

const { execSync } = require("child_process");
const { existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync, rmSync } = require("fs");
const path = require("path");

// --- 引数パース ---
const args = process.argv.slice(2);
const isUpdate = args.includes("--update");
const scanDirs = args.filter((a) => !a.startsWith("--"));

if (scanDirs.length === 0) {
  console.error("Usage: marp-regression [--update] <dir...>");
  console.error("  例: marp-regression examples");
  console.error("  例: marp-regression --update docs");
  process.exit(1);
}

// --- 設定 ---
const PROJECT_ROOT = process.cwd();
const REGRESSION_DIR = path.join(PROJECT_ROOT, ".regression");

// marp バイナリの PATH 解決（直接 / marp-theme 経由 / スクリプト元）
const pathDirs = [
  path.join(PROJECT_ROOT, "node_modules", ".bin"),
  path.join(PROJECT_ROOT, "node_modules", "marp-theme", "node_modules", ".bin"),
  path.join(__dirname, "..", "node_modules", ".bin"),
];
process.env.PATH = [...pathDirs, process.env.PATH].join(path.delimiter);

// --- ユーティリティ ---
function cleanDir(dir) {
  if (existsSync(dir)) rmSync(dir, { recursive: true });
  mkdirSync(dir, { recursive: true });
}

function listPngs(dir) {
  if (!existsSync(dir)) return [];
  return readdirSync(dir)
    .filter((f) => f.endsWith(".png"))
    .sort();
}

function isMarp(filePath) {
  const content = readFileSync(filePath, "utf8");
  return /^marp:\s*true/m.test(content);
}

function getSlideHeadings(filePath) {
  const md = readFileSync(filePath, "utf8");
  const slides = md.split(/^---$/m);
  const headings = [];
  for (const slide of slides) {
    const match = slide.match(/^#{1,3}\s+(.+)/m);
    headings.push(match ? match[1].trim() : "");
  }
  return headings;
}

function collectMarpFiles(dir, rel = "") {
  const absDir = path.resolve(dir);
  const results = [];
  for (const entry of readdirSync(absDir, { withFileTypes: true })) {
    if (["node_modules", ".regression", ".git"].includes(entry.name)) continue;
    const fullPath = path.join(absDir, entry.name);
    const relPath = rel ? `${rel}/${entry.name}` : entry.name;
    if (entry.isDirectory()) {
      results.push(...collectMarpFiles(fullPath, relPath));
    } else if (entry.name.endsWith(".md") && entry.name !== "README.md") {
      if (isMarp(fullPath)) {
        results.push({ rel: relPath, abs: fullPath, dir });
      }
    }
  }
  return results.sort((a, b) => a.rel.localeCompare(b.rel));
}

function fileSlug(file) {
  return file.replace(/[\/\\]/g, "_").replace(/\.md$/, "");
}

// --- marp で PNG 生成（テーマは .marprc.yml / package.json から自動解決） ---
function generateImages(mdPath, outputDir) {
  mkdirSync(outputDir, { recursive: true });
  const outBase = path.join(outputDir, "slide.png");
  try {
    execSync(
      `marp --images png --html --allow-local-files "${mdPath}" -o "${outBase}"`,
      { stdio: ["ignore", "inherit", "inherit"] }
    );
  } catch {
    return null; // 生成失敗（A4テーマ等）
  }
  return listPngs(outputDir);
}

// --- pixelmatch で比較 ---
async function compareImages(baselineDir, currentDir, baselineFiles, currentFiles, headings) {
  const pixelmatch = (await import("pixelmatch")).default;
  const { PNG } = await import("pngjs");

  const results = [];
  const compareCount = Math.min(baselineFiles.length, currentFiles.length);

  for (let i = 0; i < compareCount; i++) {
    const baselinePath = path.join(baselineDir, baselineFiles[i]);
    const currentPath = path.join(currentDir, currentFiles[i]);

    const baselinePng = PNG.sync.read(readFileSync(baselinePath));
    const currentPng = PNG.sync.read(readFileSync(currentPath));

    const { width, height } = baselinePng;
    const diff = new PNG({ width, height });

    const mismatch = pixelmatch(
      baselinePng.data, currentPng.data, diff.data, width, height,
      { threshold: 0.1 }
    );

    const heading = headings[i + 1] || "";
    const fileName = baselineFiles[i];

    if (mismatch > 0) {
      const diffDir = path.join(path.dirname(baselineDir), "diff");
      mkdirSync(diffDir, { recursive: true });
      writeFileSync(path.join(diffDir, fileName), PNG.sync.write(diff));
      results.push({ fileName, heading, mismatch, pass: false });
    } else {
      results.push({ fileName, heading, mismatch: 0, pass: true });
    }
  }

  return { results, compareCount, baselineCount: baselineFiles.length, currentCount: currentFiles.length };
}

// --- ファイル収集 ---
function collectAllFiles() {
  const allFiles = [];
  for (const dir of scanDirs) {
    allFiles.push(...collectMarpFiles(dir));
  }
  return allFiles;
}

// --- ベースライン更新 ---
async function updateBaseline() {
  console.log("[regression] ベースライン更新\n");

  const marpFiles = collectAllFiles();
  if (marpFiles.length === 0) {
    console.log("Marp ファイルが見つかりません。");
    process.exit(0);
  }

  console.log(`対象ファイル: ${marpFiles.length} 件\n`);

  for (let fi = 0; fi < marpFiles.length; fi++) {
    const { rel, abs } = marpFiles[fi];
    const slug = fileSlug(rel);
    const baselineDir = path.join(REGRESSION_DIR, slug, "baseline");

    console.log(`[${fi + 1}/${marpFiles.length}] ${rel}`);
    cleanDir(baselineDir);
    const files = generateImages(abs, baselineDir);
    if (files === null) {
      console.log(`  → スキップ（画像生成に非対応）\n`);
      rmSync(baselineDir, { recursive: true });
      continue;
    }
    console.log(`  → ${files.length} ページ\n`);
  }

  console.log("完了: ベースラインを保存しました");
}

// --- 比較テスト ---
async function runTest() {
  console.log("[regression] ビジュアル回帰テスト開始\n");

  const marpFiles = collectAllFiles();
  if (marpFiles.length === 0) {
    console.log("Marp ファイルが見つかりません。");
    process.exit(0);
  }

  // ベースライン存在チェック（いずれかのファイルにベースラインがあればOK）
  const hasAnyBaseline = marpFiles.some((f) => {
    const dir = path.join(REGRESSION_DIR, fileSlug(f.rel), "baseline");
    return existsSync(dir) && listPngs(dir).length > 0;
  });
  if (!hasAnyBaseline) {
    console.error("エラー: ベースラインが見つかりません");
    console.error("  先に --update でベースラインを作成してください:");
    console.error("  npm run test:regression -- --update");
    process.exit(1);
  }

  console.log(`対象ファイル: ${marpFiles.length} 件\n`);

  let totalPass = 0;
  let totalFail = 0;
  let totalCompare = 0;
  const failedFiles = [];

  for (let fi = 0; fi < marpFiles.length; fi++) {
    const { rel, abs } = marpFiles[fi];
    const slug = fileSlug(rel);
    const baselineDir = path.join(REGRESSION_DIR, slug, "baseline");
    const currentDir = path.join(REGRESSION_DIR, slug, "current");

    const baselineFiles = listPngs(baselineDir);
    if (baselineFiles.length === 0) {
      console.log(`[${fi + 1}/${marpFiles.length}] ${rel} — ベースラインなし (スキップ)`);
      continue;
    }

    console.log(`[${fi + 1}/${marpFiles.length}] ${rel}`);
    cleanDir(currentDir);

    console.log("  現在の画像を生成中...");
    const currentFiles = generateImages(abs, currentDir);
    if (currentFiles === null) {
      console.log(`  → スキップ（画像生成に非対応）\n`);
      continue;
    }
    console.log(`  → ${currentFiles.length} ページ`);

    const headings = getSlideHeadings(abs);
    const { results, compareCount, baselineCount, currentCount } = await compareImages(
      baselineDir, currentDir, baselineFiles, currentFiles, headings
    );

    let fileFail = 0;
    for (const r of results) {
      const label = r.heading ? ` (${r.heading})` : "";
      if (r.pass) {
        console.log(`    \u2713 ${r.fileName}${label}`);
      } else {
        fileFail++;
        console.log(`    \u2717 ${r.fileName}${label} \u2014 差分 ${r.mismatch} px`);
      }
    }

    const newPages = currentCount - baselineCount;
    if (newPages > 0) {
      console.log(`  新規ページ: ${newPages} — 比較対象外`);
    }

    totalPass += compareCount - fileFail;
    totalFail += fileFail;
    totalCompare += compareCount;
    if (fileFail > 0) failedFiles.push(rel);
    console.log("");
  }

  console.log("========================================");
  console.log(`結果: ${totalPass}/${totalCompare} パス, ${totalFail} 失敗`);
  if (failedFiles.length > 0) {
    console.log(`失敗ファイル:`);
    for (const f of failedFiles) {
      console.log(`  - ${f}`);
    }
    console.log(`\n差分画像: .regression/*/diff/`);
  }

  process.exit(totalFail > 0 ? 1 : 0);
}

// --- メイン ---
async function main() {
  if (isUpdate) {
    await updateBaseline();
  } else {
    await runTest();
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
