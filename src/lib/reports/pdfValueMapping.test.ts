import { describe, expect, it } from "vitest";
import {
  formatDateIso,
  formatStemAngle,
  mapPdfReportData,
  type FitSessionForPdf,
  type RecommendationForPdf,
} from "@/lib/reports/pdfValueMapping";

function buildFixture(): {
  session: FitSessionForPdf;
  recommendation: RecommendationForPdf;
} {
  return {
    session: {
      _id: "session_123",
      createdAt: 1765411200000,
      completedAt: 1765497600000,
      bikeType: "road",
      ridingStyle: "sportive",
      primaryGoal: "balanced",
    },
    recommendation: {
      algorithmVersion: "2.0.0",
      confidenceScore: 90,
      calculatedFit: {
        recommendedStackMm: 626,
        recommendedReachMm: 402,
        effectiveTopTubeMm: 588,
        saddleHeightMm: 754,
        saddleSetbackMm: 49,
        saddleHeightRange: { min: 731, max: 774 },
        handlebarDropMm: 98,
        handlebarReachMm: 538,
        stemLengthMm: 100,
        stemAngleRecommendation: "-6 deg",
        crankLengthMm: 172.5,
        handlebarWidthMm: 420,
      },
      frameSizeRecommendations: [
        {
          brand: "BrandX",
          size: "XL (59-62 cm equivalent)",
          fitScore: 92,
          notes: "Best match by stack/reach",
        },
      ],
      adjustmentPriorities: [
        {
          priority: 1,
          component: "Cleats",
          recommendedValue: "3mm behind ball of foot",
          rationale: "Start with foot alignment",
        },
        {
          priority: 2,
          component: "Saddle Height",
          recommendedValue: "9999mm",
          rationale: "Conflicting test value should not override canonical fit",
        },
        {
          priority: 3,
          component: "Saddle Setback",
          recommendedValue: "8888mm behind BB",
          rationale: "Conflicting test value should not override canonical fit",
        },
      ],
      fitNotes: ["Test note 1", "Test note 2"],
    },
  };
}

describe("pdf value mapping", () => {
  it("maps numeric report values from canonical calculatedFit fields", () => {
    const model = mapPdfReportData(buildFixture());

    const saddleHeightRow = model.coreTargets.find(
      (row) => row.parameter === "Saddle height"
    );
    const barDropRow = model.coreTargets.find(
      (row) => row.parameter === "Handlebar drop"
    );

    expect(model.summaryCards[1]?.value).toBe("754 mm");
    expect(model.summaryCards[2]?.value).toBe("98 mm");
    expect(saddleHeightRow?.target).toBe("754 mm");
    expect(saddleHeightRow?.range).toBe("731-774 mm");
    expect(barDropRow?.target).toBe("98 mm");
  });

  it("does not parse measured numeric outputs from adjustment free text", () => {
    const model = mapPdfReportData(buildFixture());
    const saddleHeightRow = model.coreTargets.find(
      (row) => row.parameter === "Saddle height"
    );

    expect(model.priorityChanges[1]).toContain("9999mm");
    expect(saddleHeightRow?.target).toBe("754 mm");
  });

  it("normalizes date and stem angle formatting", () => {
    expect(formatDateIso(1765411200000)).toBe("2025-12-11");
    expect(formatStemAngle("-6 deg")).toBe("-6°");
  });
});
