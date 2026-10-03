import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { getFunctionName } from "convex/server";
import * as preferences from "../preferences";
import * as data from "../preferencesData";
import * as actions from "../preferenceActions";
import { buildEmailPreferenceLinks } from "../unsubscribeTokens";
import { NEWSLETTER_WORDING_VERSION } from "../../../shared/newsletterConsent";

const auth = vi.hoisted(() => ({ userId: "user1" as string | null }));
vi.mock("@convex-dev/auth/server", () => ({ getAuthUserId: async () => auth.userId }));
const NOW = Date.UTC(2026, 9, 3, 12);
type Row = Record<string, unknown> & { _id: string };
type Handler = { _handler: (ctx: unknown, args: Record<string, unknown>) => Promise<unknown> };
const invoke = (definition: unknown, ctx: unknown, args: Record<string, unknown>) => (definition as Handler)._handler(ctx, args);
const consent = (requestId = "request_0001", locale: "nl" | "en" = "nl") => ({ requestId, locale, wordingVersion: NEWSLETTER_WORDING_VERSION });

function fixture() {
  const tables = new Map<string, Row[]>([["users", [
    { _id: "user1", email: "rider@example.com", emailVerificationTime: NOW - 1000 },
    { _id: "user2", email: "other@example.com", emailVerificationTime: NOW - 1000 },
  ]]]);
  let sequence = 0;
  const stored = (id: string) => [...tables.values()].flat().find((row) => row._id === id) ?? null;
  const get = vi.fn(async (id: string) => structuredClone(stored(id)));
  const patch = vi.fn(async (id: string, values: Record<string, unknown>) => {
    const row = stored(id);
    if (!row) throw new Error("Row not found");
    for (const [field, value] of Object.entries(values)) {
      if (value === undefined) delete row[field];
      else row[field] = structuredClone(value);
    }
  });
  const insert = vi.fn(async (table: string, values: Record<string, unknown>) => {
    const row = { ...structuredClone(values), _id: `${table}_${++sequence}` };
    tables.set(table, [...(tables.get(table) ?? []), row]);
    return row._id;
  });
  const query = vi.fn((table: string) => {
    const conditions: ((row: Row) => boolean)[] = [];
    const index = { eq: (field: string, value: unknown) => { conditions.push((row) => row[field] === value); return index; } };
    const rows = () => structuredClone((tables.get(table) ?? []).filter((row) => conditions.every((condition) => condition(row))));
    const cursor = {
      withIndex: (_name: string, apply: (builder: typeof index) => unknown) => { apply(index); return cursor; },
      collect: async () => rows(),
      unique: async () => { const found = rows(); if (found.length > 1) throw new Error("Non-unique receipt"); return found[0] ?? null; },
    };
    return cursor;
  });
  const ctx = {
    db: { get, patch, insert, query, normalizeId: (_table: string, id: string) => id.startsWith("user") ? id : null },
    runQuery: vi.fn(async (reference: Parameters<typeof getFunctionName>[0], args: Record<string, unknown>): Promise<unknown> => {
      expect(getFunctionName(reference)).toBe("emails/preferencesData:read");
      return invoke(data.read, ctx, args);
    }),
    runMutation: vi.fn(async (reference: Parameters<typeof getFunctionName>[0], args: Record<string, unknown>): Promise<unknown> => {
      const name = getFunctionName(reference);
      if (name === "emails/preferencesData:update") return invoke(data.update, ctx, args);
      if (name === "emails/preferencesData:unsubscribe") return invoke(data.unsubscribe, ctx, args);
      throw new Error("Unexpected mutation");
    }),
  };
  const clearWrites = () => { patch.mockClear(); insert.mockClear(); };
  const expectNoWrites = () => { expect(patch).not.toHaveBeenCalled(); expect(insert).not.toHaveBeenCalled(); };
  return { ctx, tables, clearWrites, expectNoWrites };
}

async function links() {
  const urls = await buildEmailPreferenceLinks("user1", "en", "newsletter");
  return { preferences: new URLSearchParams(new URL(urls.preferencesUrl).hash.slice(1)).get("token")!,
    unsubscribe: new URL(urls.unsubscribeUrl).searchParams.get("token")! };
}

beforeEach(() => {
  auth.userId = "user1";
  vi.spyOn(Date, "now").mockReturnValue(NOW);
  vi.stubEnv("EMAIL_UNSUBSCRIBE_SECRET", "test-secret-with-at-least-32-characters");
  vi.stubEnv("SITE_URL", "https://bestbikefit4u.example");
  vi.stubEnv("CONVEX_SITE_URL", "https://test-deployment.convex.site");
});
afterEach(() => { vi.restoreAllMocks(); vi.unstubAllEnvs(); });

