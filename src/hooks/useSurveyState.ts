'use client';

import { useReducer, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { surveyReducer, initialSurveyState } from '@/lib/survey-reducer';
import type { Question, AnswerWeight } from '@/lib/types';

export function useSurveyState(questions: Question[]) {
  const [state, dispatch] = useReducer(surveyReducer, initialSurveyState);
  const router = useRouter();

  useEffect(() => {
    if (state.phase === 'done') {
      const encoded = btoa(JSON.stringify(state.answers));
      router.push(`/results?a=${encoded}`);
    }
  }, [state.phase, state.answers, router]);

  const handleAnswer = (questionId: string, selectedId: string, weights: AnswerWeight[]) => {
    dispatch({
      type: 'ANSWER',
      payload: { questionId, selectedId, weights, totalQuestions: questions.length },
    });
  };

  const goBack = () => dispatch({ type: 'BACK' });
  const reset  = () => dispatch({ type: 'RESET' });

  return {
    currentQuestion: questions[state.currentIndex] ?? null,
    currentIndex: state.currentIndex,
    totalQuestions: questions.length,
    answers: state.answers,
    handleAnswer,
    goBack,
    reset,
  };
}
