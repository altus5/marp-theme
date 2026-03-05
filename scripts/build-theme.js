#!/usr/bin/env node
"use strict";

const { execSync } = require("child_process");
const { existsSync, readFileSync, writeFileSync, unlinkSync } = require("fs");
const path = require("path");

// --- 設定 ---
const PROJECT_ROOT = path.join(__dirname, "..");
const DEFAULT_THEME = "rooster-blue";

// node_modules/.bin を PATH に追加（ローカル実行用）
const binDir = path.join(PROJECT_ROOT, "node_modules", ".bin");
process.env.PATH = `${binDir}${path.delimiter}${process.env.PATH}`;

/**
 * Tailwind CSS テーマビルド
 *
 * examples/ 内の .md を基準にユーティリティを生成する。
 * テーマ CSS は常に同一の内容になる（入力 md に依存しない）。
 *
 * @param {object} options
 * @param {string} [options.themeName] - テーマ名（デフォルト: rooster-blue）
 * @returns {string} ビルド済みテーマ CSS ファイルパス
 */
function buildTheme({ themeName = DEFAULT_THEME } = {}) {
  const tailwindSrc = path.join(PROJECT_ROOT, `themes/${themeName}.tailwind.css`);
  const themeFile = path.join(PROJECT_ROOT, `themes/${themeName}.css`);

  if (!existsSync(tailwindSrc)) return themeFile;

  // npm 依存としてインストールされた場合はビルド済み CSS をそのまま使う
  const isInstalledAsDependency = PROJECT_ROOT.split(path.sep).includes("node_modules");
  if (isInstalledAsDependency && existsSync(themeFile)) {
    return themeFile;
  }

  const combinedFile = themeFile;
  const entryFile = path.join(PROJECT_ROOT, `themes/${themeName}.entry.css`);

  const tailwindSrcRel = path.relative(path.dirname(entryFile), tailwindSrc);
  const entry = `@import "./${tailwindSrcRel}";\n`;
  writeFileSync(entryFile, entry);

  console.log(`[tailwind] テーマ CSS ビルド中...`);
  execSync(
    `npx @tailwindcss/cli -i "${entryFile}" -o "${combinedFile}"`,
    { stdio: "inherit" }
  );
  unlinkSync(entryFile);

  // Marp テーマヘッダーを先頭に付加（@import "default" は Marp 固有で Tailwind では処理できない）
  const marpHeader = `/* @theme ${themeName} */\n@import "default";\n`;
  const built = readFileSync(combinedFile, "utf8");
  writeFileSync(combinedFile, marpHeader + built);

  return combinedFile;
}

// --- CLI として実行された場合 ---
if (require.main === module) {
  const themeName = process.env.MARP_THEME;
  if (!themeName) {
    console.error("エラー: MARP_THEME 環境変数を指定してください");
    console.error("例: MARP_THEME=rooster-blue node scripts/build-theme.js");
    process.exit(1);
  }
  const result = buildTheme({ themeName });
  console.log(`完了: ${result}`);
}

module.exports = { buildTheme };
