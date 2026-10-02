import { beforeEach, describe, expect, it, vi } from "vitest";
import { getAuthUserId } from "@convex-dev/auth/server";
import type { Id } from "../_generated/dataModel";
import { resolveEmailLocale } from "../emails/locale";
import { setLocale, setLocaleIfMissing } from "./mutations";

vi.mock("@convex-dev/auth/server", () => ({
  getAuthUserId: vi.fn(),
}));

type TestHandler = (
  ctx: { db: { get: ReturnType<typeof vi.fn>; patch: ReturnType<typeof vi.fn> } },
  args: { locale: "nl" | "en" }
) => Promise<null>;

const setLocaleHandler = (setLocale as unknown as { _handler: TestHandler })._handler;
const initializeLocaleHandler = (setLocaleIfMissing as unknown as { _handler: TestHandler })._handler;
const userId = "user_123" as Id<"users">;

beforeEach(() => {
  vi.mocked(getAuthUserId).mockReset();
  vi.mocked(getAuthUserId).mockResolvedValue(userId);
});

describe("user locale mutations", () => {
  it.each([setLocaleHandler, initializeLocaleHandler])("rejects unauthenticated writes", async (handler) => {
    vi.mocked(getAuthUserId).mockResolvedValue(null);
    const db = { get: vi.fn(), patch: vi.fn() };
    await expect(handler({ db }, { locale: "nl" })).rejects.toThrow("Not authenticated");
    expect(db.get).not.toHaveBeenCalled();
    expect(db.patch).not.toHaveBeenCalled();
  });

  it.each(["nl", "en"] as const)("sets %s on the authenticated user only", async (locale) => {
    const db = { get: vi.fn(), patch: vi.fn() };
    await expect(setLocaleHandler({ db }, { locale })).resolves.toBeNull();
    expect(db.patch).toHaveBeenCalledExactlyOnceWith(userId, { locale });
  });

  it("backfills an existing user with no locale", async () => {
    const db = { get: vi.fn().mockResolvedValue({ _id: userId }), patch: vi.fn() };
    await expect(initializeLocaleHandler({ db }, { locale: "nl" })).resolves.toBeNull();
    expect(db.get).toHaveBeenCalledWith(userId);
    expect(db.patch).toHaveBeenCalledExactlyOnceWith(userId, { locale: "nl" });
  });

  it.each(["nl", "en"] as const)("preserves saved %s during backfill", async (locale) => {
    const db = { get: vi.fn().mockResolvedValue({ _id: userId, locale }), patch: vi.fn() };
    await expect(initializeLocaleHandler({ db }, { locale: locale === "nl" ? "en" : "nl" })).resolves.toBeNull();
    expect(db.patch).not.toHaveBeenCalled();
  });

  it("rejects backfill for a deleted user", async () => {
    const db = { get: vi.fn().mockResolvedValue(null), patch: vi.fn() };
    await expect(initializeLocaleHandler({ db }, { locale: "nl" })).rejects.toThrow("User not found");
    expect(db.patch).not.toHaveBeenCalled();
  });

  it("resolves the latest locale after a switch and ignores subsequent backfill", async () => {
    const user: { locale?: "nl" | "en" } = {};
    const db = {
      get: vi.fn(async () => user),
      patch: vi.fn(async (_userId: Id<"users">, updates: { locale: "nl" | "en" }) => {
        Object.assign(user, updates);
      }),
    };
    await initializeLocaleHandler({ db }, { locale: "en" });
    expect(resolveEmailLocale(await db.get())).toBe("en");
    await setLocaleHandler({ db }, { locale: "nl" });
    await initializeLocaleHandler({ db }, { locale: "en" });
    expect(resolveEmailLocale(await db.get(), "en")).toBe("nl");
    expect(db.patch).toHaveBeenCalledTimes(2);
  });
});
