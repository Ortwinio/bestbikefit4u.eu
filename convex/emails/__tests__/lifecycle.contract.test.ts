import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { getFunctionName } from "convex/server";

const { sendEmail, auth } = vi.hoisted(() => ({ sendEmail: vi.fn(), auth: vi.fn() }));
vi.mock("resend", () => ({ Resend: class { emails = { send: sendEmail }; } }));
vi.mock("@convex-dev/auth/server", () => ({ getAuthUserId: auth }));

import * as data from "../lifecycleData";
import * as lifecycle from "../lifecycle";
import { getUsersNeeding24hNudge } from "../fitpassData";
import { run24hProNudgeBatch, sendProWelcome } from "../fitpass";
import { getUserById } from "../../users/queries";
import { setLocale } from "../../users/mutations";
import { getBySessionInternal } from "../../recommendations/queries";

type Row = Record<string, unknown> & { _id: string; _creationTime: number };
type Predicate = (row: Row) => unknown;
type Handler = { _handler: (ctx: unknown, args: Record<string, unknown>) => Promise<unknown> };
const invoke = (definition: unknown, ctx: unknown, args: Record<string, unknown> = {}) =>
  (definition as Handler)._handler(ctx, args);
const hour = 60 * 60 * 1000;

function compareNumericFields(left: unknown, right: unknown): number {
  if (left === right) return 0;
  if (left === undefined) return -1;
  if (right === undefined) return 1;
  if (left === null) return -1;
  if (right === null) return 1;
  if (typeof left !== "number" || typeof right !== "number") {
    throw new Error("Expected numeric filter values");
  }
  return left < right ? -1 : 1;
}

function database() {
  const tables = new Map<string, Row[]>();
  const limits: number[] = [];
  let sequence = 0;
  const add = (table: string, fields: Record<string, unknown> = {}) => {
    const row = { _id: `${table}_${++sequence}`, _creationTime: sequence, ...fields } as Row;
    tables.set(table, [...(tables.get(table) ?? []), row]);
    return row;
  };
  const find = (id: string) => [...tables.values()].flat().find((row) => row._id === id) ?? null;
  const value = (expression: unknown, row: Row) => typeof expression === "function"
    ? (expression as Predicate)(row) : expression;
  const expressions = {
    field: (name: string): Predicate => (row) => row[name],
    eq: (left: unknown, right: unknown): Predicate => (row) => value(left, row) === value(right, row),
    neq: (left: unknown, right: unknown): Predicate => (row) => value(left, row) !== value(right, row),
    lt: (left: unknown, right: unknown): Predicate => (row) => compareNumericFields(value(left, row), value(right, row)) < 0,
    lte: (left: unknown, right: unknown): Predicate => (row) => compareNumericFields(value(left, row), value(right, row)) <= 0,
    gt: (left: unknown, right: unknown): Predicate => (row) => compareNumericFields(value(left, row), value(right, row)) > 0,
    gte: (left: unknown, right: unknown): Predicate => (row) => compareNumericFields(value(left, row), value(right, row)) >= 0,
    and: (...parts: Predicate[]): Predicate => (row) => parts.every((part) => part(row)),
    or: (...parts: Predicate[]): Predicate => (row) => parts.some((part) => part(row)),
  };
  const db = {
    get: vi.fn(async (id: string) => structuredClone(find(id))),
    patch: vi.fn(async (id: string, patch: Record<string, unknown>) => Object.assign(find(id)!, patch)),
    insert: vi.fn(async (table: string, fields: Record<string, unknown>) => add(table, fields)._id),
    query: (table: string) => {
      const filters: Predicate[] = [];
      let descending = false;
      const rows = () => {
        const found = (tables.get(table) ?? []).filter((row) => filters.every((filter) => filter(row)));
        return structuredClone(descending ? [...found].reverse() : found);
      };
      const index = { eq: (field: string, expected: unknown) => {
        filters.push((row) => row[field] === expected); return index;
      } };
      const query = {
        withIndex: (_name: string, apply: (range: typeof index) => unknown) => { apply(index); return query; },
        filter: (apply: (builder: typeof expressions) => Predicate) => { filters.push(apply(expressions)); return query; },
        order: (direction: string) => { descending = direction === "desc"; return query; },
        first: async () => rows()[0] ?? null,
        collect: async () => rows(),
        take: async (count: number) => { limits.push(count); return rows().slice(0, count); },
      };
      return query;
    },
  };
  const registry: Record<string, unknown> = {
    ...Object.fromEntries(Object.entries(data).map(([name, definition]) => [`emails/lifecycleData:${name}`, definition])),
    "emails/fitpassData:getUsersNeeding24hNudge": getUsersNeeding24hNudge,
    "users/queries:getUserById": getUserById,
    "recommendations/queries:getBySessionInternal": getBySessionInternal,
  };
  const ctx = { db,
    runQuery: vi.fn(async (reference, args) => invoke(registry[getFunctionName(reference)], { db }, args)),
    runMutation: vi.fn(async (reference, args) => invoke(registry[getFunctionName(reference)], { db }, args)),
  };
  const user = (fields: Record<string, unknown> = {}) => add("users", {
    email: "rider@example.test", locale: "en", displayName: "Lisa", tier: "free",
    createdAt: Date.now() - 25 * hour, ...fields,
  });
  const fit = (owner: Row) => add("recommendations", {
    userId: owner._id, sessionId: "fit-session", createdAt: Date.now() - 96 * hour,
    calculatedFit: { saddleHeightMm: 754, handlebarDropMm: 98, saddleSetbackMm: 49,
      stemLengthMm: 100, crankLengthMm: 172.5, saddleHeightRange: { min: 731, max: 774 } },
  });
  return { ctx, add, find, tables, limits, user, fit };
}

