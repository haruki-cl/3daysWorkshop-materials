# git push だけで Cloudflare に自動デプロイできるか — 検証レポート

## 背景・目的

現状の資料（`flow.html`）の `[6] Cloudflare にデプロイ` は、参加者が手元のターミナルで `npm run deploy`（内部で `wrangler deploy`）を実行する**手動デプロイ**を前提にしている。

運営側から「`git push` するだけで Cloudflare 側が自動的にビルド・デプロイしてくれる状態にできないか」という依頼があり、実際に成立するかどうかを検証した。本ドキュメントはその結果と、資料に反映する場合の変更案をまとめたもの。

## 結論

**成立する。** Cloudflare の「Workers Builds」という Git 連携機能を使うことで、`git push` だけで自動的にビルド・デプロイされる状態を実現できた。ただし、このリポジトリの構成（`frontend/` と `backend/` が分かれたモノレポ）特有の設定が2点必要で、デフォルト設定のままでは正しく動かない。

検証には `3daysWorkshop-AItest`（flow.html の [1]〜[6] を忠実に再現したリポジトリ）を使用した。`genmaichaLP` は資料の初期バージョンをもとに作られた別物で、`wrangler.toml` を `.gitignore` で除外するなど資料と異なる方針だったため、今回の検証対象からは除外した。

## 検証手順

1. Node.js / npm / wrangler CLI をローカルにセットアップ
2. `wrangler login` で Cloudflare にログイン
3. 検証用に自分のアカウントで D1 (`testai-genmaicha-db`) と KV (`RATE_LIMIT`) を新規作成し、`backend/wrangler.jsonc` の `database_id` / `id` を自分のものに書き換え（資料の設計通り、この設定ファイルはコミット対象）
4. 手元で `npm run deploy` を実行し、手動デプロイが成功することを確認（ベースライン確保）
5. Cloudflare ダッシュボードで対象の Worker → **Settings → Build** から、GitHub リポジトリ（フォーク先）と連携（Workers Builds）
6. 検証用ブランチに軽微な変更を加えて `git push` し、Cloudflare 側で自動的にビルド・デプロイが走るか確認

## 発見したハマりどころ（資料に追記すべき点）

### 1. Root directory をリポジトリのモノレポ構成に合わせて明示的に指定する必要がある

デフォルトの Root directory は `/`（リポジトリのルート）になっている。このリポジトリは `frontend/` と `backend/` に分かれたモノレポで、実際の `wrangler.jsonc` は `backend/` の中にあるため、**Root directory を明示的に `backend` に変更しないと正しい設定が使われない**。

**放置するとどうなるか**: Cloudflare は「ルートに設定ファイルが無い」と判断し、`cloudflare-workers-and-pages[bot]` が自動でリポジトリのルートに簡易的な `wrangler.jsonc` を生成して PR を送ってくる（`workers-autoconfig` という別ブランチ）。この自動生成ファイルは静的ファイル配信専用で、`main`（Worker のコード本体）も D1/KV のバインディングも一切含まれない。これが実際にデプロイされてしまうと、API ルート（`/api/*`）がすべて 404 になり、フロントも「ビルド前の生の `frontend/index.html`」が配信されてしまう（`assets.directory` が `frontend/dist` ではなく `frontend` を指すため）。

**対応**: Settings → Build → Path を `/backend` に設定する。

### 2. Build command を明示的に設定しないとフロントがビルドされない

デフォルトの Deploy command は `npx wrangler deploy` のみで、これは `frontend` のビルド（`vite build`）を含まない。ローカルでの `npm run deploy` は `npm run build:front && wrangler deploy` だったのに対し、Workers Builds はこの2段構成を自動では推測してくれない。

**対応**: Build command に以下を設定する。
```
npm install --prefix ../frontend && npm run build:front
```
（Path を `backend` にした場合、相対パス `../frontend` で解決される）

### 3. デプロイ直後は数秒〜十数秒の伝播遅延がある

デプロイ完了直後にトップページへアクセスすると、一時的に 404 やエラー1042（Cloudflare 内部で Worker がキャッチオール処理として自分自身へ再フェッチし、`workers.dev` サブドメインではこれがブロックされるために起きる）が出ることがある。数秒〜十数秒待って再アクセスすると解消する。**コードのバグではない**ので、資料に「デプロイ直後すぐに確認して404が出ても、少し待って再確認する」という一言があるとハマる人を減らせる。

### 4. Production branch の指定に注意

Workers Builds は「Production branch」に指定したブランチへの push だけを本番デプロイ（`wrangler deploy` 相当）に使い、それ以外のブランチへの push は既定で `wrangler versions upload`（プレビューのみ・本番URLには反映されない）になる。資料の Git 運用（`dev` で作業し `main` にマージ）に合わせるなら、**Production branch は `main` に設定**し、`dev` への push はプレビュー止まりにするのが自然。

