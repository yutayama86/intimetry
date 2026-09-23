export type AnalyticsEvent =
  | 'diagnosis_start'
  | 'diagnosis_complete'
  | 'result_share'
  | 'recommendation_click'
  | 'contact_submit'
  | 'consult_submit';

export function track(event: AnalyticsEvent, params: Record<string, string | number | boolean> = {}) {
  if (typeof window === 'undefined') return;
  const w = window as Window & { gtag?: (...args: unknown[]) => void };
  // 診断回答値・相談本文・自由記述・個別スコアは送らない。
  w.gtag?.('event', event, params);
}
