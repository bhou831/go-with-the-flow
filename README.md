# City Match

An interactive lifestyle survey that matches you to one of 6 global cities. Answer 8 questions — each one auto-advances the moment you pick — and discover whether you belong in Tokyo's electric grids, Amsterdam's canal lanes, or somewhere else entirely.

**Live cities:** New York City · Tokyo · Amsterdam · Los Angeles · Vienna · Singapore

---

## Getting Started

```bash
npm install
npm run dev        # http://localhost:3000
```

Other commands:

```bash
npm run build      # production static export → out/
npx serve out      # preview the built export locally
npm run lint       # ESLint
npx tsc --noEmit   # type-check only
```

---

## How to Extend

### 1. Replace question options with images

**`visual-comparison` questions**

Each side currently uses a Tailwind `bgClass` (e.g. `"bg-slate-800"`) as a color placeholder. To use a real image, add an optional `imageSrc` field alongside it — the component renders the image when present and falls back to the color class otherwise.

**Step 1 — Add `imageSrc?` to the type** (`src/lib/types.ts`):

```ts
export interface ComparisonSide {
  label: string;
  description: string;
  bgClass: string;
  imageSrc?: string; // ← add this
  weights: AnswerWeight[];
}
```

The Zod schema in `src/lib/validation.ts` already includes `imageSrc: z.string().optional()` — no change needed there.

**Step 2 — Update `VisualComparison.tsx`** to render the image when present:

```tsx
// Replace the overlay structure with:
<div className="absolute inset-0">
  {data.imageSrc ? (
    <img
      src={data.imageSrc}
      alt={data.label}
      className="w-full h-full object-cover"
    />
  ) : (
    <div className={`w-full h-full ${data.bgClass}`} />
  )}
</div>
```

**Step 3 — Add the image to `questions.json`** and drop the file in `/public/images/`:

```json
"left": {
  "label": "Dense Grid",
  "description": "Towering blocks, shoulder-to-shoulder streets...",
  "bgClass": "bg-slate-800",
  "imageSrc": "/images/dense-grid.jpg",
  "weights": [...]
}
```

> `next/image` is set to `unoptimized: true` in `next.config.ts` (required for static export). You can use plain `<img>` or `<Image>` from `next/image` — both work identically in this build. For remote images, make sure the domain is CORS-accessible.

**`multi-choice-grid` questions**

Each option uses an `icon` string (emoji). Follow the same pattern: add `imageSrc?: string` to `GridOption` in `types.ts`, update `MultiChoiceGrid.tsx` to render `<img>` when `imageSrc` is present, and fall back to the emoji otherwise.

---

### 2. Add more questions

All question content lives in **`src/data/questions.json`**. No code changes are needed for existing question types.

**Append a new entry** matching the shape for your type:

**`visual-comparison`** — choose between two sides:

```json
{
  "id": "q9-nightlife",
  "type": "visual-comparison",
  "prompt": "Your ideal Saturday night?",
  "left": {
    "label": "Rooftop Bar",
    "description": "City lights, cocktails, a crowd that stays until 3am",
    "bgClass": "bg-indigo-900",
    "weights": [
      { "dimension": "vibe", "value": 9 },
      { "dimension": "density", "value": 8 }
    ]
  },
  "right": {
    "label": "Quiet Bistro",
    "description": "Candles, a corner table, and a bottle of something good",
    "bgClass": "bg-amber-800",
    "weights": [
      { "dimension": "vibe", "value": 5 },
      { "dimension": "cost", "value": 6 }
    ]
  }
}
```

**`multi-choice-grid`** — exactly 4 options (enforced by TypeScript tuple + Zod):

```json
{
  "id": "q9-morning",
  "type": "multi-choice-grid",
  "prompt": "How do you start your morning?",
  "options": [
    {
      "id": "coffee-shop",
      "label": "Coffee Shop",
      "icon": "☕",
      "weights": [{ "dimension": "vibe", "value": 8 }]
    },
    {
      "id": "gym",
      "label": "Gym",
      "icon": "🏋️",
      "weights": [{ "dimension": "density", "value": 6 }]
    },
    {
      "id": "home",
      "label": "Home Office",
      "icon": "🏠",
      "weights": [{ "dimension": "cost", "value": 7 }]
    },
    {
      "id": "commute",
      "label": "On the Go",
      "icon": "🚌",
      "weights": [{ "dimension": "transit", "value": 9 }]
    }
  ]
}
```

**Weight guidelines:**

| Rule                                                          | Why                                                                                                    |
| ------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------ |
| Touch at least 2 of the 5 dimensions                          | Untouched dimensions default to 5 (neutral) — single-dimension questions have weak influence           |
| Keep `value` between 0 and 10                                 | Zod will throw a build-time error if you go outside this range                                         |
| Valid dimensions: `transit` `density` `vibe` `cost` `climate` | Typos (e.g. `"tranit"`) are caught by Zod at startup and will crash the survey page with a clear error |

