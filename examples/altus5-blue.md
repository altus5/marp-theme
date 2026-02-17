---
marp: true
theme: altus5-blue
paginate: true
header: "altus5-blue テーマ サンプル"
footer: "© 2026 Your Company"
---

<!-- _class: title -->
<!-- _paginate: false -->
<!-- _header: "" -->
<!-- _footer: "" -->

# プレゼンテーションタイトル

### 〜サブタイトルをここに記載〜

**会社名 / 発表者名**

---

## 見出しとテキスト

### h3 見出し

通常のテキストはこのように表示されます。**強調テキスト**はアクセントカラーになります。

- リストアイテム 1
- リストアイテム 2
- リストアイテム 3

[リンクテキスト](https://example.com) はダークブルーで表示されます。

---

## テーブル

| 項目   | 説明                                 | 備考     |
| ------ | ------------------------------------ | -------- |
| 項目 A | テーブルのヘッダーはアクセントカラー | 補足情報 |
| 項目 B | 偶数行はストライプ背景               | 補足情報 |
| 項目 C | 罫線は控えめなグレー                 | 補足情報 |
| 項目 D | フォントサイズは 18px                | 補足情報 |

---

## 引用ボックス

> 引用ボックスはオレンジの左ボーダーと暖色系のグラデーション背景で表示されます。
> 重要なメッセージやポイントの強調に使えます。

### 複数の h3 セクション

このテーマでは h2 が左ボーダー付きのセクション見出し、h3 がサブセクション見出しとして機能します。

---

## カード

<div class="card">

### プロフィール

h3 ヘッダーの下にコンテンツが続きます。カード形式で情報を整理できます。

### 資料作成の基本

ロジカルなストーリー構成、正確・簡潔・わかりやすい文章、見やすいレイアウト・デザイン。

### ポイント

投影して読めるようにするには、24ポイント以上が望ましいですが、手元で読む想定なら18ポイント以下でも構いません。

</div>

---

## サマリー

<div class="summary">

### 項目 A

h3 の下に青いアンダーラインが入り、セクションを区切ります。

### 項目 B

通常サイズのサマリーです。

### 項目 C

箇条書きも使えます。

</div>

---

## サマリー（大）

<div class="summary-lg">

### 項目 A

`summary-lg` はフォントが大きくなります（本文 22px / h3 24px）。

### 項目 B

エグゼクティブサマリーなど、重要なページに適しています。

</div>

---

## 段組みレイアウト

### 2段組み（between）

<div class="cols between">
<div>

**左カラム**
両端揃えで配置されます。カラム間にスペースが入ります。

</div>
<div>

**右カラム**
コンテンツは左右の端に寄ります。

</div>
</div>

---

## 段組みレイアウト

### 比率指定（3:2）

<div class="cols ratio">
<div style="--fw: 3;">

**広いカラム（3）**
比率を指定して幅を制御できます。`--fw` 変数で比率を指定します。

</div>
<div style="--fw: 2;">

**狭いカラム（2）**
こちらは 2/5 の幅になります。

</div>
</div>

---

## 段組みレイアウト

### 3段組み

<div class="cols ratio">
<div>

**カラム 1**
均等 3 分割

</div>
<div>

**カラム 2**
均等 3 分割

</div>
<div>

**カラム 3**
均等 3 分割

</div>
</div>

---

## ボックス

<div class="box">

**単体のボックス**
`border` + 薄い `box-shadow` で囲みます。

</div>

### 縦並び（box-gap で余白調整）

<div style="--box-gap: 20px;">
<div class="box">

### ボックス 1

上下に並べたとき、`--box-gap` で間隔を調整できます。

</div>
<div class="box">

### ボックス 2

デフォルトは `8px`。親要素に `style="--box-gap: 20px;"` で変更。

</div>
</div>

---

## ボックス × 段組み

<div class="cols">
<div class="box">

**左ボックス**
`.cols` 内の `.box` は同じ高さに揃います。

</div>
<div class="box">

**右ボックス**
テキスト量が異なっても、行内で高さが一致します。こちらのほうが長いテキストです。

</div>
</div>

---

## ステップ表示

<div class="step hl">
<div>

### 要件定義

ヒアリングを実施し、業務課題と要件を整理

</div>
<div>

### 設計

システム構成・画面・DB 設計を策定

</div>
<div>

### 実装・テスト

開発と単体・結合テストを実施

</div>
<div>

### リリース

本番デプロイと運用引き渡し

</div>
</div>

---

## タイムライン

<div class="timeline hl">
<div>

### 2024年4月

プロジェクト発足、要件定義開始

</div>
<div>

### 2024年7月

基本設計・詳細設計完了

</div>
<div>

### 2024年10月

開発・単体テスト完了

</div>
<div>

### 2025年1月

本番リリース・運用開始

</div>
</div>

---

## リード

<div class="lead">
<div>💡</div>
<div>

業務プロセスの自動化により
月間 40 時間の工数削減と品質向上を実現

</div>
</div>

---

## ポイント

<div class="point">
<div>

重要
課題

</div>
<div>

業務プロセスの自動化による工数削減と品質向上の実現

</div>
</div>

---

## As-Is / To-Be

<div class="atob">
<div>

### As-Is（現状）

- 手作業による Excel 集計で月 40 時間
- 転記ミス・集計漏れが頻発
- 属人化により担当者不在時に業務停止

</div>
<div>

### To-Be（あるべき姿）

- システム自動集計で月 4 時間に短縮
- データ連携による転記ミスゼロ
- 標準化されたプロセスで誰でも対応可能

</div>
</div>

---

## シナジー

<div class="synergy">
<div>実現できること</div>
<div>弊社にもたらされる効果予測</div>
<div>自動集計による工数削減</div>
<div>月間 40 時間の工数を 4 時間に短縮</div>
<div>データ品質の向上</div>
<div>転記ミス・集計漏れゼロ</div>
<div>業務の標準化</div>
<div>担当者に依存しない運用体制</div>
</div>

---

## Tailwind CSS ユーティリティ

### Grid レイアウト

<div class="grid grid-cols-2 gap-4">
<div class="bg-white p-4 rounded-lg border-l-4 border-accent shadow-subtle">

**項目 A**
`grid grid-cols-2 gap-4` で 2 列グリッド。左ボーダーにアクセントカラー。

</div>
<div class="bg-white p-4 rounded-lg border-l-4 border-highlight shadow-subtle">

**項目 B**
Tailwind ユーティリティだけで、色違いのカードを表現。

</div>
</div>

---

## Tailwind CSS ユーティリティ

### Flex レイアウト

<div class="flex items-center justify-between bg-gray-50 p-4 rounded-lg">
<div>

**左寄せコンテンツ**
`flex items-center justify-between`

</div>
<div class="text-right">

**右寄せコンテンツ**
`text-right`

</div>
</div>

### シャドウ付きボックス

<div class="shadow-lg p-6 rounded-lg border border-gray-200 bg-white">

`shadow-lg p-6 rounded-lg` で影付きカード。Tailwind のユーティリティだけで表現。

</div>

---

## Tailwind CSS ユーティリティ

### 配色バリエーション

<div class="grid grid-cols-3 gap-3">
<div class="bg-blue-100 text-blue-800 p-3 rounded text-center font-bold">

Blue

</div>
<div class="bg-green-100 text-green-800 p-3 rounded text-center font-bold">

Green

</div>
<div class="bg-orange-100 text-orange-800 p-3 rounded text-center font-bold">

Orange

</div>
</div>

### テキストスタイル

- <span class="text-lg font-bold text-blue-600">大きく太字のブルー</span>
- <span class="text-sm text-gray-500">小さくグレー</span>
- <span class="underline decoration-2 decoration-blue-400">アンダーライン付き</span>

---

## Tailwind コンポーネント

### バッジ / タグ

<span class="inline-block bg-blue-100 text-blue-800 text-sm font-bold px-3 py-1 rounded-full">新機能</span> <span class="inline-block bg-green-100 text-green-800 text-sm font-bold px-3 py-1 rounded-full">完了</span> <span class="inline-block bg-orange-100 text-orange-800 text-sm font-bold px-3 py-1 rounded-full">検討中</span> <span class="inline-block bg-red-100 text-red-800 text-sm font-bold px-3 py-1 rounded-full">緊急</span>

### KPI カード

<div class="grid grid-cols-3 gap-4 text-center">
<div class="bg-white p-4 rounded-lg shadow-subtle border-t-4 border-accent">

<div class="text-4xl font-black text-accent">98%</div>
<div class="text-sm text-muted">稼働率</div>

</div>
<div class="bg-white p-4 rounded-lg shadow-subtle border-t-4 border-green-500">

<div class="text-4xl font-black text-green-600">3.2x</div>
<div class="text-sm text-muted">パフォーマンス向上</div>

</div>
<div class="bg-white p-4 rounded-lg shadow-subtle border-t-4 border-highlight">

<div class="text-4xl font-black text-highlight">42%</div>
<div class="text-sm text-muted">コスト削減</div>

</div>
</div>

---

## Tailwind コンポーネント

### アラート / コールアウト

<div class="bg-blue-50 border-l-4 border-blue-500 p-3 rounded-r-lg mb-3">

💡 **情報:** Tailwind ユーティリティで色分けしたコールアウトを作れます。

</div>

<div class="bg-green-50 border-l-4 border-green-500 p-3 rounded-r-lg mb-3">

✅ **成功:** デプロイが正常に完了しました。

</div>

<div class="bg-orange-50 border-l-4 border-orange-500 p-3 rounded-r-lg mb-3">

⚠️ **注意:** この操作は取り消せません。

</div>

<div class="bg-red-50 border-l-4 border-red-500 p-3 rounded-r-lg">

🚫 **エラー:** 接続がタイムアウトしました。

</div>

---

## Tailwind コンポーネント

### グラデーションカード

<div class="bg-gradient-to-r from-blue-500 to-purple-500 text-white p-6 rounded-lg shadow-lg">

**次のステップ:** プロジェクト計画を策定し、チームメンバーにタスクを割り当てます。

</div>

---

<!-- _class: title -->
<!-- _paginate: false -->
<!-- _header: "" -->
<!-- _footer: "" -->

# Thank You

### ご清聴ありがとうございました
