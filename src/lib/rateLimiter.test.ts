import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { consumeRateLimit, resetMemoryRateLimiterForTests } from "./rateLimiter";

describe("rateLimiter", () => {
  beforeEach(() => {
    resetMemoryRateLimiterForTests();
    delete process.env.UPSTASH_REDIS_REST_URL;
    delete process.env.UPSTASH_REDIS_REST_TOKEN;
    delete process.env.PUBLIC_FIT_RATE_LIMIT_MODE;
    vi.unstubAllEnvs();
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    vi.restoreAllMocks();
  });

  it("enforces the in-memory rate limit in test mode", async () => {
    const first = await consumeRateLimit({
      scope: "public-fit",
      key: "abc",
      limit: 3,
      windowMs: 5 * 60 * 1000,
    });
    const second = await consumeRateLimit({
      scope: "public-fit",
      key: "abc",
      limit: 3,
      windowMs: 5 * 60 * 1000,
    });
    const third = await consumeRateLimit({
      scope: "public-fit",
      key: "abc",
      limit: 3,
      windowMs: 5 * 60 * 1000,
    });
    const fourth = await consumeRateLimit({
      scope: "public-fit",
      key: "abc",
      limit: 3,
      windowMs: 5 * 60 * 1000,
    });

    expect(first.allowed).toBe(true);
    expect(second.allowed).toBe(true);
    expect(third.allowed).toBe(true);
    expect(fourth.allowed).toBe(false);
    expect(fourth.retryAfterSeconds).toBeGreaterThan(0);
    expect(fourth.mode).toBe("memory");
  });

  it("fails open with a warning when the remote rate limiter is unavailable", async () => {
    vi.stubEnv("NODE_ENV", "production");
    const fetchSpy = vi.spyOn(global, "fetch").mockRejectedValue(new Error("offline"));
    const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});

    process.env.UPSTASH_REDIS_REST_URL = "https://redis.example.com";
    process.env.UPSTASH_REDIS_REST_TOKEN = "token";

    const result = await consumeRateLimit({
      scope: "public-fit",
      key: "xyz",
      limit: 3,
      windowMs: 5 * 60 * 1000,
    });

    expect(fetchSpy).toHaveBeenCalledTimes(1);
    expect(result).toEqual({
      allowed: true,
      remaining: null,
      retryAfterSeconds: null,
      degraded: true,
      mode: "fail_open",
    });
    expect(warnSpy).toHaveBeenCalledWith("Rate limiter degraded to fail-open mode.", {
      scope: "public-fit",
      error: "offline",
    });
  });
});
