'use client';

import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import citiesData from '@/data/cities.json';
import { findMatchingCity } from '@/lib/scoring';
import CityReveal from './CityReveal';
import { CitiesSchema, RecordedAnswersSchema } from '@/lib/validation';
import type { City } from '@/lib/types';

const cities = CitiesSchema.parse(citiesData) as City[];

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

  let answers: ReturnType<typeof RecordedAnswersSchema.parse>;
  try {
    answers = RecordedAnswersSchema.parse(JSON.parse(atob(encoded)));
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

  const { city, userVector, topCities } = findMatchingCity(answers, cities);

  return <CityReveal city={city} userVector={userVector} topCities={topCities} />;
}
