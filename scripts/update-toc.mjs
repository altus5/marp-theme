#!/usr/bin/env node
/**
 * TOC 自動更新スクリプト
 *
 * Markdown 内の見出し階層 (h1, h2) から
 * 目次スライドの <div class="toc"> を自動生成・上書きする。
 *
 * Usage:
 *   node scripts/update-toc.mjs examples/rooster-a4-blue.md
 */

import { readFileSync, writeFileSync } from "fs";
import { parseSlides } from "./lib/parse-slides.mjs";

function updateToc(filePath) {
  const src = readFileSync(filePath, "utf8");
  const { slides } = parseSlides(src);

  // --- TOC スライドを特定 (# 目次 を持つスライド) ---
  const tocSlide = slides.find((s) =>
    s.headings.some((h) => h.depth === 1 && h.text === "目次")
  );
  if (!tocSlide) {
    console.error(`${filePath}: TOC スライドが見つかりません (# 目次 なし)`);
    process.exit(1);
  }

  // --- 見出し収集: TOC スライドより後の h1・h2 ---
  const tocIdx = slides.indexOf(tocSlide);
  const headings = [];
  for (let i = tocIdx + 1; i < slides.length; i++) {
    const slide = slides[i];
    const classes = (slide.directives.class || "").split(/\s+/);
    if (classes.includes("title") || classes.includes("toc-page")) continue;

    for (const h of slide.headings) {
      if (h.depth <= 2) {
        headings.push(h);
      }
    }
  }

  // --- TOC markdown 生成 (unordered list) ---
  const tocLines = [];
  for (const h of headings) {
    const link = `[${h.text}](#${h.slug})`;
    tocLines.push(h.depth === 1 ? `- ${link}` : `  - ${link}`);
  }
  const tocContent = tocLines.join("\n");

  // --- 置換範囲を決定 ---
  let divOpenNode = null;
  let divCloseNode = null;
  for (const node of tocSlide.nodes) {
    if (node.type !== "html") continue;
    if (!divOpenNode && node.value.includes('<div class="toc">')) {
      divOpenNode = node;
    } else if (divOpenNode && node.value.includes("</div>")) {
      divCloseNode = node;
      break;
    }
  }

  let result;
  if (divOpenNode && divCloseNode) {
    // 既存 <div class="toc">...</div> を置換
    const start = divOpenNode.position.start.offset;
    const end = divCloseNode.position.end.offset;
    const replacement = `<div class="toc">\n\n${tocContent}\n\n</div>`;
    result = src.slice(0, start) + replacement + src.slice(end);
  } else {
    // div なし: # 目次 の後からスライド末尾までを置換
    const tocHeading = tocSlide.headings.find(
      (h) => h.depth === 1 && h.text === "目次"
    );
    const headingEnd = tocHeading.position.end.offset;
    const lastNode = tocSlide.nodes[tocSlide.nodes.length - 1];
    const slideEnd = lastNode.position.end.offset;
    const replacement = `\n\n<div class="toc">\n\n${tocContent}\n\n</div>`;
    result = src.slice(0, headingEnd) + replacement + src.slice(slideEnd);
  }

  writeFileSync(filePath, result);
  console.log(`${filePath}: TOC を更新 (${headings.length} 件の見出し)`);
}

/* ===========================
   CLI
   =========================== */

const args = process.argv.slice(2);
if (args.length === 0) {
  console.error("Usage: node scripts/update-toc.mjs <input.md> [...]");
  process.exit(1);
}
for (const f of args) updateToc(f);
