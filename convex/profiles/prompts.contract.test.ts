import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { getFunctionName } from "convex/server";
import type { Doc } from "../_generated/dataModel";
import { scoreRiderProfile } from "../../shared/profileScore";
import { nextPrompts, openPromptCard, dismissPromptCard, skipProfilePrompt, answerProfilePrompt, recordPromptInterest } from "./prompts";

const auth = vi.hoisted(() => ({ userId: "owner" as string | null, sessionId: "session1" as string | null }));
vi.mock("@convex-dev/auth/server", () => ({
  getAuthUserId: async () => auth.userId,
  getAuthSessionId: async () => auth.sessionId,
}));

type Row = Record<string, unknown> & { _id: string; _creationTime: number };
type Expression = (row: Row) => unknown;
type Handler = { _handler: (ctx: unknown, args: unknown) => Promise<unknown> };
const invoke = (handler: unknown, ctx: unknown, args: unknown = {}) =>
  (handler as Handler)._handler(ctx, args);
const DAY = 24 * 60 * 60 * 1000;
const NOW = Date.UTC(2026, 9, 3, 12);
let now = NOW;

const completeProfile = {
  heightCm: 180, inseamCm: 84, torsoLengthCm: 59, armLengthCm: 63,
  shoulderWidthCm: 40, femurLengthCm: 44, sitBoneWidthMm: 120,
  flexibilityScore: "good", coreStabilityScore: 4, weightKg: 75, weightUpdatedAt: NOW,
  experienceLevel: "intermediate", weeklyHours: "3-6", typicalRideLength: "medium",
  hasPain: "no", painAreas: [], positionPriority: "balanced", shoeSizeEu: 43,
  cleatSystem: "spd", ftpWatts: 250, ftpMeasuredAt: NOW, ftpMethod: "ftp_test", updatedAt: NOW,
};
const measuredFields = ["heightCm", "inseamCm", "torsoLengthCm", "armLengthCm", "shoulderWidthCm",
  "femurLengthCm", "sitBoneWidthMm", "weightKg"] as const;
const initialMeasuredFields = measuredFields.filter((field) => field !== "armLengthCm");

function context() {
  const tables = new Map<string, Row[]>();
  let sequence = 0;
  const stored = (id: string) => [...tables.values()].flat().find((row) => row._id === id) ?? null;
  const insert = vi.fn(async (table: string, fields: Record<string, unknown>) => {
    const row = { ...structuredClone(fields), _id: `${table}_${++sequence}`, _creationTime: now + sequence };
    tables.set(table, [...(tables.get(table) ?? []), row]);
    return row._id;
  });
  const get = vi.fn(async (id: string) => structuredClone(stored(id)));
  const patch = vi.fn(async (id: string, fields: Record<string, unknown>) => {
    const row = stored(id);
    if (!row) throw new Error("Row not found");
    for (const [field, value] of Object.entries(fields)) {
      if (value === undefined) delete row[field];
      else row[field] = structuredClone(value);
    }
  });
  const remove = vi.fn(async (id: string) => {
    for (const [table, rows] of tables) tables.set(table, rows.filter((row) => row._id !== id));
  });
  const query = vi.fn((table: string) => {
    const predicates: ((row: Row) => boolean)[] = [];
    let direction = 1;
    let indexName = "";
    const index = {
      eq: (field: string, value: unknown) => { predicates.push((row) => row[field] === value); return index; },
      gt: (field: string, value: number) => { predicates.push((row) => Number(row[field]) > value); return index; },
      gte: (field: string, value: number) => { predicates.push((row) => Number(row[field]) >= value); return index; },
      lt: (field: string, value: number) => { predicates.push((row) => Number(row[field]) < value); return index; },
      lte: (field: string, value: number) => { predicates.push((row) => Number(row[field]) <= value); return index; },
    };
    const evaluate = (value: unknown, row: Row): unknown => typeof value === "function" ? (value as Expression)(row) : value;
    const expression = {
      field: (name: string): Expression => (row) => row[name],
      eq: (left: unknown, right: unknown): Expression => (row) => evaluate(left, row) === evaluate(right, row),
      neq: (left: unknown, right: unknown): Expression => (row) => evaluate(left, row) !== evaluate(right, row),
      gt: (left: unknown, right: unknown): Expression => (row) => Number(evaluate(left, row)) > Number(evaluate(right, row)),
      gte: (left: unknown, right: unknown): Expression => (row) => Number(evaluate(left, row)) >= Number(evaluate(right, row)),
      lt: (left: unknown, right: unknown): Expression => (row) => Number(evaluate(left, row)) < Number(evaluate(right, row)),
      lte: (left: unknown, right: unknown): Expression => (row) => Number(evaluate(left, row)) <= Number(evaluate(right, row)),
      and: (...conditions: Expression[]): Expression => (row) => conditions.every((condition) => condition(row)),
      or: (...conditions: Expression[]): Expression => (row) => conditions.some((condition) => condition(row)),
      not: (condition: Expression): Expression => (row) => !condition(row),
    };
    const rows = () => structuredClone((tables.get(table) ?? [])
      .filter((row) => predicates.every((predicate) => predicate(row)))
      .sort((first, second) => {
        const field = indexName === "by_user_shown" ? "shownAt" : indexName === "by_user_updated" ? "updatedAt" : "_creationTime";
        return direction * (Number(first[field]) - Number(second[field]));
      }));
    const cursor = {
      withIndex: (name: string, apply?: (builder: typeof index) => unknown) => {
        indexName = name;
        apply?.(index);
        return cursor;
      },
      filter: (apply: (builder: typeof expression) => Expression) => {
        const predicate = apply(expression);
        predicates.push((row) => Boolean(predicate(row)));
        return cursor;
      },
      order: (value: "asc" | "desc") => { direction = value === "desc" ? -1 : 1; return cursor; },
      orderBy: (value: "asc" | "desc") => { direction = value === "desc" ? -1 : 1; return cursor; },
      collect: async () => rows(),
      unique: async () => {
        const matches = rows();
        if (matches.length > 1) throw new Error("Expected a unique row");
        return matches[0] ?? null;
      },
      first: async () => rows()[0] ?? null,
      take: async (count: number) => rows().slice(0, count),
    };
    return cursor;
  });
  const db = { get, insert, patch, delete: remove, query };
  const runMutation = vi.fn(async (reference: Parameters<typeof getFunctionName>[0], args: Record<string, unknown>) => {
    expect(getFunctionName(reference)).toBe("bikes/mutations:update");
    const { bikeId, ...updates } = args;
    const bike = await get(String(bikeId));
    if (!bike || bike.userId !== auth.userId) throw new Error("Bike not found");
    await patch(bike._id, updates);
    return null;
  });
  const clearWrites = () => { insert.mockClear(); patch.mockClear(); remove.mockClear(); runMutation.mockClear(); };
  const expectNoWrites = () => {
    expect(insert).not.toHaveBeenCalled();
    expect(patch).not.toHaveBeenCalled();
    expect(remove).not.toHaveBeenCalled();
    expect(runMutation).not.toHaveBeenCalled();
  };
  return { db, tables, runMutation, clearWrites, expectNoWrites };
}

