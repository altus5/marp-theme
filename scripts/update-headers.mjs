#!/usr/bin/env node
/**
 * パンくずヘッダー自動更新スクリプト
 *
 * Markdown 内の見出し階層 (h1 > h2 > h3) から
 * 各スライドの <!-- _header: "..." --> を自動生成・上書きする。
 *
 * Usage:
 *   node scripts/update-headers.mjs examples/rooster-a4-blue.md
 */

import { readFileSync, writeFileSync } from "fs";
import { parseSlides } from "./lib/parse-slides.mjs";

/* ===========================
   パンくず HTML 生成
   =========================== */

/** h3 テキストから番号プレフィックス (例: "3.1.2. ") を除去する */
function stripNumberPrefix(text) {
  return text.replace(/^[\d.]+\s*/, "");
}

function breadcrumbHtml(h1, h2, h3Text) {
  if (!h1) return "";
  let html = `<a href='#${h1.slug}'>${h1.text}</a>`;
  if (h2) html += `<a href='#${h2.slug}'>${h2.text}</a>`;
  if (h3Text) html += `<span>${h3Text}</span>`;
  return html;
}

/* ===========================
   メイン処理
   =========================== */

function updateHeaders(filePath) {
  const src = readFileSync(filePath, "utf8");
  const { slides } = parseSlides(src);

  let currentH1 = null;
  let currentH2 = null;
  const edits = [];

  for (const slide of slides) {
    const slideH1 = slide.headings.find((h) => h.depth === 1) || null;
    const slideFirstH2 = slide.headings.find((h) => h.depth === 2) || null;
    const slideLastH2 =
      [...slide.headings].reverse().find((h) => h.depth === 2) || null;
    const slideFirstH3 = slide.headings.find((h) => h.depth === 3) || null;

    // --- 見出し階層を更新 ---
    if (slideH1) {
      currentH1 = slideH1;
      currentH2 = null; // 新章に入ったら h2 をリセット
    }
    // パンくず用 h2: このスライドの最初の h2、なければ前スライドから継承
    const breadcrumbH2 = slideFirstH2 || currentH2;
    // パンくず用 h3: h2 を継承したスライドで h3 がある場合のみ表示
    const breadcrumbH3 =
      !slideFirstH2 && slideFirstH3
        ? stripNumberPrefix(slideFirstH3.text)
        : null;
    // 次スライド用に最後の h2 を保持
    if (slideLastH2) currentH2 = slideLastH2;

    // --- スキップ判定 ---
    const classes = (slide.directives.class || "").split(/\s+/);
    if (classes.includes("title") || classes.includes("chapter")) continue;

    // _header ノードがなければスキップ (挿入はしない)
    if (!slide.headerNode) continue;

    // --- パンくず生成 ---
    const html = breadcrumbHtml(currentH1, breadcrumbH2, breadcrumbH3);
    if (!html) continue;

    const newDirective = `<!-- _header: "${html}" -->`;
    const { start, end } = slide.headerNode.position;
    edits.push({ start: start.offset, end: end.offset, text: newDirective });
  }

  // 後方から置換して位置ずれを防ぐ
  edits.sort((a, b) => b.start - a.start);
  let result = src;
  for (const e of edits) {
    result = result.slice(0, e.start) + e.text + result.slice(e.end);
  }

  writeFileSync(filePath, result);
  console.log(`${filePath}: ${edits.length} 件のヘッダーを更新`);
}

/* ===========================
   CLI
   =========================== */

const args = process.argv.slice(2);
if (args.length === 0) {
  console.error("Usage: node scripts/update-headers.mjs <input.md> [...]");
  process.exit(1);
}
for (const f of args) updateHeaders(f);
