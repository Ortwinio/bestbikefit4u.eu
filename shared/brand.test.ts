import { afterEach, expect, it, vi } from "vitest";
import { readFileSync } from "node:fs";
import { runInNewContext } from "node:vm";
import ts from "typescript";
import { DEFAULT_SITE_ORIGIN, isLegacySiteHost, resolveSiteOrigin } from "./brand";

afterEach(() => { vi.unstubAllEnvs(); vi.resetModules(); });

it("uses the new canonical origin by default", async () => {
  vi.stubEnv("NEXT_PUBLIC_SITE_URL", "");
  vi.stubEnv("SITE_URL", "");
  vi.resetModules();
  expect((await import("./brand")).SITE_ORIGIN).toBe("https://bikefitboost.com");
});

it("normalizes the shared public override to an origin", async () => {
  vi.stubEnv("NEXT_PUBLIC_SITE_URL", " https://preview.example.com/path ");
  vi.stubEnv("SITE_URL", "https://backend.example.com");
  vi.resetModules();
  expect((await import("./brand")).SITE_ORIGIN).toBe("https://preview.example.com");
});

it("supports the backend site environment when the public override is absent", async () => {
  vi.stubEnv("NEXT_PUBLIC_SITE_URL", "");
  vi.stubEnv("SITE_URL", "https://backend.example.com/");
  vi.resetModules();
  expect((await import("./brand")).SITE_ORIGIN).toBe("https://backend.example.com");
});

it("ignores a stale override that still names a legacy host, so redirects cannot loop", async () => {
  vi.stubEnv("NEXT_PUBLIC_SITE_URL", "https://bestbikefit4u.eu");
  vi.stubEnv("SITE_URL", "https://www.bestbikefit4u.eu/");
  vi.resetModules();
  expect((await import("./brand")).SITE_ORIGIN).toBe("https://bikefitboost.com");
});

it.each(["https://www.bikefitboost.com/path", "http://bikefitboost.com", "https://bikefitboost.com:443/"])(
  "canonicalizes the valid new alias %s without classifying it as legacy", (value) => {
    expect(resolveSiteOrigin(value)).toBe(DEFAULT_SITE_ORIGIN);
    expect(isLegacySiteHost(new URL(value).hostname)).toBe(false);
  },
);

it.each(["https://notifications.bestbikefit4u.eu", "https://deep.archive.bestbikefit4u.eu",
  "https://BESTBIKEFIT4U.EU./path", "ftp://preview.example", "javascript:alert(1)",
  "https://user:password@preview.example", "http://preview.example", "not a URL"])(
  "ignores unsafe or legacy origin override %s", (value) => {
    expect(resolveSiteOrigin(value)).toBe(DEFAULT_SITE_ORIGIN);
    expect(resolveSiteOrigin(value, "https://preview.example")).toBe("https://preview.example");
  },
);

it.each(["bestbikefit4u.eu.evil.example", "notbestbikefit4u.eu", "bikefitboost.com", "www.bikefitboost.com"])(
  "does not classify an unrelated/alias host as legacy: %s", (host) => {
    expect(isLegacySiteHost(host)).toBe(false);
  },
);

it("reads current environment values on each helper call and preserves loopback development ports", () => {
  vi.stubEnv("NEXT_PUBLIC_SITE_URL", "");
  vi.stubEnv("SITE_URL", "http://localhost:4317/path");
  expect(resolveSiteOrigin()).toBe("http://localhost:4317");
  vi.stubEnv("SITE_URL", "https://www.bikefitboost.com");
  expect(resolveSiteOrigin()).toBe(DEFAULT_SITE_ORIGIN);
});

it("evaluates safely when Convex schema evaluation denies environment access", () => {
  const source = readFileSync(new URL("./brand.ts", import.meta.url), "utf8");
  const output = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS } }).outputText;
  const exports: Record<string, unknown> = {};
  const processWithoutEnvironment = { get env() { throw new Error("Environment access denied"); } };
  runInNewContext(output, { exports, process: processWithoutEnvironment, URL });
  expect(exports.SITE_ORIGIN).toBe(DEFAULT_SITE_ORIGIN);
  expect((exports.resolveSiteOrigin as () => string)()).toBe(DEFAULT_SITE_ORIGIN);
});