async function fixture(overrides: Record<string, unknown> = {}) {
  const ctx = context();
  ctx.tables.set("users", [{ _id: "owner", _creationTime: now, lastLoginAt: now }]);
  const fields = { ...completeProfile, armLengthCm: undefined, ftpWatts: undefined, ...overrides };
  const profileId = await ctx.db.insert("profiles", Object.fromEntries(
    Object.entries({ userId: "owner", ...fields }).filter(([, value]) => value !== undefined),
  ));
  for (const field of measuredFields) {
    if (fields[field] === undefined) continue;
    await ctx.db.insert("profileObservations", {
      userId: "owner", field, value: fields[field], unit: field === "weightKg" ? "kg" : field.endsWith("Mm") ? "mm" : "cm",
      kind: "measured", method: "single_measurement", source: "profile_edit", recordedAt: now, status: "current",
    });
  }
  ctx.clearWrites();
  return { ...ctx, profileId };
}

async function newSession(ctx: ReturnType<typeof context>, sessionId: string, elapsed = DAY) {
  now += elapsed;
  auth.sessionId = sessionId;
  await ctx.db.patch("owner", { lastLoginAt: now });
  ctx.clearWrites();
}

beforeEach(() => {
  auth.userId = "owner";
  auth.sessionId = "session1";
  now = NOW;
  vi.spyOn(Date, "now").mockImplementation(() => now);
});
afterEach(() => vi.restoreAllMocks());

type Question = { key: string; field: string; bikeId?: string; value: number | string | null;
  status: "pending" | "answered" | "skipped"; kind: string; stale: boolean; effort: string };
type View = { cardId: string | null; shownAt: number | null; hiddenUntil: number | null; questions: Question[] };
const open = (ctx: ReturnType<typeof context>) => invoke(openPromptCard, ctx) as Promise<View>;
const read = (ctx: ReturnType<typeof context>) => invoke(nextPrompts, ctx) as Promise<View>;
function question(view: View, field: string) {
  const result = view.questions.find((entry) => entry.field === field);
  expect(result, `Expected reserved ${field} question`).toBeDefined();
  return result!;
}
function answerArgs(view: View, field: string, value: number | string, method = "single_measurement") {
  const entry = question(view, field);
  return { cardId: view.cardId, key: entry.key, value, method, expectedCurrentValue: entry.value };
}

