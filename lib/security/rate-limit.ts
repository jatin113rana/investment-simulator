const buckets = new Map<string, { count: number; resetAt: number }>();

interface RateLimitResult {
  allowed: boolean;
  retryAfterSeconds: number;
}

export function consumeRateLimit(key: string, limit: number, windowMs: number): RateLimitResult {
  const now = Date.now();
  const current = buckets.get(key);

  if (!current || current.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return { allowed: true, retryAfterSeconds: 0 };
  }

  if (current.count >= limit) {
    return {
      allowed: false,
      retryAfterSeconds: Math.max(1, Math.ceil((current.resetAt - now) / 1000)),
    };
  }

  current.count += 1;
  return { allowed: true, retryAfterSeconds: 0 };
}

export function getRequestIdentifier(request: Request): string {
  const forwardedFor = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  return forwardedFor || request.headers.get("x-real-ip") || "unknown-client";
}

export function assertRateLimit(result: RateLimitResult): void {
  if (!result.allowed) {
    const error = new Error(`Too many requests. Try again in ${result.retryAfterSeconds} seconds.`);
    (error as Error & { code?: string; retryAfterSeconds?: number }).code = "RATE_LIMITED";
    (error as Error & { code?: string; retryAfterSeconds?: number }).retryAfterSeconds = result.retryAfterSeconds;
    throw error;
  }
}
