import type { Dimension, Question } from '../data/questions';

export type Scores = Record<Dimension, number>;
export type Recommendation = { id: string; title: string; body: string };

export function calculateScores(questions: Question[], answers: Record<string, number>): Scores {
  const sums = new Map<Dimension, number>();
  const counts = new Map<Dimension, number>();

  for (const q of questions) {
    const raw = answers[q.id];
    if (!Number.isFinite(raw) || raw < 1 || raw > 5) continue;
    const value = q.reverse ? 6 - raw : raw;
    sums.set(q.dimension, (sums.get(q.dimension) || 0) + value);
    counts.set(q.dimension, (counts.get(q.dimension) || 0) + 1);
  }

  const dimensions: Dimension[] = [
    'novelty', 'intimacy', 'initiative', 'desired', 'openness',
    'satisfaction', 'boredom', 'intensity',
  ];

  return Object.fromEntries(dimensions.map((dimension) => {
    const count = counts.get(dimension) || 0;
    if (count === 0) return [dimension, 0];
    const avg = (sums.get(dimension) || 0) / count;
    return [dimension, Math.round(((avg - 1) / 4) * 100)];
  })) as Scores;
}

export function preferenceSummary(scores: Scores, labels: Record<Dimension, { short: string; kind: 'preference' | 'state' }>) {
  const prefs = (Object.keys(labels) as Dimension[])
    .filter((d) => labels[d].kind === 'preference')
    .sort((a, b) => scores[b] - scores[a]);
  const top = prefs[0];
  const second = prefs[1];
  const phrases: Partial<Record<Dimension, string>> = {
    novelty: '変化や新鮮さを取り入れることで気持ちが動きやすい',
    intimacy: '気持ちのつながりや安心感が満足度に結びつきやすい',
    initiative: '自分からきっかけを作ることが比較的しやすい',
    desired: '相手から求められる感覚を大切にしやすい',
    openness: '希望や違和感を言葉にすることが比較的しやすい',
  };
  return `今は「${labels[top].short}」と「${labels[second].short}」が相対的に強め。${phrases[top] || ''}傾向が見えています。`;
}

export function buildRecommendations(scores: Scores): Recommendation[] {
  const recs: Recommendation[] = [];
  if (scores.boredom >= 65 || scores.novelty >= 70) {
    recs.push({ id: 'freshness', title: '「新しいこと」を1つだけ増やす', body: '大きく変えるより、いつもと違う場所・時間・会話テーマを1つ試すところから。' });
  }
  if (scores.openness <= 40) {
    recs.push({ id: 'language', title: '言いにくいことを“希望”として伝える', body: '不満の指摘ではなく「こういう時間が増えると嬉しい」と未来形にしてみる。' });
  }
  if (scores.desired >= 70) {
    recs.push({ id: 'desired', title: '「求められたい」を行動に翻訳する', body: '何をされると「大切にされている」と感じるのか、具体的な行動を3つ書き出す。' });
  }
  if (scores.intimacy >= 70) {
    recs.push({ id: 'closeness', title: '親密さを“夜”だけに限定しない', body: '深い会話、ハグ、二人の時間など、つながりを感じる接点を日常側にも置く。' });
  }
  if (scores.satisfaction <= 40) {
    recs.push({ id: 'checkin', title: '満たされていない点を1つに絞る', body: '全部を解決しようとせず、今もっとも気になるズレを一つだけ言語化する。強い苦痛や安全上の問題がある場合は専門家への相談も検討してください。' });
  }
  if (scores.intensity <= 35) {
    recs.push({ id: 'low-intensity', title: '欲求を無理に高めようとしない', body: '疲労、ストレス、関係性、体調などの影響もあります。今の低さ自体を「異常」と決めつけないことが出発点です。' });
  }
  if (recs.length < 3) {
    recs.push({ id: 'conversation', title: '相手のMAPを推測しない', body: '自分の結果を正解として押しつけず、相手は何を大切にしているかを一度聞いてみる。' });
  }
  if (recs.length < 3) {
    recs.push({ id: 'journal', title: '1週間だけ“満たされた瞬間”を記録する', body: 'どんな場面で安心・刺激・親密さを感じたかをメモすると、自分の傾向が具体化します。' });
  }
  return recs.slice(0, 3);
}
