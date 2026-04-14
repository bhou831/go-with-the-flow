'use client';

import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import citiesData from '@/data/cities.json';
import { findMatchingCity } from '@/lib/scoring';
import CityReveal from './CityReveal';
import type { City, RecordedAnswer } from '@/lib/types';

const cities = citiesData as City[];

export default function ResultsContent() {
  const searchParams = useSearchParams();
  const encoded = searchParams.get('a');

  if (!encoded) {
    return (
      <main className="flex flex-col items-center justify-center min-h-screen px-6 text-center">
        <p className="text-stone-500 mb-4">No survey answers found.</p>
        <Link href="/survey" className="text-stone-900 font-semibold underline">
          Take the survey
        </Link>
      </main>
    );
  }

  let answers: RecordedAnswer[];
  try {
    answers = JSON.parse(atob(encoded)) as RecordedAnswer[];
  } catch {
    return (
      <main className="flex flex-col items-center justify-center min-h-screen px-6 text-center">
        <p className="text-stone-500 mb-4">Something went wrong reading your answers.</p>
        <Link href="/survey" className="text-stone-900 font-semibold underline">
          Try again
        </Link>
      </main>
    );
  }

  const { city, userVector } = findMatchingCity(answers, cities);

  return <CityReveal city={city} userVector={userVector} />;
}
