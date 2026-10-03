import { describe, expect, it } from "vitest";
import {
  SEO_ROBOTS_DISALLOW_PATHS,
  SEO_SITEMAP_EXCLUDED_PATHS,
  classifySeoPath,
} from "./routePolicy";

describe("seo route policy", () => {
  it.each(["", "/en", "/nl"])("registers tools and email preferences for %s", (localePrefix) => {
    const toolsPath = `${localePrefix}/tools`;
    const preferencesPath = `${localePrefix}/email-preferences`;
    expect(classifySeoPath(toolsPath)).toBe("private_app");
    expect(classifySeoPath(`${toolsPath}/ftp-wkg`)).toBe("private_app");
    expect(SEO_ROBOTS_DISALLOW_PATHS).toContain(toolsPath);
    expect(SEO_SITEMAP_EXCLUDED_PATHS).toContain(toolsPath);
    expect(classifySeoPath(preferencesPath)).toBe("non_indexable_public_utility");
    expect(SEO_ROBOTS_DISALLOW_PATHS).not.toContain(preferencesPath);
    expect(classifySeoPath(`${localePrefix}/toolshed`)).toBeNull();
  });

  it("classifies public and private route families", () => {
    expect(classifySeoPath("/guides")).toBe("indexable_public");
    expect(classifySeoPath("/nl/guides")).toBe("indexable_public");
    expect(classifySeoPath("/bike-fitting")).toBe("indexable_public");
    expect(classifySeoPath("/nl/fiets-afstellen")).toBe("non_indexable_public_utility");
    expect(classifySeoPath("/dashboard")).toBe("private_app");
    expect(classifySeoPath("/en/dashboard")).toBe("private_app");
    expect(classifySeoPath("/en/saddle-selector")).toBe("private_app");
    expect(classifySeoPath("/login")).toBe("auth");
    expect(classifySeoPath("/api/reports")).toBe("api_or_system");
    expect(classifySeoPath("/robots.txt")).toBe("api_or_system");
    expect(classifySeoPath("/sitemap.xml")).toBe("api_or_system");
    expect(classifySeoPath("/science/calculation-engine")).toBe(
      "non_indexable_public_utility"
    );
  });

  it("expands locale-aware robots disallow paths for private and operational areas", () => {
    expect(SEO_ROBOTS_DISALLOW_PATHS).not.toContain("/login");
    expect(SEO_ROBOTS_DISALLOW_PATHS).not.toContain("/en/login");
    expect(SEO_ROBOTS_DISALLOW_PATHS).not.toContain("/nl/login");
    expect(SEO_ROBOTS_DISALLOW_PATHS).toContain("/dashboard");
    expect(SEO_ROBOTS_DISALLOW_PATHS).toContain("/en/dashboard");
    expect(SEO_ROBOTS_DISALLOW_PATHS).toContain("/api");
    expect(SEO_ROBOTS_DISALLOW_PATHS).toContain("/en/saddle-selector");
    expect(SEO_ROBOTS_DISALLOW_PATHS).not.toContain("/sitemap.xml");
    expect(SEO_ROBOTS_DISALLOW_PATHS).not.toContain("/robots.txt");
    expect(SEO_ROBOTS_DISALLOW_PATHS).not.toContain("/_next");
  });

  it("keeps crawler utility and system paths excluded from sitemap URLs", () => {
    expect(SEO_SITEMAP_EXCLUDED_PATHS).toContain("/api");
    expect(SEO_SITEMAP_EXCLUDED_PATHS).toContain("/_next");
    expect(SEO_SITEMAP_EXCLUDED_PATHS).toContain("/robots.txt");
    expect(SEO_SITEMAP_EXCLUDED_PATHS).toContain("/sitemap.xml");
    expect(SEO_SITEMAP_EXCLUDED_PATHS).toContain("/login");
    expect(SEO_SITEMAP_EXCLUDED_PATHS).toContain("/en/login");
    expect(SEO_SITEMAP_EXCLUDED_PATHS).toContain("/dashboard");
    expect(SEO_SITEMAP_EXCLUDED_PATHS).toContain("/en/dashboard");
  });
});
