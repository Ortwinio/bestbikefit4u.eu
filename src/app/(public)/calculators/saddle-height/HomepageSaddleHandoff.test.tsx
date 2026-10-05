/* @vitest-environment jsdom */

import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import { renderToString } from "react-dom/server";
import { hydrateRoot } from "react-dom/client";
import { afterEach, describe, expect, it, vi } from "vitest";
import { readHandoff, writeHandoffEntry } from "@/lib/handoff/store";
import { HOME_SADDLE_START_KEY, markHomeSaddleStart } from "@/lib/handoff/homeStart";
import { saddleReliabilityMessages } from "@/i18n/calculators/saddleReliability";
import { quickFixMessages } from "@/i18n/calculators/quickFix";
import { homeSaddleWidget } from "@/i18n/marketing/homeSaddleWidget";
import { SaddleHeightTeaser } from "@/components/home/SaddleHeightTeaser";
import { calculatePublicSaddleHeight } from "../../../../../shared/reliability/saddleHeight";
import { SaddleHeightExperience } from "./SaddleHeightExperience";
import { SaddleHeightCalculatorForm } from "./SaddleHeightCalculatorForm";

vi.mock("@/lib/analytics/useSaddleReliabilityAnalytics", () => ({
  useSaddleReliabilityAnalytics: () => ({ trackQuickFixUsed: vi.fn(), trackInseamAdded: vi.fn() }),
}));
vi.mock("@/components/analytics/MarketingEventTracker", () => ({ useMarketingEventLogger: () => vi.fn() }));
vi.mock("@/lib/analytics/useHomeSaddleWidgetAnalytics", () => ({
  useHomeSaddleWidgetAnalytics: () => ({ trackHomeSaddleWidgetUsed: vi.fn() }),
}));

afterEach(() => {
  cleanup();
  sessionStorage.clear();
  localStorage.clear();
  window.history.replaceState(null, "", "/");
  vi.restoreAllMocks();
});

function seedHeight(value: number) {
  writeHandoffEntry({ field: "heightCm", value, unit: "cm", method: "declared",
    calculator: "saddle-height", touchedAt: Date.now() });
}

