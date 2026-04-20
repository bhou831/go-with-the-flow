// Simulate synthetic users through the City Match scoring algorithm to
// measure winner distribution. Run with: node scripts/simulate-matches.mjs
//
// Scoring logic below mirrors src/lib/scoring.ts exactly — keep in sync if
// that file changes.

import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");

const DIMENSIONS = [
  "transit", "safety", "cost", "climate", "nightlife", "nature",
  "culture", "diversity", "tech", "openness", "balance", "career",
  "aesthetics", "hustle", "density", "wellness", "pulse",
];

const USER_MIDPOINT = 5;

function buildUserVector(answers) {
  const sum = Object.fromEntries(DIMENSIONS.map((d) => [d, 0]));
  const count = Object.fromEntries(DIMENSIONS.map((d) => [d, 0]));
  for (const a of answers) {
    for (const w of a.weights) {
      if (w.dimension in sum) {
        sum[w.dimension] += w.value;
        count[w.dimension] += 1;
      }
    }
  }
  const vector = Object.fromEntries(
    DIMENSIONS.map((d) => [d, count[d] > 0 ? sum[d] / count[d] : 0]),
  );
  const coverage = Object.fromEntries(DIMENSIONS.map((d) => [d, count[d]]));
  return { vector, coverage };
}

function computeCityMeans(cities) {
  const means = Object.fromEntries(DIMENSIONS.map((d) => [d, 0]));
  if (cities.length === 0) return means;
  for (const c of cities) {
    for (const d of DIMENSIONS) means[d] += c.scores[d];
  }
  for (const d of DIMENSIONS) means[d] /= cities.length;
  return means;
}

function maskedCosineSimilarity(user, coverage, city, cityMeans) {
  const touched = DIMENSIONS.filter((d) => coverage[d] > 0);
  if (touched.length === 0) return 0;
  let dot = 0, magA = 0, magB = 0;
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

function findMatchingCity(answers, cities, cityMeans) {
  const { vector, coverage } = buildUserVector(answers);
  let bestId = null, bestScore = -Infinity;
  for (const c of cities) {
    const s = maskedCosineSimilarity(vector, coverage, c.scores, cityMeans);
    if (s > bestScore) {
      bestScore = s;
      bestId = c.id;
    }
  }
  return bestId;
}

// --- Question option helpers ---------------------------------------------

function getOptions(question) {
  // multi-choice-grid has `options[]`; visual-comparison has left/right.
  if (question.options) return question.options;
  if (question.left && question.right) return [question.left, question.right];
  throw new Error(`Unknown question shape: ${question.id}`);
}

function randomAnswer(question) {
  const opts = getOptions(question);
  return opts[Math.floor(Math.random() * opts.length)];
}

// Biased picker: weights each option by its score on the target dimension,
// plus a small baseline so every option has a non-zero chance.
function biasedAnswer(question, dimension) {
  const opts = getOptions(question);
  const weights = opts.map((o) => {
    const w = (o.weights || []).find((x) => x.dimension === dimension);
    // Center around 5; an option with value 9 on this dim gets weight 4,
    // an option with value 2 gets -3 (clamped to 0.1 baseline).
    return Math.max(0.1, (w ? w.value : USER_MIDPOINT) - USER_MIDPOINT + 0.1);
  });
  const total = weights.reduce((a, b) => a + b, 0);
  let r = Math.random() * total;
  for (let i = 0; i < opts.length; i++) {
    r -= weights[i];
    if (r <= 0) return opts[i];
  }
  return opts[opts.length - 1];
}

// --- Simulation runners ---------------------------------------------------

function simulate(questions, cities, cityMeans, pickFn, n) {
  const counts = Object.fromEntries(cities.map((c) => [c.id, 0]));
  for (let i = 0; i < n; i++) {
    const answers = questions.map((q) => {
      const opt = pickFn(q);
      return { weights: opt.weights || [] };
    });
    const winner = findMatchingCity(answers, cities, cityMeans);
    if (winner) counts[winner] += 1;
  }
  return counts;
}

function printHistogram(title, counts, cities, n, topN = 15) {
  const sorted = Object.entries(counts).sort((a, b) => b[1] - a[1]);
  const nameById = Object.fromEntries(cities.map((c) => [c.id, c.name]));
  const winners = sorted.filter(([, c]) => c > 0).length;
  const dead = cities.length - winners;
  const topPct = ((sorted[0][1] / n) * 100).toFixed(1);

  console.log(`\n=== ${title} (n=${n}) ===`);
  console.log(`Top ${topN} winners:`);
  for (const [id, c] of sorted.slice(0, topN)) {
    const pct = ((c / n) * 100).toFixed(1).padStart(5);
    const bar = "█".repeat(Math.round((c / sorted[0][1]) * 30));
    console.log(`  ${pct}%  ${bar}  ${nameById[id]}`);
  }
  console.log(
    `\nCoverage: ${winners}/${cities.length} cities won at least once  |  dead cities: ${dead}`,
  );
  const FLAG = topPct > 15 ? "  ⚠ EXCEEDS 15% THRESHOLD" : "";
  console.log(`Top city share: ${topPct}%${FLAG}`);
}

// --- Main ---------------------------------------------------------------

async function main() {
  const questions = JSON.parse(
    await readFile(join(ROOT, "src/data/questions.json"), "utf8"),
  );
  const cities = JSON.parse(
    await readFile(join(ROOT, "src/data/cities.json"), "utf8"),
  );
  const cityMeans = computeCityMeans(cities);

  const N_RANDOM = 10000;
  const N_BIASED = 1000;

  // Mode 1: random users
  const randomCounts = simulate(
    questions, cities, cityMeans, randomAnswer, N_RANDOM,
  );
  printHistogram("RANDOM users", randomCounts, cities, N_RANDOM);

  // Mode 2: biased users per dimension
  console.log("\n\n=== BIASED users (top-5 winners per dimension) ===");
  const nameById = Object.fromEntries(cities.map((c) => [c.id, c.name]));
  for (const dim of DIMENSIONS) {
    const counts = simulate(
      questions, cities, cityMeans,
      (q) => biasedAnswer(q, dim), N_BIASED,
    );
    const sorted = Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);
    const top = sorted
      .map(([id, c]) => `${nameById[id]} (${((c / N_BIASED) * 100).toFixed(0)}%)`)
      .join(", ");
    console.log(`  ${dim.padEnd(11)} → ${top}`);
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
