import { internalMutation, mutation } from "../_generated/server";
import { v } from "convex/values";
import { requireUserId } from "../lib/authz";

// Internal: create or update the integrations record for a user
export const upsertStravaIntegration = internalMutation({
  args: {
    userId: v.id("users"),
    fields: v.object({
      accessStatus: v.union(
        v.literal("not_connected"),
        v.literal("pending"),
        v.literal("active"),
        v.literal("revoked"),
        v.literal("error")
      ),
      oauthState: v.optional(v.string()),
      oauthStateExpiresAt: v.optional(v.number()),
      providerUserId: v.optional(v.string()),
      accessToken: v.optional(v.string()),
      refreshToken: v.optional(v.string()),
      tokenExpiresAt: v.optional(v.number()),
      athleteName: v.optional(v.string()),
      athleteAvatarUrl: v.optional(v.string()),
      athleteStravaWeight: v.optional(v.number()),
      lastSyncAt: v.optional(v.number()),
      ridingProfileJson: v.optional(v.string()),
      syncErrorMessage: v.optional(v.string()),
    }),
  },
  handler: async (ctx, { userId, fields }) => {
    const existing = await ctx.db
      .query("integrations")
      .withIndex("by_user_and_provider", (q) =>
        q.eq("userId", userId).eq("provider", "strava")
      )
      .unique();

    if (existing) {
      await ctx.db.patch(existing._id, fields);
      return existing._id;
    } else {
      return await ctx.db.insert("integrations", {
        userId,
        provider: "strava",
        ...fields,
      });
    }
  },
});

// Internal: update the user's profile image with the Strava avatar
export const setUserProfileImageFromStrava = internalMutation({
  args: {
    userId: v.id("users"),
    imageUrl: v.string(),
  },
  handler: async (ctx, { userId, imageUrl }) => {
    const user = await ctx.db.get(userId);
    if (!user) return;
    // Only set if the user has no existing profile image, or their image source is strava already
    if (!user.profile_image_url || user.profileImageSource === "strava") {
      await ctx.db.patch(userId, {
        profile_image_url: imageUrl,
        profileImageSource: "strava",
      });
    }
  },
});

// Internal: clear Strava tokens and riding data (called by disconnectStravaAction)
export const clearStravaConnection = internalMutation({
  args: { userId: v.id("users") },
  handler: async (ctx, { userId }) => {
    const existing = await ctx.db
      .query("integrations")
      .withIndex("by_user_and_provider", (q) =>
        q.eq("userId", userId).eq("provider", "strava")
      )
      .unique();

    if (!existing) return null;

    await ctx.db.patch(existing._id, {
      accessStatus: "revoked",
      accessToken: undefined,
      refreshToken: undefined,
      tokenExpiresAt: undefined,
      oauthState: undefined,
      oauthStateExpiresAt: undefined,
      ridingProfileJson: undefined,
      athleteStravaWeight: undefined,
      syncErrorMessage: undefined,
    });

    return existing._id;
  },
});

// Public: kept for backwards compatibility — client calls disconnectStravaAction instead
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
      ridingProfileJson: undefined,
      athleteStravaWeight: undefined,
      syncErrorMessage: undefined,
    });

    return existing._id;
  },
});
