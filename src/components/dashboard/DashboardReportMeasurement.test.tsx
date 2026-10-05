// @vitest-environment jsdom
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { getReliabilityDashboardCopy } from "@/i18n/account/reliabilityDashboard";
import { DashboardReportMeasurement, type DashboardReportMeasurementData } from "./DashboardReportMeasurement";

afterEach(cleanup);

const measurement: DashboardReportMeasurementData = {
  valueCm: 89.2,
  origin: "Measured, 1×",
  recordedAt: Date.UTC(2026, 9, 3, 12),
  check: "ok",
  currentHalfWidth: 23,
  repeatedHalfWidth: 18,
};

describe.each(["nl", "en"] as const)("dashboard measurement (%s)", locale => {
  const copy = getReliabilityDashboardCopy(locale);

  it("renders saved provenance, a semantic localized date and supplied range impact", () => {
    const { container } = render(<DashboardReportMeasurement measurement={measurement} locale={locale} />);
    expect(screen.getByRole("complementary", { name: copy.profile })).toBeTruthy();
    expect(screen.getByText(locale === "nl" ? "89,2 cm" : "89.2 cm")).toBeTruthy();
    expect(screen.getByText("Measured, 1×")).toBeTruthy();
    expect(screen.getByText(copy.checks.ok)).toBeTruthy();
    expect(container.querySelector("time")?.getAttribute("datetime")).toBe("2026-10-03T12:00:00.000Z");
    expect(container.querySelector("time")?.textContent).toBe(locale === "nl" ? "3 oktober 2026" : "October 3, 2026");
    expect(container.textContent).toContain(`${copy.impactNow} ± 23 mm, ${copy.impactAfter} ± 18 mm.`);
    expect(screen.getByRole("link", { name: copy.measureAgain }).getAttribute("href")).toBe(`/${locale}/tools/saddle-height`);
  });

  it("never substitutes today's date, a successful check or widths for missing data", () => {
    const { container } = render(<DashboardReportMeasurement locale={locale}
      measurement={{ valueCm: null, origin: null, recordedAt: null, check: "unknown" }} />);
    expect(screen.getAllByText(copy.missing)).toHaveLength(3);
    expect(screen.getByText(copy.checks.unknown)).toBeTruthy();
    expect(screen.queryByText(copy.checks.ok)).toBeNull();
    expect(container.querySelector("time")).toBeNull();
    expect(container.textContent).not.toContain("±");
  });

  it.each(["warning", "inconsistent", "confirmed"] as const)("shows textual check %s, independent of colour", check => {
    render(<DashboardReportMeasurement measurement={{ ...measurement, check }} locale={locale} />);
    expect(screen.getByText(copy.checks[check])).toBeTruthy();
  });

  it("does not promise an improvement when the supplied width is unchanged", () => {
    const { container } = render(<DashboardReportMeasurement locale={locale}
      measurement={{ ...measurement, recordedAt: NaN, repeatedHalfWidth: 23 }} />);
    expect(container.querySelector("time")).toBeNull();
    expect(container.textContent).not.toContain(copy.impactAfter);
  });
});
