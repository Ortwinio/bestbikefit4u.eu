import { describe, expect, it, vi, afterEach } from "vitest";
import { stripeNotImplemented, STRIPE_NOT_IMPLEMENTED } from "./stripeStub";
import { stripeNotImplemented as sharedStub } from "../../../shared/billing/stripeStub";

afterEach(() => vi.unstubAllEnvs());
describe("release 2.0 Stripe stub", () => {
  it.each(["true", "false"])("never enables payment when billing flags are %s", enabled => {
    vi.stubEnv("STRIPE_BILLING_ENABLED", enabled);
    vi.stubEnv("NEXT_PUBLIC_STRIPE_BILLING_ENABLED", enabled);
    expect(stripeNotImplemented).toBe(sharedStub);
    for (const locale of ["nl", "en"] as const) {
      expect(stripeNotImplemented(locale)).toMatchObject({ ok: false, code: STRIPE_NOT_IMPLEMENTED });
    }
  });
  it("uses the approved bilingual message", () => {
    expect(stripeNotImplemented().message).toBe("Betalen via Stripe is nog niet geïmplementeerd. "
      + "Je keuze is bewaard; we laten het je weten zodra afrekenen kan.");
    expect(stripeNotImplemented("en").message).toBe("Payment through Stripe has not been implemented yet. "
      + "Your choice has been saved; we’ll let you know when checkout is available.");
  });
});
