import Link from 'next/link';

export default function LandingPage() {
  return (
    <main className="flex flex-col items-center justify-center min-h-screen px-6 text-center bg-stone-50">
      <div className="max-w-lg">
        <div className="text-6xl mb-6">🌍</div>
        <h1 className="text-4xl font-bold tracking-tight text-stone-900 mb-4">
          Which city are you?
        </h1>
        <p className="text-lg text-stone-500 mb-10 leading-relaxed">
          8 questions. One city match. Discover whether you belong in Tokyo&apos;s electric grids,
          Amsterdam&apos;s canal lanes, or somewhere else entirely.
        </p>
        <Link
          href="/survey"
          className="inline-block bg-stone-900 text-white px-8 py-4 rounded-2xl text-lg font-semibold
                     hover:bg-stone-700 active:scale-95 transition-all duration-150
                     focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-stone-900 focus-visible:ring-offset-2"
        >
          Find My City
        </Link>
        <p className="mt-6 text-sm text-stone-400">No login. No email. Just vibes.</p>
      </div>
    </main>
  );
}
