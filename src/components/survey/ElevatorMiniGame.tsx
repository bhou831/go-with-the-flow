'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { ElevatorMiniGameQuestion, AnswerWeight, MiniGameAction } from '@/lib/types';

type Phase = 'entering' | 'idle' | 'chosen';

interface Props {
  question: ElevatorMiniGameQuestion;
  onAnswer: (selectedId: string, weights: AnswerWeight[]) => void;
}

export default function ElevatorMiniGame({ question, onAnswer }: Props) {
  const [phase, setPhase] = useState<Phase>('entering');
  const [chosen, setChosen] = useState<MiniGameAction | null>(null);
  const [floor, setFloor] = useState(1);

  // Transition from entering → idle after character animation
  useEffect(() => {
    const t = setTimeout(() => setPhase('idle'), 900);
    return () => clearTimeout(t);
  }, []);

  // Tick floor counter
  useEffect(() => {
    const t = setInterval(() => setFloor((f) => (f < 20 ? f + 1 : f)), 400);
    return () => clearInterval(t);
  }, []);

  // After reveal text, advance survey
  useEffect(() => {
    if (phase === 'chosen' && chosen) {
      const t = setTimeout(() => onAnswer(chosen.id, chosen.weights), 1600);
      return () => clearTimeout(t);
    }
  }, [phase, chosen, onAnswer]);

  const handleAction = (action: MiniGameAction) => {
    setChosen(action);
    setPhase('chosen');
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-6 py-12 bg-stone-50">
      <div className="w-full max-w-sm">
        <p className="text-sm font-medium text-stone-400 uppercase tracking-widest mb-2 text-center">
          Mini-game
        </p>
        <h2 className="text-xl font-bold text-stone-900 text-center mb-2">
          {question.prompt}
        </h2>
        <p className="text-stone-500 text-sm text-center mb-8">{question.sceneDescription}</p>

        {/* Elevator box */}
        <div className="relative mx-auto w-64 h-72 bg-stone-200 rounded-xl overflow-hidden border-4 border-stone-300 mb-6">
          {/* Floor display */}
          <div className="absolute top-3 right-3 bg-stone-800 text-green-400 text-xs font-mono px-2 py-1 rounded">
            {String(floor).padStart(2, '0')}
          </div>

          {/* Ceiling light strip */}
          <div className="absolute top-0 left-0 right-0 h-2 bg-amber-200 opacity-80" />

          {/* Back wall panels */}
          <div className="absolute inset-x-4 top-8 bottom-4 grid grid-cols-3 gap-1 opacity-30">
            {Array.from({ length: 9 }).map((_, i) => (
              <div key={i} className="bg-stone-400 rounded-sm" />
            ))}
          </div>

          {/* Stranger silhouettes (static) */}
          <div className="absolute bottom-4 left-8 flex gap-4">
            <div className="flex flex-col items-center gap-0.5 opacity-40">
              <div className="w-5 h-5 rounded-full bg-stone-600" />
              <div className="w-4 h-8 rounded-sm bg-stone-600" />
            </div>
            <div className="flex flex-col items-center gap-0.5 opacity-40">
              <div className="w-4 h-4 rounded-full bg-stone-700" />
              <div className="w-3.5 h-7 rounded-sm bg-stone-700" />
            </div>
          </div>

          {/* Player character */}
          <motion.div
            className="absolute bottom-4 right-8 flex flex-col items-center gap-0.5"
            initial={{ x: 80, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 280, damping: 22, delay: 0.1 }}
          >
            {/* Head */}
            <div className="w-6 h-6 rounded-full bg-amber-400 border-2 border-amber-500" />
            {/* Body */}
            <div className="w-5 h-9 rounded-t-sm rounded-b-sm bg-blue-500" />
          </motion.div>

          {/* Chosen action overlay */}
          <AnimatePresence>
            {phase === 'chosen' && chosen && (
              <motion.div
                className="absolute inset-0 flex items-center justify-center bg-black/40 px-4"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <motion.p
                  className="text-white text-center text-sm font-semibold leading-relaxed"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3, duration: 0.4 }}
                >
                  {chosen.revealText}
                </motion.p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Action buttons */}
        <AnimatePresence>
          {phase === 'idle' && (
            <motion.div
              className="flex flex-col gap-3"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              {question.actions.map((action, i) => (
                <motion.button
                  key={action.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1, duration: 0.25 }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => handleAction(action)}
                  aria-label={action.label}
                  className="w-full py-3 px-5 bg-white border-2 border-stone-200 rounded-xl
                             font-semibold text-stone-800 text-sm
                             hover:border-stone-400 transition-colors duration-150
                             focus-visible:outline-none focus-visible:ring-2
                             focus-visible:ring-stone-900 focus-visible:ring-offset-2"
                >
                  {action.label}
                </motion.button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
