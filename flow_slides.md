---
marp: true
size: 16:9
paginate: true
theme: default
style: |
  :root {
    --bg: #faf8f2; --ink: #2d2a24; --muted: #6b6453;
    --accent: #5a7a4f; --accent-deep: #3f5a37; --gold: #c8a96a; --line: #e7e1d3;
  }
  section {
    background: var(--bg); color: var(--ink);
    font-family: "Hiragino Kaku Gothic ProN","Yu Gothic",Meiryo,sans-serif;
    font-size: 25px; line-height: 1.65; padding: 56px 70px;
  }
  h1, h2 { font-family: "Hiragino Mincho ProN","Yu Mincho",serif; color: var(--accent-deep); }
  h1 { font-size: 50px; }
  h2 { font-size: 36px; text-align: center; border-bottom: 3px solid var(--gold); padding-bottom: .25em; margin-bottom: .55em; }
  h3 { color: var(--accent); font-size: 27px; margin-bottom: .2em; }
  strong { color: var(--accent-deep); }
  a { color: var(--accent); }
  code { background: #f3efe4; color: #7a4f2a; padding: .08em .35em; border-radius: 5px; font-size: .85em; }
  table { border-collapse: collapse; font-size: 22px; margin: 1em auto; }
  th { background: var(--accent); color: #fff; padding: 8px 14px; text-align: center; }
  td { border: 1px solid var(--line); padding: 8px 14px; background: #fffdf8; text-align: center; }
  blockquote { background: #fcf3e6; border-left: 6px solid var(--gold); padding: .55em 1em; color: #5c4a2e; font-size: .85em; border-radius:0 8px 8px 0; }
  ul { line-height: 1.7; }
  section::after { color: var(--muted); font-size: 16px; }
  .num { color: var(--gold); font-weight: normal; margin-right: .35em; }
  .why { background:#eef3ea; border-left:6px solid var(--accent); padding:.5em 1em; border-radius:0 8px 8px 0; font-size:.85em; }
  .pitfall { background:#fcf3e6; border-left:6px solid #e3b873; padding:.5em 1em; border-radius:0 8px 8px 0; font-size:.82em; }
  .done { background:#eef3ea; border-left:6px solid var(--accent); padding:.5em 1em; border-radius:0 8px 8px 0; font-size:.82em; }
  .tag { display:inline-block; background:var(--accent-deep); color:#fff; font-size:18px; padding:.1em .8em; border-radius:99px; margin-bottom:.3em; letter-spacing:.03em; }
  /* ---- 緑背景スライドは文字を白系に（同化防止）---- */
  section.lead { background: linear-gradient(135deg, #3f5a37, #5a7a4f); justify-content: center; text-align: center; }
  section.lead h1, section.lead h2, section.lead h3, section.lead p, section.lead strong, section.lead li { color: #ffffff; }
  section.lead h2 { border: none; padding: 0; }
  section.lead em, section.lead .sub { color: #e9e2cc; }
  section.lead blockquote, section.lead blockquote p, section.lead blockquote strong { color: #4a3a22; }
  section.divider { background: var(--accent-deep); justify-content: center; }
  section.divider h1, section.divider h2, section.divider h3, section.divider p, section.divider strong, section.divider li { color: #ffffff; }
  section.divider h1 .num { color: var(--gold); }
  section.divider h2 { border-left-color: var(--gold); }
  section.divider .sub { color: var(--gold); }
---

<!-- _class: lead -->

# AI とつくる<br>フルスタック SaaS

## 3Days ワークショップ 🍵「玄米茶」

<p class="sub">Claude Design / Claude Code / Cloudflare</p>

---

<!-- _class: lead -->

# まず大前提

完成品のコードは渡しません。
**Claude と一緒に、ゼロから自分で作る。**

> 実装はほぼ AI がやる。だから手順では縛らない。
> 縛るのは「**作るもの**」と「**完了条件**」だけ。

---

<!-- _class: divider -->

# <span class="num">1</span>はじめに

<p class="sub">3日間の地図とゴールを共有する</p>

---

## <span class="num">1.1</span>3日間の全体マップ

| Day | テーマ | 内容 |
|---|---|---|
| **Day 1** | つくる（前半） | 目的・技術紹介 / デザイン / フロント |
| **Day 2** | つなぐ・公開する | バック / 自動テスト / **デプロイ** |
| **Day 3** | 育てる | オプション課題（メール/決済/認証/運用/セキュリティ） |

- Day 1〜2 が全員共通の本編 → 「**テスト付き + 公開済み**」に揃える
- Day 3 は選択式。興味に応じて各自アレンジ

---

## <span class="num">1.2</span>ゴール（達成できたら勝ち）

1. LP・マイページが**ブラウザで動く**
2. API（問い合わせ・ライセンス検証）が**動く**
3. **`npm test` がグリーン**
4. **Cloudflare 上に公開**されている（自分の URL）
5. オプション機能を1つ以上追加して**発表**

> 「題材は何でもいい。**流れを体験する**のが目的」

---

<!-- _class: divider -->

# <span class="num">2</span>使う技術

<p class="sub">1スライド＝1技術。「なぜ選ぶか」を添えて</p>

---

## <span class="num">2.1</span>Claude Design

<span class="tag">AI / デザイン</span>

プロンプトから **UI デザインを生成**するツール。**claude.ai にブラウザでログイン**して使う（Claude Code と同じアカウント）。

<div class="why">
<strong>なぜ選ぶ？</strong><br>
・デザインの方向性を数分で形にできる（1プロンプトで<strong>3案</strong>出る）<br>
・デザイン（Project）を zip で書き出してそのままコードに渡せる
</div>

---

## <span class="num">2.2</span>Claude Code

<span class="tag">AI / 実装</span>

ターミナルで動く**コーディングエージェント**。本ワークショップの主役。

<div class="why">
<strong>なぜ選ぶ？</strong><br>
・会話するだけでファイル作成・編集・コマンド実行まで進む<br>
・人は「方向づけ」と「承認」に集中できる
</div>

---

## <span class="num">2.3</span>Vite + React + TypeScript

<span class="tag">フロントエンド</span>

モダンフロントの**デファクト**構成。

<div class="why">
<strong>なぜ選ぶ？</strong><br>
・AI が最も得意とするスタック（生成精度が高い）<br>
・Vite の高速 HMR で「直す→即見る」が速い<br>
・TypeScript の型で凡ミスを防ぐ
</div>

---

## <span class="num">2.4</span>Tailwind CSS v4 + shadcn/ui

<span class="tag">スタイル / UI</span>

ユーティリティ CSS ＋ 高品質コンポーネント集。

<div class="why">
<strong>なぜ選ぶ？</strong><br>
・デザインの再現がしやすい<br>
・v4 は <code>@tailwindcss/vite</code> プラグイン方式で設定が軽量<br>
・shadcn/ui は <code>npx shadcn add</code> で部品を追加
</div>

---

## <span class="num">2.5</span>Hono

<span class="tag">バックエンド</span>

軽量な Web フレームワーク（TypeScript）。

<div class="why">
<strong>なぜ選ぶ？</strong><br>
・Cloudflare Workers と相性抜群<br>
・Express ライクな書き味で学習コストが低い<br>
・ルーティング・ミドルウェアがシンプル
</div>

---

## <span class="num">2.6</span>Cloudflare Workers

<span class="tag">実行基盤</span>

エッジで動くサーバーレス実行環境。

<div class="why">
<strong>なぜ選ぶ？</strong><br>
・<strong>無料枠で本番公開まで</strong>届く<br>
・デプロイが速い（<code>wrangler deploy</code> 一発）<br>
・フロント配信と API を1つの Worker に同居できる
</div>

---

## <span class="num">2.7</span>Cloudflare D1 / KV

<span class="tag">データ</span>

Workers ビルトインの **SQLite (D1)** と **KV ストア**。

<div class="why">
<strong>なぜ選ぶ？</strong><br>
・別サーバー不要、セットアップが最小<br>
・D1 = リレーショナルデータ、KV = レート制限やキャッシュ<br>
・マイグレーションも wrangler で管理
</div>

---

## <span class="num">2.8</span>Vitest + vitest-pool-workers

<span class="tag">テスト</span>

フロント・バックを統一できるテストランナー。

<div class="why">
<strong>なぜ選ぶ？</strong><br>
・pool-workers で <strong>Workers 実環境に近い形で API テスト</strong><br>
・D1 / KV を実バインディングで検証できる<br>
・外部サービスはモックして安全に回す
</div>

---

<!-- _class: divider -->

# <span class="num">3</span>準備とお作法

<p class="sub">アカウント・ツール／Claude Code の扱い方</p>

---

## <span class="num">3.1</span>事前準備：アカウント・ツール

<p class="sub">電話番号が必要なツールはありません</p>

**事前に作っておく**
- GitHub アカウント（リポジトリ・SonarQube ログインにも使う）

**事前にインストール**
- Claude Code（**ログインまで**）／余裕があれば **security-guidance** も導入
- Stripe CLI / Node.js 20+ / git

---

## <span class="num">3.2</span>事前準備：当日取得（無料）

| サービス | 用途 | いつ |
|---|---|---|
| **Cloudflare** | デプロイ先 | Day 2 |
| **Resend** | メール | Day 3 |
| **Stripe** | 決済 | Day 3 |
| **Clerk** | 認証 | Day 3 |
| **SonarQube** | 静的解析（GitHubでログイン） | Day 3 |

> Day 3 の分は「**やる課題の分だけ**」当日取得すればOK

---

## <span class="num">3.3</span>Git の進め方（dev → main）

- **専用リポジトリを用意**（SonarQube に解析させる単位を分けたいので**別リポジトリ推奨**）
- 最初に **`dev` ブランチを切り、作業はすべて `dev`** で進める
- 区切りのいいところで**こまめに commit / push**
- 完成したら **`dev` → `main` にマージ**（`main` ＝ 公開・解析対象の安定版）

```bash
git switch -c dev      # 最初に dev を切る
# … dev で実装・こまめに commit / push …
git switch main
git merge dev          # 完成したら main へ
```

> SonarQube は `main`（または PR）を解析する想定。**秘密（`.dev.vars` 等）は `.gitignore` でコミットしない**

---

## <span class="num">3.4</span>Claude Code の歩き方

<p class="sub">対象：AI ツールは触ったことがあるが Claude Code は初めて〜浅い人</p>

### 基本のループ
1. ディレクトリで `claude` 起動
2. **日本語で依頼**する
3. 提案（編集・コマンド）を **見て承認 / 拒否**
4. 結果を見て会話で直す → 繰り返し

> 1発完璧を狙わない。雑に頼んで会話で詰めるのが速い。

---

## <span class="num">3.5</span>事故らないための心得

- **破壊的な操作は中身を読んでから承認**（`rm`・本番系）
- 違う方向に行ったら `Esc` で止めて割り込む
- **エラーは全文そのまま貼る**
- 話が脱線したら `/clear` で仕切り直し
- **AI のコードは読まずに承認しない**
- **秘密情報（キー）は会話に貼らない**

---

## <span class="num">3.6</span>最初に1回：秘密を守る設定

`.claudeignore` は**存在しない**。正しくは `.claude/settings.json`：

```json
{
  "permissions": {
    "deny": ["Read(./**/.dev.vars)", "Read(./**/.env)"]
  }
}
```

> これで「うっかり `.dev.vars` を読む」事故を防ぐ。
> `.gitignore` 連動で `node_modules` もコンテキストに出ない。

---

## <span class="num">3.7</span>AI のコードを自動点検：security-guidance

<span class="tag">公式プラグイン</span>

Claude が**生成したコードを自動でセキュリティレビュー**する公式プラグイン。`/plugin install security-guidance@claude-plugins-official` で導入（前提：`python3`）。

- **① パターン警告**：危険な書き方を編集のたびにその場で警告
- **② 差分の LLM レビュー**：応答を返す前に点検 → **見る前に直してくれる**
- **③ コミット時レビュー**：複数ファイルにまたがる脆弱性（IDOR 等）も検出

<div class="why">💡 手動の <code>/security-review</code>（狙って点検）とは役割が違い、こちらは<strong>常時バックグラウンド</strong>。併用が効く。[10] セキュリティの下地になる</div>

---

<!-- _class: divider -->

# <span class="num">4</span>作るもの ＝ タスク

<p class="sub">最初に全部見せる。進め方は Claude と相談</p>

---

## <span class="num">4.1</span>必須機能（Day 2 までに）

| 機能 | 中身 | ページ |
|---|---|---|
| **LP** | サービス紹介 | `/` |
| **価格表示** | 料金プラン | `/` |
| **お問い合わせ** | フォーム → 受付 | `/contact` |
| **マイページ** | 情報・ライセンス表示 | `/mypage` |
| **ライセンス配布** | キー発行（Day2は自前でOK） | `/success` |

> 決済(Stripe)・本物の認証(Clerk) は Day 3 のオプション

---

## <span class="num">4.2</span>全体タスクマップ（最初に丸ごと見せる）

| | タスク | 完了条件（ざっくり） |
|---|---|---|
| **[1]** | デザイン | 全画面の方向性が決まり zip で書き出せる |
| **[2]** | フロント | 4ページ SPA がローカルで動く |
| **[3]** | バック | API＋ライセンス発行、フロント結合 |
| **[4]** | 自動テスト | `npm test` グリーン |
| **[5]** | デプロイ | 自分の `*.workers.dev` で公開 |
| **[6]–[10]** | オプション | メール/決済/認証/運用/セキュリティ（1つ以上） |

> 番号は詳細フローと対応。**進め方は Claude と相談**、合格ライン（完了条件）だけ守る

---

<!-- _class: divider -->

# <span class="num">5</span>詳細フロー

<p class="sub">推奨であって命令ではない。詰まったら開く</p>

---

## <span class="num">5.1.1</span>Claude Design でデザイン

**ゴール**: **全画面分**の方向性を決め、[2] に渡せる **デザイン Project**（zip）を作る

- 伝えるのは**中身**（何のサービス・売りたいもの・欲しい機能）。トーンや配色は Design が**質問で返してくれる**
- **1回で3案出る → 見比べて1つ選ぶ**（いきなり1案に飛びつかない）
- **時間短縮**: まず LP だけで3案 → 1つ選ぶ → そのあと他ページ（マイページ等）を追加生成
- 仕上げに **Project を zip でエクスポート**して [2] へ（色の言語化テキストは不要）

---

## <span class="num">5.1.2</span>Claude Design：ポイント

<div class="why">💡 トーン・配色・アクセントは上部タブ <strong>Tweaks</strong> から後で触れる。プロンプトに盛り込まなくてよい</div>

<div class="pitfall">⚠️ <strong>ピクセル完璧は狙わない</strong>。見た目の細部は Design 任せ／Tweaks で調整（時間とトークンの節約）</div>

<div class="done">✅ <strong>完了</strong>: <strong>全画面</strong>の方向性が決まり、使いたい機能すべてに到達できる導線が揃い、zip で書き出せる</div>

---

## <span class="num">5.2.1</span>フロント作成

**ゴール**: **全画面**の SPA がローカルで動き、デザインが反映されている

- 雛形を依頼 →「Vite + React + TS + Tailwind v4 + shadcn/ui の SPA。`/` `/contact` `/mypage` `/success` を React Router で」
- **[1] の zip を渡して**「このデザインで実装して」→ 色・余白は AI がそこから拾う
- **全画面まで実装**。API はまだ無いので**各画面はモックデータで動かす**（[3] で実 API に差し替え）

---

## <span class="num">5.2.2</span>フロント作成：ポイント

<div class="why">💡 フロントとバックは<strong>別ディレクトリ（別プロジェクト）</strong>。役割もビルド単位も違うから分ける（共通パーツの切り出しは AI が自然にやる）</div>

<div class="pitfall">⚠️ <strong>Tailwind v4</strong> は Vite プラグイン方式（<code>@tailwindcss/vite</code> + <code>@import "tailwindcss"</code>）。v3 流儀だと効かない／<strong>shadcn/ui の部分適用に注意</strong>（画面ごとに素CSSと混在しがち）</div>

<div class="done">✅ <strong>完了</strong>: <code>localhost:5173</code> で表示崩れなし／全画面に遷移できる（データはモック）／デザインが画面に出ている</div>

---

## <span class="num">5.3.1</span>バック作成：資源を作る

**ゴール**: ローカル（`:8787`）で API が叩ける（**フロントとは別ディレクトリ**で作る）

- まず `wrangler login` → `whoami`（複数アカウント注意）
- 雛形と一緒に **`.gitignore` も作らせる**（秘密ファイルを誤コミットしない）
- **資源を先に作る**＝データの保存場所を Cloudflare に用意
  - **D1**（DB）／**KV**（簡易ストア）→ `wrangler d1 create` / `kv namespace create`
  - 出た id を `wrangler.toml` に書く

---

## <span class="num">5.3.2</span>バック作成：API を実装

- **やりたいことを日本語でまとめて伝え、API はまとめて実装**させてよい（Opus なら1本ずつ刻まない／設計も AI に）
  - 問い合わせ保存／ログイン情報を返す（**この場面はモック認証でよい**）／ライセンス検証
- **保存するデータの中身だけ決める**（テーブル定義の SQL は AI に書かせる）

<div class="pitfall">⚠️ 秘密（キー）はコードに書かず <code>.dev.vars</code> へ。Claude には貼らない</div>

---

## <span class="num">5.3.3</span>バック作成：DB と配信の一本化

**ゴール**: フロントと実 API がつながり、Worker 一本で配信できる

- **ローカル D1** にマイグレーション → `npm run db:migrate:local`（手元だけ。本番 D1 は [5] で別に `--remote`）
- フロントの**モック表示を実 API 呼び出しに差し替え**
- 配信を一本化：フロントを `dist/` にビルド → Worker の `[assets]` で配信（ソースは分けたまま）

---

## <span class="num">5.3.4</span>DB と配信：ポイント

<div class="why">💡 <strong>ローカル ⇄ クラウド（本番）は別物</strong>。開発は手元の D1（壊してOK）、本番 D1 は [5] で改めて用意する</div>

<div class="pitfall">⚠️ <code>[assets]</code> は <code>directory="../genmaicha_front/dist"</code> ＋ <code>not_found_handling="single-page-application"</code>（無いと <code>/mypage</code> が 404）</div>

<div class="done">✅ <strong>完了</strong>: curl で <code>/</code>→200／<code>/mypage</code>→200(SPA)／未認証 API→401／空の問い合わせ→400。<strong>必ずブラウザでも目視確認</strong>（curl が通っても画面で動かないことがある）</div>

---

## <span class="num">5.4.1</span>自動テスト（公開の前に）

**ゴール**: `npm test` で回帰検知できる状態にする

- まず**テスト方針を .md で書かせる**（どこを・どうテストするかも **AI に洗い出させ**、人はレビュー）
- 層を分けて：**単体**（キー生成・マスク等）→ **API**（正常系＋認証境界の 401）
- 外部サービスへの fetch は**モック**（外部に依存させず、速く・安定して回す）

---

## <span class="num">5.4.2</span>自動テスト：ポイント

<div class="why">💡 <strong>テストが緑になってから公開</strong>（実務の王道）。壊れたものを世に出さない流れを体で覚える</div>

<div class="pitfall">⚠️ 観点の<strong>固定表は持ち込まない</strong>（「表に無い＝やらない」になりがち）／バック統合テストは <code>defineWorkersConfig</code> が必要（素の vitest では動かない）</div>

<div class="done">✅ <strong>完了</strong>: 単体1つ以上 ＋ API 正常系 ＋ 認証境界(401) が pass → [5] へ</div>

---

## <span class="num">5.5</span>デプロイ 🎉（Day 2 のフィナーレ）

**ゴール**: 自分の `https://<name>.workers.dev` で世界に公開

- **本番 DB を用意**：`npm run db:migrate:remote`（ローカルとは別物）
- デプロイ：`npm run deploy`（フロントのビルド → `wrangler deploy` まで一発）
- 発行された URL にアクセス → 動作確認 → みんなで**URL を見せ合う**

<div class="pitfall">⚠️ <strong>リモート D1 マイグレーション忘れ</strong>で「テーブルが無い」／ビルド失敗で deploy も止まる（事前に <code>build:front</code> 確認）／初回は workers.dev サブドメイン有効化　※Day2 core は Secrets 投入不要</div>

<div class="done">✅ <strong>完了</strong>: 本番 URL で LP 表示／<code>/mypage</code> が 404 にならない／API を使う画面が本番でも動く</div>

---

<!-- _class: divider -->

# <span class="num">6</span>育てる・まとめ

<p class="sub">オプション課題と発表会</p>

---

## <span class="num">6.1</span>Day 3：オプション課題（選択式）

| # | 課題 | 完了条件 |
|---|---|---|
| 6 | **メール** (Resend) | 自分宛に届く＋連投で429 |
| 7 | **決済** (Stripe) | テストカード購入→キー表示 |
| 8 | **ID連携** (Clerk) | 未ログインで /mypage 不可 |
| 9 | **運用保守** | レート制限が429を返すテスト |
| 10 | **セキュリティ** | セキュリティレビュー＋SonarQube／問題1つ修正 |

<div class="pitfall">⚠️ [8] Clerk は<strong>共有クレデンシャルだとサインイン後にループ</strong>しがち → 専用アプリ（専用クレデンシャル）を作る</div>

---

## <span class="num">6.2</span>運用保守は「スキル」で再利用する

<span class="tag">[9] 運用保守</span>

毎回同じ運用チェックを **Claude Code の Skill（`.claude/skills/`）** にしておけば、一言で一気通貫に回せる。

| スキル | 役割 |
|---|---|
| infra-status | 依存サービスの障害確認 |
| cf-log-check | ログ／エラー取得 |
| fault-localize | 障害箇所の特定 |
| remediate | 対策・ワークアラウンド提示 |
| cost-monitor | コスト試算 |

> 統合スキル **`ops-check`** で「障害確認→ログ→原因特定→対策→コスト」を一気に

---

## <span class="num">6.3</span>ラップアップ・発表会

**最終発表（1人5分）**
- 自分の公開 URL のデモ
- 追加した機能の紹介
- 「AI への頼み方で一番効いた工夫」

体験した開発サイクル:
**デザイン → 実装 → テスト → 公開 → 拡張 → 点検**

---

<!-- _class: lead -->

# 持ち帰るもの

自分の URL で公開された、
**自分だけの SaaS** 🍵
