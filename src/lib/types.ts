// ─── Scoring dimensions ───────────────────────────────────────────────────────
export type Dimension =
  | 'transit'
  | 'safety'
  | 'cost'
  | 'climate'
  | 'nightlife'
  | 'nature'
  | 'culture'
  | 'diversity'
  | 'tech'
  | 'openness'
  | 'balance'
  | 'career'
  | 'aesthetics'
  | 'hustle'
  | 'density'
  | 'wellness'
  | 'pulse';

export type DimensionVector = Record<Dimension, number>; // values 0–10

// ─── Question types ───────────────────────────────────────────────────────────
export type QuestionType = 'visual-comparison' | 'multi-choice-grid' | 'mini-game';

export interface AnswerWeight {
  dimension: string; // loosely typed so legacy question weights don't break at runtime
  value: number; // 0–10
}

export interface RecordedAnswer {
  questionId: string;
  selectedId: string;
  weights: AnswerWeight[];
}

export interface BaseQuestion {
  id: string;
  type: QuestionType;
  prompt: string;
}

// visual-comparison ────────────────────────────────────────────────────────────
export interface ComparisonSide {
  label: string;
  description: string;
  bgClass: string; // Tailwind bg class; used when no image is provided
  image?: string;  // optional image path (overrides bgClass as background)
  weights: AnswerWeight[];
}

export interface VisualComparisonQuestion extends BaseQuestion {
  type: 'visual-comparison';
  left: ComparisonSide;
  right: ComparisonSide;
}

// multi-choice-grid ────────────────────────────────────────────────────────────
export interface GridOption {
  id: string;
  label: string;
  icon?: string;  // emoji (omit when using image)
  image?: string; // image path (overrides icon slot)
  weights: AnswerWeight[];
}

export interface MultiChoiceGridQuestion extends BaseQuestion {
  type: 'multi-choice-grid';
  options: GridOption[]; // 3 or 4 options
}

// mini-game ────────────────────────────────────────────────────────────────────
export interface MiniGameAction {
  id: string;
  label: string;
  revealText: string;
  weights: AnswerWeight[];
}

export interface ElevatorMiniGameQuestion extends BaseQuestion {
  type: 'mini-game';
  sceneDescription: string;
  actions: MiniGameAction[];
}

export type Question =
  | VisualComparisonQuestion
  | MultiChoiceGridQuestion
  | ElevatorMiniGameQuestion;

// ─── City ─────────────────────────────────────────────────────────────────────
export interface City {
  id: string;
  name: string;
  country: string;
  tagline: string;
  accentColor: string; // hex — always set via inline style, never Tailwind class
  scores: DimensionVector;
}
