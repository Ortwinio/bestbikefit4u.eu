import { beforeEach, describe, expect, it, vi } from "vitest";

type TestHandler = (ctx: unknown, args: unknown) => Promise<unknown>;

const { getAuthUserIdMock } = vi.hoisted(() => ({
  getAuthUserIdMock: vi.fn(),
}));

vi.mock("@convex-dev/auth/server", () => ({
  getAuthUserId: getAuthUserIdMock,
}));

import { getById } from "../queries";

describe("sessions.getById contract", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns null for unauthenticated requests", async () => {
    getAuthUserIdMock.mockResolvedValue(null);
    const ctx = {
      db: { get: vi.fn() },
    };
    const handler = (getById as unknown as { _handler: TestHandler })._handler;

    const result = await handler(ctx, { sessionId: "session_1" });
    expect(result).toBeNull();
    expect(ctx.db.get).not.toHaveBeenCalled();
  });

  it("returns null when session does not belong to current user", async () => {
    getAuthUserIdMock.mockResolvedValue("user_1");
    const ctx = {
      db: {
        get: vi.fn(async () => ({ _id: "session_1", userId: "user_2" })),
      },
    };
    const handler = (getById as unknown as { _handler: TestHandler })._handler;

    const result = await handler(ctx, { sessionId: "session_1" });
    expect(result).toBeNull();
  });

  it("returns session for owner", async () => {
    getAuthUserIdMock.mockResolvedValue("user_1");
    const session = { _id: "session_1", userId: "user_1", status: "in_progress" };
    const ctx = {
      db: {
        get: vi.fn(async () => session),
      },
    };
    const handler = (getById as unknown as { _handler: TestHandler })._handler;

    const result = await handler(ctx, { sessionId: "session_1" });
    expect(result).toEqual(session);
  });
});
