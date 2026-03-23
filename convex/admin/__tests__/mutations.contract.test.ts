import { beforeEach, describe, expect, it, vi } from "vitest";

type TestHandler = (ctx: unknown, args: unknown) => Promise<unknown>;

const { getAuthUserIdMock } = vi.hoisted(() => ({
  getAuthUserIdMock: vi.fn(),
}));

vi.mock("@convex-dev/auth/server", () => ({
  getAuthUserId: getAuthUserIdMock,
}));

import {
  addFeedbackComment,
  createDashboardMessage,
  linkFeedbackToRelease,
  updateReleaseStatus,
} from "../mutations";

type FakeRecord = Record<string, unknown>;

function makeIndexQuery<T extends FakeRecord>(rows: T[]) {
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
      const filtered = rows.filter((row) => filters.every(([field, value]) => row[field] === value));
      return {
        collect: vi.fn(async () => filtered),
      };
    }),
  };
}

function makeCtx({
  release = null,
  feedbackItems = {},
  releaseItems = [],
}: {
  release?: FakeRecord | null;
  feedbackItems?: Record<string, FakeRecord | null>;
  releaseItems?: FakeRecord[];
}) {
  const insertCalls: Array<[string, FakeRecord]> = [];
  const patchCalls: Array<[string, FakeRecord]> = [];
  const db = {
    get: vi.fn(async (id: string) => {
      if (id === "admin_1") {
        return {
          _id: "admin_1",
          email: "admin@example.com",
          name: "Admin",
          adminRole: "super_admin",
        };
      }
      if (id === "release_1") return release;
      if (id in feedbackItems) return feedbackItems[id] ?? null;
      return null;
    }),
    query: vi.fn((table: string) => {
      switch (table) {
        case "release_items":
          return makeIndexQuery(releaseItems);
        case "message_targets":
          return makeIndexQuery([]);
        default:
          throw new Error(`Unhandled table ${table}`);
      }
    }),
    insert: vi.fn(async (table: string, doc: FakeRecord) => {
      insertCalls.push([table, doc]);
      if (table === "dashboard_messages") return "message_1";
      if (table === "message_targets") return "target_1";
      if (table === "feedback_comments") return "comment_1";
      if (table === "release_items") return "release_item_1";
      return `${table}_1`;
    }),
    patch: vi.fn(async (id: string, patch: FakeRecord) => {
      patchCalls.push([id, patch]);
    }),
    delete: vi.fn(async () => undefined),
  };

  return {
    db,
    insertCalls,
    patchCalls,
  };
}

describe("admin mutations", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    getAuthUserIdMock.mockResolvedValue("admin_1");
  });

  it("publishes direct dashboard messages immediately when they are scheduled for now", async () => {
    const ctx = makeCtx({});
    const handler = (createDashboardMessage as unknown as { _handler: TestHandler })._handler;

    await handler(ctx, {
      title: "Hello",
      body: "Direct update",
      type: "banner",
      priority: "normal",
      locale: "all",
      dismissible: true,
      requiresAcknowledgement: false,
      startsAt: Date.now() - 1000,
      targets: [{ targetType: "user", targetValue: "user_1" }],
    });

    expect(ctx.db.insert).toHaveBeenCalledWith(
      "dashboard_messages",
      expect.objectContaining({
        status: "published",
        publishedAt: expect.any(Number),
        title: "Hello",
      })
    );
    expect(ctx.db.insert).toHaveBeenCalledWith(
      "message_targets",
      expect.objectContaining({
        targetType: "user",
        targetValue: "user_1",
      })
    );
  });

  it("creates dashboard-visible support reply notifications for public feedback comments", async () => {
    const ctx = makeCtx({
      feedbackItems: {
        feedback_1: {
          _id: "feedback_1",
          userId: "user_2",
          title: "Fit issue",
          linkedReleaseId: "release_1",
        },
      },
    });
    const handler = (addFeedbackComment as unknown as { _handler: TestHandler })._handler;

    await handler(ctx, {
      feedbackItemId: "feedback_1",
      body: "We have fixed this in the new release.",
      isInternal: false,
    });

    expect(ctx.db.insert).toHaveBeenCalledWith(
      "feedback_comments",
      expect.objectContaining({
        feedbackItemId: "feedback_1",
        body: "We have fixed this in the new release.",
        isInternal: false,
      })
    );
    expect(ctx.db.insert).toHaveBeenCalledWith(
      "dashboard_messages",
      expect.objectContaining({
        type: "support_reply",
        status: "published",
        linkedReleaseId: "release_1",
        linkedFeedbackItemId: "feedback_1",
      })
    );
    expect(ctx.db.insert).toHaveBeenCalledWith(
      "message_targets",
      expect.objectContaining({
        targetType: "user",
        targetValue: "user_2",
      })
    );
  });

  it("keeps internal feedback comments admin-only", async () => {
    const ctx = makeCtx({
      feedbackItems: {
        feedback_1: {
          _id: "feedback_1",
          userId: "user_2",
          title: "Fit issue",
        },
      },
    });
    const handler = (addFeedbackComment as unknown as { _handler: TestHandler })._handler;

    await handler(ctx, {
      feedbackItemId: "feedback_1",
      body: "Internal note only",
      isInternal: true,
    });

    expect(
      ctx.db.insert.mock.calls.some(([table]) => table === "dashboard_messages")
    ).toBe(false);
  });

  it("releases linked feedback items when a release goes live", async () => {
    const ctx = makeCtx({
      release: {
        _id: "release_1",
        status: "approved",
      },
      feedbackItems: {
        feedback_1: {
          _id: "feedback_1",
          userId: "user_2",
          title: "Fit issue",
          linkedReleaseId: "release_1",
          status: "planned",
        },
      },
      releaseItems: [
        {
          releaseId: "release_1",
          itemType: "feedback_item",
          itemId: "feedback_1",
        },
      ],
    });
    const handler = (updateReleaseStatus as unknown as { _handler: TestHandler })._handler;

    await handler(ctx, {
      releaseId: "release_1",
      status: "live",
    });

    expect(ctx.db.patch).toHaveBeenCalledWith(
      "release_1",
      expect.objectContaining({
        status: "live",
        liveAt: expect.any(Number),
      })
    );
    expect(ctx.db.patch).toHaveBeenCalledWith(
      "feedback_1",
      expect.objectContaining({
        status: "released",
        linkedReleaseId: "release_1",
      })
    );
  });

  it("rejects reopening archived releases", async () => {
    const ctx = makeCtx({
      release: {
        _id: "release_1",
        status: "archived",
      },
    });
    const handler = (updateReleaseStatus as unknown as { _handler: TestHandler })._handler;

    await expect(
      handler(ctx, {
        releaseId: "release_1",
        status: "live",
      })
    ).rejects.toThrow("Not allowed to transition release from archived to live");
  });

  it("marks feedback released when a live release gets another linked feedback item", async () => {
    const ctx = makeCtx({
      release: {
        _id: "release_1",
        status: "live",
      },
      feedbackItems: {
        feedback_1: {
          _id: "feedback_1",
          userId: "user_2",
          title: "Fit issue",
          status: "triaged",
        },
      },
    });
    const handler = (linkFeedbackToRelease as unknown as { _handler: TestHandler })._handler;

    await handler(ctx, {
      feedbackItemId: "feedback_1",
      releaseId: "release_1",
    });

    expect(ctx.db.patch).toHaveBeenCalledWith(
      "feedback_1",
      expect.objectContaining({
        status: "released",
      })
    );
  });
});
