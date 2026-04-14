'use client';

import { useRef } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useSurveyState } from '@/hooks/useSurveyState';
import ProgressBar from './ProgressBar';
import VisualComparison from './VisualComparison';
import MultiChoiceGrid from './MultiChoiceGrid';
import ElevatorMiniGame from './ElevatorMiniGame';
import type { Question, AnswerWeight, VisualComparisonQuestion, MultiChoiceGridQuestion, ElevatorMiniGameQuestion } from '@/lib/types';

// dir: 1 = forward (answer), -1 = backward (back button)
const questionTransitionVariants = {
  initial: (dir: number) => ({ opacity: 0, x: dir * 40 }),
  animate: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.38, ease: [0.25, 0.46, 0.45, 0.94] as const },
  },
  exit: (dir: number) => ({
    opacity: 0,
    x: dir * -40,
    transition: { duration: 0.22, ease: 'easeIn' as const },
  }),
};

interface SurveyContainerProps {
  questions: Question[];
}

// Exhaustiveness helper — TypeScript will error here if a new question type is added
// to the Question union but not handled in renderQuestion below.
function assertNever(x: never): never {
  throw new Error(`Unhandled question type: ${(x as { type: string }).type}`);
}

function renderQuestion(question: Question, onAnswer: (id: string, weights: AnswerWeight[]) => void) {
  switch (question.type) {
    case 'visual-comparison':
      return <VisualComparison question={question as VisualComparisonQuestion} onAnswer={onAnswer} />;
    case 'multi-choice-grid':
      return <MultiChoiceGrid question={question as MultiChoiceGridQuestion} onAnswer={onAnswer} />;
    case 'mini-game':
      return <ElevatorMiniGame question={question as ElevatorMiniGameQuestion} onAnswer={onAnswer} />;
    default:
      return assertNever(question);
  }
}

export default function SurveyContainer({ questions }: SurveyContainerProps) {
  const { currentQuestion, currentIndex, totalQuestions, handleAnswer, goBack } =
    useSurveyState(questions);

  // Track nav direction so the slide animation matches movement direction
  const direction = useRef(1);

  if (!currentQuestion) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-stone-400">Loading your results…</p>
      </div>
    );
  }

  const onAnswer = (selectedId: string, weights: AnswerWeight[]) => {
    direction.current = 1;
    handleAnswer(currentQuestion.id, selectedId, weights);
  };

  const onBack = () => {
    direction.current = -1;
    goBack();
  };

  return (
    <div className="min-h-screen flex flex-col">
      <ProgressBar current={currentIndex} total={totalQuestions} />

      {/* Back button — visible from question 2 onward */}
      <AnimatePresence>
        {currentIndex > 0 && (
          <motion.button
            key="back-btn"
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0, transition: { duration: 0.2 } }}
            exit={{ opacity: 0, x: -8, transition: { duration: 0.15 } }}
            onClick={onBack}
            aria-label="Go back to previous question"
            className="fixed top-6 left-5 z-50 flex items-center gap-1.5
                       text-stone-400 hover:text-stone-100
                       text-xs font-medium tracking-wide
                       transition-colors duration-150
                       focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-stone-400"
          >
            <svg
              width="16" height="16" viewBox="0 0 16 16" fill="none"
              stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M10 12L6 8l4-4" />
            </svg>
            Back
          </motion.button>
        )}
      </AnimatePresence>

      <AnimatePresence mode="wait" custom={direction.current} initial={false}>
        <motion.div
          key={currentQuestion.id}
          custom={direction.current}
          variants={questionTransitionVariants}
          initial="initial"
          animate="animate"
          exit="exit"
          className="flex-1 flex flex-col"
        >
          {renderQuestion(currentQuestion, onAnswer)}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
