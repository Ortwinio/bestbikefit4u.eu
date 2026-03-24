import { beforeEach, describe, expect, it, vi } from "vitest";

type TestHandler = (ctx: unknown, args: unknown) => Promise<unknown>;

const { getAuthUserIdMock } = vi.hoisted(() => ({
  getAuthUserIdMock: vi.fn(),
}));

vi.mock("@convex-dev/auth/server", () => ({
  getAuthUserId: getAuthUserIdMock,
}));

import { getPublicFeedbackDetail } from "../queries";

function makeCtx() {
  return {
    db: {
      get: vi.fn(async (id: string) => {
        if (id === "feedback_1") {
          return {
            _id: "feedback_1",
            userId: "user_1",
            type: "bug",
            title: "Broken title",
            description: "Broken description",
            status: "new",
            linkedReleaseId: "release_1",
            routeFamily: "fit_results",
            activitySummary: "User opened fit results and reported an issue.",
            contextCompleteness: "high",
            contactEmail: "rider@example.com",
            createdAt: 100,
          };
        }
        if (id === "user_team") {
          return {
            _id: "user_team",
            displayName: "Support Team",
            email: "support@example.com",
          };
        }
        if (id === "release_1") {
          return null;
        }
        return null;
      }),
      query: vi.fn((table: string) => {
        if (table !== "feedback_comments") {
          throw new Error(`Unexpected table ${table}`);
        }
        return {
          withIndex: vi.fn(() => ({
            collect: vi.fn(async () => [
              {
                _id: "comment_1",
                feedbackItemId: "feedback_1",
                authorUserId: "user_team",
                body: "Thanks, we're looking at it.",
                isInternal: false,
                createdAt: 200,
              },
            ]),
          })),
        };
      }),
    },
  };
}

describe("feedback queries contract", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    getAuthUserIdMock.mockResolvedValue("user_1");
  });

  it("includes resolved comment author names in feedback detail", async () => {
    const ctx = makeCtx();
    const handler = (getPublicFeedbackDetail as unknown as { _handler: TestHandler })._handler;

    const result = (await handler(ctx, {
      feedbackItemId: "feedback_1",
    })) as {
      item: { comments: Array<{ authorName?: string; body: string }> };
    };

    expect(result.item.comments).toEqual([
      expect.objectContaining({
        authorName: "Support Team",
        body: "Thanks, we're looking at it.",
      }),
    ]);
    expect(result.item).toEqual(
      expect.objectContaining({
        routeFamily: "fit_results",
        activitySummary: "User opened fit results and reported an issue.",
        contextCompleteness: "high",
        contactEmail: "rider@example.com",
      })
    );
  });
});
