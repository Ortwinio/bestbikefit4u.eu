import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { createHmac } from "node:crypto";
import { getFunctionName } from "convex/server";
import { buildEmailPreferenceLinks, verifyEmailPreferenceToken } from "../unsubscribeTokens";
import * as preferences from "../preferences";
import * as data from "../preferencesData";
import * as actions from "../preferenceActions";
import http from "../../http";

const auth = vi.hoisted(() => ({ userId: null as string | null }));
vi.mock("@convex-dev/auth/server", () => ({ getAuthUserId: async () => auth.userId }));
vi.mock("../../auth", () => ({ auth: { addHttpRoutes: vi.fn() } }));

function handler(definition: unknown) {
  return (definition as { _handler: (ctx: unknown, args: Record<string, unknown>) => Promise<unknown> })._handler;
}

function fixture() {
  const users: Record<string, { _id: string; emailPreferences?: { service: boolean; marketing: boolean; newsletter?: boolean } }> = {
    user1: { _id: "user1" }, user2: { _id: "user2" },
  };
  const ctx = {
    db: {
      normalizeId: (_table: string, id: string) => id.startsWith("user") ? id : null,
      get: vi.fn(async (id: string) => structuredClone(users[id] ?? null)),
      patch: vi.fn(async (id: string, patch: object) => { Object.assign(users[id], patch); }),
    },
    runQuery: vi.fn(async (_reference: unknown, args: Record<string, unknown>): Promise<unknown> => handler(data.read)(ctx, args)),
    runMutation: vi.fn(async (reference: Parameters<typeof getFunctionName>[0], args: Record<string, unknown>): Promise<unknown> =>
      handler(getFunctionName(reference).endsWith(":unsubscribe") ? data.unsubscribe : data.update)(ctx, args)),
    runAction: vi.fn(async (reference: Parameters<typeof getFunctionName>[0], args: Record<string, unknown>): Promise<unknown> => {
      const definition = getFunctionName(reference).endsWith(":confirmationUrl") ? actions.confirmationUrl : actions.unsubscribe;
      return handler(definition)(ctx, args);
    }),
  };
  return { ctx, users };
}

async function tokens(category: "service" | "marketing" | "newsletter" = "service") {
  const links = await buildEmailPreferenceLinks("user1", "nl", category);
  return {
    ...links,
    unsubscribe: new URL(links.unsubscribeUrl).searchParams.get("token")!,
    preferences: new URLSearchParams(new URL(links.preferencesUrl).hash.slice(1)).get("token")!,
  };
}

beforeEach(() => {
  vi.stubEnv("EMAIL_UNSUBSCRIBE_SECRET", "test-secret-with-at-least-32-characters");
  vi.stubEnv("SITE_URL", "https://bestbikefit4u.example");
  vi.stubEnv("CONVEX_SITE_URL", "https://test-deployment.convex.site");
  auth.userId = null;
});
afterEach(() => { vi.unstubAllEnvs(); vi.restoreAllMocks(); });

