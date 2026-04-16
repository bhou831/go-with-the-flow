import type { RecordedAnswer, City, DimensionVector, Dimension } from './types';

const DIMENSIONS: Dimension[] = [
  'transit', 'safety', 'cost', 'climate', 'nightlife',
  'nature', 'culture', 'diversity', 'tech', 'openness',
  'balance', 'career', 'aesthetics', 'hustle',
  'density', 'wellness', 'pulse',
];
const NEUTRAL = 5;

export function buildUserVector(answers: RecordedAnswer[]): DimensionVector {
  const sum: Record<string, number> = Object.fromEntries(DIMENSIONS.map((d) => [d, 0]));
  const count: Record<string, number> = Object.fromEntries(DIMENSIONS.map((d) => [d, 0]));

  for (const answer of answers) {
    for (const w of answer.weights) {
      if (w.dimension in sum) {
        sum[w.dimension] += w.value;
        count[w.dimension] += 1;
      }
    }
  }

  return Object.fromEntries(
    DIMENSIONS.map((d) => [d, count[d] > 0 ? sum[d] / count[d] : NEUTRAL])
  ) as DimensionVector;
}

export function cosineSimilarity(a: DimensionVector, b: DimensionVector): number {
  const dot = DIMENSIONS.reduce((acc, d) => acc + a[d] * b[d], 0);
  const magA = Math.sqrt(DIMENSIONS.reduce((acc, d) => acc + a[d] ** 2, 0));
  const magB = Math.sqrt(DIMENSIONS.reduce((acc, d) => acc + b[d] ** 2, 0));
  if (magA === 0 || magB === 0) return 0;
  return dot / (magA * magB);
}

export function findMatchingCity(
  answers: RecordedAnswer[],
  cities: City[]
): { city: City; userVector: DimensionVector; scores: Record<string, number> } {
  const userVector = buildUserVector(answers);
  const scores = Object.fromEntries(
    cities.map((c) => [c.id, cosineSimilarity(userVector, c.scores)])
  );
  const bestId = Object.entries(scores).sort((a, b) => b[1] - a[1])[0][0];
  return { city: cities.find((c) => c.id === bestId)!, userVector, scores };
}
