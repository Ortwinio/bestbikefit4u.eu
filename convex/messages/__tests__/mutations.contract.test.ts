import { beforeEach, describe, expect, it, vi } from "vitest";

type TestHandler = (ctx: unknown, args: unknown) => Promise<unknown>;

const { getAuthUserIdMock } = vi.hoisted(() => ({
  getAuthUserIdMock: vi.fn(),
}));

vi.mock("@convex-dev/auth/server", () => ({
  getAuthUserId: getAuthUserIdMock,
}));

import { markMessageDismissed } from "../mutations";

type FakeRecord = Record<string, unknown>;

function makeIndexQuery<T extends FakeRecord>(
  rows: T[],
  mode: "collect" | "unique" = "collect"
) {
  return {
    withIndex: vi.fn((_indexName: string, build?: (q: { eq: (field: string, value: unknown) => unknown }) => unknown) => {
      const filters: Array<[string, unknown]> = [];
      const builder = {
        eq(field: string, value: unknown) {
          filters.push([field, value]);
          return builder;
        },
      };
      build?.(builder);
      const filtered = rows.filter((row) =>
        filters.every(([field, value]) => row[field] === value)
      );

      return mode === "unique"
        ? { unique: vi.fn(async () => filtered[0] ?? null) }
        : { collect: vi.fn(async () => filtered) };
    }),
  };
}

function makeCtx({
  message,
  targets,
  receipts = [],
  user,
  integration = null,
  fitSessions = [],
}: {
  message: FakeRecord | null;
  targets: FakeRecord[];
  receipts?: FakeRecord[];
  user: FakeRecord | null;
  integration?: FakeRecord | null;
  fitSessions?: FakeRecord[];
}) {
  return {
    db: {
      get: vi.fn(async (id: string) => {
        if (id === "user_1") return user;
        if (id === "msg_1") return message;
        return null;
      }),
      query: vi.fn((table: string) => {
        switch (table) {
          case "message_targets":
            return makeIndexQuery(targets);
          case "message_receipts":
            return makeIndexQuery(receipts);
          case "integrations":
            return makeIndexQuery(integration ? [integration] : [], "unique");
          case "fitSessions":
            return makeIndexQuery(fitSessions);
          default:
            throw new Error(`Unhandled table ${table}`);
        }
      }),
      insert: vi.fn(async () => "receipt_new"),
      patch: vi.fn(async () => {}),
      delete: vi.fn(async () => {}),
    },
  };
}

describe("messages.markMessageDismissed contract", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("rejects receipt creation for an untargeted message", async () => {
    getAuthUserIdMock.mockResolvedValue("user_1");
    const now = Date.now();
    const ctx = makeCtx({
      message: {
        _id: "msg_1",
        status: "published",
        locale: "all",
        priority: "normal",
        type: "banner",
        dismissible: true,
        requiresAcknowledgement: false,
        createdAt: now,
      },
      targets: [{ messageId: "msg_1", targetType: "user", targetValue: "user_2" }],
      user: { _id: "user_1", tier: "free" },
    });
    const handler = (markMessageDismissed as unknown as { _handler: TestHandler })._handler;

    await expect(handler(ctx, { messageId: "msg_1" })).rejects.toThrow("Message not available");
    expect(ctx.db.insert).not.toHaveBeenCalled();
    expect(ctx.db.patch).not.toHaveBeenCalled();
  });
});
