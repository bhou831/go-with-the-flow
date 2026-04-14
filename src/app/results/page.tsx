import { Suspense } from 'react';
import ResultsContent from '@/components/results/ResultsContent';

export default function ResultsPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-screen bg-stone-900">
          <p className="text-stone-400 text-sm">Calculating your match…</p>
        </div>
      }
    >
      <ResultsContent />
    </Suspense>
  );
}
