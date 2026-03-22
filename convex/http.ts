import { httpRouter } from "convex/server";
import { httpAction } from "./_generated/server";
import { internal } from "./_generated/api";
import { auth } from "./auth";
import { fetchStravaAthlete } from "./integrations/strava";

const http = httpRouter();

auth.addHttpRoutes(http);

// Strava OAuth callback
// Redirect URI registered in Strava app: {CONVEX_SITE_URL}/strava/callback
http.route({
  path: "/strava/callback",
  method: "GET",
  handler: httpAction(async (ctx, request) => {
    const siteUrl = process.env.SITE_URL ?? "https://bestbikefit4u.eu";
    const url = new URL(request.url);
    const code = url.searchParams.get("code");
    const state = url.searchParams.get("state");
    const error = url.searchParams.get("error");

    if (error === "access_denied") {
      return Response.redirect(`${siteUrl}/settings?strava=denied`);
    }

    if (!code || !state) {
      return Response.redirect(`${siteUrl}/settings?strava=error&reason=missing_params`);
    }

    // Look up the pending integration by oauthState (CSRF validation)
    const integration = await ctx.runQuery(
      internal.integrations.queries.getStravaIntegrationByState,
      { oauthState: state }
    );

    if (!integration) {
      return Response.redirect(`${siteUrl}/settings?strava=error&reason=invalid_state`);
    }

    // Validate state not expired
    if (
      integration.oauthStateExpiresAt &&
      Date.now() > integration.oauthStateExpiresAt
    ) {
      return Response.redirect(`${siteUrl}/settings?strava=error&reason=state_expired`);
    }

    // Exchange code for tokens
    const clientId = process.env.STRAVA_CLIENT_ID;
    const clientSecret = process.env.STRAVA_CLIENT_SECRET;

    if (!clientId || !clientSecret) {
      return Response.redirect(`${siteUrl}/settings?strava=error&reason=misconfigured`);
    }

    let tokenData: {
      access_token: string;
      refresh_token: string;
      expires_at: number;
      athlete: {
        id: number;
        firstname: string;
        lastname: string;
        profile: string;
        weight?: number;
      };
    };

    try {
      const tokenRes = await fetch("https://www.strava.com/oauth/token", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          client_id: clientId,
          client_secret: clientSecret,
          code,
          grant_type: "authorization_code",
        }),
      });

      if (!tokenRes.ok) {
        return Response.redirect(`${siteUrl}/settings?strava=error&reason=token_exchange`);
      }

      tokenData = (await tokenRes.json()) as typeof tokenData;
    } catch {
      return Response.redirect(`${siteUrl}/settings?strava=error&reason=token_exchange`);
    }

    const { athlete } = tokenData;
    const athleteName = [athlete.firstname, athlete.lastname].filter(Boolean).join(" ");
    const avatarUrl = athlete.profile;

    let cachedGearSummary: string | undefined;
    try {
      const athleteDetail = await fetchStravaAthlete(tokenData.access_token);
      cachedGearSummary = JSON.stringify(athleteDetail.bikes);
    } catch {
      cachedGearSummary = undefined;
    }

    // Persist the connection
    await ctx.runMutation(internal.integrations.mutations.upsertStravaIntegration, {
      userId: integration.userId,
      fields: {
        accessStatus: "active",
        providerUserId: athlete.id.toString(),
        accessToken: tokenData.access_token,
        refreshToken: tokenData.refresh_token,
        tokenExpiresAt: tokenData.expires_at * 1000,
        athleteName,
        athleteAvatarUrl: avatarUrl || undefined,
        athleteStravaWeight: athlete.weight ?? undefined,
        stravaGearSummaryJson: cachedGearSummary,
        oauthState: undefined,
        oauthStateExpiresAt: undefined,
        lastSyncAt: Date.now(),
      },
    });

    // Import profile photo if the user has no existing photo
    if (avatarUrl) {
      await ctx.runMutation(
        internal.integrations.mutations.setUserProfileImageFromStrava,
        { userId: integration.userId, imageUrl: avatarUrl }
      );
    }

    await ctx.scheduler.runAfter(0, internal.integrations.actions.importRecentRides, {
      userId: integration.userId,
      windowDays: 90,
    });

    return Response.redirect(`${siteUrl}/settings?strava=connected`);
  }),
});

export default http;
