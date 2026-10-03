/* @vitest-environment jsdom */

import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import BikeFitCalculatorPage, { generateMetadata } from "./page";

let locale: "en" | "nl" = "en";
let campaignActive = true;

vi.mock("server-only", () => ({}));

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
  TrackedCtaLink: ({ href, children }: { href: string; children?: React.ReactNode }) => (
    <a href={href}>{children}</a>
  ),
}));

vi.mock("@/components/seo/JsonLd", () => ({
  JsonLd: () => null,
}));

vi.mock("@/components/campaign/CampaignCtaGroup", () => ({
  CampaignCtaGroup: ({
    startHref,
    donateHref,
    startLabel,
    donateLabel,
  }: {
    startHref: string;
    donateHref: string;
    startLabel?: string;
    donateLabel?: string;
  }) => (
    <div>
      <a href={startHref}>{startLabel ?? "Create account or sign in"}</a>
      <a href={donateHref}>{donateLabel ?? "Donate via our Alpe d'HuZes page"}</a>
    </div>
  ),
}));

vi.mock("@/config/commercial", async () => {
  const actual = await vi.importActual<typeof import("@/config/commercial")>("@/config/commercial");

  return {
    ...actual,
    isConsumerCampaignActive: () => campaignActive,
  };
});

vi.mock("@/components/seo/RelatedLinksSection", () => ({
  RelatedLinksSection: () => <section>Related links</section>,
}));

vi.mock("@/i18n/request", () => ({
  getRequestLocale: () => Promise.resolve(locale),
}));

vi.mock("@/i18n/metadata", () => ({
  buildLocaleAlternates: () => ({
    canonical: `https://bestbikefit4u.eu/${locale}/calculators/bike-fit`,
  }),
}));

vi.mock("@/lib/seo/jsonLd", () => ({
  CALCULATOR_AGGREGATE_RATING: {
    ratingValue: "4.8",
    ratingCount: 380,
    bestRating: "5",
    worstRating: "1",
  },
  buildBreadcrumbListSchema: () => ({}),
  buildHowToSchema: () => ({}),
  buildWebApplicationSchema: () => ({}),
}));

vi.mock("./BikeFitCalculatorForm", () => ({
  BikeFitCalculatorForm: () => <div>Bike fit form</div>,
}));

beforeEach(() => {
  locale = "en";
  campaignActive = true;
});

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

describe("bike fit calculator page", () => {
  it.each(["en", "nl"] as const)(
    "preserves %s metadata, canonical and FAQ content",
    async (language) => {
      locale = language;
      const metadata = await generateMetadata();
      expect(metadata.alternates?.canonical).toBe(
        `https://bestbikefit4u.eu/${language}/calculators/bike-fit`,
      );
      expect(metadata.openGraph?.url).toBe(metadata.alternates?.canonical);
      render(await BikeFitCalculatorPage());
      expect(
        screen.getByText(
          language === "nl"
            ? "Welke waarde moet ik als eerste aanpassen?"
            : "Which value should I adjust first?",
        ),
      ).toBeTruthy();
    },
  );

  it.each(["en", "nl"] as const)(
    "offers a truthful %s account handoff after the campaign",
    async (language) => {
      locale = language;
      campaignActive = false;
      render(await BikeFitCalculatorPage());

      const label = locale === "nl" ? "Maak een gratis account aan" : "Create a free account";
      expect(screen.getByText(label).closest("a")?.getAttribute("href")).toBe(`/${locale}/login?src=bike-fit`);
      expect(
        screen.queryByText(
          /save these results|Sign in to save results|resultaten op te slaan|Meld je aan om te bewaren/,
        ),
      ).toBeNull();
      expect(
        screen
          .getByText(locale === "nl" ? "Bekijk prijzen" : "Compare plans")
          .closest("a")
          ?.getAttribute("href"),
      ).toBe(`/${locale}/pricing`);
    },
  );

  it("keeps the value-first next-step CTAs visible in English", async () => {
    const ui = await BikeFitCalculatorPage();
    render(ui);

    expect(screen.getByText("Bike fit form")).toBeTruthy();
    expect(screen.getByText("Create a free account").closest("a")?.getAttribute("href")).toBe(
      "/en/login?src=bike-fit",
    );
    expect(
      screen.getByText("Donate via our Alpe d'HuZes page").closest("a")?.getAttribute("href"),
    ).toBe("https://inschrijving.opgevenisgeenoptie.nl/fundraisers/OrtwinVerreck35756");
    expect(screen.queryByText("Compare plans")).toBeNull();
  });
});
