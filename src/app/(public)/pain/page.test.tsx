import { renderToStaticMarkup } from "react-dom/server";
import type { ReactNode } from "react";
import { describe, expect, it, vi } from "vitest";
import { PAIN_PAGES, PAIN_PAGE_SLUGS, getPainPageCopy } from "@/content/painPages";
import { painPresentation } from "@/i18n/marketing/pain";
import PainIndexPage, { generateMetadata as indexMetadata } from "./page";
import PainPage, { generateMetadata, generateStaticParams } from "./[slug]/page";

let locale: "nl" | "en" = "nl";

vi.mock("@/i18n/request", () => ({ getRequestLocale: () => Promise.resolve(locale) }));
vi.mock("next/navigation", () => ({ notFound: () => { throw new Error("NEXT_NOT_FOUND"); } }));
vi.mock("@/components/analytics/MarketingEventTracker", () => ({ TrackMarketingEventOnView: () => null }));
vi.mock("@/components/seo/JsonLd", () => ({
  JsonLd: ({ schema }: { schema: object[] }) => (
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
  ),
}));
vi.mock("@/components/analytics/TrackedCtaLink", () => ({
  TrackedCtaLink: ({ href, children }: { href: string; children: ReactNode }) => <a href={href}>{children}</a>,
}));

describe("pain marketing routes", () => {
  it.each(["nl", "en"] as const)("keeps the index localized in %s", async (language) => {
    locale = language;
    const html = renderToStaticMarkup(await PainIndexPage());
    expect(html.match(/<h1>/g)).toHaveLength(1);
    expect(html).toContain(painPresentation[locale].title);
    for (const slug of PAIN_PAGE_SLUGS) expect(html).toContain(`href="/${locale}/pain/${slug}"`);
    expect(html).toContain(`href="/${locale}/calculators/bike-fit"`);
    expect(html).toContain(`href="/${locale}/case-study"`);
    expect(html).not.toContain("Voorbeeldgegevens");
    const metadata = await indexMetadata();
    expect(metadata.title).toBe(painPresentation[locale].metadataTitle);
    expect(metadata.alternates?.canonical).toContain(`/${locale}/pain`);
  });

  for (const language of ["nl", "en"] as const) {
    it.each(PAIN_PAGES)(`preserves $slug content and schemas in ${language}`, async (page) => {
      locale = language;
      const params = Promise.resolve({ slug: page.slug });
      const copy = getPainPageCopy(page, locale);
      const html = renderToStaticMarkup(await PainPage({ params }));
      expect(html.match(/<h1>/g)).toHaveLength(1);
      expect(html).toContain(copy.title);
      for (const value of [...copy.symptomBullets, ...copy.fitBullets, ...copy.riderChecklist]) {
        expect(html).toContain(renderToStaticMarkup(<p>{value}</p>).slice(3, -4));
      }
      expect(html).toContain(renderToStaticMarkup(<p>{painPresentation[locale].support}</p>).slice(3, -4));
      expect(html.match(/<details/g)).toHaveLength(copy.faqs.length);
      for (const faq of copy.faqs) {
        expect(html).toContain(renderToStaticMarkup(<p>{faq.a}</p>).slice(3, -4));
      }
      const schemas = [...html.matchAll(/<script type="application\/ld\+json">(.*?)<\/script>/g)]
        .flatMap((match) => JSON.parse(match[1]));
      expect(schemas.map((schema) => schema["@type"])).toEqual(["Article", "FAQPage", "BreadcrumbList"]);
      expect(schemas[0].headline).toBe(copy.title);
      expect(schemas[0].description).toBe(copy.intro);
      expect(schemas[1].mainEntity.map((entity: { name: string }) => entity.name)).toEqual(copy.faqs.map((faq) => faq.q));
      const metadata = await generateMetadata({ params });
      expect(metadata.title).toBe(copy.seoTitle);
      expect(metadata.description).toBe(copy.seoDescription);
      expect(metadata.keywords).toEqual(copy.keywords);
      expect(metadata.alternates?.canonical).toContain(`/${locale}/pain/${page.slug}`);
      expect(metadata.openGraph).toMatchObject({ type: "article" });
    });
  }

  it("retains all static slugs and handles unknown slugs as not found", async () => {
    expect(generateStaticParams()).toEqual(PAIN_PAGE_SLUGS.map((slug) => ({ slug })));
    const params = Promise.resolve({ slug: "not-a-pain-page" });
    await expect(PainPage({ params })).rejects.toThrow("NEXT_NOT_FOUND");
    expect((await generateMetadata({ params })).robots).toEqual({ index: false, follow: false });
  });

  it("keeps presentation dictionary keys, pain areas, and tools aligned", () => {
    expect(Object.keys(painPresentation.nl)).toEqual(Object.keys(painPresentation.en));
    expect(Object.keys(painPresentation.nl.labels)).toEqual(Object.keys(painPresentation.en.labels));
    expect(painPresentation.nl.tools.map((tool) => tool.href)).toEqual(painPresentation.en.tools.map((tool) => tool.href));
  });
});
