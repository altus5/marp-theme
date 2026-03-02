# ビルドスクリプト詳細

## セットアップ

```bash
git clone https://github.com/altus5/marp-theme.git
cd marp-theme
npm install
```

## 前提条件（ローカル実行の場合）

上記セットアップに加え、以下が必要です。

- **Node.js** >= 20
- **Chromium** — marp-cli（PDF 変換）と mermaid-cli（SVG 生成）が内部で Puppeteer 経由で使用
- **日本語フォント** — Noto Sans CJK 等（PDF に日本語を含む場合）

> **Note:** Docker を使う場合は Chromium・フォントのインストールは不要です（Docker イメージに含まれています）。

## 使い方

```bash
# 基本
node /path/to/marp-theme/scripts/cli.js pdf slides.md

# 出力ファイル名を指定
node /path/to/marp-theme/scripts/cli.js pdf slides.md output.pdf

# テーマを切り替え
MARP_THEME=rooster-a4-blue node /path/to/marp-theme/scripts/cli.js pdf slides.md
```

## 環境変数

| 変数         | デフォルト     | 説明                                           |
| ------------ | -------------- | ---------------------------------------------- |
| `MARP_THEME` | （なし）       | 使用するテーマ名（`themes/{name}.css` に対応）。未設定時はフロントマターの `theme` から解決 |

## mermaid 事前変換

Marp の Markdown 内に mermaid コードブロックを直接書いても、期待通りに描画されません。

- **Marp は mermaid を標準サポートしていない** — Marpit エンジンは mermaid コードブロックをそのままテキストとして出力する
- **HTML モードで `<script>` を埋め込む方法もあるが不安定** — スライドごとの分離されたレンダリング環境では、図のサイズ計算やフォント読み込みのタイミングが合わず、レイアウト崩れや空白になることがある
- **PDF 変換時に描画されない** — mermaid はブラウザの JavaScript で動的に描画するため、marp-cli の PDF 変換では図が生成される前にキャプチャされてしまうことがある

そのため、**mermaid は事前に SVG に変換し、画像として埋め込む**のが確実です。本ビルドスクリプトはこの変換を自動化します。

ビルドスクリプトは 2 つの方法に対応しています。

