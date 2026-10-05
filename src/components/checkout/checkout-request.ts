import type { Locale } from "@/i18n/config";
import { stripeNotImplemented, type StripeNotImplementedResult } from "@/lib/billing/stripeStub";
import { checkoutProductId, type CheckoutSelection } from "./checkout-state";

export async function requestCheckout(
  selection: CheckoutSelection,
  locale: Locale,
  eligibleForUpgrade: boolean,
  token: string,
): Promise<{ url: string } | StripeNotImplementedResult> {
  const response = await fetch("/api/stripe/checkout", {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    body: JSON.stringify({
      productId: checkoutProductId(selection.product, eligibleForUpgrade),
      ...(selection.product === "single" ? { bikeId: selection.bikeId } : {}),
      locale,
      withdrawalAccepted: true,
    }),
  });
  const result = await response.json();
  if (result?.code === "STRIPE_NOT_IMPLEMENTED") return stripeNotImplemented(locale);
  if (!response.ok || typeof result?.url !== "string" || typeof result?.sessionId !== "string") throw new Error("CHECKOUT_FAILED");
  const url = new URL(result.url);
  if (url.protocol !== "https:" || url.username || url.password) throw new Error("CHECKOUT_URL_INVALID");
  return { url: url.href };
}
