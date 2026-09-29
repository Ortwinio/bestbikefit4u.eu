/* @vitest-environment jsdom */

import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import SaddleHeightCalculatorPage, { generateMetadata } from "./page";

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
  }: {
    href: string;
    children?: React.ReactNode;
  }) => <a href={href}>{children}</a>,
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
      <a href={startHref}>{startLabel ?? "Open bike-fit calculator"}</a>
      <a href={donateHref}>{donateLabel ?? "Continue in dashboard"}</a>
    </div>
  ),
}));

vi.mock("@/components/seo/JsonLd", () => ({
  JsonLd: () => null,
}));

vi.mock("@/components/seo/RelatedLinksSection", () => ({
  RelatedLinksSection: () => <section>Related links</section>,
}));

vi.mock("server-only", () => ({}));

vi.mock("@/i18n/request", () => ({
  getRequestLocale: () => Promise.resolve(locale),
}));

vi.mock("@/i18n/metadata", () => ({
  buildLocaleAlternates: () => ({ canonical: `https://bestbikefit4u.eu/${locale}/calculators/saddle-height` }),
}));

vi.mock("@/lib/seo/jsonLd", () => ({
  CALCULATOR_AGGREGATE_RATING: {
    ratingValue: "4.8",
    ratingCount: 380,
    bestRating: "5",
    worstRating: "1",
  },
  buildHowToSchema: () => ({}),
  buildWebApplicationSchema: () => ({}),
}));

vi.mock("./SaddleHeightCalculatorForm", () => ({
  SaddleHeightCalculatorForm: () => <div>Saddle height form</div>,
}));

beforeEach(() => {
  locale = "en";
  vi.useFakeTimers({ toFake: ["Date"] });
  vi.setSystemTime(new Date("2026-09-27T12:00:00Z"));
});

afterEach(() => {
  cleanup();
  vi.useRealTimers();
  vi.restoreAllMocks();
});

describe("saddle height calculator page", () => {
  it("preserves localized metadata and canonical URLs", async () => {
    for (const language of ["en", "nl"] as const) {
      locale = language;
      const metadata = await generateMetadata();
      expect(metadata.alternates?.canonical).toBe(`https://bestbikefit4u.eu/${language}/calculators/saddle-height`);
      expect(metadata.description).toBeTruthy();
      expect(metadata.openGraph?.url).toBe(metadata.alternates?.canonical);
    }
  });

  it("preserves Dutch FAQ content beneath the tool", async () => {
    locale = "nl";
    render(await SaddleHeightCalculatorPage());
    expect(screen.getByText("Hoe meet ik mijn binnenbeenlengte voor zadelhoogte?")).toBeTruthy();
    expect(screen.getByText("Waarom beïnvloedt flexibiliteit het advies?")).toBeTruthy();
  });

  it("keeps the value-first next-step CTAs visible in English", async () => {
    const ui = await SaddleHeightCalculatorPage();
    render(ui);

    expect(screen.getByText("Saddle height form")).toBeTruthy();
    expect(screen.getByText("Start free bike fit").closest("a")?.getAttribute("href")).toBe(
      "/en/calculators/bike-fit"
    );
    expect(screen.getByText("Compare plans").closest("a")?.getAttribute("href")).toBe(
      "/en/pricing"
    );
    expect(screen.queryByText("Donate via our Alpe d'HuZes page")).toBeNull();
  });
});