describe("profile prompt card reservations", () => {
  it("queries are read-only and opening reserves at most two questions without saving default profile facts", async () => {
    const ctx = await fixture();
    const profile = await ctx.db.get(ctx.profileId);
    const observations = structuredClone(ctx.tables.get("profileObservations"));
    expect(await read(ctx)).toMatchObject({ cardId: null, questions: [] });
    ctx.expectNoWrites();
    const card = await open(ctx);
    expect(card.questions.map((entry) => entry.field)).toEqual(["ftpWatts", "armLengthCm"]);
    expect(card.questions.every((entry) => entry.value === null)).toBe(true);
    expect(card.questions.filter((entry) => entry.effort === "measure")).toHaveLength(1);
    expect(ctx.tables.get("profilePromptCards")).toHaveLength(1);
    expect(await ctx.db.get(ctx.profileId)).toEqual(profile);
    expect(ctx.tables.get("profileObservations")).toEqual(observations);
    expect(ctx.db.insert.mock.calls.every(([table]) => table === "profilePromptCards")).toBe(true);
  });

  it("rerenders and a second tab reuse a committed reservation without additional writes", async () => {
    const ctx = await fixture();
    const firstTab = await open(ctx);
    ctx.clearWrites();
    expect(await open(ctx)).toEqual(firstTab);
    expect(await read(ctx)).toEqual(firstTab);
    expect(await open(ctx)).toEqual(firstTab);
    ctx.expectNoWrites();
    expect(ctx.tables.get("profilePromptCards")).toHaveLength(1);
  });

  it("enforces the 24-hour card limit across logins, including the exact expiry", async () => {
    const ctx = await fixture();
    await open(ctx);
    await newSession(ctx, "session2", DAY - 1);
    expect(await open(ctx)).toMatchObject({ cardId: null, hiddenUntil: NOW + DAY, questions: [] });
    ctx.expectNoWrites();
    now += 1;
    const second = await open(ctx);
    expect(second.questions).toHaveLength(2);
    expect(ctx.tables.get("profilePromptCards")).toHaveLength(2);
  });

  it("keeps the same session capped at its original two slots even after a day and profile changes", async () => {
    const ctx = await fixture({ hasPain: undefined });
    const first = await open(ctx);
    await invoke(answerProfilePrompt, ctx, answerArgs(first, "ftpWatts", 245, "self_report"));
    await invoke(answerProfilePrompt, ctx, answerArgs(first, "armLengthCm", 64));
    await ctx.db.patch(ctx.profileId, { heightCm: undefined, inseamCm: undefined, weightKg: undefined });
    now += 3 * DAY;
    ctx.clearWrites();
    const again = await open(ctx);
    expect(again.cardId).toBe(first.cardId);
    expect(again.questions.map((entry) => entry.key)).toEqual(first.questions.map((entry) => entry.key));
    expect(again.questions.every((entry) => entry.status === "answered")).toBe(true);
    expect(ctx.tables.get("profilePromptCards")).toHaveLength(1);
    ctx.expectNoWrites();
  });

  it("dismissal hides the card for seven days across sessions without changing profile facts", async () => {
    const ctx = await fixture();
    const first = await open(ctx);
    const profile = await ctx.db.get(ctx.profileId);
    await invoke(dismissPromptCard, ctx, { cardId: first.cardId });
    expect((await read(ctx)).hiddenUntil).toBe(NOW + 7 * DAY);
    expect(await ctx.db.get(ctx.profileId)).toEqual(profile);
    expect(ctx.tables.get("profileObservations")?.map((entry) => entry.field)).toEqual(initialMeasuredFields);
    await newSession(ctx, "session2", 7 * DAY - 1);
    expect(await open(ctx)).toMatchObject({ questions: [], hiddenUntil: NOW + 7 * DAY });
    ctx.expectNoWrites();
    now += 1;
    expect((await open(ctx)).questions).toHaveLength(2);
  });

  it("a repeated dismissal does not extend the original seven-day deadline", async () => {
    const ctx = await fixture();
    const card = await open(ctx);
    await invoke(dismissPromptCard, ctx, { cardId: card.cardId });
    now += DAY;
    ctx.clearWrites();
    expect(await invoke(dismissPromptCard, ctx, { cardId: card.cardId })).toBeNull();
    expect((await read(ctx)).hiddenUntil).toBe(NOW + 7 * DAY);
    ctx.expectNoWrites();
  });

  it("skips for fourteen days, ignores duplicate clicks, and makes the third skip profile-only across logins", async () => {
    const ctx = await fixture();
    let card = await open(ctx);
    const key = question(card, "ftpWatts").key;
    for (let count = 1; count <= 3; count += 1) {
      await invoke(skipProfilePrompt, ctx, { cardId: card.cardId, key });
      expect(ctx.tables.get("profilePrompts")).toEqual([expect.objectContaining({
        userId: "owner", key, skipCount: count, skippedUntil: now + 14 * DAY, profileOnly: count === 3,
      })]);
      ctx.clearWrites();
      await invoke(skipProfilePrompt, ctx, { cardId: card.cardId, key });
      ctx.expectNoWrites();
      if (count < 3) {
        await newSession(ctx, `cooldown${count}`, 14 * DAY - 1);
        expect((await open(ctx)).questions.some((entry) => entry.key === key)).toBe(false);
        await newSession(ctx, `repeat${count}`, DAY);
        card = await open(ctx);
        expect(card.questions.some((entry) => entry.key === key)).toBe(true);
      }
    }
    await newSession(ctx, "much-later", 100 * DAY);
    expect((await open(ctx)).questions.some((entry) => entry.key === key)).toBe(false);
    expect((await ctx.db.get(ctx.profileId))?.ftpWatts).toBeUndefined();
    expect(ctx.tables.get("profileObservations")?.map((entry) => entry.field)).toEqual(initialMeasuredFields);
  });

  it("never selects sensitive candidates even when only those profile facts are missing", async () => {
    const ctx = await fixture({ ...completeProfile, hasPain: undefined, painAreas: undefined,
      painSeverity: undefined, kneePainTiming: undefined, injuryHistory: undefined });
    const card = await open(ctx);
    expect(card.questions).toEqual([]);
    expect(ctx.tables.get("profilePromptCards")).toBeUndefined();
    ctx.expectNoWrites();
  });
});

