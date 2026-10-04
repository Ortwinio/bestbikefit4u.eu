import { expect, it, vi } from "vitest";
vi.mock("@sentry/nextjs", () => ({ withSentryConfig: (config: unknown) => config }));
import config from "./next.config";
import { LEGACY_SITE_HOST_PATTERN, SITE_ORIGIN } from "./shared/brand";

it("returns one 301 rule covering all legacy hosts while preserving the wildcard path", async () => {
  const redirects = await config.redirects!();
  expect(redirects).toEqual([{
    source: "/:path*",
    has: [{ type: "host", value: LEGACY_SITE_HOST_PATTERN }],
    destination: `${SITE_ORIGIN}/:path*`,
    statusCode: 301,
  }]);
  const hostPattern = new RegExp(`^(?:${redirects[0].has?.[0].value})$`, "i");
  for (const host of ["bestbikefit4u.eu", "www.bestbikefit4u.eu", "notifications.bestbikefit4u.eu",
    "deep.archive.bestbikefit4u.eu"]) expect(hostPattern.test(host), host).toBe(true);
  for (const host of ["bikefitboost.com", "www.bikefitboost.com", "bestbikefit4u.eu.evil.example",
    "notbestbikefit4u.eu"]) expect(hostPattern.test(host), host).toBe(false);
});

it.each(["Googlebot", "Screaming Frog SEO Spider", "GPTBot", "ClaudeBot", "OAI-SearchBot", "PerplexityBot", "Mozilla/5.0", "UnknownCrawler"])(
  "requests blocking metadata for %s", (userAgent) => {
    expect(config.htmlLimitedBots?.test(userAgent)).toBe(true);
  },
);
