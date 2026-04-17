"use client";

import { motion } from "framer-motion";

interface ProgressBarProps {
  current: number;
  total: number;
}

export default function ProgressBar({ current, total }: ProgressBarProps) {
  return (
    <div
      className="fixed top-0 left-0 right-0 z-50 bg-stone-200"
      style={{ paddingTop: "env(safe-area-inset-top)" }}
    >
      <div className="h-1 relative">
        <motion.div
          className="h-full bg-stone-800"
          style={{ originX: 0 }}
          animate={{ scaleX: current / total }}
          transition={{ type: "spring", stiffness: 120, damping: 20 }}
        />
      </div>
    </div>
  );
}
