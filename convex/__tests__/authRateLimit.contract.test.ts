import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { consumeEmailVerificationRequest } from "../authRateLimit";

type TestHandler = (ctx: unknown, args: unknown) => Promise<unknown>;

type RateLimitDoc = {
  _id: string;
  identifier: string;
  attemptsLeft: number;
  lastAttemptTime: number;
};

function makeCtx(existingLimit: RateLimitDoc | null) {
  const unique = vi.fn(async () => existingLimit);
  const withIndex = vi.fn((_indexName: string, indexPredicate: (q: { eq: (field: string, value: unknown) => unknown }) => unknown) => {
    indexPredicate({
      eq: (field: string, value: unknown) => ({ field, value }),
    });
    return { unique };
  });

  const db = {
    query: vi.fn((table: string) => {
      if (table !== "authRateLimits") {
        throw new Error(`Unexpected table query: ${table}`);
      }
      return { withIndex };
    }),
    insert: vi.fn(async (_table: string, _doc: Record<string, unknown>) => "rate_limit_1"),
    patch: vi.fn(
      async (_id: string, _updates: { attemptsLeft: number; lastAttemptTime: number }) =>
        undefined
    ),
  };

  return { db, unique, withIndex } as const;
}

describe("authRateLimit.consumeEmailVerificationRequest contract", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("creates a new durable limit record for first request", async () => {
    const now = 1_000_000;
    vi.spyOn(Date, "now").mockReturnValue(now);

    const ctx = makeCtx(null);
    const handler = (consumeEmailVerificationRequest as unknown as { _handler: TestHandler })
      ._handler;

    await handler(ctx, { email: " Rider@Example.com " });

    expect(ctx.db.insert).toHaveBeenCalledWith("authRateLimits", {
      identifier: "email_verification:rider@example.com",
      attemptsLeft: 2,
      lastAttemptTime: now,
    });
    expect(ctx.db.patch).not.toHaveBeenCalled();
  });

  it("decrements available attempts when under limit", async () => {
    const now = 2_000_000;
    vi.spyOn(Date, "now").mockReturnValue(now);

    const ctx = makeCtx({
      _id: "limit_1",
      identifier: "email_verification:rider@example.com",
      attemptsLeft: 2,
      lastAttemptTime: now - 60_000,
    });
    const handler = (consumeEmailVerificationRequest as unknown as { _handler: TestHandler })
      ._handler;

    await handler(ctx, { email: "rider@example.com" });

    const patchCall = ctx.db.patch.mock.calls[0];
    expect(patchCall).toBeDefined();

    const [patchedId, patchUpdates] = patchCall!;
    expect(patchedId).toBe("limit_1");
    expect(patchUpdates.attemptsLeft).toBeCloseTo(1.2, 5);
    expect(patchUpdates).toEqual(
      expect.objectContaining({
        lastAttemptTime: now,
      })
    );
  });

  it("rejects requests when no attempts are available", async () => {
    const now = 3_000_000;
    vi.spyOn(Date, "now").mockReturnValue(now);

    const ctx = makeCtx({
      _id: "limit_2",
      identifier: "email_verification:rider@example.com",
      attemptsLeft: 0,
      lastAttemptTime: now - 60_000,
    });
    const handler = (consumeEmailVerificationRequest as unknown as { _handler: TestHandler })
      ._handler;

    await expect(handler(ctx, { email: "rider@example.com" })).rejects.toThrow(
      "Too many verification requests. Please try again later."
    );
    expect(ctx.db.patch).not.toHaveBeenCalled();
  });

  it("allows request after window refill", async () => {
    const now = 4_000_000;
    vi.spyOn(Date, "now").mockReturnValue(now);

    const ctx = makeCtx({
      _id: "limit_3",
      identifier: "email_verification:rider@example.com",
      attemptsLeft: 0,
      lastAttemptTime: now - 15 * 60 * 1000,
    });
    const handler = (consumeEmailVerificationRequest as unknown as { _handler: TestHandler })
      ._handler;

    await handler(ctx, { email: "rider@example.com" });

    expect(ctx.db.patch).toHaveBeenCalledWith("limit_3", {
      attemptsLeft: 2,
      lastAttemptTime: now,
    });
  });
});
