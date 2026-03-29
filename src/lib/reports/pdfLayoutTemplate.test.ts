import { describe, expect, it } from "vitest";
import {
  renderPdfFooterTemplate,
  renderPdfHeaderTemplate,
  renderPdfReportHtml,
} from "@/lib/reports/pdfLayoutTemplate";
import { getReportV2Copy } from "@/lib/reports/reportV2Copy";
import { mapReportV2Payload } from "@/lib/reports/reportV2Mapper";

const copy = getReportV2Copy("en");
const report = mapReportV2Payload({
  session: {
    _id: "session_abc",
    createdAt: Date.UTC(2026, 2, 20, 10, 0, 0),
    completedAt: Date.UTC(2026, 2, 21, 14, 30, 0),
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
    name: "Canyon Endurace",
    bikeType: "road",
    brand: "Canyon",
    model: "CF 7",
    ridingStyle: "sportive",
    primaryGoal: "performance",
    description: "An endurance road bike tuned for long fast rides.",
    bikeWeightKg: 8.2,
    currentSetup: { saddleHeightMm: 750 },
  },
  bikeProfile: null,
  profile: {
    heightCm: 180,
    weightKg: 72,
    inseamCm: 84,
    armLengthCm: 62,
    torsoLengthCm: 60.4,
    shoulderWidthCm: 40,
    flexibilityScore: "good",
    coreStabilityScore: 4,
    hasPain: "yes",
    painSeverity: 2,
  },
  user: {
    displayName: "Ortwin",
  },
  riderImageUrl: "https://example.com/rider.jpg",
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

    expect(html).toContain(copy.sections.about);
    expect(html).toContain(copy.sections.rider);
    expect(html).toContain(copy.sections.flexibility);
    expect(html).toContain(copy.sections.coreStability);
    expect(html).toContain(copy.sections.comfort.replace("&", "&amp;"));
    expect(html).toContain(copy.sections.yourBike);
    expect(html).toContain(copy.sections.prioritySummary);
    expect(html).toContain(copy.sections.detailedFit);
    expect(html).toContain(copy.sections.adjustmentSequence);
    expect(html).toContain(copy.sections.tirePressure);
    expect(html).toContain(copy.sections.validationPlan);
  });

  it("includes expected fixture metrics in rendered HTML", () => {
    const html = renderPdfReportHtml({ report, copy });

    expect(html).toContain("BestBikeFit4U");
    expect(html).toContain(copy.shell.dateLabel);
    expect(html).toContain(copy.shell.aboutTitle);
    expect(html).toContain("Ortwin");
    expect(html).toContain("Canyon Endurace");
    expect(html).toContain("https://example.com/rider.jpg");
    expect(html).toContain("72");
    expect(html).toContain("754 mm");
    expect(html).toContain("731 mm - 774 mm");
    expect(html).toContain("98 mm");
    expect(html).toContain("67 psi");
    expect(html).toContain("tp-visual-track");
    expect(html).toContain("tp-visual-fill");
    expect(html).toContain("60 <span class=\"tile-unit\">cm</span>");
    expect(html).toContain("Confirm long-ride comfort after each adjustment.");
    expect(html).toContain("status-badge");
    expect(html).toContain("adj-list");
    expect(html).toContain("fit-notes-box");
    expect(html.match(/class="status-badge /g)?.length).toBe(report.prioritySummary.length);
    expect(html.match(/class="adj-item"/g)?.length).toBe(report.adjustmentSequence.length);
  });

  it("renders bike image when available", () => {
    const html = renderPdfReportHtml({
      report: {
        ...report,
        bike: {
          ...report.bike,
          imageUrl: "https://example.com/bike.jpg",
        },
      },
      copy,
    });

    expect(html).toContain("https://example.com/bike.jpg");
    expect(html).toContain("Canyon Endurace");
  });

  it("renders locale-aware html lang and localized cover copy", () => {
    const dutchCopy = getReportV2Copy("nl");
    const html = renderPdfReportHtml({ report, copy: dutchCopy });

    expect(html).toContain('<html lang="nl">');
    expect(html).toContain(dutchCopy.sections.about);
    expect(html).toContain(dutchCopy.shell.aboutTitle);
    expect(html).toContain(dutchCopy.shell.dateLabel);
    expect(html).toContain("Racefiets");
    expect(html).toContain("Sportief");
    expect(html).toContain("Prestatie");
  });

  it("renders localized print header and footer templates", () => {
    const dutchCopy = getReportV2Copy("nl");
    const header = renderPdfHeaderTemplate({ report, copy: dutchCopy });
    const footer = renderPdfFooterTemplate();

    expect(header).toContain("Rapportdatum");
    expect(header).toContain("Engine-gestuurd fitrapport");
    expect(header).toContain("data:image/svg+xml");
    expect(footer).toContain("Copyrights BestBikefit4U.eu");
    expect(footer).toContain("pageNumber");
  });

  it("hides rider score sections cleanly when rider data is missing", () => {
    const html = renderPdfReportHtml({
      report: {
        ...report,
        rider: {
          name: null,
          heightCm: null,
          weightKg: null,
          inseamCm: null,
          armLengthCm: null,
          torsoLengthCm: null,
          shoulderWidthCm: null,
          bmi: null,
          bmiCategory: null,
          flexibilityScore: null,
          flexibilityLabel: null,
          coreStabilityScore: null,
          comfortScore: null,
        },
      },
      copy,
    });

    expect(html).not.toContain(copy.sections.flexibility);
    expect(html).not.toContain(copy.sections.coreStability);
    expect(html).not.toContain(copy.sections.comfort);
    expect(html).not.toContain("undefined");
    expect(html).not.toContain("null");
  });

  it("includes explicit print-safety rules for long content and heading breaks", () => {
    const html = renderPdfReportHtml({
      report: {
        ...report,
        bike: {
          ...report.bike,
          description: "Long description ".repeat(80),
        },
      },
      copy,
    });

    expect(html).toContain("overflow-wrap: anywhere");
    expect(html).toContain("page-break-after: avoid");
    expect(html).toContain("Long description Long description");
  });
});
