import { z } from 'zod';

// ─── Shared primitives ────────────────────────────────────────────────────────

const DimensionSchema = z.enum(['transit', 'density', 'vibe', 'cost', 'climate']);

const AnswerWeightSchema = z.object({
  dimension: DimensionSchema,
  value: z.number().min(0).max(10),
});

// ─── Question schemas ─────────────────────────────────────────────────────────

const ComparisonSideSchema = z.object({
  label: z.string().min(1),
  description: z.string().min(1),
  bgClass: z.string(),
  imageSrc: z.string().optional(),
  weights: z.array(AnswerWeightSchema).min(1),
});

const VisualComparisonSchema = z.object({
  id: z.string().min(1),
  type: z.literal('visual-comparison'),
  prompt: z.string().min(1),
  left: ComparisonSideSchema,
  right: ComparisonSideSchema,
});

const GridOptionSchema = z.object({
  id: z.string().min(1),
  label: z.string().min(1),
  icon: z.string(),
  weights: z.array(AnswerWeightSchema).min(1),
});

const MultiChoiceGridSchema = z.object({
  id: z.string().min(1),
  type: z.literal('multi-choice-grid'),
  prompt: z.string().min(1),
  // Enforces exactly 4 options
  options: z.tuple([GridOptionSchema, GridOptionSchema, GridOptionSchema, GridOptionSchema]),
});

const MiniGameActionSchema = z.object({
  id: z.string().min(1),
  label: z.string().min(1),
  revealText: z.string().min(1),
  weights: z.array(AnswerWeightSchema).min(1),
});

const MiniGameSchema = z.object({
  id: z.string().min(1),
  type: z.literal('mini-game'),
  prompt: z.string().min(1),
  sceneDescription: z.string().min(1),
  actions: z.array(MiniGameActionSchema).min(2),
});

export const QuestionsSchema = z.array(
  z.discriminatedUnion('type', [VisualComparisonSchema, MultiChoiceGridSchema, MiniGameSchema])
);

// ─── City schema ──────────────────────────────────────────────────────────────

export const CitiesSchema = z.array(
  z.object({
    id: z.string().min(1),
    name: z.string().min(1),
    country: z.string().min(1),
    tagline: z.string().min(1),
    accentColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'Must be a 6-digit hex color e.g. #1a2b3c'),
    scores: z.object({
      transit: z.number().min(0).max(10),
      density: z.number().min(0).max(10),
      vibe: z.number().min(0).max(10),
      cost: z.number().min(0).max(10),
      climate: z.number().min(0).max(10),
    }),
  })
);

// ─── Answer schema (for URL decode validation) ────────────────────────────────

const RecordedAnswerSchema = z.object({
  questionId: z.string().min(1),
  selectedId: z.string().min(1),
  weights: z.array(AnswerWeightSchema),
});

export const RecordedAnswersSchema = z.array(RecordedAnswerSchema);
