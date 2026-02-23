# marp-theme

Marp 用カスタムテーマ集。

## テーマ一覧

| テーマ名          | ソース                                | 出力                         | 特徴                                   |
| ----------------- | ------------------------------------- | ---------------------------- | -------------------------------------- |
| `rooster-blue`    | `themes/rooster-blue.tailwind.css`    | `themes/rooster-blue.css`    | プレゼン用のスチールブルー基調のテーマ |
| `rooster-a4-mono` | `themes/rooster-a4-mono.tailwind.css` | `themes/rooster-a4-mono.css` | A4 仕様書用のモノクロ基調のテーマ      |
| `rooster-a4-blue` | `themes/rooster-a4-blue.tailwind.css` | `themes/rooster-a4-blue.css` | A4 仕様書用の青基調のテーマ            |

テーマ CSS は Tailwind CSS v4 で記述されています。`.tailwind.css` がソースで、`build-theme.js` により `.css`（Marp が読み込む最終ファイル）にビルドされます。`@apply` でユーティリティを使用しつつ、Markdown 内でも Tailwind ユーティリティクラスを直接利用できます。

## テーマだけを使う（CSS のみ）

GitHub URL を指定するだけで利用できます。クローン不要です。

### 1. Markdown のフロントマターでテーマを指定

```yaml
---
marp: true
theme: rooster-blue
paginate: true
header: "ヘッダーテキスト"
footer: "フッターテキスト"
---
```

### 2. PDF に変換

```bash
npx @marp-team/marp-cli --html --pdf \
  --theme https://raw.githubusercontent.com/altus5/marp-theme/main/themes/rooster-blue.css \
  slides.md
```

### VS Code でプレビューする

