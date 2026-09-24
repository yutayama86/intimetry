# INTIMETRY Launch QA

## 自動確認
- [x] Astro / TypeScript build
- [x] Pages Functions type check
- [x] dependency audit (high+)
- [x] scoring boundary test
- [x] required routes exist
- [x] title / meta description
- [x] canonical is https://intimetry.com
- [x] JSON-LD
- [x] robots.txt
- [x] sitemap-index.xml
- [x] sitemap-0.xml core URLs
- [x] placeholder-domain leak check
- [x] 18+ / non-diagnostic disclaimers
- [x] privacy disclosure for consult / Cloudflare processing
- [x] GA4 custom event names present in source
- [x] production form mail send/receive (user verified)

## External setup
- [ ] GA4 property + Web data stream
- [ ] PUBLIC_GA4_ID in Cloudflare Pages
- [ ] Google Search Console domain property
- [ ] sitemap-index.xml submitted in Search Console

## Post-launch observation
- [ ] GA4 realtime page_view
- [ ] GA4 diagnosis_start / diagnosis_complete
- [ ] GA4 consult_submit / contact_submit
- [ ] Search Console ownership verified
- [ ] Search Console sitemap status = Success
- [ ] Search Console first crawl/index coverage check

## Mail production verification
- [x] Resend -> さくらメール `consult@intimetry.com` 受信成功
- [x] Resend -> さくらメール `contact@intimetry.com` 受信成功
- [x] 外部メール -> `consult@intimetry.com` 受信成功
