/* @vitest-environment jsdom */

import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import GearingCalculatorPage from "./page";

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

vi.mock("@/components/seo/RelatedLinksSection", () => ({
  RelatedLinksSection: () => <section>Related links</section>,
}));

vi.mock("@/i18n/request", () => ({
  getRequestLocale: () => Promise.resolve(locale),
}));

vi.mock("@/i18n/metadata", () => ({
  buildLocaleAlternates: () => ({
    canonical: `https://bestbikefit4u.eu/${locale}/calculators/gearing`,
  }),
}));

vi.mock("@/lib/seo/jsonLd", () => ({
  CALCULATOR_AGGREGATE_RATING: {
    ratingValue: "4.8",
    ratingCount: 380,
    bestRating: "5",
    worstRating: "1",
  },
  buildFaqPageSchema: () => ({}),
  buildHowToSchema: () => ({}),
  buildWebApplicationSchema: () => ({}),
}));

vi.mock("./GearingCalculatorForm", () => ({
  GearingCalculatorForm: () => <div>Gearing form</div>,
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

describe("gearing calculator page", () => {
  it("renders the public gearing flow in English", async () => {
    const ui = await GearingCalculatorPage();
    render(ui);

    expect(screen.getByText("Gearing Calculator")).toBeTruthy();
    expect(screen.getByText("Gearing form")).toBeTruthy();
    expect(screen.getByText("Start free bike fit").closest("a")?.getAttribute("href")).toBe(
      "/en/calculators/bike-fit"
    );
    expect(screen.getByText("Compare plans").closest("a")?.getAttribute("href")).toBe(
      "/en/pricing"
    );
    expect(screen.queryByText("Donate via our Alpe d'HuZes page")).toBeNull();
  });

  it("renders the public gearing flow in Dutch", async () => {
    locale = "nl";
    const ui = await GearingCalculatorPage();
    render(ui);

    expect(screen.getByText("Verzet calculator")).toBeTruthy();
    expect(screen.getByText("Gearing form")).toBeTruthy();
    expect(screen.getByText("Start gratis bike fit").closest("a")?.getAttribute("href")).toBe(
      "/nl/calculators/bike-fit"
    );
    expect(screen.getByText("Bekijk prijzen").closest("a")?.getAttribute("href")).toBe(
      "/nl/pricing"
    );
  });
});
