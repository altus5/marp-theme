#!/usr/bin/env node
"use strict";

const { execSync } = require("child_process");
const { existsSync, readFileSync, readdirSync, unlinkSync, writeFileSync } = require("fs");
const path = require("path");
const { buildTheme } = require("./build-theme");

// --- 設定 ---
const PROJECT_ROOT = path.join(__dirname, "..");
const DEFAULT_THEME = "rooster-blue";
const PUPPETEER_CONFIG = path.join(PROJECT_ROOT, "puppeteer-config.json");

// node_modules/.bin を PATH に追加（ローカル実行用）
const binDir = path.join(PROJECT_ROOT, "node_modules", ".bin");
process.env.PATH = `${binDir}${path.delimiter}${process.env.PATH}`;

// --- 引数パース ---
const args = process.argv.slice(2);
if (args.length === 0) {
  console.error("Usage: build-pdf.js <input.md> [output.pdf]");
  process.exit(1);
}
const input = args[0];
const inputDir = path.dirname(input);
const inputBase = path.basename(input, ".md");
const output = args[1] || path.join(inputDir, `${inputBase}.pdf`);

// --- 環境変数 ---
const workDir = process.env.WORK_DIR || ".";
const themeName = process.env.MARP_THEME || DEFAULT_THEME;

process.chdir(workDir);

// --- 一時ファイルのプレフィックス ---
const TMP_TAG = "__marp_tmp__";

// --- mermaid config 解決: プロジェクト側 > テーマ別 > 共通デフォルト ---
function resolveMermaidConfig() {
  const local = "mermaid.config.json";
  if (existsSync(local)) return path.resolve(local);
  const perTheme = path.join(PROJECT_ROOT, `themes/${themeName}.mermaid.json`);
  if (existsSync(perTheme)) return perTheme;
  const fallback = path.join(PROJECT_ROOT, "mermaid.config.json");
  if (existsSync(fallback)) return fallback;
  return null;
}

// --- SVG の width="100%" を viewBox に基づく固定値に修正（スライドに収まるよう制限） ---
const SVG_MAX_HEIGHT = 420;

function fixSvgWidth(svgPath) {
  let svg = readFileSync(svgPath, "utf8");
  const vbMatch = svg.match(/viewBox="[\d.\-]+\s+[\d.\-]+\s+([\d.]+)\s+([\d.]+)"/);
  if (!vbMatch) return;
  let w = parseFloat(vbMatch[1]);
  let h = parseFloat(vbMatch[2]);
  if (h > SVG_MAX_HEIGHT) {
    const scale = SVG_MAX_HEIGHT / h;
    w = Math.ceil(w * scale);
    h = SVG_MAX_HEIGHT;
  } else {
    w = Math.ceil(w);
    h = Math.ceil(h);
  }
  svg = svg.replace(/width="100%"/, `width="${w}" height="${h}"`);
  svg = svg.replace(/style="[^"]*max-width:[^"]*"/, `style=""`);
  writeFileSync(svgPath, svg, "utf8");
}

// --- mermaid SVG 生成（外部 .mmd ファイル） ---
function buildMermaidSvgs() {
  const scanDir = inputDir === "." ? "." : inputDir;
  const prefix = `${inputBase}_`;
  const mmdFiles = readdirSync(scanDir)
    .filter((f) => f.startsWith(prefix) && f.endsWith(".mmd") && !f.includes(TMP_TAG))
    .sort();
  if (mmdFiles.length === 0) return false;

  const config = resolveMermaidConfig();
  const configOpt = config ? `-c "${config}"` : "";

  for (const mmd of mmdFiles) {
    const mmdPath = path.join(scanDir, mmd);
    const svgPath = path.join(scanDir, mmd.replace(/\.mmd$/, ".svg"));
    console.log(`  mermaid SVG 生成中 (外部): ${mmdPath}`);
    execSync(`mmdc -i "${mmdPath}" -o "${svgPath}" ${configOpt} -p "${PUPPETEER_CONFIG}" --width 1200`, {
      stdio: "inherit",
    });
    // mmdc が生成する中間ファイル (.mmd.svg) を削除
    const intermediate = `${mmdPath}.svg`;
    if (existsSync(intermediate)) unlinkSync(intermediate);
    fixSvgWidth(svgPath);
  }
  return true;
}

