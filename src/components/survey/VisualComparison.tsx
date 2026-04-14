'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import type { VisualComparisonQuestion, AnswerWeight } from '@/lib/types';

interface Props {
  question: VisualComparisonQuestion;
  onAnswer: (selectedId: string, weights: AnswerWeight[]) => void;
}

const panelVariants = (side: 'left' | 'right') => ({
  initial: { opacity: 0, x: side === 'left' ? -60 : 60 },
  animate: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] as const },
  },
  exit: {
    opacity: 0,
    scale: 0.96,
    transition: { duration: 0.25, ease: 'easeIn' as const },
  },
});

export default function VisualComparison({ question, onAnswer }: Props) {
  const [hovered, setHovered] = useState<'left' | 'right' | null>(null);

  const handleClick = (side: 'left' | 'right') => {
    const chosen = side === 'left' ? question.left : question.right;
    onAnswer(side, chosen.weights);
  };

  return (
    <div className="flex flex-col min-h-screen">
      {/* Prompt */}
      <div className="text-center py-8 px-6">
        <p className="text-sm font-medium text-stone-400 uppercase tracking-widest mb-2">
          Choose one
        </p>
        <h2 className="text-2xl font-bold text-stone-900">{question.prompt}</h2>
      </div>

      {/* Panels */}
      <div className="flex flex-1">
        {(['left', 'right'] as const).map((side) => {
          const data = side === 'left' ? question.left : question.right;
          const isHovered = hovered === side;

          return (
            <motion.button
              key={side}
              variants={panelVariants(side)}
              initial="initial"
              animate="animate"
              exit="exit"
              className={`relative flex flex-col items-center justify-center cursor-pointer
                          transition-all duration-300 overflow-hidden
                          ${data.bgClass}
                          ${isHovered ? 'flex-[1.2]' : 'flex-1'}`}
              onMouseEnter={() => setHovered(side)}
              onMouseLeave={() => setHovered(null)}
              onClick={() => handleClick(side)}
              aria-label={`Choose ${data.label}`}
              whileTap={{ scale: 0.98 }}
            >
              {/* Overlay for readability */}
              <div className="absolute inset-0 bg-black/20" />

              {/* Content */}
              <div className="relative z-10 text-center px-8 py-10 max-w-xs">
                <h3 className="text-2xl font-bold text-white mb-3">{data.label}</h3>
                <p
                  className={`text-white/80 text-sm leading-relaxed transition-all duration-300
                              ${isHovered ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'}`}
                >
                  {data.description}
                </p>
              </div>

              {/* Hover indicator */}
              <motion.div
                className="absolute bottom-8 left-1/2 -translate-x-1/2 bg-white/90 text-stone-900
                           px-5 py-2 rounded-full text-sm font-semibold"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: isHovered ? 1 : 0, y: isHovered ? 0 : 10 }}
                transition={{ duration: 0.2 }}
              >
                Choose this →
              </motion.div>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
