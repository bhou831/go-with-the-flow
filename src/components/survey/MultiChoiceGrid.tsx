'use client';

import Image from 'next/image';
import { motion } from 'framer-motion';
import type { MultiChoiceGridQuestion, AnswerWeight, GridOption } from '@/lib/types';

interface Props {
  question: MultiChoiceGridQuestion;
  onAnswer: (selectedId: string, weights: AnswerWeight[]) => void;
}

const containerVariants = {
  animate: {
    transition: { staggerChildren: 0.07 },
  },
};

const cardVariants = {
  initial: { opacity: 0, y: 24 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.35, ease: 'easeOut' as const } },
  exit: { opacity: 0, y: -16, transition: { duration: 0.2 } },
};

function OptionMedia({ option }: { option: GridOption }) {
  if (option.image) {
    return (
      <div className="relative w-full h-24 rounded-lg overflow-hidden">
        <Image src={option.image} alt={option.label} fill className="object-cover" />
      </div>
    );
  }
  if (option.icon) {
    return (
      <span className="text-4xl" role="img" aria-label={option.label}>
        {option.icon}
      </span>
    );
  }
  return null;
}

export default function MultiChoiceGrid({ question, onAnswer }: Props) {
  const isThree = question.options.length === 3;

  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-6 py-12">
      <div className="w-full max-w-md">
        <p className="text-sm font-medium text-stone-400 uppercase tracking-widest mb-2 text-center">
          Pick one
        </p>
        <h2 className="text-2xl font-bold text-stone-900 text-center mb-10">
          {question.prompt}
        </h2>

        <motion.div
          className={`grid gap-4 ${isThree ? 'grid-cols-3' : 'grid-cols-2'}`}
          variants={containerVariants}
          initial="initial"
          animate="animate"
        >
          {question.options.map((option) => (
            <motion.button
              key={option.id}
              variants={cardVariants}
              whileHover={{ y: -4, boxShadow: '0 12px 32px rgba(0,0,0,0.12)' }}
              whileTap={{ scale: 0.96 }}
              onClick={() => onAnswer(option.id, option.weights)}
              aria-label={`Choose ${option.label}`}
              className="flex flex-col items-center justify-center gap-3 p-4
                         bg-white border-2 border-stone-100 rounded-2xl
                         cursor-pointer transition-colors duration-150
                         hover:border-stone-300 focus-visible:outline-none
                         focus-visible:ring-2 focus-visible:ring-stone-900 focus-visible:ring-offset-2"
            >
              <OptionMedia option={option} />
              <span className="font-semibold text-stone-800 text-sm text-center leading-snug">
                {option.label}
              </span>
            </motion.button>
          ))}
        </motion.div>
      </div>
    </div>
  );
}
