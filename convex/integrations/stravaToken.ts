import type { Id } from "../_generated/dataModel";
import type { ActionCtx } from "../_generated/server";
import { internal } from "../_generated/api";

function requireEnv(name: string) {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing environment variable: ${name}`);
  }
  return value;
}

export async function getFreshStravaToken(
  ctx: ActionCtx,
  userId: Id<"users">
): Promise<string> {
  const integration = await ctx.runQuery(
    internal.integrations.queries.getStravaIntegrationForUser,
    { userId }
  );

  if (!integration?.accessToken) {
    throw new Error("Strava not connected");
  }

  const bufferMs = 5 * 60 * 1000;
  if (
    integration.tokenExpiresAt &&
    Date.now() < integration.tokenExpiresAt - bufferMs
  ) {
    return integration.accessToken;
  }

  if (!integration.refreshToken) {
    throw new Error("No Strava refresh token stored");
  }

  const response = await fetch("https://www.strava.com/oauth/token", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      client_id: requireEnv("STRAVA_CLIENT_ID"),
      client_secret: requireEnv("STRAVA_CLIENT_SECRET"),
      grant_type: "refresh_token",
      refresh_token: integration.refreshToken,
    }),
  });

  if (!response.ok) {
    await ctx.runMutation(internal.integrations.mutations.upsertStravaIntegration, {
      userId,
      fields: {
        accessStatus: "error",
        accessToken: undefined,
        refreshToken: undefined,
        tokenExpiresAt: undefined,
        syncErrorMessage: "Failed to refresh Strava token.",
      },
    });
    throw new Error("Failed to refresh Strava token");
  }

  const data = (await response.json()) as {
    access_token: string;
    refresh_token: string;
    expires_at: number;
  };

  await ctx.runMutation(internal.integrations.mutations.upsertStravaIntegration, {
    userId,
    fields: {
      accessStatus: "active",
      accessToken: data.access_token,
      refreshToken: data.refresh_token,
      tokenExpiresAt: data.expires_at * 1000,
      syncErrorMessage: undefined,
    },
  });

  return data.access_token;
}
