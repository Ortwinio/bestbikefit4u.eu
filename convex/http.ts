import { httpRouter, makeFunctionReference } from "convex/server";
import { httpAction } from "./_generated/server";
import { internal } from "./_generated/api";
import { Id } from "./_generated/dataModel";
import { auth } from "./auth";
import { verifyStripeWebhookSignature } from "./stripe/webhook";

const http = httpRouter();

auth.addHttpRoutes(http);

for (const method of ["GET", "POST"] as const) {
  http.route({
    path: "/emails/unsubscribe",
    method,
    handler: httpAction(async (ctx, request) => {
      const headers = { "Cache-Control": "no-store", "Referrer-Policy": "no-referrer", "X-Robots-Tag": "noindex, nofollow" };
      const token = new URL(request.url).searchParams.get("token");
      if (!token || token.length > 2048) return new Response("Invalid or expired email link", { status: 400, headers });
      try {
        if (request.method === "GET") {
          const location = await ctx.runAction(makeFunctionReference<"action", { token: string }, string>("emails/preferenceActions:confirmationUrl"), { token });
          return new Response(null, { status: 303, headers: { ...headers, Location: location } });
        }
        await ctx.runAction(makeFunctionReference<"action", { token: string }, null>("emails/preferenceActions:unsubscribe"), { token });
        return new Response("Unsubscribed", { status: 200, headers });
      } catch {
        return new Response("Invalid or expired email link", { status: 400, headers });
      }
    }),
  });
}

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

    const payload = await request.text();
    const verification = await verifyStripeWebhookSignature({
      payload,
      signatureHeader: request.headers.get("stripe-signature"),
      webhookSecret,
    });
    if (!verification.ok) {
      const message =
        verification.reason === "missing"
          ? "Missing stripe-signature header"
          : verification.reason === "timestamp"
            ? "Webhook timestamp out of tolerance"
            : verification.reason === "format"
              ? "Invalid stripe-signature format"
              : "Invalid webhook signature";
      return new Response(message, { status: 400 });
    }

    // Parse event
    let event: { id?: string; type?: string; data?: { object?: Record<string, unknown> } };
    try {
      event = JSON.parse(payload) as typeof event;
    } catch {
      return new Response("Invalid JSON", { status: 400 });
    }

    if (!event.id || !event.type || !event.data?.object) {
      return new Response("Invalid Stripe event", { status: 400 });
    }

    try {
      const result = await ctx.runMutation(internal.stripe.mutations.processWebhookEvent, {
        payloadJson: payload,
      });
      if ("welcomeUserId" in result && result.welcomeUserId) {
        await ctx.scheduler.runAfter(0, internal.emails.fitpass.sendProWelcome, {
          userId: result.welcomeUserId as Id<"users">,
        });
      }
    } catch (err) {
      console.error("[stripe/webhook] Failed to process event", {
        eventId: event.id,
        eventType: event.type,
        err,
      });
      return new Response("Webhook processing failed", { status: 500 });
    }

    return new Response("ok", { status: 200 });
  }),
});

export default http;
