# Claude Code 認証の切り替え手順（サブスク ⇔ API キー）

情シス発行の API キーを試すときなど、Claude Code の認証方式を切り替えるための手順メモ。

> 根拠: 公式ドキュメントに加え、Claude Code v2.1.216 のバイナリ内の認証ロジック
> （`customApiKeyResponses` の取り扱い・`/logout`・`/config` トグル）を直接確認して裏取りした内容。

## 最重要: 切り替えの実体は `customApiKeyResponses`

`ANTHROPIC_API_KEY` を環境変数にセットしても、**それだけでは使われない**。
Claude Code はキーの「使う／使わない」の判断を `~/.claude.json` の
`customApiKeyResponses` に記録し、キー取得ロジックは次のように動く（要点）:

```js
// env の ANTHROPIC_API_KEY (= t) は、approved に入っている時だけ採用される
if (t && customApiKeyResponses.approved.includes(TX(t)))
    return { key: t, source: "ANTHROPIC_API_KEY" };
// ↑を抜けると apiKeyHelper → サブスクの OAuth にフォールバック
```

- `TX(t)` … キーの**末尾 20 文字**（フルキーでもハッシュでもない）
- キーの状態は 3 値:

| 状態 | 意味 | 起動時の挙動 |
|---|---|---|
| `approved` | `approved` 配列に末尾20文字がある | このキーで API 課金（サブスクより優先） |
| `rejected` | `rejected` 配列にある | 無視してサブスクにフォールバック |
| `new` | どちらの配列にも無い | 承認プロンプトを表示して二択を聞く |

ポイント:
- **API に倒す = キーを `approved` に入れること**。env にあるだけ・`new` のままでは使われない。
- **サブスクに倒す = キーを `approved` から外すこと**（`rejected` か `new` にする）。
- `rejected` から消してもすぐ API にはならない。状態が `new` に戻り、次回起動で
  再び承認プロンプトが出るだけ。そこで「使う」を選んで初めて `approved` に入る。

> 補足: 上記は通常の対話起動での挙動。非対話実行（`claude -p ...`）や
> `--bare` / `CLAUDE_CODE_SIMPLE` などの簡易モードでは、承認プロンプトを出さずに
> env のキーをそのまま使う経路が存在する（承認ゲートを通らない）。

> もう一つの保管場所: 上記は env の `ANTHROPIC_API_KEY` の話。`/login` で API キーを
> 直接入力して保存した場合は、`~/.claude.json` の `primaryApiKey`（および macOS Keychain）
> に別途保管され、これは `approved`/`rejected` とは独立している。**`/logout` はこの保存キーを
> 消さない**点に注意（下の C 参照）。env でキーを渡す運用なら基本この保管場所は使われない。

---

## 認証の優先順位

複数の認証情報があると、**上にあるものほど優先**される。

1. クラウドプロバイダの資格情報（Bedrock / Vertex 等）
2. `ANTHROPIC_AUTH_TOKEN` 環境変数（Bearer トークン形式）
3. `ANTHROPIC_API_KEY` 環境変数 … **ただし `approved` に入っている時のみ**採用
4. `apiKeyHelper` スクリプト
5. `CLAUDE_CODE_OAUTH_TOKEN` 環境変数
6. サブスクリプションの OAuth 資格情報（`/login` で保存されるもの）

> 旧メモの「env にキーが残っていると必ずサブスクが遮断される」は不正確だった。
> `ANTHROPIC_API_KEY` は **`approved` の時だけ**サブスクに優先する。未承認（`rejected`/`new`）
> のキーは無視されるので、それ自体はサブスク接続を妨げない。
> （`ANTHROPIC_AUTH_TOKEN` / `CLAUDE_CODE_OAUTH_TOKEN` は承認ゲートが無く、セットされていれば効く点に注意）

出典: https://code.claude.com/docs/en/authentication.md#authentication-precedence

---

## A. サブスクリプション → API キー に切り替える

情シス発行の API キーを使いたいとき。キーを `approved` に入れるのがゴール。

```bash
# 1. API キーを環境変数に設定
#    ※ キーの値はここに直接書かず、シェルに直接入力する。
#      恒久化したい場合のみ ~/.zshrc 等に追記（下の「恒久化」参照）
export ANTHROPIC_API_KEY="sk-ant-xxxxxxxx"   # 情シス発行のキー

# 2. Claude Code を起動
claude
#    状態が new のため「このAPIキーを使うか？」と確認が出る → 「使う」を選ぶと approved に入る

# 3. 認証方式を確認
/status
#    API キー利用になっていればOK
```

### プロンプトが出ない／確実に approved にしたいとき

`/config` の **「Use custom API key」トグル**が最短で確実（env に `ANTHROPIC_API_KEY` が
セットされている時だけ表示される）。ON にすると `approved` に追加＋`rejected` から除去を
1 操作で行う。

過去に `rejected` に入れていて再プロンプトも出したくない場合は、`~/.claude.json` の
`customApiKeyResponses.rejected` から**当該キーの末尾20文字のエントリを削除**すると状態が
`new` に戻り、次回起動で承認プロンプトが再表示される。