describe("profile prompt answers and provenance", () => {
  it("hides remaining non-stale slots after an answer passes 90 percent, without replacing the reservation", async () => {
    const ctx = await fixture();
    const card = await open(ctx);
    const armArgs = answerArgs(card, "armLengthCm", 64);
    await invoke(answerProfilePrompt, ctx, answerArgs(card, "ftpWatts", 245, "self_report"));
    ctx.clearWrites();
    const view = await read(ctx);
    expect(view.cardId).toBe(card.cardId);
    expect(view.questions.map((entry) => entry.field)).toEqual(["ftpWatts"]);
    expect(question(view, "ftpWatts").status).toBe("answered");
    expect((await ctx.db.get(card.cardId!))?.questions).toEqual(expect.arrayContaining([
      expect.objectContaining({ field: "armLengthCm", status: "pending" }),
    ]));
    await expect(invoke(answerProfilePrompt, ctx, armArgs)).rejects.toThrow("Prompt is no longer applicable");
    expect((await open(ctx)).questions).toEqual(view.questions);
    ctx.expectNoWrites();
  });

  it("creates a partial profile from one explicit answer without filling other fields", async () => {
    const ctx = await fixture();
    await ctx.db.delete(ctx.profileId);
    ctx.tables.delete("profileObservations");
    const card = await open(ctx);
    await invoke(answerProfilePrompt, ctx, answerArgs(card, "flexibilityScore", "good", "self_assessment"));
    const profiles = ctx.tables.get("profiles")!;
    expect(profiles).toHaveLength(1);
    expect(profiles[0]).toMatchObject({ userId: "owner", flexibilityScore: "good" });
    for (const field of ["heightCm", "inseamCm", "armLengthCm", "weightKg", "ftpWatts"]) expect(profiles[0]).not.toHaveProperty(field);
    expect(ctx.tables.get("profileObservations")).toEqual([expect.objectContaining({
      field: "flexibilityScore", value: "good", kind: "estimated", method: "self_assessment", recordedAt: now,
    })]);
  });

  it("saves only the explicit answer with actual provenance and treats duplicate submissions as read-only", async () => {
    const ctx = await fixture();
    const card = await open(ctx);
    const args = answerArgs(card, "armLengthCm", 64);
    expect(await invoke(answerProfilePrompt, ctx, args)).toEqual({ status: "saved", field: "armLengthCm" });
    expect(await ctx.db.get(ctx.profileId)).toMatchObject({ armLengthCm: 64, updatedAt: now, riderProfileUpdatedAt: now });
    expect((await ctx.db.get(ctx.profileId))?.ftpWatts).toBeUndefined();
    expect(ctx.tables.get("profileObservations")?.filter((entry) => entry.field === "armLengthCm")).toEqual([expect.objectContaining({
      userId: "owner", field: "armLengthCm", value: 64, kind: "measured", method: "single_measurement",
      source: "profile_edit", recordedAt: now, status: "current", unit: "cm",
    })]);
    ctx.clearWrites();
    expect(await invoke(answerProfilePrompt, ctx, args)).toEqual({ status: "saved", field: "armLengthCm" });
    ctx.expectNoWrites();
  });

  it("stores test-derived FTP as derived, with the supplied value and real date", async () => {
    const ctx = await fixture();
    const card = await open(ctx);
    await invoke(answerProfilePrompt, ctx, answerArgs(card, "ftpWatts", 245, "ftp_test"));
    expect(await ctx.db.get(ctx.profileId)).toMatchObject({ ftpWatts: 245, ftpMeasuredAt: now });
    expect(ctx.tables.get("profileObservations")?.filter((entry) => entry.field === "ftpWatts")).toEqual([expect.objectContaining({
      field: "ftpWatts", value: 245, kind: "derived", method: "ftp_test", recordedAt: now,
    })]);
  });

  it("returns conflicts with zero writes, then rejects an answer made ineligible by the concurrent value", async () => {
    const ctx = await fixture();
    const card = await open(ctx);
    const args = answerArgs(card, "ftpWatts", 245, "self_report");
    await ctx.db.patch(ctx.profileId, { ftpWatts: 260 });
    ctx.clearWrites();
    expect(await invoke(answerProfilePrompt, ctx, args)).toEqual({
      status: "conflict", field: "ftpWatts", currentValue: 260, incomingValue: 245,
    });
    ctx.expectNoWrites();
    expect((await read(ctx)).questions.some((entry) => entry.field === "ftpWatts")).toBe(false);
    expect((await ctx.db.get(card.cardId!))?.questions).toEqual(expect.arrayContaining([
      expect.objectContaining({ field: "ftpWatts", status: "pending" }),
    ]));
    await expect(invoke(answerProfilePrompt, ctx, { ...args, expectedCurrentValue: 260 })).rejects.toThrow("Prompt is no longer applicable");
    ctx.expectNoWrites();
    expect((await ctx.db.get(ctx.profileId))?.ftpWatts).toBe(260);
  });

  it.each([undefined, NaN, Infinity, 0, 701, "245"])("rejects invalid FTP %s without writes", async (value) => {
    const ctx = await fixture();
    const card = await open(ctx);
    ctx.clearWrites();
    await expect(invoke(answerProfilePrompt, ctx, { ...answerArgs(card, "ftpWatts", 245, "self_report"), value })).rejects.toThrow();
    ctx.expectNoWrites();
  });

  it.each(["self_report", "ftp_test"])("rejects incompatible arm measurement method %s", async (method) => {
    const ctx = await fixture();
    const card = await open(ctx);
    ctx.clearWrites();
    await expect(invoke(answerProfilePrompt, ctx, answerArgs(card, "armLengthCm", 64, method))).rejects.toThrow();
    ctx.expectNoWrites();
  });

  it("rejects unreserved and skipped answers without creating profile facts", async () => {
    const ctx = await fixture();
    const card = await open(ctx);
    const args = answerArgs(card, "ftpWatts", 245, "self_report");
    await invoke(skipProfilePrompt, ctx, { cardId: card.cardId, key: args.key });
    ctx.clearWrites();
    await expect(invoke(answerProfilePrompt, ctx, args)).rejects.toThrow();
    await expect(invoke(answerProfilePrompt, ctx, { ...args, key: "rider:heightCm" })).rejects.toThrow();
    ctx.expectNoWrites();
  });

  it("does not create a profile or any default observations just by opening an empty account's card", async () => {
    const ctx = await fixture();
    await ctx.db.delete(ctx.profileId);
    ctx.tables.delete("profileObservations");
    ctx.clearWrites();
    const card = await open(ctx);
    expect(card.questions).toHaveLength(2);
    expect(card.questions.every((entry) => entry.value === null)).toBe(true);
    expect(ctx.tables.get("profiles")).toEqual([]);
    expect(ctx.tables.get("profileObservations")).toBeUndefined();
  });
});

