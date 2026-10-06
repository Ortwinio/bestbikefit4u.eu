import { renderToReadableStream } from "react-dom/server";
import type { ReactNode } from "react";

async function renderHtml(node: ReactNode) {
  const stream = await renderToReadableStream(node);
  return new Response(stream).text();
}
import { describe, expect, it, vi } from "vitest";
import type { Locale } from "@/i18n/config";
import * as Why from "@/app/(public)/why-bikefit-matters/page";
import * as Setup from "@/app/(public)/fiets-afstellen/page";
import * as EnglishLanding from "@/app/(public)/bike-fitting/page";
import * as DutchLanding from "@/app/(public)/bikefitting/page";
import * as Methods from "@/app/(public)/science/bike-fit-methods/page";
import * as Engine from "@/app/(public)/science/calculation-engine/page";
import * as Stack from "@/app/(public)/science/stack-and-reach/page";
import { StackReachFigure } from "./StackReachFigure";
import { editorialImageAlt } from "@/i18n/marketing/editorialImageAlt";

let locale: Locale = "nl";
vi.mock("server-only", () => ({}));
vi.mock("@convex-dev/auth/nextjs/server", () => ({ convexAuthNextjsToken: vi.fn() }));
vi.mock("next/headers", () => ({ headers: async () => new Headers() }));
vi.mock("@/i18n/request", () => ({ getRequestLocale: async () => locale }));
vi.mock("next/navigation", () => ({
  notFound: () => {
    throw new Error("NEXT_NOT_FOUND");
  },
}));
vi.mock("@/components/analytics/MarketingEventTracker", () => ({ TrackMarketingEventOnView: () => null }));
vi.mock("@/components/analytics/TrackedCtaLink", () => ({
  TrackedCtaLink: ({ href, children }: { href: string; children: React.ReactNode }) => (
    <a href={href}>{children}</a>
  ),
}));

const pages = [
  ["/why-bikefit-matters", Why],
  ["/fiets-afstellen", Setup],
  ["/science/bike-fit-methods", Methods],
  ["/science/calculation-engine", Engine],
  ["/science/stack-and-reach", Stack],
] as const;

