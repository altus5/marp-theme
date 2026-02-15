#!/usr/bin/env node
"use strict";

const { execSync } = require("child_process");
const { existsSync, readdirSync, unlinkSync } = require("fs");
const path = require("path");

// --- 設定 ---
const PROJECT_ROOT = path.join(__dirname, "..");
const DEFAULT_THEME = "altus5-blue";
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
const themeFile = path.join(PROJECT_ROOT, `themes/${themeName}.css`);

process.chdir(workDir);

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

// --- mermaid SVG 生成 ---
function buildMermaidSvgs() {
  const scanDir = inputDir === "." ? "." : inputDir;
  const prefix = `${inputBase}_`;
  const mmdFiles = readdirSync(scanDir)
    .filter((f) => f.startsWith(prefix) && f.endsWith(".mmd"))
    .sort();
  if (mmdFiles.length === 0) return false;

  const config = resolveMermaidConfig();
  const configOpt = config ? `-c "${config}"` : "";

  for (const mmd of mmdFiles) {
    const mmdPath = path.join(scanDir, mmd);
    const svgPath = path.join(scanDir, mmd.replace(/\.mmd$/, ".svg"));
    console.log(`[1/2] mermaid SVG 生成中: ${mmdPath}`);
    execSync(`mmdc -i "${mmdPath}" -o "${svgPath}" ${configOpt} -p "${PUPPETEER_CONFIG}" --width 1200`, {
      stdio: "inherit",
    });
    // mmdc が生成する中間ファイル (.mmd.svg) を削除
    const intermediate = `${mmdPath}.svg`;
    if (existsSync(intermediate)) unlinkSync(intermediate);
  }
  return true;
}

// --- PDF 生成 ---
function buildPdf() {
  console.log(`[${hasMmd ? "2/2" : "1/1"}] PDF 生成中...`);
  execSync(
    `marp --html --pdf --allow-local-files --theme "${themeFile}" "${input}" -o "${output}"`,
    { stdio: "inherit" }
  );
}

// --- メイン ---
const hasMmd = buildMermaidSvgs();
buildPdf();
console.log(`完了: ${output}`);
