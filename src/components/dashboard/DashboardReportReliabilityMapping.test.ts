import { describe, expect, it } from "vitest";
import type { ReliabilityRange } from "../../../shared/reliability/calculators";
import { dashboardMeasurementOrigin, mapDashboardGreatestGain, mapDashboardReliabilityRows } from "./DashboardReportReliabilityMapping";

const range: ReliabilityRange = {
  kind: "continuous", metric: "saddleHeight", value: 787, lower: 765, upper: 810,
  halfWidth: 23, widestHalfWidth: 49, scaleMin: 725.75, scaleMax: 848.25,
  basisKey: "measured", nextStepKey: "repeat-inseam", uncertaintyKey: "inseam",
};

describe.each(["nl", "en"] as const)("dashboard query presentation mapping (%s)", locale => {
  it("preserves C's numeric fields without reconstructing the interval or advice", () => {
    const [row] = mapDashboardReliabilityRows([range], locale);
    expect(row).toMatchObject({ key: "saddleHeight", value: 787, low: 765, high: 810,
      halfWidth: 23, min: 725.75, max: 848.25, dashed: false });
    expect(row.basis).toBe(locale === "nl" ? "Binnenbeen gemeten" : "Measured inseam");
  });

  it("maps reach's backend metric to D and localizes the supplied evidence", () => {
    const [row] = mapDashboardReliabilityRows([{ ...range, metric: "reach", basisKey: "profile-measurement" }], locale);
    expect(row.key).toBe("handlebarReach");
    expect(row.basis).toBe(locale === "nl" ? "Torso en arm gemeten, fietsgeometrie" : "Measured torso and arm, bike geometry");
  });

  it("ignores unsupported metrics and never presents unknown evidence as measured", () => {
    expect(mapDashboardReliabilityRows([{ ...range, metric: "speed" }], locale)).toEqual([]);
    const [row] = mapDashboardReliabilityRows([{ ...range, basisKey: "future-evidence" }], locale);
    expect(row.basis).toBe(locale === "nl" ? "Niet vastgelegd" : "Not recorded");
  });

  it("only marks the inseam-dependent saddle range dashed for an open inseam warning", () => {
    const rows = mapDashboardReliabilityRows([range, { ...range, metric: "reach" }], locale, true);
    expect(rows.map(row => row.dashed)).toEqual([true, false]);
  });

  it("distinguishes measured, declared, derived and professional provenance", () => {
    expect(dashboardMeasurementOrigin({ field: "inseamCm", kind: "measured", repeatCount: 3 }, locale))
      .toBe(locale === "nl" ? "Zelf gemeten, 3×" : "Self-measured, 3×");
    expect(dashboardMeasurementOrigin({ field: "inseamCm", kind: "measured", method: "fitter" }, locale))
      .toBe(locale === "nl" ? "Gemeten door een bikefitter" : "Measured by a bike fitter");
    expect(dashboardMeasurementOrigin({ field: "inseamCm", kind: "declared" }, locale))
      .toBe(locale === "nl" ? "Zelf opgegeven" : "Self-reported");
    expect(dashboardMeasurementOrigin({ field: "inseamCm", kind: "derived" }, locale))
      .toBe(locale === "nl" ? "Berekend uit andere maten" : "Calculated from other measurements");
  });

  it("does not invent provenance or a repeat count", () => {
    expect(dashboardMeasurementOrigin(null, locale)).toBeNull();
    expect(dashboardMeasurementOrigin({ field: "inseamCm", kind: "estimated", method: "legacy_unknown" }, locale)).toBeNull();
    expect(dashboardMeasurementOrigin({ field: "inseamCm", kind: "measured", repeatCount: NaN }, locale))
      .toBe(locale === "nl" ? "Zelf gemeten" : "Self-measured");
  });

  it("maps only the query-selected greatest gain, preserving its computed target", () => {
    expect(mapDashboardGreatestGain({ metric: "saddleHeight", nextStepKey: "repeat-inseam", halfWidth: 18 }, locale))
      .toEqual({ href: "/tools/saddle-height", text: locale === "nl"
        ? "Herhaal je binnenbeenmeting → Zadelhoogte ± 18 mm" : "Repeat your inseam measurement → Saddle height ± 18 mm" });
    expect(mapDashboardGreatestGain(null, locale)).toBeNull();
    expect(mapDashboardGreatestGain({ metric: "saddleHeight", nextStepKey: "future-step", halfWidth: 18 }, locale)).toBeNull();
  });
});
