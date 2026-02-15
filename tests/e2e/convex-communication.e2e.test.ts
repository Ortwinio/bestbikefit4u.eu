import { beforeEach, describe, expect, it, vi } from "vitest";

const { getAuthUserIdMock } = vi.hoisted(() => ({
  getAuthUserIdMock: vi.fn(),
}));

vi.mock("@convex-dev/auth/server", () => ({
  getAuthUserId: getAuthUserIdMock,
}));

import { api } from "../../convex/_generated/api";
import { upsert as upsertProfile } from "../../convex/profiles/mutations";
import { create as createSession } from "../../convex/sessions/mutations";
import {
  saveResponse,
  completeQuestionnaire,
} from "../../convex/questionnaire/mutations";
import { generate as generateRecommendation } from "../../convex/recommendations/mutations";
import { getBySession as getRecommendationBySession } from "../../convex/recommendations/queries";
import { sendFitReport } from "../../convex/emails/actions";
import { getCurrentUser } from "../../convex/users/queries";

type Doc = Record<string, unknown> & { _id: string };

interface EqExpression {
  field: string;
  value: unknown;
}

interface FieldRef {
  field: string;
}

class QueryResult<T extends Doc> {
  private rows: T[];

  constructor(rows: T[]) {
    this.rows = rows;
  }

  filter(
    predicate: (q: {
      field: (name: string) => FieldRef;
      eq: (left: string | FieldRef, value: unknown) => EqExpression;
    }) => EqExpression
  ) {
    const expression = predicate({
      field: (name) => ({ field: name }),
      eq: (left, value) => ({
        field: typeof left === "string" ? left : left.field,
        value,
      }),
    });

    const filtered = this.rows.filter(
      (row) => row[expression.field] === expression.value
    );
    return new QueryResult(filtered);
  }

  order(direction: "asc" | "desc") {
    const sorted = [...this.rows].sort((a, b) => {
      const aVal = (a.createdAt as number | undefined) ?? 0;
      const bVal = (b.createdAt as number | undefined) ?? 0;
      return direction === "desc" ? bVal - aVal : aVal - bVal;
    });
    return new QueryResult(sorted);
  }

  async collect() {
    return this.rows;
  }

  async unique() {
    if (this.rows.length > 1) {
      throw new Error("Expected unique result");
    }
    return this.rows[0] ?? null;
  }

  async first() {
    return this.rows[0] ?? null;
  }
}

class InMemoryDb {
  private tables = new Map<string, Doc[]>();
  private idCounters = new Map<string, number>();

  async insert(table: string, doc: Record<string, unknown>) {
    const id = `${table}_${(this.idCounters.get(table) ?? 0) + 1}`;
    this.idCounters.set(table, (this.idCounters.get(table) ?? 0) + 1);
    const row: Doc = { _id: id, ...doc };
    const rows = this.tables.get(table) ?? [];
    rows.push(row);
    this.tables.set(table, rows);
    return id;
  }

  async get(id: string) {
    for (const rows of this.tables.values()) {
      const match = rows.find((row) => row._id === id);
      if (match) return match;
    }
    return null;
  }

  async patch(id: string, updates: Record<string, unknown>) {
    for (const [table, rows] of this.tables.entries()) {
      const index = rows.findIndex((row) => row._id === id);
      if (index >= 0) {
        rows[index] = { ...rows[index], ...updates };
        this.tables.set(table, rows);
        return;
      }
    }
    throw new Error(`Document not found: ${id}`);
  }

  async delete(id: string) {
    for (const [table, rows] of this.tables.entries()) {
      const next = rows.filter((row) => row._id !== id);
      if (next.length !== rows.length) {
        this.tables.set(table, next);
        return;
      }
    }
  }

  query(table: string) {
    const rows = this.tables.get(table) ?? [];
    return {
      withIndex: (
        _indexName: string,
        indexPredicate: (q: { eq: (field: string, value: unknown) => unknown }) => unknown
      ) => {
        const clauses: Array<{ field: string; value: unknown }> = [];
        const eqBuilder = {
          eq: (field: string, value: unknown) => {
            clauses.push({ field, value });
            return eqBuilder;
          },
        };
        indexPredicate(eqBuilder);
        const filtered = rows.filter((row) =>
          clauses.every((clause) => row[clause.field] === clause.value)
        );
        return new QueryResult(filtered);
      },
    };
  }
}

function handlerOf<TArgs, TResult>(
  fn: unknown
): (ctx: Record<string, unknown>, args: TArgs) => Promise<TResult> {
  return (fn as { _handler: (ctx: Record<string, unknown>, args: TArgs) => Promise<TResult> })
    ._handler;
}

