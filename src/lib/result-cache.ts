// Persists a successful quiz result in localStorage so a returning user sees
// their match immediately instead of re-taking the quiz. Bump CACHE_VERSION
// whenever the scoring model or questions change in a way that would
// invalidate stored results.

const CACHE_KEY = "citymatch:last-result";
const CACHE_VERSION = 1;
const TTL_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

interface CacheEntry {
  encodedAnswers: string;
  timestamp: number;
  version: number;
}

export function readResultCache(): string | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const entry = JSON.parse(raw) as CacheEntry;
    if (entry.version !== CACHE_VERSION) return null;
    if (Date.now() - entry.timestamp > TTL_MS) return null;
    if (typeof entry.encodedAnswers !== "string" || !entry.encodedAnswers)
      return null;
    return entry.encodedAnswers;
  } catch {
    return null;
  }
}

export function writeResultCache(encodedAnswers: string): void {
  if (typeof window === "undefined") return;
  try {
    const entry: CacheEntry = {
      encodedAnswers,
      timestamp: Date.now(),
      version: CACHE_VERSION,
    };
    window.localStorage.setItem(CACHE_KEY, JSON.stringify(entry));
  } catch {
    /* storage quota / private mode — silently skip */
  }
}

export function clearResultCache(): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(CACHE_KEY);
  } catch {
    /* no-op */
  }
}
