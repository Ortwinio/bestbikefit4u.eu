/* @vitest-environment jsdom */

import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { getFunctionName } from "convex/server";
import { FitPassLandingCta } from "./FitPassLandingCta";
import { fitPassAccessCopy } from "@/i18n/marketing/fitPassAccess";
import { getAccess, type PricingEntitlement } from "../../../../shared/pricing/access";

const mocks = vi.hoisted(() => ({
  user: { tier: "free" } as { tier: string } | null | undefined,
  access: undefined as ReturnType<typeof getAccess> | null | undefined,
  campaign: false,
  calls: [] as { name: string; args: unknown }[],
}));

vi.mock("convex/react", () => ({
  useMutation: () => vi.fn(),
  useQuery: (reference: Parameters<typeof getFunctionName>[0], args: unknown) => {
    const name = getFunctionName(reference);
    mocks.calls.push({ name, args });
    return name === "pricing/queries:getAccess" ? (args === "skip" ? undefined : mocks.access) : mocks.user;
  },
}));
vi.mock("@/config/commercial", async (importOriginal) => ({
  ...await importOriginal<typeof import("@/config/commercial")>(),
  isConsumerCampaignActive: () => mocks.campaign,
}));
vi.mock("@/components/analytics/MarketingEventTracker", () => ({ useMarketingEventLogger: () => vi.fn() }));

function accessFor(productId: PricingEntitlement["productId"], expired = false) {
  return getAccess({ entitlements: [{
    productId, bikeId: productId === "single" ? "owned-bike" : undefined,
    status: expired ? "expired" : "active", startsAt: 1000, expiresAt: expired ? 1500 : 3000,
    source: "purchase", appointmentGranted: productId === "annual_personal",
  }] }, undefined, { enforced: true, now: 2000 });
}

function landing(locale: "nl" | "en") {
  return <FitPassLandingCta locale={locale} label="Purchase" loadingLabel="Loading access"
    alreadyActiveLabel="Your single measurement is active" loginHref={`/${locale}/login`} dashboardHref={`/${locale}/dashboard`} />;
}

beforeEach(() => {
  vi.stubEnv("NEXT_PUBLIC_PAID_ACCESS_ENFORCED", "true");
  mocks.user = { tier: "free" };
  mocks.access = getAccess(null, undefined, { enforced: true });
  mocks.campaign = false;
  mocks.calls = [];
});
afterEach(() => { cleanup(); vi.unstubAllEnvs(); });

describe.each(["nl", "en"] as const)("%s authoritative FitPass access", locale => {
  it.each(["annual", "annual_entry", "annual_personal"] as const)("shows already annual for active %s even with a free legacy tier", product => {
    mocks.access = accessFor(product);
    render(landing(locale));
    expect(screen.getByText(fitPassAccessCopy[locale].annualActive)).toBeTruthy();
    expect(screen.getByText(fitPassAccessCopy[locale].annualDescription)).toBeTruthy();
    expect(screen.getByRole("link", { name: fitPassAccessCopy[locale].dashboard }).getAttribute("href")).toBe(`/${locale}/dashboard`);
    expect(screen.queryByText("Your single measurement is active")).toBeNull();
    expect(screen.queryByRole("link", { name: "Purchase" })).toBeNull();
    expect(mocks.calls).toContainEqual({ name: "pricing/queries:getAccess", args: {} });
  });

  it.each(["single", "expired", "free", "null"])("does not use stale premium tier to open all bikes for %s access", state => {
    mocks.user = { tier: "premium" };
    mocks.access = state === "single" ? accessFor("single") : state === "expired" ? accessFor("annual", true) : state === "null" ? null : getAccess(null, undefined, { enforced: true });
    mocks.campaign = true;
    render(landing(locale));
    expect(screen.getByRole("link", { name: "Purchase" }).getAttribute("href")).toBe(`/${locale}/checkout?product=single`);
    expect(screen.queryByText(fitPassAccessCopy[locale].annualActive)).toBeNull();
    expect(screen.queryByText(fitPassAccessCopy[locale].annualDescription)).toBeNull();
    expect(screen.queryByRole("link", { name: fitPassAccessCopy[locale].dashboard })).toBeNull();
  });

  it("waits for authoritative access without a legacy-tier flash", () => {
    mocks.user = { tier: "pro" };
    mocks.access = undefined;
    render(landing(locale));
    expect(screen.getByRole("button", { name: "Loading access" }).hasAttribute("disabled")).toBe(true);
    expect(screen.queryByRole("link")).toBeNull();
  });

  it("skips access when signed out and always sends purchase to localized checkout", () => {
    mocks.user = null;
    render(landing(locale));
    expect(screen.getByRole("link", { name: "Purchase" }).getAttribute("href")).toBe(`/${locale}/checkout?product=single`);
    expect(mocks.calls).toContainEqual({ name: "pricing/queries:getAccess", args: "skip" });
  });

  it.each(["pro", "premium"])("preserves legacy %s dashboard access with enforcement off without claiming annual or single", tier => {
    vi.stubEnv("NEXT_PUBLIC_PAID_ACCESS_ENFORCED", "false");
    mocks.user = { tier };
    render(landing(locale));
    expect(screen.getByText(fitPassAccessCopy[locale].legacyActive)).toBeTruthy();
    expect(screen.getByRole("link").getAttribute("href")).toBe(`/${locale}/dashboard`);
    expect(screen.queryByText(fitPassAccessCopy[locale].annualActive)).toBeNull();
    expect(mocks.calls).toContainEqual({ name: "pricing/queries:getAccess", args: "skip" });
  });

  it.each([true, false])("preserves the free campaign navigation with enforcement off (signed in: %s)", signedIn => {
    vi.stubEnv("NEXT_PUBLIC_PAID_ACCESS_ENFORCED", "false");
    mocks.campaign = true;
    mocks.user = signedIn ? { tier: "free" } : null;
    const { container } = render(landing(locale));
    expect([...container.querySelectorAll("a[href]")].some(link => new URL(link.getAttribute("href")!, "https://example.test").pathname === `/${locale}/${signedIn ? "dashboard" : "login"}`)).toBe(true);
  });
});
