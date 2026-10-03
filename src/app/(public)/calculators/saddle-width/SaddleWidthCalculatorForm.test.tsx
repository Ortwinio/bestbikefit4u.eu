/* @vitest-environment jsdom */
import { act, cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { SaddleWidthCalculatorForm } from "./SaddleWidthCalculatorForm";
import { calculateSaddleWidth } from "@/lib/saddle-width-engine";
import { readHandoff } from "@/lib/handoff/store";
import { saddleWidthMessages } from "@/i18n/calculators/saddleWidth";

const { saveSession } = vi.hoisted(() => ({ saveSession: vi.fn().mockResolvedValue("session") }));
vi.mock("convex/react", () => ({ useMutation: () => saveSession }));
afterEach(() => {
  cleanup();
  sessionStorage.clear();
  vi.clearAllMocks();
  vi.useRealTimers();
});

describe("SaddleWidthCalculatorForm", () => {
  it("accepts account prefill without anonymous saves or mount callbacks", async () => {
    vi.useFakeTimers();
    const changed = vi.fn();
    render(<SaddleWidthCalculatorForm locale="nl" accountMode onValuesChange={changed}
      initialValues={{ inputMethod: "measured", sitBoneWidthMm: 132 }}
      statusSlot={<p>Opgeslagen</p>} headerSlot={<p>Mijn fietsen</p>} />);
    expect(screen.getByText("Mijn fietsen")).toBeTruthy();
    expect(screen.getByText("Opgeslagen")).toBeTruthy();
    expect(screen.getByRole("region", { name: saddleWidthMessages.nl.result })).toBeTruthy();
    expect(screen.queryByText(saddleWidthMessages.nl.example)).toBeNull();
    expect(changed).not.toHaveBeenCalled();
    fireEvent.keyDown(screen.getByRole("slider", { name: saddleWidthMessages.nl.sitBone }), { key: "ArrowRight" });
    expect(changed).toHaveBeenCalledWith(expect.objectContaining({ sitBoneWidthMm: 133 }));
    await act(async () => { vi.advanceTimersByTime(600); });
    expect(saveSession).not.toHaveBeenCalled();
  });

  it.each(["en", "nl"] as const)(
    "labels example data, real measured result, and input provenance in %s",
    (locale) => {
      const copy = saddleWidthMessages[locale];
      render(<SaddleWidthCalculatorForm locale={locale} />);
      expect(screen.getByRole("heading", { level: 1, name: copy.title })).toBeTruthy();
      expect(screen.getByText(copy.example)).toBeTruthy();
      const expected = calculateSaddleWidth({
        inputMethod: "measured",
        sitBoneWidthMm: 125,
        ridingType: "endurance_road",
        postureCategory: "balanced",
      });
      expect(
        within(screen.getByRole("region", { name: copy.exampleResult })).getAllByText(
          expected.finalRecommendedWidthMm,
        ),
      ).toHaveLength(1);
      expect(screen.getByText(copy.exampleTrust)).toBeTruthy();
      expect(screen.queryByRole("spinbutton")).toBeNull();
      expect(screen.queryByRole("combobox")).toBeNull();
      expect(saveSession).not.toHaveBeenCalled();
    },
  );

  it("keeps defaults unsaved and stores only a confirmed measured value in this browser session", async () => {
    vi.useFakeTimers();
    render(<SaddleWidthCalculatorForm locale="en" />);
    await act(async () => {
      vi.advanceTimersByTime(500);
    });
    expect(saveSession).not.toHaveBeenCalled();
    const slider = screen.getByRole("slider", { name: "Sit-bone width" });
    fireEvent.keyDown(slider, { key: "ArrowRight" });
    expect(slider.getAttribute("aria-valuetext")).toBe("126 mm");
    expect(screen.queryByText(saddleWidthMessages.en.example)).toBeNull();
    await act(async () => {
      vi.advanceTimersByTime(500);
    });
    expect(saveSession).not.toHaveBeenCalled();
    expect(readHandoff().entries).toEqual([
      expect.objectContaining({ field: "sitBoneWidthMm", value: 126, method: "measured" }),
    ]);
  });

  it(
    "switches to the real estimated path, requires every body measurement, and omits " +
      "inactive sit-bone data",
    async () => {
      vi.useFakeTimers();
      render(<SaddleWidthCalculatorForm locale="en" />);
      fireEvent.click(screen.getByRole("radio", { name: "Estimate from body measurements" }));
      expect(screen.queryByRole("slider", { name: "Sit-bone width" })).toBeNull();
      expect(screen.getByText("Lower confidence")).toBeTruthy();
      const height = screen.getByRole("slider", { name: "Height" });
      fireEvent.keyDown(height, { key: "ArrowRight" });
      await act(async () => {
        vi.advanceTimersByTime(500);
      });
      expect(saveSession).not.toHaveBeenCalled();
      fireEvent.keyDown(screen.getByRole("slider", { name: "Body weight" }), { key: "ArrowRight" });
      fireEvent.keyDown(screen.getByRole("slider", { name: "Hip circumference" }), {
        key: "ArrowRight",
      });
      await act(async () => {
        vi.advanceTimersByTime(500);
      });
      const expected = calculateSaddleWidth({
        inputMethod: "estimated",
        heightCm: 181,
        weightKg: 76,
        hipCircumferenceCm: 101,
        ridingType: "endurance_road",
        postureCategory: "balanced",
      });
      expect(saveSession).not.toHaveBeenCalled();
      expect(readHandoff().entries).toEqual([
        expect.objectContaining({ field: "heightCm", value: 181 }),
        expect.objectContaining({ field: "weightKg", value: 76 }),
      ]);
      expect(screen.getByRole("img").getAttribute("aria-label")).toContain(
        String(expected.finalRecommendedWidthMm),
      );
    },
  );

  it("uses engine input endpoints and does not call an out-of-bin result a supported size", () => {
    render(<SaddleWidthCalculatorForm locale="en" />);
    const slider = screen.getByRole("slider", { name: "Sit-bone width" });
    fireEvent.keyDown(slider, { key: "Home" });
    expect(slider.getAttribute("aria-valuetext")).toBe("60 mm");
    expect(screen.getByText(saddleWidthMessages.en.outside)).toBeTruthy();
    expect(
      screen.getByRole("list", { name: "Width classes" }).querySelector('[aria-current="true"]'),
    ).toBeNull();
    fireEvent.keyDown(slider, { key: "End" });
    expect(slider.getAttribute("aria-valuetext")).toBe("200 mm");
    fireEvent.keyDown(slider, { key: "ArrowRight" });
    expect(slider.getAttribute("aria-valuetext")).toBe("200 mm");
    fireEvent.click(screen.getByRole("button", { name: "TT / triathlon" }));
    fireEvent.click(screen.getByRole("radio", { name: "Aggressive" }));
    const result = calculateSaddleWidth({
      inputMethod: "measured",
      sitBoneWidthMm: 200,
      ridingType: "tt_triathlon",
      postureCategory: "aggressive",
    });
    expect(screen.getByRole("img").getAttribute("aria-label")).toContain(
      String(result.finalRecommendedWidthMm),
    );
  });
});
