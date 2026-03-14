import { mutation } from "../_generated/server";
import { requireUserId } from "../lib/authz";

/**
 * Permanently delete the authenticated user's account and all associated data.
 * Cascade-deletes: profiles, bikes, fitSessions, questionnaireResponses,
 * recommendations, emailReports, and the user record itself.
 */
export const deleteAccount = mutation({
  args: {},
  handler: async (ctx) => {
    const userId = await requireUserId(ctx);

    // Delete questionnaire responses (via fitSessions)
    const sessions = await ctx.db
      .query("fitSessions")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();

    for (const session of sessions) {
      const responses = await ctx.db
        .query("questionnaireResponses")
        .withIndex("by_session", (q) => q.eq("sessionId", session._id))
        .collect();
      for (const response of responses) {
        await ctx.db.delete(response._id);
      }
    }

    // Delete recommendations
    const recommendations = await ctx.db
      .query("recommendations")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();
    for (const rec of recommendations) {
      await ctx.db.delete(rec._id);
    }

    // Delete email reports
    const emailReports = await ctx.db
      .query("emailReports")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();
    for (const report of emailReports) {
      await ctx.db.delete(report._id);
    }

    // Delete fit sessions
    for (const session of sessions) {
      await ctx.db.delete(session._id);
    }

    // Delete profile
    const profile = await ctx.db
      .query("profiles")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .unique();
    if (profile) {
      await ctx.db.delete(profile._id);
    }

    // Delete bikes
    const bikes = await ctx.db
      .query("bikes")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();
    for (const bike of bikes) {
      await ctx.db.delete(bike._id);
    }

    // Delete the user record
    await ctx.db.delete(userId);
  },
});
