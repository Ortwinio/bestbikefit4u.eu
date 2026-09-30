import { afterEach, describe, expect, it, vi } from "vitest";
import { classifySeoPath, SEO_SITEMAP_EXCLUDED_PATHS } from "@/lib/seo/routePolicy";
vi.mock("next/navigation", () => ({ notFound: () => { throw new Error("NOT_FOUND"); } }));
vi.mock("./Playground", () => ({ DesignSystemPlayground: () => null }));
import Page, { metadata } from "./page";

afterEach(() => vi.unstubAllEnvs());

describe("design system visibility", () => {
  it("always blocks Vercel production, even with the preview flag", () => {
    vi.stubEnv("VERCEL_ENV", "production");
    vi.stubEnv("DESIGN_SYSTEM_PREVIEW", "true");
    expect(() => Page()).toThrow("NOT_FOUND");
  });
  it("blocks production builds by default", () => {
    vi.stubEnv("VERCEL_ENV", "preview");
    vi.stubEnv("NODE_ENV", "production");
    vi.stubEnv("DESIGN_SYSTEM_PREVIEW", "");
    expect(() => Page()).toThrow("NOT_FOUND");
  });
  it("permits explicit non-production previews and development", () => {
    vi.stubEnv("VERCEL_ENV", "preview");
    vi.stubEnv("NODE_ENV", "production");
    vi.stubEnv("DESIGN_SYSTEM_PREVIEW", "true");
    expect(Page()).toBeTruthy();
    vi.stubEnv("NODE_ENV", "development");
    vi.stubEnv("DESIGN_SYSTEM_PREVIEW", "");
    expect(Page()).toBeTruthy();
  });
  it("is noindex and excluded from localized sitemaps", () => {
    expect(metadata.robots).toEqual({index:false,follow:false});
    expect(classifySeoPath("/nl/design-system")).toBe("api_or_system");
    expect(SEO_SITEMAP_EXCLUDED_PATHS).toContain("/nl/design-system");
    expect(SEO_SITEMAP_EXCLUDED_PATHS).toContain("/en/design-system");
  });
});
