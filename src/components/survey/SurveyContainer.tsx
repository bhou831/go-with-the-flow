'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { useSurveyState } from '@/hooks/useSurveyState';
import ProgressBar from './ProgressBar';
import VisualComparison from './VisualComparison';
import MultiChoiceGrid from './MultiChoiceGrid';
import ElevatorMiniGame from './ElevatorMiniGame';
import type { Question, AnswerWeight } from '@/lib/types';

const questionTransitionVariants = {
  initial: { opacity: 0, x: 40 },
  animate: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.38, ease: [0.25, 0.46, 0.45, 0.94] as const },
  },
  exit: {
    opacity: 0,
    x: -40,
    transition: { duration: 0.22, ease: 'easeIn' as const },
  },
};

interface SurveyContainerProps {
  questions: Question[];
}

export default function SurveyContainer({ questions }: SurveyContainerProps) {
  const { currentQuestion, currentIndex, totalQuestions, handleAnswer } =
    useSurveyState(questions);

  if (!currentQuestion) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-stone-400">Loading your results…</p>
      </div>
    );
  }

  const onAnswer = (selectedId: string, weights: AnswerWeight[]) => {
    handleAnswer(currentQuestion.id, selectedId, weights);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <ProgressBar current={currentIndex} total={totalQuestions} />

      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={currentQuestion.id}
          variants={questionTransitionVariants}
          initial="initial"
          animate="animate"
          exit="exit"
          className="flex-1 flex flex-col"
        >
          {currentQuestion.type === 'visual-comparison' && (
            <VisualComparison question={currentQuestion} onAnswer={onAnswer} />
          )}
          {currentQuestion.type === 'multi-choice-grid' && (
            <MultiChoiceGrid question={currentQuestion} onAnswer={onAnswer} />
          )}
          {currentQuestion.type === 'mini-game' && (
            <ElevatorMiniGame question={currentQuestion} onAnswer={onAnswer} />
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
