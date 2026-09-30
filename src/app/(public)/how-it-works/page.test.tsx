import { renderToStaticMarkup } from "react-dom/server";
import type { ReactNode } from "react";
import { describe, expect, it, vi } from "vitest";
import { howItWorksCopy, howItWorksPresentation } from "@/i18n/marketing/howItWorks";
import HowItWorksPage, { generateMetadata } from "./page";

let locale: "en" | "nl" = "nl";

vi.mock("@/i18n/request", () => ({ getRequestLocale: () => Promise.resolve(locale) }));
vi.mock("@/components/analytics/MarketingEventTracker", () => ({ TrackMarketingEventOnView: () => null }));
vi.mock("@/components/seo/JsonLd", () => ({
  JsonLd: ({ schema }: { schema: object | object[] }) => <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />,
}));
vi.mock("@/components/analytics/TrackedCtaLink", () => ({
  TrackedCtaLink: ({ href, children }: { href: string; children: ReactNode }) => <a href={href}>{children}</a>,
}));

describe("how it works marketing page", () => {
  it.each(["nl", "en"] as const)("preserves localized content, routes and HowTo schema in %s", async (language) => {
    locale = language;
    const html = renderToStaticMarkup(await HowItWorksPage());
    expect(html.match(/<h1>/g)).toHaveLength(1);
    expect(html).toContain(howItWorksCopy[locale].title);
    expect(html).toContain(howItWorksPresentation[locale].processTitle);
    expect(html).toContain(`href="/${locale}/login"`);
    expect(html).toContain(`href="/${locale}/calculators/bike-fit"`);
    expect(html).toContain(`href="/${locale}/measurement-guide"`);
    expect(html).toContain('"@type":"HowTo"');
    expect(html).toContain("01-racefiets.webp");
    expect(html).toContain("06-meetset.webp");
    const metadata = await generateMetadata();
    expect(metadata.title).toBe(howItWorksCopy[locale].metadata.title);
    expect(metadata.alternates?.canonical).toContain(`/${locale}/how-it-works`);
  });

  it("keeps both presentation dictionaries aligned", () => {
    expect(Object.keys(howItWorksPresentation.nl).sort()).toEqual(Object.keys(howItWorksPresentation.en).sort());
    expect(howItWorksPresentation.nl.links.map(({ href }) => href)).toEqual(howItWorksPresentation.en.links.map(({ href }) => href));
    expect(howItWorksCopy.nl.steps).toHaveLength(3);
    expect(howItWorksCopy.en.steps).toHaveLength(3);
  });
});
