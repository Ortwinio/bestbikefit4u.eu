import { fetchMutation } from "convex/nextjs";
import { api } from "../../../../../convex/_generated/api";
import type { Id } from "../../../../../convex/_generated/dataModel";
import { getServerStripe } from "@/lib/billing/serverStripe";
import { checkoutParameters, validateCheckoutPrices } from "@/lib/billing/stripeCheckout";
import { stripeRoute } from "../handler";

export const runtime = "nodejs";
export const POST = stripeRoute(async (body, token, locale) => {
  if (typeof body.productId !== "string" || body.withdrawalAccepted !== true
    || (body.bikeId !== undefined && typeof body.bikeId !== "string")) throw new Error("INVALID_CHECKOUT");
  const reservation = await fetchMutation(api.stripe.checkout.reserveCheckout, {
    productId: body.productId, bikeId: body.bikeId as Id<"bikes"> | undefined,
    locale, withdrawalAccepted: true,
  }, { token });
  if (!("reservationId" in reservation) || !reservation.email) throw new Error("CHECKOUT_UNAVAILABLE");
  const stripe = getServerStripe();
  await validateCheckoutPrices(stripe, reservation.productId);
  const customerId = reservation.customerId ?? (await stripe.customers.create({
    email: reservation.email, metadata: { userId: reservation.userId },
  }, { idempotencyKey: `customer:${reservation.userId}` })).id;
  const parameters = checkoutParameters({ ...reservation, customerId }, locale);
  const session = await stripe.checkout.sessions.create(parameters, {
    idempotencyKey: `checkout:${reservation.reservationId}`,
  });
  if (!session.url) throw new Error("CHECKOUT_URL_MISSING");
  return { url: session.url, sessionId: session.id };
});
