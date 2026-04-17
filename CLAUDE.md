# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What This Project Is

**City Match** — an interactive lifestyle survey that matches users to their top 3 global cities. Users answer 21 auto-advancing questions; a masked cosine-similarity algorithm scores their answers across 17 dimensions and reveals their matched cities with animated results.

- **Cities:** 50 global cities
- **Dimensions:** `transit`, `safety`, `cost`, `climate`, `nightlife`, `nature`, `culture`, `diversity`, `tech`, `openness`, `balance`, `career`, `aesthetics`, `hustle`, `density`, `wellness`, `pulse`
- **Stack:** Next.js, React 19, TypeScript, Tailwind CSS 4, Framer Motion, D3
- **Deploy:** Cloudflare Pages static export (`output: 'export'`, writes to `out/`)

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
│   │   ├── VisualComparison.tsx  # Two-panel or card-stack layout; click to advance
│   │   ├── MultiChoiceGrid.tsx   # Grid/single-column/card-column layouts; click to advance
│   │   └── ElevatorMiniGame.tsx  # Phase machine (entering→idle→chosen); 1600ms delay before advance
│   └── results/
│       ├── ResultsContent.tsx    # 'use client'; reads ?a= param, runs scoring, passes top 3 cities
│       ├── CityReveal.tsx        # Full-screen color wash + letter-by-letter animation + runner-up chips
│       └── DimensionBars.tsx     # Animated score bars for touched dimensions only
│
├── data/
│   ├── questions.json            # 21 questions — weights defined here, NOT in components
│   └── cities.json               # 50 cities — scores (0–10) per dimension + accentColor hex
│
├── lib/
│   ├── types.ts                  # Single source of truth for ALL TypeScript types
│   ├── scoring.ts                # buildUserVector() + maskedCosineSimilarity() + findMatchingCity()
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
                   └─ <CityReveal city userVector topCities>
```

---

## Question Types

Each question in `questions.json` has a `type` field that routes to the matching component:

| `type`              | Component          | Behavior                                               |
| ------------------- | ------------------ | ------------------------------------------------------ |
| `visual-comparison` | `VisualComparison` | Two panels; click either side to advance               |
| `multi-choice-grid` | `MultiChoiceGrid`  | Grid/column of cards; click one to advance             |
| `mini-game`         | `ElevatorMiniGame` | Animated elevator scene; 1600ms delay before advancing |

All question components receive `onAnswer(selectedId, weights)` — calling it dispatches `ANSWER` to the reducer. Components are display-only; all scoring weights live in `questions.json`.

### `VisualComparison` layouts

| `layout`                 | Description                                                                |
| ------------------------ | -------------------------------------------------------------------------- |
| `side-by-side` (default) | Two full-height panels side by side; hover to expand                       |
| `stacked`                | Two full-height panels stacked top/bottom; always-visible CTA              |
| `card-stack`             | Two centered cards (image on top, label + description below); mobile-first |

### `MultiChoiceGrid` layouts

| `layout`         | Description                                                                               |
| ---------------- | ----------------------------------------------------------------------------------------- |
| `grid` (default) | 2- or 3-column card grid (image on top, label below)                                      |
| `single-column`  | 1-column horizontal cards (icon/image left, label + optional description right)           |
| `card-column`    | 1-column full-width cards (image on top, label below) — use for portrait/landscape images |

### `GridOption` fields

- `label` — primary text
- `description` — optional muted sublabel; rendered in `single-column` layout below the label
- `icon` — emoji; shown when no `image`
- `image` — image path
- `imageAspect` — `'landscape'` | `'square'` | `'portrait'`; controls the image container aspect ratio

### `HeaderMedia` (shown above choices in `multi-choice-grid`)

- `{ type: 'image', src: '/path.png' }` — renders as `aspect-video` image
- Animation types (`escalator`, `violin`) are no longer in use; the corresponding components were removed.

---

## Scoring Algorithm (`src/lib/scoring.ts`)

1. Accumulate each answer's `AnswerWeight[]` into per-dimension sums + touch counts
2. Normalize: `score = sum / count`; **untouched dimensions are set to 0** (not 5)
3. **Masked cosine similarity** — only dimensions the user actually expressed a preference on (`coverage[d] > 0`) are included in the dot product. This prevents the 10+ untouched dimensions from diluting signal across all 17 dimensions.
4. Sort all 50 cities by score; return top 3 as `topCities[]`, plus the full `scores` map and `userVector`

`findMatchingCity` returns `{ city, userVector, scores, topCities }`.

`DimensionBars` only renders dimensions where `userVector[dim] > 0` (touched dimensions), keeping the results page focused.

---

## Key Conventions

- **All types in `src/lib/types.ts` only.** Never declare `interface` or `type` inside component files.
- **City `accentColor` is always `style={{ backgroundColor: city.accentColor }}`.** Never a Tailwind class — dynamic values aren't in the build-time config (Tailwind 4 CSS-first, no `tailwind.config.js`).
- **`AnimatePresence mode="wait"` in `SurveyContainer`** — ensures the exiting question fully leaves before the entering one appears. Do not change this to `mode="sync"`. The `custom` prop carries a direction value (`1` = forward, `-1` = back) so the slide animation mirrors the navigation direction.
- **Survey back navigation** — `SurveyAction` includes a `BACK` type that decrements `currentIndex` and trims the last entry from `answers`. The back button is only rendered when `currentIndex > 0`.
- **`results/page.tsx` must stay a Server Component** with a `<Suspense>` boundary. `useSearchParams()` in a static export requires Suspense or the build will fail with a prerender error.
- **Adding a question:** define weights directly in `questions.json`; touch at least 2–3 of the 17 dimensions. Untouched dimensions are excluded from matching (masked), so sparse coverage is fine.
- **Adding a city:** all 17 dimension keys must be present in `scores` and `accentColor` must be a valid 6-digit hex (`#rrggbb`) — both enforced by the Zod schema in `validation.ts`, which throws a descriptive error at startup.
- **Adding a new question type:** add the interface + union member to `types.ts`, add a Zod schema to `validation.ts` and include it in `QuestionsSchema`, build the component, then add the `case` to `renderQuestion` in `SurveyContainer.tsx`. The `assertNever` exhaustiveness check will produce a **TypeScript compile error** if the `case` is missing.
- **Data validation:** `questions.json` and `cities.json` are parsed with Zod schemas at startup (not cast with `as`). Malformed data — wrong types, missing fields, out-of-range values — throws immediately with a descriptive error rather than producing silent NaN or undefined behavior downstream.
- **Landing page globe** — `CityHero.tsx` renders `<RotatingEarth>` from `components/ui/wireframe-dotted-globe.tsx`. The globe fetches `ne_110m_land.json` from GitHub at runtime (client-side) and draws an orthographic D3 projection on a `<canvas>`. It auto-rotates and supports drag-to-spin. The `globals.css` `.dark` block provides the CSS variables the component expects (`--background`, `--muted-foreground`, etc.).
- **`components/ui/` folder** — shadcn-compatible location for reusable UI primitives. Add new shadcn components here.
- **Images in `/public`** — portrait for architecture (brutal.png, seagram.jpg, denmark.png, kyoto.png, sidewalk photos), square for logos (slack.png, ig.png, wechat.png), landscape for personalities/scenes (bank.png, sv.png, wv.png, parks.png, allocation.png, paris.png, graffiti.png, escalator.png, violin.png, dense.png, sparse.png).
