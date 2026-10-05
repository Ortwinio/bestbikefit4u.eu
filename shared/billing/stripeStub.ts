/** Disabled-billing response shared by browser, server and Convex. */
export const STRIPE_NOT_IMPLEMENTED = "STRIPE_NOT_IMPLEMENTED" as const;
export type StripeStubLocale = "nl" | "en";
export interface StripeNotImplementedResult {
  ok: false;
  code: typeof STRIPE_NOT_IMPLEMENTED;
  message: string;
}

const messages: Record<StripeStubLocale, string> = {
  nl: "Betalen via Stripe is nog niet geïmplementeerd. Je keuze is bewaard; "
    + "we laten het je weten zodra afrekenen kan.",
  en: "Payment through Stripe has not been implemented yet. Your choice has been saved; "
    + "we’ll let you know when checkout is available.",
};

/** Pure result only: callers persist choices separately; this never grants access or sends mail. */
export function stripeNotImplemented(locale: StripeStubLocale = "nl"): StripeNotImplementedResult {
  return { ok: false, code: STRIPE_NOT_IMPLEMENTED, message: messages[locale] };
}
