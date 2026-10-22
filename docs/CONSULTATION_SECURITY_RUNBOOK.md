# INTIMETRY: confidential consultation handling

Last reviewed: 2026-10-22. This is an operator runbook, NOT proof that provider settings comply.

## Data flow (from functions/api/consult.ts)
The consultation endpoint accepts a category, optional nickname/email, free-text advice request, consent fields, and a Turnstile response. It emails content via Resend to CONSULT_TO, with optional reply_to. The endpoint's code does not demonstrate the recipient mailbox's retention, access permissions, forwarding rules, provider backups, or erasure.

## Mandatory checks before handling real users at scale
- Confirm recipient and Resend account owners, enforce MFA, tightly scope mailbox access and delegated access, examine auto-forwarding and mailbox rules.
- Set a documented retention/deletion period for both recipient mailbox and provider copies. Document deletion and backup limitations. Do not promise deletion until verified.
- Treat consultation details as confidential; never put message bodies, email addresses, request payloads or API tokens in GitHub issues, analytics events, public logs or AI prompts.
- Verify privacy notice explains purposes, recipients/processors, optional email address, publication choice, handling of sensitive free text, retention and contact/erasure request route. Verify implementation reflects each statement.
- The user-facing `publishConsent=yes` is not permission to publish raw identifying data. Require human redaction/review and verify anonymization and separate clear consent before any public posting.
- Audit Cloudflare Pages env secrets: RESEND_API_KEY, CONSULT_TO, CONTACT_FROM, TURNSTILE_SECRET_KEY, ALLOWED_ORIGINS. Rotate on suspected compromise; never display values.
- Check Resend sending account and inbox logs privately for suspicious access; preserve evidence with minimal personal data.
- Test /api/consult fail-closed on missing env, wrong origin, bad Turnstile, oversized body and malformed data. Avoid submitting real sensitive test details.
- Verify WAF/bot/rate limiting at Cloudflare; set targeted limits to avoid blocking legitimate consultations.
- Configure breach response owner and private contact route, determine applicability of notification duties with legal counsel if incident affects identifiable or sensitive data.

## Incident response
1. Halt optional consultation publishing, preserve confidential audit evidence, assess whether sending/reading still works.
2. Contain access in mailbox, Resend, Cloudflare, and GitHub as needed; revoke compromised keys.
3. Determine affected submissions, timeline, processor locations and scope without copying sensitive messages into public repositories.
4. Evaluate individual/regulatory notices under applicable privacy law with qualified advice.
5. Restore from known good code and verify forms and outbound emails with harmless data.

## Known gaps
Code review alone cannot verify mailbox/Resend retention, recipient account MFA, WAF, analytics ingestion or privacy notice accuracy. Track these until confirmed in provider dashboards.
