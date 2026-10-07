/* @vitest-environment jsdom */

import type { ReactNode } from "react";
import { cleanup, render, screen, within } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import PricingPage, { generateMetadata } from "./page";
import { pricingCopy } from "@/i18n/marketing/pricing";
import { checkoutCopy } from "@/i18n/marketing/checkout";
import { SITE_ORIGIN } from "../../../../shared/brand";
import { fitPassCopy } from "@/i18n/marketing/fitPass";
import { PRODUCTS } from "../../../../shared/pricing/products";

let locale: "nl" | "en" = "nl";

vi.mock("@/i18n/request", () => ({ getRequestLocale: async () => locale }));
vi.mock("@/components/analytics/MarketingEventTracker", () => ({ TrackMarketingEventOnView: () => null }));
vi.mock("@/components/analytics/TrackedCtaLink", () => ({
  TrackedCtaLink: ({ href, children, className }: { href: string; children: ReactNode; className: string }) => <a href={href} className={className}>{children}</a>,
}));
vi.mock("@/components/seo/JsonLd", () => ({
  JsonLd: ({ schema }: { schema: object }) => <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />,
}));

beforeEach(() => { vi.stubEnv("NEXT_PUBLIC_PERSONAL_FIT_SALES_ENABLED", undefined); });
afterEach(() => { cleanup(); vi.unstubAllEnvs(); });

describe.each(["nl", "en"] as const)("%s release 2.0 pricing", (currentLocale) => {
  it.each([false, true])("shows canonical VAT-inclusive cards and localized available checkout links with personal sales %s", async (enabled) => {
    if (enabled) vi.stubEnv("NEXT_PUBLIC_PERSONAL_FIT_SALES_ENABLED", "true");
    locale = currentLocale;
    render(await PricingPage());
    const page = pricingCopy[locale];
    const cards = screen.getAllByRole("article");
    expect(cards.map((card) => card.getAttribute("data-product"))).toEqual(["annual", "single", "annual_personal"]);
    for (const productId of ["single", "annual", "annual_personal"] as const) {
      const card = cards.find((entry) => entry.getAttribute("data-product") === productId)!;
      const product = page.products[productId];
      if (productId === "annual_personal" && !enabled) {
        expect(within(card).queryByRole("link")).toBeNull();
        expect(within(card).getByText(checkoutCopy[locale].availableSoon)).toBeTruthy();
      } else {
        expect(within(card).getByRole("link").getAttribute("href")).toBe(`/${locale}/checkout?product=${productId}`);
      }
      expect(within(card).getByText(product.price)).toBeTruthy();
      expect(card.textContent).toContain(page.vatShort);
      expect(Number(product.price.slice(1).replace(",", ".")) * 100).toBe(PRODUCTS[productId].priceCents);
    }
    expect(within(cards[0]).getByText(page.products.annual.badge!)).toBeTruthy();
    expect(cards[0].textContent).toContain(locale === "nl" ? "€21,50" : "€21.50");
    expect(cards[2].textContent).toContain(locale === "nl" ? "Neem contact met ons op" : "Contact us");
    expect(cards[2].textContent).not.toMatch(/\[LOCATIE\]|\[DUUR AFSPRAAK\]/);
    expect(screen.queryByRole("button")).toBeNull();
  });

  it.each([false, true])("keeps free/latest-PDF comparison, factual appointment copy and permitted gift feature with personal sales %s", async (enabled) => {
    if (enabled) vi.stubEnv("NEXT_PUBLIC_PERSONAL_FIT_SALES_ENABLED", "true");
    locale = currentLocale;
    const { container } = render(await PricingPage());
    const page = pricingCopy[locale];
    const table = screen.getByRole("table");
    expect(within(table).getAllByRole("columnheader")).toHaveLength(5);
    expect(table.textContent).toContain("80%");
    const pdfRow = within(table).getByRole("row", { name: new RegExp(locale === "nl" ? "PDF laatste rapport" : "PDF of latest report") });
    expect(within(pdfRow).getAllByRole("img", { name: page.included })).toHaveLength(4);
    expect(container.innerHTML).not.toMatch(/\[LOCATIE\]|\[DUUR AFSPRAAK\]|\[VOORWAARDEN AFSPRAAK — juridisch toetsen\]|\[AGENDALINK\]/);
    expect(container.textContent).toContain(locale === "nl" ? "Neem contact met ons op voor locatie, duur en vragen over verzetten of annuleren." : "Contact us for the location, duration and questions about rescheduling or cancellation.");
    const visible = container.cloneNode(true) as HTMLElement;
    visible.querySelectorAll("script").forEach((script) => script.remove());
    expect(visible.textContent).not.toMatch(/€9(?:\s|$)|€12[,.]50|€24[,.]50|€19[,.]50|\/\s*(?:maand|month)|Trustpilot|Ontwerpstaat/i);
    expect(visible.textContent).toContain(locale === "nl" ? "2 cadeaumetingen per jaar" : "2 gift measurements per year");
    expect(screen.getByRole("link", { name: new RegExp(page.gift.cta) }).getAttribute("href")).toBe(`/${locale}/gift`);
    expect(visible.textContent).toContain(locale === "nl" ? "€9,50" : "€9.50");
    expect(visible.textContent).toContain(locale === "nl" ? "€209,50" : "€209.50");
  });

  it.each([false, true])("emits matching available offer/FAQ schemas and localized metadata with personal sales %s", async (enabled) => {
    if (enabled) vi.stubEnv("NEXT_PUBLIC_PERSONAL_FIT_SALES_ENABLED", "true");
    locale = currentLocale;
    const { container } = render(await PricingPage());
    const serialized = container.querySelector('script[type="application/ld+json"]')!.textContent!;
    const [service, faq] = JSON.parse(serialized);
    expect(serialized).not.toMatch(/aggregateRating|AggregateRating/);
    expect(service["@type"]).toBe("Service");
    expect(service.offers.map((offer: { price: string }) => offer.price)).toEqual(enabled ? ["13.50", "21.50", "234.50"] : ["13.50", "21.50"]);
    for (const offer of service.offers) {
      expect(offer.priceCurrency).toBe("EUR");
      expect(offer.priceSpecification.valueAddedTaxIncluded).toBe(true);
      expect(offer.url).toContain(`/${locale}/checkout?product=`);
    }
    expect(faq.mainEntity.map((entry: { name: string }) => entry.name)).toEqual(pricingCopy[locale].faqs.map((entry) => entry.q));
    const metadata = await generateMetadata();
    expect(metadata.alternates?.canonical).toBe(`${SITE_ORIGIN}/${locale}/pricing`);
    expect(metadata.description).toBe(pricingCopy[locale].metadata.description);
    expect(metadata.title).toBe(`${locale === "nl" ? "Prijzen" : "Pricing"} | BikeFitBoost`);
    expect(fitPassCopy[locale].metadata.title).toContain("BikeFitBoost");
    expect(JSON.stringify({ metadata, pricing: pricingCopy[locale], fitPass: fitPassCopy[locale] }))
      .not.toMatch(/BestBikeFit4U/i);
    expect(service.url).toBe(`${SITE_ORIGIN}/${locale}/pricing`);
    expect(service.provider["@id"]).toBe(`${SITE_ORIGIN}/#organization`);
    for (const offer of service.offers) expect(new URL(offer.url).origin).toBe(SITE_ORIGIN);
  });
});
