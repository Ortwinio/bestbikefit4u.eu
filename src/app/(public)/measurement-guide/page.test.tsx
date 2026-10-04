import { renderToStaticMarkup } from "react-dom/server";
import type { ReactNode } from "react";
import { describe, expect, it, vi } from "vitest";
import { measurementGuideCopy, measurementGuidePresentation } from "@/i18n/marketing/measurementGuide";
import MeasurementGuidePage, { generateMetadata } from "./page";

let locale: "nl" | "en" = "nl";

vi.mock("@/i18n/request", () => ({ getRequestLocale: () => Promise.resolve(locale) }));
vi.mock("@/components/analytics/TrackedCtaLink", () => ({
  TrackedCtaLink: ({
    href, children, section, conversionKey,
  }: { href: string; children: ReactNode; section: string; conversionKey?: string }) => (
    <a href={href} data-section={section} data-conversion={conversionKey}>{children}</a>
  ),
}));

describe("measurement guide route", () => {
  it.each(["nl", "en"] as const)("renders all measurements, diagrams and original destinations in %s", async (language) => {
    locale = language;
    const html = renderToStaticMarkup(await MeasurementGuidePage());
    const copy = measurementGuideCopy[locale];
    const presentation = measurementGuidePresentation[locale];
    expect(html.match(/<h1>/g)).toHaveLength(1);
    expect(html).toContain(`<h1>${copy.title}</h1>`);
    expect(html.match(/<article /g)).toHaveLength(7);
    expect(html.match(/<figure /g)).toHaveLength(7);
    expect(html.match(/<figcaption>/g)).toHaveLength(7);
    for (const [index, item] of copy.items.entries()) {
      expect(html).toContain(`id="${item.id}"`);
      expect(html).toContain(` ${item.name}</h3>`);
      expect(html).toContain(`<figcaption>${presentation.diagramLabels[index]}</figcaption>`);
      for (const step of item.steps) expect(html).toContain(step);
      for (const mistake of item.mistakes) expect(html).toContain(mistake);
    }
    for (const destination of [
      "/login", "/calculators/bike-fit", "/calculators/saddle-height",
      "/science/bike-fit-methods", "/science/calculation-engine", "/pain",
    ]) {
      expect(html).toContain(`href="/${locale}${destination}"`);
    }
    expect(html).toContain('href="#metingen"');
    expect(html).toContain('id="metingen"');
    expect(html).toContain("06-meetset.webp");
    expect(html).toContain('data-section="measurement_guide_primary_cta"');
    expect(html).toContain('data-section="measurement_guide_secondary_cta"');
    expect(html).toContain('data-conversion="pricing_signup"');
    expect(html).not.toContain("Voorbeeldgegevens");
  });

  it.each(["nl", "en"] as const)("preserves metadata and locale alternates in %s", async (language) => {
    locale = language;
    const metadata = await generateMetadata();
    expect(metadata.title).toBe(measurementGuideCopy[locale].metadata.title);
    expect(metadata.description).toBe(measurementGuideCopy[locale].metadata.description);
    expect(metadata.keywords).toEqual(measurementGuideCopy[locale].metadata.keywords);
    expect(metadata.alternates?.canonical).toBe(`https://www.bikefitboost.com/${locale}/measurement-guide`);
    expect(metadata.alternates?.languages).toMatchObject({
      nl: "https://www.bikefitboost.com/nl/measurement-guide",
      en: "https://www.bikefitboost.com/en/measurement-guide",
    });
    expect(metadata.openGraph).toMatchObject({
      title: measurementGuideCopy[locale].metadata.title,
      description: measurementGuideCopy[locale].metadata.description,
      url: metadata.alternates?.canonical,
      type: "website",
    });
  });
});
