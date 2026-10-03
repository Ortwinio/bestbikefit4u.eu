import { stripeNotImplemented } from "../../shared/billing/stripeStub";

/** Never parse, verify, acknowledge or apply payment events before integration exists. */
export function stripeWebhookResponse(): Response {
  return Response.json(stripeNotImplemented(), {
    status: 501,
    headers: { "Cache-Control": "no-store" },
  });
}
