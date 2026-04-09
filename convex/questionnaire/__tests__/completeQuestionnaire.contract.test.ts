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
  profile?: {
    _id: string;
    userId: string;
    weeklyHours?: "0-3" | "3-6" | "6-10" | "10-15" | "15+";
    hasPain?: "yes" | "no";
    painAreas?: string[];
    painSeverity?: number;
  } | null;
}) {
  const {
    session = { _id: "session_1", userId: "user_1" },
    responses,
    profile = null,
  } = params;

  const db = {
    get: vi.fn(async (id: string) => {
      if (session && id === session._id) {
        return session;
      }
      return null;
    }),
    query: vi.fn((table: string) => {
      if (table === "questionnaireResponses") {
        return {
          withIndex: vi.fn(() => ({
            collect: vi.fn(async () => responses),
          })),
        };
      }

      if (table === "profiles") {
        return {
          withIndex: vi.fn(() => ({
            unique: vi.fn(async () => profile),
          })),
        };
      }

      throw new Error(`Unexpected table query: ${table}`);
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

  it("completes when only profile-owned questions are absent from the questionnaire", async () => {
    const ctx = makeCtx({
      responses: [
        { questionId: "experience_level", response: "intermediate" },
        { questionId: "weekly_hours", response: "3-6" },
      ],
    });

    const handler = (
      completeQuestionnaire as unknown as { _handler: TestHandler }
    )._handler;

    await expect(handler(ctx, { sessionId: "session_1" })).resolves.toBeUndefined();
    expect(ctx.db.patch).toHaveBeenCalledWith("session_1", {
      status: "questionnaire_complete",
    });
  });

  it("marks questionnaire complete when all required visible questions are answered", async () => {
    const ctx = makeCtx({
      responses: [
        { questionId: "experience_level", response: "advanced" },
        { questionId: "weekly_hours", response: "6-10" },
        { questionId: "typical_ride_length", response: "medium" },
        { questionId: "has_pain", response: "no" },
        { questionId: "position_priority", response: "balanced" },
        { questionId: "current_position_feeling", response: ["good"] },
      ],
      profile: {
        _id: "profile_1",
        userId: "user_1",
        weeklyHours: "6-10",
        hasPain: "no",
      },
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
