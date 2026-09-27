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

  it.each(["production", ""])("still requires billing configuration for production (%s)", (environment) => {
    const result = run({ VERCEL_ENV: environment });
    expect(result.status).toBe(1);
    expect(result.stderr).toContain("STRIPE_PRO_MONTHLY_PRICE_ID");
    expect(result.stderr).toContain("STRIPE_SECRET_KEY");
  });

  it("validates frontend billing without requiring the Convex-only webhook secret", () => {
    const result = run({ VERCEL_ENV: "production", SITE_URL: "https://bestbikefit4u.eu", STRIPE_SECRET_KEY: "test-only", STRIPE_PRO_MONTHLY_PRICE_ID: "price_test" });
    expect(result.status).toBe(0);
  });

  it("still rejects a preview pointing at localhost", () => {
    const result = run({ VERCEL_ENV: "preview", NEXT_PUBLIC_CONVEX_URL: "http://localhost:3210" });
    expect(result.status).toBe(1);
    expect(result.stderr).toContain("points to localhost");
  });
});
