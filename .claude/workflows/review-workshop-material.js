export const meta = {
  name: 'review-workshop-material',
  description: 'flow.html を章ごとに一行ずつ精査 → 評価 → 編集の3段階で改善する',
  phases: [
    { title: 'Scout',    detail: 'セクション一覧を取得' },
    { title: 'Review',   detail: '各セクションを一行ずつ精査（並列）' },
    { title: 'Evaluate', detail: '全指摘を fix / watch / ignore に仕分け' },
    { title: 'Edit',     detail: 'fix 判定の指摘を実際に編集' },
  ],
}

const BASE = (args && args.basePath) || '/Users/ha-toge/workshop/workshop1/materials'
const HTML_PATH = `${BASE}/flow.html`
const MD_PATH   = `${BASE}/flow.md`

// ---- スキーマ定義 ----

const SECTION_SCHEMA = {
  type: 'object',
  required: ['sections'],
  properties: {
    sections: {
      type: 'array',
      items: {
        type: 'object',
        required: ['name', 'startLine', 'endLine'],
        properties: {
          name:      { type: 'string' },
          startLine: { type: 'number' },
          endLine:   { type: 'number' },
        },
      },
    },
  },
}

const FINDING_SCHEMA = {
  type: 'object',
  required: ['findings'],
  properties: {
    findings: {
      type: 'array',
      items: {
        type: 'object',
        required: ['section', 'issue', 'suggestion', 'severity'],
        properties: {
          section:    { type: 'string' },
          lineRange:  { type: 'string' },
          issue:      { type: 'string' },
          suggestion: { type: 'string' },
          severity:   { type: 'string', enum: ['high', 'medium', 'low'] },
        },
      },
    },
  },
}

const EVAL_SCHEMA = {
  type: 'object',
  required: ['fix', 'watch', 'ignore'],
  properties: {
    fix: {
      type: 'array',
      items: {
        type: 'object',
        required: ['section', 'issue', 'editInstruction'],
        properties: {
          section:         { type: 'string' },
          lineRange:       { type: 'string' },
          issue:           { type: 'string' },
          editInstruction: { type: 'string' },
        },
      },
    },
    watch:  { type: 'array', items: { type: 'object', required: ['issue'], properties: { issue: { type: 'string' } } } },
    ignore: { type: 'array', items: { type: 'object', required: ['issue'], properties: { issue: { type: 'string' } } } },
  },
}

// ---- Phase 1: Scout ----

phase('Scout')

const scouted = await agent(
  `${HTML_PATH} を Read して、h1・h2 の見出しタグ（article 内）ごとにセクション一覧を返してください。
各セクションの name（見出しテキスト）・startLine・endLine（次の見出しの直前行）を列挙してください。`,
  { schema: SECTION_SCHEMA, label: 'scout', agentType: 'Explore' }
)

const sections = scouted.sections
log(`${sections.length} セクション検出`)

// ---- Phase 2: Review（セクションごとに並列） ----

const reviewResults = await pipeline(
  sections,
  (section) => agent(
    `あなたはワークショップ資料のレビュアーです。

ファイル: ${HTML_PATH}
対象セクション: 「${section.name}」（${section.startLine}〜${section.endLine} 行）

このセクションを Read して、**一行ずつ読み飛ばさず精査**してください。

対象読者: AI を使って SaaS MVP を作る3日間ワークショップ参加者。外部サービス（Cloudflare / Stripe / Clerk / Resend）は初めての人が多い。

確認項目（全行に対して一つずつ検討すること）:
1. 【意味のない数値・段落】意味のない数値（孤立した行番号・ID・断片的な数字）や文脈のない段落・空白ブロックが混入していないか
2. 【対象読者への伝わりやすさ】Claude Code の利用経験はあるが Claude Design・Cloudflare Workers・Stripe・Clerk・Resend は初めての参加者が読んで理解できるか。初出の固有名詞・サービス名・概念に説明がなくて詰まりそうな箇所はないか
3. 【資料としての流れ・体裁】セクション間の順序・導線が自然か。見出しレベル・箇条書き・表・コードブロックなどの体裁が統一されているか。読んでいて流れが分断される箇所はないか
4. 【手順の必要十分性】各章で参加者が実際に手を動かすために必要なステップが揃っているか。逆に不要・重複している手順はないか

問題がない行はスキップしてよいですが、問題がある行・段落は見逃さず findings に入れてください。`,
    {
      schema: FINDING_SCHEMA,
      label:  `review:${section.name}`,
      phase:  'Review',
    }
  )
)

const findings = reviewResults.filter(Boolean).flatMap(r => r.findings)
log(`合計 ${findings.length} 件の指摘を収集`)

// ---- Phase 3: Evaluate ----

phase('Evaluate')

const evaluated = await agent(
  `以下はワークショップ資料（flow.html）のレビュー指摘一覧です。
各指摘を3分類してください:

- fix   : 参加者が当日つまずく可能性が高い / 明らかな誤り・抜け → 今すぐ直す
- watch : 気になるが緊急でない / 好みや方針による
- ignore: すでに対処済み / 変更不要 / 重複

fix には「editInstruction」として「何をどう変えるか」を具体的に書いてください
（編集エージェントが迷わず実行できる粒度で）。

指摘一覧:
${JSON.stringify(findings, null, 2)}`,
  { schema: EVAL_SCHEMA, label: 'evaluate' }
)

log(`fix: ${evaluated.fix.length} 件 / watch: ${evaluated.watch.length} 件 / ignore: ${evaluated.ignore.length} 件`)

// ---- Phase 4: Edit ----

if (evaluated.fix.length > 0) {
  phase('Edit')

  // 同一ファイルへの競合を避けるため、fix アイテムを1件ずつ順番に処理する
  for (let i = 0; i < evaluated.fix.length; i++) {
    const item = evaluated.fix[i]
    await agent(
      `ワークショップ資料を以下の指示に従って編集してください。

HTML ファイル: ${HTML_PATH}
MD ファイル:   ${MD_PATH}

【問題】
${item.issue}

【編集指示】
${item.editInstruction}

手順:
1. 必ず対象ファイルを Read して現在の内容を確認する
2. Edit ツールで変更を適用する
3. HTML と MD の両方に同じ変更が必要な場合は両方編集する
4. 変更が不要と判断した場合はその理由を説明して編集をスキップする`,
      { label: `edit(${i + 1}/${evaluated.fix.length}):${item.section || ''}`, phase: 'Edit' }
    )
  }
}

// ---- 結果サマリー ----

return {
  sectionsReviewed: sections.length,
  totalFindings:    findings.length,
  fix:              evaluated.fix,
  watch:            evaluated.watch,
  ignore:           evaluated.ignore,
}
