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
    font-size: 25px; line-height: 1.6; padding: 52px 70px;
  }
  h1, h2 { font-family: "Hiragino Mincho ProN","Yu Mincho",serif; color: var(--accent-deep); }
  h1 { font-size: 50px; }
  h2 { font-size: 34px; text-align: center; border-bottom: 3px solid var(--gold); padding-bottom: .2em; margin-bottom: .5em; }
  h3 { color: var(--accent); font-size: 25px; margin-bottom: .2em; }
  strong { color: var(--accent-deep); }
  a { color: var(--accent); }
  code { background: #f3efe4; color: #7a4f2a; padding: .08em .35em; border-radius: 5px; font-size: .82em; }
  table { border-collapse: collapse; font-size: 21px; margin: .7em auto; }
  th { background: var(--accent); color: #fff; padding: 7px 13px; text-align: center; }
  td { border: 1px solid var(--line); padding: 7px 13px; background: #fffdf8; text-align: left; }
  blockquote { background: #fcf3e6; border-left: 6px solid var(--gold); padding: .5em 1em; color: #5c4a2e; font-size: .82em; border-radius:0 8px 8px 0; }
  ul { line-height: 1.6; }
  li { margin: .15em 0; }
  section::after { color: var(--muted); font-size: 16px; }
  .num { color: var(--gold); font-weight: normal; margin-right: .35em; }
  .why { background:#eef3ea; border-left:6px solid var(--accent); padding:.45em 1em; border-radius:0 8px 8px 0; font-size:.8em; }
  .pitfall { background:#fcf3e6; border-left:6px solid #e3b873; padding:.45em 1em; border-radius:0 8px 8px 0; font-size:.8em; }
  .done { background:#eef3ea; border-left:6px solid var(--accent); padding:.45em 1em; border-radius:0 8px 8px 0; font-size:.8em; }
  .tag { display:inline-block; background:var(--accent-deep); color:#fff; font-size:17px; padding:.1em .8em; border-radius:99px; margin-bottom:.3em; letter-spacing:.03em; }
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

# Day 3 — 育てる 🌱

## オプション課題ガイド（玄米茶）

<p class="sub">[6] メール / [7] 決済 / [8] 認証 / [9] 運用 / [10] セキュリティ</p>

---

<!-- _class: lead -->

# 進め方は本編と同じ

固定するのは「**お題 + 完了条件**」だけ。
**コード実装は Claude にまとめて頼む。**

> 載せるのは**外部サービス側の操作**などAIに任せられない部分。**1つ以上**やればOK。

---

## <span class="num">D3</span>全課題に共通すること

- 秘密は **`.dev.vars`**（ローカル）／本番は `wrangler secret put`・環境変数。**コードや指示に貼らない**
- 必要な**環境変数・npm パッケージは AI に聞く／入れてもらう**
- **`.dev.vars` を変えたら `npm run dev` を再起動**
- ログインは基本 **Google SSO**（電話番号不要）

<div class="why">💡 どの課題も流れは共通： <strong>①キー取得 → ②<code>.dev.vars</code> でローカル動作 → ③本番にも入れてデプロイ</strong></div>

---

<!-- _class: divider -->

# <span class="num">6</span>メール（Resend）

<p class="sub">通知メール / ライセンス送付メール</p>

---

## <span class="num">6.1</span>Resend：操作

<span class="tag">参考: src/email.ts</span>

- <https://resend.com/login>（Google SSO）
- **API keys → Create API Key**（Sending access／名前は各自）
- キーを **`.dev.vars`** にセット（`RESEND_API_KEY=...`）
- From / To は AI と相談 → まず**ローカルで往復**
- Resend の **Logs で Status 確認**（200以外はエラー本文を AI に渡す）

---

## <span class="num">6.2</span>Resend：ドメインと完了条件

<div class="why">💡 <strong>送信ドメイン</strong>：独自ドメインは DNS 検証が必要（公開後の話）。<br>動作確認は <code>onboarding@resend.dev</code> を From に使う（検証不要・宛先は自分のみ）。独自ドメインは任意。</div>

<div class="done">✅ <strong>完了の定義</strong>：自分宛にメールが届く ＋ 連投で <strong>429</strong>（KV クールダウン）。<br>テストでは外部 fetch をモックし、実送信を起こさない。</div>

---

<!-- _class: divider -->

# <span class="num">7</span>決済（Stripe）

<p class="sub">Checkout → Webhook でライセンス自動発行</p>

---

## <span class="num">7.1</span>Stripe：準備（①）

<span class="tag">参考: src/stripe.ts / license.ts</span>

- <https://dashboard.stripe.com/login>（Google SSO）
- **サンドボックス（テストモード）**に切り替え（終始これ）
- **Developers → API keys** の **Secret key（`sk_test_...`）** を `.dev.vars` へ
- ターミナルで **`stripe login`**（CLI を認証）

> 必要な環境変数は AI に聞いて `.dev.vars.sample` に雛形を作っておく

---

## <span class="num">7.2</span>Stripe：プランを作る（②）

**商品カタログ → ＋商品を作成**で継続プランを2つ：

| プラン | 種別 | 金額 | 請求 |
|---|---|---|---|
| 月額 | 継続 | ¥300 | 毎月 |
| 年額 | 継続 | ¥3000 | 毎年 |

- 各プランの **Price ID（`price_...`）** を控えて `.dev.vars` へ
- Checkout に渡すのは **`price_...`**（`prod_...` ではない）

---

## <span class="num">7.3</span>Stripe：ローカルで Webhook 検証（③）

**ターミナルを2つ**使う（バックを起動したまま listen）：

```bash
# 端末1: バック
npm run dev                 # :8787
# 端末2: Stripe CLI
stripe listen --forward-to localhost:8787/webhook/stripe
```

- listen で出る **署名シークレット（`whsec_...`）** を `.dev.vars` へ → 再起動
- テストカード **`4242 4242 4242 4242`**（期限=未来の任意／CVC=任意3桁）で購入確認

---

## <span class="num">7.4</span>Stripe：本番に Webhook 設定（④）

- **デプロイ前**に `.dev.vars` の値（Secret key・Price ID 等）を**本番にも**入れる
- デプロイ後、ダッシュボードで **Webhook を作成**
  - 送信イベントは AI に確認（例 `checkout.session.completed`）
  - エンドポイント URL = **公開ドメイン** `/webhook/stripe`
- 表示される**本番用の署名シークレット**を **Cloudflare 環境変数**へ

<div class="pitfall">⚠️ 署名シークレットは<strong>ローカル(③)と本番(④)で別物</strong>／署名は<strong>生ボディ</strong>で検証／<strong>冪等性</strong>（再送で二重発行しない）</div>

---

## <span class="num">7.5</span>Stripe：戻り先とマイページ表示

- Checkout の **戻り先（`success_url`/`cancel_url`）** を Day 2 の **`/success`** につなぐ
- マイページ表示の**紐付け**に注意：
  - ライセンス＝**購入者の email**／マイページ＝**ログイン中の email** で引く

<div class="pitfall">⚠️ [8] Clerk をやらない場合は、<strong>モック認証の email（<code>x-user-email</code>）と購入 email を一致</strong>させる。ズレると「買ったのに出ない」</div>

<div class="done">✅ <strong>完了</strong>：テストカード購入 → マイページにライセンス表示／再送で二重発行されない</div>

---

<!-- _class: divider -->

# <span class="num">8</span>ID 連携（Clerk）

<p class="sub">ログイン必須のマイページ</p>

---

## <span class="num">8.1</span>Clerk：サービス側の準備

<span class="tag">Day 2 のモック認証を差し替える</span>

- <https://dashboard.clerk.com/>（Google SSO）→ **アプリを作成**
- **Configure → User & Authentication**
  - **Email を全オフ** ／ **Google SSO 有効**を確認
  - 当日は**共有クレデンシャルで可**
- **Developers → API keys** で2つのキーを取得（次スライドで置き場所）

---

## <span class="num">8.2</span>Clerk：キーの置き場所（要注意）

| キー | 置き場所 | 性質 |
|---|---|---|
| **Publishable** | フロント `VITE_CLERK_PUBLISHABLE_KEY` | 公開可 |
| **Secret** | バック `.dev.vars` | 秘密 |

- フロントは **`<ClerkProvider>`** で包む／未ログインは `/mypage` 不可
- **バックで JWT 検証**（`@hono/clerk-auth` 推奨）。フロントの出し分けだけでは保護にならない

---

## <span class="num">8.3</span>Clerk：落とし穴と完了条件

<div class="pitfall">⚠️ 共有クレデンシャルで<strong>サインイン後ループ</strong>することがある → <strong>専用アプリ（専用クレデンシャル）</strong>を作る</div>

<div class="pitfall">⚠️ 本番で弾かれたら、Clerk に<strong>公開ドメインを許可オリジン登録</strong>（dev インスタンスでは緩いことも）</div>

<div class="done">✅ <strong>完了</strong>：未ログインで <code>/mypage</code> 不可／<code>GET /api/me</code> が認証必須（無し・偽造で弾く）</div>

---

<!-- _class: divider -->

# <span class="num">9</span>運用保守

<p class="sub">監視・ログ・障害特定・対策・コスト</p>

---

## <span class="num">9.1</span>運用保守：API トークン

- Cloudflare ダッシュボードの**検索窓で「API」** → トークン作成
- **Create Custom Token** → 権限 **Account / Account Analytics / Read**
- 取得したトークンを **`genmaicha_back/.dev.vars`** に追記

<div class="why">💡 このトークンは <strong>Worker でなく運用スキルが shell から使う</strong>（本番 secret は不要）。無くても <code>wrangler tail</code> のライブログは見られる</div>

---

## <span class="num">9.2</span>運用保守：スキルで仕組み化

「運用チェックして」の一言で回せるよう、**Claude Code の Skill** にする：

| スキル | 役割 |
|---|---|
| infra-status | 依存サービスの障害確認 |
| cf-log-check | ログ／エラー取得 |
| fault-localize | 障害箇所の特定 |
| remediate | 対策・回避策提示 |
| cost-monitor | コスト試算 |

<div class="done">✅ <strong>完了</strong>：レート制限が <strong>429 を返すことをテストで証明</strong>（統合スキル <code>ops-check</code> で一気通貫）</div>

---

<!-- _class: divider -->

# <span class="num">10</span>セキュリティ

<p class="sub">点検して最低1つ直す</p>

---

## <span class="num">10.1</span>観点と Claude Code

**見る観点**

- **認証境界**：未認証／偽造 JWT で 401 になるか
- **IDOR**：他人の email を body に入れても無視されるか
- **機密のマスク**：レスポンスにキー全文が出ていないか

**Claude Code**

- `/security-review`（狙って点検）
- `security-guidance`（常時バックグラウンドで自動点検・本編 0.6）

---

## <span class="num">10.2</span>SonarCloud と完了条件

1. `main` に push → <https://sonarcloud.io>（GitHub SSO）
2. ＋ → **Analyze new project** → 対象リポジトリを**許可**
3. **Automatic Analysis** を選ぶと楽 → 指摘を **AI とレビュー**

<div class="pitfall">⚠️ SonarCloud は<strong>誤検知</strong>もある。鵜呑みにせず AI と判断／解析は<strong>専用リポジトリ</strong>推奨</div>

<div class="done">✅ <strong>完了</strong>：見つけた問題を<strong>1つ以上修正</strong>し、<strong>回帰テストを追加</strong></div>

---

<!-- _class: lead -->

# お疲れ様でした 🍵
