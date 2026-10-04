import { afterEach, describe, expect, it, vi } from "vitest";
import { LEGACY_SITE_HOSTS } from "../../../shared/brand";
import { emailActionUrl } from "../delivery";
import { emailPreferencePageUrl } from "../unsubscribeTokens";

afterEach(() => vi.unstubAllEnvs());

describe("email website origins", () => {
  it.each([
    ["", "https://bikefitboost.com"],
    ["malformed", "https://bikefitboost.com"],
    ["https://user:pass@unsafe.example", "https://bikefitboost.com"],
    ["https://www.bikefitboost.com", "https://bikefitboost.com"],
    ["https://bikefitboost.com", "https://bikefitboost.com"],
    ["http://localhost:3000", "http://localhost:3000"],
    ...LEGACY_SITE_HOSTS.map((host) => [`https://${host}`, "https://bikefitboost.com"]),
    [`https://nested.${LEGACY_SITE_HOSTS[0]}`, "https://bikefitboost.com"],
  ])("uses a safe origin for %s", (origin, expected) => {
    vi.stubEnv("NEXT_PUBLIC_SITE_URL", "");
    vi.stubEnv("SITE_URL", origin);
    expect(emailActionUrl("nl", "/settings")).toBe(`${expected}/nl/settings`);
    expect(emailPreferencePageUrl("private+token", "en")).toBe(`${expected}/en/email-preferences#token=private%2Btoken`);
  });
});