// --- インライン mermaid 抽出（remark AST） ---
async function extractInlineMermaid(markdown) {
  const { unified } = await import("unified");
  const remarkParse = (await import("remark-parse")).default;

  const tree = unified().use(remarkParse).parse(markdown);

  const blocks = [];
  for (const node of tree.children) {
    if (node.type === "code" && node.lang === "mermaid") {
      blocks.push({
        value: node.value,
        start: node.position.start.offset,
        end: node.position.end.offset,
      });
    }
  }
  return blocks;
}

// --- インライン mermaid → SVG 生成 ---
function buildInlineMermaidSvgs(blocks) {
  const config = resolveMermaidConfig();
  const configOpt = config ? `-c "${config}"` : "";
  const scanDir = inputDir === "." ? "." : inputDir;

  const svgPaths = [];
  for (let i = 0; i < blocks.length; i++) {
    const mmdPath = path.join(scanDir, `${inputBase}.${TMP_TAG}${i}.mmd`);
    const svgPath = path.join(scanDir, `${inputBase}.${TMP_TAG}${i}.svg`);
    writeFileSync(mmdPath, blocks[i].value, "utf8");
    console.log(`  mermaid SVG 生成中 (インライン #${i}): ${mmdPath}`);
    execSync(`mmdc -i "${mmdPath}" -o "${svgPath}" ${configOpt} -p "${PUPPETEER_CONFIG}" --width 1200`, {
      stdio: "inherit",
    });
    // mmdc が生成する中間ファイル (.mmd.svg) を削除
    const intermediate = `${mmdPath}.svg`;
    if (existsSync(intermediate)) unlinkSync(intermediate);
    fixSvgWidth(svgPath);
    svgPaths.push(svgPath);
  }
  return svgPaths;
}

// --- 一時 Markdown 生成（mermaid ブロック → 画像参照に置換） ---
function createTempMarkdown(src, blocks, svgPaths) {
  const scanDir = inputDir === "." ? "." : inputDir;
  const tmpMdPath = path.join(scanDir, `${inputBase}.${TMP_TAG}.md`);

  // 後ろから置換してオフセットを壊さない
  let result = src;
  for (let i = blocks.length - 1; i >= 0; i--) {
    const svgRelative = path.basename(svgPaths[i]);
    const replacement = `![mermaid diagram](${svgRelative})`;
    result = result.slice(0, blocks[i].start) + replacement + result.slice(blocks[i].end);
  }

  writeFileSync(tmpMdPath, result, "utf8");
  return tmpMdPath;
}

// --- 一時ファイル削除 ---
function cleanup(tmpFiles) {
  for (const f of tmpFiles) {
    if (existsSync(f)) {
      unlinkSync(f);
    }
  }
}

// --- PDF 生成 ---
function buildPdf(resolvedTheme, mdInput) {
  console.log(`[2/2] PDF 生成中...`);
  execSync(
    `marp --html --pdf --allow-local-files --theme "${resolvedTheme}" "${mdInput}" -o "${output}"`,
    { stdio: "inherit" }
  );
}

// --- メイン ---
async function main() {
  const resolvedTheme = buildTheme({ themeName });

  console.log("[1/2] mermaid SVG 生成中...");
  buildMermaidSvgs();

  // インライン mermaid 処理
  const markdown = readFileSync(input, "utf8");
  const blocks = await extractInlineMermaid(markdown);
  const tmpFiles = [];

  let mdForMarp = input;
  if (blocks.length > 0) {
    console.log(`  インライン mermaid ブロック: ${blocks.length} 件検出`);
    const svgPaths = buildInlineMermaidSvgs(blocks);
    const tmpMdPath = createTempMarkdown(markdown, blocks, svgPaths);

    mdForMarp = tmpMdPath;
    // 一時ファイルリスト（cleanup 用）
    tmpFiles.push(tmpMdPath);
    for (let i = 0; i < blocks.length; i++) {
      const scanDir = inputDir === "." ? "." : inputDir;
      tmpFiles.push(path.join(scanDir, `${inputBase}.${TMP_TAG}${i}.mmd`));
      tmpFiles.push(path.join(scanDir, `${inputBase}.${TMP_TAG}${i}.svg`));
    }
  }

  buildPdf(resolvedTheme, mdForMarp);

  if (tmpFiles.length > 0) {
    cleanup(tmpFiles);
  }

  console.log(`完了: ${output}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
