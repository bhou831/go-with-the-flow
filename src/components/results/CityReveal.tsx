"use client";

import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import DimensionBars from "./DimensionBars";
import { clearResultCache } from "@/lib/result-cache";
import type { City, DimensionVector } from "@/lib/types";

interface Props {
  city: City;
  userVector: DimensionVector;
  topCities: City[];
}

export default function CityReveal({ city, userVector, topCities }: Props) {
  const router = useRouter();
  const letters = city.name.split("");

  return (
    <motion.main
      className="min-h-screen flex flex-col items-center justify-center px-6 py-8 sm:py-16 overflow-y-auto"
      style={{ backgroundColor: city.accentColor }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <div className="w-full max-w-md text-center">
        {/* Country badge */}
        <motion.p
          className="text-white/60 text-xs uppercase tracking-[0.3em] mb-6"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.4 }}
        >
          Your city is
        </motion.p>

        {/* City name — letter by letter */}
        <h1 className="text-5xl font-black text-white tracking-tight leading-tight mb-1">
          {letters.map((letter, i) => (
            <motion.span
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                delay: 0.3 + i * 0.04,
                duration: 0.3,
                ease: [0.22, 1, 0.36, 1],
              }}
              style={{ display: letter === " " ? "inline" : "inline-block" }}
            >
              {letter === " " ? "\u00A0" : letter}
            </motion.span>
          ))}
        </h1>

        {/* Country */}
        <motion.p
          className="text-white/50 text-sm mb-2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{
            delay: 0.3 + letters.length * 0.04 + 0.1,
            duration: 0.4,
          }}
        >
          {city.country}
        </motion.p>

        {/* Tagline */}
        <motion.p
          className="text-white/80 text-xl font-medium italic mt-4 mb-2"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 0.5 }}
        >
          &ldquo;{city.tagline}&rdquo;
        </motion.p>

        {/* Dimension bars */}
        <DimensionBars userVector={userVector} />

        {/* Runner-up cities */}
        {topCities.length > 1 && (
          <motion.div
            className="mt-8 w-full"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 2.2, duration: 0.5 }}
          >
            <p className="text-white/50 text-xs uppercase tracking-widest text-center mb-4">
              Also a great fit
            </p>
            <div className="grid grid-cols-2 gap-3">
              {topCities.slice(1).map((runnerUp, i) => (
                <div
                  key={runnerUp.id}
                  className="rounded-2xl p-4 text-center bg-white/10"
                >
                  <p className="text-white/60 text-xs mb-1">#{i + 2}</p>
                  <p className="text-white font-bold text-lg leading-tight">
                    {runnerUp.name}
                  </p>
                  <p className="text-white/60 text-xs mt-1">
                    {runnerUp.country}
                  </p>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* CTA */}
        <motion.div
          className="mt-12 flex flex-col items-center gap-4"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 2.6, duration: 0.4 }}
        >
          <button
            onClick={() => {
              clearResultCache();
              router.push("/");
            }}
            className="inline-block bg-white/20 hover:bg-white/30 text-white
                       px-8 py-3 rounded-2xl font-semibold text-sm transition-colors duration-150
                       focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 cursor-pointer"
            style={{ ["--tw-ring-offset-color" as string]: city.accentColor }}
          >
            Start Over
          </button>
          <p className="text-white/30 text-xs">
            Share your result — copy the URL!
          </p>
        </motion.div>
      </div>
    </motion.main>
  );
}
