// Simple in-memory fixed-window rate limiter. Suitable for a single-instance
// deployment (e.g. one Vercel serverless region under light load) and for
// protecting the admin login + booking endpoints from brute force / abuse.
//
// For multi-instance production scale this should be swapped for a shared
// store (Upstash Redis, etc.) — the interface is intentionally small so that
// swap is contained to this file.

type Bucket = { count: number; resetAt: number };

const buckets = new Map<string, Bucket>();

export type RateLimitResult = {
  success: boolean;
  remaining: number;
  resetAt: number;
};

/**
 * Record a hit for `key` and report whether it is within `limit` per
 * `windowMs`. Buckets are lazily expired.
 */
export function rateLimit(
  key: string,
  limit: number,
  windowMs: number,
): RateLimitResult {
  const now = Date.now();
  const existing = buckets.get(key);

  if (!existing || existing.resetAt <= now) {
    const resetAt = now + windowMs;
    buckets.set(key, { count: 1, resetAt });
    return { success: true, remaining: limit - 1, resetAt };
  }

  existing.count += 1;
  const success = existing.count <= limit;
  return {
    success,
    remaining: Math.max(0, limit - existing.count),
    resetAt: existing.resetAt,
  };
}

/** Clear a key's bucket (e.g. after a successful login). */
export function resetRateLimit(key: string): void {
  buckets.delete(key);
}

// Periodically sweep expired buckets so the map does not grow unbounded.
// Guarded so it only registers once and never blocks process exit.
const globalForRl = globalThis as unknown as { __rlSweep?: boolean };
if (!globalForRl.__rlSweep) {
  globalForRl.__rlSweep = true;
  const timer = setInterval(() => {
    const now = Date.now();
    for (const [key, bucket] of buckets) {
      if (bucket.resetAt <= now) buckets.delete(key);
    }
  }, 60_000);
  // Do not keep the event loop alive solely for the sweep.
  if (typeof timer.unref === "function") timer.unref();
}
