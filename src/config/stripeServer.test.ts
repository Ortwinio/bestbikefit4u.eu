import { afterEach, describe, expect, it, vi } from "vitest";
import { LEGACY_SITE_HOSTS, resolveSiteOrigin } from "../../shared/brand";

afterEach(() => vi.unstubAllEnvs());

describe("shared server origin used by billing", () => {
  it.each([
    ["", "https://bikefitboost.com"],
    ["invalid", "https://bikefitboost.com"],
    ["javascript:alert(1)", "https://bikefitboost.com"],
    ["https://user:pass@unsafe.example", "https://bikefitboost.com"],
    ["https://www.bikefitboost.com/path", "https://bikefitboost.com"],
    ["https://bikefitboost.com", "https://bikefitboost.com"],
    ["http://localhost:3000", "http://localhost:3000"],
    ...LEGACY_SITE_HOSTS.map((host) => [`https://${host}`, "https://bikefitboost.com"]),
    [`https://nested.${LEGACY_SITE_HOSTS[0]}`, "https://bikefitboost.com"],
  ])("normalizes configured %s to %s", (origin, expected) => {
    vi.stubEnv("NODE_ENV", "production");
    vi.stubEnv("NEXT_PUBLIC_SITE_URL", "");
    vi.stubEnv("SITE_URL", origin);
    expect(resolveSiteOrigin()).toBe(expected);
  });
});
