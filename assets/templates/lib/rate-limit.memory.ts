// In-memory rate limiter. Fine for local development, but each serverless
// instance keeps its own counters, so this is not a true global limit under
// a multi-instance/serverless deployment. Use --ratelimit=upstash for that
// (see references/security.md).
type Bucket = { count: number; resetAt: number };

const buckets = new Map<string, Bucket>();

function makeLimiter(limit: number, windowMs: number) {
  return {
    async limit(key: string) {
      const now = Date.now();
      const bucket = buckets.get(key);
      if (!bucket || now > bucket.resetAt) {
        buckets.set(key, { count: 1, resetAt: now + windowMs });
        return { success: true };
      }
      if (bucket.count >= limit) {
        return { success: false };
      }
      bucket.count += 1;
      return { success: true };
    },
  };
}

export const authRateLimit = makeLimiter(5, 60_000); // 5 attempts / minute
export const apiRateLimit = makeLimiter(60, 60_000); // 60 requests / minute
