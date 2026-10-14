/**
 * INTIMETRY affiliate offer registry.
 *
 * No links are live until the advertiser approves the exact publishing property,
 * all creative rights and pre-publication review (if applicable) are cleared,
 * and an operator explicitly marks the offer approved.
 *
 * Never attach sexual preference answers, consultation text, personal identifiers,
 * or other sensitive attributes to outbound URLs or analytics events.
 */
export type AffiliateProvider = 'dmm' | 'fanza' | 'myfans' | 'other';
export type OfferApproval = 'research' | 'applied' | 'approved' | 'paused' | 'rejected';

export interface AffiliateOffer {
  id: string;
  provider: AffiliateProvider;
  name: string;
  landingUrl: string | null;
  mediaApproved: boolean;
  approval: OfferApproval;
  creativeApproved: boolean;
  requiresPrePublicationReview: boolean;
  publicationReviewed: boolean;
  disclosure: 'PR';
  commissionNote: string;
  verifiedAt: string | null;
}

export const affiliateOffers: ReadonlyArray<AffiliateOffer> = [
  {
    id: 'fanza-pending',
    provider: 'fanza',
    name: 'FANZA — 審査・案件調査中',
    landingUrl: null,
    mediaApproved: false,
    approval: 'research',
    creativeApproved: false,
    requiresPrePublicationReview: false,
    publicationReviewed: false,
    disclosure: 'PR',
    commissionNote: '未確認。推定報酬を確定金額として表示しない。',
    verifiedAt: null,
  },
  {
    id: 'myfans-pending',
    provider: 'myfans',
    name: 'myfans — 媒体承認済み・個別案件確認中',
    landingUrl: null,
    mediaApproved: true,
    approval: 'research',
    creativeApproved: false,
    requiresPrePublicationReview: true,
    publicationReviewed: false,
    disclosure: 'PR',
    commissionNote: '2026-10-14、公式管理画面でサイト・X媒体が有効と確認。個別案件・素材の承認は別途必要。',
    verifiedAt: '2026-10-14',
  },
];

export function getPublishableAffiliateOffer(id: string): AffiliateOffer | null {
  const offer = affiliateOffers.find((entry) => entry.id === id);
  if (!offer || offer.approval !== 'approved' || !offer.mediaApproved ||
      !offer.creativeApproved || !offer.landingUrl) return null;
  if (offer.requiresPrePublicationReview && !offer.publicationReviewed) return null;
  try {
    const parsed = new URL(offer.landingUrl);
    if (parsed.protocol !== 'https:') return null;
  } catch {
    return null;
  }
  return offer;
}
