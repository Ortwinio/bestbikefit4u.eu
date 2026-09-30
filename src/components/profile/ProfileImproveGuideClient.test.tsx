// @vitest-environment jsdom

import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { getDashboardMessages } from "@/i18n/dashboardMessages";
import { ProfileImproveGuideClient } from "./ProfileImproveGuideClient";
import FlexibilityPage from "@/app/(dashboard)/profile/improve/flexibility/page";
import CorePage from "@/app/(dashboard)/profile/improve/core-stability/page";
import ComfortPage from "@/app/(dashboard)/profile/improve/comfort/page";
import MeasurementsPage from "@/app/(dashboard)/profile/improve/body-measurements/page";

const state = vi.hoisted(() => ({
  locale: "nl" as "nl" | "en",
  profile: undefined as Record<string, unknown> | null | undefined,
}));

vi.mock("convex/react", () => ({ useQuery: () => state.profile }));
vi.mock("@/i18n/request", () => ({ getRequestLocale: async () => state.locale }));
vi.mock("@/i18n/useDashboardMessages", () => ({
  useDashboardMessages: () => ({ locale: state.locale, messages: getDashboardMessages(state.locale) }),
}));

beforeEach(() => {
  state.locale = "nl";
  state.profile = { flexibilityScore: "good", coreStabilityScore: 4, hasPain: "yes", painSeverity: 2, heightCm: 180, weightKg: 90 };
});
afterEach(cleanup);

const guides = [
  { page: FlexibilityPage, key: "flexibility", edit: "flexibility", count: 5 },
  { page: CorePage, key: "coreStability", edit: "core", count: 5 },
  { page: ComfortPage, key: "comfort", edit: "comfort", count: 7 },
  { page: MeasurementsPage, key: "bodyMeasurements", edit: "measurements", count: 5 },
] as const;

describe.each(["nl", "en"] as const)("ProfileImprove in %s", (locale) => {
  it.each(guides)("preserves $key content, edit links, and exercise interactions", async (guide) => {
    state.locale = locale;
    const page = await guide.page();
    const { container } = render(page);
    const copy = getDashboardMessages(locale).profile.improve[guide.key];
    expect(screen.getByRole("heading", { level: 1, name: copy.title })).toBeTruthy();
    expect(screen.getByRole("link", { name: copy.backLink }).getAttribute("href")).toBe(`/${locale}/profile`);
    expect(screen.getByRole("link", { name: copy.updateScoreCta }).getAttribute("href")).toBe(`/${locale}/profile?edit=${guide.edit}`);
    const buttons = screen.getAllByRole("button");
    expect(buttons).toHaveLength(guide.count);
    expect(buttons[0].getAttribute("aria-expanded")).toBe("true");
    for (const button of buttons) {
      fireEvent.click(button);
      if (button.getAttribute("aria-expanded") !== "true") fireEvent.click(button);
      const panel = document.getElementById(button.getAttribute("aria-controls")!);
      expect(panel?.hidden).toBe(false);
      expect(panel?.querySelectorAll("ol li").length).toBeGreaterThan(0);
      expect(container.querySelectorAll('button[aria-expanded="true"]')).toHaveLength(1);
      fireEvent.click(button);
      expect(panel?.hidden).toBe(true);
    }
    expect(container.textContent).not.toMatch(/Voorbeeldgegevens|Ontwerpstaat|Sanne/);
    expect(container.querySelectorAll('[aria-current="true"]')).toHaveLength(1);
  });

  it.each([undefined, null, {}])("does not invent a current level for profile %s", (profile) => {
    state.locale = locale;
    state.profile = profile;
    const { container } = render(<ProfileImproveGuideClient variant="bmi" exercises={[]} progressTips={[]} />);
    expect(container.querySelector('[aria-current="true"]')).toBeNull();
    expect(screen.getByRole("status").textContent).toContain(profile === undefined
      ? locale === "nl" ? "Je profiel laden…" : "Loading your profile…"
      : locale === "nl" ? "Nog niet ingevuld" : "Not yet recorded");
  });
});

it("highlights the derived comfort level in Dutch and responds to profile changes", () => {
  const { container, rerender } = render(<ProfileImproveGuideClient variant="comfort" exercises={[]} progressTips={[]} />);
  expect(container.querySelector('[aria-current="true"]')?.textContent).toContain("Matig ongemak");
  expect(screen.getByRole("status").textContent).toContain("Matig ongemak");
  state.profile = { hasPain: "no" };
  rerender(<ProfileImproveGuideClient variant="comfort" exercises={[]} progressTips={[]} />);
  expect(container.querySelector('[aria-current="true"]')?.textContent).toContain("Comfortabel");
});
