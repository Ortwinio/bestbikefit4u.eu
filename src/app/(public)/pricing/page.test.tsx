/* @vitest-environment jsdom */

import type { ReactNode } from "react";
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import PricingPage, { generateMetadata } from "./page";

let locale: "en" | "nl" = "nl";

vi.mock("@/i18n/request", () => ({
  getRequestLocale: () => Promise.resolve(locale),
}));

vi.mock("@/components/analytics/MarketingEventTracker", () => ({
  TrackMarketingEventOnView: () => null,
}));

vi.mock("@/components/seo/JsonLd", () => ({
  JsonLd: ({ schema }: { schema: unknown }) => <script type="application/ld+json">{JSON.stringify(schema)}</script>,
}));

vi.mock("@/components/analytics/TrackedCtaLink", () => ({
  TrackedCtaLink: ({ href, children }: { href: string; children: ReactNode }) => <a href={href}>{children}</a>,
}));

beforeEach(() => {
  locale = "nl";
  vi.useFakeTimers();
  vi.setSystemTime(new Date("2026-09-29T12:00:00Z"));
  vi.stubEnv("STRIPE_BILLING_ENABLED", "false");
  vi.stubEnv("NEXT_PUBLIC_STRIPE_BILLING_ENABLED", "false");
});

afterEach(() => {
  cleanup();
  vi.useRealTimers();
  vi.unstubAllEnvs();
});

describe("pricing campaign regression", () => {
  beforeEach(() => {
    locale = "en";
    vi.setSystemTime(new Date("2026-05-01T12:00:00Z"));
  });
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

describe("pricing redesign", () => {
  it("keeps paused Pro unavailable and the free signup and calculator usable", async () => {
    render(await PricingPage());
    const unavailable = screen.getByRole("button", { name: "Tijdelijk niet beschikbaar" }) as HTMLButtonElement;
    expect(unavailable.disabled).toBe(true);
    expect(unavailable.getAttribute("aria-describedby")).toBe(screen.getByRole("status").id);
    expect(screen.getByRole("link", { name: "Start gratis" }).getAttribute("href")).toBe("/nl/login");
    expect(screen.getByRole("link", { name: "Start gratis bike fit" }).getAttribute("href")).toBe("/nl/calculators/bike-fit");
    expect(screen.queryByRole("link", { name: /Start Pro/ })).toBeNull();
    expect(screen.queryByText(/Doneer voor/)).toBeNull();
    expect(screen.getAllByRole("columnheader")).toHaveLength(3);
  });

  it("localizes the pause, headings, navigation and FAQ schema in English", async () => {
    locale = "en";
    const { container } = render(await PricingPage());
    expect(screen.getByRole("heading", { level: 1 }).textContent).toBe("Clear pricing for real riders");
    expect(screen.getByRole("button", { name: "Temporarily unavailable" })).toBeTruthy();
    expect(screen.getByRole("link", { name: "Start free" }).getAttribute("href")).toBe("/en/login");
    const schema = container.querySelector('script[type="application/ld+json"]')?.textContent ?? "";
    expect(schema).toContain("Can I manage multiple bikes?");
    const metadata = await generateMetadata();
    expect(metadata.title).toBe("Pricing | BestBikeFit4U");
    expect(metadata.alternates?.canonical).toBe("https://bestbikefit4u.eu/en/pricing");
  });

  it("honors either billing kill switch and restores only the existing login route when enabled", async () => {
    vi.stubEnv("STRIPE_BILLING_ENABLED", "true");
    render(await PricingPage());
    expect((screen.getByRole("button", { name: "Tijdelijk niet beschikbaar" }) as HTMLButtonElement).disabled).toBe(true);
    cleanup();
    vi.stubEnv("NEXT_PUBLIC_STRIPE_BILLING_ENABLED", "true");
    render(await PricingPage());
    expect(screen.queryByRole("status")).toBeNull();
    expect(screen.getByRole("link", { name: "Start Pro - EUR 9/maand" }).getAttribute("href")).toBe("/nl/login");
  });
});
