import { afterEach, describe, expect, it, vi } from "vitest";
import {
  isAllowedLocalhostHost,
  isProductionEnvironment,
  isLocalDevAuthAllowed,
  pickPreferredLocalDevUser,
  normalizeLocalDevEmail,
  normalizeLocalDevName,
  normalizeLocalDevRole,
} from "./authLocalDev";

describe("authLocalDev helpers", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("accepts localhost hostnames only", () => {
    expect(isAllowedLocalhostHost("localhost")).toBe(true);
    expect(isAllowedLocalhostHost("127.0.0.1")).toBe(true);
    expect(isAllowedLocalhostHost("::1")).toBe(true);
    expect(isAllowedLocalhostHost("192.168.1.20")).toBe(false);
    expect(isAllowedLocalhostHost("bikefitboost.com")).toBe(false);
  });

  it("normalizes email and name", () => {
    expect(normalizeLocalDevEmail(" Admin@Example.com ")).toBe("admin@example.com");
    expect(normalizeLocalDevName("  ", "admin@example.com")).toBe("admin");
    expect(normalizeLocalDevName("Local Rider", "admin@example.com")).toBe("Local Rider");
  });

  it("only allows known admin roles", () => {
    expect(normalizeLocalDevRole("super_admin")).toBe("super_admin");
    expect(() => normalizeLocalDevRole("user")).toThrow("Invalid LOCALHOST_DEV_LOGIN_ROLE.");
  });

  it("prefers an existing admin user when duplicate emails exist", () => {
    expect(
      pickPreferredLocalDevUser([
        { _id: "u1", createdAt: 10, lastLoginAt: 10 },
        { _id: "u2", adminRole: "support_admin", createdAt: 5, lastLoginAt: 5 },
        { _id: "u3", createdAt: 20, lastLoginAt: 20 },
      ])
    ).toMatchObject({ _id: "u2" });
  });

  it("otherwise prefers the most recently active duplicate user", () => {
    expect(
      pickPreferredLocalDevUser([
        { _id: "u1", createdAt: 10, lastLoginAt: 10 },
        { _id: "u2", createdAt: 20, lastLoginAt: 30 },
        { _id: "u3", createdAt: 40, lastLoginAt: 25 },
      ])
    ).toMatchObject({ _id: "u2" });
  });

  it("detects production by env", () => {
    vi.stubEnv("NODE_ENV", "development");
    vi.stubEnv("VERCEL_ENV", "preview");
    expect(isProductionEnvironment()).toBe(false);

    vi.stubEnv("NODE_ENV", "production");
    expect(isProductionEnvironment()).toBe(true);

    vi.stubEnv("NODE_ENV", "development");
    vi.stubEnv("VERCEL_ENV", "production");
    expect(isProductionEnvironment()).toBe(true);
  });
});


describe("local dev backend authorization", () => {
  afterEach(() => vi.unstubAllEnvs());

  it.each([undefined, "", "https://bikefitboost.com"])(
    "cannot use a public localhost override to authorize backend site %s", (siteUrl) => {
      vi.stubEnv("NODE_ENV", "development");
      vi.stubEnv("VERCEL_ENV", undefined);
      vi.stubEnv("CONVEX_DEPLOYMENT", undefined);
      vi.stubEnv("NEXT_PUBLIC_SITE_URL", "http://localhost:3000");
      vi.stubEnv("SITE_URL", siteUrl);
      expect(isLocalDevAuthAllowed()).toBe(false);
    },
  );

  it("requires a local SITE_URL and rejects production deployments", () => {
    vi.stubEnv("NODE_ENV", "development");
    vi.stubEnv("VERCEL_ENV", "development");
    vi.stubEnv("CONVEX_DEPLOYMENT", "dev:test");
    vi.stubEnv("NEXT_PUBLIC_SITE_URL", "");
    vi.stubEnv("SITE_URL", "http://localhost:3000");
    expect(isLocalDevAuthAllowed()).toBe(true);
    vi.stubEnv("SITE_URL", "https://bikefitboost.com");
    expect(isLocalDevAuthAllowed()).toBe(false);
    vi.stubEnv("SITE_URL", "http://localhost:3000");
    vi.stubEnv("CONVEX_DEPLOYMENT", "prod:test");
    expect(isLocalDevAuthAllowed()).toBe(false);
    vi.stubEnv("CONVEX_DEPLOYMENT", "dev:test");
    vi.stubEnv("NODE_ENV", "production");
    expect(isLocalDevAuthAllowed()).toBe(false);
  });

  it.each(["", "not-a-url", "https://user:pass@localhost:3000", "ftp://localhost"])("does not enable local auth with unsafe origin %s", (origin) => {
    vi.stubEnv("NODE_ENV", "development");
    vi.stubEnv("VERCEL_ENV", "development");
    vi.stubEnv("CONVEX_DEPLOYMENT", "dev:test");
    vi.stubEnv("NEXT_PUBLIC_SITE_URL", "");
    vi.stubEnv("SITE_URL", origin);
    expect(isLocalDevAuthAllowed()).toBe(false);
  });
});