describe("prompt authorization", () => {
  it.each([
    ["next", nextPrompts], ["open", openPromptCard], ["dismiss", dismissPromptCard],
    ["skip", skipProfilePrompt], ["answer", answerProfilePrompt],
  ])("%s authenticates before any database access", async (_name, handler) => {
    const ctx = await fixture();
    ctx.db.get.mockClear(); ctx.db.query.mockClear();
    auth.userId = null;
    await expect(invoke(handler, ctx, {})).rejects.toThrow("Not authenticated");
    ctx.expectNoWrites();
    expect(ctx.db.get).not.toHaveBeenCalled();
    expect(ctx.db.query).not.toHaveBeenCalled();
  });

  it.each(["foreign-user", "different-session", "missing-card", "hidden-card"])("rejects %s mutations without writes", async (scope) => {
    const ctx = await fixture();
    const card = await open(ctx);
    const args = answerArgs(card, "ftpWatts", 245, "self_report");
    if (scope === "foreign-user") {
      ctx.tables.set("users", [...ctx.tables.get("users")!, { _id: "other", _creationTime: now, lastLoginAt: now }]);
      auth.userId = "other";
    }
    if (scope === "different-session") auth.sessionId = "session2";
    if (scope === "missing-card") args.cardId = "missing";
    if (scope === "hidden-card") await invoke(dismissPromptCard, ctx, { cardId: args.cardId });
    ctx.clearWrites();
    const handlers = scope === "hidden-card" ? [skipProfilePrompt, answerProfilePrompt]
      : [dismissPromptCard, skipProfilePrompt, answerProfilePrompt];
    for (const handler of handlers) {
      await expect(invoke(handler, ctx, args)).rejects.toThrow();
    }
    ctx.expectNoWrites();
  });

  it.each(["hasPain", "painAreas", "painSeverity", "kneePainTiming", "injuryHistory"])("rejects a forged sensitive %s slot", async (field) => {
    const ctx = await fixture();
    const key = `rider:${field}`;
    const cardId = await ctx.db.insert("profilePromptCards", { userId: "owner", sessionKey: "session1", shownAt: now,
      questions: [{ key, field, status: "pending" }] });
    ctx.clearWrites();
    await expect(invoke(answerProfilePrompt, ctx, { cardId, key, value: "yes", method: "self_report", expectedCurrentValue: null })).rejects.toThrow();
    ctx.expectNoWrites();
  });
});

