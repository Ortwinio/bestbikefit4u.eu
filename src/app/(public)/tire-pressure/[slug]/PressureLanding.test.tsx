/* @vitest-environment jsdom */
import { cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import EnglishPage, { generateMetadata as englishMetadata, generateStaticParams as englishParams } from "./page";
import DutchPage, {
  generateMetadata as dutchMetadata, generateStaticParams as dutchParams,
} from "../../bandenspanning/[slug]/page";
import DutchRoadPage, { generateMetadata as roadMetadata } from "../../bandenspanning/racefiets/page";
import DutchGravelPage, { generateMetadata as gravelMetadata } from "../../bandenspanning/gravelbike/page";
import RetiredMtbAlias from "../../bandenspanning/mtb/page";
import { pressureBikeLandingMessages } from "@/i18n/marketing/pressureBikeLanding";
import { calculateBasicPressure } from "@/lib/pressure-engine";
import {
  BIKE_TYPE_LABELS, EN_BIKE_TYPES, NL_TO_EN, WEIGHT_STEPS,
  buildPressureBikeAlternates, buildPressureInput,
} from "@/lib/seo/programmatic/tirePressure";

const request = vi.hoisted(() => ({ locale: "en" as "en" | "nl" }));
vi.mock("@/i18n/request", () => ({ getRequestLocale: async () => request.locale }));
vi.mock("next/navigation", () => ({ notFound: () => { throw new Error("NEXT_NOT_FOUND"); } }));
vi.mock("@/components/seo/JsonLd", () => ({
  JsonLd: ({ schema }: { schema: object }) => <script type="application/ld+json">{JSON.stringify(schema)}</script>,
}));
vi.mock("next/image", () => ({
  default: ({ src, alt }: { src: string; alt: string }) => (
    // The optimizer is checked by the browser audit.
    // eslint-disable-next-line @next/next/no-img-element
    <img src={src} alt={alt} />
  ),
}));
beforeEach(() => { request.locale = "en"; });
afterEach(cleanup);

it("generates only three English bike slugs and the one Dutch dynamic slug", () => {
  expect(englishParams()).toEqual(EN_BIKE_TYPES.map(slug => ({ slug })));
  expect(englishParams()).toHaveLength(3);
  expect(dutchParams()).toEqual([{ slug: "mountainbike" }]);
});

for (const locale of ["en", "nl"] as const) {
  const Page = locale === "en" ? EnglishPage : DutchPage;
  const metadata = locale === "en" ? englishMetadata : dutchMetadata;
  const copy = pressureBikeLandingMessages[locale];
  describe(`${locale} canonical pressure bike pages`, () => {
    for (const bikeType of EN_BIKE_TYPES) {
      it(`${bikeType} renders every weight with actual engine results and reciprocal metadata`, async () => {
        request.locale = locale;
        const slug = locale === "en" ? bikeType : Object.keys(NL_TO_EN)
          .find(key => NL_TO_EN[key as keyof typeof NL_TO_EN] === bikeType)!;
        const params = Promise.resolve({ slug });
        const result = await metadata({ params });
        const alternates = buildPressureBikeAlternates(bikeType, locale);
        expect(result.alternates).toEqual(alternates);
        expect(result.title).toBe(copy.title(BIKE_TYPE_LABELS[bikeType][locale]));
        expect(result.description).toBe(copy.description(BIKE_TYPE_LABELS[bikeType][locale]));
        expect(result.openGraph).toMatchObject({ title: result.title, description: result.description,
          url: alternates.canonical });
        const otherLocale = locale === "nl" ? "en" : "nl";
        request.locale = otherLocale;
        const paired = await englishMetadata({ params: Promise.resolve({ slug: bikeType }) });
        expect(paired.alternates?.languages).toEqual(alternates.languages);
        expect(paired.alternates?.canonical).toBe(alternates.languages[otherLocale]);
        request.locale = locale;
        const { container } = render(await Page({ params }));
        expect(screen.getByRole("heading", { level: 1 }).textContent).toBe(result.title);
        for (const sentence of new Intl.Segmenter(locale, { granularity: "sentence" }).segment(copy.intro)) {
          expect(container.textContent).toContain(sentence.segment.trim());
        }
        expect(screen.getByText(copy.limits)).toBeTruthy();
        expect(screen.getByAltText(copy.illustration)).toBeTruthy();
        for (const [setup, tubeType] of [["tubeless", "tubeless"], ["innerTube", "inner_tube"]] as const) {
          const table = screen.getByRole("table", { name: copy[setup] });
          const rows = within(table).getAllByRole("row").slice(1);
          expect(rows).toHaveLength(WEIGHT_STEPS.length);
          for (const [index, weight] of WEIGHT_STEPS.entries()) {
            const output = calculateBasicPressure(buildPressureInput(weight, bikeType, tubeType));
            const number = (value: number) => new Intl.NumberFormat(locale, { maximumFractionDigits: 2 }).format(value);
            expect(within(rows[index]).getByRole("rowheader").textContent).toBe(`${weight} kg`);
            const cells = within(rows[index]).getAllByRole("cell");
            expect(cells[0].textContent).toBe(`${number(output.frontBar)} / ${number(output.frontPsi)}`);
            expect(cells[1].textContent).toBe(`${number(output.rearBar)} / ${number(output.rearPsi)}`);
          }
        }
        const scripts = [...container.querySelectorAll('script[type="application/ld+json"]')];
        const schemas = scripts.flatMap(script => JSON.parse(script.textContent ?? "[]"));
        scripts.forEach(script => script.remove());
        const faqSchemas = schemas.filter(schema => schema["@type"] === "FAQPage");
        expect(faqSchemas).toHaveLength(1);
        expect(faqSchemas[0].mainEntity).toHaveLength(3);
        for (const faq of faqSchemas[0].mainEntity) {
          expect(screen.getByText(faq.name).tagName).toBe("SUMMARY");
          expect(screen.getByText(faq.acceptedAnswer.text)).toBeTruthy();
        }
        const summary = screen.getByText(copy.faqWeight);
        expect(summary.closest("details")?.open).toBe(false);
        fireEvent.click(summary);
        expect(summary.closest("details")?.open).toBe(true);
        for (const cta of screen.getAllByRole("link", { name: copy.calculator })) {
          expect(cta.getAttribute("href")).toBe(locale === "nl"
            ? "/nl/bandenspanning-calculator" : "/en/tire-pressure-calculator");
        }
        expect(screen.getByRole("link", { name: copy.guide }).getAttribute("href"))
          .toBe(`/${locale}${BIKE_TYPE_LABELS[bikeType].guideHref}`);
        expect(container.textContent).not.toContain(locale === "nl" ? "Our assumptions" : "Dit nemen we aan");
      });
    }
    it.each(["unknown", "75kg-road-bike", "75kg-racefiets", "72kg-gravel-bike", "75-road-bike"])(
      "rejects invalid or retired direct-render slug %s (redirects are tested at the proxy)", async slug => {
        request.locale = locale;
        const params = Promise.resolve({ slug });
        expect((await metadata({ params })).robots).toEqual({ index: false, follow: false });
        await expect(Page({ params })).rejects.toThrow("NEXT_NOT_FOUND");
      },
    );
  });
}

it.each([
  ["road-bike", DutchRoadPage, roadMetadata], ["gravel-bike", DutchGravelPage, gravelMetadata],
] as const)("keeps the dedicated Dutch %s wrapper canonical and localized", async (bike, Page, metadata) => {
  request.locale = "nl";
  const result = await metadata();
  expect(result.alternates).toEqual(buildPressureBikeAlternates(bike, "nl"));
  render(await Page());
  expect(screen.getByRole("heading", { level: 1 }).textContent)
    .toBe(pressureBikeLandingMessages.nl.title(BIKE_TYPE_LABELS[bike].nl));
});

it("does not render the retired MTB alias if the proxy is bypassed", () => {
  expect(() => RetiredMtbAlias()).toThrow("NEXT_NOT_FOUND");
});
