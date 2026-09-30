/* @vitest-environment jsdom */
import type { ReactNode } from "react";
import { cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import EnglishPage, { generateMetadata as englishMetadata, generateStaticParams as englishParams } from "./page";
import DutchPage, {
  generateMetadata as dutchMetadata,
  generateStaticParams as dutchParams,
} from "../../bandenspanning/[slug]/page";
import { BRAND } from "@/config/brand";
import { pressureLandingMessages } from "@/i18n/marketing/pressureLanding";
import { calculateBasicPressure } from "@/lib/pressure-engine";
import {
  BIKE_TYPE_LABELS,
  BIKE_TYPE_DEFAULTS,
  EN_BIKE_TYPES,
  WEIGHT_STEPS,
  buildDutchPressureSlug,
  buildEnglishPressureSlug,
  buildPressureAlternates,
  buildPressureInput,
} from "@/lib/seo/programmatic/tirePressure";
import { getRelatedLinks } from "@/lib/seo/relatedLinks";

vi.mock("next/navigation", () => ({
  notFound: () => {
    throw new Error("NEXT_NOT_FOUND");
  },
}));
vi.mock("@/components/seo/JsonLd", () => ({
  JsonLd: ({ schema }: { schema: object }) => <script type="application/ld+json">{JSON.stringify(schema)}</script>,
}));
vi.mock("@/components/analytics/TrackedCtaLink", () => ({
  TrackedCtaLink: ({
    href,
    children,
    section,
    ctaLabel,
    pagePath,
    locale,
    className,
  }: {
    href: string;
    children: ReactNode;
    section: string;
    ctaLabel: string;
    pagePath: string;
    locale: string;
    className: string;
  }) => (
    <a
      href={href}
      data-section={section}
      data-label={ctaLabel}
      data-page={pagePath}
      data-locale={locale}
      className={className}
    >
      {children}
    </a>
  ),
}));
vi.mock("next/image", () => ({
  default: ({ src, alt }: { src: string; alt: string }) => (
    // Native image isolates content testing from Next's optimizer.
    // eslint-disable-next-line @next/next/no-img-element
    <img src={src} alt={alt} />
  ),
}));
afterEach(cleanup);

for (const locale of ["en", "nl"] as const) {
  const Page = locale === "en" ? EnglishPage : DutchPage;
  const metadata = locale === "en" ? englishMetadata : dutchMetadata;
  const staticParams = locale === "en" ? englishParams : dutchParams;
  const buildSlug = locale === "en" ? buildEnglishPressureSlug : buildDutchPressureSlug;
  const route = locale === "en" ? "tire-pressure" : "bandenspanning";
  const calculator = locale === "en" ? "tire-pressure-calculator" : "bandenspanning-calculator";
  const copy = pressureLandingMessages[locale];
  describe(`${locale} pressure landing routes`, () => {
    it("retains the 30 exact generated paths and ordering", () => {
      expect(staticParams()).toEqual(
        WEIGHT_STEPS.flatMap((weight) => EN_BIKE_TYPES.map((bikeType) => ({ slug: buildSlug(weight, bikeType) }))),
      );
      expect(staticParams()).toHaveLength(30);
      expect(staticParams()[0].slug).toBe(locale === "en" ? "55kg-road-bike" : "55kg-racefiets");
      expect(staticParams().at(-1)?.slug).toBe(locale === "en" ? "100kg-mountain-bike" : "100kg-mountainbike");
    });

    for (const weight of WEIGHT_STEPS)
      for (const bikeType of EN_BIKE_TYPES) {
        const slug = buildSlug(weight, bikeType);
        it(`${slug} keeps actual engine values, metadata, schema and entrypoints`, async () => {
          const label = BIKE_TYPE_LABELS[bikeType][locale];
          const params = Promise.resolve({ slug });
          const result = await metadata({ params });
          const pagePath = `/${locale}/${route}/${slug}`;
          const pageUrl = new URL(pagePath, BRAND.siteUrl).toString();
          const description =
            locale === "en"
              ? `Recommended front and rear tire pressure for a ${weight} kg ${label} rider, ` +
                "with bar and PSI values plus a quick tube-type comparison."
              : `Aanbevolen voor- en achterdruk voor een rijder van ${weight} kg op een ${label}, ` +
                "inclusief bar, PSI en vergelijking tussen tubeless en binnenband.";
          expect(result.title).toBe(`${copy.title(weight, label)} | BestBikeFit4U`);
          expect(result.description).toBe(description);
          expect(result.alternates).toEqual(buildPressureAlternates(weight, bikeType, locale));
          expect(result.alternates?.canonical).toBe(pageUrl);
          expect(result.openGraph).toEqual({ title: result.title, description, type: "website", url: pageUrl });
          expect(result.keywords).toEqual(
            locale === "en"
              ? [
                  `tire pressure ${weight}kg ${label}`,
                  `${label} tire pressure ${weight}kg`,
                  `${label} cyclist tire pressure`,
                ]
              : [
                  `bandenspanning ${weight}kg ${label}`,
                  `${label} bandenspanning ${weight}kg`,
                  `${label} bandendruk advies`,
                ],
          );
          const { container } = render(await Page({ params }));
          expect(screen.getByRole("heading", { level: 1, name: copy.title(weight, label) })).toBeTruthy();
          expect(screen.getByText(copy.intro(weight, label))).toBeTruthy();
          expect(screen.getByText(copy.bikeAssumption)).toBeTruthy();
          expect(screen.getByText(copy.width).closest("div")?.textContent).toContain(
            String(BIKE_TYPE_DEFAULTS[bikeType].widthFrontMm),
          );
          const table = screen.getByRole("table", { name: copy.results });
          const rows = within(table).getAllByRole("row").slice(1);
          for (const [index, tubeType] of (["tubeless", "inner_tube"] as const).entries()) {
            const output = calculateBasicPressure(buildPressureInput(weight, bikeType, tubeType));
            const cells = within(rows[index]).getAllByRole("cell");
            const format = (value: number) => new Intl.NumberFormat(locale, { maximumFractionDigits: 2 }).format(value);
            expect(cells[0].textContent).toBe(`${format(output.frontBar)}bar${format(output.frontPsi)} PSI`);
            expect(cells[1].textContent).toBe(`${format(output.rearBar)}bar${format(output.rearPsi)} PSI`);
          }
          const schema = JSON.parse(container.querySelector('script[type="application/ld+json"]')!.textContent!);
          expect(schema.map((entry: { "@type": string }) => entry["@type"])).toEqual([
            "BreadcrumbList",
            "FAQPage",
            "WebApplication",
          ]);
          expect(schema[0].itemListElement.map((entry: { item: string }) => entry.item)).toEqual([
            new URL(`/${locale}`, BRAND.siteUrl).toString(),
            new URL(`/${locale}/${calculator}`, BRAND.siteUrl).toString(),
            pageUrl,
          ]);
          expect(schema[2]).toMatchObject({
            name: copy.title(weight, label),
            url: pageUrl,
            description: copy.schemaDescription(weight, label),
            applicationCategory: "SportsApplication",
          });
          expect(schema[1].mainEntity).toHaveLength(2);
          for (const faq of schema[1].mainEntity) {
            expect(screen.getByText(faq.name).tagName).toBe("SUMMARY");
            expect(screen.getByText(faq.acceptedAnswer.text)).toBeTruthy();
          }
          const cta = screen.getByRole("link", { name: copy.cta });
          expect(cta.getAttribute("href")).toBe(`/${locale}/${calculator}`);
          expect(cta.getAttribute("data-section")).toBe("programmatic_pressure_primary_cta");
          expect(cta.getAttribute("data-page")).toBe(pagePath);
          expect(screen.getByRole("link", { name: copy.guideCta(label) }).getAttribute("href")).toBe(
            `/${locale}${BIKE_TYPE_LABELS[bikeType].guideHref}`,
          );
          for (const link of getRelatedLinks("tire-pressure", locale)) {
            expect(screen.getByRole("link", { name: link.label }).getAttribute("href")).toBe(`/${locale}${link.href}`);
          }
        });
      }

    it("keeps valid numeric slugs outside the static list and accessible FAQ disclosure", async () => {
      const slug = buildSlug(72, "road-bike");
      const params = Promise.resolve({ slug });
      expect((await metadata({ params })).title).toContain("72kg");
      render(await Page({ params }));
      const summary = screen.getByText(copy.faqTubes);
      expect(summary.closest("details")?.open).toBe(false);
      fireEvent.click(summary);
      expect(summary.closest("details")?.open).toBe(true);
    });

    for (const slug of [
      "not-a-pressure-page",
      "75-road-bike",
      "75kg-unknown",
      "-75kg-road-bike",
      locale === "en" ? "75kg-racefiets" : "75kg-road-bike",
    ]) {
      it(`preserves invalid slug ${slug} noindex and notFound`, async () => {
        const params = Promise.resolve({ slug });
        expect(await metadata({ params })).toEqual({
          title: locale === "en" ? "Not found" : "Niet gevonden",
          robots: { index: false, follow: false },
        });
        await expect(Page({ params })).rejects.toThrow("NEXT_NOT_FOUND");
      });
    }
  });
}
