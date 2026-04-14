// ─── Scoring dimensions ───────────────────────────────────────────────────────
export type Dimension = 'transit' | 'density' | 'vibe' | 'cost' | 'climate';

export type DimensionVector = Record<Dimension, number>; // values 0–10

// ─── Question types ───────────────────────────────────────────────────────────
export type QuestionType = 'visual-comparison' | 'multi-choice-grid' | 'mini-game';

export interface AnswerWeight {
  dimension: Dimension;
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
  bgClass: string; // Tailwind bg class for placeholder
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
  icon: string; // emoji
  weights: AnswerWeight[];
}

export interface MultiChoiceGridQuestion extends BaseQuestion {
  type: 'multi-choice-grid';
  options: [GridOption, GridOption, GridOption, GridOption]; // exactly 4
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
