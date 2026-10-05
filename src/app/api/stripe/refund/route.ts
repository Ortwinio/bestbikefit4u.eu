import { fetchQuery } from "convex/nextjs";
import { api } from "../../../../../convex/_generated/api";
import { cancelOwnedSubscription } from "@/lib/billing/cancelSubscription";
import { stripeRoute } from "../handler";

export const runtime = "nodejs";
export const POST = stripeRoute(async (_body, token) => {
  const context = await fetchQuery(api.stripe.queries.billingContext, {}, { token });
  if (!context) throw new Error("SUBSCRIPTION_NOT_FOUND");
  return cancelOwnedSubscription(context, true);
});