describe("stale measurements and bike prompts", () => {
  it.each([
    ["weightKg", 75, 6, "measured"], ["ftpWatts", 250, 6, "measured"], ["flexibilityScore", "good", 12, "estimated"],
  ] as const)("uses the actual %s observation date at its staleness boundary", async (field, value, months, kind) => {
    const ctx = await fixture({ ...completeProfile });
    const threshold = new Date(now);
    threshold.setUTCMonth(threshold.getUTCMonth() - months);
    const existing = ctx.tables.get("profileObservations")?.find((entry) => entry.field === field);
    const observationId = existing?._id ?? await ctx.db.insert("profileObservations", {
      userId: "owner", field, value, kind, unit: "none", method: "single_measurement", source: "profile_edit", status: "current",
    });
    await ctx.db.patch(observationId, { recordedAt: threshold.getTime() });
    expect((await open(ctx)).questions).toEqual([]);
    await ctx.db.patch(observationId, { recordedAt: threshold.getTime() - 1 });
    const card = await open(ctx);
    expect(card.questions).toHaveLength(1);
    expect(question(card, field)).toMatchObject({ value, stale: true });
  });

  it("refuses derived FTP replacing an existing measured value without any writes", async () => {
    const ctx = await fixture({ ...completeProfile, ftpMeasuredAt: now - 220 * DAY });
    const observationId = await ctx.db.insert("profileObservations", { userId: "owner", field: "ftpWatts", value: 250,
      unit: "W", kind: "measured", method: "single_measurement", source: "profile_edit", recordedAt: now - 220 * DAY, status: "current" });
    const card = await open(ctx);
    ctx.clearWrites();
    await expect(invoke(answerProfilePrompt, ctx, answerArgs(card, "ftpWatts", 245, "ftp_test")))
      .rejects.toThrow("A calculated value cannot replace a measurement");
    ctx.expectNoWrites();
    expect(await ctx.db.get(observationId)).toMatchObject({ status: "current", value: 250, kind: "measured" });
  });

  it("delegates bike type edits to the existing bike mutation with confirmation flags", async () => {
    const ctx = await fixture();
    const bikeId = await ctx.db.insert("bikes", { userId: "owner", name: "Owner bike", bikeType: "road",
      needsTypeConfirmation: true, bikeTypeSource: "inferred", createdAt: now, updatedAt: now });
    const key = `bike:${bikeId}:bikeType`;
    const cardId = await ctx.db.insert("profilePromptCards", { userId: "owner", sessionKey: "session1", shownAt: now,
      questions: [{ key, field: "bikeType", bikeId, status: "pending" }] });
    await invoke(answerProfilePrompt, ctx, { cardId, key, value: "gravel", method: "self_report", expectedCurrentValue: "road" });
    expect(ctx.runMutation).toHaveBeenCalledExactlyOnceWith(expect.anything(), {
      bikeId, bikeType: "gravel", bikeTypeSource: "user", needsTypeConfirmation: false,
    });
    expect(await ctx.db.get(bikeId)).toMatchObject({ bikeType: "gravel", needsTypeConfirmation: false });
    expect(ctx.tables.get("profileObservations")?.filter((entry) => entry.bikeId === bikeId)).toEqual([
      expect.objectContaining({ field: "bikeType", value: "gravel", kind: "declared", source: "profile_edit" }),
    ]);
  });

  it("rejects an unsupported bike type without writes or delegation", async () => {
    const ctx = await fixture();
    const bikeId = await ctx.db.insert("bikes", { userId: "owner", name: "Owner bike", bikeType: "road", needsTypeConfirmation: true });
    const key = `bike:${bikeId}:bikeType`;
    const cardId = await ctx.db.insert("profilePromptCards", { userId: "owner", sessionKey: "session1", shownAt: now,
      questions: [{ key, field: "bikeType", bikeId, status: "pending" }] });
    ctx.clearWrites();
    await expect(invoke(answerProfilePrompt, ctx, { cardId, key, value: "unicycle", method: "self_report", expectedCurrentValue: "road" })).rejects.toThrow();
    ctx.expectNoWrites();
  });

  it("above 90 percent offers only dated stale values, and confirming the same value refreshes provenance", async () => {
    const old = Date.UTC(2026, 2, 1);
    const ctx = await fixture({ ...completeProfile, ftpMeasuredAt: old });
    const oldId = await ctx.db.insert("profileObservations", { userId: "owner", field: "ftpWatts", value: 250,
      unit: "W", kind: "measured", method: "single_measurement", source: "profile_edit", recordedAt: old, status: "current" });
    const card = await open(ctx);
    expect(card.questions).toHaveLength(1);
    expect(question(card, "ftpWatts")).toMatchObject({ value: 250, stale: true });
    await invoke(answerProfilePrompt, ctx, answerArgs(card, "ftpWatts", 250));
    expect(await ctx.db.get(oldId)).toMatchObject({ status: "superseded" });
    expect((await ctx.db.get(ctx.profileId))?.ftpMeasuredAt).toBe(now);
    expect(ctx.tables.get("profileObservations")?.filter((row) => row.field === "ftpWatts" && row.status === "current")).toEqual([
      expect.objectContaining({ field: "ftpWatts", value: 250, recordedAt: now, kind: "measured" }),
    ]);
    await newSession(ctx, "fresh-session");
    expect((await open(ctx)).questions).toEqual([]);
  });

  it.each([undefined, NOW, Date.UTC(2026, 3, 3, 12)])("does not invent a stale date for fresh/unknown FTP (%s)", async (measuredAt) => {
    const ctx = await fixture({ ...completeProfile, ftpMeasuredAt: measuredAt });
    expect((await open(ctx)).questions).toEqual([]);
    expect(ctx.tables.get("profileObservations")?.map((entry) => entry.field)).toEqual(measuredFields);
  });

  it("requires saddle measure point and stores owned bike provenance without altering other setup values", async () => {
    const ctx = await fixture();
    const bikeId = await ctx.db.insert("bikes", { userId: "owner", name: "Owner bike", bikeType: "road",
      currentSetup: { crankLengthMm: 172.5 }, createdAt: now, updatedAt: now });
    const key = `bike:${bikeId}:currentSetup.saddleHeightMm`;
    const cardId = await ctx.db.insert("profilePromptCards", { userId: "owner", sessionKey: "session1", shownAt: now,
      questions: [{ key, field: "currentSetup.saddleHeightMm", bikeId, status: "pending" }] });
    const args = { cardId, key, value: 740, method: "single_measurement", expectedCurrentValue: null };
    ctx.clearWrites();
    await expect(invoke(answerProfilePrompt, ctx, args)).rejects.toThrow("Saddle measurement point required");
    ctx.expectNoWrites();
    await invoke(answerProfilePrompt, ctx, { ...args, measurePoint: "bb_center_to_saddle_top" });
    expect(await ctx.db.get(bikeId)).toMatchObject({ currentSetup: { crankLengthMm: 172.5, saddleHeightMm: 740,
      saddleHeightMeasurement: { measurePoint: "bb_center_to_saddle_top", measuredAt: now, source: "profile_edit" } } });
    expect(ctx.tables.get("profileObservations")?.filter((entry) => entry.bikeId === bikeId)).toEqual([expect.objectContaining({
      userId: "owner", bikeId, field: "currentSetup.saddleHeightMm", value: 740,
      kind: "measured", method: "bb_center_to_saddle_top", recordedAt: now, source: "profile_edit",
    })]);
  });

  it("clears stale saddle measurement metadata when the explicit answer is estimated", async () => {
    const ctx = await fixture();
    const bikeId = await ctx.db.insert("bikes", { userId: "owner", name: "Owner bike", bikeType: "road",
      currentSetup: { crankLengthMm: 172.5, saddleHeightMm: 730,
        saddleHeightMeasurement: { measurePoint: "bb_center_to_saddle_top", measuredAt: now - DAY, source: "profile_edit" } },
      createdAt: now, updatedAt: now });
    const oldId = await ctx.db.insert("profileObservations", { userId: "owner", bikeId,
      field: "currentSetup.saddleHeightMm", value: 730, kind: "estimated", method: "self_assessment", unit: "mm",
      source: "profile_edit", recordedAt: now - DAY, status: "current" });
    const key = `bike:${bikeId}:currentSetup.saddleHeightMm`;
    const cardId = await ctx.db.insert("profilePromptCards", { userId: "owner", sessionKey: "session1", shownAt: now,
      questions: [{ key, field: "currentSetup.saddleHeightMm", bikeId, status: "pending" }] });
    await invoke(answerProfilePrompt, ctx, { cardId, key, value: 740, method: "self_assessment",
      expectedCurrentValue: 730, measurePoint: "bb_center_to_saddle_top" });
    const setup = (await ctx.db.get(bikeId))?.currentSetup as Record<string, unknown>;
    expect(setup).toMatchObject({ saddleHeightMm: 740, crankLengthMm: 172.5 });
    expect(setup.saddleHeightMeasurement).toBeUndefined();
    expect(await ctx.db.get(oldId)).toMatchObject({ status: "superseded" });
    expect(ctx.tables.get("profileObservations")?.filter((entry) => entry.bikeId === bikeId && entry.status === "current"))
      .toEqual([expect.objectContaining({ value: 740, kind: "estimated", recordedAt: now })]);
  });

  it.each(["rider", "crank"])("rejects a saddle measure point on the wrong %s field", async (scope) => {
    const ctx = await fixture();
    let args: Record<string, unknown>;
    if (scope === "rider") args = answerArgs(await open(ctx), "armLengthCm", 64);
    else {
      const bikeId = await ctx.db.insert("bikes", { userId: "owner", name: "Owner bike", bikeType: "road" });
      const key = `bike:${bikeId}:currentSetup.crankLengthMm`;
      const cardId = await ctx.db.insert("profilePromptCards", { userId: "owner", sessionKey: "session1", shownAt: now,
        questions: [{ key, field: "currentSetup.crankLengthMm", bikeId, status: "pending" }] });
      args = { cardId, key, value: 170, method: "single_measurement", expectedCurrentValue: null };
    }
    ctx.clearWrites();
    await expect(invoke(answerProfilePrompt, ctx, { ...args, measurePoint: "bb_center_to_saddle_top" })).rejects.toThrow();
    ctx.expectNoWrites();
  });

  it.each(["other", null])("rejects a foreign/deleted bike (%s) even when referenced by an owned card", async (owner) => {
    const ctx = await fixture();
    const bikeId = await ctx.db.insert("bikes", { userId: owner, name: "Foreign bike", bikeType: "road", createdAt: now });
    if (owner === null) await ctx.db.delete(bikeId);
    const key = `bike:${bikeId}:currentSetup.crankLengthMm`;
    const cardId = await ctx.db.insert("profilePromptCards", { userId: "owner", sessionKey: "session1", shownAt: now,
      questions: [{ key, field: "currentSetup.crankLengthMm", bikeId, status: "pending" }] });
    ctx.clearWrites();
    await expect(invoke(answerProfilePrompt, ctx, { cardId, key, value: 170,
      method: "single_measurement", expectedCurrentValue: null })).rejects.toThrow();
    ctx.expectNoWrites();
  });
});

