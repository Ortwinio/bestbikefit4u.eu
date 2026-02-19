import { describe, expect, it } from "vitest";
import { renderPdfReportHtml } from "@/lib/reports/pdfLayoutTemplate";
import { mapPdfReportData } from "@/lib/reports/pdfValueMapping";

const report = mapPdfReportData({
  session: {
    _id: "session_abc",
    createdAt: 1765411200000,
    completedAt: 1765497600000,
    bikeType: "road",
    ridingStyle: "sportive",
    primaryGoal: "performance",
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
      stemAngleRecommendation: "-6°",
      crankLengthMm: 172.5,
      handlebarWidthMm: 420,
    },
    frameSizeRecommendations: [
      {
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
        recommendedValue: "754mm",
        rationale: "Set saddle height before cockpit updates",
      },
      {
        priority: 3,
        component: "Saddle Setback",
        recommendedValue: "49mm behind BB",
        rationale: "Stabilize hip position",
      },
    ],
    fitNotes: ["Confirm long-ride comfort after each adjustment."],
  },
});

describe("pdf layout template", () => {
  it("renders required sections and deterministic page breaks", () => {
    const html = renderPdfReportHtml({ report });

    const pageBreakCount = (html.match(/class="pageBreak"/g) || []).length;

    expect(html).toContain("Fit Recommendation Report");
    expect(html).toContain("Core fit targets");
    expect(html).toContain("Implementation plan");
    expect(html).toContain("Measurement guide");
    expect(pageBreakCount).toBe(2);
  });

  it("uses fallback blocks when optional assets are missing", () => {
    const html = renderPdfReportHtml({ report, assets: {} });

    expect(html).toContain("Hero image unavailable in this runtime.");
    expect(html).toContain(
      "Measurement guide image unavailable in this runtime."
    );
  });

  it("renders images when assets are provided", () => {
    const html = renderPdfReportHtml({
      report,
      assets: {
        logoUrl: "https://cdn.example/logo.png",
        heroUrl: "https://cdn.example/hero.png",
        iconCockpitUrl: "https://cdn.example/icon-cockpit.png",
        iconStepsUrl: "https://cdn.example/icon-steps.png",
        iconWarningUrl: "https://cdn.example/icon-warning.png",
        measurementGuideUrl: "https://cdn.example/measurement.png",
      },
    });

    expect(html).toContain('src="https://cdn.example/logo.png"');
    expect(html).toContain('src="https://cdn.example/hero.png"');
    expect(html).not.toContain("Hero image unavailable in this runtime.");
  });

  it("includes expected fixture metrics and ranges in rendered HTML", () => {
    const html = renderPdfReportHtml({ report });

    expect(html).toContain("754 mm");
    expect(html).toContain("731-774 mm");
    expect(html).toContain("98 mm");
    expect(html).toContain("49 mm");
    expect(html).toContain("538 mm");
    expect(html).toContain("Core fit targets");
    expect(html).toContain("Implementation plan");
    expect(html).toContain("Measurement guide");
  });
});
