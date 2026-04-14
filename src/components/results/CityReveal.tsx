'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import DimensionBars from './DimensionBars';
import type { City, DimensionVector } from '@/lib/types';

interface Props {
  city: City;
  userVector: DimensionVector;
}

export default function CityReveal({ city, userVector }: Props) {
  const letters = city.name.split('');

  return (
    <motion.main
      className="min-h-screen flex flex-col items-center justify-center px-6 py-16 overflow-hidden"
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
          transition={{ delay: 0.3, duration: 0.5 }}
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
                delay: 0.5 + i * 0.06,
                duration: 0.35,
                ease: [0.22, 1, 0.36, 1],
              }}
              style={{ display: letter === ' ' ? 'inline' : 'inline-block' }}
            >
              {letter === ' ' ? '\u00A0' : letter}
            </motion.span>
          ))}
        </h1>

        {/* Country */}
        <motion.p
          className="text-white/50 text-sm mb-2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 + letters.length * 0.06 + 0.1, duration: 0.4 }}
        >
          {city.country}
        </motion.p>

        {/* Tagline */}
        <motion.p
          className="text-white/80 text-xl font-medium italic mt-4 mb-2"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.2, duration: 0.5 }}
        >
          &ldquo;{city.tagline}&rdquo;
        </motion.p>

        {/* Dimension bars */}
        <DimensionBars userVector={userVector} />

        {/* CTA */}
        <motion.div
          className="mt-12 flex flex-col items-center gap-4"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 2.8, duration: 0.4 }}
        >
          <Link
            href="/"
            className="inline-block bg-white/20 hover:bg-white/30 text-white
                       px-8 py-3 rounded-2xl font-semibold text-sm transition-colors duration-150
                       focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2"
            style={{ ['--tw-ring-offset-color' as string]: city.accentColor }}
          >
            Start Over
          </Link>
          <p className="text-white/30 text-xs">Share your result — copy the URL!</p>
        </motion.div>
      </div>
    </motion.main>
  );
}
