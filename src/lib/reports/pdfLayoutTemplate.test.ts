import { describe, expect, it } from "vitest";
import { renderPdfReportHtml } from "@/lib/reports/pdfLayoutTemplate";
import { getReportV2Copy } from "@/lib/reports/reportV2Copy";
import { mapReportV2Payload } from "@/lib/reports/reportV2Mapper";

const copy = getReportV2Copy("en");
const report = mapReportV2Payload({
  session: {
    _id: "session_abc",
    bikeType: "road",
    ridingStyle: "sportive",
    primaryGoal: "performance",
    engineVersion: "v2",
  },
  recommendation: {
    engineVersion: "v2",
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
      stemAngleRecommendation: "-6°",
      crankLengthMm: 172.5,
      handlebarWidthMm: 420,
    },
    frameSizeRecommendations: [{ size: "56", fitScore: 92 }],
    fitNotes: ["Confirm long-ride comfort after each adjustment."],
    recommendationItems: [],
    pressureInsights: {
      comfortBias: "balanced",
      stabilityScore: 0.8,
      warnings: [],
      version: 1,
    },
  },
  bike: {
    bikeType: "road",
    bikeWeightKg: 8.2,
    currentSetup: { saddleHeightMm: 750 },
  },
  bikeProfile: null,
  profile: { weightKg: 72 },
  latestPressureCalculation: {
    recommendedFrontPsi: 67,
    recommendedRearPsi: 71,
    recommendedFrontBar: 4.6,
    recommendedRearBar: 4.9,
    comfortScore: 0.7,
    gripScore: 0.75,
    efficiencyScore: 0.72,
    inputSnapshot: {
      bodyWeightKg: 72,
      surface: "average_asphalt",
      ridingGoal: "balance",
    },
  },
} as never);

describe("pdf layout template", () => {
  it("renders required report-v2 sections", () => {
    const html = renderPdfReportHtml({ report, copy });

    expect(html).toContain(copy.sections.profile);
    expect(html).toContain(copy.sections.prioritySummary);
    expect(html).toContain(copy.sections.detailedFit);
    expect(html).toContain(copy.sections.adjustmentSequence);
    expect(html).toContain(copy.sections.tirePressure);
    expect(html).toContain(copy.sections.validationPlan);
  });

  it("includes expected fixture metrics in rendered HTML", () => {
    const html = renderPdfReportHtml({ report, copy });

    expect(html).toContain("754 mm");
    expect(html).toContain("731 mm - 774 mm");
    expect(html).toContain("98 mm");
    expect(html).toContain("67 psi");
    expect(html).toContain("Confirm long-ride comfort after each adjustment.");
  });

  it("renders bike image when available", () => {
    const html = renderPdfReportHtml({
      report: {
        ...report,
        profile: {
          ...report.profile,
          bikeImageUrl: "https://example.com/bike.jpg",
        },
      },
      copy,
    });

    expect(html).toContain("https://example.com/bike.jpg");
    expect(html).toContain("Bike photo");
  });
});
