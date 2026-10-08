import { QUESTIONS } from '../src/data/questions.ts';
import { calculateScores } from '../src/lib/scoring.ts';
import { PAIR_DIMENSIONS, comparePair, decodePairCode, encodePairCode, gapLevel } from '../src/lib/pair.ts';

const maxAnswers = Object.fromEntries(QUESTIONS.map((q) => [q.id, q.reverse ? 1 : 5]));
const minAnswers = Object.fromEntries(QUESTIONS.map((q) => [q.id, q.reverse ? 5 : 1]));
const maxScores = calculateScores(QUESTIONS, maxAnswers);
const minScores = calculateScores(QUESTIONS, minAnswers);

for (const [dimension, score] of Object.entries(maxScores)) {
  if (score !== 100) throw new Error(`Expected ${dimension} max=100, got ${score}`);
}
for (const [dimension, score] of Object.entries(minScores)) {
  if (score !== 0) throw new Error(`Expected ${dimension} min=0, got ${score}`);
}

const assert = (condition: boolean, message: string) => {
  if (!condition) throw new Error(message);
};

// PAIR: コードの往復・正規化・破損検出
const sample = { novelty: 0, intimacy: 100, initiative: 37, desired: 64, openness: 5, satisfaction: 99, boredom: 50, intensity: 12 };
const code = encodePairCode(sample);
assert(/^[0-9A-HJKMNP-TV-Z]{4}(-[0-9A-HJKMNP-TV-Z]{4}){3}$/.test(code), `Unexpected code format: ${code}`);
const decoded = decodePairCode(code);
assert(decoded.ok && PAIR_DIMENSIONS.every((d) => decoded.scores[d] === sample[d]), 'PAIR code round trip failed');
assert(decodePairCode(code.toLowerCase().replaceAll('-', ' ')).ok, 'PAIR code should accept lower case and spaces');
assert(decodePairCode(code.replaceAll('-', '－')).ok, 'PAIR code should accept full-width hyphens');
const maxPair = Object.fromEntries(PAIR_DIMENSIONS.map((d) => [d, 100]));
const minPair = Object.fromEntries(PAIR_DIMENSIONS.map((d) => [d, 0]));
assert(decodePairCode(encodePairCode(maxPair as typeof sample)).ok, 'PAIR max round trip failed');
assert(decodePairCode(encodePairCode(minPair as typeof sample)).ok, 'PAIR min round trip failed');
const emptyResult = decodePairCode('');
assert(!emptyResult.ok && emptyResult.reason === 'empty', 'Empty code should be rejected as empty');
assert(!decodePairCode('ABCD-EFGH').ok, 'Short code should be rejected');
assert(!decodePairCode('UUUU-UUUU-UUUU-UUUU').ok, 'Characters outside the alphabet should be rejected');
const flipped = code.replace(/[0-9A-Z]/, (c) => (c === '0' ? '1' : '0'));
assert(!decodePairCode(flipped).ok, 'A single changed character should be detected');

// PAIR: 差の判定(総合点は出さない)
assert(gapLevel(14) === 'close' && gapLevel(15) === 'some' && gapLevel(34) === 'some' && gapLevel(35) === 'large', 'gapLevel boundaries wrong');
const rows = comparePair(sample, { ...sample, novelty: 40, intimacy: 60 });
assert(rows.length === PAIR_DIMENSIONS.length, 'comparePair should return one row per dimension');
assert(rows[0].gap === 40 && rows[0].level === 'large' && rows[1].gap === 40, 'comparePair gap wrong');
assert(rows[2].gap === 0 && rows[2].level === 'close', 'comparePair identical dimension wrong');

console.log('Scoring smoke test passed.');
