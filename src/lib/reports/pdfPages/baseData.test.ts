import { describe, expect, it } from "vitest";
import { reportPdfFixture } from "../../../../tests/fixtures/reportPdf";
import { getReportV2Copy, PDF_BASE_DATA_COPY } from "../reportV2Copy";
import type { PdfReportAssets } from "../pdfShared";
import { renderBaseDataPage } from "./baseData";

const assets: PdfReportAssets = { logo: "", bikeDimensions: "", pressure: "", measureSet: "", stackReach: "" };

for (const locale of ["en", "nl"] as const) {
  const copy = getReportV2Copy(locale);
  const text = PDF_BASE_DATA_COPY[locale];
  describe(`base-data PDF page (${locale})`, () => {
    it("renders actual mapped measurements, localized questionnaire answers and five segments per score", () => {
      const report = structuredClone(reportPdfFixture);
      report.bike.questionnaire = {
        experienceLevel: "advanced",
        weeklyHours: "6-10",
        rideLength: "long",
        positionPriority: "balanced",
        typeOfRiding: "group",
      };
      const html = renderBaseDataPage(report, copy, assets);
      expect(html).toContain(text.title);
      expect(html).toContain(report.rider.name);
      expect(html).toContain(report.bike.name);
      expect(html).toContain(`<dd>${report.rider.heightCm}<span`);
      expect(html).toContain(`<dd>${report.rider.inseamCm}<span`);
      expect(html.match(/class="pdf-base-segment"/g)).toHaveLength(15);
      expect(html).toContain(locale === "nl" ? "Vergevorderd" : "Advanced");
      expect(html).toContain(locale === "nl" ? "6-10 uur/week" : "6-10 hrs/week");
      expect(html).not.toContain("14/19");
      expect(html).toContain(text.coreStability);
      if (locale === "nl") expect(html).not.toContain("Core stability");
      expect(html).not.toContain('class="pdf-base-improve"');
    });

    it("hides absent measurements, extra tiles and the entire rider panel when no rider data is available", () => {
      const report = structuredClone(reportPdfFixture);
      Object.assign(report.rider, {
        heightCm: null,
        inseamCm: null,
        weightKg: null,
        armLengthCm: null,
        torsoLengthCm: null,
        shoulderWidthCm: null,
        flexibilityScore: null,
        coreStabilityScore: null,
        comfortScore: null,
        painAreas: [],
      });
      const html = renderBaseDataPage(report, copy, assets);
      expect(html).not.toContain('class="pdf-base-rider"');
      expect(html).not.toContain('class="pdf-base-metrics"');
      expect(html).not.toContain('class="pdf-base-metric');
      expect(html).toContain(text.improveTitle);
      expect(html).toContain(report.bike.name);
    });

    it("renders only reported pain areas and the current frame size, with safe freeform text", () => {
      const report = structuredClone(reportPdfFixture);
      report.rider.painAreas = ["knee_front", "lower_back", "sit_bones", '<img src=x onerror="bad()">'];
      report.bike.currentFrameSize = "Custom 58 & XL";
      report.frameTargets.recommendedFrameLabel = "Recommended 999";
      const html = renderBaseDataPage(report, copy, assets);
      expect(html).toContain(text.painAreas);
      expect(html).toContain(text.painAreaLabels.knee_front);
      expect(html).toContain(text.painAreaLabels.lower_back);
      expect(html).toContain(text.painAreaLabels.sit_bones);
      expect(html).toContain("&lt;img src=x");
      expect(html).not.toContain("<img src=x");
      expect(html).toContain(`<dt>${text.currentFrameSize}</dt>`);
      expect(html).toContain("Custom 58 &amp; XL");
      expect(html).not.toContain("Recommended 999");
    });

    it("hides absent discomfort and frame fields without recommended-frame substitution", () => {
      const report = structuredClone(reportPdfFixture);
      delete report.rider.painAreas;
      delete report.bike.currentFrameSize;
      report.frameTargets.recommendedFrameLabel = "Recommended 999";
      const html = renderBaseDataPage(report, copy, assets);
      expect(html).not.toContain('class="pdf-base-pain"');
      expect(html).not.toContain(`<dt>${text.currentFrameSize}</dt>`);
      expect(html).not.toContain("Recommended 999");
    });

    it("keeps actual zero and fractional scores without inventing a category", () => {
      const report = structuredClone(reportPdfFixture);
      report.rider.flexibilityScore = null;
      report.rider.coreStabilityScore = 0;
      report.rider.comfortScore = 3.5;
      const html = renderBaseDataPage(report, copy, assets);
      expect(html.match(/class="pdf-base-segment"/g)).toHaveLength(10);
      expect(html).toContain('data-score="0"');
      expect(html).toContain("0/5");
      expect(html).toContain(locale === "nl" ? "3,5/5" : "3.5/5");
      expect(html).toContain('style="width:50%"');
      expect(html).not.toContain(copy.scoreMeta.coreStability.labels[1]);
    });

    it("omits invalid scores and only shows existing extra measurements", () => {
      const report = structuredClone(reportPdfFixture);
      Object.assign(report.rider, {
        flexibilityScore: Number.NaN,
        coreStabilityScore: -1,
        comfortScore: 6,
        armLengthCm: 62,
        torsoLengthCm: null,
        shoulderWidthCm: null,
        heightCm: null,
      });
      const html = renderBaseDataPage(report, copy, assets);
      expect(html).not.toContain('class="pdf-base-score"');
      expect(html).not.toContain(`<dt>${copy.rider.height}</dt>`);
      expect(html).toContain(copy.rider.armLength);
      expect(html).not.toContain(copy.rider.torsoLength);
      expect(html).not.toContain(copy.rider.shoulderWidth);
      expect(html).toContain(text.improveTitle);
    });

    it("escapes freeform data without enum-translating names or mutating the payload", () => {
      const report = structuredClone(reportPdfFixture);
      report.rider.name = '<script>alert("rider")</script>';
      report.bike.name = "performance";
      report.bike.brand = '<img src=x onerror="alert(1)">';
      report.bike.model = "Long model & edition ".repeat(12);
      const before = JSON.stringify(report);
      const html = renderBaseDataPage(report, copy, assets);
      expect(html).toContain("&lt;script&gt;");
      expect(html).toContain("&lt;img src=x");
      expect(html).not.toContain("<script>");
      expect(html).not.toContain("<img src=x");
      expect(html).toContain("<dd>performance</dd>");
      expect(html).toContain("Long model &amp; edition ".repeat(12));
      expect(JSON.stringify(report)).toBe(before);
    });
  });
}
