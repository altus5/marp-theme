# marp-theme

Marp 用カスタムテーマ集。GitHub URL を指定するだけでプレビューできます。

## テーマ一覧

| テーマ名          | 特徴                                   | サンプル                      |
| ----------------- | -------------------------------------- | ----------------------------- |
| `rooster-blue`    | プレゼン用のスチールブルー基調のテーマ | `examples/rooster-blue.md`    |
| `rooster-a4-mono` | A4 仕様書用のモノクロ基調のテーマ      | `examples/rooster-a4-mono.md` |
| `rooster-a4-blue` | A4 仕様書用の青基調のテーマ            | `examples/rooster-a4-blue.md` |

各テーマの詳細（カスタムコンポーネント等）は [docs/themes.md](docs/themes.md) を参照してください。

## 使い方

### フロントマターでテーマを指定

```yaml
---
marp: true
theme: rooster-blue
paginate: true
header: "ヘッダーテキスト"
footer: "フッターテキスト"
---
```

### VS Code でプレビュー（GitHub URL）

[Marp for VS Code](https://marketplace.visualstudio.com/items?itemName=marp-team.marp-vscode) 拡張をインストールし、`.vscode/settings.json` にテーマ URL を追加します。クローン不要です。

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

> **Tips:** プレビューがスライド表示にならない場合は、`Ctrl+Shift+P` → `Toggle Marp` を 2 回実行（OFF → ON）すると表示されることがあります。

### VS Code でプレビュー（ローカル）

リポジトリをクローンし、ローカルパスで指定する方法です。

```bash
git clone https://github.com/altus5/marp-theme.git
```

`.vscode/settings.json` でローカルパスを指定します。

```json
{
  "markdown.marp.html": "all",
  "markdown.marp.themes": [
    "./marp-theme/themes/rooster-blue.css",
    "./marp-theme/themes/rooster-a4-mono.css",
    "./marp-theme/themes/rooster-a4-blue.css"
  ]
}
```

> **注意:** ローカルパスは**ドキュメントが属するワークスペースフォルダのルート**から解決されます。マルチルートワークスペースでは `.code-workspace` の `settings` に記述してください。テーマ CSS が別フォルダにある場合はシンボリックリンクで対応します。

### PDF に変換

```bash
# GitHub URL を直接指定（クローン不要）
npx @marp-team/marp-cli --html --pdf \
  --theme https://raw.githubusercontent.com/altus5/marp-theme/main/themes/rooster-blue.css \
  slides.md

# ローカルのテーマを使用
npx @marp-team/marp-cli --html --pdf \
  --theme ./marp-theme/themes/rooster-blue.css \
  slides.md
```

## npm パッケージとしてインストール

GitHub dependency として `npm install` し、`npx marp-build` でビルドできます。

```bash
npm install github:altus5/marp-theme
```

### テーマの登録（`.marprc.yml`）

プロジェクトのルートに `.marprc.yml` を作成し、使用するテーマ CSS を `themeSet` に登録します。VS Code の `markdown.marp.themes` と同じ役割です。

```yaml
themeSet:
  - node_modules/marp-theme/themes/rooster-blue.css
  - node_modules/marp-theme/themes/rooster-a4-blue.css
  - node_modules/marp-theme/themes/rooster-a4-mono.css
```

これにより、フロントマターの `theme: rooster-blue` が自動的に解決されます。

### CLI: PDF 生成

mermaid 図の自動 SVG 変換を含む PDF 生成を行います。

```bash
npx marp-build pdf slides.md
npx marp-build pdf slides.md output.pdf
```

### CLI: PPTX 生成

```bash
npx marp-build pptx slides.md -o output.pptx
```

## ビルドスクリプト（mermaid 図 + PDF 一括生成）

mermaid 図の自動 SVG 変換、テーマビルド、PDF 生成を一括で行うスクリプトも提供しています。Markdown 内のインライン mermaid（` ```mermaid `）と外部 `.mmd` ファイルの両方に対応しています。

詳細は [docs/build-scripts.md](docs/build-scripts.md) を参照してください。
