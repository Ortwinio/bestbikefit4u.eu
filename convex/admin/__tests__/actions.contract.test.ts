import { beforeEach, describe, expect, it, vi } from "vitest";

type TestHandler = (ctx: unknown, args: unknown) => Promise<unknown>;

import { notifyRelease } from "../actions";

describe("admin actions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("creates a general announcement that defaults to all users when no targets are provided", async () => {
    const runQuery = vi.fn(async (_query: unknown, args: Record<string, unknown>) => {
      if ("releaseId" in args) {
        return {
          release: {
            _id: "release_1",
            name: "Spring update",
            versionLabel: "1.2",
            description: "Better fit output.",
            status: "live",
          },
          linkedItems: [],
        };
      }
      return {
        _id: "admin_1",
        adminRole: "super_admin",
      };
    });

    const runMutation = vi.fn(async (_mutation: unknown, args: Record<string, unknown>) => {
      if ("messageId" in args) {
        return undefined;
      }
      return "message_1";
    });

    const handler = (notifyRelease as unknown as { _handler: TestHandler })._handler;
    const result = (await handler(
      {
        runQuery,
        runMutation,
        scheduler: { runAfter: vi.fn() },
      },
      {
        releaseId: "release_1",
        sendToAffectedUsers: false,
        sendGeneralAnnouncement: true,
      }
    )) as {
      notifiedUsers: number;
      generalAnnouncementCreated: boolean;
    };

    expect(result.notifiedUsers).toBe(0);
    expect(result.generalAnnouncementCreated).toBe(true);
    expect(runMutation).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({
        type: "release_announcement",
        linkedReleaseId: "release_1",
        targets: [{ targetType: "all" }],
      })
    );
  });

  it("notifies affected users with support replies when a release goes live", async () => {
    const runQuery = vi.fn(async (_query: unknown, args: Record<string, unknown>) => {
      if ("releaseId" in args) {
        return {
          release: {
            _id: "release_1",
            name: "Spring update",
            versionLabel: "1.2",
            description: "Better fit output.",
            status: "live",
          },
          linkedItems: [
            { itemType: "feedback_item", itemId: "feedback_1" },
            { itemType: "feedback_item", itemId: "feedback_2" },
          ],
        };
      }
      if (args.feedbackItemId === "feedback_1") {
        return {
          item: {
            _id: "feedback_1",
            userId: "user_1",
            title: "Brake rub",
            linkedReleaseId: "release_1",
          },
          comments: [],
          user: null,
          release: null,
        };
      }
      if (args.feedbackItemId === "feedback_2") {
        return {
          item: {
            _id: "feedback_2",
            userId: "user_2",
            title: "Fit issue",
            linkedReleaseId: "release_1",
          },
          comments: [],
          user: null,
          release: null,
        };
      }
      return {
        _id: "admin_1",
        adminRole: "super_admin",
      };
    });

    const runMutation = vi.fn(async (_mutation: unknown, args: Record<string, unknown>) => {
      if ("messageId" in args) {
        return undefined;
      }
      return `message_${String(runMutation.mock.calls.length + 1)}`;
    });

    const handler = (notifyRelease as unknown as { _handler: TestHandler })._handler;
    const result = (await handler(
      {
        runQuery,
        runMutation,
        scheduler: { runAfter: vi.fn() },
      },
      {
        releaseId: "release_1",
        sendToAffectedUsers: true,
        sendGeneralAnnouncement: false,
      }
    )) as {
      notifiedUsers: number;
      generalAnnouncementCreated: boolean;
    };

    expect(result.notifiedUsers).toBe(2);
    expect(result.generalAnnouncementCreated).toBe(false);
    const createCalls = runMutation.mock.calls.filter(([, args]) => !("messageId" in (args as Record<string, unknown>)));
    expect(createCalls).toHaveLength(2);
    expect(createCalls[0]?.[1]).toEqual(
      expect.objectContaining({
        type: "support_reply",
        linkedReleaseId: "release_1",
        linkedFeedbackItemId: "feedback_1",
        targets: [{ targetType: "user", targetValue: "user_1" }],
      })
    );
    expect(createCalls[1]?.[1]).toEqual(
      expect.objectContaining({
        type: "support_reply",
        linkedReleaseId: "release_1",
        linkedFeedbackItemId: "feedback_2",
        targets: [{ targetType: "user", targetValue: "user_2" }],
      })
    );
  });
});
