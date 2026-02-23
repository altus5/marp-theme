/**
 * Marp Markdown の AST パーサー
 *
 * unified + remark でスライド単位に分割し、
 * 見出し階層・ディレクティブを抽出する。
 * update-headers / update-toc など複数スクリプトから共用する。
 */

import { unified } from "unified";
import remarkParse from "remark-parse";
import remarkFrontmatter from "remark-frontmatter";

/* ===========================
   ユーティリティ
   =========================== */

/**
 * Heading text から Marp 互換スラッグを生成する
 * (GitHub-flavored slug: lowercase, 記号除去, スペース→ハイフン)
 */
export function slugify(text) {
  return text
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s-]/gu, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

/**
 * mdast ノードから平文テキストを再帰的に抽出する
 */
export function getTextContent(node) {
  if (node.type === "text" || node.type === "inlineCode") return node.value;
  if (node.children) return node.children.map(getTextContent).join("");
  return "";
}

/* ===========================
   ディレクティブ解析
   =========================== */

/**
 * HTML コメントから Marp ローカルディレクティブを 1 つ解析する
 *   <!-- _key: value -->
 *   <!-- _key: "value" -->
 */
function parseDirective(html) {
  const m = html.match(/<!--\s*_(\w+)\s*:\s*([\s\S]*?)\s*-->/);
  if (!m) return null;
  const key = m[1];
  let value = m[2].trim();
  if (/^"[\s\S]*"$/.test(value)) value = value.slice(1, -1);
  else if (/^'[\s\S]*'$/.test(value)) value = value.slice(1, -1);
  return { key, value };
}

/* ===========================
   メイン: parseSlides
   =========================== */

/**
 * @typedef {object} SlideHeading
 * @property {number} depth    - 見出し深さ (1–6)
 * @property {string} text     - 見出しテキスト
 * @property {string} slug     - スラッグ (#id)
 * @property {object} position - ソース位置情報
 */

/**
 * @typedef {object} Slide
 * @property {object[]}      nodes      - スライドに含まれる mdast ノード
 * @property {SlideHeading[]} headings  - 見出し一覧
 * @property {object}        directives - Marp ローカルディレクティブ { key: value }
 * @property {object|null}   headerNode - _header を含む html ノード (位置情報付き)
 */

/**
 * Markdown テキストをスライド単位に分割して解析する
 *
 * @param {string} markdown - 生の Markdown テキスト
 * @returns {{ slides: Slide[], tree: object }}
 */
export function parseSlides(markdown) {
  const tree = unified()
    .use(remarkParse)
    .use(remarkFrontmatter, ["yaml"])
    .parse(markdown);

  const slides = [];
  let buf = [];

  function flush() {
    if (buf.length === 0) return;

    const slide = {
      nodes: buf,
      headings: [],
      directives: {},
      headerNode: null,
    };

    for (const node of buf) {
      if (node.type === "heading") {
        slide.headings.push({
          depth: node.depth,
          text: getTextContent(node),
          slug: slugify(getTextContent(node)),
          position: node.position,
        });
      }
      if (node.type === "html") {
        const d = parseDirective(node.value);
        if (d) {
          slide.directives[d.key] = d.value;
          if (d.key === "header") slide.headerNode = node;
        }
      }
    }

    slides.push(slide);
    buf = [];
  }

  for (const node of tree.children) {
    if (node.type === "yaml") continue;
    if (node.type === "thematicBreak") {
      flush();
      continue;
    }
    buf.push(node);
  }
  flush();

  return { slides, tree };
}
