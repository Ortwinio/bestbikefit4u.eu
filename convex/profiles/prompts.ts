import { getAuthSessionId } from "@convex-dev/auth/server";
import { v } from "convex/values";
import { makeFunctionReference } from "convex/server";
import { mutation, query, type MutationCtx, type QueryCtx } from "../_generated/server";
import type { Doc, Id } from "../_generated/dataModel";
import { requireUserId } from "../lib/authz";
import { readProfileProvenance, recordProfileObservations } from "./provenance";
import { planLegacyObservations } from "../../shared/profileObservationMigration";
import { equalProfileObservationValues } from "../../shared/profileObservationFields";
import {
  describeProfilePrompt, eligibleProfilePrompts, planProfilePrompts, validatePromptValue, type ProfilePromptInput,
} from "../../shared/profilePromptPolicy";

const DAY = 86_400_000;
const calculators = ["bike-fit", "saddle-height", "frame-size", "crank-length", "saddle-width",
  "tire-pressure", "gearing", "power-speed", "climb-planner", "ftp-wkg", "fuel-hydration"];
type Context = MutationCtx | QueryCtx;
const updateBike = makeFunctionReference<"mutation", {
  bikeId: Id<"bikes">; bikeType: Doc<"bikes">["bikeType"]; bikeTypeSource: "user"; needsTypeConfirmation: boolean;
}, unknown>("bikes/mutations:update");

async function sessionScope(ctx: Context) {
  const userId = await requireUserId(ctx);
  const user = await ctx.db.get(userId);
  if (!user) throw new Error("User not found");
  const sessionId = await getAuthSessionId(ctx);
  return { userId, sessionKey: sessionId ?? `local:${user.lastLoginAt ?? user._creationTime}` };
}

async function inputFor(ctx: Context, userId: Id<"users">): Promise<ProfilePromptInput> {
  const now = Date.now();
  const { profile, observations } = await readProfileProvenance(ctx, userId);
  const bikes = await ctx.db.query("bikes").withIndex("by_user", range => range.eq("userId", userId)).take(50);
  const persisted = await ctx.db.query("profileObservations")
    .withIndex("by_user_field", range => range.eq("userId", userId))
    .filter(filter => filter.eq(filter.field("status"), "current")).collect();
  const bikeObservations = bikes.flatMap(bike => {
    const current = persisted.filter(observation => observation.bikeId === bike._id);
    const legacy = planLegacyObservations("bikes", bike).observations.filter(observation =>
      !current.some(stored => stored.field === observation.field
        && equalProfileObservationValues(stored.value, observation.value)));
    return [...current, ...legacy.map(observation => ({ ...observation,
      source: "legacy_migration", status: "current" as const, bikeId: bike._id }))];
  });
  const states = await ctx.db.query("calculatorStates")
    .withIndex("by_user_updated", range => range.eq("userId", userId)).order("desc").take(100);
  const viewed = await ctx.db.query("profilePromptActivity")
    .withIndex("by_user_calculator", range => range.eq("userId", userId)).collect();
  const history = await ctx.db.query("profilePrompts")
    .withIndex("by_user_key", range => range.eq("userId", userId)).collect();
  return { profile, observations, bikes, bikeObservations, history, now,
    recentCalculators: [...new Set([
      ...states.filter(state => state.updatedAt > now - 30 * DAY).map(state => state.calculator),
      ...viewed.filter(activity => activity.viewedAt > now - 30 * DAY).map(activity => activity.calculator),
    ])] };
}

async function cardsFor(ctx: Context, userId: Id<"users">, sessionKey: string) {
  const current = await ctx.db.query("profilePromptCards")
    .withIndex("by_user_session", range => range.eq("userId", userId).eq("sessionKey", sessionKey)).first();
  const latest = await ctx.db.query("profilePromptCards")
    .withIndex("by_user_shown", range => range.eq("userId", userId)).order("desc").first();
  return { current, latest };
}

function hiddenUntil(current: Doc<"profilePromptCards"> | null, latest: Doc<"profilePromptCards"> | null, now: number) {
  const dismissed = Math.max(current?.hiddenUntil ?? 0, latest?.hiddenUntil ?? 0);
  if (dismissed > now) return dismissed;
  if (!current && latest && latest.shownAt + DAY > now) return latest.shownAt + DAY;
  return null;
}

