import type { AnswerWeight, RecordedAnswer } from "./types";

// ─── State ────────────────────────────────────────────────────────────────────
export interface SurveyState {
  currentIndex: number;
  answers: RecordedAnswer[];
  phase: "survey" | "done";
}

export const initialSurveyState: SurveyState = {
  currentIndex: 0,
  answers: [],
  phase: "survey",
};

// ─── Actions ──────────────────────────────────────────────────────────────────
export type SurveyAction =
  | {
      type: "ANSWER";
      payload: {
        questionId: string;
        selectedId: string;
        weights: AnswerWeight[];
        totalQuestions: number;
      };
    }
  | { type: "BACK" }
  | { type: "RESET" };

// ─── Reducer ──────────────────────────────────────────────────────────────────
export function surveyReducer(
  state: SurveyState,
  action: SurveyAction,
): SurveyState {
  switch (action.type) {
    case "ANSWER": {
      const { questionId, selectedId, weights, totalQuestions } =
        action.payload;
      const newAnswers: RecordedAnswer[] = [
        ...state.answers,
        { questionId, selectedId, weights },
      ];
      const nextIndex = state.currentIndex + 1;
      return {
        ...state,
        answers: newAnswers,
        currentIndex: nextIndex,
        phase: nextIndex >= totalQuestions ? "done" : "survey",
      };
    }
    case "BACK": {
      if (state.currentIndex <= 0) return state;
      return {
        ...state,
        currentIndex: state.currentIndex - 1,
        answers: state.answers.slice(0, -1),
        phase: "survey",
      };
    }
    case "RESET":
      return initialSurveyState;
    default:
      return state;
  }
}
