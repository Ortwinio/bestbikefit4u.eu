import { beforeEach, describe, expect, it, vi } from "vitest";

type TestHandler = (ctx: unknown, args: unknown) => Promise<unknown>;

const { getAuthUserIdMock } = vi.hoisted(() => ({
  getAuthUserIdMock: vi.fn(),
}));

vi.mock("@convex-dev/auth/server", () => ({
  getAuthUserId: getAuthUserIdMock,
}));

import { getMyMessages } from "../queries";

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
  messages,
  targets,
  receipts = [],
  user,
  integration = null,
  fitSessions = [],
}: {
  messages: FakeRecord[];
  targets: FakeRecord[];
  receipts?: FakeRecord[];
  user: FakeRecord | null;
  integration?: FakeRecord | null;
  fitSessions?: FakeRecord[];
}) {
  return {
    db: {
      query: vi.fn((table: string) => {
        switch (table) {
          case "dashboard_messages":
            return { collect: vi.fn(async () => messages) };
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
      get: vi.fn(async () => user),
    },
  };
}

describe("messages.getMyMessages contract", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("filters locale-targeted messages by the active locale", async () => {
    getAuthUserIdMock.mockResolvedValue("user_1");
    const now = Date.now();
    const nlMessage = {
      _id: "msg_nl",
      title: "NL only",
      status: "published",
      locale: "nl",
      priority: "normal",
      type: "banner",
      dismissible: true,
      requiresAcknowledgement: false,
      createdAt: now,
    };
    const enMessage = {
      _id: "msg_en",
      title: "EN only",
      status: "published",
      locale: "en",
      priority: "normal",
      type: "banner",
      dismissible: true,
      requiresAcknowledgement: false,
      createdAt: now,
    };
    const ctx = makeCtx({
      messages: [nlMessage, enMessage],
      targets: [
        { messageId: "msg_nl", targetType: "locale", targetValue: "nl" },
        { messageId: "msg_en", targetType: "locale", targetValue: "en" },
      ],
      user: { _id: "user_1", tier: "free" },
    });
    const handler = (getMyMessages as unknown as { _handler: TestHandler })._handler;

    const nlResult = (await handler(ctx, { locale: "nl" })) as Array<{ _id: string }>;
    const enResult = (await handler(ctx, { locale: "en" })) as Array<{ _id: string }>;

    expect(nlResult.map((item) => item._id)).toEqual(["msg_nl"]);
    expect(enResult.map((item) => item._id)).toEqual(["msg_en"]);
  });

  it("hides acknowledged messages even when acknowledgement was optional", async () => {
    getAuthUserIdMock.mockResolvedValue("user_1");
    const now = Date.now();
    const ctx = makeCtx({
      messages: [
        {
          _id: "msg_1",
          title: "Optional modal",
          status: "published",
          locale: "all",
          priority: "normal",
          type: "modal",
          dismissible: true,
          requiresAcknowledgement: false,
          createdAt: now,
        },
      ],
      targets: [{ messageId: "msg_1", targetType: "all" }],
      receipts: [
        {
          _id: "receipt_1",
          messageId: "msg_1",
          userId: "user_1",
          deliveredAt: now,
          acknowledgedAt: now,
        },
      ],
      user: { _id: "user_1", tier: "free" },
    });
    const handler = (getMyMessages as unknown as { _handler: TestHandler })._handler;

    const result = await handler(ctx, { locale: "en" });

    expect(result).toEqual([]);
  });

  it("treats users without a stored tier as free for plan targeting", async () => {
    getAuthUserIdMock.mockResolvedValue("user_1");
    const now = Date.now();
    const ctx = makeCtx({
      messages: [
        {
          _id: "msg_free",
          title: "Free plan",
          status: "published",
          locale: "all",
          priority: "normal",
          type: "banner",
          dismissible: true,
          requiresAcknowledgement: false,
          createdAt: now,
        },
      ],
      targets: [{ messageId: "msg_free", targetType: "plan", targetValue: "free" }],
      user: { _id: "user_1" },
    });
    const handler = (getMyMessages as unknown as { _handler: TestHandler })._handler;

    const result = (await handler(ctx, { locale: "en" })) as Array<{ _id: string }>;

    expect(result.map((item) => item._id)).toEqual(["msg_free"]);
  });

  it("requires a completed fit for fit_completed targeting", async () => {
    getAuthUserIdMock.mockResolvedValue("user_1");
    const now = Date.now();
    const message = {
      _id: "msg_fit",
      title: "Completed fit only",
      status: "published",
      locale: "all",
      priority: "normal",
      type: "banner",
      dismissible: true,
      requiresAcknowledgement: false,
      createdAt: now,
    };
    const base = {
      messages: [message],
      targets: [{ messageId: "msg_fit", targetType: "fit_completed", targetValue: "true" }],
      user: { _id: "user_1", tier: "free" },
    };
    const handler = (getMyMessages as unknown as { _handler: TestHandler })._handler;

    const inProgressCtx = makeCtx({
      ...base,
      fitSessions: [{ _id: "session_1", userId: "user_1", status: "in_progress" }],
    });
    const completedCtx = makeCtx({
      ...base,
      fitSessions: [{ _id: "session_2", userId: "user_1", status: "completed" }],
    });

    expect(await handler(inProgressCtx, { locale: "en" })).toEqual([]);
    expect(
      (await handler(completedCtx, { locale: "en" })) as Array<{ _id: string }>
    ).toEqual([expect.objectContaining({ _id: "msg_fit" })]);
  });
});
