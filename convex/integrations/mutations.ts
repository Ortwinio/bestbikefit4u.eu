import { mutation } from "../_generated/server";
import { requireUserId } from "../lib/authz";

export const disconnectStrava = mutation({
  args: {},
  handler: async (ctx) => {
    const userId = await requireUserId(ctx);
    const existing = await ctx.db
      .query("integrations")
      .withIndex("by_user_and_provider", (q) =>
        q.eq("userId", userId).eq("provider", "strava")
      )
      .unique();

    if (!existing) {
      return null;
    }

    await ctx.db.patch(existing._id, {
      accessStatus: "revoked",
      accessToken: undefined,
      refreshToken: undefined,
      tokenExpiresAt: undefined,
      oauthState: undefined,
      oauthStateExpiresAt: undefined,
    });

    return existing._id;
  },
});
