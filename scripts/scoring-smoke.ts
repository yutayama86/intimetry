import { QUESTIONS } from '../src/data/questions.ts';
import { calculateScores } from '../src/lib/scoring.ts';

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
console.log('Scoring smoke test passed.');
