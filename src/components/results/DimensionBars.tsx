"use client";

import { motion } from "framer-motion";
import type { DimensionVector, Dimension } from "@/lib/types";

const DIMENSION_LABELS: Record<Dimension, string> = {
  transit: "Transit",
  safety: "Safety",
  cost: "Affordability",
  climate: "Climate",
  nightlife: "Nightlife",
  nature: "Nature Access",
  culture: "Culture & Arts",
  diversity: "Diversity",
  tech: "Tech Scene",
  openness: "Openness",
  balance: "Work-Life Balance",
  career: "Career",
  aesthetics: "Aesthetics",
  hustle: "Pace of Life",
  density: "Urban Density",
  wellness: "Wellness",
  pulse: "City Energy",
};

interface Props {
  userVector: DimensionVector;
}

export default function DimensionBars({ userVector }: Props) {
  // Only show dimensions the user actually expressed a preference on (value > 0).
  // Untouched dimensions stay at 0 from maskedCosineSimilarity and add no signal.
  const dimensions = (Object.keys(DIMENSION_LABELS) as Dimension[]).filter(
    (d) => userVector[d] > 0,
  );

  return (
    <div className="w-full max-w-md mx-auto mt-8 space-y-4">
      <p className="text-white/60 text-xs uppercase tracking-widest text-center mb-6">
        Your profile
      </p>
      {dimensions.map((dim, i) => {
        const pct = (userVector[dim] / 10) * 100;
        return (
          <motion.div
            key={dim}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 1.6 + i * 0.1, duration: 0.4 }}
          >
            <div className="flex justify-between items-center mb-1">
              <span className="text-white/70 text-xs font-medium">
                {DIMENSION_LABELS[dim]}
              </span>
              <span className="text-white/50 text-xs">
                {Math.round(userVector[dim])}/10
              </span>
            </div>
            <div className="h-2 bg-white/20 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-white/80 rounded-full"
                style={{ originX: 0 }}
                initial={{ scaleX: 0 }}
                animate={{ scaleX: pct / 100 }}
                transition={{
                  delay: 1.8 + i * 0.1,
                  duration: 0.6,
                  type: "spring",
                  stiffness: 80,
                  damping: 15,
                }}
              />
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}
