/* @vitest-environment jsdom */

import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import BikeFitCalculatorPage from "./page";

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
  buildLocaleAlternates: () => ({ canonical: `https://bestbikefit4u.eu/${locale}/calculators/bike-fit` }),
}));

vi.mock("@/lib/seo/jsonLd", () => ({
  buildHowToSchema: () => ({}),
  buildWebApplicationSchema: () => ({}),
}));

vi.mock("./BikeFitCalculatorForm", () => ({
  BikeFitCalculatorForm: () => <div>Bike fit form</div>,
}));

beforeEach(() => {
  locale = "en";
});

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

describe("bike fit calculator page", () => {
  it("keeps the value-first next-step CTAs visible in English", async () => {
    const ui = await BikeFitCalculatorPage();
    render(ui);

    expect(screen.getByText("Free Bike Fit Calculator")).toBeTruthy();
    expect(screen.getByText("Bike fit form")).toBeTruthy();
    expect(screen.getByText("Create account or sign in").closest("a")?.getAttribute("href")).toBe(
      "/en/login"
    );
    expect(
      screen
        .getByText("Donate via our Alpe d'HuZes page")
        .closest("a")
        ?.getAttribute("href")
    ).toBe("https://inschrijving.opgevenisgeenoptie.nl/fundraisers/OrtwinVerreck35756");
    expect(
      screen.getByText("Open Tire Pressure Calculator").closest("a")?.getAttribute("href")
    ).toBe("/en/tire-pressure-calculator");
    expect(screen.queryByText("Compare Free vs Pro")).toBeNull();
  });
});
