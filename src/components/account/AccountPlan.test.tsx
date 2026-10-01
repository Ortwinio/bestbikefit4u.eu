/* @vitest-environment jsdom */

import { cleanup, render, screen } from "@testing-library/react";
import { getFunctionName } from "convex/server";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { Doc } from "../../../convex/_generated/dataModel";
import type { Locale } from "@/i18n/config";
import { getDashboardMessages } from "@/i18n/dashboardMessages";
import { AccountPlan } from "./AccountPlan";

let user: Partial<Doc<"users">> | null | undefined;
let sessions: Array<{ status: string }> | undefined;
let locale: Locale = "en";

vi.mock("convex/react", () => ({
  useQuery: (query: Parameters<typeof getFunctionName>[0]) => {
    const name = getFunctionName(query);
    if (name === "users/queries:getCurrentUser") return user;
    if (name === "sessions/queries:listByUser") return sessions;
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

  it.each([["free", "Free"], ["pro", "Pro"], ["premium", "Premium"]] as const)(
    "shows the actual %s tier and all returned sessions without a quota",
    (tier, label) => {
      user = { tier, displayName: "Test Rider" };
      sessions = [{ status: "completed" }, { status: "in_progress" }, { status: "cancelled" }];
      render(<AccountPlan />);
      expect(screen.getByText(label)).toBeTruthy();
      expect(screen.getByText("Test Rider")).toBeTruthy();
      expect(screen.getByText("3").parentElement?.textContent).toBe("3 fit sessions");
      expect(screen.queryByRole("progressbar")).toBeNull();
      expect(screen.queryByText(/unlimited|remaining|\d+\s*\/\s*\d+/i)).toBeNull();
    }
  );

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
