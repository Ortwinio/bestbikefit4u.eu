import { beforeEach, describe, expect, it, vi } from "vitest";

type TestHandler = (ctx: unknown, args: unknown) => Promise<unknown>;

const { getAuthUserIdMock } = vi.hoisted(() => ({
  getAuthUserIdMock: vi.fn(),
}));

vi.mock("@convex-dev/auth/server", () => ({
  getAuthUserId: getAuthUserIdMock,
}));

import { submitFeedback, upvoteFeedbackItem } from "../mutations";

function makeCtx(params?: {
  bike?: { _id: string; userId: string } | null;
  session?: { _id: string; userId: string } | null;
  feedbackItem?: { _id: string; type: string; status: string } | null;
  existingUpvote?: { _id: string } | null;
  collectedUpvotes?: Array<{ _id: string; feedbackItemId: string; userId: string }>;
}) {
  const {
    bike = null,
    session = null,
    feedbackItem = null,
    existingUpvote = null,
    collectedUpvotes = [],
  } = params ?? {};

  return {
    db: {
      get: vi.fn(async (id: string) => {
        if (bike && id === bike._id) return bike;
        if (session && id === session._id) return session;
        if (feedbackItem && id === feedbackItem._id) return feedbackItem;
        return null;
      }),
      insert: vi.fn(async () => "feedback_1"),
      patch: vi.fn(async () => undefined),
      delete: vi.fn(async () => undefined),
      query: vi.fn((table: string) => {
        if (table !== "feedback_upvotes") {
          throw new Error(`Unexpected table query: ${table}`);
        }
        return {
          withIndex: vi.fn((indexName: string) => {
            if (indexName === "by_user_and_feedback") {
              return { unique: vi.fn(async () => existingUpvote) };
            }
            if (indexName === "by_feedback_item") {
              return { collect: vi.fn(async () => collectedUpvotes) };
            }
            throw new Error(`Unexpected index ${indexName}`);
          }),
        };
      }),
    },
  };
}

describe("feedback mutations contract", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    getAuthUserIdMock.mockResolvedValue("user_1");
  });

  it("rejects linking a bike owned by another user", async () => {
    const ctx = makeCtx({
      bike: { _id: "bike_2", userId: "user_2" },
    });
    const handler = (submitFeedback as unknown as { _handler: TestHandler })._handler;

    await expect(
      handler(ctx, {
        type: "bug",
        title: "Broken",
        description: "Details",
        linkedBikeId: "bike_2",
      })
    ).rejects.toThrow("Invalid linked bike");
  });

  it("rejects linking a fit session owned by another user", async () => {
    const ctx = makeCtx({
      session: { _id: "session_2", userId: "user_2" },
    });
    const handler = (submitFeedback as unknown as { _handler: TestHandler })._handler;

    await expect(
      handler(ctx, {
        type: "support_case",
        title: "Help",
        description: "Details",
        linkedSessionId: "session_2",
      })
    ).rejects.toThrow("Invalid linked session");
  });

  it("rejects upvotes for closed feature requests", async () => {
    const ctx = makeCtx({
      feedbackItem: { _id: "feedback_2", type: "feature_request", status: "closed" },
    });
    const handler = (upvoteFeedbackItem as unknown as { _handler: TestHandler })._handler;

    await expect(handler(ctx, { feedbackItemId: "feedback_2" })).rejects.toThrow(
      "This feature request can no longer be voted on"
    );
  });
});