describe("homepage saddle starting-point handoff", () => {
  it.each(["nl", "en"] as const)("carries the real widget selection through its CTA in %s", (locale) => {
    const home = render(<SaddleHeightTeaser locale={locale} />);
    const widgetCopy = homeSaddleWidget[locale];
    const copy = saddleReliabilityMessages[locale];
    expect(readHandoff().entries).toEqual([]);
    fireEvent.change(screen.getByRole("slider", { name: widgetCopy.height }), { target: { value: "190" } });
    expect(readHandoff().entries).toEqual([expect.objectContaining({ field: "heightCm", value: 190 })]);
    const link = screen.getByRole("link", { name: widgetCopy.refine });
    const href = link.getAttribute("href")!;
    expect(href).toBe(`/${locale}/calculators/saddle-height#inseam`);
    link.addEventListener("click", (event) => event.preventDefault());
    fireEvent.click(link);
    expect(readHandoff().entries).toEqual([
      expect.objectContaining({ field: "heightCm", value: 190, method: "declared", calculator: "saddle-height" }),
    ]);
    home.unmount();
    window.history.replaceState(null, "", href);
    render(<SaddleHeightExperience isNl={locale === "nl"} />);
    expect(screen.getByRole("slider", { name: copy.height }).getAttribute("aria-valuenow")).toBe("190");
    expect(document.activeElement).toBe(screen.getByRole("slider", { name: copy.inseam }));
    expect(screen.getByRole("slider", { name: copy.inseam }).getAttribute("aria-valuetext")).toBe(copy.missing);
    expect(screen.getByRole("button", { name: quickFixMessages[locale].full }).getAttribute("aria-pressed"))
      .toBe("true");
  });

  it.each(["nl", "en"] as const)("opens full advice at the inseam step with the chosen height (%s)", (locale) => {
    seedHeight(185);
    writeHandoffEntry({ field: "inseamCm", value: 88, unit: "cm", method: "measured",
      calculator: "frame-size", touchedAt: Date.now() });
    const stored = readHandoff();
    window.history.replaceState(null, "", `/${locale}/calculators/saddle-height#inseam`);
    const copy = saddleReliabilityMessages[locale];
    render(<SaddleHeightExperience isNl={locale === "nl"} />);
    expect(screen.getByRole("button", { name: quickFixMessages[locale].full }).getAttribute("aria-pressed"))
      .toBe("true");
    expect(screen.getByRole("slider", { name: copy.height }).getAttribute("aria-valuenow")).toBe("185");
    const inseam = screen.getByRole("slider", { name: copy.inseam });
    expect(inseam.getAttribute("aria-valuetext")).toBe("88 cm");
    expect(document.activeElement).toBe(inseam);
    expect(readHandoff()).toEqual(stored);
    expect(screen.queryByText(copy.example)).toBeNull();
    const result = calculatePublicSaddleHeight({ heightCm: 185, inseamCm: 88 }).result!;
    expect(screen.getByRole("img", { name: new RegExp(`${result.adviceMm} mm.*${result.lowerMm}.*${result.upperMm}`) }))
      .toBeTruthy();
    const height = screen.getByRole("slider", { name: copy.height });
    height.focus();
    fireEvent.keyDown(height, { key: "ArrowRight" });
    expect(document.activeElement).toBe(height);
    expect(height.getAttribute("aria-valuenow")).toBe("186");
  });

  it.each([[50, 130], [999, 220], [174.6, 175], [175, 175]])(
    "validates and clamps incoming height %s to the slider value %s", (value, expected) => {
      seedHeight(value);
      const before = readHandoff();
      window.history.replaceState(null, "", "/en/calculators/saddle-height#inseam");
      render(<SaddleHeightCalculatorForm />);
      expect(screen.getByRole("slider", { name: "Height" }).getAttribute("aria-valuenow")).toBe(String(expected));
      expect(readHandoff()).toEqual(before);
    },
  );

  it("uses an honest example if storage is absent instead of inventing a carried measurement", () => {
    window.history.replaceState(null, "", "/en/calculators/saddle-height#inseam");
    render(<SaddleHeightCalculatorForm />);
    expect(screen.getByText(saddleReliabilityMessages.en.example)).toBeTruthy();
    expect(screen.getByRole("slider", { name: "Height" }).getAttribute("aria-valuenow")).toBe("190");
    expect(document.activeElement).toBe(screen.getByRole("slider", { name: "Inseam" }));
    expect(readHandoff().entries).toEqual([]);
  });

  it("restores this calculator's saved height without stealing focus on an ordinary visit", () => {
    seedHeight(175);
    window.history.replaceState(null, "", "/en/calculators/saddle-height");
    render(<SaddleHeightCalculatorForm />);
    expect(screen.getByRole("slider", { name: "Height" }).getAttribute("aria-valuenow")).toBe("175");
    expect(document.activeElement).not.toBe(screen.getByRole("slider", { name: "Inseam" }));
  });

  it("hydrates without mismatch and then applies session height and keyboard focus", async () => {
    seedHeight(175);
    window.history.replaceState(null, "", "/en/calculators/saddle-height#inseam");
    const recoverable = vi.fn();
    const container = document.createElement("div");
    container.innerHTML = renderToString(<SaddleHeightCalculatorForm />);
    document.body.append(container);
    let root: ReturnType<typeof hydrateRoot> | undefined;
    try {
      await act(async () => {
        root = hydrateRoot(container, <SaddleHeightCalculatorForm />, { onRecoverableError: recoverable });
      });
      expect(recoverable).not.toHaveBeenCalled();
      expect(screen.getByRole("slider", { name: "Height" }).getAttribute("aria-valuenow")).toBe("175");
      expect(document.activeElement).toBe(screen.getByRole("slider", { name: "Inseam" }));
    } finally {
      await act(async () => root?.unmount());
      container.remove();
    }
  });

  // Client-side navigation can render the calculator before "#inseam" is in the URL (seen in production).
  it("applies the homepage height from the session marker when the hash is not there yet", () => {
    seedHeight(185);
    markHomeSaddleStart();
    window.history.replaceState(null, "", "/en/calculators/saddle-height");
    render(<SaddleHeightCalculatorForm />);
    expect(screen.getByRole("slider", { name: "Height" }).getAttribute("aria-valuenow")).toBe("185");
    expect(document.activeElement).toBe(screen.getByRole("slider", { name: "Inseam" }));
    expect(sessionStorage.getItem(HOME_SADDLE_START_KEY)).toBeNull();
  });

  it("ignores a stale homepage marker on an ordinary visit", () => {
    seedHeight(185);
    sessionStorage.setItem(HOME_SADDLE_START_KEY, String(Date.now() - 120_000));
    window.history.replaceState(null, "", "/en/calculators/saddle-height");
    render(<SaddleHeightCalculatorForm />);
    expect(screen.getByRole("slider", { name: "Height" }).getAttribute("aria-valuenow")).toBe("185");
    expect(document.activeElement).not.toBe(screen.getByRole("slider", { name: "Inseam" }));
  });
});