describe("editorial page SEO and localized content", () => {
  it.each(["nl", "en"] as const)("keeps escalation guidance outside disclosures in %s", async language => {
    locale = language;
    const landing = await renderHtml(await (language === "nl" ? DutchLanding : EnglishLanding).default());
    const visible = landing.replace(/<details\b[^>]*>[\s\S]*?<\/details>/g, "");
    expect(visible).toContain(language === "nl" ? "Minder geschikt als enige stap" : "Know the limits early");
    expect(visible).toContain('data-usability="safety"');
    const why = (await renderHtml(await Why.default())).replace(/<details\b[^>]*>[\s\S]*?<\/details>/g, "");
    expect(why).toContain(language === "nl" ? "Blijf niet doorrijden" : "Do not keep riding");
  });
  it.each(["nl", "en"] as const)("describes informative hero illustrations and leaves decorative art empty in %s", async (language) => {
    locale = language;
    const cases = [
      [Setup, editorialImageAlt[language].cockpit, "03-cockpit-afstellen.webp"],
      [Methods, editorialImageAlt[language].saddleHeight, "02-zadelhoogte-meten.webp"],
      [Engine, editorialImageAlt[language].measuringKit, "06-meetset.webp"],
      [Stack, editorialImageAlt[language].stackReach, "08-stack-en-reach.webp"],
      [language === "nl" ? DutchLanding : EnglishLanding, editorialImageAlt[language].cockpit, "03-cockpit-afstellen.webp"],
      [Why, "", "01-racefiets.webp"],
    ] as const;
    for (const [page, expectedAlt, image] of cases) {
      const html = await renderHtml(await page.default());
      const heroImage = (html.match(/<img\b[^>]*>/g) ?? []).find((tag) => tag.includes(image));
      expect(heroImage).toBeDefined();
      expect(heroImage?.match(/\balt="([^"]*)"/)?.[1].replaceAll("&#x27;", "'")).toBe(expectedAlt);
      expect(heroImage).toContain('width="720"');
      expect(heroImage).toContain('height="540"');
      expect(heroImage).toContain('sizes="(max-width: 760px) 100vw, 40vw"');
    }
  });
  it("uses Dutch science headings, metadata and setup terminology", async () => {
    locale = "nl";
    const metadata = await Engine.generateMetadata();
    expect(metadata.title).toBe("Bikefit-rekenmodel | BikeFitBoost Wetenschap");
    expect(metadata.openGraph?.title).toBe(metadata.title);
    const engine = await renderHtml(await Engine.default());
    expect(engine).toContain("Hoe het bikefit-rekenmodel werkt");
    expect(engine).toContain("Gerelateerde calculators en wetenschappelijke uitleg");
    expect(engine).not.toMatch(/berekeningsengine|science-pagina|statische output/);
    const setup = await renderHtml(await Setup.default());
    expect(setup).toContain("remgreeppositie en rotatie");
    expect(setup).toContain("Fiets afstellen is geen verzameling losse aanpassingen.");
    expect(setup).not.toContain("tweaks");
    expect(setup).toMatch(/href="#faq"[^>]*>Veelgestelde vragen<\/a>/);
    expect(setup).not.toMatch(/>FAQ</);
    expect(setup).not.toMatch(/hood-positie|op de hoods|begeleide workflow/);
    const landing = await renderHtml(await DutchLanding.default());
    expect(landing).toContain("Gratis of Pro");
    expect(landing).not.toMatch(/Free vs Pro|trade-offs|live observatie/);
    locale = "en";
    expect((await Engine.generateMetadata()).title).toBe("Bike Fit Calculation Engine | BikeFitBoost Science");
  });

  it("uses theme tokens for the stack/reach drawing and measurement labels", async () => {
    const html = await renderHtml(<StackReachFigure locale="nl" />);
    expect(html).toContain('stroke="var(--marketing-foreground)"');
    expect(html).toContain('stroke="var(--marketing-muted)"');
    expect(html).toContain('fill="var(--marketing-link)"');
    expect(html).not.toMatch(/(?:stroke|fill)="#/);
  });

  it.each(["en", "nl"] as const)("preserves canonicals and structured data in %s", async (language) => {
    locale = language;
    for (const [path, page] of pages) {
      const metadata = await page.generateMetadata();
      const canonicalPath = path === "/fiets-afstellen"
        ? (locale === "nl" ? "/bikefitting" : "/bike-fitting")
        : path;
      expect(metadata.alternates?.canonical).toBe(`https://bikefitboost.com/${locale}${canonicalPath}`);
      const html = await renderHtml(await page.default());
      expect((html.match(/<h1[ >]/g) ?? []).length).toBe(1);
      expect(html).not.toContain("Ontwerpstaat");
      expect(html).toContain(`/${locale}/calculators/`);
      if (path.startsWith("/science/")) {
        expect(html).toContain('"@type":"Article"');
        expect(html).toContain(`"mainEntityOfPage":"https://bikefitboost.com/${locale}${path}"`);
      }
      if (path === "/fiets-afstellen") {
        expect(html).toContain('"@type":"FAQPage"');
        expect(html).toContain('"@type":"BreadcrumbList"');
        expect(html).toContain('"@type":"Article"');
      }
    }
  });

  it.each([
    ["en", "/bike-fitting", EnglishLanding],
    ["nl", "/bikefitting", DutchLanding],
  ] as const)("keeps the %s-only landing and FAQ schema", async (language, path, page) => {
    locale = language;
    const metadata = await page.generateMetadata();
    expect(metadata.alternates?.canonical).toBe(`https://bikefitboost.com/${locale}${path}`);
    expect(metadata.alternates?.languages).toEqual({
      en: "https://bikefitboost.com/en/bike-fitting",
      nl: "https://bikefitboost.com/nl/bikefitting",
      "x-default": "https://bikefitboost.com/en/bike-fitting",
    });
    const html = await renderHtml(await page.default());
    expect(html).toContain('"@type":"FAQPage"');
    expect(html).toContain('"@type":"BreadcrumbList"');
    expect((html.match(/<details/g) ?? []).length).toBeGreaterThan(3);
    expect(html).not.toMatch(/<details[^>]*\sopen[\s=>]/);
    const schemas = [...html.matchAll(/<script[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/g)]
      .flatMap(match => JSON.parse(match[1]));
    const faqSchema = schemas.find(schema => schema["@type"] === "FAQPage");
    expect(faqSchema.mainEntity).toHaveLength(3);
    locale = language === "en" ? "nl" : "en";
    await expect(page.default()).rejects.toThrow("NEXT_NOT_FOUND");
    expect((await page.generateMetadata()).robots).toEqual({ index: false, follow: false });
  });
});
