import { assertStripeKeyMode } from "./stripeMode";

/** Safe, shared deployment diagnostics: keys and booleans only, never environment values. */
export function billingDeploymentChecks(env: Record<string, string | undefined>) {
  const checks: Record<string, boolean> = {};
  const billing = env.STRIPE_BILLING_ENABLED === "true" && env.NEXT_PUBLIC_STRIPE_BILLING_ENABLED === "true";
  if (billing) {
    for (const name of [
      "STRIPE_SECRET_KEY", "STRIPE_ANNUAL_PRICE_ID", "STRIPE_SINGLE_FIT_PRICE_ID",
      "STRIPE_PERSONAL_FIT_ADDON_PRICE_ID", "STRIPE_PERSONAL_FIT_STANDALONE_PRICE_ID", "STRIPE_UPGRADE_COUPON_ID",
    ]) checks[name] = Boolean(env[name]?.trim());
    const expectedMode = env.VERCEL_ENV === "production" ? "live" : "test";
    checks.STRIPE_MODE = env.STRIPE_MODE === expectedMode;
    try {
      assertStripeKeyMode(env.STRIPE_MODE, env.STRIPE_SECRET_KEY);
      checks.STRIPE_SECRET_KEY = true;
    } catch {
      checks.STRIPE_SECRET_KEY = false;
    }
  }
  const personal = env.PERSONAL_FIT_SALES_ENABLED === "true";
  const publicPersonal = env.NEXT_PUBLIC_PERSONAL_FIT_SALES_ENABLED === "true";
  checks.PERSONAL_FIT_SALES_ENABLED = env.PERSONAL_FIT_SALES_ENABLED === undefined ||
    ["true", "false"].includes(env.PERSONAL_FIT_SALES_ENABLED);
  checks.NEXT_PUBLIC_PERSONAL_FIT_SALES_ENABLED =
    (env.NEXT_PUBLIC_PERSONAL_FIT_SALES_ENABLED === undefined ||
      ["true", "false"].includes(env.NEXT_PUBLIC_PERSONAL_FIT_SALES_ENABLED)) && personal === publicPersonal;
  if (personal) {
    checks.PERSONAL_BIKEFIT_AGENDA_URL = isHttpsUrl(env.PERSONAL_BIKEFIT_AGENDA_URL);
    checks.FITTER_NOTIFICATION_EMAIL = /^[^\s@<>;,]+@[^\s@<>;,]+\.[^\s@<>;,]+$/.test(env.FITTER_NOTIFICATION_EMAIL ?? "");
  }
  return checks;
}

export function isHttpsUrl(value: string | undefined) {
  try {
    const url = new URL(value ?? "");
    return url.protocol === "https:" && !url.username && !url.password;
  } catch {
    return false;
  }
}