## 資料 (flow.html) への反映案

`[6] Cloudflare にデプロイ` の末尾に、以下のような追加セクションを設けることを提案する（現状は手動デプロイの説明で終わっているため、その後に「発展: 自動デプロイにする」という位置づけで追加する）。

### 現状（flow.html [6] の末尾）

```html
<h3>完了したら push する</h3>
<pre><code>デプロイ完了の作業をコミットして dev ブランチに push して。必要なら dev を main にマージして。</code></pre>

<h3 class="done">✅ 完了の定義（Day 2 の到達点・後半）</h3>
...
```

### 変更案（追加する内容）

```html
<h3>完了したら push する</h3>
<pre><code>デプロイ完了の作業をコミットして dev ブランチに push して。必要なら dev を main にマージして。</code></pre>

<h3 class="done">✅ 完了の定義（Day 2 の到達点・後半）</h3>
...

<h3>発展: git push だけで自動デプロイする（Workers Builds）</h3>
<p>ここまでは手元で <code>wrangler deploy</code> を叩く手動デプロイだったが、Cloudflare の
<strong>Workers Builds</strong> という Git 連携機能を使うと、<code>git push</code> するだけで
自動的にビルド・デプロイされる状態にできる。</p>
<ol>
<li>Cloudflare ダッシュボード → 対象の Worker → <strong>Settings → Build</strong> から GitHub リポジトリを連携する</li>
<li><strong>Path を <code>backend</code> に設定する</strong>（モノレポ構成のため。ここを空のままにすると
Cloudflare が自動生成した誤った設定でデプロイされてしまうので注意）</li>
<li><strong>Build command に <code>npm install --prefix ../frontend && npm run build:front</code> を設定する</strong>
（フロントのビルドをここで行う）</li>
<li><strong>Production branch を <code>main</code> に設定する</strong>（<code>dev</code> への push はプレビューのみになる）</li>
</ol>
<h3 class="warn">⚠️ ハマりどころ: Workers Builds</h3>
<ul>
<li>Path を設定し忘れると、Cloudflare が自動でリポジトリのルートに簡易的な設定ファイルを追加する
PR を送ってくることがある。これが誤ってデプロイされると API が全滅するので、Path 設定を先に済ませる</li>
<li>デプロイ直後は数秒〜十数秒、変更が全世界のエッジサーバーに伝播しきっていないことがある。
すぐにアクセスして 404 が出ても、少し待ってから再確認する</li>
</ul>
```

## 追加レビュー: [6] 末尾への追記だけで十分か

`[6]` 末尾への追記を書いた後、他に資料内で影響を受ける箇所がないか改めてサブエージェントによる客観チェックを行った。結果、以下の対応を行った。

| # | 候補 | 判断 | 対応 |
|---|---|---|---|
| 1 | `[3] Day 1 フロントデプロイ`に「Workers Buildsは`[6]`まで待つこと」を追記 | **見送り**。資料は`[6]`より前でGit連携に一切言及しておらず、参加者は資料の順番通りに小分けで進める前提のため、先取りして事故る可能性は低いと判断 | 変更なし |
| 2 | `s07 Git ブランチ（dev→main）`に、Production branch=mainの場合の注記を追加 | **採用**。「先にmainへマージ→その後SonarCloud解析」という現行の運用だと、解析結果（修正点）が出るのはマージ後になる。手動デプロイなら「マージ」と「本番公開」は別行動だが、自動デプロイだと**マージした瞬間に未解析・未修正のコードが公開される**、という新しいリスクが生じるため | `flow.html` の `s07` に注記を追加済み |
| 3 | `facilitator-guide.md` のリカバリー節に、Workers Builds特有の障害（Root directory未設定→API全滅）への対処法を追加 | **採用**。実際に検証中に遭遇した障害そのものであり、講師が遭遇したときに対応できるよう、症状・原因・見分け方・復旧手順を詳しめに記載 | `facilitator-guide.md` に追記済み |
| 4 | 後片付け表に、Cloudflareの GitHub App（Workers Builds連携）の権限解除手順を追加 | **採用**。SonarCloudのGitHub App権限解除は既に書かれているのに、同種のCloudflare連携の後片付けが抜けていたため | `flow.html` の後片付け表に行を追加済み |

## 次のアクション

- [x] `flow.html` の `[6]` 末尾に Workers Builds の発展セクションを追加
- [x] `flow.html` の `s07`（Git ブランチ）に、Production branch=main の場合の自動デプロイ注記を追加
- [x] `flow.html` の後片付け表に、Cloudflare Git連携の権限解除手順を追加
- [x] `facilitator-guide.md` のリカバリー節に、Workers Builds特有のトラブル対処法を追加
- [ ] 差分を確認し、問題なければコミットして PR を作成する
