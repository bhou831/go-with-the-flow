"use client";

import Link from "next/link";
import RotatingEarth from "@/components/ui/wireframe-dotted-globe";
import ResultRedirect from "@/components/ResultRedirect";
import { triggerHaptic } from "@/lib/haptic";

export default function CityHero() {
  return (
    <main className="relative min-h-screen overflow-hidden flex flex-col items-center justify-center bg-black">
      <ResultRedirect />

      {/* ── Spinning wireframe globe — centred background layer, interactive ── */}
      <div className="absolute inset-0 flex items-center justify-center">
        <RotatingEarth width={1300} height={1000} className="opacity-80" />
      </div>

      {/* ── Vignette: fades the globe toward the edges for readability ── */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 60% 60% at 50% 50%, transparent 20%, black 80%)",
        }}
      />

      {/* ── Text content ── */}
      <div className="relative z-10 flex flex-col items-center text-center px-6">
        <p className="text-xs font-semibold text-stone-400 uppercase tracking-[0.5em] mb-6">
          A city personality quiz
        </p>
        <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black text-white tracking-tight leading-[1.05] mb-5">
          Where do
          <br />
          you belong?
        </h1>
        <p className="text-stone-300 text-sm mb-10 max-w-[22rem] leading-relaxed">
          21 questions. 50 cities. One honest answer.
        </p>
        <Link
          href="/survey"
          onClick={() => triggerHaptic()}
          className="inline-flex items-center justify-center gap-2.5 bg-white text-stone-900 px-7 py-3.5
                     w-full sm:w-auto
                     rounded-full text-sm font-semibold tracking-wide
                     hover:bg-stone-100 active:scale-95 transition-all duration-150
                     focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white
                     focus-visible:ring-offset-2 focus-visible:ring-offset-black"
        >
          Begin
          <span className="opacity-40">→</span>
        </Link>
      </div>
    </main>
  );
}
