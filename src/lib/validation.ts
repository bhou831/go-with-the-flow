import { z } from 'zod';

// ─── Shared primitives ────────────────────────────────────────────────────────

// Permissive string so existing question weights don't break while questions are being redesigned
const DimensionSchema = z.string();

const AnswerWeightSchema = z.object({
  dimension: DimensionSchema,
  value: z.number().min(0).max(10),
});

// ─── Question schemas ─────────────────────────────────────────────────────────

const HeaderMediaSchema = z.union([
  z.object({ type: z.literal('animation'), animationId: z.enum(['escalator', 'violin']) }),
  z.object({ type: z.literal('image'), src: z.string().min(1) }),
]);

const ComparisonSideSchema = z.object({
  label: z.string().min(1),
  description: z.string().min(1),
  bgClass: z.string(),
  image: z.string().optional(),
  weights: z.array(AnswerWeightSchema).min(1),
});

const VisualComparisonSchema = z.object({
  id: z.string().min(1),
  type: z.literal('visual-comparison'),
  prompt: z.string().min(1),
  left: ComparisonSideSchema,
  right: ComparisonSideSchema,
  layout: z.enum(['side-by-side', 'stacked', 'card-stack']).optional(),
});

const GridOptionSchema = z.object({
  id: z.string().min(1),
  label: z.string().min(1),
  description: z.string().optional(),
  icon: z.string().optional(),
  image: z.string().optional(),
  imageAspect: z.enum(['landscape', 'square', 'portrait']).optional(),
  weights: z.array(AnswerWeightSchema).min(1),
});

const MultiChoiceGridSchema = z.object({
  id: z.string().min(1),
  type: z.literal('multi-choice-grid'),
  prompt: z.string().min(1),
  options: z.array(GridOptionSchema).min(3).max(4),
  layout: z.enum(['grid', 'single-column', 'card-column']).optional(),
  headerMedia: HeaderMediaSchema.optional(),
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
      transit:    z.number().min(0).max(10),
      safety:     z.number().min(0).max(10),
      cost:       z.number().min(0).max(10),
      climate:    z.number().min(0).max(10),
      nightlife:  z.number().min(0).max(10),
      nature:     z.number().min(0).max(10),
      culture:    z.number().min(0).max(10),
      diversity:  z.number().min(0).max(10),
      tech:       z.number().min(0).max(10),
      openness:   z.number().min(0).max(10),
      balance:    z.number().min(0).max(10),
      career:     z.number().min(0).max(10),
      aesthetics: z.number().min(0).max(10),
      hustle:     z.number().min(0).max(10),
      density:    z.number().min(0).max(10),
      wellness:   z.number().min(0).max(10),
      pulse:      z.number().min(0).max(10),
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
