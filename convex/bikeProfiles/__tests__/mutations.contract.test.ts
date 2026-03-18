import { beforeEach, describe, expect, it, vi } from "vitest";

type TestHandler = (ctx: unknown, args: unknown) => Promise<unknown>;

const { getAuthUserIdMock } = vi.hoisted(() => ({
  getAuthUserIdMock: vi.fn(),
}));

vi.mock("@convex-dev/auth/server", () => ({
  getAuthUserId: getAuthUserIdMock,
}));

import { archive, create, ensureDefaultForBike } from "../mutations";

describe("bikeProfiles mutations contract", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    getAuthUserIdMock.mockResolvedValue("user_1");
  });

  it("clears previous default when creating a new default bike profile", async () => {
    const db = {
      get: vi.fn(async (id: string) => {
        if (id === "bike_1") {
          return { _id: "bike_1", userId: "user_1", bikeType: "road" };
        }
        return null;
      }),
      query: vi.fn((table: string) => {
        if (table !== "bikeProfiles") {
          throw new Error(`Unexpected table query: ${table}`);
        }
        return {
          withIndex: vi.fn(() => ({
            collect: vi.fn(async () => [{ _id: "profile_old" }]),
          })),
        };
      }),
      patch: vi.fn(async () => undefined),
      insert: vi.fn(async () => "profile_new"),
    };

    const handler = (create as unknown as { _handler: TestHandler })._handler;
    const result = await handler(
      { db },
      {
        bikeId: "bike_1",
        name: "Performance",
        profileType: "performance",
        isDefault: true,
      }
    );

    expect(result).toBe("profile_new");
    expect(db.patch).toHaveBeenCalledWith(
      "profile_old",
      expect.objectContaining({ isDefault: false })
    );
    expect(db.insert).toHaveBeenCalledWith(
      "bikeProfiles",
      expect.objectContaining({
        bikeId: "bike_1",
        name: "Performance",
        profileType: "performance",
        isDefault: true,
      })
    );
  });

  it("creates a Base default profile when one does not exist", async () => {
    const db = {
      get: vi.fn(async (id: string) => {
        if (id === "bike_1") {
          return { _id: "bike_1", userId: "user_1", bikeType: "road" };
        }
        return null;
      }),
      query: vi.fn((table: string) => {
        if (table !== "bikeProfiles") {
          throw new Error(`Unexpected table query: ${table}`);
        }
        return {
          withIndex: vi.fn(() => ({
            first: vi.fn(async () => null),
          })),
        };
      }),
      insert: vi.fn(async () => "profile_base"),
    };

    const handler = (ensureDefaultForBike as unknown as { _handler: TestHandler })._handler;
    const result = await handler({ db }, { bikeId: "bike_1" });

    expect(result).toBe("profile_base");
    expect(db.insert).toHaveBeenCalledWith(
      "bikeProfiles",
      expect.objectContaining({
        name: "Base",
        profileType: "base",
        isDefault: true,
        source: "system_default",
      })
    );
  });

  it("prevents archiving the default bike profile", async () => {
    const db = {
      get: vi.fn(async (id: string) => {
        if (id === "profile_1") {
          return {
            _id: "profile_1",
            userId: "user_1",
            bikeId: "bike_1",
            isDefault: true,
          };
        }
        return null;
      }),
      patch: vi.fn(async () => undefined),
    };

    const handler = (archive as unknown as { _handler: TestHandler })._handler;

    await expect(handler({ db }, { bikeProfileId: "profile_1" })).rejects.toThrow(
      "Cannot archive the default bike profile"
    );
    expect(db.patch).not.toHaveBeenCalled();
  });
});
