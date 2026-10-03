import { expect, it, vi } from "vitest";
vi.mock("@sentry/nextjs", () => ({ withSentryConfig: (config: unknown) => config }));
import config from "./next.config";

it.each(["Googlebot", "Screaming Frog SEO Spider", "GPTBot", "ClaudeBot", "OAI-SearchBot", "PerplexityBot", "Mozilla/5.0", "UnknownCrawler"])(
  "requests blocking metadata for %s", (userAgent) => {
    expect(config.htmlLimitedBots?.test(userAgent)).toBe(true);
  },
);
