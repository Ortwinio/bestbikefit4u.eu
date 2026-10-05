// @vitest-environment jsdom
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { calculateAccountSaddleHeight } from "../../../shared/reliability/accountSaddle";
import type { SaddleHeightProvenance } from "../../../shared/reliability/saddleHeight";
import { DashboardReportMeasurementPanel, mapDashboardReportMeasurement } from "./DashboardReportMeasurementPanel";

const mocks = vi.hoisted(() => ({ authenticated: true, query: vi.fn() }));
vi.mock("convex/react", () => ({ useQuery: (...args: unknown[]) => mocks.query(...args),
  useConvexAuth: () => ({ isAuthenticated: mocks.authenticated }) }));

type State = Parameters<typeof mapDashboardReportMeasurement>[0];
function fixture(provenance: SaddleHeightProvenance = { kind: "measured", repeatCount: 1 }) {
  return {
    profile: { heightCm: 190, inseamCm: 89 },
    observations: [{ field: "inseamCm", value: 89, ...provenance, recordedAt: Date.UTC(2026, 9, 3, 12) }],
    model: calculateAccountSaddleHeight({ heightCm: 190, inseamCm: 89, provenance, flexibilityScore: 2, goal: "performance" }),
  } as unknown as State;
}

afterEach(cleanup);
beforeEach(() => { mocks.authenticated = true; mocks.query.mockReset().mockReturnValue(fixture()); });

describe.each(["nl", "en"] as const)("dashboard profile query mapping (%s)", locale => {
  it("uses saved provenance and C's model for present and potential widths", () => {
    expect(mapDashboardReportMeasurement(fixture(), locale)).toEqual({
      valueCm: 89, origin: locale === "nl" ? "Zelf gemeten, 1×" : "Self-measured, 1×",
      recordedAt: Date.UTC(2026, 9, 3, 12), check: "ok", currentHalfWidth: 23, repeatedHalfWidth: 18,
    });
  });

  it("does not label a legacy profile creation timestamp as a measurement date", () => {
    const mapped = mapDashboardReportMeasurement(fixture({ kind: "estimated", method: "legacy_unknown" }), locale);
    expect(mapped.origin).toBeNull();
    expect(mapped.recordedAt).toBeNull();
    expect(mapped.currentHalfWidth).toBe(49);
  });

  it("prioritizes open warnings and failed repeat tolerance over a plausible mean", () => {
    expect(mapDashboardReportMeasurement(fixture({ kind: "measured", unresolvedWarning: true }), locale).check).toBe("warning");
    expect(mapDashboardReportMeasurement(fixture({ kind: "measured", repeatCount: 3, withinTolerance: false }), locale).check).toBe("inconsistent");
    expect(mapDashboardReportMeasurement(fixture({ kind: "measured", repeatCount: 3, withinTolerance: true }), locale).repeatedHalfWidth).toBeNull();
  });

  it("does not convert a height-derived inseam into a stored measurement", () => {
    const state = { ...fixture(), profile: { heightCm: 190 }, observations: [],
      model: calculateAccountSaddleHeight({ heightCm: 190 }) } as unknown as State;
    expect(mapDashboardReportMeasurement(state, locale)).toEqual({ valueCm: null, origin: null,
      recordedAt: null, check: "unknown", currentHalfWidth: null, repeatedHalfWidth: null });
  });

  it("skips private queries while logged out and avoids placeholder data while loading", () => {
    mocks.authenticated = false;
    const view = render(<DashboardReportMeasurementPanel locale={locale} />);
    expect(mocks.query.mock.lastCall?.[1]).toBe("skip");
    expect(view.container.textContent).toBe("");
    mocks.authenticated = true;
    mocks.query.mockReturnValue(undefined);
    view.rerender(<DashboardReportMeasurementPanel locale={locale} />);
    expect(screen.queryByRole("complementary")).toBeNull();
  });
});