describe("convex communication e2e", () => {
  let currentUserId: string | null;

  beforeEach(() => {
    vi.clearAllMocks();
    currentUserId = null;
    getAuthUserIdMock.mockImplementation(async () => currentUserId);
    delete process.env.AUTH_RESEND_KEY;
  });

  it("completes profile -> session -> questionnaire -> recommendation -> email flow", async () => {
    const db = new InMemoryDb();
    const userId = await db.insert("users", { email: "rider@example.com" });
    currentUserId = userId;

    const mutationCtx = { db };

    const profileId = await handlerOf<
      {
        heightCm: number;
        inseamCm: number;
        flexibilityScore: "average";
        coreStabilityScore: number;
      },
      string
    >(upsertProfile)(mutationCtx, {
      heightCm: 175,
      inseamCm: 81,
      flexibilityScore: "average",
      coreStabilityScore: 3,
    });

    const sessionId = await handlerOf<
      {
        bikeType: "road";
        ridingStyle: "fitness";
        primaryGoal: "balanced";
        bikeId?: string;
      },
      string
    >(createSession)(mutationCtx, {
      bikeType: "road",
      ridingStyle: "fitness",
      primaryGoal: "balanced",
    });

    await handlerOf<
      { sessionId: string; questionId: string; response: string },
      string
    >(saveResponse)(mutationCtx, {
      sessionId,
      questionId: "experience_level",
      response: "intermediate",
    });

    await handlerOf<
      { sessionId: string; questionId: string; response: string },
      string
    >(saveResponse)(mutationCtx, {
      sessionId,
      questionId: "weekly_hours",
      response: "3-6",
    });

    await handlerOf<{ sessionId: string }, void>(completeQuestionnaire)(
      mutationCtx,
      { sessionId }
    );

    const recommendationId = await handlerOf<{ sessionId: string }, string>(
      generateRecommendation
    )(mutationCtx, { sessionId });
    expect(recommendationId).toBeTruthy();

    const recommendation = await handlerOf<
      { sessionId: string },
      Record<string, unknown> | null
    >(getRecommendationBySession)({ db }, { sessionId });
    expect(recommendation).not.toBeNull();

    const sessionAfter = await db.get(sessionId);
    expect(sessionAfter?.status).toBe("completed");
    expect(sessionAfter?.profileId).toBe(profileId);

    const usersGetCurrentUserHandler = handlerOf<
      Record<string, never>,
      Record<string, unknown> | null
    >(
      getCurrentUser
    );
    const getRecommendationBySessionHandler = handlerOf<
      { sessionId: string },
      Record<string, unknown> | null
    >(getRecommendationBySession);

    const emailResult = await handlerOf<
      { sessionId: string; recipientEmail: string },
      { success: boolean; emailId?: string }
    >(sendFitReport)(
      {
        runQuery: async (_fnRef: unknown, args?: { sessionId: string }) => {
          if (!args) {
            return usersGetCurrentUserHandler({ db }, {});
          }
          return getRecommendationBySessionHandler({ db }, args);
        },
      },
      {
        sessionId,
        recipientEmail: "rider@example.com",
      }
    );

    expect(emailResult).toEqual({ success: true });
  });

  it("fails session creation when profile is missing", async () => {
    const db = new InMemoryDb();
    const userId = await db.insert("users", { email: "rider@example.com" });
    currentUserId = userId;

    await expect(
      handlerOf<
        { bikeType: "road"; ridingStyle: "fitness"; primaryGoal: "balanced" },
        string
      >(createSession)({ db }, {
        bikeType: "road",
        ridingStyle: "fitness",
        primaryGoal: "balanced",
      })
    ).rejects.toThrow("Profile required to start a fit session");
  });

  it("returns null recommendation before generation, then returns recommendation after generation", async () => {
    const db = new InMemoryDb();
    const userId = await db.insert("users", { email: "rider@example.com" });
    currentUserId = userId;

    const profileId = await handlerOf<
      {
        heightCm: number;
        inseamCm: number;
        flexibilityScore: "good";
        coreStabilityScore: number;
      },
      string
    >(upsertProfile)({ db }, {
      heightCm: 178,
      inseamCm: 83,
      flexibilityScore: "good",
      coreStabilityScore: 4,
    });
    expect(profileId).toBeTruthy();

    const sessionId = await handlerOf<
      { bikeType: "gravel"; ridingStyle: "touring"; primaryGoal: "comfort" },
      string
    >(createSession)({ db }, {
      bikeType: "gravel",
      ridingStyle: "touring",
      primaryGoal: "comfort",
    });

    const before = await handlerOf<
      { sessionId: string },
      Record<string, unknown> | null
    >(getRecommendationBySession)({ db }, { sessionId });
    expect(before).toBeNull();

    await handlerOf<{ sessionId: string }, string>(generateRecommendation)(
      { db },
      { sessionId }
    );

    const after = await handlerOf<
      { sessionId: string },
      Record<string, unknown> | null
    >(getRecommendationBySession)({ db }, { sessionId });
    expect(after).not.toBeNull();
  });

  it("rejects email to non-owner recipient and succeeds on retry", async () => {
    const db = new InMemoryDb();
    const userId = await db.insert("users", { email: "owner@example.com" });
    currentUserId = userId;

    await handlerOf<
      {
        heightCm: number;
        inseamCm: number;
        flexibilityScore: "average";
        coreStabilityScore: number;
      },
      string
    >(upsertProfile)({ db }, {
      heightCm: 176,
      inseamCm: 82,
      flexibilityScore: "average",
      coreStabilityScore: 3,
    });

    const sessionId = await handlerOf<
      { bikeType: "road"; ridingStyle: "fitness"; primaryGoal: "balanced" },
      string
    >(createSession)({ db }, {
      bikeType: "road",
      ridingStyle: "fitness",
      primaryGoal: "balanced",
    });

    await handlerOf<{ sessionId: string }, string>(generateRecommendation)(
      { db },
      { sessionId }
    );

    const usersGetCurrentUserHandler = handlerOf<
      Record<string, never>,
      Record<string, unknown> | null
    >(
      getCurrentUser
    );
    const getRecommendationBySessionHandler = handlerOf<
      { sessionId: string },
      Record<string, unknown> | null
    >(getRecommendationBySession);

    const actionCtx = {
      runQuery: async (_fnRef: unknown, args?: { sessionId: string }) => {
        if (!args) {
          return usersGetCurrentUserHandler({ db }, {});
        }
        return getRecommendationBySessionHandler({ db }, args);
      },
    };

    await expect(
      handlerOf<
        { sessionId: string; recipientEmail: string },
        { success: boolean; emailId?: string }
      >(sendFitReport)(actionCtx, {
        sessionId,
        recipientEmail: "other@example.com",
      })
    ).rejects.toThrow("Reports can only be sent to your own email address");

    await expect(
      handlerOf<
        { sessionId: string; recipientEmail: string },
        { success: boolean; emailId?: string }
      >(sendFitReport)(actionCtx, {
        sessionId,
        recipientEmail: "owner@example.com",
      })
    ).resolves.toEqual({ success: true });
  });

  it("returns null for recommendation query when session belongs to another user", async () => {
    const db = new InMemoryDb();
    const ownerId = await db.insert("users", { email: "owner@example.com" });
    const otherId = await db.insert("users", { email: "other@example.com" });

    currentUserId = ownerId;
    await handlerOf<
      {
        heightCm: number;
        inseamCm: number;
        flexibilityScore: "excellent";
        coreStabilityScore: number;
      },
      string
    >(upsertProfile)({ db }, {
      heightCm: 180,
      inseamCm: 84,
      flexibilityScore: "excellent",
      coreStabilityScore: 5,
    });
    const sessionId = await handlerOf<
      { bikeType: "road"; ridingStyle: "racing"; primaryGoal: "performance" },
      string
    >(createSession)({ db }, {
      bikeType: "road",
      ridingStyle: "racing",
      primaryGoal: "performance",
    });
    await handlerOf<{ sessionId: string }, string>(generateRecommendation)(
      { db },
      { sessionId }
    );

    currentUserId = otherId;
    const recommendation = await handlerOf<
      { sessionId: string },
      Record<string, unknown> | null
    >(getRecommendationBySession)({ db }, { sessionId });
    expect(recommendation).toBeNull();
  });

  it("sendFitReport action continues to use server-side recommendation source", async () => {
    const db = new InMemoryDb();
    const userId = await db.insert("users", { email: "rider@example.com" });
    currentUserId = userId;

    await handlerOf<
      {
        heightCm: number;
        inseamCm: number;
        flexibilityScore: "good";
        coreStabilityScore: number;
      },
      string
    >(upsertProfile)({ db }, {
      heightCm: 174,
      inseamCm: 80,
      flexibilityScore: "good",
      coreStabilityScore: 4,
    });

    const sessionId = await handlerOf<
      { bikeType: "city"; ridingStyle: "commuting"; primaryGoal: "comfort" },
      string
    >(createSession)({ db }, {
      bikeType: "city",
      ridingStyle: "commuting",
      primaryGoal: "comfort",
    });
    await handlerOf<{ sessionId: string }, string>(generateRecommendation)(
      { db },
      { sessionId }
    );

    const usersGetCurrentUserHandler = handlerOf<
      Record<string, never>,
      Record<string, unknown> | null
    >(
      getCurrentUser
    );
    const getRecommendationBySessionHandler = handlerOf<
      { sessionId: string },
      Record<string, unknown> | null
    >(getRecommendationBySession);

    const runQuery = vi.fn(async (_fnRef: unknown, args?: { sessionId: string }) => {
      if (!args) return usersGetCurrentUserHandler({ db }, {});
      return getRecommendationBySessionHandler({ db }, args);
    });

    await expect(
      handlerOf<
        { sessionId: string; recipientEmail: string },
        { success: boolean; emailId?: string }
      >(sendFitReport)(
        {
          runQuery,
        },
        {
          sessionId,
          recipientEmail: "rider@example.com",
        }
      )
    ).resolves.toEqual({ success: true });

    // First call resolves auth user, second call resolves recommendation.
    expect(runQuery).toHaveBeenCalledTimes(2);
    expect(runQuery).toHaveBeenNthCalledWith(1, api.users.queries.getCurrentUser);
    expect(runQuery).toHaveBeenNthCalledWith(
      2,
      api.recommendations.queries.getBySession,
      { sessionId }
    );
  });
});
