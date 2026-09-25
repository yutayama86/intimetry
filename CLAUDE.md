# CLAUDE.md — INTIMETRY implementation handoff

This file is the operating context for Claude/Claude Code when modifying this repository.
Read this file first, then `README.md`, `docs/PRODUCT_ROADMAP.md`, and `docs/LAUNCH_QA.md`.

## 1. Product identity

- Product: **INTIMETRY**
- Production: **https://intimetry.com**
- Mission: **「性生活を、もっと豊かに。」**
- Tagline: **「欲求を、わかる言葉に。」**
- Audience: adults 18+
- Positioning: sexual wellbeing / relationship platform, not an adult MBTI clone, not explicit adult entertainment, and not a medical or psychological diagnostic service.

The product should help users:
1. understand their own desires,
2. put difficult-to-discuss issues into words,
3. understand differences with a partner,
4. find a reasonable next action.

## 2. Current MVP scope

Keep the MVP centered on only two primary products unless the user explicitly asks to expand scope.

### MAP
- Route: `/check/`
- 24 questions
- 8 dimensions
- Continuous 0–100 scores
- Separate relatively stable **Preference** dimensions from temporary **NOW** state dimensions
- Answers and individual scores are computed in the browser only
- Do not persist raw answers or individual scores server-side

### TALK
- Route: `/consult/`
- Anonymous consultation for:
  - セックスレス
  - 性欲差
  - マンネリ
  - 誘い方・断られ方
  - 性的な好み・伝え方
  - 身体に関する悩み
  - 出会い・パートナー関係
  - その他
- Nickname and reply email are optional
- Body is required
- Public use of a consultation requires explicit opt-in and later anonymization/editing
- Do not link consultation text to MAP answers or scores
- Medical symptoms should route users toward appropriate professional/medical care

Future phases are described in `docs/PRODUCT_ROADMAP.md`. Do not prematurely implement PAIR / + / PRO / API / INDEX / MATCH without explicit instruction.

## 3. Stack and hosting

- Astro 7
- TypeScript
- GitHub
- Cloudflare Pages
- Cloudflare Pages Functions
- Cloudflare Turnstile
- Resend
- Sakura Internet mailboxes
- GA4
- Google Search Console
- GitHub Actions

Production hosting is **Cloudflare Pages**, not a standalone Cloudflare Worker.

Important:
- The Pages project uses the GitHub integration for deployment.
- Do **not** add `wrangler.toml` back. Cloudflare Dashboard is the source of truth for Pages environment variables and secrets.
- There may be an old/unused Worker named similarly to the project. Do not confuse it with the Pages deployment.

## 4. Key files

- `src/layouts/BaseLayout.astro` — site shell, SEO/meta, JSON-LD, GA4 loader
- `src/pages/check/index.astro` — MAP UI and browser-side flow
- `src/data/questions.ts` — 24 questions and dimension definitions
- `src/lib/scoring.ts` — scoring and recommendations
- `src/lib/analytics.ts` — approved GA4 custom-event wrapper
- `src/pages/consult/index.astro` — anonymous consultation form
- `src/pages/contact/index.astro` — general contact form
- `functions/api/consult.ts` — production consult endpoint
- `functions/api/contact.ts` — production contact endpoint
- `scripts/quality-check.mjs` — launch/build assertions
- `docs/PRODUCT_ROADMAP.md` — product/revenue roadmap
- `docs/LAUNCH_QA.md` — launch verification state

## 5. Privacy and safety invariants

These are non-negotiable unless the user explicitly changes product policy after considering implications.

- Do not send MAP answers or individual scores to GA4.
- Do not send consultation free text to GA4.
- Do not send sensitive sexual details as analytics parameters.
- Do not store MAP answers or individual MAP scores server-side in the MVP.
- Do not claim the MAP is medically or psychologically validated.
- Keep the 18+ and non-diagnostic disclosures.
- Consultation data and MAP data remain separate.
- Avoid collecting unnecessary identifying information.
- Do not expose API keys, Turnstile secrets, private DKIM keys, or mailbox passwords in code, commits, logs, or chat output.

Approved GA4 event names:
- `diagnosis_start`
- `diagnosis_complete`
- `result_share`
- `recommendation_click`
- `contact_submit`
- `consult_submit`

## 6. Forms and anti-abuse

Both forms use:
- application/x-www-form-urlencoded
- max request size 24 KB
- honeypot field
- origin allowlist via `ALLOWED_ORIGINS`
- server-side Turnstile verification
- Resend for outbound transactional mail

