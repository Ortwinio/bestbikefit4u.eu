/* @vitest-environment jsdom */

import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import PricingPage from "./page";

const useMutationMock = vi.fn();
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

vi.mock("convex/react", () => ({
  useMutation: () => useMutationMock,
}));

vi.mock("@/lib/cookieConsent", () => ({
  canTrackMarketing: () => false,
}));

vi.mock("@/components/analytics/MarketingEventTracker", () => ({
  TrackMarketingEventOnView: () => null,
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
      <a href={donateHref}>{donateLabel ?? "Make a donation"}</a>
    </div>
  ),
}));

vi.mock("@/components/seo/JsonLd", () => ({
  JsonLd: () => null,
}));

vi.mock("@/i18n/request", () => ({
  getRequestLocale: () => Promise.resolve(locale),
}));

beforeEach(() => {
  locale = "en";
  useMutationMock.mockReset();
});

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

describe("pricing page", () => {
  it("shows the campaign replacement card in English", async () => {
    const ui = await PricingPage();
    render(ui);

    expect(screen.getByText("Clear pricing for real riders")).toBeTruthy();
    expect(screen.getByText("Temporary free campaign")).toBeTruthy();
    expect(screen.getByText("Use BestBikeFit4U for free until June 4, 2026")).toBeTruthy();
    expect(screen.getByText("Start free bike fit").closest("a")?.getAttribute("href")).toBe(
      "/en/calculators/bike-fit"
    );
    expect(screen.getByText("Make a donation").closest("a")?.getAttribute("href")).toBe(
      "https://inschrijving.opgevenisgeenoptie.nl/fundraisers/OrtwinVerreck35756"
    );
    expect(screen.getByText("Donating is entirely optional.")).toBeTruthy();
    expect(screen.queryByText("Start Pro - EUR 9/month")).toBeNull();
  });

  it("keeps the campaign start CTA pointed at the calculator", async () => {
    const ui = await PricingPage();
    render(ui);

    expect(screen.getByText("Start free bike fit").closest("a")?.getAttribute("href")).toBe(
      "/en/calculators/bike-fit"
    );
    expect(screen.queryByText("Start free")).toBeNull();
  });

  it("keeps the Dutch campaign copy aligned", async () => {
    locale = "nl";

    const ui = await PricingPage();
    render(ui);

    expect(screen.getByText("Heldere prijzen voor echte rijders")).toBeTruthy();
    expect(screen.getByText("Tijdelijke gratis campagne")).toBeTruthy();
    expect(screen.getByText("Gebruik BestBikeFit4U gratis tot 4 juni 2026")).toBeTruthy();
    expect(screen.getByText("Start gratis bike fit")).toBeTruthy();
    expect(screen.getByText("Doneer voor Alpe d'HuZes")).toBeTruthy();
    expect(screen.getByText("Doneren is volledig optioneel.")).toBeTruthy();
  });
});
