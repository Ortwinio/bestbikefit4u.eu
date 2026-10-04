/* @vitest-environment jsdom */

import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { FitPassLandingCta } from "./FitPassLandingCta";
import { FitPassPaywall } from "./FitPassPaywall";
import { isReportAccessOpen } from "@/config/commercial";

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

describe("Fit Pass uses the release 2.0 checkout", () => {
  it.each(["en", "nl"] as const)("uses the public flag for %s browser presentation without granting server access", locale => {
    vi.stubEnv("STRIPE_BILLING_ENABLED", undefined);
    vi.stubEnv("NEXT_PUBLIC_STRIPE_BILLING_ENABLED", "true");
    render(<FitPassPaywall locale={locale} sessionId="test" userTier="free" />);
    expect(screen.getByRole("link").getAttribute("href")).toBe(`/${locale}/checkout?product=single`);
    expect(isReportAccessOpen()).toBe(true);
  });

  it("keeps browser reports open when only the server flag is enabled", () => {
    vi.stubEnv("STRIPE_BILLING_ENABLED", "true");
    vi.stubEnv("NEXT_PUBLIC_STRIPE_BILLING_ENABLED", undefined);
    const { container } = render(<FitPassPaywall locale="en" sessionId="test" userTier="free" />);
    expect(container.innerHTML).toBe("");
    expect(isReportAccessOpen()).toBe(true);
  });

  it.each(["en", "nl"] as const)("keeps reports open without a paywall while billing is paused in %s", locale => {
    const { container } = render(<FitPassPaywall locale={locale} sessionId="test" userTier="free" />);
    expect(container.innerHTML).toBe("");
  });

  it.each(["en", "nl"] as const)("lets new riders create their account within checkout in %s", locale => {
    render(landing(locale));
    expect(screen.getByRole("link", { name: "Buy Fit Pass" }).getAttribute("href")).toBe(`/${locale}/checkout?product=single`);
  });

  it.each(["en", "nl"] as const)("sends members to checkout while billing is paused in %s", locale => {
    mocks.user = { tier: "free" };
    render(landing(locale));
    expect(screen.getByRole("link", { name: "Buy Fit Pass" }).getAttribute("href"))
      .toBe(`/${locale}/checkout?product=single`);
  });

  it.each(["pro", "premium"])("preserves %s access without an upgrade prompt", tier => {
    mocks.user = { tier };
    render(landing("en"));
    expect(screen.getByText("Your full access is available")).toBeTruthy();
    cleanup();
    const { container } = render(<FitPassPaywall locale="en" sessionId="test" userTier={tier} />);
    expect(container.innerHTML).toBe("");
  });

  it.each(["en", "nl"] as const)("routes report purchases through withdrawal consent in %s", locale => {
    vi.stubEnv("STRIPE_BILLING_ENABLED", "true");
    vi.stubEnv("NEXT_PUBLIC_STRIPE_BILLING_ENABLED", "true");
    render(<FitPassPaywall locale={locale} sessionId="test" userTier="free" />);
    const purchaseLink = screen.getAllByRole("link")
      .find(link => link.getAttribute("href") === `/${locale}/checkout?product=single`);
    expect(purchaseLink).toBeTruthy();
    expect(screen.queryByText(/Cancel any time|Opzegbaar via/)).toBeNull();
  });
});