**Verify:**

```bash
npx tsc --noEmit
npm run build
```

> Adding 3 or 5 options to a `multi-choice-grid` question will throw a **Zod parse error at startup** and crash the survey page — this is intentional. Fix the data, don't suppress the error.

---

### 3. Design a new in-place mini-game

The `ElevatorMiniGame` is a self-contained component with its own internal phase state machine. Any new mini-game follows the same 4-step pattern.

**Step 1 — Add the type to `src/lib/types.ts`**

```ts
export interface MapTapQuestion extends BaseQuestion {
  type: "map-tap";
  sceneLabel: string;
  zones: MapZone[];
}

export interface MapZone {
  id: string;
  label: string;
  revealText: string;
  weights: AnswerWeight[];
}

// Add to the union:
export type Question =
  | VisualComparisonQuestion
  | MultiChoiceGridQuestion
  | ElevatorMiniGameQuestion
  | MapTapQuestion; // ← new
```

**Step 2 — Add a Zod schema to `src/lib/validation.ts`**

```ts
const MapZoneSchema = z.object({
  id: z.string().min(1),
  label: z.string().min(1),
  revealText: z.string().min(1),
  weights: z.array(AnswerWeightSchema).min(1),
});

const MapTapSchema = z.object({
  id: z.string().min(1),
  type: z.literal("map-tap"),
  prompt: z.string().min(1),
  sceneLabel: z.string().min(1),
  zones: z.array(MapZoneSchema).min(2),
});

// Add to QuestionsSchema:
export const QuestionsSchema = z.array(
  z.discriminatedUnion("type", [
    VisualComparisonSchema,
    MultiChoiceGridSchema,
    MiniGameSchema,
    MapTapSchema, // ← new
  ]),
);
```

**Step 3 — Build the component** (`src/components/survey/MapTapGame.tsx`)

Every mini-game component must satisfy this contract:

```tsx
"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { MapTapQuestion, AnswerWeight } from "@/lib/types";

// Contract: receive the typed question + onAnswer callback
interface Props {
  question: MapTapQuestion;
  onAnswer: (selectedId: string, weights: AnswerWeight[]) => void;
}

// Keep phase state LOCAL (useState) — not in the reducer
type Phase = "idle" | "chosen";

export default function MapTapGame({ question, onAnswer }: Props) {
  const [phase, setPhase] = useState<Phase>("idle");
  const [chosen, setChosen] = useState<(typeof question.zones)[0] | null>(null);

  // Gate onAnswer behind a delay so reveal text can be read
  useEffect(() => {
    if (phase === "chosen" && chosen) {
      const t = setTimeout(() => onAnswer(chosen.id, chosen.weights), 1600);
      return () => clearTimeout(t);
    }
  }, [phase, chosen, onAnswer]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-6">
      <h2 className="text-2xl font-bold text-stone-900 text-center mb-8">
        {question.prompt}
      </h2>
      {/* your scene UI */}
      {phase === "idle" &&
        question.zones.map((zone) => (
          <button
            key={zone.id}
            onClick={() => {
              setChosen(zone);
              setPhase("chosen");
            }}
          >
            {zone.label}
          </button>
        ))}
      <AnimatePresence>
        {phase === "chosen" && chosen && (
          <motion.p
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
          >
            {chosen.revealText}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
}
```

**Step 4 — Wire it into `SurveyContainer.tsx`**

Import the component and add a case to the `renderQuestion` switch. **TypeScript will give a compile error if you add a type to the union but forget this step** — the `assertNever` exhaustiveness check in `SurveyContainer` is the enforcement mechanism:

```ts
import MapTapGame from './MapTapGame';

// Inside renderQuestion():
case 'map-tap':
  return <MapTapGame question={question} onAnswer={onAnswer} />;
```

**Step 5 — Add questions to `questions.json`** (same as §2), then verify:

```bash
npx tsc --noEmit
npm run build
npm run dev      # walk through the new question manually
```

---

## Architecture at a Glance

```
src/
├── app/            Pages: landing · survey · results
├── components/
│   ├── survey/     SurveyContainer · ProgressBar · question type components
│   └── results/    CityReveal · DimensionBars · ResultsContent
├── data/           questions.json · cities.json
├── lib/            types.ts · scoring.ts · survey-reducer.ts · validation.ts
└── hooks/          useSurveyState.ts
```

Full architecture details and design decisions → [`CLAUDE.md`](./CLAUDE.md)

---

## Data Validation

All data files are validated at startup via [Zod](https://zod.dev) schemas in `src/lib/validation.ts`. If `questions.json` or `cities.json` fail validation (wrong types, missing fields, out-of-range values, bad hex colors), the app throws a descriptive error immediately rather than producing silent NaN or undefined behavior.

Validation also runs on the URL-encoded answers when the results page loads, catching any corrupt or tampered `?a=` params.
