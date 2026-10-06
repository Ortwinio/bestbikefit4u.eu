/* @vitest-environment jsdom */
import { afterEach, expect, it, vi } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import { getFunctionName } from "convex/server";
import { getDashboardMessages } from "@/i18n/dashboardMessages";
import type { Id } from "../../../../convex/_generated/dataModel";
import { BikePressureSection } from "./BikePressureSection";
const state = vi.hoisted(() => ({ locale: "nl" as "nl" | "en" }));
vi.mock("@/i18n/useDashboardMessages", () => ({ useDashboardMessages: () => ({
  locale: state.locale, messages: getDashboardMessages(state.locale),
}) }));
vi.mock("convex/react", () => ({ useQuery: (reference: Parameters<typeof getFunctionName>[0], args: unknown) => {
  if (args === "skip") return undefined;
  const name = getFunctionName(reference);
  if (name.endsWith("getLatestForBike")) return { createdAt: 1791244800000,
    recommendedFrontBar: 4.2, recommendedRearBar: 4.5, recommendedFrontPsi: 61, recommendedRearPsi: 65,
    currentFrontBar: 4.1, currentRearBar: 4.7 };
  if (name.endsWith("isBikePressureStale")) return { isStale: true };
  if (name.endsWith("getLatestByBike")) return null;
  if (name === "pressureProfiles/queries:listForBike") return [{ _id: "preset", name: "Saved road setup",
    useCase: "road", recommendedFrontBar: 4.3, recommendedRearBar: 4.6 }];
  return [];
} }));
afterEach(cleanup);
it.each(["nl", "en"] as const)("renders one recommendation while retaining status, current values and presets in %s", locale => {
  state.locale = locale;
  const { container } = render(<BikePressureSection bikeId={"bike" as Id<"bikes">} />);
  expect(container.querySelectorAll('[data-component="PressureDisplay"]')).toHaveLength(1);
  expect(screen.getAllByText(getDashboardMessages(locale).pressure.bikeDetail.recommendedPressure)).toHaveLength(1);
  expect(screen.getByText(/4.1 \/ 4.7/)).toBeTruthy();
  expect(screen.getByText("Saved road setup")).toBeTruthy();
  expect(screen.getByText(getDashboardMessages(locale).dashboardHome.pressureStale)).toBeTruthy();
});