1. **インライン mermaid** — Markdown 内に直接 ` ```mermaid ` コードブロックを書くと、ビルド時に自動で SVG に変換されます。元の Markdown は変更されず、一時ファイル経由で処理されます。
2. **外部 `.mmd` ファイル** — 命名規則に従って `.mmd` を配置し、Markdown 内で SVG を画像として参照します（`![mermaid diagram](slides_flowchart.svg)`）。

両方を同じ Markdown 内で併用できます。サンプルは `examples/rooster-blue-mermaid.md` を参照してください。

### mermaid ファイルの命名規則（外部 .mmd）

ビルドスクリプトは **Markdown ファイル名をプレフィックスとして** mermaid ファイルを自動検出します。

```
{mdのベース名}_{図の名前}.mmd
```

Markdown ファイルが `slides.md` の場合:

| ファイル名                       | 生成される SVG                   |
| -------------------------------- | -------------------------------- |
| `slides_system_architecture.mmd` | `slides_system_architecture.svg` |
| `slides_sequence.mmd`            | `slides_sequence.svg`            |

### mermaid 設定の解決順

ビルドスクリプトは以下の優先順で mermaid 設定ファイルを探します。

| 優先度 | ファイル                                | 説明                   |
| ------ | --------------------------------------- | ---------------------- |
| 1      | `mermaid.config.json`（プロジェクト側） | プロジェクト固有の設定 |
| 2      | `themes/{themeName}.mermaid.json`       | テーマ別の配色・設定   |
| 3      | `mermaid.config.json`（ルート）         | 共通デフォルト         |

テーマ別設定（例: `themes/rooster-blue.mermaid.json`）では、`themeVariables` でテーマの CSS カラーに合わせた mermaid 図の配色を定義できます。

## ファイル構成

| ファイル                               | 説明                                                                  |
| -------------------------------------- | --------------------------------------------------------------------- |
| `scripts/cli.js`                       | メイン CLI（`marp-build pdf\|pptx`）— テーマビルド → mermaid SVG 生成 → PDF/PPTX 生成 |
| `scripts/build-theme.js`               | テーマ CSS ビルドスクリプト（Tailwind CSS → Marp テーマ CSS）         |
| `scripts/update-headers.mjs`           | パンくずヘッダー自動更新スクリプト（見出し階層から `_header` を生成） |
| `scripts/update-toc.mjs`               | 目次（TOC）自動更新スクリプト（h1・h2 から目次スライドを生成）        |
| `themes/{name}.tailwind.css`           | テーマ CSS ソース（Tailwind v4 形式、`@apply` 使用）                  |
| `themes/{name}.css`                    | ビルド済みテーマ CSS（**生成ファイル — 直接編集しない**）             |
| `themes/{name}.mermaid.json`           | テーマ別 mermaid 配色設定                                             |
| `mermaid.config.json`                  | mermaid デフォルト設定                                                |
| `examples/rooster-blue.md`             | rooster-blue テーマのサンプルスライド                                 |
| `examples/rooster-blue-mermaid.md`     | mermaid 図（外部 .mmd + インライン）のサンプル                       |
| `examples/rooster-a4-mono.md`          | rooster-a4-mono テーマのサンプル仕様書                                |
| `examples/rooster-a4-blue.md`          | rooster-a4-blue テーマのサンプル仕様書                                |

## テーマ CSS のビルド

`rooster-blue.css` は `.tailwind.css` から生成されるファイルです。テーマの CSS を変更した場合や、`examples/rooster-blue.md` に新しい Tailwind ユーティリティクラスを追加した場合に再ビルドが必要です。

```bash
# テーマ CSS のみビルド（MARP_THEME 必須）
MARP_THEME=rooster-blue node scripts/build-theme.js
MARP_THEME=rooster-a4-blue node scripts/build-theme.js
```

`cli.js` は内部で `build-theme.js` を呼ぶため、PDF 生成時にテーマも自動でリビルドされます。

## パンくずヘッダーの自動更新

A4 テーマでは、各スライドの `<!-- _header: "..." -->` にパンくず（h1 > h2 > h3）を設定します。見出し構成を変更した場合、以下のコマンドで全スライドのヘッダーを一括更新できます。

```bash
node scripts/update-headers.mjs examples/rooster-a4-blue.md
node scripts/update-headers.mjs examples/rooster-a4-mono.md
```

- h1 と h2 は `<a>` リンクとして生成
- h2 を持たないスライドに h3 がある場合は `<span>` で表示（番号プレフィックスは自動除去）
- `_class: title` / `_class: chapter` のスライドはスキップ

## 目次（TOC）の自動更新

A4 テーマでは、`# 目次` スライドに `<div class="toc">` で目次を配置します。見出し構成を変更した場合、以下のコマンドで目次を一括更新できます。

```bash
node scripts/update-toc.mjs examples/rooster-a4-blue.md
node scripts/update-toc.mjs examples/rooster-a4-mono.md
```

- TOC スライドより後の h1・h2 を収集し、unordered list として生成
- `_class: title` / `_class: toc-page` のスライドはスキップ
- 既存 `<div class="toc">` があれば中身を置換、なければ `# 目次` の後に挿入
- `<!-- _header: "..." -->` が存在するスライドのみ更新（新規挿入はしない）

## Docker Compose で使う

`npm install` は不要です。Chromium や日本語フォントも Docker イメージに含まれています。

### セットアップ

```bash
git clone https://github.com/altus5/marp-theme.git
cd marp-theme
docker compose -f docker/docker-compose.yml build
```

### PDF 生成

```bash
# プロジェクトディレクトリを指定して実行
PROJECT_DIR=/path/to/project docker compose -f docker/docker-compose.yml run --rm marp pdf slides.md

# 出力ファイル名を指定
PROJECT_DIR=/path/to/project docker compose -f docker/docker-compose.yml run --rm marp pdf slides.md output.pdf

# テーマを切り替え
PROJECT_DIR=/path/to/project docker compose -f docker/docker-compose.yml run --rm -e MARP_THEME=rooster-a4-blue marp pdf slides.md
```

`PROJECT_DIR` でプロジェクトディレクトリをマウントし、サブコマンド（`pdf` / `pptx`）と Markdown ファイルを指定します。

### mermaid 設定の上書き

プロジェクト側に `mermaid.config.json` を配置すると、テーマ別・共通デフォルトより優先されます（解決順は「mermaid 設定の解決順」を参照）。
