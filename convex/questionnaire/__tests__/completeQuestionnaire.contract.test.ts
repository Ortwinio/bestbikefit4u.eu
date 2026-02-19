import { beforeEach, describe, expect, it, vi } from "vitest";

type TestHandler = (ctx: unknown, args: unknown) => Promise<unknown>;

const { getAuthUserIdMock } = vi.hoisted(() => ({
  getAuthUserIdMock: vi.fn(),
}));

vi.mock("@convex-dev/auth/server", () => ({
  getAuthUserId: getAuthUserIdMock,
}));

import { completeQuestionnaire } from "../mutations";

function makeCtx(params: {
  session?: { _id: string; userId: string } | null;
  responses: Array<{ questionId: string; response: string | number | string[] }>;
}) {
  const { session = { _id: "session_1", userId: "user_1" }, responses } = params;

  const db = {
    get: vi.fn(async (id: string) => {
      if (session && id === session._id) {
        return session;
      }
      return null;
    }),
    query: vi.fn((table: string) => {
      if (table !== "questionnaireResponses") {
        throw new Error(`Unexpected table query: ${table}`);
      }
      return {
        withIndex: vi.fn(() => ({
          collect: vi.fn(async () => responses),
        })),
      };
    }),
    patch: vi.fn(async () => undefined),
  };

  return { db } as const;
}

describe("questionnaire.completeQuestionnaire contract", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    getAuthUserIdMock.mockResolvedValue("user_1");
  });

  it("rejects completion when required questions are missing", async () => {
    const ctx = makeCtx({
      responses: [
        { questionId: "experience_level", response: "intermediate" },
        { questionId: "weekly_hours", response: "3-6" },
      ],
    });

    const handler = (
      completeQuestionnaire as unknown as { _handler: TestHandler }
    )._handler;

    await expect(handler(ctx, { sessionId: "session_1" })).rejects.toThrow(
      /Missing required responses/
    );
    expect(ctx.db.patch).not.toHaveBeenCalled();
  });

  it("marks questionnaire complete when all required visible questions are answered", async () => {
    const ctx = makeCtx({
      responses: [
        { questionId: "experience_level", response: "advanced" },
        { questionId: "weekly_hours", response: "6-10" },
        { questionId: "typical_ride_length", response: "medium" },
        { questionId: "has_pain", response: "no" },
        { questionId: "position_priority", response: "balanced" },
        { questionId: "current_position_feeling", response: "good" },
      ],
    });

    const handler = (
      completeQuestionnaire as unknown as { _handler: TestHandler }
    )._handler;
    await handler(ctx, { sessionId: "session_1" });

    expect(ctx.db.patch).toHaveBeenCalledWith("session_1", {
      status: "questionnaire_complete",
    });
    expect(ctx.db.patch).toHaveBeenCalledWith("session_1", {
      weeklyHours: 8,
    });
  });
});
