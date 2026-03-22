import { action, internalAction } from "../_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";
import { internal } from "../_generated/api";

// Required env vars (set in Convex dashboard):
// STRAVA_CLIENT_ID
// STRAVA_CLIENT_SECRET
// SITE_URL

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`Missing environment variable: ${name}`);
  return value;
}

function generateState(): string {
  const bytes = new Uint8Array(16);
  crypto.getRandomValues(bytes);
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

// Called by the frontend to start the Strava OAuth flow.
// Returns the Strava authorization URL.
export const initiateStravaConnect = action({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const clientId = requireEnv("STRAVA_CLIENT_ID");
    const convexSiteUrl = requireEnv("CONVEX_SITE_URL");
    const redirectUri = `${convexSiteUrl}/strava/callback`;

    const state = generateState();
    await ctx.runMutation(internal.integrations.mutations.upsertStravaIntegration, {
      userId,
      fields: {
        accessStatus: "pending",
        oauthState: state,
        oauthStateExpiresAt: Date.now() + 15 * 60 * 1000,
      },
    });

    const params = new URLSearchParams({
      client_id: clientId,
      redirect_uri: redirectUri,
      response_type: "code",
      approval_prompt: "auto",
      scope: "read,activity:read",
      state,
    });

    return `https://www.strava.com/oauth/authorize?${params.toString()}`;
  },
});

// Called by the frontend to revoke Strava access.
// Calls Strava's deauthorize endpoint, then clears tokens locally.
export const disconnectStravaAction = action({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    // Get the current integration to retrieve the access token
    const integration = await ctx.runQuery(
      internal.integrations.queries.getStravaIntegrationForUser,
      { userId }
    );

    if (integration?.accessToken) {
      // Revoke at Strava's side (fire-and-forget; don't block disconnect on failure)
      try {
        await fetch("https://www.strava.com/oauth/deauthorize", {
          method: "POST",
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
          body: new URLSearchParams({ access_token: integration.accessToken }),
        });
      } catch {
        // Strava deauthorize failed — continue with local revoke anyway
      }
    }

    await ctx.runMutation(internal.integrations.mutations.clearStravaConnection, {
      userId,
    });
  },
});

// Internal: import recent rides from Strava (Phase 2 — placeholder)
export const importRecentRides = internalAction({
  args: {},
  handler: async () => {
    throw new Error("Strava ride import is not yet implemented (Phase 2).");
  },
});
