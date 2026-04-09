type RateLimitResult = {
  allowed: boolean;
  remaining: number | null;
  retryAfterSeconds: number | null;
  degraded: boolean;
  mode: "memory" | "upstash" | "fail_open";
};

type RateLimitArgs = {
  scope: string;
  key: string;
  limit: number;
  windowMs: number;
};

type MemoryEntry = {
  count: number;
  resetAt: number;
};

const memoryBuckets = new Map<string, MemoryEntry>();

function shouldUseMemoryRateLimiter() {
  return (
    process.env.PUBLIC_FIT_RATE_LIMIT_MODE === "memory" ||
    process.env.NODE_ENV === "test"
  );
}

function getBucketKey(scope: string, key: string) {
  return `${scope}:${key}`;
}

function consumeMemoryRateLimit({
  scope,
  key,
  limit,
  windowMs,
}: RateLimitArgs): RateLimitResult {
  const bucketKey = getBucketKey(scope, key);
  const now = Date.now();
  const existing = memoryBuckets.get(bucketKey);

  if (!existing || existing.resetAt <= now) {
    memoryBuckets.set(bucketKey, {
      count: 1,
      resetAt: now + windowMs,
    });
    return {
      allowed: true,
      remaining: limit - 1,
      retryAfterSeconds: null,
      degraded: false,
      mode: "memory",
    };
  }

  if (existing.count >= limit) {
    return {
      allowed: false,
      remaining: 0,
      retryAfterSeconds: Math.max(1, Math.ceil((existing.resetAt - now) / 1000)),
      degraded: false,
      mode: "memory",
    };
  }

  existing.count += 1;
  memoryBuckets.set(bucketKey, existing);
  return {
    allowed: true,
    remaining: Math.max(0, limit - existing.count),
    retryAfterSeconds: null,
    degraded: false,
    mode: "memory",
  };
}

async function consumeUpstashRateLimit({
  scope,
  key,
  limit,
  windowMs,
}: RateLimitArgs): Promise<RateLimitResult> {
  const baseUrl = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;

  if (!baseUrl || !token) {
    return {
      allowed: true,
      remaining: null,
      retryAfterSeconds: null,
      degraded: true,
      mode: "fail_open",
    };
  }

  const bucketKey = getBucketKey(scope, key);

  try {
    const response = await fetch(`${baseUrl}/pipeline`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify([
        ["INCR", bucketKey],
        ["PEXPIRE", bucketKey, windowMs, "NX"],
        ["PTTL", bucketKey],
      ]),
      cache: "no-store",
    });

    if (!response.ok) {
      throw new Error(`upstash_status_${response.status}`);
    }

    const results = (await response.json()) as Array<{ result?: number | string }>;
    const count = Number(results[0]?.result ?? 0);
    const ttlMs = Number(results[2]?.result ?? windowMs);

    if (!Number.isFinite(count) || !Number.isFinite(ttlMs)) {
      throw new Error("upstash_invalid_response");
    }

    if (count > limit) {
      return {
        allowed: false,
        remaining: 0,
        retryAfterSeconds: Math.max(1, Math.ceil(ttlMs / 1000)),
        degraded: false,
        mode: "upstash",
      };
    }

    return {
      allowed: true,
      remaining: Math.max(0, limit - count),
      retryAfterSeconds: null,
      degraded: false,
      mode: "upstash",
    };
  } catch (error) {
    console.warn("Rate limiter degraded to fail-open mode.", {
      scope,
      error: error instanceof Error ? error.message : String(error),
    });
    return {
      allowed: true,
      remaining: null,
      retryAfterSeconds: null,
      degraded: true,
      mode: "fail_open",
    };
  }
}

export async function consumeRateLimit(args: RateLimitArgs): Promise<RateLimitResult> {
  if (shouldUseMemoryRateLimiter()) {
    return consumeMemoryRateLimit(args);
  }

  return consumeUpstashRateLimit(args);
}

export function resetMemoryRateLimiterForTests() {
  memoryBuckets.clear();
}