### 恒久化したい場合（毎回設定したくないとき）
`~/.zshrc`（zsh の場合）に以下を追記して、新しいシェルを開く:

```bash
export ANTHROPIC_API_KEY="sk-ant-xxxxxxxx"
```

> 秘密情報の扱い: キーをチャットやコードに貼らない。git 管理下のファイルにも書かない。

---

## B. API キー → サブスクリプション に戻す

API キーの検証が終わって、元のサブスク認証に戻すとき。ゴールはキーを `approved` から外すこと。

```bash
# 1. セッション内でログアウト
/logout
#    /logout は OAuth(サブスク) を消すと同時に、customApiKeyResponses.approved を空にし、
#    hasCompletedOnboarding も false に戻す（＝承認済みキーが approved から外れて new になる）

# 2. （任意・推奨）env のキーも消しておくと再プロンプトを避けられる
unset ANTHROPIC_API_KEY
unset ANTHROPIC_AUTH_TOKEN
unset CLAUDE_CODE_OAUTH_TOKEN
#    恒久化していた場合は ~/.zshrc / ~/.bashrc / ~/.profile の export 行も削除し、
#    新しいシェルを開くか source ~/.zshrc で反映させる

# 3. Claude Code を起動してログイン
claude
#    env にキーを残したまま起動した場合は状態が new のため承認プロンプトが出る
#    → 「使わない」を選べば rejected に入り、サブスクにフォールバックする
/login              # ブラウザで claude.ai アカウント（Pro/Max 等）にログイン

# 4. 認証方式を確認
/status
#    サブスクリプションになっていればOK
```

> ポイント: `/logout` が `approved` を空にするので、env のキーを消さなくても
> サブスクに戻せる（未承認キーは無視されるため）。ただし env にキーを残すと毎起動で
> 承認プロンプトが出るので、恒久的にサブスク運用するなら手順2で env からも消すのが楽。

---

## C. うまく切り替わらない／接続が遮断されるとき

まず現状を確認する（値は出さず件数だけ見る）:

```bash
# approved / rejected の件数を確認（キー値そのものは表示しない）
jq '.customApiKeyResponses | {approved:(.approved|length), rejected:(.rejected|length)}' ~/.claude.json

# env にトークン系が残っていないか
env | grep -i anthropic
env | grep -i CLAUDE_CODE_OAUTH
```

対処:

```bash
# サブスクに倒したいのに API が使われる → approved に残っている
#   /logout で approved を空にする、または /config の「Use custom API key」を OFF、
#   あるいは ~/.claude.json の approved から当該エントリ(末尾20文字)を削除

# API に倒したいのに使われない → approved に入っていない（new か rejected）
#   env に ANTHROPIC_API_KEY をセット → /config トグル ON、または起動時プロンプトで承認

# AUTH_TOKEN / OAUTH_TOKEN 系が悪さをしている（承認ゲートが無く必ず効く）
unset ANTHROPIC_AUTH_TOKEN
unset CLAUDE_CODE_OAUTH_TOKEN
#   ~/.zshrc 等の export 行も削除してシェルを開き直す
```

### よくある遮断の原因
- 無効化された API キーが `approved` に入っていて、それが優先採用されている
- 別組織のキーが `approved` で、その組織が無効化（"This organization has been disabled" 等）
- `ANTHROPIC_AUTH_TOKEN` / `CLAUDE_CODE_OAUTH_TOKEN` が env に残っている（承認ゲートが無い）
- `~/.zshrc` の `export` が残っていて `unset` が効いていない
- `/login` で入力・保存した API キー（`primaryApiKey` / macOS Keychain）が残っている
  （`/logout` では消えない。env を unset しても効かない）

### `/login` 保存キー（primaryApiKey / Keychain）を消したいとき
env ではなく `/login` から API キーを入力して保存していた場合、`/logout` では残る。
まず `/status` で現在の認証ソースを確認し、`ANTHROPIC_API_KEY`（env）でも `claude.ai` でも
ない「保存キー」が効いているようなら、`/login` でサブスクに入れ直す。
それでも残る場合は macOS の「キーチェーンアクセス」で Claude Code 関連の項目を削除する。
（迷ったら判断材料として必ず `/status` の表示ソースを見る）

---

## 早見表

| やりたいこと | 操作 |
|---|---|
| 現在の認証方式を見る | `/status`（Claude Code セッション内） |
| approved/rejected の件数を見る | `jq '.customApiKeyResponses \| {approved:(.approved\|length), rejected:(.rejected\|length)}' ~/.claude.json` |
| API に倒す | env に `ANTHROPIC_API_KEY` → `/config` の「Use custom API key」ON（または起動時に承認） |
| サブスクに倒す | `/logout` → `/login`（必要なら env からキーを unset） |
| API 系の環境変数が残っていないか確認 | `env \| grep -i anthropic` |

## 参考ドキュメント
- 認証: https://code.claude.com/docs/en/authentication.md
- 環境変数: https://code.claude.com/docs/en/env-vars.md
- トラブルシュート: https://code.claude.com/docs/en/troubleshoot-install.md
