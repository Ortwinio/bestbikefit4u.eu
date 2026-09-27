/* @vitest-environment jsdom */

import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { FitPassLandingCta } from "./FitPassLandingCta";
import { FitPassPaywall } from "./FitPassPaywall";

const mocks = vi.hoisted(() => ({
  user: null as null | { tier: string },
  logEvent: vi.fn(),
}));

vi.mock("convex/react", () => ({ useQuery: () => mocks.user }));
vi.mock("@/components/analytics/MarketingEventTracker", () => ({
  useMarketingEventLogger: () => mocks.logEvent,
}));

beforeEach(() => {
  mocks.user = null;
  vi.stubEnv("NEXT_PUBLIC_STRIPE_BILLING_ENABLED", "false");
  vi.useFakeTimers({ toFake: ["Date"] });
  vi.setSystemTime(new Date("2026-09-27T12:00:00Z"));
});

afterEach(() => {
  cleanup();
  vi.unstubAllEnvs();
  vi.useRealTimers();
});

function landing(locale: "en" | "nl") {
  return <FitPassLandingCta locale={locale} label="Buy Fit Pass" alreadyActiveLabel="Already active"
    loginHref={`/${locale}/login`} dashboardHref={`/${locale}/dashboard`} />;
}

describe("Fit Pass while payments are disabled", () => {
  it.each([
    ["en", "Payments are temporarily unavailable.", "Create a free account"],
    ["nl", "Betalingen zijn tijdelijk niet beschikbaar.", "Maak een gratis account"],
  ] as const)("keeps free signup available in %s", (locale, notice, signup) => {
    render(landing(locale));
    expect(screen.getByText(notice)).toBeTruthy();
    expect(screen.getByText(signup).closest("a")?.getAttribute("href")).toBe(`/${locale}/login`);
    expect(screen.queryByText("Buy Fit Pass")).toBeNull();
  });

  it("lets a free member continue to their dashboard without a checkout action", () => {
    mocks.user = { tier: "free" };
    render(landing("en"));
    expect(screen.getByText("Go to my dashboard").closest("a")?.getAttribute("href")).toBe("/en/dashboard");
    expect(screen.queryByText("Buy Fit Pass")).toBeNull();
  });

  it.each(["pro", "premium"])("preserves %s access without an upgrade prompt", (tier) => {
    mocks.user = { tier };
    render(landing("en"));
    expect(screen.getByText("Already active")).toBeTruthy();
    expect(screen.queryByText("Payments are temporarily unavailable.")).toBeNull();
    cleanup();
    const { container } = render(<FitPassPaywall locale="en" sessionId="test" userTier={tier} />);
    expect(container.innerHTML).toBe("");
  });

  it.each([
    ["en", "Payments are temporarily unavailable."],
    ["nl", "Betalingen zijn tijdelijk niet beschikbaar."],
  ] as const)("removes paid report purchase actions in %s", (locale, notice) => {
    render(<FitPassPaywall locale={locale} sessionId="test" userTier="free" />);
    expect(screen.getByText(notice)).toBeTruthy();
    expect(screen.queryByRole("button")).toBeNull();
  });
});
