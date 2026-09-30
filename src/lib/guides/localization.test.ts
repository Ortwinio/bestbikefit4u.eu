import { describe, expect, it, vi } from "vitest";
vi.mock("server-only", () => ({}));
vi.mock("@convex-dev/auth/nextjs/server", () => ({ convexAuthNextjsToken: vi.fn() }));
vi.mock("convex/nextjs", () => ({ fetchQuery: vi.fn() }));
import { getGuideBacklog } from "./backlog";
import { getGuideLinkLabel } from "./content";
import { getDutchGuideTitle } from "@/i18n/marketing/guideTitles";
import { resolveClosingCtaCopy } from "./cta-resolver";
import { getGuidesMessages } from "@/i18n/marketing/guides";

describe("Dutch guide titles", () => {
  it.each(["TOFU", "MOFU", "BOFU"])("localizes the %s closing CTA and leaves English unchanged", (funnel) => {
    expect(resolveClosingCtaCopy(funnel, "ride types", "nl").ctaLabel).toBe("Start gratis bikefit");
    expect(resolveClosingCtaCopy(funnel, "ride types", "en").ctaLabel).toBe("Start Free Fit");
    expect(getGuidesMessages("nl").startFit).toBe("Start gratis bikefit");
  });

  it.each([
    ["bike-fitting-for-lower-back-pain", "Bikefitting bij lage rugklachten"],
    ["bike-fit-for-tall-riders", "Bikefit voor lange rijders"],
    ["saddle-height-guide", "Zadelhoogtegids"],
    ["handlebar-width-and-hood-position-guide", "Gids voor stuurbreedte en de positie van je remgrepen"],
  ])("resolves %s without English slug title-casing", (slug, title) => {
    expect(getGuideLinkLabel(`/guides/${slug}`, "nl")).toBe(title);
    expect(getGuideLinkLabel(`/nl/guides/${slug}`, "nl")).toBe(title);
  });

  it("uses the same dictionary for every guide hub card, heading and fallback metadata title", () => {
    for (const entry of getGuideBacklog("nl")) {
      const title = getDutchGuideTitle(entry.slug);
      expect(title, entry.slug).toBeTruthy();
      expect(entry.pageTitle).toBe(title);
      expect(entry.h1).toBe(title);
      expect(entry.metaTitle).toBe(`${title} | BestBikeFit4U`);
      if (entry.path.startsWith("/guides/")) expect(getGuideLinkLabel(entry.path, "nl")).toBe(title);
    }
  });

  it("does not expose an English slug for an unknown Dutch guide", () => {
    expect(getGuideLinkLabel("/guides/a-new-guide", "nl")).toBe("Gids");
  });

  it("keeps the existing English link labels and metadata", () => {
    expect(getGuideLinkLabel("/guides/saddle-height-guide", "en")).toBe("Saddle Height Guide");
    expect(getGuideLinkLabel("/guides/bike-fitting-for-lower-back-pain", "en"))
      .toBe("Bike Fitting For Lower Back Pain");
    const entry = getGuideBacklog("en").find((guide) => guide.slug === "saddle-height-guide");
    expect(entry?.pageTitle).toBe("Saddle Height Guide");
    expect(entry?.pageBrief).toContain("saddle height");
  });

  it("uses Dutch summary text for metadata instead of mixed-language setup and power terms", () => {
    const entries = getGuideBacklog("nl");
    expect(entries.find((entry) => entry.slug === "setup-parameters")?.pageBrief)
      .toBe("Begrijp de aanbevolen maten van BestBikeFit4U en wat elk getal voor je fietsafstelling betekent.");
    expect(entries.find((entry) => entry.slug === "power-to-speed-guide")?.pageBrief)
      .toBe("Lees hoe vermogen, aerodynamica, gewicht, banden, helling en weer je snelheid beïnvloeden.");
  });
});
