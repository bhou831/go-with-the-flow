"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import type {
  MultiChoiceGridQuestion,
  AnswerWeight,
  GridOption,
} from "@/lib/types";
import { triggerHaptic } from "@/lib/haptic";

interface Props {
  question: MultiChoiceGridQuestion;
  onAnswer: (selectedId: string, weights: AnswerWeight[]) => void;
}

const containerVariants = {
  animate: { transition: { staggerChildren: 0.07 } },
};

const cardVariants = {
  initial: { opacity: 0, y: 24 },
  animate: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.35, ease: "easeOut" as const },
  },
  exit: { opacity: 0, y: -16, transition: { duration: 0.2 } },
};

// Returns the className for the image container based on imageAspect.
function imageContainerClass(aspect?: GridOption["imageAspect"]): string {
  switch (aspect) {
    case "square":
      return "relative w-full aspect-square rounded-lg overflow-hidden";
    case "portrait":
      return "relative w-full aspect-[3/4] rounded-lg overflow-hidden";
    case "landscape":
      return "relative w-full aspect-[4/3] rounded-lg overflow-hidden";
    default:
      return "relative w-full aspect-[4/3] rounded-lg overflow-hidden";
  }
}

// Card rendered as a horizontal strip (image left, label right) for single-column layout.
function SingleColumnCard({
  option,
  onAnswer,
}: {
  option: GridOption;
  onAnswer: (id: string, weights: AnswerWeight[]) => void;
}) {
  return (
    <motion.button
      variants={cardVariants}
      whileHover={{ y: -2, boxShadow: "0 8px 24px rgba(0,0,0,0.10)" }}
      whileTap={{ scale: 0.97 }}
      onClick={() => {
        triggerHaptic();
        onAnswer(option.id, option.weights);
      }}
      aria-label={`Choose ${option.label}`}
      className="flex flex-row items-center gap-4 w-full px-4 py-3 min-h-[72px]
                 bg-white border-2 border-stone-100 rounded-2xl
                 cursor-pointer transition-colors duration-150
                 hover:border-stone-300 active:border-stone-400
                 focus-visible:outline-none focus-visible:ring-2
                 focus-visible:ring-stone-900 focus-visible:ring-offset-2
                 text-left"
    >
      {option.image && (
        <div className="relative shrink-0 w-28 aspect-[4/3] rounded-lg overflow-hidden">
          <Image
            src={option.image}
            alt={option.label}
            fill
            className="object-cover"
          />
        </div>
      )}
      {!option.image && option.icon && (
        <span
          className="text-3xl shrink-0 w-12 text-center"
          role="img"
          aria-label={option.label}
        >
          {option.icon}
        </span>
      )}
      <div className="flex flex-col flex-1">
        <span className="font-semibold text-stone-800 text-sm leading-snug">
          {option.label}
        </span>
        {option.description && (
          <span className="text-stone-400 text-xs leading-snug mt-0.5">
            {option.description}
          </span>
        )}
      </div>
    </motion.button>
  );
}

// Card rendered in the default grid layout (image on top, label below).
function GridCard({
  option,
  onAnswer,
}: {
  option: GridOption;
  onAnswer: (id: string, weights: AnswerWeight[]) => void;
}) {
  return (
    <motion.button
      variants={cardVariants}
      whileHover={{ y: -4, boxShadow: "0 12px 32px rgba(0,0,0,0.12)" }}
      whileTap={{ scale: 0.96 }}
      onClick={() => {
        triggerHaptic();
        onAnswer(option.id, option.weights);
      }}
      aria-label={`Choose ${option.label}`}
      className="flex flex-col items-center justify-center gap-3 p-4
                 bg-white border-2 border-stone-100 rounded-2xl
                 cursor-pointer transition-colors duration-150
                 hover:border-stone-300 active:border-stone-400
                 focus-visible:outline-none focus-visible:ring-2
                 focus-visible:ring-stone-900 focus-visible:ring-offset-2"
    >
      {option.image ? (
        <div className={imageContainerClass(option.imageAspect)}>
          <Image
            src={option.image}
            alt={option.label}
            fill
            className="object-cover"
          />
        </div>
      ) : option.icon ? (
        <span className="text-4xl" role="img" aria-label={option.label}>
          {option.icon}
        </span>
      ) : null}
      <span className="font-semibold text-stone-800 text-sm text-center leading-snug">
        {option.label}
      </span>
    </motion.button>
  );
}

export default function MultiChoiceGrid({ question, onAnswer }: Props) {
  const { layout = "grid", headerMedia } = question;
  const isSingleColumn = layout === "single-column";
  const isCardColumn = layout === "card-column";
  const isThree = question.options.length === 3;

  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-6 py-6">
      <div className="w-full max-w-md">
        <p className="text-sm font-medium text-stone-400 uppercase tracking-widest mb-2 text-center">
          Pick one
        </p>
        <h2 className="text-2xl font-bold text-stone-900 text-center mb-6">
          {question.prompt}
        </h2>

        {/* Header media — animation or image shown between prompt and choices */}
        {headerMedia && (
          <div className="mb-6 rounded-2xl overflow-hidden bg-stone-50">
            {headerMedia.type === "image" && (
              <div className="relative w-full aspect-video">
                <Image
                  src={headerMedia.src}
                  alt="Question illustration"
                  fill
                  className="object-cover"
                />
              </div>
            )}
          </div>
        )}

        {/* Options */}
        {isSingleColumn ? (
          <motion.div
            className="flex flex-col gap-3"
            variants={containerVariants}
            initial="initial"
            animate="animate"
          >
            {question.options.map((option) => (
              <SingleColumnCard
                key={option.id}
                option={option}
                onAnswer={onAnswer}
              />
            ))}
          </motion.div>
        ) : isCardColumn ? (
          <motion.div
            className="grid grid-cols-1 gap-4"
            variants={containerVariants}
            initial="initial"
            animate="animate"
          >
            {question.options.map((option) => (
              <GridCard key={option.id} option={option} onAnswer={onAnswer} />
            ))}
          </motion.div>
        ) : (
          <motion.div
            className={`grid gap-4 ${isThree ? "grid-cols-3" : "grid-cols-2"}`}
            variants={containerVariants}
            initial="initial"
            animate="animate"
          >
            {question.options.map((option) => (
              <GridCard key={option.id} option={option} onAnswer={onAnswer} />
            ))}
          </motion.div>
        )}
      </div>
    </div>
  );
}
