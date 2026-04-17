import type { RecordedAnswer, City, DimensionVector, Dimension } from './types';

const DIMENSIONS: Dimension[] = [
  'transit', 'safety', 'cost', 'climate', 'nightlife',
  'nature', 'culture', 'diversity', 'tech', 'openness',
  'balance', 'career', 'aesthetics', 'hustle',
  'density', 'wellness', 'pulse',
];

export function buildUserVector(answers: RecordedAnswer[]): {
  vector: DimensionVector;
  coverage: Record<Dimension, number>;
} {
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

  const vector = Object.fromEntries(
    DIMENSIONS.map((d) => [d, count[d] > 0 ? sum[d] / count[d] : 0])
  ) as DimensionVector;

  const coverage = Object.fromEntries(
    DIMENSIONS.map((d) => [d, count[d]])
  ) as Record<Dimension, number>;

  return { vector, coverage };
}

// Computes cosine similarity using only dimensions the user actually expressed a
// preference on (coverage[d] > 0). Untouched dimensions are excluded rather than
// defaulting to a neutral value, which would otherwise dilute the signal across
// all 17 dimensions when most questions only cover 2–4 each.
export function maskedCosineSimilarity(
  a: DimensionVector,
  coverage: Record<Dimension, number>,
  b: DimensionVector
): number {
  const touched = DIMENSIONS.filter((d) => coverage[d] > 0);
  if (touched.length === 0) return 0;
  const dot = touched.reduce((acc, d) => acc + a[d] * b[d], 0);
  const magA = Math.sqrt(touched.reduce((acc, d) => acc + a[d] ** 2, 0));
  const magB = Math.sqrt(touched.reduce((acc, d) => acc + b[d] ** 2, 0));
  if (magA === 0 || magB === 0) return 0;
  return dot / (magA * magB);
}

export function findMatchingCity(
  answers: RecordedAnswer[],
  cities: City[]
): { city: City; userVector: DimensionVector; scores: Record<string, number>; topCities: City[] } {
  const { vector: userVector, coverage } = buildUserVector(answers);
  const scores = Object.fromEntries(
    cities.map((c) => [c.id, maskedCosineSimilarity(userVector, coverage, c.scores)])
  );
  const sorted = Object.entries(scores).sort((a, b) => b[1] - a[1]);
  const topCities = sorted.slice(0, 3).map(([id]) => cities.find((c) => c.id === id)!);
  return { city: topCities[0], userVector, scores, topCities };
}
