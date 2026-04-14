# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What This Project Is

**City Match** — an interactive lifestyle survey that matches users to one of 6 global cities. Users answer 8 auto-advancing questions; a cosine-similarity algorithm scores their answers across 5 dimensions and reveals their matched city with animated results.

- **Cities:** NYC, Tokyo, Amsterdam, Los Angeles, Vienna, Singapore
- **Dimensions:** `transit`, `density`, `vibe`, `cost`, `climate`
- **Stack:** Next.js 16.2, React 19, TypeScript, Tailwind CSS 4, Framer Motion 12, D3 7
- **Deploy:** Vercel static export (`output: 'export'`, writes to `out/`)

---

## Commands

```bash
npm run dev          # dev server at http://localhost:3000
npm run build        # production static export → out/
npx serve out        # preview the static export locally
npm run lint         # ESLint (Next.js rules)
npx tsc --noEmit     # type-check without emitting
```

---

## Directory Structure

```
src/
├── app/                          # Next.js App Router
│   ├── layout.tsx                # Root layout — no fonts, bare <html>
│   ├── globals.css               # Tailwind 4 entry (@import "tailwindcss")
│   ├── page.tsx                  # Landing page — CTA → /survey
│   ├── survey/
│   │   └── page.tsx              # Server Component; feeds questions.json → <SurveyContainer>
│   └── results/
│       └── page.tsx              # Server Component; <Suspense> wrapper around <ResultsContent>
│
├── components/
│   ├── CityHero.tsx              # Landing page — spinning D3 wireframe globe + text overlay
│   ├── ui/
│   │   └── wireframe-dotted-globe.tsx  # Reusable D3 orthographic globe (shadcn-style ui folder)
│   ├── survey/
│   │   ├── SurveyContainer.tsx   # Owns AnimatePresence + question routing switch + back button
│   │   ├── ProgressBar.tsx       # Fixed top bar; spring-animated scaleX
│   │   ├── VisualComparison.tsx  # Two-panel split; hover-expand via flex + click-to-advance
│   │   ├── MultiChoiceGrid.tsx   # 2×2 staggered card grid; click-to-advance
│   │   └── ElevatorMiniGame.tsx  # Phase machine (entering→idle→chosen); 1600ms delay before advance
│   └── results/
│       ├── ResultsContent.tsx    # 'use client'; reads ?a= param via useSearchParams, runs scoring
│       ├── CityReveal.tsx        # Full-screen color wash + letter-by-letter city name animation
│       └── DimensionBars.tsx     # Animated score bars; spring scaleX per dimension
│
├── data/
│   ├── questions.json            # 8 questions — weights defined here, NOT in components
│   └── cities.json               # 6 cities — scores (0–10) per dimension + accentColor hex
│
├── lib/
│   ├── types.ts                  # Single source of truth for ALL TypeScript types
│   ├── scoring.ts                # buildUserVector() + cosineSimilarity() + findMatchingCity()
│   ├── survey-reducer.ts         # SurveyState, SurveyAction, surveyReducer
│   └── validation.ts             # Zod schemas for questions.json, cities.json, and URL answers
│
├── hooks/
│   └── useSurveyState.ts         # Wraps reducer; encodes answers → btoa(JSON) → router.push /results?a=
│
└── scripts/
    └── trace-skyline.js          # Node utility: pixel-traces a PNG silhouette → SVG OUTLINE_D path string
```

---

## Data Flow

```
Landing (/) → /survey
  survey/page.tsx (Server)
    └─ <SurveyContainer questions={questionsData}>
         └─ useSurveyState(questions)       ← useReducer
              └─ on phase='done'            → router.push('/results?a=<base64answers>')

/results
  results/page.tsx (Server, Suspense boundary)
    └─ <ResultsContent> (Client)
         └─ useSearchParams().get('a')      → atob → JSON.parse → RecordedAnswer[]
              └─ findMatchingCity(answers, cities)
                   └─ <CityReveal city userVector>
```

---

## Question Types

Each question in `questions.json` has a `type` field that routes to the matching component:

| `type` | Component | Behavior |
|---|---|---|
| `visual-comparison` | `VisualComparison` | Two full-height panels; click either side to advance |
| `multi-choice-grid` | `MultiChoiceGrid` | 2×2 grid of icon cards; click one to advance |
| `mini-game` | `ElevatorMiniGame` | Animated elevator scene; shows reveal text 1600ms before advancing |

All question components receive `onAnswer(selectedId, weights)` — calling it dispatches `ANSWER` to the reducer. Components are display-only; all scoring weights live in `questions.json`.

---

## Scoring Algorithm (`src/lib/scoring.ts`)

1. Accumulate each answer's `AnswerWeight[]` into per-dimension sums + touch counts
2. Normalize: `score = sum / count`; untouched dimensions default to `5` (neutral)
3. Cosine similarity between user's `DimensionVector` and each city's `scores`
4. Return city with highest similarity

Cosine similarity (not dot product) is intentional — it rewards directional alignment so a low-density/high-climate user matches LA over NYC.

---

## Key Conventions

- **All types in `src/lib/types.ts` only.** Never declare `interface` or `type` inside component files.
- **City `accentColor` is always `style={{ backgroundColor: city.accentColor }}`.** Never a Tailwind class — dynamic values aren't in the build-time config (Tailwind 4 CSS-first, no `tailwind.config.js`).
- **`AnimatePresence mode="wait"` in `SurveyContainer`** — ensures the exiting question fully leaves before the entering one appears. Do not change this to `mode="sync"`. The `custom` prop carries a direction value (`1` = forward, `-1` = back) so the slide animation mirrors the navigation direction.
- **Survey back navigation** — `SurveyAction` includes a `BACK` type that decrements `currentIndex` and trims the last entry from `answers`. The back button is only rendered when `currentIndex > 0`.
- **`results/page.tsx` must stay a Server Component** with a `<Suspense>` boundary. `useSearchParams()` in a static export requires Suspense or the build will fail with a prerender error.
- **Adding a question:** define weights directly in `questions.json`; touch at least 2 of the 5 dimensions or untouched ones default to neutral (5).
- **Adding a city:** all 5 dimension keys (`transit`, `density`, `vibe`, `cost`, `climate`) must be present in `scores` and `accentColor` must be a valid 6-digit hex (`#rrggbb`) — both enforced by the Zod schema in `validation.ts`, which throws a descriptive error at startup.
- **Adding a new question type:** add the interface + union member to `types.ts`, add a Zod schema to `validation.ts` and include it in `QuestionsSchema`, build the component, then add the `case` to `renderQuestion` in `SurveyContainer.tsx`. The `assertNever` exhaustiveness check will produce a **TypeScript compile error** if the `case` is missing.
- **Data validation:** `questions.json` and `cities.json` are parsed with Zod schemas at startup (not cast with `as`). Malformed data — wrong types, missing fields, out-of-range values — throws immediately with a descriptive error rather than producing silent NaN or undefined behavior downstream.
- **Landing page globe** — `CityHero.tsx` renders `<RotatingEarth>` from `components/ui/wireframe-dotted-globe.tsx`. The globe fetches `ne_110m_land.json` from GitHub at runtime (client-side) and draws an orthographic D3 projection on a `<canvas>`. It auto-rotates and supports drag-to-spin. The `globals.css` `.dark` block provides the CSS variables the component expects (`--background`, `--muted-foreground`, etc.).
- **`components/ui/` folder** — shadcn-compatible location for reusable UI primitives. Add new shadcn components here.
