import { readFileSync } from "node:fs";
import { afterEach, describe, expect, it, vi } from "vitest";
import { decideProxyAction } from "@/i18n/proxyDecision";
import { isStripeBillingEnabled, isStripeBillingVisible } from "@/config/billing";
import { getServerStripe } from "./serverStripe";

afterEach(() => vi.unstubAllEnvs());
describe("Stripe integration boundaries", () => {
  it.each([undefined, "false", "true"])("fails closed for server flag %s", (server) => {
    for (const client of [undefined, "false", "true"]) {
      vi.stubEnv("STRIPE_BILLING_ENABLED", server);
      vi.stubEnv("NEXT_PUBLIC_STRIPE_BILLING_ENABLED", client);
      expect(isStripeBillingEnabled()).toBe(server === "true" && client === "true");
      expect(isStripeBillingVisible()).toBe(client === "true");
      if (!isStripeBillingEnabled()) expect(() => getServerStripe()).toThrow("STRIPE_NOT_IMPLEMENTED");
    }
  });
  it("documents disabled flags and has no retired provider price settings", () => {
    const example = readFileSync(".env.example", "utf8");
    expect(example).toContain("STRIPE_BILLING_ENABLED=false");
    expect(example).toContain("NEXT_PUBLIC_STRIPE_BILLING_ENABLED=false");
    expect(example).not.toMatch(/STRIPE_PRO_(MONTHLY|YEARLY)/);
    expect(example).toContain("STRIPE_UPGRADE_COUPON_ID=");
  });
  it.each(["checkout", "portal", "cancel", "refund", "webhook"])("bypasses locale rewriting for %s", (route) => {
    expect(decideProxyAction({ pathname: `/api/stripe/${route}`, cookieLocale: "nl",
      acceptLanguageHeader: "nl", isAuthenticated: false })).toEqual({ type: "bypass" });
  });
});
