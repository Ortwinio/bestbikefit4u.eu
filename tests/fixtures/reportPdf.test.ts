import { describe, expect, it } from "vitest";
import { reportPdfFixture, reportPdfFullEngine, reportPdfFullFixture } from "./reportPdf";

describe("full report PDF fixture", () => {
  it("includes actual stored discomfort/current frame and generated-note template values", () => {
    expect(reportPdfFullFixture.rider.painAreas).toEqual(["knee_front"]);
    expect(reportPdfFullFixture.bike.currentFrameSize).toBe("56");
    expect(reportPdfFullFixture.fitNotes[0]).toBe(
      `Saddle height of ${reportPdfFullEngine.fitOutputs.saddleHeightMm}mm is optimized for your 840mm inseam.`,
    );
    expect(reportPdfFullFixture.fitNotes).not.toContain("Confirm long-ride comfort after each adjustment.");
  });

  it("preserves every engine-supported range and leaves unsupported ranges absent", () => {
    const rows = reportPdfFullFixture.detailedFit;
    expect(rows.filter((row) => row.rangeLabel !== null).map((row) => row.key)).toEqual([
      "saddleHeight",
      "handlebarDrop",
      "handlebarReach",
    ]);
    const outputs = reportPdfFullEngine.fitOutputs;
    for (const [key, range] of [
      ["saddleHeight", outputs.saddleHeightRange],
      ["handlebarDrop", outputs.barDropRange],
      ["handlebarReach", outputs.reachRange],
    ] as const) {
      expect(rows.find((row) => row.key === key)?.rangeLabel).toBe(`${range.min} mm - ${range.max} mm`);
    }
    expect(rows.find((row) => row.key === "stem")?.targetLabel).toContain(
      String(reportPdfFullEngine.calculatedFit.stemLengthMm),
    );
    expect(reportPdfFixture.detailedFit.filter((row) => row.rangeLabel !== null)).toHaveLength(1);
  });

  it("carries supported questionnaire context without confusing hours with ride distance", () => {
    expect(reportPdfFullFixture.bike.questionnaire).toEqual({
      experienceLevel: "intermediate",
      weeklyHours: "6-10",
      rideLength: "long",
      positionPriority: "performance",
      typeOfRiding: "group",
    });
  });
});
