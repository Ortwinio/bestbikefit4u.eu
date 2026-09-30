// @vitest-environment jsdom
import { describe, expect, it } from "vitest";
import { reportPdfFixture } from "../../../../tests/fixtures/reportPdf";
import { getReportV2Copy } from "../reportV2Copy";
import type { PdfReportAssets } from "../pdfShared";
import { renderSummaryPage } from "./summary";

const assets: PdfReportAssets = {
  logo: "",
  bikeDimensions: "data:image/png,bike",
  pressure: "",
  measureSet: "",
  stackReach: "",
};
const report = () => structuredClone(reportPdfFixture);
const parse = (html: string) => {
  const root = document.createElement("div");
  root.innerHTML = html;
  return root;
};

describe("PDF summary payload fidelity", () => {
  it.each(["en", "nl"] as const)("maps changed A–D targets by key, including zero drop (%s)", (locale) => {
    const value = report();
    const targets = {
      saddleHeight: "811 mm",
      saddleSetback: "72 mm",
      handlebarDrop: "0 mm",
      handlebarReach: "489 mm",
    };
    value.detailedFit = value.detailedFit.reverse().map((row) => ({
      ...row,
      targetLabel: targets[row.key as keyof typeof targets] ?? row.targetLabel,
    }));
    value.profile.globalConfidence = 64;
    const root = parse(renderSummaryPage(value, getReportV2Copy(locale), assets));
    for (const [index, [key, target]] of Object.entries(targets).entries()) {
      const label = root.querySelector(`[data-measurement="${key}"]`)!;
      expect(label.querySelector("b")?.textContent).toBe("ABCD"[index]);
      expect(label.querySelector(".mono")?.textContent).toBe(target);
    }
    // The supplied raster uses BB-to-bar; the overlay corrects D to the actual saddle-to-bar output.
    const correction = root.querySelector(".pdf-summary-reach-correction");
    expect(correction?.querySelector("rect")?.getAttribute("height")).toBe("24");
    expect(correction?.querySelector("path")?.getAttribute("d")).toContain("M219 13H460");
    expect(root.querySelector(".pdf-summary-percent")?.textContent).toBe("64%");
    expect(root.querySelector(".pdf-summary-gauge-value")?.getAttribute("stroke-dasharray")).toBe("64 100");
  });

  it("uses the actual ordered priorities, omits pending rows and stops at three", () => {
    const value = report();
    value.prioritySummary = [
      { key: "stem", targetLabel: "116 mm", status: "pending_data", confidence: 0 },
      { key: "handlebarWidth", targetLabel: "411 mm", status: "ready", confidence: 70 },
      { key: "saddleSetback", targetLabel: "61 mm", status: "ready", confidence: 80 },
      { key: "crankLength", targetLabel: "162.5 mm", status: "ready", confidence: 90 },
      { key: "saddleHeight", targetLabel: "811 mm", status: "ready", confidence: 90 },
    ];
    const root = parse(renderSummaryPage(value, getReportV2Copy("en"), assets));
    const priorities = root.querySelectorAll(".pdf-summary-priorities li");
    expect([...priorities].map((row) => row.querySelector(".pdf-summary-target")?.textContent)).toEqual([
      "411 mm",
      "61 mm",
      "162.5 mm",
    ]);
    expect(priorities[1].textContent).toContain("Saddle setback (B)");
    expect(root.textContent).not.toContain("116 mm");
  });

  it("hides unavailable diagram labels and confidence instead of showing example values", () => {
    const value = report();
    value.detailedFit = [];
    value.prioritySummary = [];
    const root = parse(renderSummaryPage(value, getReportV2Copy("en"), assets));
    expect(root.querySelector(".pdf-summary-figure")).toBeNull();
    expect(root.querySelector(".pdf-summary-confidence")).toBeNull();
    expect(root.querySelector(".pdf-summary-priorities")).toBeNull();
    value.detailedFit = report().detailedFit.map((row) => ({ ...row, status: "pending_data" }));
    expect(
      parse(renderSummaryPage(value, getReportV2Copy("en"), assets)).querySelector(".pdf-summary-figure"),
    ).toBeNull();
  });

  it("escapes identity, target and asset markup", () => {
    const value = report();
    value.rider.name = '<script>alert("rider")</script>';
    value.bike.name = '<img src=x onerror="alert(1)">';
    value.detailedFit[0].targetLabel = '<svg onload="alert(2)">';
    const root = parse(renderSummaryPage(value, getReportV2Copy("en"), assets));
    expect(root.querySelector("script, [onerror], [onload]")).toBeNull();
    expect(root.querySelector("h1")?.textContent).toBe(value.rider.name);
    expect(root.querySelector('[data-measurement="saddleHeight"] .mono')?.textContent).toBe(
      value.detailedFit[0].targetLabel,
    );
  });
});
