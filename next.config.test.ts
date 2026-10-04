import { expect, it, vi } from "vitest";
vi.mock("@sentry/nextjs", () => ({ withSentryConfig: (config: unknown) => config }));
import config from "./next.config";
import { LEGACY_SITE_HOSTS, SITE_ORIGIN } from "./shared/brand";

it("permanently redirects both legacy hosts while preserving paths", async () => {
  const redirects = await config.redirects!();
  expect(redirects).toEqual(LEGACY_SITE_HOSTS.map((host) => ({
    source: "/:path*",
    has: [{ type: "host", value: host }],
    destination: `${SITE_ORIGIN}/:path*`,
    permanent: true,
  })));
  expect(redirects.every((redirect) => redirect.has?.[0].value !== new URL(SITE_ORIGIN).host)).toBe(true);
});

it.each(["Googlebot", "Screaming Frog SEO Spider", "GPTBot", "ClaudeBot", "OAI-SearchBot", "PerplexityBot", "Mozilla/5.0", "UnknownCrawler"])(
  "requests blocking metadata for %s", (userAgent) => {
    expect(config.htmlLimitedBots?.test(userAgent)).toBe(true);
  },
);
