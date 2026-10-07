import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";

const root = "/Users/ortwinverreck/Developer/bikefitboost-stripe";
const common = { PATH: process.env.PATH, HOME: process.env.HOME, TMPDIR: process.env.TMPDIR,
  NEXT_PUBLIC_CONVEX_URL: "https://fixture.convex.cloud" };
const enabled = { ...common, VERCEL_ENV: "preview", STRIPE_MODE: "test",
  STRIPE_BILLING_ENABLED: "true", NEXT_PUBLIC_STRIPE_BILLING_ENABLED: "true",
  STRIPE_SECRET_KEY: "sk_test_dummynotacredential", STRIPE_ANNUAL_PRICE_ID: "price_fixture_annual",
  STRIPE_SINGLE_FIT_PRICE_ID: "price_fixture_single", STRIPE_PERSONAL_FIT_ADDON_PRICE_ID: "price_fixture_addon",
  STRIPE_PERSONAL_FIT_STANDALONE_PRICE_ID: "price_fixture_standalone", STRIPE_UPGRADE_COUPON_ID: "fixture_upgrade",
  PERSONAL_FIT_SALES_ENABLED: "true", NEXT_PUBLIC_PERSONAL_FIT_SALES_ENABLED: "true",
  PERSONAL_BIKEFIT_AGENDA_URL: "https://example.invalid/agenda", FITTER_NOTIFICATION_EMAIL: "fixture@example.invalid" };
const cases = [
  ["off-without-payment-config", common, true],
  ["preview-test-on", enabled, true],
  ["production-live-fixture", { ...enabled, VERCEL_ENV: "production", STRIPE_MODE: "live", STRIPE_SECRET_KEY: "rk_live_dummynotacredential" }, true],
  ["personal-off-no-booking", { ...enabled, PERSONAL_FIT_SALES_ENABLED: "false", NEXT_PUBLIC_PERSONAL_FIT_SALES_ENABLED: "false", PERSONAL_BIKEFIT_AGENDA_URL: undefined, FITTER_NOTIFICATION_EMAIL: undefined }, true],
  ["production-rejects-test", { ...enabled, VERCEL_ENV: "production" }, false],
  ["preview-rejects-live", { ...enabled, STRIPE_MODE: "live", STRIPE_SECRET_KEY: "sk_live_dummynotacredential" }, false],
  ["key-mode-mismatch", { ...enabled, STRIPE_SECRET_KEY: "rk_live_dummynotacredential" }, false],
  ["malformed-key", { ...enabled, STRIPE_SECRET_KEY: "invalid" }, false],
  ["personal-flag-mismatch", { ...enabled, NEXT_PUBLIC_PERSONAL_FIT_SALES_ENABLED: "false" }, false],
  ["invalid-personal-flag", { ...enabled, PERSONAL_FIT_SALES_ENABLED: "yes" }, false],
  ["http-agenda", { ...enabled, PERSONAL_BIKEFIT_AGENDA_URL: "http://example.invalid/agenda" }, false],
  ["credential-agenda", { ...enabled, PERSONAL_BIKEFIT_AGENDA_URL: "https://fixture:fixture@example.invalid/agenda" }, false],
  ["invalid-fitter-recipient", { ...enabled, FITTER_NOTIFICATION_EMAIL: "invalid" }, false],
  ["missing-convex", { ...enabled, NEXT_PUBLIC_CONVEX_URL: undefined }, false],
  ["vercel-loopback", { ...enabled, VERCEL: "1", NEXT_PUBLIC_CONVEX_URL: "http://127.0.0.1:9" }, false],
];
for (const field of ["STRIPE_MODE", "STRIPE_SECRET_KEY", "STRIPE_ANNUAL_PRICE_ID", "STRIPE_SINGLE_FIT_PRICE_ID",
  "STRIPE_PERSONAL_FIT_ADDON_PRICE_ID", "STRIPE_PERSONAL_FIT_STANDALONE_PRICE_ID", "STRIPE_UPGRADE_COUPON_ID",
  "PERSONAL_BIKEFIT_AGENDA_URL", "FITTER_NOTIFICATION_EMAIL"]) {
  cases.push([`missing-${field}`, { ...enabled, [field]: undefined }, false]);
}
for (const [name, environment, expected] of cases) {
  const result = spawnSync(process.execPath, [`${root}/scripts/check-vercel-env.mjs`, "--no-env-files"], {
    cwd: root, env: Object.fromEntries(Object.entries(environment).filter(([, value]) => value !== undefined)), encoding: "utf8",
  });
  assert.equal(result.error, undefined, `${name}: process failed`);
  assert.equal(result.status === 0, expected, `${name}: unexpected preflight outcome`);
  assert.equal(`${result.stdout}${result.stderr}`.includes(enabled.STRIPE_SECRET_KEY), false, `${name}: secret echoed`);
  assert.equal(`${result.stdout}${result.stderr}`.includes(enabled.FITTER_NOTIFICATION_EMAIL), false, `${name}: recipient echoed`);
  console.log(`${name}: PASS (${expected ? "accepted" : "rejected"})`);
}
console.log(`PASS: ${cases.length} isolated preflight cases; no environment files read or changed`);
