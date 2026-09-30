import { describe, expect, it } from "vitest";
import { reportPdfFixture } from "../../../../tests/fixtures/reportPdf";
import { getReportV2Copy, PDF_PLAN_COPY } from "../reportV2Copy";
import type { PdfReportAssets } from "../pdfShared";
import { renderPlanPage } from "./plan";

const assets: PdfReportAssets = { logo: "", bikeDimensions: "", pressure: "", measureSet: "", stackReach: "" };
function fixture() {
  const report = structuredClone(reportPdfFixture);
  report.adjustmentSequence = [
    { key: "handlebarReach", targetLabel: "511 mm", order: 3 },
    { key: "saddleHeight", targetLabel: "754 mm", order: 1 },
    { key: "saddleSetback", targetLabel: "49 mm", order: 2 },
    { key: "stem", targetLabel: "120 mm @ -6°", order: 4 },
  ];
  return report;
}

for (const locale of ["en", "nl"] as const) {
  const copy = getReportV2Copy(locale);
  const text = PDF_PLAN_COPY[locale];
  describe(`14-day PDF plan (${locale})`, () => {
    it("orders the actual first three adjustments without mutating the source", () => {
      const report = fixture();
      const before = JSON.stringify(report);
      const html = renderPlanPage(report, copy, assets);
      expect(html.match(/data-personalized="true"/g)).toHaveLength(3);
      expect(html.indexOf("754 mm")).toBeLessThan(html.indexOf("49 mm"));
      expect(html.indexOf("49 mm")).toBeLessThan(html.indexOf("511 mm"));
      expect(html).not.toContain("120 mm @ -6°");
      expect(html).toContain(copy.parameters.saddleHeight.label);
      expect(JSON.stringify(report)).toBe(before);
    });

    it("keeps 14 educational days and a genuinely blank seven-ride log", () => {
      const html = renderPlanPage(fixture(), copy, assets);
      expect(html.match(/class="pdf-plan-day /g)).toHaveLength(14);
      expect(html).toContain(text.title);
      const log = html.split('<table class="pdf-plan-log"')[1].split("</table>")[0];
      expect(log.match(/<td><\/td>/g)).toHaveLength(28);
      const days = [...log.matchAll(/<tr><td>(\d+)<\/td>/g)].map((match) => Number(match[1]));
      expect(days).toEqual([1, 3, 4, 6, 8, 11, 14]);
      expect(log).not.toContain("754 mm");
      expect(html).toContain(text.caution.replaceAll("&", "&amp;"));
    });

    it("hides missing and pending personal targets but preserves general guidance", () => {
      const report = fixture();
      report.detailedFit = report.detailedFit.map((row) => ({ ...row, status: "pending_data" }));
      report.fitNotes = [];
      const html = renderPlanPage(report, copy, assets);
      expect(html).not.toContain('data-personalized="true"');
      expect(html).not.toContain('class="pdf-plan-target"');
      expect(html).not.toContain("754 mm");
      expect(html).not.toContain('class="pdf-plan-notes"');
      expect(html).toContain(text.phases[0].title);
      report.adjustmentSequence = [];
      const empty = renderPlanPage(report, copy, assets);
      expect(empty.match(/data-personalized="false"/g)).toHaveLength(3);
      expect(empty).not.toContain('class="pdf-plan-target"');
      expect(empty.match(/class="pdf-plan-day /g)).toHaveLength(14);
    });

    it("skips empty targets without using a fallback measurement", () => {
      const report = fixture();
      report.adjustmentSequence = [
        { key: "saddleHeight", targetLabel: " ", order: 1 },
        { key: "saddleSetback", targetLabel: "n/a", order: 2 },
      ];
      const html = renderPlanPage(report, copy, assets);
      expect(html).not.toContain('data-personalized="true"');
      expect(html).not.toContain('class="pdf-plan-target"');
    });

    it("escapes note/target HTML and explicitly bounds long excerpts while keeping full payload notes", () => {
      const report = fixture();
      report.adjustmentSequence[1].targetLabel = '<img src=x onerror="alert(1)">';
      report.fitNotes = ['<script>alert("note")</script>', "🚲Long fit note ".repeat(50), "Additional private note"];
      const before = JSON.stringify(report);
      const html = renderPlanPage(report, copy, assets);
      expect(html).not.toContain("<script>");
      expect(html).not.toContain("<img src=x");
      if (locale === "en") expect(html).toContain("&lt;script&gt;");
      else expect(html).not.toContain("alert(&quot;note&quot;)");
      expect(html).toContain("&lt;img src=x");
      expect(html).toContain('data-notes-overflow="true"');
      expect(html).toContain(text.moreNotes);
      const list = html.split('class="pdf-plan-notes"')[1];
      expect(list.match(/<li>/g)).toHaveLength(2);
      if (locale === "en") expect(list).toContain("…");
      expect(list).not.toContain("Additional private note");
      expect(JSON.stringify(report)).toBe(before);
    });

    it("uses compact spacing for two untruncated notes without a false overflow notice", () => {
      const report = fixture();
      report.fitNotes = [
        "Keep a relaxed grip and check comfort on a familiar route. ".repeat(2),
        "Record the result before changing another setting. ".repeat(2),
      ];
      const html = renderPlanPage(report, copy, assets);
      expect(html).toContain('data-notes-compact="true"');
      expect(html).toContain('data-notes-overflow="false"');
      for (const note of report.fitNotes) {
        if (locale === "en") expect(html).toContain(note);
        else expect(html).not.toContain(note);
      }
      expect(html).not.toContain(text.moreNotes);
    });

    it("keeps short notes complete without an unnecessary overflow reference", () => {
      const report = fixture();
      report.fitNotes = ["Keep a relaxed grip & test one change at a time."];
      const html = renderPlanPage(report, copy, assets);
      if (locale === "en") expect(html).toContain("Keep a relaxed grip &amp; test one change at a time.");
      else expect(html).toContain("nog geen vertaling beschikbaar");
      expect(html).toContain('data-notes-overflow="false"');
      expect(html).not.toContain(text.moreNotes);
    });
  });
}
