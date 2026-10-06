/* @vitest-environment jsdom */
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { PublicBodyReliabilityCalculator } from "./PublicBodyReliabilityCalculator";
import { readHandoff, writeHandoffEntry } from "@/lib/handoff/store";
import { runBikeFitCalculation, runCrankLengthCalculation } from "@/lib/public-calculators/fitAdapters";
import { calculateSaddleWidth } from "@/lib/saddle-width-engine";
import { calculateSaddleHeight } from "../../../shared/reliability/saddleHeight";
import { getReliabilityRange } from "../../../shared/reliability/calculators";
import { reliabilityBodyMessages } from "@/i18n/calculators/reliabilityBody";

afterEach(() => { cleanup(); sessionStorage.clear(); localStorage.clear(); });

function seed(method: "measured" | "declared" = "measured", inseam = 89) {
  writeHandoffEntry({ field: "heightCm", value: 190, unit: "cm", calculator: "saddle-height",
    method: "declared", touchedAt: Date.now() });
  writeHandoffEntry({ field: "inseamCm", value: inseam, unit: "cm", calculator: "saddle-height",
    method, touchedAt: Date.now() });
}

describe("Public body calculator integration", () => {
  it.each(["nl", "en"] as const)("describes the frame-size height/category basis in %s with or without measured inseam", locale => {
    const copy = reliabilityBodyMessages[locale];
    const initial = render(<PublicBodyReliabilityCalculator calculator="frame-size" locale={locale} />);
    const initialRow = initial.container.querySelector('[data-reliability-result="frameSize"]')!;
    expect(initialRow.textContent).toContain(copy.frameSizeBasis);
    expect(initialRow.textContent).not.toContain(copy.derived);
    initial.unmount();
    seed();
    const reused = render(<PublicBodyReliabilityCalculator calculator="frame-size" locale={locale} />);
    const reusedRow = reused.container.querySelector('[data-reliability-result="frameSize"]')!;
    expect(reusedRow.textContent).toContain(copy.frameSizeBasis);
    expect(reusedRow.textContent).not.toContain(copy.measured);
    expect(reusedRow.textContent).not.toContain(copy.declared);
  });

  it.each(["bike-fit", "frame-size", "crank-length"] as const)("reuses measured height/inseam in %s", calculator => {
    seed();
    render(<PublicBodyReliabilityCalculator calculator={calculator} locale="nl" />);
    expect(screen.getByText("Uit je eerdere invoer")).toBeTruthy();
    expect(screen.getByRole("slider", { name: "Lichaamslengte" }).getAttribute("aria-valuenow")).toBe("190");
    expect(screen.getByRole("slider", { name: "Binnenbeenlengte" }).getAttribute("aria-valuenow")).toBe("89");
    expect(readHandoff().entries).toHaveLength(2);
  });

  it("uses actual A–D engine centres and shared uncertainty; city retains a signed drop", () => {
    seed();
    const { container } = render(<PublicBodyReliabilityCalculator calculator="bike-fit" locale="en" />);
    fireEvent.click(screen.getByRole("radio", { name: "City bike" }));
    const { fitResult: fit } = runBikeFitCalculation({ heightCm: 190, inseamCm: 89, category: "city",
      ridingGoal: "balanced", flexibility: 3, coreStability: 3 });
    const values = { saddleHeight: fit.saddleHeightMm, saddleSetback: fit.saddleSetbackMm,
      handlebarDrop: fit.barDropMm, reach: fit.saddleToBarReachMm } as const;
    for (const [metric, centre] of Object.entries(values)) {
      const row = container.querySelector(`[data-reliability-result="${metric}"]`)!;
      const range = getReliabilityRange({ metric: metric as keyof typeof values, value: centre,
        evidence: { inseamCm: 89, inseamProvenance: { kind: "measured" } } })!;
      expect(row.textContent).toContain(String(centre));
      expect(row.textContent).toContain(`±${range.halfWidth}`);
      expect(row.querySelector('[role="img"]')?.getAttribute("aria-label")).toContain(String(centre));
    }
    expect(fit.barDropMm).toBeLessThan(0);
    expect(container.querySelectorAll("[data-reliability-result]")).toHaveLength(4);
  });

  it("never upgrades declared prefills or a bike selection into a measured inseam", () => {
    seed("declared");
    const { container } = render(<PublicBodyReliabilityCalculator calculator="bike-fit" locale="en" />);
    const row = () => container.querySelector('[data-reliability-result="saddleHeight"]')!;
    expect(row().textContent).toContain("±49");
    fireEvent.click(screen.getByRole("radio", { name: "Gravel" }));
    expect(readHandoff().entries.find(entry => entry.field === "inseamCm")?.method).toBe("declared");
    fireEvent.keyDown(screen.getByRole("slider", { name: "Inseam" }), { key: "ArrowRight" });
    expect(readHandoff().entries.find(entry => entry.field === "inseamCm")?.method).toBe("estimated");
    expect(row().textContent).toContain("±49");
    fireEvent.click(screen.getByRole("radio", { name: "Measured" }));
    expect(readHandoff().entries.find(entry => entry.field === "inseamCm")?.method).toBe("measured");
    expect(row().textContent).toContain("±23");
  });

  it("keeps the measured interval broad until a plausibility check is confirmed", () => {
    seed("measured", 96);
    const { container } = render(<PublicBodyReliabilityCalculator calculator="bike-fit" locale="en" />);
    expect(screen.getByText(reliabilityBodyMessages.en.check)).toBeTruthy();
    const band = () => container.querySelector('[data-reliability-result="saddleHeight"] [data-range-zone]')!;
    expect(band().className).toContain("border-dashed");
    fireEvent.click(screen.getByRole("button", { name: reliabilityBodyMessages.en.confirmCheck }));
    expect(band().className).not.toContain("border-dashed");
  });

  it("uses height rather than a substantially implausible measurement without altering stored input", () => {
    seed("measured", 103);
    const { container } = render(<PublicBodyReliabilityCalculator calculator="bike-fit" locale="nl" />);
    expect(screen.getByText(reliabilityBodyMessages.nl.large)).toBeTruthy();
    const estimated = calculateSaddleHeight({ heightCm: 190 }).inseamMm / 10;
    const result = runBikeFitCalculation({ heightCm: 190, inseamCm: estimated, category: "road",
      ridingGoal: "balanced", flexibility: 3, coreStability: 3 });
    expect(container.querySelector('[data-reliability-result="saddleHeight"]')?.textContent)
      .toContain(String(result.fitResult.saddleHeightMm));
    expect(readHandoff().entries.find(entry => entry.field === "inseamCm")?.value).toBe(103);
  });

  it("shows the actual crank centre, three candidates and the MTB engine adjustment", () => {
    seed();
    render(<PublicBodyReliabilityCalculator calculator="crank-length" locale="en" />);
    const expected = runCrankLengthCalculation({ inseamCm: 89, category: "mtb" });
    fireEvent.click(screen.getByRole("radio", { name: "Mountain bike" }));
    expect(screen.getByRole("img").getAttribute("aria-label")).toContain(`Crank length: ${expected} mm`);
    expect(screen.getByRole("img").getAttribute("aria-label")?.split(";")[1].split(" – ")).toHaveLength(3);
  });

  it("uses the saddle-width engine and narrows only after a sit-bone measurement", () => {
    const { container } = render(<PublicBodyReliabilityCalculator calculator="saddle-width" locale="nl" />);
    const row = () => container.querySelector('[data-reliability-result="saddleWidth"]')!;
    expect(row().textContent).toContain("±15");
    fireEvent.keyDown(screen.getByRole("slider", { name: "Zitbotbreedte" }), { key: "ArrowRight" });
    const expected = calculateSaddleWidth({ inputMethod: "measured", sitBoneWidthMm: 123,
      ridingType: "endurance_road", postureCategory: "balanced" });
    expect(row().textContent).toContain(String(expected.finalRecommendedWidthMm));
    expect(row().textContent).toContain("±5");
    fireEvent.click(screen.getByRole("button", { name: reliabilityBodyMessages.nl.clear }));
    expect(row().textContent).toContain("±15");
    expect(readHandoff().entries).toHaveLength(0);
  });
});
