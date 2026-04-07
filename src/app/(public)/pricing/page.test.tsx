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
  it("shows the new Free vs Pro framing and proof modules in English", async () => {
    const ui = await PricingPage();
    render(ui);

    expect(screen.getByText("Clear pricing for real riders")).toBeTruthy();
    expect(screen.getByText("Start free")).toBeTruthy();
    expect(screen.getByText("Start Pro - EUR 9/month")).toBeTruthy();
    expect(screen.getByText("Why riders trust this as a first step")).toBeTruthy();
    expect(screen.getByText("Method-backed calculations")).toBeTruthy();
    expect(screen.getByText("Concrete fit outputs")).toBeTruthy();
    expect(screen.getByText("Honest about limits")).toBeTruthy();
    expect(
      screen.getByText("No contract. Start free and upgrade or cancel at any time.")
    ).toBeTruthy();
  });

  it("preserves login source tags on plan CTAs and moves the footer CTA to the calculator", async () => {
    const ui = await PricingPage();
    render(ui);

    expect(
      screen.getAllByRole("button", { name: "Start free" })[0].getAttribute("href")
    ).toBe("/en/login?src=%2Fen%2Fpricing%3Apricing_free_cta");
    expect(
      screen
        .getAllByRole("button", { name: "Start Pro - EUR 9/month" })[0]
        .getAttribute("href")
    ).toBe("/en/login?src=%2Fen%2Fpricing%3Apricing_pro_cta");
    expect(
      screen.getByRole("button", { name: "Start free fit" }).getAttribute("href")
    ).toBe("/en/calculators/bike-fit");
  });

  it("keeps the Dutch commercial copy aligned", async () => {
    locale = "nl";

    const ui = await PricingPage();
    render(ui);

    expect(screen.getByText("Heldere prijzen voor echte rijders")).toBeTruthy();
    expect(screen.getByText("Start gratis")).toBeTruthy();
    expect(screen.getByText("Start Pro - EUR 9/maand")).toBeTruthy();
    expect(screen.getByText("Waarom rijders dit vertrouwen als eerste stap")).toBeTruthy();
    expect(
      screen.getByText("Geen contract. Start gratis en upgrade of annuleer op elk moment.")
    ).toBeTruthy();
  });
});
