import { fetchQuery } from "convex/nextjs";
import { api } from "../../../../../convex/_generated/api";
import { resolveSiteOrigin } from "../../../../../shared/brand";
import { getServerStripe } from "@/lib/billing/serverStripe";
import { stripeRoute } from "../handler";

export const runtime = "nodejs";
export const POST = stripeRoute(async (_body, token, locale) => {
  const context = await fetchQuery(api.stripe.queries.billingContext, {}, { token });
  if (!context?.customerId) throw new Error("CUSTOMER_NOT_FOUND");
  const stripe = getServerStripe();
  const configuration = await stripe.billingPortal.configurations.create({
    features: {
      invoice_history: { enabled: true }, payment_method_update: { enabled: true },
      customer_update: { enabled: false }, subscription_cancel: { enabled: false },
      subscription_update: { enabled: false },
    },
    business_profile: { headline: "BikeFitBoost" },
  }, { idempotencyKey: "portal:invoice-payment-only:v1" });
  const session = await stripe.billingPortal.sessions.create({
    customer: context.customerId, configuration: configuration.id,
    return_url: `${resolveSiteOrigin()}/${locale}/settings`, locale,
  });
  return { url: session.url };
});
