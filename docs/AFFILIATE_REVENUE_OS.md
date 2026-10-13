# INTIMETRY Affiliate Revenue OS

Owner decision: revenue-first editorial, without manipulative monetization or unlicensed media use.

## Release checklist
1. **Confirm** approved publishing domain for DMM/FANZA and myfans. An affiliate account alone is not media approval.
2. **Confirm** each offer's commission, time window, approval conditions and usage restrictions.
3. **Confirm** all creative rights; myfans advertising material may require advance platform review.
4. Add an offer to `src/data/affiliateOffers.ts`. The CTA only renders when all guards pass. Never use a non-affiliate plain URL as a substitute.
5. Add `<AffiliateOfferLink offerId="..." placement="article-body" />` to a thoroughly researched article. This component renders nothing until publication gates are true.
6. Check visible PR disclosure, truthful comparisons, no unauthorized adult imagery, and no minors.
7. Review screenshots and search indexing for suitability of mixed general/adult content; consider isolated subdomain when appropriate.
8. Check GA4 only records `offer_id`, `provider`, `placement` on `affiliate_outbound_click`. Do not send diagnosis, sexuality, consultation text or user IDs.
9. Build and test with `npm run verify` before PR merge. Manually QA both mobile and desktop.
10. Revenue reporting uses **approved** payouts and effective RPM (= approved commission / pageviews × 1000), with spend, workflow hours, and reversals shown separately.

## First editorial clusters
- FANZA/myfans comparison: feature differences, fees and buyer precautions (verify official pages and terms).
- Reader guides: payment methods, subscriptions, cancellations and privacy.
- Genre or creator guides ONLY with publisher-approved advertising and authorized assets.

No reviews claiming first-hand use unless truly verified. No fabricated popularity rankings. Do not publish synthetic unsubstantiated reviews or third-party images without license.

## Go/no-go
Day 30: valid partner/media approvals, indexation, impressions and outbound clicks.
Day 90: evidence of approved commissions, realized RPM and manageable operating cost. Pause spending or pivot if unit economics cannot be evidenced.