describe("prompt interest privacy", () => {
  it("records only an allowed calculator and timestamp, updating one activity row", async () => {
    const ctx = await fixture();
    await invoke(recordPromptInterest, ctx, { calculator: "gearing" });
    now += 10;
    await invoke(recordPromptInterest, ctx, { calculator: "gearing" });
    expect(ctx.tables.get("profilePromptActivity")).toEqual([{
      _id: expect.any(String), _creationTime: expect.any(Number), userId: "owner", calculator: "gearing", viewedAt: now,
    }]);
    ctx.clearWrites();
    await expect(invoke(recordPromptInterest, ctx, { calculator: "ftpWatts=245" })).rejects.toThrow("Invalid calculator");
    ctx.expectNoWrites();
    auth.userId = null;
    await expect(invoke(recordPromptInterest, ctx, { calculator: "gearing" })).rejects.toThrow("Not authenticated");
    ctx.expectNoWrites();
  });
});

describe("demographic prompt answers", () => {
  async function demographicsFixture(overrides: Record<string, unknown> = {}) {
    const ctx = await fixture({ flexibilityScore: undefined, age: 45, ...overrides });
    for (const field of ["armLengthCm", "ftpWatts", "flexibilityScore"]) {
      await ctx.db.insert("profilePrompts", { userId: "owner", key: `rider:${field}`, skipCount: 3, profileOnly: true });
    }
    ctx.clearWrites();
    return ctx;
  }

  it("reserves two zero-gain demographic slots without inferring birth date from age or saving defaults", async () => {
    const ctx = await demographicsFixture();
    const before = await ctx.db.get(ctx.profileId);
    const card = await open(ctx);
    expect(card.questions.map((entry) => entry.field)).toEqual(["birthDate", "sex"]);
    for (const entry of card.questions) expect(entry).toMatchObject({ value: null, kind: "declared", gain: 0, completenessGain: 0 });
    expect(await ctx.db.get(ctx.profileId)).toEqual(before);
    expect(ctx.tables.get("profileObservations")?.map((entry) => entry.field)).toEqual(initialMeasuredFields);
    ctx.clearWrites();
    expect(await open(ctx)).toEqual(card);
    ctx.expectNoWrites();
  });

  it("saves both explicit demographic answers without score, age, FTP or flexibility changes", async () => {
    const ctx = await demographicsFixture();
    const before = await ctx.db.get(ctx.profileId) as Doc<"profiles"> | null;
    const card = await open(ctx);
    await invoke(answerProfilePrompt, ctx, answerArgs(card, "birthDate", "1990-04-12", "self_report"));
    await invoke(answerProfilePrompt, ctx, answerArgs(card, "sex", "female", "self_report"));
    const after = await ctx.db.get(ctx.profileId) as Doc<"profiles"> | null;
    expect(after).toMatchObject({ sex: "female", birthDate: "1990-04-12", age: 45 });
    expect(after?.ftpWatts).toBeUndefined();
    expect(after?.flexibilityScore).toBeUndefined();
    expect(scoreRiderProfile({ profile: after }, now)).toEqual(scoreRiderProfile({ profile: before }, now));
    const observations = ctx.tables.get("profileObservations")!.filter((row) => row.field === "sex" || row.field === "birthDate");
    expect(observations).toHaveLength(2);
    for (const row of observations) expect(row).toMatchObject({ kind: "declared", method: "self_report", source: "profile_edit", recordedAt: now });
    expect((await read(ctx)).questions.every((entry) => entry.status === "answered")).toBe(true);
  });

  it("hides an FTP-only birth-date slot after non-disclosure without replacing it", async () => {
    const ctx = await demographicsFixture({ flexibilityScore: "good" });
    const card = await open(ctx);
    const birthArgs = answerArgs(card, "birthDate", "1990-04-12", "self_report");
    await invoke(answerProfilePrompt, ctx, answerArgs(card, "sex", "prefer_not_to_say", "self_report"));
    ctx.clearWrites();
    const view = await read(ctx);
    expect(view.questions.map((entry) => entry.field)).toEqual(["sex"]);
    expect(view.cardId).toBe(card.cardId);
    await expect(invoke(answerProfilePrompt, ctx, birthArgs)).rejects.toThrow("Prompt is no longer applicable");
    ctx.expectNoWrites();
    const profile = await ctx.db.get(ctx.profileId);
    expect(profile).toMatchObject({ sex: "prefer_not_to_say", age: 45, flexibilityScore: "good" });
    expect(profile).not.toHaveProperty("birthDate");
    expect(profile).not.toHaveProperty("ftpWatts");
  });

  it("still offers birth date for missing flexibility after sex was declined", async () => {
    const ctx = await demographicsFixture({ sex: "prefer_not_to_say" });
    const card = await open(ctx);
    expect(card.questions.map((entry) => entry.field)).toEqual(["birthDate"]);
    expect(question(card, "birthDate").value).toBeNull();
  });

  it("does not request demographic inputs when FTP and flexibility are already supplied", async () => {
    const ctx = await fixture({ ftpWatts: 250, flexibilityScore: "good", heightCm: undefined });
    const card = await open(ctx);
    expect(card.questions.some((entry) => entry.field === "sex" || entry.field === "birthDate")).toBe(false);
    expect(await ctx.db.get(ctx.profileId)).toMatchObject({ ftpWatts: 250, flexibilityScore: "good" });
  });

  it.each([
    ["sex", "unknown"], ["sex", "Female"], ["birthDate", "1991-02-29"], ["birthDate", "2027-01-01"],
    ["birthDate", "2016-10-04"], ["birthDate", "1925-10-03"],
  ])("rejects invalid %s=%s without profile, observation or slot writes", async (field, value) => {
    const ctx = await demographicsFixture();
    const card = await open(ctx);
    ctx.clearWrites();
    await expect(invoke(answerProfilePrompt, ctx, answerArgs(card, field, value, "self_report"))).rejects.toThrow();
    ctx.expectNoWrites();
    expect(question(await read(ctx), field).status).toBe("pending");
  });

  it.each(["sex", "birthDate"])("rejects a measured method for the declared %s field", async (field) => {
    const ctx = await demographicsFixture();
    const card = await open(ctx);
    ctx.clearWrites();
    await expect(invoke(answerProfilePrompt, ctx, answerArgs(card, field,
      field === "sex" ? "female" : "1990-04-12", "single_measurement"))).rejects.toThrow("Invalid prompt method");
    ctx.expectNoWrites();
  });

  it.each([["sex", "female", "male"], ["birthDate", "1990-04-12", "1980-01-01"]])(
    "returns a concurrent %s conflict with zero writes", async (field, value, currentValue) => {
      const ctx = await demographicsFixture();
      const card = await open(ctx);
      const args = answerArgs(card, field, value, "self_report");
      await ctx.db.patch(ctx.profileId, { [field]: currentValue });
      ctx.clearWrites();
      expect(await invoke(answerProfilePrompt, ctx, args)).toEqual({ status: "conflict", field, currentValue, incomingValue: value });
      ctx.expectNoWrites();
    },
  );
});
