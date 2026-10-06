// @vitest-environment jsdom
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, expect, it, vi } from "vitest";
import nl from "@/i18n/messages/nl";
import en from "@/i18n/messages/en";
import { BikePressureCard } from "./BikePressureCard";
const state = vi.hoisted(() => ({ locale: "nl" as "nl" | "en" }));
vi.mock("convex/react", () => ({ useMutation: () => vi.fn() }));
vi.mock("@/i18n/useDashboardMessages", () => ({
  useDashboardMessages: () => ({ locale: state.locale, messages: state.locale === "nl" ? nl.dashboard : en.dashboard }),
}));
vi.mock("@/components/ui", async importOriginal => ({
  ...await importOriginal<typeof import("@/components/ui")>(), useToast: () => ({ success: vi.fn(), error: vi.fn() }),
}));
afterEach(cleanup);
it.each(["nl", "en"] as const)("uses shared wheel identity for saved pressure and preserves notes (%s)", locale => {
  state.locale = locale;
  const props = {
    bike: { _id: "bike-1", name: "My bike", bikeType: "road" },
    latestCalculation: { _id: "pressure-1", recommendedFrontBar: 5.2, recommendedRearBar: 5.6,
      recommendedFrontPsi: 75, recommendedRearPsi: 81, createdAt: Date.UTC(2026, 9, 6), userNotes: "My saved note" },
    onRecalculate: vi.fn(),
  } as unknown as Parameters<typeof BikePressureCard>[0];
  const { container } = render(<BikePressureCard {...props} />);
  expect(container.querySelectorAll('[data-component="PressureDisplay"]')).toHaveLength(1);
  expect(container.querySelector(".pressure-wheel-front")?.textContent).toContain("75 psi");
  expect(container.querySelector(".pressure-wheel-rear")?.textContent).toContain("81 psi");
  expect(screen.getByText("My saved note")).toBeTruthy();
  expect(screen.getByText(locale === "nl" ? /Laatst berekend/ : /Last calculated/)).toBeTruthy();
});
