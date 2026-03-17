import { query } from "../_generated/server";
import { requireUserId } from "../lib/authz";

export const getStravaStatus = query({
  args: {},
  handler: async (ctx) => {
    const userId = await requireUserId(ctx);
    return await ctx.db
      .query("integrations")
      .withIndex("by_user_and_provider", (q) =>
        q.eq("userId", userId).eq("provider", "strava")
      )
      .unique();
  },
});
