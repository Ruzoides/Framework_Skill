import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

// Requires UPSTASH_REDIS_REST_URL / UPSTASH_REDIS_REST_TOKEN (see
// references/security.md). Redis.fromEnv() reads those two automatically.
const redis = Redis.fromEnv();

export const authRateLimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(5, "60 s"),
  prefix: "ratelimit:auth",
});

export const apiRateLimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(60, "60 s"),
  prefix: "ratelimit:api",
});