describe("newsletter defaults and explicit consent", () => {
  it("normalizes missing newsletter to false without changing legacy category defaults or writing", async () => {
    const { ctx, clearWrites, expectNoWrites } = fixture();
    expect(await invoke(preferences.get, ctx, {})).toEqual({ service: true, marketing: true, newsletter: false });
    await ctx.db.patch("user1", { emailPreferences: { service: false, marketing: false } });
    clearWrites();
    expect(await invoke(preferences.get, ctx, {})).toEqual({ service: false, marketing: false, newsletter: false });
    expect(await invoke(data.read, ctx, { userId: "user1" })).toEqual({ service: false, marketing: false, newsletter: false });
    expectNoWrites();
  });

  it.each([true, false])("omitting newsletter preserves %s and its consent metadata on authenticated and signed preference saves", async (newsletter) => {
    const { ctx, tables } = fixture();
    const metadata = { newsletterConsentAt: NOW - 5000, newsletterConsentSource: "signup",
      newsletterConsentLocale: "nl", newsletterConsentWordingVersion: NEWSLETTER_WORDING_VERSION };
    await ctx.db.patch("user1", { emailPreferences: { service: true, marketing: true, newsletter }, ...metadata });
    expect(await invoke(preferences.set, ctx, { service: false, marketing: true })).toEqual({ service: false, marketing: true, newsletter, newsletterGranted: false });
    auth.userId = null;
    expect(await invoke(actions.save, ctx, { token: (await links()).preferences, service: true, marketing: false }))
      .toEqual({ service: true, marketing: false, newsletter, newsletterGranted: false });
    expect(await ctx.db.get("user1")).toMatchObject(metadata);
    expect(tables.get("newsletterConsentEvents")).toBeUndefined();
  });

  it.each(["signup", "profile", "preferences"] as const)("stores server-timed %s consent with exact locale/version metadata and no category crossover", async (source) => {
    for (const locale of ["nl", "en"] as const) {
      const { ctx, tables } = fixture();
      await ctx.db.patch("user1", { emailPreferences: { service: false, marketing: false } });
      const result = source === "preferences"
        ? await invoke(preferences.set, ctx, { service: false, marketing: false, newsletter: true, consent: consent("request_0001", locale) })
        : await invoke(preferences.setNewsletter, ctx, { subscribed: true, source, consent: consent("request_0001", locale), expectedEmail: " RIDER@example.com " });
      expect(result).toMatchObject(source === "preferences" ? { newsletter: true, newsletterGranted: true } : { newsletter: true, granted: true });
      expect(await ctx.db.get("user1")).toMatchObject({ emailPreferences: { service: false, marketing: false, newsletter: true },
        newsletterConsentAt: NOW, newsletterConsentSource: source, newsletterConsentLocale: locale,
        newsletterConsentWordingVersion: NEWSLETTER_WORDING_VERSION });
      expect(tables.get("newsletterConsentEvents")).toEqual([{
        _id: expect.any(String), userId: "user1", requestId: "request_0001", subscribed: true, source, locale,
        wordingVersion: NEWSLETTER_WORDING_VERSION, createdAt: NOW,
      }]);
      expect(await ctx.db.get("user2")).not.toHaveProperty("emailPreferences");
    }
  });

  it("explicit false records a receipt but never records a grant or inferred opt-in", async () => {
    const { ctx, tables } = fixture();
    expect(await invoke(preferences.setNewsletter, ctx, { subscribed: false, source: "profile", consent: consent() }))
      .toEqual({ newsletter: false, granted: false });
    const user = await ctx.db.get("user1");
    expect(user).not.toHaveProperty("newsletterConsentAt");
    expect(user).not.toHaveProperty("newsletterUnsubscribedAt");
    expect(tables.get("newsletterConsentEvents")).toEqual([expect.objectContaining({ subscribed: false, createdAt: NOW })]);
  });

  it.each([
    undefined, { requestId: "short", locale: "nl", wordingVersion: NEWSLETTER_WORDING_VERSION },
    { requestId: "request bad", locale: "nl", wordingVersion: NEWSLETTER_WORDING_VERSION },
    { requestId: "x".repeat(129), locale: "nl", wordingVersion: NEWSLETTER_WORDING_VERSION },
    { requestId: "request_0001", locale: "de", wordingVersion: NEWSLETTER_WORDING_VERSION },
    { requestId: "request_0001", locale: "nl", wordingVersion: "old-copy" },
  ])("rejects invalid consent %j with zero writes", async (invalidConsent) => {
    const { ctx, expectNoWrites } = fixture();
    await expect(invoke(preferences.set, ctx, { service: false, marketing: false, newsletter: true, consent: invalidConsent })).rejects.toThrow("Invalid newsletter consent");
    expectNoWrites();
  });
});

