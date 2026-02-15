import { beforeEach, describe, expect, it, vi } from "vitest";

type TestHandler = (ctx: unknown, args: unknown) => Promise<unknown>;

const { getAuthUserIdMock } = vi.hoisted(() => ({
  getAuthUserIdMock: vi.fn(),
}));

vi.mock("@convex-dev/auth/server", () => ({
  getAuthUserId: getAuthUserIdMock,
}));

import { getBySession } from "../queries";

function makeQueryResult(recommendation: unknown) {
  return {
    withIndex: vi.fn(() => ({
      unique: vi.fn(async () => recommendation),
    })),
  };
}

describe("recommendations.getBySession contract", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns null for unauthenticated requests", async () => {
    getAuthUserIdMock.mockResolvedValue(null);
    const ctx = {
      db: {
        get: vi.fn(),
        query: vi.fn(),
      },
    };
    const handler = (getBySession as unknown as { _handler: TestHandler })._handler;

    const result = await handler(ctx, { sessionId: "session_1" });
    expect(result).toBeNull();
    expect(ctx.db.get).not.toHaveBeenCalled();
  });

  it("returns null when session belongs to another user", async () => {
    getAuthUserIdMock.mockResolvedValue("user_1");
    const ctx = {
      db: {
        get: vi.fn(async () => ({ _id: "session_1", userId: "user_2" })),
        query: vi.fn(() => makeQueryResult({ _id: "rec_1" })),
      },
    };
    const handler = (getBySession as unknown as { _handler: TestHandler })._handler;

    const result = await handler(ctx, { sessionId: "session_1" });
    expect(result).toBeNull();
    expect(ctx.db.query).not.toHaveBeenCalled();
  });

  it("returns recommendation for owner session", async () => {
    getAuthUserIdMock.mockResolvedValue("user_1");
    const recommendation = { _id: "rec_1", sessionId: "session_1" };
    const ctx = {
      db: {
        get: vi.fn(async () => ({ _id: "session_1", userId: "user_1" })),
        query: vi.fn(() => makeQueryResult(recommendation)),
      },
    };
    const handler = (getBySession as unknown as { _handler: TestHandler })._handler;

    const result = await handler(ctx, { sessionId: "session_1" });
    expect(result).toEqual(recommendation);
  });
});
