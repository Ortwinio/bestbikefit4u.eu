import { describe, expect, it } from "vitest";
import { renderPdfReportHtml } from "./pdfLayoutTemplate";
import { getReportV2Copy } from "./reportV2Copy";
import { reportPdfFixture as report } from "../../../tests/fixtures/reportPdf";

const copy = getReportV2Copy("en");

describe("six-page PDF report", () => {
  it.each(["nl", "en"] as const)(
    "renders six numbered A4 sheets in the required board order (%s)",
    (locale) => {
      const html = renderPdfReportHtml({ report, copy: getReportV2Copy(locale) });
      expect(html).toContain(`<html lang="${locale}">`);
      expect([...html.matchAll(/data-board="([^"]+)"/g)].map((match) => match[1])).toEqual([
        "FitRapport1",
        "FitRapport6",
        "FitRapport2",
        "FitRapport5",
        "FitRapport3",
        "FitRapport4",
      ]);
      for (let page = 1; page <= 6; page++) {
        expect(html).toContain(`data-report-page="${page}"`);
        expect(html).toContain(`${page} / 6`);
      }
      expect(html.match(/class="report-header"/g)).toHaveLength(6);
      expect(html.match(/class="report-footer"/g)).toHaveLength(6);
      expect(html).toContain("print-color-adjust:exact");
    },
  );

  it("embeds all three fonts, logo and illustrations without external network dependencies", () => {
    const html = renderPdfReportHtml({ report, copy });
    for (const font of ["Bricolage Grotesque", "Figtree", "DM Mono"]) expect(html).toContain(font);
    expect(html.match(/data:font\/woff2;base64,/g)).toHaveLength(9);
    expect(html).toContain("data:image/svg+xml;base64,");
    expect(html).toContain("data:image/png;base64,");
    expect(html).not.toContain("fonts.googleapis.com");
    expect(html).not.toContain("/_blob/");
  });

  it("uses changed session measurements in the A-D diagram instead of canvas examples", () => {
    const targets = {
      saddleHeight: "799 mm",
      saddleSetback: "63 mm",
      handlebarDrop: "27 mm",
      handlebarReach: "501 mm",
    };
    const html = renderPdfReportHtml({
      report: {
        ...report,
        detailedFit: report.detailedFit.map((row) => ({
          ...row,
          targetLabel: targets[row.key as keyof typeof targets] ?? row.targetLabel,
        })),
      },
      copy,
    });
    const summary = html.split('data-board="FitRapport1"')[1].split("</article>")[0];
    for (const value of Object.values(targets)) expect(summary).toContain(value);
    expect(html).not.toContain("Lisa Jansen");
    expect(html).not.toContain("14 / 19");
  });

  it("hides measurements, scores, pressure recommendations and ranges without source data", () => {
    const sparse = {
      ...report,
      rider: {
        ...report.rider,
        heightCm: null,
        weightKg: null,
        inseamCm: null,
        armLengthCm: null,
        torsoLengthCm: null,
        shoulderWidthCm: null,
        flexibilityScore: null,
        coreStabilityScore: null,
        comfortScore: null,
      },
      detailedFit: [],
      prioritySummary: [],
      adjustmentSequence: [],
      fitNotes: [],
      frameTargets: { stackMm: 0, reachMm: 0, effectiveTopTubeMm: 0, recommendedFrameLabel: null },
      tirePressure: { status: "pending_required_inputs" as const, required: [], quickStartTable: [] },
    };
    const html = renderPdfReportHtml({ report: sparse, copy });
    expect(html.match(/data-report-page=/g)).toHaveLength(6);
    for (const value of ["754 mm", "731 mm", "4.6", "67 psi", "undefined", ">null<"]) {
      expect(html).not.toContain(value);
    }
    expect(html).not.toContain("data-measurement=");
    expect(html).not.toContain('data-score="flexibility"');
  });

  it("escapes session text and preserves zero-valued valid targets", () => {
    const html = renderPdfReportHtml({
      report: {
        ...report,
        rider: { ...report.rider, name: '<img src=x onerror="alert(1)">' },
        detailedFit: report.detailedFit.map((row) =>
          row.key === "handlebarDrop" ? { ...row, targetLabel: "0 mm" } : row,
        ),
      },
      copy,
    });
    expect(html).not.toContain("<img src=x");
    expect(html).toContain("&lt;img src=x");
    expect(html).toContain("0 mm");
  });
});
