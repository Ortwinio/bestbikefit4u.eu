import { beforeEach, describe, expect, it, vi } from "vitest";

type TestHandler = (ctx: unknown, args: unknown) => Promise<unknown>;

const { getAuthUserIdMock } = vi.hoisted(() => ({
  getAuthUserIdMock: vi.fn(),
}));

vi.mock("@convex-dev/auth/server", () => ({
  getAuthUserId: getAuthUserIdMock,
}));

import { getFitRunTrace, listUsers } from "../queries";

type FakeRecord = Record<string, unknown>;

function makeCollectionQuery<T extends FakeRecord>(rows: T[]) {
  return {
    collect: vi.fn(async () => rows),
    withIndex: vi.fn(() => makeCollectionQuery(rows)),
  };
}

function makeCtx({
  users,
  session = null,
  bike = null,
  profile = null,
  engineVersion = null,
  recommendations = [],
  pressureCalculations = [],
}: {
  users: FakeRecord[];
  session?: FakeRecord | null;
  bike?: FakeRecord | null;
  profile?: FakeRecord | null;
  engineVersion?: FakeRecord | null;
  recommendations?: FakeRecord[];
  pressureCalculations?: FakeRecord[];
}) {
  return {
    db: {
      get: vi.fn(async (id: string) => {
        if (id === "admin_1") {
          return {
            _id: "admin_1",
            email: "admin@example.com",
            name: "Admin",
            adminRole: "super_admin",
          };
        }
        if (id === "session_1") return session;
        if (id === "bike_1") return bike;
        if (id === "profile_1") return profile;
        if (id === "engine_1") return engineVersion;
        return null;
      }),
      query: vi.fn((table: string) => {
        switch (table) {
          case "users":
            return {
              collect: vi.fn(async () => users),
            };
          case "recommendations":
            return makeCollectionQuery(recommendations);
          case "pressureCalculations":
            return makeCollectionQuery(pressureCalculations);
          default:
            throw new Error(`Unhandled table ${table}`);
        }
      }),
    },
  };
}

describe("admin queries", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    getAuthUserIdMock.mockResolvedValue("admin_1");
  });

  it("searches users with real substring matching and stable manual pagination", async () => {
    const users = [
      { _id: "u1", email: "zeta@example.com", displayName: "Ali Cat", createdAt: 30, adminRole: undefined },
      { _id: "u2", email: "alice@example.com", name: "Alice", createdAt: 20, adminRole: undefined },
      { _id: "u3", email: "other@example.com", displayName: "Bali", createdAt: 10, adminRole: undefined },
    ];
    const ctx = makeCtx({ users });
    const handler = (listUsers as unknown as { _handler: TestHandler })._handler;

    const firstPage = (await handler(ctx, {
      search: "ali",
      paginationOpts: { cursor: null, numItems: 2 },
    })) as { page: Array<{ _id: string }>; continueCursor: string; isDone: boolean };

    const secondPage = (await handler(ctx, {
      search: "ali",
      paginationOpts: { cursor: firstPage.continueCursor, numItems: 2 },
    })) as { page: Array<{ _id: string }>; continueCursor: string; isDone: boolean };

    expect(firstPage.page.map((user) => user._id)).toEqual(["u1", "u2"]);
    expect(firstPage.isDone).toBe(false);
    expect(firstPage.continueCursor).toBe("2");
    expect(secondPage.page.map((user) => user._id)).toEqual(["u3"]);
    expect(secondPage.isDone).toBe(true);
    expect(secondPage.continueCursor).toBe("");
  });

  it("enriches fit run traces with recommendation output and warning data", async () => {
    const ctx = makeCtx({
      users: [],
      session: {
        _id: "session_1",
        userId: "user_1",
        bikeId: "bike_1",
        profileId: "profile_1",
        engineVersionId: "engine_1",
        confidenceScore: 74,
      },
      bike: { _id: "bike_1", userId: "user_1", name: "Road bike" },
      profile: { _id: "profile_1", userId: "user_1", heightCm: 180 },
      engineVersion: { _id: "engine_1", versionLabel: "v2", status: "active" },
      recommendations: [
        {
          _id: "rec_old",
          sessionId: "session_1",
          createdAt: 1000,
          calculatedFit: { recommendedStackMm: 555 },
          comparisonSnapshot: { saddleHeightMm: 720 },
          recommendationItems: [],
          fitNotes: ["older"],
          adjustmentPriorities: [],
          confidenceScore: 70,
          pressureInsights: { comfortBias: "balanced", stabilityScore: 0.4, warnings: ["older_warning"], version: 1 },
        },
        {
          _id: "rec_new",
          sessionId: "session_1",
          createdAt: 2000,
          calculatedFit: { recommendedStackMm: 565 },
          comparisonSnapshot: { saddleHeightMm: 725 },
          recommendationItems: [{ parameter: "stack", target: 565 }],
          fitNotes: ["new"],
          adjustmentPriorities: [{ priority: 1, component: "Saddle", recommendedValue: "725mm", rationale: "baseline" }],
          confidenceScore: 82,
          pressureInsights: { comfortBias: "performance", stabilityScore: 0.7, warnings: ["fit_warning"], version: 2 },
        },
      ],
      pressureCalculations: [
        {
          _id: "pressure_old",
          bikeId: "bike_1",
          createdAt: 1500,
          recommendedFrontBar: 4,
          recommendedRearBar: 4.2,
          recommendedFrontPsi: 58,
          recommendedRearPsi: 61,
          warningsJson: '["old_pressure_warning"]',
        },
        {
          _id: "pressure_new",
          bikeId: "bike_1",
          createdAt: 2500,
          recommendedFrontBar: 3.8,
          recommendedRearBar: 4,
          recommendedFrontPsi: 55,
          recommendedRearPsi: 58,
          warningsJson: '["pressure_high_for_gravel"]',
        },
      ],
    });
    const handler = (getFitRunTrace as unknown as { _handler: TestHandler })._handler;

    const result = (await handler(ctx, { sessionId: "session_1" })) as {
      calculatedFit: { recommendedStackMm: number } | null;
      confidenceScore: number | null;
      recommendationItems: Array<{ parameter: string }>;
      fitNotes: string[];
      warnings: string[];
      pressureCalculation: { recommendedFrontBar: number } | null;
      pressureWarnings: string[];
    };

    expect(result.calculatedFit?.recommendedStackMm).toBe(565);
    expect(result.confidenceScore).toBe(82);
    expect(result.recommendationItems).toEqual([expect.objectContaining({ parameter: "stack" })]);
    expect(result.fitNotes).toEqual(["new"]);
    expect(result.pressureCalculation?.recommendedFrontBar).toBe(3.8);
    expect(result.warnings).toEqual(expect.arrayContaining(["fit_warning", "pressure_high_for_gravel"]));
    expect(result.pressureWarnings).toEqual(["pressure_high_for_gravel"]);
  });
});
