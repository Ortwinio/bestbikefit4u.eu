import { internalMutation, internalQuery } from "../_generated/server";
import { v } from "convex/values";

// ─── Queries ───────────────────────────────────────────────────────

export const getUsersNeedingFitReminder = internalQuery({
  args: {},
  handler: async (ctx) => {
    const now = Date.now();
    const cutoff = now - 72 * 60 * 60 * 1000;
    const windowStart = now - 96 * 60 * 60 * 1000;
    const users = await ctx.db
      .query("users")
      .filter((q) =>
        q.and(
          q.neq(q.field("isAnonymous"), true),
          q.gt(q.field("createdAt"), windowStart),
          q.lte(q.field("createdAt"), cutoff)
        )
      )
      .take(200);

    const result = [];
    for (const user of users) {
      if (!user.email || user.emailPreferences?.service === false) continue;
      const session = await ctx.db
        .query("fitSessions")
        .withIndex("by_user", (q) => q.eq("userId", user._id))
        .first();
      if (session) continue;
      const alreadySent = await ctx.db
        .query("lifecycleEmailLog")
        .withIndex("by_user_type", (q) =>
          q.eq("userId", user._id).eq("emailType", "fit_reminder")
        )
        .first();
      if (alreadySent) continue;
      result.push(user);
    }
    return result;
  },
});

export const getUsersNeedingUpgradeNudge = internalQuery({
  args: {},
  handler: async (ctx) => {
    const cutoff = Date.now() - 72 * 60 * 60 * 1000;
    const users = await ctx.db
      .query("users")
      .filter((q) =>
        q.and(
          q.neq(q.field("isAnonymous"), true),
          q.or(q.eq(q.field("tier"), "free"), q.eq(q.field("tier"), undefined))
        )
      )
      .take(500);

    const result = [];
    for (const user of users) {
      if (!user.email || user.emailPreferences?.marketing === false) continue;
      const alreadySent = await ctx.db
        .query("lifecycleEmailLog")
        .withIndex("by_user_type", (q) =>
          q.eq("userId", user._id).eq("emailType", "upgrade_nudge")
        )
        .first();
      if (alreadySent) continue;
      const recommendation = await ctx.db
        .query("recommendations")
        .withIndex("by_user", (q) => q.eq("userId", user._id))
        .filter((q) => q.lt(q.field("createdAt"), cutoff))
        .first();
      if (!recommendation) continue;
      result.push({ user, recommendation });
    }
    return result;
  },
});

export const getUsersNeedingWinback = internalQuery({
  args: {},
  handler: async (ctx) => {
    const cutoff = Date.now() - 21 * 24 * 60 * 60 * 1000;
    const users = await ctx.db
      .query("users")
      .filter((q) => q.neq(q.field("isAnonymous"), true))
      .take(500);

    const result = [];
    for (const user of users) {
      if (!user.email || user.emailPreferences?.marketing === false) continue;
      const recommendation = await ctx.db
        .query("recommendations")
        .withIndex("by_user", (q) => q.eq("userId", user._id))
        .first();
      if (!recommendation) continue;
      const lastLogin = user.lastLoginAt ?? user.createdAt ?? 0;
      if (lastLogin > cutoff) continue;
      const recentWinback = await ctx.db
        .query("lifecycleEmailLog")
        .withIndex("by_user_type", (q) =>
          q.eq("userId", user._id).eq("emailType", "winback")
        )
        .order("desc")
        .first();
      if (
        recentWinback &&
        recentWinback.sentAt > Date.now() - 60 * 24 * 60 * 60 * 1000
      )
        continue;
      result.push(user);
    }
    return result;
  },
});

export const checkEmailSent = internalQuery({
  args: {
    userId: v.id("users"),
    emailType: v.string(),
    sessionId: v.optional(v.id("fitSessions")),
    since: v.optional(v.number()),
  },
  handler: async (ctx, { userId, emailType, sessionId, since }) => {
    if (sessionId) {
      const entry = await ctx.db
        .query("lifecycleEmailLog")
        .withIndex("by_user_type_session", (q) =>
          q
            .eq("userId", userId)
            .eq("emailType", emailType)
            .eq("sessionId", sessionId)
        )
        .first();
      return entry !== null;
    }
    const entry = await ctx.db
      .query("lifecycleEmailLog")
      .withIndex("by_user_type", (q) =>
        q.eq("userId", userId).eq("emailType", emailType)
      )
      .order("desc")
      .first();
    return entry !== null && (since === undefined || entry.sentAt > since);
  },
});

// ─── Mutations ─────────────────────────────────────────────────────

export const logEmailSent = internalMutation({
  args: {
    userId: v.id("users"),
    emailType: v.string(),
    locale: v.union(v.literal("nl"), v.literal("en")),
    sessionId: v.optional(v.id("fitSessions")),
  },
  handler: async (ctx, args) => {
    if (args.sessionId) {
      const session = await ctx.db.get(args.sessionId);
      if (!session || session.userId !== args.userId) return;
    }
    await ctx.db.insert("lifecycleEmailLog", {
      userId: args.userId,
      emailType: args.emailType,
      locale: args.locale,
      sentAt: Date.now(),
      sessionId: args.sessionId,
    });
  },
});

export const getUsersNeedingDay1Tips = internalQuery({
  args: {},
  handler: async (ctx) => {
    const now = Date.now();
    const cutoff = now - 24 * 60 * 60 * 1000;
    const windowStart = now - 48 * 60 * 60 * 1000;
    const users = await ctx.db.query("users").filter((query) => query.and(
      query.neq(query.field("isAnonymous"), true),
      query.gt(query.field("createdAt"), windowStart),
      query.lte(query.field("createdAt"), cutoff)
    )).take(200);
    const result = [];
    for (const user of users) {
      if (!user.email || user.emailPreferences?.service === false) continue;
      const sent = await ctx.db.query("lifecycleEmailLog").withIndex("by_user_type", (query) =>
        query.eq("userId", user._id).eq("emailType", "day1_tips")).first();
      if (!sent) result.push(user);
    }
    return result;
  },
});

export const getUserEmailContext = internalQuery({
  args: { userId: v.id("users") },
  handler: async (ctx, { userId }) => {
    const user = await ctx.db.get(userId);
    if (!user) return null;
    const recommendation = await ctx.db.query("recommendations")
      .withIndex("by_user", (query) => query.eq("userId", userId)).order("desc").first();
    const session = await ctx.db.query("fitSessions")
      .withIndex("by_user", (query) => query.eq("userId", userId)).first();
    const bike = recommendation?.bikeId ? await ctx.db.get(recommendation.bikeId) : null;
    return { user, recommendation, hasFit: Boolean(session),
      bikeName: bike?.userId === userId ? bike.name : undefined };
  },
});

export const getSessionBikeName = internalQuery({
  args: { userId: v.id("users"), sessionId: v.id("fitSessions") },
  handler: async (ctx, { userId, sessionId }) => {
    const session = await ctx.db.get(sessionId);
    if (!session || session.userId !== userId || !session.bikeId) return null;
    const bike = await ctx.db.get(session.bikeId);
    return bike?.userId === userId ? bike.name : null;
  },
});