async function promptView(ctx: Context, userId: Id<"users">, sessionKey: string) {
  const { current, latest } = await cardsFor(ctx, userId, sessionKey);
  const hidden = hiddenUntil(current, latest, Date.now());
  if (hidden || !current) return { cardId: current?._id ?? null, shownAt: current?.shownAt ?? null,
    hiddenUntil: hidden, questions: [] };
  const input = await inputFor(ctx, userId);
  const eligible = new Set(eligibleProfilePrompts(input).map(question => question.key));
  const questions = current.questions.flatMap(slot => {
    if (slot.status === "pending" && !eligible.has(slot.key)) return [];
    const question = describeProfilePrompt(input, slot);
    return question ? [{ ...question, status: slot.status }] : [];
  });
  return { cardId: current._id, shownAt: current.shownAt, hiddenUntil: null, questions };
}

export const nextPrompts = query({
  args: {},
  handler: async ctx => {
    const { userId, sessionKey } = await sessionScope(ctx);
    return await promptView(ctx, userId, sessionKey);
  },
});

export const openPromptCard = mutation({
  args: {},
  handler: async ctx => {
    const { userId, sessionKey } = await sessionScope(ctx);
    const { current, latest } = await cardsFor(ctx, userId, sessionKey);
    if (!current && !hiddenUntil(current, latest, Date.now())) {
      const input = await inputFor(ctx, userId);
      const candidates = planProfilePrompts(input);
      if (candidates.length) await ctx.db.insert("profilePromptCards", {
        userId, sessionKey, shownAt: input.now, questions: candidates.map(candidate => ({
          key: candidate.key, field: candidate.field,
          ...(candidate.bikeId ? { bikeId: candidate.bikeId as Id<"bikes"> } : {}), status: "pending" as const,
        })),
      });
    }
    return await promptView(ctx, userId, sessionKey);
  },
});

async function ownedCard(ctx: MutationCtx, cardId: Id<"profilePromptCards">, allowHidden = false) {
  const { userId, sessionKey } = await sessionScope(ctx);
  const card = await ctx.db.get(cardId);
  if (!card || card.userId !== userId || card.sessionKey !== sessionKey) throw new Error("Prompt card not found");
  const { latest } = await cardsFor(ctx, userId, sessionKey);
  if (!allowHidden && hiddenUntil(card, latest, Date.now())) throw new Error("Prompt card is hidden");
  return { userId, card };
}

export const dismissPromptCard = mutation({
  args: { cardId: v.id("profilePromptCards") },
  handler: async (ctx, args) => {
    const { card } = await ownedCard(ctx, args.cardId, true);
    if ((card.hiddenUntil ?? 0) > Date.now()) return null;
    await ctx.db.patch(card._id, { hiddenUntil: Date.now() + 7 * DAY });
    return null;
  },
});

export const skipProfilePrompt = mutation({
  args: { cardId: v.id("profilePromptCards"), key: v.string() },
  handler: async (ctx, args) => {
    const { userId, card } = await ownedCard(ctx, args.cardId);
    const slot = card.questions.find(question => question.key === args.key);
    if (!slot) throw new Error("Prompt not found");
    if (slot.status !== "pending") return null;
    const previous = await ctx.db.query("profilePrompts")
      .withIndex("by_user_key", range => range.eq("userId", userId).eq("key", args.key)).unique();
    const skipCount = (previous?.skipCount ?? 0) + 1;
    const data = { skipCount, skippedUntil: Date.now() + 14 * DAY, profileOnly: skipCount >= 3 };
    if (previous) await ctx.db.patch(previous._id, data);
    else await ctx.db.insert("profilePrompts", { userId, key: args.key, ...data });
    await ctx.db.patch(card._id, { questions: card.questions.map(question =>
      question.key === args.key ? { ...question, status: "skipped" as const } : question) });
    return null;
  },
});