beforeEach(() => {
  vi.spyOn(Date, "now").mockReturnValue(Date.now());
  vi.stubEnv("AUTH_RESEND_KEY", "test-only-never-real");
  vi.stubEnv("EMAIL_UNSUBSCRIBE_SECRET", "test-secret-at-least-thirty-two-characters");
  vi.stubEnv("SITE_URL", "https://bestbikefit4u.eu");
  vi.stubEnv("CONVEX_SITE_URL", "https://example.convex.site");
  sendEmail.mockReset().mockResolvedValue({ data: { id: "mock-delivery" }, error: null });
});
afterEach(() => {
  vi.unstubAllEnvs();
  vi.restoreAllMocks();
});

describe("lifecycle language, preferences and delivery", () => {
  it("uses EN, then saved NL on the next cron, and records each actual locale", async () => {
    const store = database();
    const user = store.user();
    auth.mockResolvedValue(user._id);
    await invoke(lifecycle.runDay1TipsBatch, store.ctx);
    expect(sendEmail.mock.calls[0][0].html).toContain('lang="en"');
    await invoke(setLocale, store.ctx, { locale: "nl" });
    vi.mocked(Date.now).mockReturnValue(Date.now() + 48 * hour);
    await invoke(lifecycle.runFitReminderBatch, store.ctx);
    expect(sendEmail.mock.calls[1][0].html).toContain('lang="nl"');
    expect(sendEmail.mock.calls[1][0].subject).toBe("Je fit in 10 minuten, met alleen een meetlint");
    expect(store.tables.get("lifecycleEmailLog")?.map((row) => row.locale)).toEqual(["en", "nl"]);
    await invoke(lifecycle.runDay1TipsBatch, store.ctx);
    expect(sendEmail).toHaveBeenCalledTimes(2);
  });

  it("waits 24h for day1, 72h for reminder, and skips a started fit", async () => {
    const store = database();
    store.user({ createdAt: Date.now() - 23 * hour });
    const dayOne = store.user({ createdAt: Date.now() - 25 * hour });
    const started = store.user();
    store.add("fitSessions", { userId: started._id });
    const eligible = await invoke(data.getUsersNeedingDay1Tips, store.ctx) as Row[];
    expect(eligible.map((row) => row._id)).toEqual([dayOne._id, started._id]);
    await store.ctx.db.patch(started._id, { createdAt: Date.now() - 73 * hour });
    expect(await invoke(data.getUsersNeedingFitReminder, store.ctx)).toEqual([]);
    store.user({ createdAt: Date.now() - 73 * hour });
    await invoke(lifecycle.runFitReminderBatch, store.ctx);
    expect(sendEmail).toHaveBeenCalledTimes(1);
  });

  it.each([0, 25, 73, 240])("skips legacy users without createdAt even with a %ih-old _creationTime", async (ageHours) => {
    const store = database();
    const user = store.user({ _creationTime: Date.now() - ageHours * hour });
    delete user.createdAt;
    expect(await invoke(data.getUsersNeedingDay1Tips, store.ctx)).toEqual([]);
    expect(await invoke(data.getUsersNeedingFitReminder, store.ctx)).toEqual([]);
    await invoke(lifecycle.runDay1TipsBatch, store.ctx);
    await invoke(lifecycle.runFitReminderBatch, store.ctx);
    expect(sendEmail).not.toHaveBeenCalled();
    expect(store.tables.get("lifecycleEmailLog")).toBeUndefined();
  });

  it.each([
    [24 * hour - 1, false, false],
    [24 * hour, true, false],
    [48 * hour - 1, true, false],
    [48 * hour, false, false],
    [72 * hour - 1, false, false],
    [72 * hour, false, true],
    [96 * hour - 1, false, true],
    [96 * hour, false, false],
    [240 * hour, false, false],
  ])("enforces bounded windows for age %ims, without a prior sent log", async (ageMs, day1Eligible, reminderEligible) => {
    const store = database();
    const user = store.user({ createdAt: Date.now() - Number(ageMs), _creationTime: Date.now() });
    const day1 = await invoke(data.getUsersNeedingDay1Tips, store.ctx) as Row[];
    const reminder = await invoke(data.getUsersNeedingFitReminder, store.ctx) as Row[];
    expect(day1.map((row) => row._id)).toEqual(day1Eligible ? [user._id] : []);
    expect(reminder.map((row) => row._id)).toEqual(reminderEligible ? [user._id] : []);
    await invoke(lifecycle.runDay1TipsBatch, store.ctx);
    await invoke(lifecycle.runFitReminderBatch, store.ctx);
    const expectedCount = Number(day1Eligible) + Number(reminderEligible);
    expect(sendEmail).toHaveBeenCalledTimes(expectedCount);
    expect(store.tables.get("lifecycleEmailLog")?.length ?? 0).toBe(expectedCount);
  });

  it("filters old and missing-createdAt users before applying the 200-user limit", async () => {
    const store = database();
    for (let index = 0; index < 200; index++) {
      store.user({ createdAt: Date.now() - 240 * hour });
      const legacy = store.user({ _creationTime: Date.now() - 25 * hour });
      delete legacy.createdAt;
    }
    const day1User = store.user();
    const reminderUser = store.user({ createdAt: Date.now() - 73 * hour });
    const day1 = await invoke(data.getUsersNeedingDay1Tips, store.ctx) as Row[];
    const reminder = await invoke(data.getUsersNeedingFitReminder, store.ctx) as Row[];
    expect(day1.map((row) => row._id)).toEqual([day1User._id]);
    expect(reminder.map((row) => row._id)).toEqual([reminderUser._id]);
    expect(store.limits).toEqual([200, 200]);
  });

  it.each([
    ["day1_tips", 25, lifecycle.runDay1TipsBatch],
    ["fit_reminder", 73, lifecycle.runFitReminderBatch],
  ] as const)("preserves existing %s logs and suppresses repeat delivery", async (emailType, ageHours, batch) => {
    const store = database();
    const user = store.user({ createdAt: Date.now() - ageHours * hour });
    const log = store.add("lifecycleEmailLog", { userId: user._id, emailType, sentAt: Date.now() - hour, locale: "en" });
    await invoke(batch, store.ctx);
    expect(sendEmail).not.toHaveBeenCalled();
    expect(store.tables.get("lifecycleEmailLog")).toEqual([log]);
  });

  it("skips opted-out categories and adds both one-click headers to all five eligible mail types", async () => {
    const store = database();
    const unsubscribed = store.user({ emailPreferences: { service: false, marketing: false } });
    store.fit(unsubscribed);
    await invoke(lifecycle.runDay1TipsBatch, store.ctx);
    await invoke(lifecycle.runUpgradeNudgeBatch, store.ctx);
    expect(sendEmail).not.toHaveBeenCalled();
    const active = store.user({ lastLoginAt: Date.now() - 30 * 24 * hour });
    store.fit(active);
    await invoke(lifecycle.runDay1TipsBatch, store.ctx);
    vi.mocked(Date.now).mockReturnValue(Date.now() + 48 * hour);
    await invoke(lifecycle.runFitReminderBatch, store.ctx);
    await invoke(lifecycle.runUpgradeNudgeBatch, store.ctx);
    await invoke(lifecycle.runWinbackBatch, store.ctx);
    await store.ctx.db.patch(active._id, { tier: "pro", proSince: Date.now() - 24 * hour });
    await invoke(run24hProNudgeBatch, store.ctx);
    expect(sendEmail).toHaveBeenCalledTimes(5);
    for (const [message] of sendEmail.mock.calls) {
      expect(message.headers["List-Unsubscribe"]).toMatch(/^<https:\/\/example\.convex\.site\/emails\/unsubscribe\?/);
      expect(message.headers["List-Unsubscribe-Post"]).toBe("List-Unsubscribe=One-Click");
      expect(message.text.length).toBeGreaterThan(40);
    }
    expect(store.limits.every((count) => count === 200 || count === 500)).toBe(true);
    expect(store.limits).toContain(200);
    expect(store.limits).toContain(500);
  });

  it("rechecks opt-out after selection and keeps transactional welcome enabled", async () => {
    const store = database();
    const user = store.user();
    const runQuery = store.ctx.runQuery.getMockImplementation()!;
    store.ctx.runQuery.mockImplementation(async (reference, args) => {
      const result = await runQuery(reference, args);
      if (getFunctionName(reference) === "emails/lifecycleData:getUsersNeedingDay1Tips") {
        await store.ctx.db.patch(user._id, { emailPreferences: { service: false, marketing: false } });
      }
      return result;
    });
    await invoke(lifecycle.runDay1TipsBatch, store.ctx);
    expect(sendEmail).not.toHaveBeenCalled();
    await invoke(sendProWelcome, store.ctx, { userId: user._id });
    expect(sendEmail).toHaveBeenCalledTimes(1);
    expect(sendEmail.mock.calls[0][0]).not.toHaveProperty("headers");
  });

  it("never logs failed or unconfigured sends as successful", async () => {
    const store = database();
    store.user();
    sendEmail.mockResolvedValueOnce({ error: { message: "Mock rejection" } });
    await expect(invoke(lifecycle.runDay1TipsBatch, store.ctx)).rejects.toThrow("Mock rejection");
    expect(store.tables.get("lifecycleEmailLog")).toBeUndefined();
    vi.stubEnv("AUTH_RESEND_KEY", "");
    await invoke(lifecycle.runDay1TipsBatch, store.ctx);
    expect(store.tables.get("lifecycleEmailLog")).toBeUndefined();
  });

  it("sends transactional recap in the latest saved language with owned bike data despite opt-out", async () => {
    const store = database();
    const user = store.user({ locale: "nl", emailPreferences: { service: false, marketing: false } });
    const bike = store.add("bikes", { userId: user._id, name: "Canyon Endurace" });
    const session = store.add("fitSessions", { userId: user._id, bikeId: bike._id });
    const recommendation = store.fit(user);
    await store.ctx.db.patch(recommendation._id, { sessionId: session._id });
    await invoke(lifecycle.sendResultsRecap, store.ctx, { userId: user._id, sessionId: session._id, locale: "en" });
    expect(sendEmail).toHaveBeenCalledTimes(1);
    const message = sendEmail.mock.calls[0][0];
    expect(message.html).toContain('lang="nl"');
    expect(message.text).toContain("Canyon Endurace");
    expect(message).not.toHaveProperty("headers");
    expect(store.tables.get("lifecycleEmailLog")?.[0]).toMatchObject({ locale: "nl", sessionId: session._id });
    await invoke(lifecycle.sendResultsRecap, store.ctx, { userId: user._id, sessionId: session._id });
    expect(sendEmail).toHaveBeenCalledTimes(1);
    await invoke(lifecycle.sendResultsRecap, store.ctx, { userId: store.user()._id, sessionId: session._id });
    expect(sendEmail).toHaveBeenCalledTimes(1);
  });
});