describe("newsletter request receipts", () => {
  it("a declined request cannot be replayed with subscribed true", async () => {
    const { ctx, tables, clearWrites, expectNoWrites } = fixture();
    const args = { subscribed: false, source: "profile", consent: consent() };
    await invoke(preferences.setNewsletter, ctx, args);
    clearWrites();
    expect(await invoke(preferences.setNewsletter, ctx, { ...args, subscribed: true }))
      .toEqual({ newsletter: false, granted: false });
    expectNoWrites();
    expect(tables.get("newsletterConsentEvents")).toEqual([expect.objectContaining({ subscribed: false })]);
  });

  it("a new request while already subscribed does not report a fresh grant or overwrite original consent metadata", async () => {
    const { ctx, tables } = fixture();
    await invoke(preferences.setNewsletter, ctx, { subscribed: true, source: "signup", consent: consent(), expectedEmail: "rider@example.com" });
    vi.mocked(Date.now).mockReturnValue(NOW + 1000);
    expect(await invoke(preferences.set, ctx, { service: true, marketing: true, newsletter: true, consent: consent("request_0002", "en") }))
      .toEqual({ service: true, marketing: true, newsletter: true, newsletterGranted: false });
    expect(await ctx.db.get("user1")).toMatchObject({ newsletterConsentAt: NOW, newsletterConsentSource: "signup", newsletterConsentLocale: "nl" });
    expect(tables.get("newsletterConsentEvents")).toHaveLength(2);
  });

  it("a lost-response retry creates one receipt and returns granted false without restamping metadata", async () => {
    const { ctx, tables, clearWrites, expectNoWrites } = fixture();
    const args = { subscribed: true, source: "profile", consent: consent() };
    expect(await invoke(preferences.setNewsletter, ctx, args)).toEqual({ newsletter: true, granted: true });
    const original = await ctx.db.get("user1");
    vi.mocked(Date.now).mockReturnValue(NOW + 1000);
    clearWrites();
    expect(await invoke(preferences.setNewsletter, ctx, args)).toEqual({ newsletter: true, granted: false });
    expect(await ctx.db.get("user1")).toEqual(original);
    expect(tables.get("newsletterConsentEvents")).toHaveLength(1);
    expectNoWrites();
  });

  it("replaying accepted consent after unsubscribe cannot re-enable; only a fresh request can grant again", async () => {
    const { ctx, tables, clearWrites, expectNoWrites } = fixture();
    const args = { subscribed: true, source: "profile", consent: consent() };
    await invoke(preferences.setNewsletter, ctx, args);
    vi.mocked(Date.now).mockReturnValue(NOW + 1000);
    await invoke(actions.unsubscribe, ctx, { token: (await links()).unsubscribe });
    expect(await ctx.db.get("user1")).toMatchObject({ newsletterUnsubscribedAt: NOW + 1000, newsletterConsentAt: NOW,
      emailPreferences: { service: true, marketing: true, newsletter: false } });
    vi.mocked(Date.now).mockReturnValue(NOW + 2000);
    clearWrites();
    expect(await invoke(preferences.setNewsletter, ctx, args)).toEqual({ newsletter: false, granted: false });
    expectNoWrites();
    expect(tables.get("newsletterConsentEvents")).toHaveLength(1);
    expect(await invoke(preferences.setNewsletter, ctx, { ...args, consent: consent("request_0002", "en") }))
      .toEqual({ newsletter: true, granted: true });
    expect(await ctx.db.get("user1")).toMatchObject({ newsletterConsentAt: NOW + 2000, newsletterConsentLocale: "en" });
    expect(tables.get("newsletterConsentEvents")).toHaveLength(2);
  });

  it("a replayed full-preferences request after unsubscribe cannot re-enable any category", async () => {
    const { ctx, clearWrites, expectNoWrites } = fixture();
    const token = (await links()).preferences;
    const args = { token, service: true, marketing: true, newsletter: true, consent: consent() };
    expect(await invoke(actions.save, ctx, args)).toEqual({ service: true, marketing: true, newsletter: true, newsletterGranted: true });
    await invoke(data.unsubscribe, ctx, { userId: "user1", category: "newsletter" });
    await invoke(data.unsubscribe, ctx, { userId: "user1", category: "marketing" });
    clearWrites();
    expect(await invoke(actions.save, ctx, args)).toEqual({ service: true, marketing: false, newsletter: false, newsletterGranted: false });
    expectNoWrites();
  });

  it("receipt IDs are scoped to owners and cannot suppress another user's explicit consent", async () => {
    const { ctx, tables } = fixture();
    const args = { subscribed: true, source: "profile", consent: consent() };
    await invoke(preferences.setNewsletter, ctx, args);
    auth.userId = "user2";
    expect(await invoke(preferences.setNewsletter, ctx, args)).toEqual({ newsletter: true, granted: true });
    expect(tables.get("newsletterConsentEvents")?.map((row) => row.userId)).toEqual(["user1", "user2"]);
  });
});

