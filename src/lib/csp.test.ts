import { afterEach, describe, expect, it, vi } from "vitest";
import { buildContentSecurityPolicy, createCspNonce, createCspRequestHeaders } from "./csp";

describe("content security policy", () => {
  afterEach(() => vi.unstubAllEnvs());

  it("permits only the configured HTTPS error-ingestion origin without credentials", () => {
    vi.stubEnv("NEXT_PUBLIC_SENTRY_DSN", "https://publickey@o123.ingest.sentry.io/456");
    const policy = buildContentSecurityPolicy("testnonce", false);
    expect(policy).toContain("https://o123.ingest.sentry.io");
    expect(policy).not.toContain("publickey");
    vi.stubEnv("NEXT_PUBLIC_SENTRY_DSN", "http://localhost:9000/456");
    expect(buildContentSecurityPolicy("testnonce", false)).not.toContain("localhost");
  });
  it("keeps production script execution nonce-protected without eval or inline scripts", () => {
    const policy = buildContentSecurityPolicy("testnonce", false);
    const script = policy.split("; ").find((item) => item.startsWith("script-src "))!;
    expect(script).toContain("'nonce-testnonce'");
    expect(script).not.toContain("'unsafe-inline'");
    expect(script).not.toContain("'unsafe-eval'");
    expect(policy).toContain("style-src 'self' 'nonce-testnonce'");
    expect(policy).toContain("object-src 'none'");
    expect(policy).toContain("frame-ancestors 'none'");
    expect(policy).toContain("upgrade-insecure-requests");
    expect(policy).not.toContain("ws://localhost");
  });

  it("supports React debugging and local websockets only in development", () => {
    const policy = buildContentSecurityPolicy("testnonce", true);
    expect(policy).toContain("'unsafe-eval'");
    expect(policy).toContain("ws://localhost:*");
    expect(policy).toContain("ws://127.0.0.1:*");
    expect(policy).not.toContain("upgrade-insecure-requests");
  });

  it("overwrites untrusted incoming nonce and CSP headers for Next.js rendering", () => {
    const incoming = new Headers({ "x-nonce": "attacker", "content-security-policy": "script-src *", "x-bf-locale": "nl" });
    const nonce = createCspNonce();
    const outgoing = createCspRequestHeaders(incoming, nonce);
    expect(nonce).toMatch(/^[a-f0-9]{32}$/);
    expect(createCspNonce()).not.toBe(nonce);
    expect(outgoing.get("x-nonce")).toBe(nonce);
    expect(outgoing.get("content-security-policy")).toBe(buildContentSecurityPolicy(nonce));
    expect(outgoing.get("x-bf-locale")).toBe("nl");
    expect(incoming.get("x-nonce")).toBe("attacker");
  });
});
