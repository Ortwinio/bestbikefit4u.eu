import { spawnSync } from "node:child_process";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { afterAll, describe, expect, it } from "vitest";

const directory = mkdtempSync(path.join(tmpdir(), "vercel-preflight-"));
const script = path.resolve("scripts/check-vercel-env.mjs");
afterAll(() => rmSync(directory, { recursive: true, force: true }));

function run(env: Record<string, string>) {
  return spawnSync(process.execPath, [script], {
    cwd: directory,
    encoding: "utf8",
    env: { VERCEL: "1", NODE_ENV: "production", NEXT_PUBLIC_CONVEX_URL: "https://test.convex.cloud", ...env },
  });
}

describe("Vercel environment preflight", () => {
  it("does not require production billing credentials for a preview production-mode build", () => {
    expect(run({ VERCEL_ENV: "preview" }).status).toBe(0);
  });

  const flagValues = [undefined, "false", "true"] as const;
  const flagPairs = flagValues.flatMap((server) => flagValues.map((client) => ({ server, client })))
    .filter(({ server, client }) => server !== "true" || client !== "true");

  it.each(flagPairs)("requires no provider integration with billing flags %j", ({ server, client }) => {
    for (const environment of ["production", ""]) {
      const result = run({
        VERCEL_ENV: environment,
        ...(server === undefined ? {} : { STRIPE_BILLING_ENABLED: server }),
        ...(client === undefined ? {} : { NEXT_PUBLIC_STRIPE_BILLING_ENABLED: client }),
      });
      expect(result.status).toBe(0);
      expect(result.stderr).toBe("");
    }
  });

  it("still requires a valid Convex deployment URL", () => {
    const missing = run({ NEXT_PUBLIC_CONVEX_URL: "" });
    expect(missing.status).toBe(1);
    expect(missing.stderr).toContain("Missing required environment variable: NEXT_PUBLIC_CONVEX_URL");
    const malformed = run({ NEXT_PUBLIC_CONVEX_URL: "not-a-url" });
    expect(malformed.status).toBe(1);
    expect(malformed.stderr).toContain("Invalid URL in NEXT_PUBLIC_CONVEX_URL");
  });

  it("requires configured prices and key only when enabled", () => {
    const enabled = { STRIPE_BILLING_ENABLED: "true", NEXT_PUBLIC_STRIPE_BILLING_ENABLED: "true" };
    expect(run(enabled).status).toBe(1);
    expect(run(enabled).stderr).toContain("STRIPE_ANNUAL_PRICE_ID");
    expect(run({ ...enabled, STRIPE_SECRET_KEY: "rk_test_mock", STRIPE_ANNUAL_PRICE_ID: "price_annual",
      STRIPE_SINGLE_FIT_PRICE_ID: "price_single", STRIPE_PERSONAL_FIT_ADDON_PRICE_ID: "price_addon",
      STRIPE_PERSONAL_FIT_STANDALONE_PRICE_ID: "price_standalone", STRIPE_UPGRADE_COUPON_ID: "coupon_upgrade",
    }).status).toBe(0);
  });

  it("still rejects a preview pointing at localhost", () => {
    const result = run({ VERCEL_ENV: "preview", NEXT_PUBLIC_CONVEX_URL: "http://localhost:3210" });
    expect(result.status).toBe(1);
    expect(result.stderr).toContain("points to localhost");
  });

  it.each(["STRIPE_BILLING_ENABLED", "NEXT_PUBLIC_STRIPE_BILLING_ENABLED"])(
    "allows a production release without Stripe credentials when %s disables payments",
    (flag) => {
      expect(run({ VERCEL_ENV: "production", [flag]: "false" }).status).toBe(0);
    }
  );
});
