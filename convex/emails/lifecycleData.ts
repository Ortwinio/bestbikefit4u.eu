import { internalMutation, internalQuery } from "../_generated/server";
import { v } from "convex/values";

// ─── Queries ───────────────────────────────────────────────────────

export const getUsersNeedingFitReminder = internalQuery({
  args: {},
  handler: async (ctx) => {
    const cutoff = Date.now() - 48 * 60 * 60 * 1000;
    const users = await ctx.db
      .query("users")
      .filter((q) =>
        q.and(
          q.neq(q.field("isAnonymous"), true),
          q.lt(q.field("createdAt"), cutoff)
        )
      )
      .take(200);

    const result = [];
    for (const user of users) {
      if (!user.email) continue;
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
      if (!user.email) continue;
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
      if (!user.email) continue;
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
  },
  handler: async (ctx, { userId, emailType, sessionId }) => {
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
      .first();
    return entry !== null;
  },
});

// ─── Mutations ─────────────────────────────────────────────────────

export const logEmailSent = internalMutation({
  args: {
    userId: v.id("users"),
    emailType: v.string(),
    sessionId: v.optional(v.id("fitSessions")),
  },
  handler: async (ctx, args) => {
    await ctx.db.insert("lifecycleEmailLog", {
      userId: args.userId,
      emailType: args.emailType,
      sentAt: Date.now(),
      sessionId: args.sessionId,
    });
  },
});
