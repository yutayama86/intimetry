import type { Dimension } from '../data/questions';
import type { Scores } from './scoring';

// コードの並び順。変更すると既存コードの意味が変わるため、変えるときは VERSION を上げる。
export const PAIR_DIMENSIONS: Dimension[] = [
  'novelty',
  'intimacy',
  'initiative',
  'desired',
  'openness',
  'satisfaction',
  'boredom',
  'intensity',
];

const VERSION = 1;
const ALPHABET = '0123456789ABCDEFGHJKMNPQRSTVWXYZ';
const CODE_LENGTH = 16;

export type DecodeResult =
  | { ok: true; scores: Scores }
  | { ok: false; reason: 'empty' | 'format' | 'checksum' | 'version' };

function checksum(bytes: number[]): number {
  let value = 0;
  bytes.forEach((byte, index) => {
    value = (value * 31 + byte + index) & 0xff;
  });
  return value;
}

export function encodePairCode(scores: Scores): string {
  const body = [VERSION, ...PAIR_DIMENSIONS.map((dimension) => Math.max(0, Math.min(100, Math.round(scores[dimension]))))];
  const bytes = [...body, checksum(body)];
  const bits = bytes.map((byte) => byte.toString(2).padStart(8, '0')).join('');
  let code = '';
  for (let i = 0; i < bits.length; i += 5) code += ALPHABET[parseInt(bits.slice(i, i + 5), 2)];
  return code.match(/.{1,4}/g)!.join('-');
}

function normalize(input: string): string {
  return input
    .normalize('NFKC')
    .toUpperCase()
    .replace(/[\s\-‐‑–—ー_]/g, '')
    .replace(/O/g, '0')
    .replace(/[IL]/g, '1');
}

export function decodePairCode(input: string): DecodeResult {
  const code = normalize(input);
  if (!code) return { ok: false, reason: 'empty' };
  if (code.length !== CODE_LENGTH || [...code].some((char) => !ALPHABET.includes(char))) {
    return { ok: false, reason: 'format' };
  }
  const bits = [...code].map((char) => ALPHABET.indexOf(char).toString(2).padStart(5, '0')).join('');
  const bytes: number[] = [];
  for (let i = 0; i < bits.length; i += 8) bytes.push(parseInt(bits.slice(i, i + 8), 2));
  const body = bytes.slice(0, -1);
  if (checksum(body) !== bytes[bytes.length - 1]) return { ok: false, reason: 'checksum' };
  if (body[0] !== VERSION) return { ok: false, reason: 'version' };
  const values = body.slice(1);
  if (values.some((value) => value > 100)) return { ok: false, reason: 'checksum' };
  return {
    ok: true,
    scores: Object.fromEntries(PAIR_DIMENSIONS.map((dimension, index) => [dimension, values[index]])) as Scores,
  };
}

export type GapLevel = 'close' | 'some' | 'large';

export type PairRow = {
  dimension: Dimension;
  mine: number;
  partner: number;
  gap: number;
  level: GapLevel;
};

export function gapLevel(gap: number): GapLevel {
  if (gap < 15) return 'close';
  if (gap < 35) return 'some';
  return 'large';
}

// 総合点や「相性」は出さない。項目ごとの差だけを返す。
export function comparePair(mine: Scores, partner: Scores): PairRow[] {
  return PAIR_DIMENSIONS.map((dimension) => {
    const gap = Math.abs(mine[dimension] - partner[dimension]);
    return { dimension, mine: mine[dimension], partner: partner[dimension], gap, level: gapLevel(gap) };
  });
}

export const PAIR_ASKS: Record<Dimension, string> = {
  novelty: '新しいことを試すのと、いつもの安心感と、今はどちらが心地いい？',
  intimacy: 'どんなときに、気持ちがつながっていると感じる？',
  initiative: '誘ったり提案したりするのは、どちらから・どんな形だと楽？',
  desired: 'どんなふうに求められると、大切にされていると感じる？',
  openness: '言いにくいことは、どんな伝え方なら話しやすい？',
  satisfaction: '今の二人の時間で、続けたいことと、増やしたいことは？',
  boredom: 'いつもの流れのうち、安心できるものと、少し変えたいものは？',
  intensity: '今の体調や忙しさの中で、無理のないペースはどのくらい？',
};

export const GAP_TEXT: Record<GapLevel, string> = {
  close: '近い傾向です。共通点として話しやすい部分です。',
  some: '少し違いがあります。お互いの感じ方を聞いてみる材料になります。',
  large: '違いが大きめです。どちらが正しいかではなく、何が心地いいかを聞き合う入口にしてみてください。',
};
