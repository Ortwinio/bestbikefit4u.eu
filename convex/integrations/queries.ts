import { internalQuery, query } from "../_generated/server";
import { v } from "convex/values";
import { requireUserId } from "../lib/authz";

export const getStravaStatus = query({
  args: {},
  handler: async (ctx) => {
    const userId = await requireUserId(ctx);
    const integration = await ctx.db
      .query("integrations")
      .withIndex("by_user_and_provider", (q) =>
        q.eq("userId", userId).eq("provider", "strava")
      )
      .unique();

    if (!integration) return null;

    // Never expose tokens to the client
    const {
      accessToken: _accessToken,
      refreshToken: _refreshToken,
      oauthState: _oauthState,
      oauthStateExpiresAt: _oauthStateExpiresAt,
      ...safe
    } = integration;

    return safe;
  },
});

// Internal: find integration by oauthState for callback validation
export const getStravaIntegrationByState = internalQuery({
  args: { oauthState: v.string() },
  handler: async (ctx, { oauthState }) => {
    return await ctx.db
      .query("integrations")
      .withIndex("by_user_and_provider")
      .filter((q) =>
        q.and(
          q.eq(q.field("provider"), "strava"),
          q.eq(q.field("oauthState"), oauthState)
        )
      )
      .unique();
  },
});

// Internal: get integration for a specific user (used by actions)
export const getStravaIntegrationForUser = internalQuery({
  args: { userId: v.id("users") },
  handler: async (ctx, { userId }) => {
    return await ctx.db
      .query("integrations")
      .withIndex("by_user_and_provider", (q) =>
        q.eq("userId", userId).eq("provider", "strava")
      )
      .unique();
  },
});
