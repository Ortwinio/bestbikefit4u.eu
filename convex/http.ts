import { httpRouter, makeFunctionReference } from "convex/server";
import { httpAction } from "./_generated/server";
import { internal } from "./_generated/api";
import { auth } from "./auth";
import { handleStripeWebhook } from "./stripe/webhook";

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

// Signature verification precedes the internal transactional event processor.
http.route({
  path: "/stripe/webhook",
  method: "POST",
  handler: httpAction(async (ctx, request) => handleStripeWebhook(request, payloadJson =>
    ctx.runMutation(internal.stripe.mutations.processWebhookEvent, { payloadJson }))),
});

export default http;
