/* @vitest-environment jsdom */

import { cleanup, render, screen } from "@testing-library/react";
import { getFunctionName } from "convex/server";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { Doc } from "../../../convex/_generated/dataModel";
import type { Locale } from "@/i18n/config";
import { getDashboardMessages } from "@/i18n/dashboardMessages";
import { AccountPlan } from "./AccountPlan";
import { getAccess } from "../../../shared/pricing/access";
import type { ProductId } from "../../../shared/pricing/products";

let user: Partial<Doc<"users">> | null | undefined;
let sessions: Array<{ status: string }> | undefined;
let locale: Locale = "en";
let access: ReturnType<typeof getAccess> | null | undefined;

vi.mock("convex/react", () => ({
  useQuery: (query: Parameters<typeof getFunctionName>[0]) => {
    const name = getFunctionName(query);
    if (name === "users/queries:getCurrentUser") return user;
    if (name === "sessions/queries:listByUser") return sessions;
    if (name === "pricing/queries:getAccess") return access;
    throw new Error(`Unexpected AccountPlan query: ${name}`);
  },
}));

vi.mock("@/i18n/useDashboardMessages", () => ({
  useDashboardMessages: () => ({ locale, messages: getDashboardMessages(locale) }),
}));

beforeEach(() => {
  user = { tier: "free", displayName: "Test Rider" };
  sessions = [];
  locale = "en";
  access = getAccess({ entitlements: [] }, undefined, { enforced: false });
  vi.stubEnv("NEXT_PUBLIC_STRIPE_BILLING_ENABLED", "false");
  vi.stubEnv("STRIPE_BILLING_ENABLED", "false");
});

afterEach(() => {
  cleanup();
  vi.unstubAllEnvs();
});

describe("AccountPlan truthfulness", () => {
  it("does not invent a tier or session count while queries are loading", () => {
    user = undefined;
    sessions = undefined;
    render(<AccountPlan />);
    expect(screen.queryByText("Free")).toBeNull();
    expect(screen.getAllByText("…")).toHaveLength(2);
    expect(screen.queryByText("0")).toBeNull();
    expect(screen.queryByRole("progressbar")).toBeNull();
  });

  it("does not call a missing user Free", () => {
    user = null;
    render(<AccountPlan />);
    expect(screen.queryByText("Free")).toBeNull();
  });

  it.each(["pro", "premium"] as const)(
    "does not leak stale %s tier and shows all returned sessions without a quota",
    (tier) => {
      user = { tier, displayName: "Test Rider" };
      sessions = [{ status: "completed" }, { status: "in_progress" }, { status: "cancelled" }];
      render(<AccountPlan />);
      expect(screen.getByText("Free")).toBeTruthy();
      expect(screen.queryByText(/^(Pro|Premium)$/)).toBeNull();
      expect(screen.getByText("Test Rider")).toBeTruthy();
      expect(screen.getByText("3").parentElement?.textContent).toBe("3 fit sessions");
      expect(screen.queryByRole("progressbar")).toBeNull();
      expect(screen.queryByText(/unlimited|remaining|\d+\s*\/\s*\d+/i)).toBeNull();
    }
  );

  it.each([null, undefined])("does not invent a product with unresolved access %s", (value) => {
    user = { tier: "pro" };
    access = value;
    render(<AccountPlan />);
    expect(screen.getByText("…")).toBeTruthy();
    expect(screen.queryByText(/^(Free|Pro|Premium)$/)).toBeNull();
  });

  describe.each(["en", "nl"] as const)("%s products", (language) => {
    it.each([
      ["free", "Free", "Gratis"],
      ["single", "Single fit", "Losse meting"],
      ["annual", "Annual plan", "Jaarabonnement"],
      ["annual_entry", "Entry annual plan", "Instapjaarabonnement"],
      ["annual_personal", "Annual plan + personal bikefit", "Jaarabonnement + persoonlijke bikefit"],
    ] satisfies Array<[ProductId, string, string]>)("uses authoritative %s with enforcement OFF and ON", (productId, english, dutch) => {
      locale = language;
      for (const enforced of [false, true]) {
        access = getAccess({ entitlements: productId === "free" ? [] : [{
          productId, bikeId: "owned-bike", status: "active", startsAt: 1, expiresAt: 100,
          source: "purchase", appointmentGranted: productId === "annual_personal",
        }] }, undefined, { enforced, now: 50 });
        if (!enforced) {
          expect(access.fullProfile).toBe(true);
          expect(access.fullReport).toBe(true);
        }
        render(<AccountPlan />);
        expect(screen.getByText(language === "nl" ? dutch : english)).toBeTruthy();
        expect(screen.queryByText(/^(Pro|Premium)$/)).toBeNull();
        cleanup();
      }
    });
  });

  it.each(["en", "nl"] as const)("shows a real zero count and localized %s account link", (language) => {
    locale = language;
    render(<AccountPlan />);
    expect(screen.getByText(language === "nl" ? "Gratis" : "Free")).toBeTruthy();
    expect(screen.getByText("0").parentElement?.textContent).toBe(language === "nl" ? "0 fit-sessies" : "0 fit sessions");
    expect(screen.getByRole("link").getAttribute("href")).toBe(`/${language}/settings`);
    expect(screen.getByRole("region", { name: language === "nl" ? "Je account" : "Your account" })).toBeTruthy();
    expect(screen.getByText(language === "nl" ? "Betalen is tijdelijk gepauzeerd." : "Payments are temporarily paused.")).toBeTruthy();
  });

  it.each([
    ["false", "true", true],
    ["true", "false", true],
    ["true", "true", false],
  ])("uses the existing billing helper for server=%s public=%s", (serverFlag, publicFlag, paused) => {
    vi.stubEnv("STRIPE_BILLING_ENABLED", serverFlag as string);
    vi.stubEnv("NEXT_PUBLIC_STRIPE_BILLING_ENABLED", publicFlag as string);
    render(<AccountPlan />);
    expect(Boolean(screen.queryByText("Payments are temporarily paused."))).toBe(paused);
  });
});
