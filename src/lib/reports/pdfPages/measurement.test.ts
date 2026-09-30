// @vitest-environment jsdom
import { describe, expect, it } from "vitest";
import { reportPdfFixture } from "../../../../tests/fixtures/reportPdf";
import { getReportV2Copy, PDF_MEASUREMENT_COPY } from "../reportV2Copy";
import type { PdfReportAssets } from "../pdfShared";
import { renderMeasurementPage } from "./measurement";

const assets: PdfReportAssets = {
  logo: "",
  bikeDimensions: "",
  pressure: "",
  measureSet: "data:image/webp,measure",
  stackReach: "",
};
const parse = (html: string) => {
  const root = document.createElement("div");
  root.innerHTML = html;
  return root;
};

describe("PDF measuring guide", () => {
  it.each(["en", "nl"] as const)("preserves canonical A–D references and changed targets (%s)", (locale) => {
    const report = structuredClone(reportPdfFixture);
    const targets = {
      saddleHeight: "807 mm",
      saddleSetback: "56 mm",
      handlebarDrop: "0 mm",
      handlebarReach: "519 mm",
    };
    report.detailedFit = report.detailedFit.reverse().map((row) => ({
      ...row,
      targetLabel: targets[row.key as keyof typeof targets] ?? row.targetLabel,
    }));
    const root = parse(renderMeasurementPage(report, getReportV2Copy(locale), assets));
    for (const [index, [key, value]] of Object.entries(targets).entries()) {
      const card = root.querySelector(`[data-measurement-guide="${key}"]`)!;
      expect(card.querySelector("h3 b")?.textContent).toBe("ABCD"[index]);
      expect(card.querySelector(".mono")?.textContent).toBe(value);
    }
    const reach = root.querySelector('[data-measurement-guide="handlebarReach"]')!;
    expect(reach.textContent).toContain(PDF_MEASUREMENT_COPY[locale].methods.handlebarReach);
    expect(reach.textContent).toContain(locale === "en" ? "saddle-to-handlebar" : "zadelreferentiepunt");
    expect(root.querySelector("a")?.getAttribute("href")).toBe(
      `https://bestbikefit4u.eu/${locale}/measurement-guide`,
    );
  });

  it("keeps measurement instructions and blank checklist when personal targets are unavailable", () => {
    const root = parse(
      renderMeasurementPage({ ...reportPdfFixture, detailedFit: [] }, getReportV2Copy("en"), assets),
    );
    expect(root.querySelectorAll("[data-measurement-guide]")).toHaveLength(4);
    expect(root.querySelector(".pdf-measurement-card-heading > .mono")).toBeNull();
    expect(root.querySelectorAll(".pdf-measurement-checklist li span")).toHaveLength(4);
    expect(root.querySelector(".pdf-measurement-disclaimer")?.textContent).toContain("if pain persists");
    expect(root.querySelector(".pdf-measurement-pressure")?.textContent).toContain("page 4");
    expect(root.textContent).not.toContain("5.2");
    expect(root.textContent).not.toContain("754");
  });

  it("hides pending target values and escapes supplied labels", () => {
    const report = structuredClone(reportPdfFixture);
    report.detailedFit[0] = { ...report.detailedFit[0], status: "pending_data", targetLabel: "9876 mm" };
    report.detailedFit[1].targetLabel = '<img src=x onerror="alert(1)">';
    const root = parse(renderMeasurementPage(report, getReportV2Copy("en"), assets));
    expect(root.textContent).not.toContain("9876");
    expect(root.querySelector("[onerror]")).toBeNull();
    expect(root.querySelector('[data-measurement-guide="saddleSetback"] .mono')?.textContent).toBe(
      report.detailedFit[1].targetLabel,
    );
  });
});