describe("newsletter identity and authorization", () => {
  it.each(["marketing", "import", ""])("rejects invalid consent source %s without writes", async (source) => {
    const { ctx, expectNoWrites } = fixture();
    await expect(invoke(preferences.setNewsletter, ctx, { subscribed: true, source, consent: consent() })).rejects.toThrow("Invalid consent source");
    expectNoWrites();
  });

  it.each(["true", 1, null])("rejects a non-boolean newsletter preference %s without writes", async (newsletter) => {
    const { ctx, expectNoWrites } = fixture();
    await expect(invoke(preferences.set, ctx, { service: true, marketing: true, newsletter, consent: consent() })).rejects.toThrow("Invalid newsletter preference");
    expectNoWrites();
  });

  it.each(["set", "setNewsletter"])("%s requires a real authenticated user before writes", async (name) => {
    const { ctx, expectNoWrites } = fixture();
    const args = name === "set" ? { service: true, marketing: true, newsletter: true, consent: consent() }
      : { subscribed: true, source: "profile", consent: consent() };
    auth.userId = null;
    await expect(invoke(preferences[name as "set" | "setNewsletter"], ctx, args)).rejects.toThrow("Not authenticated");
    expect(ctx.db.get).not.toHaveBeenCalled();
    auth.userId = "user_missing";
    await expect(invoke(preferences[name as "set" | "setNewsletter"], ctx, args)).rejects.toThrow("Not authenticated");
    expectNoWrites();
  });

  it.each([undefined, "", "different@example.com"])("signup rejects missing or mismatched expected email %s with zero writes", async (expectedEmail) => {
    const { ctx, expectNoWrites } = fixture();
    await expect(invoke(preferences.setNewsletter, ctx, { subscribed: true, source: "signup", consent: consent(), expectedEmail }))
      .rejects.toThrow("Verified account does not match signup consent");
    expectNoWrites();
  });

  it.each([undefined, NaN, Infinity])("signup rejects an unverified account with verification time %s", async (emailVerificationTime) => {
    const { ctx, clearWrites, expectNoWrites } = fixture();
    await ctx.db.patch("user1", { emailVerificationTime });
    clearWrites();
    await expect(invoke(preferences.setNewsletter, ctx, { subscribed: true, source: "signup", consent: consent(), expectedEmail: "rider@example.com" }))
      .rejects.toThrow("Verified account does not match signup consent");
    expectNoWrites();
  });

  it("signup identity binding also protects a previously accepted receipt on retry", async () => {
    const { ctx, clearWrites, expectNoWrites } = fixture();
    const args = { subscribed: true, source: "signup", consent: consent(), expectedEmail: "rider@example.com" };
    await invoke(preferences.setNewsletter, ctx, args);
    await ctx.db.patch("user1", { email: "changed@example.com" });
    clearWrites();
    await expect(invoke(preferences.setNewsletter, ctx, args)).rejects.toThrow("Verified account does not match signup consent");
    expectNoWrites();
  });

  it("signed preferences target the token owner even when another account is logged in", async () => {
    const { ctx } = fixture();
    auth.userId = "user2";
    await invoke(actions.save, ctx, { token: (await links()).preferences, service: true, marketing: false,
      newsletter: true, consent: consent("request_0001", "en") });
    expect(await ctx.db.get("user1")).toMatchObject({ emailPreferences: { service: true, marketing: false, newsletter: true }, newsletterConsentSource: "preferences" });
    expect(await ctx.db.get("user2")).not.toHaveProperty("emailPreferences");
  });
});
