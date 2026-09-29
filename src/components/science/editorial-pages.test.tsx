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

let locale: Locale = "nl";
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
