import { internalQuery } from "../_generated/server";

export const getUsersNeeding24hNudge = internalQuery({
  args: {},
  handler: async (ctx) => {
    const now = Date.now();
    const minAge = 18 * 60 * 60 * 1000; // 18h ago
    const maxAge = 30 * 60 * 60 * 1000; // 30h ago

    const users = await ctx.db
      .query("users")
      .withIndex("by_tier", (q) => q.eq("tier", "pro"))
      .filter((q) =>
        q.and(
          q.neq(q.field("isAnonymous"), true),
          q.gte(q.field("proSince"), now - maxAge),
          q.lte(q.field("proSince"), now - minAge)
        )
      )
      .take(200);

    const result = [];
    for (const user of users) {
      if (!user.email) continue;
      const alreadySent = await ctx.db
        .query("lifecycleEmailLog")
        .withIndex("by_user_type", (q) =>
          q.eq("userId", user._id).eq("emailType", "email_24h_pro_nudge")
        )
        .first();
      if (alreadySent) continue;
      result.push(user);
    }
    return result;
  },
});
