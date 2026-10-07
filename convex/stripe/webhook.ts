import Stripe from "stripe";
import { assertStripeEventMode, parseStripeMode } from "../../shared/billing/stripeMode";
import { isStripeBillingEnabled } from "../../src/config/billing";
import { stripeNotImplemented } from "../../shared/billing/stripeStub";

export const STRIPE_API_VERSION = "2026-06-24.dahlia";

export function stripeWebhookResponse(): Response {
  return Response.json(stripeNotImplemented(), {
    status: 501, headers: { "Cache-Control": "no-store" },
  });
}

export async function handleStripeWebhook(request: Request, process: (payloadJson: string) => Promise<unknown>) {
  if (!isStripeBillingEnabled()) return stripeWebhookResponse();
  let mode;
  try {
    mode = parseStripeMode(globalThis.process.env.STRIPE_MODE);
  } catch {
    console.error("BILLING_ALERT", JSON.stringify({ area: "billing", code: "STRIPE_MODE_INVALID" }));
    return new Response("Webhook unavailable", { status: 503 });
  }
  const signature = request.headers.get("stripe-signature");
  const secret = globalThis.process.env.STRIPE_WEBHOOK_SECRET;
  if (!secret) return new Response("Webhook unavailable", { status: 503 });
  if (!signature) return new Response("Invalid signature", { status: 400 });
  let event: Stripe.Event;
  try {
    // Signature verification is local HMAC only; never fetch Stripe from this handler.
    const stripe = new Stripe("webhook_signature_verification_only", { apiVersion: STRIPE_API_VERSION });
    event = await stripe.webhooks.constructEventAsync(await request.text(), signature, secret,
      undefined, Stripe.createSubtleCryptoProvider());
  } catch {
    return new Response("Invalid signature", { status: 400 });
  }
  try {
    assertStripeEventMode(mode, event.livemode);
  } catch {
    return new Response("Invalid event mode", { status: 400 });
  }
  try {
    await process(JSON.stringify(event));
    return Response.json({ received: true });
  } catch {
    console.error("BILLING_ALERT", JSON.stringify({ area: "billing", code: "WEBHOOK_PROCESSING_FAILED" }));
    return new Response("Webhook processing failed", { status: 500 });
  }
}