describe("signed email preference links", () => {
  it("signs newsletter purpose/category and rejects category or purpose changes without a new signature", async () => {
    const links = await tokens("newsletter");
    expect(verifyEmailPreferenceToken(links.unsubscribe)).toMatchObject({
      version: 1, userId: "user1", locale: "nl", purpose: "unsubscribe", category: "newsletter",
    });
    expect(verifyEmailPreferenceToken(links.preferences)).toMatchObject({ purpose: "preferences", category: "newsletter" });
    const [encoded, signature] = links.unsubscribe.split(".");
    const payload = JSON.parse(Buffer.from(encoded, "base64url").toString("utf8"));
    for (const changed of [{ category: "service" }, { purpose: "preferences" }, { userId: "user2" }]) {
      const tampered = Buffer.from(JSON.stringify({ ...payload, ...changed })).toString("base64url");
      expect(() => verifyEmailPreferenceToken(`${tampered}.${signature}`)).toThrow();
    }
  });

  it.each(["service", "marketing"] as const)("continues accepting pre-newsletter v1 %s links", async (category) => {
    const { ctx, users } = fixture();
    users.user1.emailPreferences = { service: true, marketing: true, newsletter: true };
    const payload = { version: 1, userId: "user1", locale: "en", purpose: "unsubscribe", category, expiresAt: Date.now() + 86400000 };
    const encoded = Buffer.from(JSON.stringify(payload)).toString("base64url");
    const token = `${encoded}.${createHmac("sha256", process.env.EMAIL_UNSUBSCRIBE_SECRET!).update(encoded).digest("base64url")}`;
    expect(verifyEmailPreferenceToken(token)).toEqual(payload);
    await handler(actions.unsubscribe)(ctx, { token });
    expect(users.user1.emailPreferences).toEqual({ service: category !== "service", marketing: category !== "marketing", newsletter: true });
  });

  it("an old v1 preferences token can still view and save legacy categories without newsletter opt-in", async () => {
    const { ctx, users } = fixture();
    const payload = { version: 1, userId: "user1", locale: "en", purpose: "preferences", category: "service", expiresAt: Date.now() + 86400000 };
    const encoded = Buffer.from(JSON.stringify(payload)).toString("base64url");
    const token = `${encoded}.${createHmac("sha256", process.env.EMAIL_UNSUBSCRIBE_SECRET!).update(encoded).digest("base64url")}`;
    expect(await handler(actions.view)(ctx, { token })).toEqual({ purpose: "preferences", preferences: { service: true, marketing: true, newsletter: false } });
    expect(await handler(actions.save)(ctx, { token, service: false, marketing: false })).toEqual({
      service: false, marketing: false, newsletter: false, newsletterGranted: false,
    });
    expect(users.user1.emailPreferences?.newsletter).toBe(false);
  });

  it("uses the HTTP deployment for one-click and private website fragments for preferences", async () => {
    const links = await tokens();
    expect(links.unsubscribeUrl).toMatch(/^https:\/\/test-deployment.convex.site\/emails\/unsubscribe\?token=/);
    expect(links.preferencesUrl).toMatch(/^https:\/\/bestbikefit4u.example\/nl\/email-preferences#token=/);
    expect(new URL(links.preferencesUrl).search).toBe("");
    expect(links.headers).toEqual({ "List-Unsubscribe": `<${links.unsubscribeUrl}>`, "List-Unsubscribe-Post": "List-Unsubscribe=One-Click" });
    expect(verifyEmailPreferenceToken(links.unsubscribe)).toMatchObject({ userId: "user1", locale: "nl", category: "service", purpose: "unsubscribe" });
    expect(verifyEmailPreferenceToken(links.preferences)).toMatchObject({ purpose: "preferences" });
    expect(verifyEmailPreferenceToken(links.preferences)).not.toHaveProperty("email");
    const english = await buildEmailPreferenceLinks("user1", "en", "marketing");
    expect(english.preferencesUrl).toContain("/en/email-preferences#");
  });

  it("fails closed for tampering, expiry, bad purpose/category and missing secrets", async () => {
    const { unsubscribe } = await tokens();
    const [encoded, signed] = unsubscribe.split(".");
    expect(() => verifyEmailPreferenceToken(`${encoded}.${signed[0] === "a" ? "b" : "a"}${signed.slice(1)}`)).toThrow();
    const payload = verifyEmailPreferenceToken(unsubscribe);
    const resign = (patch: object) => {
      const body = Buffer.from(JSON.stringify({ ...payload, ...patch })).toString("base64url");
      return `${body}.${createHmac("sha256", process.env.EMAIL_UNSUBSCRIBE_SECRET!).update(body).digest("base64url")}`;
    };
    for (const patch of [{ expiresAt: Date.now() - 1 }, { purpose: "login" }, { category: "transactional" }, { version: 2 }, { userId: "" }]) {
      expect(() => verifyEmailPreferenceToken(resign(patch))).toThrow();
    }
    for (const value of ["", "a.b.c", "?bad", "x".repeat(2049)]) expect(() => verifyEmailPreferenceToken(value)).toThrow();
    vi.stubEnv("EMAIL_UNSUBSCRIBE_SECRET", "short");
    await expect(tokens()).rejects.toThrow();
    expect(() => verifyEmailPreferenceToken(unsubscribe)).toThrow();
    vi.stubEnv("EMAIL_UNSUBSCRIBE_SECRET", "");
    await expect(tokens()).rejects.toThrow();
  });

  it("rejects absent/unsafe origins and RPC deployment URLs", async () => {
    for (const origin of ["", "http://test.example", "https://test.convex.cloud", "https://test.example/path", "https://user:pass@test.example"]) {
      vi.stubEnv("CONVEX_SITE_URL", origin);
      await expect(tokens()).rejects.toThrow();
    }
    vi.stubEnv("CONVEX_SITE_URL", "https://test.convex.site");
    vi.stubEnv("SITE_URL", "");
    await expect(tokens()).rejects.toThrow();
  });
});

describe("email preference authorization", () => {
  it("preserves service/marketing defaults, defaults newsletter off, and updates only the authenticated account", async () => {
    const { ctx, users } = fixture();
    expect(await handler(preferences.get)(ctx, {})).toBeNull();
    await expect(handler(preferences.set)(ctx, { service: false, marketing: false })).rejects.toThrow("Not authenticated");
    auth.userId = "user1";
    expect(await handler(preferences.get)(ctx, {})).toEqual({ service: true, marketing: true, newsletter: false });
    expect(await handler(preferences.set)(ctx, { service: false, marketing: true })).toEqual({
      service: false, marketing: true, newsletter: false, newsletterGranted: false,
    });
    expect(users.user1.emailPreferences).toEqual({ service: false, marketing: true, newsletter: false });
    expect(users.user2.emailPreferences).toBeUndefined();
  });

  it("requires preferences purpose to view both categories or enable/disable them", async () => {
    const { ctx, users } = fixture();
    const links = await tokens();
    expect(await handler(actions.view)(ctx, { token: links.unsubscribe })).toEqual({ purpose: "unsubscribe", category: "service" });
    expect(ctx.db.get).not.toHaveBeenCalled();
    await expect(handler(actions.save)(ctx, { token: links.unsubscribe, service: false, marketing: false })).rejects.toThrow();
    expect(await handler(actions.view)(ctx, { token: links.preferences })).toEqual({ purpose: "preferences", preferences: { service: true, marketing: true, newsletter: false } });
    expect(await handler(actions.save)(ctx, { token: links.preferences, service: false, marketing: false })).toEqual({
      service: false, marketing: false, newsletter: false, newsletterGranted: false,
    });
    expect(users.user1.emailPreferences).toEqual({ service: false, marketing: false, newsletter: false });
    await handler(actions.save)(ctx, { token: links.preferences, service: true, marketing: true });
    expect(users.user1.emailPreferences).toEqual({ service: true, marketing: true, newsletter: false });
    await expect(handler(actions.unsubscribe)(ctx, { token: links.preferences })).rejects.toThrow();
    delete users.user1;
    await expect(handler(actions.view)(ctx, { token: links.preferences })).rejects.toThrow();
  });

  it("unsubscribes only the signed category without cookies, preserving other preferences and users", async () => {
    const { ctx, users } = fixture();
    const links = await tokens("marketing");
    await handler(actions.unsubscribe)(ctx, { token: links.unsubscribe });
    await handler(actions.unsubscribe)(ctx, { token: links.unsubscribe });
    expect(users.user1.emailPreferences).toEqual({ service: true, marketing: false, newsletter: false });
    expect(users.user2.emailPreferences).toBeUndefined();
    await handler(actions.unsubscribe)(ctx, { token: (await tokens("service")).unsubscribe });
    expect(users.user1.emailPreferences).toEqual({ service: false, marketing: false, newsletter: false });
  });
});

describe("unsubscribe HTTP route", () => {
  async function request(ctx: unknown, method: "GET" | "POST", token: string) {
    const route = http.lookup("/emails/unsubscribe", method)![0];
    const invoke = (route as unknown as { _handler: (ctx: unknown, request: Request) => Promise<Response> })._handler;
    return invoke(ctx, new Request(`https://test.convex.site/emails/unsubscribe?token=${encodeURIComponent(token)}`, {
      method, ...(method === "POST" ? { body: "List-Unsubscribe=One-Click" } : {}),
    }));
  }

  it("GET never mutates and POST performs an idempotent category-scoped unsubscribe", async () => {
    const { ctx, users } = fixture();
    const links = await tokens();
    const get = await request(ctx, "GET", links.unsubscribe);
    expect(get.status).toBe(303);
    expect(get.headers.get("location")).toContain("/nl/email-preferences#token=");
    expect(get.headers.get("cache-control")).toBe("no-store");
    expect(ctx.db.patch).not.toHaveBeenCalled();
    expect((await request(ctx, "POST", links.unsubscribe)).status).toBe(200);
    expect((await request(ctx, "POST", links.unsubscribe)).status).toBe(200);
    expect(users.user1.emailPreferences).toEqual({ service: false, marketing: true, newsletter: false });
  });

  it("newsletter GET is read-only and repeated POST disables only newsletter", async () => {
    const { ctx, users } = fixture();
    users.user1.emailPreferences = { service: false, marketing: true, newsletter: true };
    users.user2.emailPreferences = { service: true, marketing: false, newsletter: true };
    const before = structuredClone(users);
    const links = await tokens("newsletter");
    const response = await request(ctx, "GET", links.unsubscribe);
    expect(response.status).toBe(303);
    expect(response.headers.get("location")).toContain("/nl/email-preferences#token=");
    expect(response.headers.get("cache-control")).toBe("no-store");
    expect(users).toEqual(before);
    expect(ctx.db.patch).not.toHaveBeenCalled();
    expect((await request(ctx, "POST", links.unsubscribe)).status).toBe(200);
    expect((await request(ctx, "POST", links.unsubscribe)).status).toBe(200);
    expect(users.user1.emailPreferences).toEqual({ service: false, marketing: true, newsletter: false });
    expect(users.user2).toEqual(before.user2);
    await expect(handler(actions.save)(ctx, { token: links.unsubscribe, service: true, marketing: true, newsletter: true })).rejects.toThrow();
    expect(users.user1.emailPreferences?.newsletter).toBe(false);
  });

  it("invalid, expired and wrong-purpose tokens cannot mutate", async () => {
    const { ctx } = fixture();
    const links = await tokens();
    for (const token of ["", "bad", links.preferences]) expect((await request(ctx, "POST", token)).status).toBe(400);
    for (const token of ["", "bad", links.preferences]) expect((await request(ctx, "GET", token)).status).toBe(400);
    vi.spyOn(Date, "now").mockReturnValue(Date.now() + 181 * 86400000);
    expect((await request(ctx, "POST", links.unsubscribe)).status).toBe(400);
    expect(ctx.db.patch).not.toHaveBeenCalled();
  });
});
