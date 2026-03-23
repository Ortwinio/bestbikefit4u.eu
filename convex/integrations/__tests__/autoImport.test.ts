import { beforeEach, describe, expect, it, vi } from "vitest";
import { internal } from "../../_generated/api";
import { getMissingStravaGearIds, shouldTriggerStravaBikeAutoImport, syncMissingStravaBikesForUser, scanStravaAutoImportCandidates } from "../actions";

type TestHandler = (ctx: unknown, args: unknown) => Promise<unknown>;

const { getFreshStravaTokenMock, fetchStravaAthleteMock, fetchStravaGearDetailMock } = vi.hoisted(
  () => ({
    getFreshStravaTokenMock: vi.fn(),
    fetchStravaAthleteMock: vi.fn(),
    fetchStravaGearDetailMock: vi.fn(),
  })
);

vi.mock("../stravaToken", () => ({
  getFreshStravaToken: getFreshStravaTokenMock,
}));

vi.mock("../strava", async () => {
  const actual = await vi.importActual<typeof import("../strava")>("../strava");
  return {
    ...actual,
    fetchStravaAthlete: fetchStravaAthleteMock,
    fetchStravaGearDetail: fetchStravaGearDetailMock,
  };
});

describe("Strava auto import", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("filters out already imported gear ids", () => {
    expect(
      getMissingStravaGearIds(
        [
          { id: "gear_a", name: "A", primary: false, distanceMeters: 1000 },
          { id: "gear_b", name: "B", primary: true, distanceMeters: 2000 },
          { id: "gear_c", name: "C", primary: false, distanceMeters: 3000 },
        ],
        ["gear_b"]
      ).map((gear) => gear.id)
    ).toEqual(["gear_a", "gear_c"]);
  });

  it("only auto-imports bikes that are missing from the local catalogue", async () => {
    getFreshStravaTokenMock.mockResolvedValue("access_token_1");
    fetchStravaAthleteMock.mockResolvedValue({
      athleteName: "Alex Rider",
      athleteAvatarUrl: "https://example.com/avatar.jpg",
      athleteWeight: 72,
      bikes: [
        { id: "gear_existing", name: "Existing bike", primary: true, distanceMeters: 12345 },
        { id: "gear_missing", name: "Missing bike", primary: false, distanceMeters: 54321 },
      ],
    });
    fetchStravaGearDetailMock.mockResolvedValue({
      id: "gear_missing",
      name: "Missing bike",
      primary: false,
      distanceMeters: 54321,
      brandName: "Cervelo",
      modelName: "R5",
      description: "Race build",
      frameType: 3,
    });

    const runQuery = vi.fn(async () => ["gear_existing"]);

    const runMutation = vi.fn(async (_ref: unknown, args: Record<string, unknown>) => {
      if ("gear" in args) {
        expect(args.gear).toMatchObject({ gearId: "gear_missing" });
        return { bikeId: "bike_missing", imported: true, needsTypeConfirmation: false };
      }

      return "integration_1";
    });

    const handler = (syncMissingStravaBikesForUser as unknown as { _handler: TestHandler })._handler;
    const result = (await handler(
      {
        runQuery,
        runMutation,
      },
      { userId: "user_1" }
    )) as {
      totalGearCount: number;
      missingGearCount: number;
      imported: number;
      updated: number;
      failed: Array<{ gearId: string; reason: string }>;
      unresolved: Array<unknown>;
    };

    expect(result.totalGearCount).toBe(2);
    expect(result.missingGearCount).toBe(1);
    expect(result.imported).toBe(1);
    expect(result.updated).toBe(0);
    expect(result.failed).toEqual([]);
    expect(result.unresolved).toEqual([]);
  });

  it("schedules missing-bike auto import only for recently logged-in active users", async () => {
    const integrations = [
      { userId: "user_recent", accessStatus: "active", lastSyncAt: 1_000 },
      { userId: "user_old", accessStatus: "active", lastSyncAt: 5_000 },
    ];
    const users = new Map([
      ["user_recent", { _id: "user_recent", lastLoginAt: 2_000 }],
      ["user_old", { _id: "user_old", lastLoginAt: 4_000 }],
    ]);

    const query = vi.fn(() => ({
      withIndex: vi.fn(() => ({
        collect: vi.fn(async () =>
          integrations.filter((integration) => integration.accessStatus === "active")
        ),
      })),
    }));
    const db = {
      query,
      get: vi.fn(async (id: string) => users.get(id) ?? null),
    };
    const scheduler = {
      runAfter: vi.fn(async () => undefined),
    };
    const runQuery = vi.fn(async () =>
      integrations.map((integration) => {
        const user = users.get(integration.userId);
        return {
          userId: integration.userId,
          lastLoginAt: user?.lastLoginAt ?? null,
          lastSyncAt: integration.lastSyncAt,
        };
      })
    );

    const handler = (scanStravaAutoImportCandidates as unknown as { _handler: TestHandler })._handler;
    const result = (await handler({ db, scheduler, runQuery }, {})) as { scheduled: number };

    expect(result.scheduled).toBe(1);
    expect(scheduler.runAfter).toHaveBeenCalledTimes(1);
    const callArgs = scheduler.runAfter.mock.calls[0] as unknown as [
      number,
      unknown,
      { userId: string }
    ];
    expect(callArgs[0]).toBe(0);
    expect(callArgs[2].userId).toBe("user_recent");
  });

  it("does not trigger auto-import when the user login is not newer than the last sync", () => {
    expect(
      shouldTriggerStravaBikeAutoImport({
        lastLoginAt: 1_000,
        lastSyncAt: 1_000,
      })
    ).toBe(false);
    expect(
      shouldTriggerStravaBikeAutoImport({
        lastLoginAt: 2_000,
        lastSyncAt: 1_000,
      })
    ).toBe(true);
  });
});
