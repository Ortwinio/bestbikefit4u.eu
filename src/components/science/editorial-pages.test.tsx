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
  it("uses Dutch science headings, metadata and setup terminology", async () => {
    locale = "nl";
    const metadata = await Engine.generateMetadata();
    expect(metadata.title).toBe("Bikefit-rekenmodel | BestBikeFit4U Wetenschap");
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
    expect((await Engine.generateMetadata()).title).toBe("Bike Fit Calculation Engine | BestBikeFit4U Science");
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
      expect(metadata.alternates?.canonical).toBe(`https://bestbikefit4u.eu/${locale}${path}`);
      const html = await renderHtml(await page.default());
      expect((html.match(/<h1[ >]/g) ?? []).length).toBe(1);
      expect(html).not.toContain("Ontwerpstaat");
      expect(html).toContain(`/${locale}/calculators/`);
      if (path.startsWith("/science/")) {
        expect(html).toContain('"@type":"Article"');
        expect(html).toContain(`"mainEntityOfPage":"https://bestbikefit4u.eu/${locale}${path}"`);
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
    expect(metadata.alternates?.canonical).toBe(`https://bestbikefit4u.eu/${locale}${path}`);
    const html = await renderHtml(await page.default());
    expect(html).toContain('"@type":"FAQPage"');
    expect(html).toContain('"@type":"BreadcrumbList"');
    expect((html.match(/<details/g) ?? []).length).toBe(3);
    locale = language === "en" ? "nl" : "en";
    await expect(page.default()).rejects.toThrow("NEXT_NOT_FOUND");
    expect((await page.generateMetadata()).robots).toEqual({ index: false, follow: false });
  });
});
