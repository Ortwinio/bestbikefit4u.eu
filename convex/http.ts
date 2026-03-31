import { httpRouter } from "convex/server";
import { httpAction } from "./_generated/server";
import { internal } from "./_generated/api";
import { Id } from "./_generated/dataModel";
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

// Stripe webhook — Stripe sends POST to ${CONVEX_SITE_URL}/stripe/webhook
http.route({
  path: "/stripe/webhook",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
    if (!webhookSecret) {
      console.error("[stripe/webhook] STRIPE_WEBHOOK_SECRET not configured");
      return new Response("Server misconfigured", { status: 500 });
    }

    const sig = request.headers.get("stripe-signature");
    if (!sig) {
      return new Response("Missing stripe-signature header", { status: 400 });
    }

    const payload = await request.text();

    // Parse the stripe-signature header: t=timestamp,v1=hash
    const sigParts: Record<string, string[]> = {};
    for (const part of sig.split(",")) {
      const [key, ...rest] = part.split("=");
      if (!sigParts[key]) sigParts[key] = [];
      sigParts[key].push(rest.join("="));
    }

    const timestamp = sigParts["t"]?.[0];
    const signatures = sigParts["v1"] ?? [];

    if (!timestamp || signatures.length === 0) {
      return new Response("Invalid stripe-signature format", { status: 400 });
    }

    // Verify timestamp is within tolerance (5 minutes)
    const tolerance = 300;
    if (Math.abs(Date.now() / 1000 - Number(timestamp)) > tolerance) {
      return new Response("Webhook timestamp out of tolerance", { status: 400 });
    }

    // Compute expected HMAC-SHA256
    const signedPayload = `${timestamp}.${payload}`;
    const secretBytes = new TextEncoder().encode(webhookSecret);
    const payloadBytes = new TextEncoder().encode(signedPayload);
    const cryptoKey = await crypto.subtle.importKey(
      "raw",
      secretBytes,
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["sign"]
    );
    const hmacBuffer = await crypto.subtle.sign("HMAC", cryptoKey, payloadBytes);
    const hmacHex = Array.from(new Uint8Array(hmacBuffer))
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");

    const isValid = signatures.some((s) => s === hmacHex);
    if (!isValid) {
      return new Response("Invalid webhook signature", { status: 400 });
    }

    // Parse event
    let event: { type: string; data: { object: Record<string, unknown> } };
    try {
      event = JSON.parse(payload) as typeof event;
    } catch {
      return new Response("Invalid JSON", { status: 400 });
    }

    if (event.type === "checkout.session.completed") {
      const session = event.data.object;
      const metadata = session["metadata"] as Record<string, string> | null;
      const userId = metadata?.["userId"];
      const stripeCustomerId = session["customer"] as string | null;
      const subscriptionId = session["subscription"] as string | null;

      if (userId) {
        try {
          await ctx.runMutation(internal.stripe.mutations.upgradeToPro, {
            userId: userId as Id<"users">,
            stripeCustomerId: stripeCustomerId ?? undefined,
            stripeSubscriptionId: subscriptionId ?? undefined,
          });
          await ctx.scheduler.runAfter(0, internal.emails.fitpass.sendProWelcome, {
            userId: userId as Id<"users">,
          });
        } catch (err) {
          console.error("[stripe/webhook] Failed to upgrade user", { userId, err });
        }
      } else {
        console.error("[stripe/webhook] checkout.session.completed missing userId in metadata", { session });
      }
    } else if (event.type === "customer.subscription.deleted") {
      const subscription = event.data.object;
      const stripeCustomerId = subscription["customer"] as string | null;
      if (stripeCustomerId) {
        try {
          await ctx.runMutation(internal.stripe.mutations.downgradeToPro, {
            stripeCustomerId,
          });
        } catch (err) {
          console.error("[stripe/webhook] Failed to downgrade user", { stripeCustomerId, err });
        }
      }
    }

    return new Response("ok", { status: 200 });
  }),
});

export default http;
