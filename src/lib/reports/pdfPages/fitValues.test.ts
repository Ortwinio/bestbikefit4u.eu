import { describe, expect, it } from "vitest";
import { getReportV2Copy } from "../reportV2Copy";
import type { PdfReportAssets } from "../pdfShared";
import type { ReportDetailedRow, ReportV2Payload } from "../reportV2Types";
import { renderFitValuesPage } from "./fitValues";

const assets: PdfReportAssets = {
  logo: "data:image/svg+xml,logo",
  bikeDimensions: "data:image/png,bike",
  pressure: "data:image/webp,pressure",
  measureSet: "data:image/webp,measure",
  stackReach: "data:image/webp,frame",
};
const copy = getReportV2Copy("en");
const row = (overrides: Partial<ReportDetailedRow> = {}): ReportDetailedRow => ({
  key: "saddleHeight",
  targetLabel: "754 mm",
  rangeLabel: "731 mm - 774 mm",
  status: "ready",
  confidence: 90,
  feasibility: "direct",
  delta: null,
  currentLabel: "999 mm",
  ...overrides,
});
function report(rows: ReportDetailedRow[], frame?: Partial<ReportV2Payload["frameTargets"]>) {
  return {
    detailedFit: rows,
    frameTargets: { stackMm: 0, reachMm: 0, effectiveTopTubeMm: 0, recommendedFrameLabel: null, ...frame },
  } as ReportV2Payload;
}

describe("PDF fit values", () => {
  it("uses actual target/range data and leaves current write-in boxes empty", () => {
    const html = renderFitValuesPage(report([row()]), copy, assets);
    expect(html).toContain('class="pdf-fit-letter">A');
    expect(html).toContain('754<span class="pdf-fit-unit"> mm');
    expect(html).toContain('aria-label="731 mm - 774 mm"');
    expect(html).toContain('class="pdf-fit-now" aria-label="Fill in by hand"></div>');
    expect(html).not.toContain("999");
  });

  it("never invents missing ranges or frame blocks", () => {
    const html = renderFitValuesPage(report([row({ rangeLabel: null })]), copy, assets);
    expect(html).not.toContain('class="pdf-fit-range"');
    expect(html).not.toContain('class="pdf-fit-frame"');
    expect(html).not.toContain('class="pdf-fit-stem"');
  });

  it("hides rows without available target data", () => {
    const html = renderFitValuesPage(report([row({ status: "pending_data" })]), copy, assets);
    expect(html).not.toContain('class="pdf-fit-row"');
    expect(html).not.toContain("754");
    expect(html).not.toContain('class="pdf-fit-range"');
  });

  it("uses actual stem angle and frame dimensions without fabricated angle or frame ranges", () => {
    const html = renderFitValuesPage(
      report([row({ key: "stem", targetLabel: "110 mm @ +8 deg", rangeLabel: null, status: "optional" })], {
        stackMm: 602,
        reachMm: 397,
        recommendedFrameLabel: "Example <L>",
      }),
      copy,
      assets,
    );
    expect(html).toContain('class="pdf-fit-angle">8°');
    expect(html).toContain("Example &lt;L&gt;");
    expect(html).toContain("Stack 602 mm");
    expect(html).toContain("Reach 397 mm");
    expect(html).not.toContain("Effective top tube 0");
    expect(html).not.toContain("59–62");
    expect(html).toContain(assets.stackReach);
  });

  it("localizes decimal millimetres and handles absent values without placeholder measurements", () => {
    const dutch = renderFitValuesPage(
      report([row({ key: "crankLength", targetLabel: "172.5 mm", rangeLabel: null })]),
      getReportV2Copy("nl"),
      assets,
    );
    expect(dutch).toContain("172,5");
    const empty = renderFitValuesPage(report([]), copy, assets);
    expect(empty).toContain("No fit values are available yet.");
    expect(empty).not.toContain('role="table"');
  });
});