Turnstile actions:
- contact form: `contact`
- consultation form: `consult`

Do not weaken origin validation, Turnstile verification, size checks, or input validation without a specific reason.

## 7. Production mail architecture

Website and DNS remain on Cloudflare. Mailboxes are on Sakura Internet. Transactional form mail is sent through Resend.

Mailboxes:
- `hello@intimetry.com` — general/human address
- `contact@intimetry.com` — contact form destination
- `consult@intimetry.com` — anonymous consultation destination
- `noreply@intimetry.com` — system-use mailbox exists, but current form sender should use `hello@`

Current intended Pages values:
- `CONTACT_FROM=INTIMETRY <hello@intimetry.com>`
- `CONTACT_TO=contact@intimetry.com`
- `CONSULT_TO=consult@intimetry.com`

Cloudflare DNS currently includes the production website records plus mail records for Sakura and Resend.
MX / SPF / DKIM / DMARC were configured and production receiving tests succeeded.

Do **not** remove existing Resend DNS records when adjusting Sakura mail DNS. The two systems coexist.

## 8. Cloudflare Pages environment

Dashboard is the source of truth.

Public/build-time:
- `PUBLIC_SITE_URL=https://intimetry.com`
- `PUBLIC_GA4_ID` — optional override; current code has production fallback
- `PUBLIC_TURNSTILE_SITE_KEY`

Runtime:
- `CONTACT_FROM`
- `ALLOWED_ORIGINS=https://intimetry.com`

Secrets:
- `RESEND_API_KEY`
- `CONTACT_TO`
- `CONSULT_TO`
- `TURNSTILE_SECRET_KEY`

Never commit secret values.

## 9. GA4 status

Production measurement ID:
- `G-93GRSHCET0`

Current implementation:
- `src/layouts/BaseLayout.astro` loads `gtag.js`
- If `PUBLIC_GA4_ID` is absent, production falls back to `G-93GRSHCET0`
- CI checks that the production build contains the measurement ID and gtag loader

Recent verification:
- Tag Assistant detected the correct Google tag
- `gtag/js?id=G-93GRSHCET0` returned HTTP 200 in Chrome
- During one debugging session, no `collect` request was visible
- Therefore **do not assume GA4 collection is fully resolved yet**. Verify realtime/page_view before declaring analytics complete.

If touching analytics, preserve the sensitive-data restrictions above.

## 10. Search / SEO

- Canonical production origin: `https://intimetry.com`
- `robots.txt` references the sitemap
- Sitemap index: `https://intimetry.com/sitemap-index.xml`
- Core sitemap generation is handled by `@astrojs/sitemap`
- `/contact/thanks/` is excluded if present

Do not create duplicate canonical hosts or switch canonical to `www`.

## 11. Build and QA workflow

Before proposing a merge, run:

```bash
npm install
npm run verify
```

`npm run verify` currently covers:
- smoke test
- Astro check
- Pages Functions TypeScript check
- Astro build
- launch quality checks

For repository work:
1. read current code/docs first,
2. create a branch,
3. make the smallest coherent change,
4. run/confirm `npm run verify`,
5. open a PR,
6. merge only after checks pass,
7. confirm the main-branch GitHub Actions run,
8. when relevant, verify the production behavior.

Avoid large speculative rewrites.

## 12. Product/UX rules

- Maintain the current dark, restrained, editorial visual direction unless explicitly asked to redesign.
- Keep language adult, calm, non-graphic, and non-diagnostic.
- MAP results should describe tendencies and next actions, not fixed identities or “normal/abnormal” judgments.
- PAIR, future compatibility features, and recommendations must frame differences as conversation inputs rather than a single compatibility verdict.
- Advertising/affiliate recommendations must be clearly disclosed and should not be ranked solely by payout.

## 13. Cost rule

Prefer existing/free infrastructure and free-tier-compatible solutions.
Do not add a new paid SaaS, subscription, or usage-based service without asking the user first.

## 14. When receiving a new modification request

Before coding:
- inspect the relevant existing files,
- check whether the request conflicts with the privacy invariants or MVP scope,
- preserve production mail/forms/analytics,
- state any migration or environment-variable change that the user must perform manually.

After coding:
- summarize changed files,
- report verification status,
- identify any required Cloudflare/GA4/GSC manual step,
- do not claim production is fixed until it has actually been verified.
