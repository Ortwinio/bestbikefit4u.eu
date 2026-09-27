import { afterEach, describe, expect, it, vi } from "vitest";
import { isAllowedPdfResource } from "./resourcePolicy";

afterEach(() => vi.unstubAllEnvs());

describe("PDF image network policy", () => {
  it.each([
    "http://169.254.169.254/latest/meta-data", "http://localhost:3000/private",
    "file:///etc/passwd", "https://attacker.test/pixel", "https://dgalywyr863if.cloudfront.net.attacker.test/img",
    "https://dgalywyr863if.cloudfront.net:8443/img", "https://user:pass@dgalywyr863if.cloudfront.net/img",
    "https://another-deployment.convex.cloud/api/storage/id",
  ])("blocks arbitrary server destinations: %s", (url) => {
    vi.stubEnv("NEXT_PUBLIC_CONVEX_URL", "https://ours.convex.cloud");
    expect(isAllowedPdfResource(url, "image")).toBe(false);
  });

  it("allows only own Convex storage and known avatar image hosts", () => {
    vi.stubEnv("NEXT_PUBLIC_CONVEX_URL", "https://ours.convex.cloud");
    expect(isAllowedPdfResource("https://ours.convex.cloud/api/storage/file", "image")).toBe(true);
    expect(isAllowedPdfResource("https://ours.convex.cloud/api/private", "image")).toBe(false);
    expect(isAllowedPdfResource("https://dgalywyr863if.cloudfront.net/avatar.jpg", "image")).toBe(true);
    expect(isAllowedPdfResource("https://lh3.googleusercontent.com/avatar", "script")).toBe(false);
  });
});
