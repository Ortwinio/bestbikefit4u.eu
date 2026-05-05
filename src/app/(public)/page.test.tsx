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
      <a href={startHref}>{startLabel ?? "Start free bike fit"}</a>
      <a href={donateHref}>{donateLabel ?? "Donate via our Alpe d'HuZes page"}</a>
    </div>
  ),
}));

vi.mock("@/components/home/HeroBlock", () => ({
  HeroBlock: ({
    fitHref,
    pricingHref,
    loginHref,
    primaryCta,
    secondaryCta,
  }: {
    fitHref: string;
    pricingHref: string;
    loginHref: string;
    primaryCta: string;
    secondaryCta: string;
  }) => (
    <section>
      <a href={fitHref}>{primaryCta}</a>
      <a href={pricingHref}>{secondaryCta}</a>
      <a href={loginHref}>Already have an account? Sign in</a>
    </section>
  ),
}));

vi.mock("@/components/home/ProofBar", () => ({
  ProofBar: () => <section>Proof Bar</section>,
}));

vi.mock("@/components/home/CalculatorGrid", () => ({
  CalculatorGrid: ({ tools }: { tools: Array<{ label: string }> }) => (
    <section>{tools.map((tool) => tool.label).join(" | ")}</section>
  ),
}));

vi.mock("@/components/home/HowItWorksStepper", () => ({
  HowItWorksStepper: () => <section>How it works stepper</section>,
}));

vi.mock("@/components/home/DifferentiatorTriple", () => ({
  DifferentiatorTriple: () => <section>Differentiators</section>,
}));

vi.mock("@/components/home/TestimonialSection", () => ({
  TestimonialSection: () => <section>Testimonials</section>,
}));

vi.mock("@/components/home/BikeSearchBar", () => ({
  BikeSearchBar: ({
    fitHref,
    manualHref,
  }: {
    fitHref: string;
    manualHref: string;
  }) => (
    <section>
      <a href={fitHref}>Bike search fit</a>
      <a href={manualHref}>Bike search manual</a>
    </section>
  ),
}));

vi.mock("@/components/home/BikeShowcaseSection", () => ({
  BikeShowcaseSection: ({
    copy,
  }: {
    copy: { title: string; useInFitLabel: string };
  }) => <section>{`${copy.title} ${copy.useInFitLabel}`}</section>,
}));

vi.mock("@/components/home/ClosingCtaBand", () => ({
  ClosingCtaBand: ({
    recommendation,
    cta,
    campaign,
    campaignActive,
  }: {
    recommendation: { title: string };
    cta: { title: string };
    campaign: { donationUrl: string; donateCta: string; startFreeCta: string };
    campaignActive: boolean;
  }) => (
    <section>
      {`${recommendation.title} ${cta.title}`}
      {campaignActive ? (
        <>
          <a href={campaign.donationUrl}>{campaign.donateCta}</a>
          <a href="/campaign-start">{campaign.startFreeCta}</a>
        </>
      ) : null}
    </section>
  ),
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
          primaryCta: locale === "nl" ? "Start gratis bike fit" : "Start free bike fit",
          secondaryCta: locale === "nl" ? "Bekijk prijzen" : "View pricing",
        },
        bikeQuickCheck: {
          title: "Quick check",
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
          button: locale === "nl" ? "Start gratis bike fit" : "Start free bike fit",
        },
        bikeShowcase: {
          eyebrow: "Eyebrow",
          title: locale === "nl" ? "Fietsen op het platform" : "Bikes on the platform",
          subtitle: "Subtitle",
          prevLabel: "Prev",
          nextLabel: "Next",
          regionLabel: "Region",
          cardAriaLabel: "View {brand} {model}",
          geometryVerified: "Geometry verified",
          stackLabel: "Stack",
          reachLabel: "Reach",
          ettLabel: "ETT",
          staLabel: "STA",
          htaLabel: "HTA",
          wheelbaseLabel: "Wheelbase",
          tyreLabel: "Tyre",
          frontLabel: "Front",
          rearLabel: "Rear",
          pressureUnit: "bar",
          psiUnit: "psi",
          pressureDisclaimer: "Disclaimer",
          pressureAvailable: "Pressure available",
          geometrySection: "Geometry",
          tyreSection: "Tyre",
          aboutSection: "About",
          geometrySource: "Source",
          ctaButton: "CTA",
          viewDetails: "View details",
          partialGeometry: "Partial geometry",
          mmUnit: "mm",
          degUnit: "deg",
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

    expect(screen.getAllByText("Start free bike fit")[0].closest("a")?.getAttribute("href")).toBe(
      "/en/calculators/bike-fit"
    );
    expect(
      screen
        .getAllByText("Donate via our Alpe d'HuZes page")[0]
        .closest("a")
        ?.getAttribute("href")
    ).toBe("https://inschrijving.opgevenisgeenoptie.nl/fundraisers/OrtwinVerreck35756");
    expect(
      screen.getByText("Already have an account? Sign in").closest("a")?.getAttribute("href")
    ).toBe("/en/login");
    expect(screen.getByText("View pricing").closest("a")?.getAttribute("href")).toBe("/en/pricing");

    const pageText = container.textContent ?? "";
    expect(pageText.indexOf("Proof Bar")).toBeGreaterThan(-1);
    expect(pageText.indexOf("How it works stepper")).toBeGreaterThan(-1);
    expect(pageText.indexOf("Bike Fit Calculator")).toBeGreaterThan(-1);
    expect(pageText.indexOf("Testimonials")).toBeGreaterThan(-1);
    expect(pageText.indexOf("Bike Fit Calculator")).toBeLessThan(
      pageText.indexOf("Testimonials")
    );
    expect(screen.getByText("Bikes on the platform Use in my fit")).toBeTruthy();
    expect(screen.getByText("bike fitting at home").closest("a")?.getAttribute("href")).toBe(
      "/en/bike-fitting"
    );
  });

  it("keeps the Dutch CTA framing aligned", async () => {
    locale = "nl";

    const ui = await HomePage();
    render(ui);

    expect(screen.getAllByText("Start gratis bike fit")[0].closest("a")?.getAttribute("href")).toBe(
      "/nl/calculators/bike-fit"
    );
    expect(
      screen
        .getAllByText("Doneer via onze Alpe d'HuZes-pagina")[0]
        .closest("a")
        ?.getAttribute("href")
    ).toBe("https://inschrijving.opgevenisgeenoptie.nl/fundraisers/OrtwinVerreck35756");
    expect(screen.getByText("Fietsen op het platform Gebruik in mijn fit")).toBeTruthy();
    expect(
      screen.getByText("fiets afstellen stap voor stap").closest("a")?.getAttribute("href")
    ).toBe("/nl/fiets-afstellen");
    expect(screen.getByText("online bikefitting").closest("a")?.getAttribute("href")).toBe(
      "/nl/bikefitting"
    );
  });
});
