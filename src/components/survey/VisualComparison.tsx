"use client";

import { useState } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import type { VisualComparisonQuestion, AnswerWeight } from "@/lib/types";
import { triggerHaptic } from "@/lib/haptic";

interface Props {
  question: VisualComparisonQuestion;
  onAnswer: (selectedId: string, weights: AnswerWeight[]) => void;
}

const panelVariants = (side: "left" | "right", stacked: boolean) => ({
  initial: stacked
    ? { opacity: 0, y: side === "left" ? -40 : 40 }
    : { opacity: 0, x: side === "left" ? -60 : 60 },
  animate: {
    opacity: 1,
    x: 0,
    y: 0,
    transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] as const },
  },
  exit: {
    opacity: 0,
    scale: 0.96,
    transition: { duration: 0.25, ease: "easeIn" as const },
  },
});

const cardVariants = (index: number) => ({
  initial: { opacity: 0, y: 40 },
  animate: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.4,
      ease: [0.22, 1, 0.36, 1] as const,
      delay: index * 0.12,
    },
  },
  exit: {
    opacity: 0,
    scale: 0.96,
    transition: { duration: 0.25, ease: "easeIn" as const },
  },
});

export default function VisualComparison({ question, onAnswer }: Props) {
  const [hovered, setHovered] = useState<"left" | "right" | null>(null);
  const isStacked = question.layout === "stacked";
  const isCardStack = question.layout === "card-stack";

  const handleClick = (side: "left" | "right") => {
    triggerHaptic();
    const chosen = side === "left" ? question.left : question.right;
    onAnswer(side, chosen.weights);
  };

  // ── card-stack layout ─────────────────────────────────────────────────────
  if (isCardStack) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen px-6 py-6 overflow-y-auto">
        <div className="w-full max-w-md">
          <p className="text-sm font-medium text-stone-400 uppercase tracking-widest mb-2 text-center">
            Pick one
          </p>
          <h2 className="text-2xl font-bold text-stone-900 text-center mb-6">
            {question.prompt}
          </h2>

          <div className="flex flex-col gap-4">
            {(["left", "right"] as const).map((side, index) => {
              const data = side === "left" ? question.left : question.right;
              return (
                <motion.button
                  key={side}
                  variants={cardVariants(index)}
                  initial="initial"
                  animate="animate"
                  exit="exit"
                  whileHover={{
                    scale: 1.01,
                    boxShadow: "0 8px 32px rgba(0,0,0,0.12)",
                  }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleClick(side)}
                  aria-label={`Choose ${data.label}`}
                  className="w-full rounded-2xl overflow-hidden border-2 border-stone-100
                             hover:border-stone-300 transition-colors duration-150
                             cursor-pointer text-left
                             focus-visible:outline-none focus-visible:ring-2
                             focus-visible:ring-stone-900 focus-visible:ring-offset-2"
                >
                  {/* Image or color block */}
                  {data.image ? (
                    <div className="relative w-full aspect-video">
                      <Image
                        src={data.image}
                        alt={data.label}
                        fill
                        className="object-cover"
                      />
                    </div>
                  ) : (
                    <div className={`w-full h-36 ${data.bgClass}`} />
                  )}

                  {/* Text section */}
                  <div className="px-5 py-4 bg-white">
                    <h3 className="font-bold text-stone-900 text-lg mb-1">
                      {data.label}
                    </h3>
                    <p className="text-stone-500 text-sm leading-relaxed">
                      {data.description}
                    </p>
                  </div>
                </motion.button>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  // ── side-by-side / stacked layouts ────────────────────────────────────────
  return (
    <div className="flex flex-col min-h-screen">
      {/* Prompt */}
      <div className="text-center py-8 px-6">
        <p className="text-sm font-medium text-stone-400 uppercase tracking-widest mb-2">
          Pick one
        </p>
        <h2 className="text-2xl font-bold text-stone-900">{question.prompt}</h2>
      </div>

      {/* Panels */}
      <div className={`flex flex-1 ${isStacked ? "flex-col" : "flex-row"}`}>
        {(["left", "right"] as const).map((side) => {
          const data = side === "left" ? question.left : question.right;
          const isActive = hovered === side;

          return (
            <motion.button
              key={side}
              variants={panelVariants(side, isStacked)}
              initial="initial"
              animate="animate"
              exit="exit"
              className={`
                relative flex flex-col items-center justify-center cursor-pointer
                overflow-hidden transition-all duration-300
                ${data.image ? "" : data.bgClass}
                ${
                  isStacked
                    ? `flex-1 min-h-[34vh] ${isActive ? "flex-[1.15]" : ""}`
                    : `flex-1 ${isActive ? "flex-[1.2]" : ""}`
                }
              `}
              onMouseEnter={() => setHovered(side)}
              onMouseLeave={() => setHovered(null)}
              onClick={() => handleClick(side)}
              aria-label={`Choose ${data.label}`}
              whileTap={{ scale: 0.98 }}
            >
              {/* Background image */}
              {data.image && (
                <Image
                  src={data.image}
                  alt={data.label}
                  fill
                  className="object-cover"
                />
              )}

              {/* Overlay */}
              <div className="absolute inset-0 bg-black/30" />

              {/* Content */}
              <div className="relative z-10 text-center px-8 py-8 max-w-xs">
                <h3 className="text-2xl font-bold text-white mb-3">
                  {data.label}
                </h3>
                <p
                  className={`text-white/90 text-sm leading-relaxed transition-all duration-300
                    ${
                      isStacked
                        ? "opacity-100"
                        : isActive
                          ? "opacity-100 translate-y-0"
                          : "opacity-0 translate-y-2"
                    }`}
                >
                  {data.description}
                </p>
              </div>

              {/* Tap/click indicator */}
              <motion.div
                className="absolute bottom-5 left-1/2 -translate-x-1/2 bg-white/90 text-stone-900
                           px-5 py-2 rounded-full text-sm font-semibold"
                initial={{ opacity: 0, y: 10 }}
                animate={{
                  opacity: isStacked ? 1 : isActive ? 1 : 0,
                  y: isStacked ? 0 : isActive ? 0 : 10,
                }}
                transition={{ duration: 0.2 }}
              >
                {isStacked ? "Tap to choose →" : "Choose this →"}
              </motion.div>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