export const answerProfilePrompt = mutation({
  args: {
    cardId: v.id("profilePromptCards"), key: v.string(), value: v.union(v.number(), v.string()),
    expectedCurrentValue: v.union(v.number(), v.string(), v.null()),
    method: v.union(v.literal("single_measurement"), v.literal("self_assessment"),
      v.literal("self_report"), v.literal("ftp_test")),
    measurePoint: v.optional(v.literal("bb_center_to_saddle_top")),
  },
  handler: async (ctx, args) => {
    const { userId, card } = await ownedCard(ctx, args.cardId);
    const slot = card.questions.find(question => question.key === args.key);
    if (!slot) throw new Error("Prompt not found");
    if (slot.status === "answered") return { status: "saved" as const, field: slot.field };
    if (slot.status !== "pending") throw new Error("Prompt is no longer open");
    const input = await inputFor(ctx, userId);
    const question = describeProfilePrompt(input, slot);
    if (!question) throw new Error("Prompt not found");
    const value = validatePromptValue(slot.field, args.value, Boolean(slot.bikeId));
    if (args.measurePoint && (!slot.bikeId || slot.field !== "currentSetup.saddleHeightMm")) {
      throw new Error("Invalid measurement point");
    }
    if (!equalProfileObservationValues(question.value, args.expectedCurrentValue)) {
      return { status: "conflict" as const, field: slot.field, currentValue: question.value, incomingValue: value };
    }
    if (!eligibleProfilePrompts(input).some(candidate => candidate.key === slot.key)) {
      throw new Error("Prompt is no longer applicable");
    }
    const kind = args.method === "ftp_test" ? "derived" : args.method === "self_assessment" ? "estimated"
      : args.method === "self_report" ? "declared" : "measured";
    if ((args.method === "ftp_test" && slot.field !== "ftpWatts")
      || (question.kind === "declared" && args.method !== "self_report")
      || (question.kind === "estimated" && args.method !== "self_assessment")
      || (question.kind === "measured" && kind === "declared" && slot.field !== "ftpWatts")) {
      throw new Error("Invalid prompt method");
    }
    const now = Date.now();
    if (slot.bikeId) {
      const bike = await ctx.db.get(slot.bikeId);
      if (!bike || bike.userId !== userId) throw new Error("Bike not found");
      if (slot.field === "currentSetup.saddleHeightMm" && !args.measurePoint) {
        throw new Error("Saddle measurement point required");
      }
      const previous = await ctx.db.query("profileObservations")
        .withIndex("by_user_field_bike_status", range => range.eq("userId", userId).eq("field", slot.field)
          .eq("bikeId", bike._id).eq("status", "current")).collect();
      for (const observation of previous) await ctx.db.patch(observation._id, { status: "superseded" });
      await ctx.db.insert("profileObservations", { userId, bikeId: bike._id, field: slot.field, value,
        unit: question.unit, kind, method: args.measurePoint ?? args.method, source: "profile_edit",
        recordedAt: now, status: "current" });
      if (slot.field === "bikeType") {
        await ctx.runMutation(updateBike, { bikeId: bike._id, bikeType: value as Doc<"bikes">["bikeType"],
          bikeTypeSource: "user", needsTypeConfirmation: false });
      } else {
        const setting = slot.field.split(".")[1];
        await ctx.db.patch(bike._id, { currentSetup: { ...bike.currentSetup, [setting]: value,
          ...(slot.field === "currentSetup.saddleHeightMm" ? { saddleHeightMeasurement:
            args.measurePoint && kind === "measured" ? { measurePoint: args.measurePoint,
              measuredAt: now, source: "profile_edit" as const } : undefined } : {}),
        }, updatedAt: now });
      }
    } else {
      const updates = { [slot.field]: value };
      await recordProfileObservations(ctx, userId, updates, input.profile,
        { kinds: { [slot.field]: kind }, method: args.method, confirm: true });
      const dates = { updatedAt: now, riderProfileUpdatedAt: now,
        ...(slot.field === "weightKg" ? { weightUpdatedAt: now } : {}),
        ...(slot.field === "ftpWatts" ? { ftpMeasuredAt: now,
          ftpMethod: args.method === "ftp_test" ? "twentyMinute" : args.method } : {}),
      };
      if (input.profile) await ctx.db.patch(input.profile._id, { ...updates, ...dates });
      else await ctx.db.insert("profiles", { userId, ...updates, ...dates });
    }
    await ctx.db.patch(card._id, { questions: card.questions.map(question =>
      question.key === args.key ? { ...question, status: "answered" as const } : question) });
    return { status: "saved" as const, field: slot.field };
  },
});

export const recordPromptInterest = mutation({
  args: { calculator: v.string() },
  handler: async (ctx, args) => {
    const userId = await requireUserId(ctx);
    if (!calculators.includes(args.calculator)) throw new Error("Invalid calculator");
    const previous = await ctx.db.query("profilePromptActivity")
      .withIndex("by_user_calculator", range => range.eq("userId", userId).eq("calculator", args.calculator)).unique();
    if (previous) await ctx.db.patch(previous._id, { viewedAt: Date.now() });
    else await ctx.db.insert("profilePromptActivity", { userId, calculator: args.calculator, viewedAt: Date.now() });
    return null;
  },
});
