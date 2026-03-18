import { beforeEach, describe, expect, it, vi } from "vitest";

type TestHandler = (ctx: unknown, args: unknown) => Promise<unknown>;

const { getAuthUserIdMock } = vi.hoisted(() => ({
  getAuthUserIdMock: vi.fn(),
}));

vi.mock("@convex-dev/auth/server", () => ({
  getAuthUserId: getAuthUserIdMock,
}));

import { getShadowComparisonBySession } from "../queries";

describe("recommendations.getShadowComparisonBySession contract", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns null for unauthenticated requests", async () => {
    getAuthUserIdMock.mockResolvedValue(null);
    const ctx = { db: { get: vi.fn(), query: vi.fn() } };
    const handler =
      (getShadowComparisonBySession as unknown as { _handler: TestHandler })
        ._handler;

    const result = await handler(ctx, { sessionId: "session_1" });
    expect(result).toBeNull();
    expect(ctx.db.get).not.toHaveBeenCalled();
  });

  it("returns the latest shadow comparison for the owner", async () => {
    getAuthUserIdMock.mockResolvedValue("user_1");
    const latest = { _id: "shadow_2", sessionId: "session_1", createdAt: 2 };
    const earlier = { _id: "shadow_1", sessionId: "session_1", createdAt: 1 };
    const ctx = {
      db: {
        get: vi.fn(async () => ({ _id: "session_1", userId: "user_1" })),
        query: vi.fn(() => ({
          withIndex: vi.fn(() => ({
            collect: vi.fn(async () => [earlier, latest]),
          })),
        })),
      },
    };
    const handler =
      (getShadowComparisonBySession as unknown as { _handler: TestHandler })
        ._handler;

    const result = await handler(ctx, { sessionId: "session_1" });
    expect(result).toEqual(latest);
  });
});
