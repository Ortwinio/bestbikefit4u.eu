import { describe, expect, it } from "vitest";
import { billingDeploymentChecks } from "./deploymentConfig";

const enabled = {
  STRIPE_BILLING_ENABLED: "true", NEXT_PUBLIC_STRIPE_BILLING_ENABLED: "true",
  STRIPE_ANNUAL_PRICE_ID: "price_annual", STRIPE_SINGLE_FIT_PRICE_ID: "price_single",
  STRIPE_PERSONAL_FIT_ADDON_PRICE_ID: "price_addon", STRIPE_PERSONAL_FIT_STANDALONE_PRICE_ID: "price_standalone",
  STRIPE_UPGRADE_COUPON_ID: "coupon_upgrade",
};
const passes = (env: Record<string, string | undefined>) => Object.values(billingDeploymentChecks(env)).every(Boolean);
describe("billing deployment requirements", () => {
  for (const deployment of ["production", "preview", "development", undefined]) {
    for (const mode of ["live", "test", "invalid", undefined]) {
      for (const prefix of ["sk_live", "rk_live", "sk_test", "rk_test", "invalid"]) {
        it(`${deployment}/${mode}/${prefix}`, () => {
          const expected = deployment === "production" ? "live" : "test";
          expect(passes({ ...enabled, VERCEL_ENV: deployment, STRIPE_MODE: mode,
            STRIPE_SECRET_KEY: `${prefix}_mock` })).toBe(mode === expected && prefix.endsWith(`_${expected}`));
        });
      }
    }
  }
  it("ignores provider configuration while either billing switch is off", () => {
    expect(passes({ ...enabled, STRIPE_BILLING_ENABLED: "false", STRIPE_MODE: "invalid" })).toBe(true);
    expect(passes({ ...enabled, NEXT_PUBLIC_STRIPE_BILLING_ENABLED: "false", STRIPE_MODE: "invalid" })).toBe(true);
  });
  it("defaults personal sales off and requires a matching presentation flag", () => {
    expect(passes({})).toBe(true);
    expect(passes({ PERSONAL_FIT_SALES_ENABLED: "true" })).toBe(false);
    expect(passes({ NEXT_PUBLIC_PERSONAL_FIT_SALES_ENABLED: "true" })).toBe(false);
  });
  const personal = { PERSONAL_FIT_SALES_ENABLED: "true", NEXT_PUBLIC_PERSONAL_FIT_SALES_ENABLED: "true",
    PERSONAL_BIKEFIT_AGENDA_URL: "https://booking.example.test/fit", FITTER_NOTIFICATION_EMAIL: "fitter@example.test" };
  it("accepts HTTPS and a single notification recipient", () => expect(passes(personal)).toBe(true));
  it.each(["", "http://booking.example.test", "https://user:password@booking.example.test", "javascript:alert(1)"])(
    "rejects an unsafe agenda URL %s", (url) => expect(passes({ ...personal, PERSONAL_BIKEFIT_AGENDA_URL: url })).toBe(false)
  );
  it.each(["", "invalid", "a@example.test,b@example.test", "Name <a@example.test>", "a@example.test\nb@example.test"])(
    "rejects invalid/multiple fitter recipients", (email) => expect(passes({ ...personal, FITTER_NOTIFICATION_EMAIL: email })).toBe(false)
  );
});
