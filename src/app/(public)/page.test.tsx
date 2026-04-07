/* @vitest-environment jsdom */

import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import HomePage from "./page";

let locale: "en" | "nl" = "en";

vi.mock("next/link", () => ({
  default: ({
    href,
    children,
    ...props
  }: {
    href: string;
    children?: React.ReactNode;
    [key: string]: unknown;
  }) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

vi.mock("@/components/analytics/TrackedCtaLink", () => ({
  TrackedCtaLink: ({
    href,
    children,
    locale: _locale,
    pagePath: _pagePath,
    section: _section,
    ctaLabel: _ctaLabel,
    conversionKey: _conversionKey,
  }: {
    href: string;
    children?: React.ReactNode;
    locale?: string;
    pagePath?: string;
    section?: string;
    ctaLabel?: string;
    conversionKey?: string;
    [key: string]: unknown;
  }) => (
    <a href={href}>
      {children}
    </a>
  ),
}));

vi.mock("@/components/analytics/MarketingEventTracker", () => ({
  TrackMarketingEventOnView: () => null,
}));

vi.mock("@/components/public/BikeQuickCheckCard", () => ({
  BikeQuickCheckCard: () => <div>Bike Quick Check</div>,
}));

vi.mock("@/components/home/QuotesCarousel", () => ({
  QuotesCarousel: () => <section>Quotes Section</section>,
}));

vi.mock("@/components/seo/JsonLd", () => ({
  JsonLd: () => null,
}));

vi.mock("@/i18n/request", () => ({
  getRequestLocale: () => Promise.resolve(locale),
}));

vi.mock("@/i18n/metadata", () => ({
  buildLocaleAlternates: () => ({ canonical: `https://bestbikefit4u.eu/${locale}` }),
}));

vi.mock("@/lib/seo/jsonLd", () => ({
  buildOrganizationSchema: () => ({}),
  buildWebSiteSchema: () => ({}),
}));

vi.mock("@/content/homeQuotes", () => ({
  HOME_QUOTES_DISPLAY_COUNT: 4,
  selectRandomHomeQuotesForLocale: () => ["Quote A", "Quote B"],
}));

vi.mock("@/i18n/getDictionary", () => ({
  getDictionary: () =>
    Promise.resolve({
      home: {
        metadata: {
          title: "Home",
          description: "Desc",
          keywords: [],
          openGraphTitle: "OG Home",
          openGraphDescription: "OG Desc",
        },
        hero: {
          title: locale === "nl" ? "Slimme bikefit" : "Smarter bike fit",
          titleAccent: locale === "nl" ? "voor elke rit" : "for every ride",
          description:
            locale === "nl"
              ? "Krijg eerst waarde, beslis daarna over een account."
              : "Get value first, decide about an account after that.",
          primaryCta: locale === "nl" ? "Start gratis fit" : "Start free fit",
          secondaryCta: locale === "nl" ? "Bekijk prijzen" : "View pricing",
        },
        bikeQuickCheck: {
          title: "Quick check",
        },
        howItWorks: {
          title: locale === "nl" ? "Hoe het werkt" : "How it works",
          subtitle: "Three steps",
          steps: [
            { title: "Step 1", description: "Desc 1" },
            { title: "Step 2", description: "Desc 2" },
            { title: "Step 3", description: "Desc 3" },
          ],
        },
        reasonsToStart: {
          title: "Reasons",
          subtitle: "Reasons subtitle",
          items: [
            { title: "Reason 1", description: "Reason desc 1" },
            { title: "Reason 2", description: "Reason desc 2" },
            { title: "Reason 3", description: "Reason desc 3" },
          ],
        },
        features: {
          title: "Features",
          subtitle: "Features subtitle",
          items: [
            { title: "Feature 1", description: "Feature desc 1" },
            { title: "Feature 2", description: "Feature desc 2" },
            { title: "Feature 3", description: "Feature desc 3" },
          ],
        },
        trustSection: {
          title: "Trust",
          subtitle: "Trust subtitle",
          items: [
            { title: "Trust 1", description: "Trust desc 1" },
            { title: "Trust 2", description: "Trust desc 2" },
            { title: "Trust 3", description: "Trust desc 3" },
          ],
        },
        recommendationSection: {
          title: "Recommendation",
          description: "Recommendation description",
          items: ["Item 1", "Item 2"],
          cardTitle: "Card title",
          cardDescription: "Card description",
          cardCta: locale === "nl" ? "Start bike fit" : "Start bike fit",
        },
        cta: {
          title: "CTA title",
          description: "CTA description",
          button: locale === "nl" ? "Start gratis fit" : "Start free fit",
        },
      },
    }),
}));

beforeEach(() => {
  locale = "en";
});

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

describe("home page", () => {
  it("keeps the homepage value-first flow ahead of signup in English", async () => {
    const ui = await HomePage();
    const { container } = render(ui);

    expect(screen.getAllByText("Start free fit")[0].closest("a")?.getAttribute("href")).toBe(
      "/en/calculators/bike-fit"
    );
    expect(screen.getAllByText("View pricing")[0].closest("a")?.getAttribute("href")).toBe(
      "/en/pricing"
    );
    expect(
      screen.getByText("Already have an account? Sign in").closest("a")?.getAttribute("href")
    ).toBe("/en/login");

    const pageText = container.textContent ?? "";
    expect(pageText.indexOf("Popular Calculators")).toBeGreaterThan(-1);
    expect(pageText.indexOf("Quotes Section")).toBeGreaterThan(-1);
    expect(pageText.indexOf("Popular Calculators")).toBeLessThan(
      pageText.indexOf("Quotes Section")
    );
  });

  it("keeps the Dutch CTA framing aligned", async () => {
    locale = "nl";

    const ui = await HomePage();
    render(ui);

    expect(screen.getAllByText("Start gratis fit")[0].closest("a")?.getAttribute("href")).toBe(
      "/nl/calculators/bike-fit"
    );
    expect(screen.getAllByText("Bekijk prijzen")[0].closest("a")?.getAttribute("href")).toBe(
      "/nl/pricing"
    );
    expect(screen.getByText("Heb je al een account? Log in")).toBeTruthy();
    expect(screen.getByText("Populaire calculators")).toBeTruthy();
  });
});
