import type { RecordedAnswer, City, DimensionVector, Dimension } from "./types";

const DIMENSIONS: Dimension[] = [
  "transit",
  "safety",
  "cost",
  "climate",
  "nightlife",
  "nature",
  "culture",
  "diversity",
  "tech",
  "openness",
  "balance",
  "career",
  "aesthetics",
  "hustle",
  "density",
  "wellness",
  "pulse",
];

// Midpoint of the 0–10 weight scale. Question weights are always positive
// (typical range 2–9), so every naive user vector points into the all-positive
// quadrant and gets high cosine similarity with any city that's simply
// above-average across the board. Centering the user vector around 5 turns
// "I said 8 for balance" into a real positive preference and "I said 2 for
// nightlife" into a real negative one.
const USER_MIDPOINT = 5;

export function buildUserVector(answers: RecordedAnswer[]): {
  vector: DimensionVector;
  coverage: Record<Dimension, number>;
} {
  const sum: Record<string, number> = Object.fromEntries(
    DIMENSIONS.map((d) => [d, 0]),
  );
  const count: Record<string, number> = Object.fromEntries(
    DIMENSIONS.map((d) => [d, 0]),
  );

  for (const answer of answers) {
    for (const w of answer.weights) {
      if (w.dimension in sum) {
        sum[w.dimension] += w.value;
        count[w.dimension] += 1;
      }
    }
  }

  const vector = Object.fromEntries(
    DIMENSIONS.map((d) => [d, count[d] > 0 ? sum[d] / count[d] : 0]),
  ) as DimensionVector;

  const coverage = Object.fromEntries(
    DIMENSIONS.map((d) => [d, count[d]]),
  ) as Record<Dimension, number>;

  return { vector, coverage };
}

// Per-dimension mean across a given set of cities. A city's score on a given
// dimension gets centered by this mean so that "7 on safety" (below the global
// city mean ~7.1) no longer looks like a strong positive — only deviations do.
export function computeCityMeans(cities: City[]): DimensionVector {
  const means = Object.fromEntries(
    DIMENSIONS.map((d) => [d, 0]),
  ) as DimensionVector;
  if (cities.length === 0) return means;
  for (const c of cities) {
    for (const d of DIMENSIONS) {
      means[d] += c.scores[d];
    }
  }
  for (const d of DIMENSIONS) {
    means[d] /= cities.length;
  }
  return means;
}

// Mean-centered masked cosine similarity. Only dimensions the user actually
// expressed a preference on (coverage[d] > 0) are included. User values are
// centered around the midpoint of the weight scale; city values are centered
// around the per-dimension mean across all cities. This removes the bias
// toward "uniformly above-average" cities that plain cosine produced.
export function maskedCosineSimilarity(
  user: DimensionVector,
  coverage: Record<Dimension, number>,
  city: DimensionVector,
  cityMeans: DimensionVector,
): number {
  const touched = DIMENSIONS.filter((d) => coverage[d] > 0);
  if (touched.length === 0) return 0;

  let dot = 0;
  let magA = 0;
  let magB = 0;
  for (const d of touched) {
    const a = user[d] - USER_MIDPOINT;
    const b = city[d] - cityMeans[d];
    dot += a * b;
    magA += a * a;
    magB += b * b;
  }
  if (magA === 0 || magB === 0) return 0;
  return dot / (Math.sqrt(magA) * Math.sqrt(magB));
}

export function findMatchingCity(
  answers: RecordedAnswer[],
  cities: City[],
): {
  city: City;
  userVector: DimensionVector;
  scores: Record<string, number>;
  topCities: City[];
} {
  const { vector: userVector, coverage } = buildUserVector(answers);
  const cityMeans = computeCityMeans(cities);
  const scores = Object.fromEntries(
    cities.map((c) => [
      c.id,
      maskedCosineSimilarity(userVector, coverage, c.scores, cityMeans),
    ]),
  );
  const sorted = Object.entries(scores).sort((a, b) => b[1] - a[1]);
  const topCities = sorted
    .slice(0, 3)
    .map(([id]) => cities.find((c) => c.id === id)!);
  return { city: topCities[0], userVector, scores, topCities };
}
