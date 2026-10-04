import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const manifest = JSON.parse(readFileSync(new URL("../package.json", import.meta.url), "utf8"));
const lock = JSON.parse(readFileSync(new URL("../package-lock.json", import.meta.url), "utf8"));

describe("build dependency policy", () => {
  it("keeps Lighthouse out of normal installs", () => {
    expect(manifest.devDependencies).not.toHaveProperty("@lhci/cli");
    expect(lock.packages[""].devDependencies).not.toHaveProperty("@lhci/cli");
    expect(lock.packages).not.toHaveProperty("node_modules/@lhci/cli");
  });

  // Approved by name, not version, so a dependency bump cannot silently skip @sentry/cli's binary download.
  it("approves only the three reviewed install scripts", () => {
    expect(manifest.allowScripts).toEqual({
      "@sentry/cli": true,
      esbuild: true,
      "unrs-resolver": true,
      fsevents: false,
    });
  });

  it("does not retain the deprecated Lighthouse dependency versions", () => {
    const deprecated = Object.entries(lock.packages).filter(([path, value]) => {
      const version = (value as { version?: string }).version ?? "";
      return /\/node_modules\/inflight$/.test(`/${path}`)
        || (/\/node_modules\/rimraf$/.test(`/${path}`) && /^[23]\./.test(version))
        || (/\/node_modules\/glob$/.test(`/${path}`) && version.startsWith("7."))
        || (/\/node_modules\/uuid$/.test(`/${path}`) && version.startsWith("8."));
    });
    expect(deprecated).toEqual([]);
  });

  it("disables telemetry for both builds without bypassing the Vercel preflight", () => {
    expect(manifest.scripts.build).toBe("NEXT_TELEMETRY_DISABLED=1 next build --webpack");
    expect(manifest.scripts["build:vercel"]).toBe(
      "node scripts/check-vercel-env.mjs && NEXT_TELEMETRY_DISABLED=1 next build --webpack",
    );
  });
});