[Marp for VS Code](https://marketplace.visualstudio.com/items?itemName=marp-team.marp-vscode) 拡張をインストールし、テーマ CSS を登録します。

#### GitHub URL を使う場合

`.vscode/settings.json` または `.code-workspace` の `settings` に追加します。

```json
{
  "markdown.marp.html": "all",
  "markdown.marp.themes": [
    "https://raw.githubusercontent.com/altus5/marp-theme/main/themes/rooster-blue.css",
    "https://raw.githubusercontent.com/altus5/marp-theme/main/themes/rooster-a4-mono.css",
    "https://raw.githubusercontent.com/altus5/marp-theme/main/themes/rooster-a4-blue.css"
  ]
}
```

#### ローカルにコピーして使う場合

テーマ CSS をプロジェクト内に配置し、相対パスで指定します。

```json
{
  "markdown.marp.html": "all",
  "markdown.marp.themes": [
    "./themes/rooster-blue.css",
    "./themes/rooster-a4-mono.css",
    "./themes/rooster-a4-blue.css"
  ]
}
```

> **注意: マルチルートワークスペースでの制約**
>
> `markdown.marp.themes` はフォルダごとの `.vscode/settings.json` は無視されます。`.code-workspace` ファイルの `settings` に記述してください。
>
> また、ローカルパスは**ドキュメントが属するワークスペースフォルダのルート**から解決され、フォルダ外へのパス（`../`）はセキュリティ上拒否されます。テーマ CSS が別フォルダにある場合は、シンボリックリンクを作成してください。
>
> ```bash
> # 例: my-project から marp-theme の CSS を参照
> ln -s ../marp-theme/themes/rooster-blue.css my-project/themes/rooster-blue.css
> ```

#### プレビュー方法

1. [Marp for VS Code](https://marketplace.visualstudio.com/items?itemName=marp-team.marp-vscode) 拡張をインストール
2. フロントマターに `marp: true` と `theme: rooster-blue` を記述
3. `Ctrl+Shift+V`（Mac: `Cmd+Shift+V`）でプレビュー表示
4. `Ctrl+K V`（Mac: `Cmd+K V`）でサイドバイサイドプレビュー

> **Tips:** プレビューがスライド表示にならない場合は、`Ctrl+Shift+P` → `Toggle Marp` を 2 回実行（OFF → ON）すると表示されることがあります。

### rooster-blue のカスタムコンポーネント

テーマには Markdown の `<div class="...">` で使えるレイアウトコンポーネントが含まれています。サンプルは `examples/rooster-blue.md` を参照してください。

| クラス                     | 説明                                                                 |
| -------------------------- | -------------------------------------------------------------------- |
| `.cols`                    | 段組みレイアウト（`.between` `.around` `.ratio` で配置制御）         |
| `.cols.wrap`               | 折り返し段組み                                                       |
| `.box`                     | ボーダー付きボックス（`--box-gap` で間隔調整）                       |
| `.card`                    | ヘッダー付きカード（h3 がアクセントカラーのヘッダーになる）          |
| `.summary` / `.summary-lg` | サマリー表示（h3 にアンダーライン）                                  |
| `.step`                    | 横方向ステップ（番号付き丸アイコン、`.hl` で最終ステップをオレンジ） |
| `.timeline`                | 縦方向タイムライン（`.hl` で最終ポイントをオレンジ）                 |
| `.atob`                    | As-Is / To-Be 比較（中央に矢印）                                     |
| `.synergy`                 | シナジー表示（左セルにシェブロン矢印）                               |
| `.lead`                    | リード文ブロック（左にアイコン、右にテキスト、ピル型）               |
| `.point`                   | ポイント強調（左に丸バッジ、右にテキスト、ピル型）                   |
| `.panel`                   | パネル（オレンジヘッダー付きボックス、`.cols.arrow` で矢印接続）     |

Tailwind CSS のユーティリティクラスも Markdown 内で直接使用できます（`grid`、`flex`、`bg-*`、`text-*`、`p-*`、`rounded-*` 等）。

### rooster-a4-mono テーマについて

A4 縦（210mm x 297mm）の仕様書・設計書向けテーマです。サンプルは `examples/rooster-a4-mono.md` を参照してください。

- タイトルページ、改版履歴、目次、本文の構成
- ヘッダーは `<span>` で左右分割（`display: flex; justify-content: space-between`）
- `_paginate: skip` で前付けページをページ番号カウントから除外可能
- テーブルはページ幅全体に広がるスタイル

```bash
# PDF 生成
MARP_THEME=rooster-a4-mono node scripts/build-pdf.js examples/rooster-a4-mono.md
```

### rooster-a4-blue テーマについて

rooster-a4-mono をベースに、ブルー基調の A4 テーマです。サンプルは `examples/rooster-a4-blue.md` を参照してください。

- rooster-a4-mono と同じ A4 仕様書フォーマット（タイトル、改版履歴、目次、本文）
- 見出しにブルー系カラー、テーブルヘッダーはブルー背景 + 白文字、縦罫線なしの水平罫線スタイル
- タイトルページはブルー背景 + 下部に黒バー（会社名表示）
- 注記・コラム・アラート・バナー等のコンポーネントを搭載

```bash
# PDF 生成
MARP_THEME=rooster-a4-blue node scripts/build-pdf.js examples/rooster-a4-blue.md
```

---

## ビルドスクリプトを使う（mermaid 図 + PDF 一括生成）

ローカル実行と Docker 実行の 2 つの方法があります。Docker を使う場合は「Docker Compose で使う」セクションへ進んでください。

### セットアップ

```bash
git clone https://github.com/altus5/marp-theme.git
cd marp-theme
npm install
```

### 前提条件（ローカル実行の場合）

上記セットアップに加え、以下が必要です。

- **Node.js** >= 20
- **Chromium** — marp-cli（PDF 変換）と mermaid-cli（SVG 生成）が内部で Puppeteer 経由で使用
- **日本語フォント** — Noto Sans CJK 等（PDF に日本語を含む場合）

> **Note:** Docker を使う場合は Chromium・フォントのインストールは不要です（Docker イメージに含まれています）。

### mermaid 事前変換

Marp の Markdown 内に mermaid コードブロックを直接書いても、期待通りに描画されません。

- **Marp は mermaid を標準サポートしていない** — Marpit エンジンは mermaid コードブロックをそのままテキストとして出力する
- **HTML モードで `<script>` を埋め込む方法もあるが不安定** — スライドごとの分離されたレンダリング環境では、図のサイズ計算やフォント読み込みのタイミングが合わず、レイアウト崩れや空白になることがある
- **PDF 変換時に描画されない** — mermaid はブラウザの JavaScript で動的に描画するため、marp-cli の PDF 変換では図が生成される前にキャプチャされてしまうことがある

そのため、**mermaid は事前に SVG に変換し、画像として埋め込む**のが確実です。本ビルドスクリプトはこの変換を自動化します。

```markdown
<!-- Marp スライド内では画像として参照 -->

![bg right contain](slides_system_architecture.svg)
```

### ファイル構成

| ファイル                      | 説明                                                                  |
| ----------------------------- | --------------------------------------------------------------------- |
| `scripts/build-pdf.js`        | PDF ビルドスクリプト（テーマビルド → mermaid SVG 生成 → PDF 生成）    |
| `scripts/build-theme.js`      | テーマ CSS ビルドスクリプト（Tailwind CSS → Marp テーマ CSS）         |
| `scripts/update-headers.mjs`  | パンくずヘッダー自動更新スクリプト（見出し階層から `_header` を生成） |
| `themes/{name}.tailwind.css`  | テーマ CSS ソース（Tailwind v4 形式、`@apply` 使用）                  |
| `themes/{name}.css`           | ビルド済みテーマ CSS（**生成ファイル — 直接編集しない**）             |
| `themes/{name}.mermaid.json`  | テーマ別 mermaid 配色設定                                             |
| `mermaid.config.json`         | mermaid デフォルト設定（`diagramPadding: 200` で余白付き SVG を生成） |
| `examples/rooster-blue.md`    | rooster-blue テーマのサンプルスライド                                 |
| `examples/rooster-a4-mono.md` | rooster-a4-mono テーマのサンプル仕様書                                |
| `examples/rooster-a4-blue.md` | rooster-a4-blue テーマのサンプル仕様書                                |

### テーマ CSS のビルド

`rooster-blue.css` は `.tailwind.css` から生成されるファイルです。テーマの CSS を変更した場合や、`examples/rooster-blue.md` に新しい Tailwind ユーティリティクラスを追加した場合に再ビルドが必要です。

```bash
# テーマ CSS のみビルド
node scripts/build-theme.js

# テーマを指定
MARP_THEME=altus5-dark node scripts/build-theme.js
```

`build-pdf.js` は内部で `build-theme.js` を呼ぶため、PDF 生成時にテーマも自動でリビルドされます。

### パンくずヘッダーの自動更新

A4 テーマでは、各スライドの `<!-- _header: "..." -->` にパンくず（h1 > h2 > h3）を設定します。見出し構成を変更した場合、以下のコマンドで全スライドのヘッダーを一括更新できます。

```bash
node scripts/update-headers.mjs examples/rooster-a4-blue.md
node scripts/update-headers.mjs examples/rooster-a4-mono.md
```

- h1 と h2 は `<a>` リンクとして生成
- h2 を持たないスライドに h3 がある場合は `<span>` で表示（番号プレフィックスは自動除去）
- `_class: title` / `_class: chapter` のスライドはスキップ
- `<!-- _header: "..." -->` が存在するスライドのみ更新（新規挿入はしない）

> **Tailwind ユーティリティの追加方法:** Markdown 内で新しい Tailwind クラス（例: `bg-green-100`）を使う場合は、`examples/rooster-blue.md` にもそのクラスを記載してください。テーマ CSS は `examples/` を基準にビルドされるため、ここに記載のないクラスは CSS に含まれません。

### 使い方

```bash
# 基本
WORK_DIR=/path/to/project node /path/to/marp-theme/scripts/build-pdf.js slides.md

# 出力ファイル名を指定
WORK_DIR=/path/to/project node /path/to/marp-theme/scripts/build-pdf.js slides.md output.pdf

# テーマを切り替え
MARP_THEME=altus5-dark WORK_DIR=/path/to/project node /path/to/marp-theme/scripts/build-pdf.js slides.md
```

### 環境変数

| 変数         | デフォルト     | 説明                                           |
| ------------ | -------------- | ---------------------------------------------- |
| `WORK_DIR`   | `.`            | プロジェクトディレクトリのパス                 |
| `MARP_THEME` | `rooster-blue` | 使用するテーマ名（`themes/{name}.css` に対応） |

### mermaid ファイルの命名規則

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

---

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
PROJECT_DIR=/path/to/project docker compose -f docker/docker-compose.yml run --rm marp slides.md

# 出力ファイル名を指定
PROJECT_DIR=/path/to/project docker compose -f docker/docker-compose.yml run --rm marp slides.md output.pdf

# テーマを切り替え
PROJECT_DIR=/path/to/project docker compose -f docker/docker-compose.yml run --rm -e MARP_THEME=altus5-dark marp slides.md
```

`PROJECT_DIR` でプロジェクトディレクトリをマウントし、引数で Markdown ファイルを指定します。

### mermaid 設定の上書き

プロジェクト側に `mermaid.config.json` を配置すると、テーマ別・共通デフォルトより優先されます（解決順は「mermaid 設定の解決順」を参照）。
