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
  vi.useFakeTimers({ toFake: ["Date"] });
  vi.setSystemTime(new Date("2026-05-01T12:00:00Z"));
  useMutationMock.mockReset();
});

afterEach(() => {
  cleanup();
  vi.unstubAllEnvs();
  vi.useRealTimers();
  vi.restoreAllMocks();
});

describe("pricing page", () => {
  it.each(["en", "nl"] as const)("keeps free signup available with a payment notice in %s", async (language) => {
    locale = language;
    vi.setSystemTime(new Date("2026-09-27T12:00:00Z"));
    vi.stubEnv("NEXT_PUBLIC_STRIPE_BILLING_ENABLED", "false");
    render(await PricingPage());
    expect(screen.getByRole("status").textContent).toContain(
      language === "nl" ? "Betalingen zijn tijdelijk niet beschikbaar" : "Payments are temporarily unavailable"
    );
    expect(screen.getByText(language === "nl" ? "Start gratis" : "Start free").closest("a")?.getAttribute("href"))
      .toMatch(new RegExp(`^/${language}/login(?:\\?|$)`));
  });
  it("shows the campaign replacement card in English", async () => {
    const ui = await PricingPage();
    render(ui);

    expect(screen.getByText("Clear pricing for real riders")).toBeTruthy();
    expect(screen.getByText("Temporary free campaign")).toBeTruthy();
    expect(screen.getByText("Use BestBikeFit4U for free until June 4, 2026")).toBeTruthy();
    expect(screen.getAllByText("Start free bike fit")[0].closest("a")?.getAttribute("href")).toBe(
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

    for (const cta of screen.getAllByText("Start free bike fit")) {
      expect(cta.closest("a")?.getAttribute("href")).toBe("/en/calculators/bike-fit");
    }
    expect(screen.queryByText("Start free")).toBeNull();
  });

  it("keeps the Dutch campaign copy aligned", async () => {
    locale = "nl";

    const ui = await PricingPage();
    render(ui);

    expect(screen.getByText("Heldere prijzen voor echte rijders")).toBeTruthy();
    expect(screen.getByText("Tijdelijke gratis campagne")).toBeTruthy();
    expect(screen.getByText("Gebruik BestBikeFit4U gratis tot 4 juni 2026")).toBeTruthy();
    for (const cta of screen.getAllByText("Start gratis bike fit")) {
      expect(cta.closest("a")?.getAttribute("href")).toBe("/nl/calculators/bike-fit");
    }
    expect(screen.getByText("Doneer voor Alpe d'HuZes")).toBeTruthy();
    expect(screen.getByText("Doneren is volledig optioneel.")).toBeTruthy();
  });

  it("restores public plan signup after the campaign ends", async () => {
    vi.setSystemTime(new Date("2026-09-27T12:00:00Z"));
    render(await PricingPage());

    expect(screen.queryByText("Temporary free campaign")).toBeNull();
    expect(screen.getByText("Start free").closest("a")?.getAttribute("href"))
      .toMatch(/^\/en\/login(?:\?|$)/);
    expect(screen.getByText("Start free bike fit").closest("a")?.getAttribute("href"))
      .toBe("/en/calculators/bike-fit");
  });
});
