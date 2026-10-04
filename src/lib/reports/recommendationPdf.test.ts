import { describe, expect, it } from "vitest";
import { buildRecommendationPdfLines } from "./recommendationPdf";

describe("core-only report export", () => {
  it.each(["nl", "en"] as const)("does not render paid narrative or derived plans in %s", locale => {
    const params = {
      locale, coreOnly: true,
      session: { _id: "session", createdAt: 1, ridingStyle: "road", primaryGoal: "comfort" },
      recommendation: {
        algorithmVersion: "test", confidenceScore: 80,
        calculatedFit: { saddleHeightMm: 720, saddleSetbackMm: 50, handlebarDropMm: 70,
          handlebarReachMm: 480, stemLengthMm: 100, crankLengthMm: 170, handlebarWidthMm: 420,
          recommendedStackMm: 560, recommendedReachMm: 390, effectiveTopTubeMm: 550,
          saddleHeightRange: { min: 715, max: 725 }, stemAngleRecommendation: "private-angle" },
        frameSizeRecommendations: [], fitNotes: ["private-note"],
        adjustmentPriorities: [{ priority: 1, component: "saddle", recommendedValue: "720", rationale: "private-rationale" }],
      },
    };
    const text = buildRecommendationPdfLines(params).join("\n");
    expect(text).toContain("720 mm");
    expect(text).toContain(locale === "nl" ? "Zadelhoogte" : "Saddle height");
    expect(text).not.toMatch(/private|Implementation|implementatie|Doelfocus|Goal Focus/);
  });
});
