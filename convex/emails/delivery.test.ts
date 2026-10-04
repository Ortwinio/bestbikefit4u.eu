import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { DEFAULT_SITE_ORIGIN, LEGACY_SITE_HOSTS } from "../../shared/brand";
import { emailActionUrl } from "./delivery";

afterEach(() => vi.unstubAllEnvs());

describe("email action origin", () => {
  beforeEach(() => vi.stubEnv("NEXT_PUBLIC_SITE_URL", ""));
  it.each(LEGACY_SITE_HOSTS.map(host => `https://${host}`))(
    "replaces stale legacy SITE_URL %s with the shared brand origin",
    siteUrl => {
      vi.stubEnv("SITE_URL", siteUrl);
      expect(emailActionUrl("nl", "/checkout")).toBe(`${DEFAULT_SITE_ORIGIN}/nl/checkout`);
      expect(emailActionUrl("en", "/settings")).toBe(`${DEFAULT_SITE_ORIGIN}/en/settings`);
    },
  );

  it("preserves an explicit preview origin", () => {
    vi.stubEnv("SITE_URL", "https://preview.example.com/");
    expect(emailActionUrl("en", "/fit")).toBe("https://preview.example.com/en/fit");
  });
});
