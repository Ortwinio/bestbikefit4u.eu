/* @vitest-environment jsdom */

import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import CrankLengthCalculatorPage, { generateMetadata } from "./page";
import { crankLengthMessages } from "@/i18n/calculators/crankLength";

vi.mock("@/i18n/getDictionary", () => ({getDictionary: async (language: "en" | "nl") => ({crankLengthCalculator: crankLengthMessages[language]})}));

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

vi.mock("@/components/seo/RelatedLinksSection", () => ({
  RelatedLinksSection: () => <section>Related links</section>,
}));

vi.mock("@/i18n/request", () => ({
  getRequestLocale: () => Promise.resolve(locale),
}));

vi.mock("@/i18n/metadata", () => ({
  buildLocaleAlternates: () => ({ canonical: `https://bestbikefit4u.eu/${locale}/calculators/crank-length` }),
}));

vi.mock("@/lib/seo/jsonLd", () => ({
  CALCULATOR_AGGREGATE_RATING: {
    ratingValue: "4.8",
    ratingCount: 380,
    bestRating: "5",
    worstRating: "1",
  },
  buildWebApplicationSchema: () => ({}),
}));

vi.mock("./CrankLengthCalculatorForm", () => ({
  CrankLengthCalculatorForm: () => <div>Crank Form</div>,
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

describe("crank length page", () => {
  it("preserves canonical metadata and Dutch FAQ content", async () => {
    locale = "nl";
    expect((await generateMetadata()).alternates?.canonical).toBe("https://bestbikefit4u.eu/nl/calculators/crank-length");
    render(await CrankLengthCalculatorPage({searchParams: Promise.resolve({})}));
    expect(screen.getByText(crankLengthMessages.nl.faqs[0].q).tagName).toBe("SUMMARY");
    expect(screen.getByText(crankLengthMessages.nl.faqs[0].a)).toBeTruthy();
  });
  it("keeps the calculator value-first next-step CTAs in English", async () => {
    const ui = await CrankLengthCalculatorPage({
      searchParams: Promise.resolve({}),
    });
    render(ui);

    expect(screen.getByText("Practical component choice without fake certainty")).toBeTruthy();
    expect(screen.getByText("Crank Form")).toBeTruthy();
    expect(screen.getByText("Start free bike fit").closest("a")?.getAttribute("href")).toBe(
      "/en/calculators/bike-fit"
    );
    expect(screen.getByText("Compare plans").closest("a")?.getAttribute("href")).toBe(
      "/en/pricing"
    );
    expect(screen.queryByText("Donate via our Alpe d'HuZes page")).toBeNull();
  });
});
