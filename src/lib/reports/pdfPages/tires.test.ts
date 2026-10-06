// @vitest-environment jsdom
import { describe, expect, it } from "vitest";
import { reportPdfFixture } from "../../../../tests/fixtures/reportPdf";
import { getReportV2Copy, PDF_TIRES_COPY } from "../reportV2Copy";
import type { PdfReportAssets } from "../pdfShared";
import type { ReportTirePressureReady } from "../reportV2Types";
import { renderTiresPage } from "./tires";

const assets: PdfReportAssets = {
  logo: "",
  bikeDimensions: "",
  pressure: "data:image/webp,pump",
  measureSet: "",
  stackReach: "",
};
const ready = (): ReportTirePressureReady => ({
  status: "ready",
  frontBar: 3.7,
  rearBar: 4.1,
  frontPsi: 54,
  rearPsi: 59,
  confidence: null,
  surface: "average_asphalt",
  inputs: [],
  warnings: [],
});
const parse = (html: string) => {
  const root = document.createElement("div");
  root.innerHTML = html;
  return root;
};

describe("PDF tire data fidelity", () => {
  it.each(["en", "nl"] as const)("renders supplied bar/psi and only recorded surface (%s)", (locale) => {
    const copy = getReportV2Copy(locale);
    const root = parse(renderTiresPage({ ...reportPdfFixture, tirePressure: ready() }, copy, assets));
    const decimal = locale === "nl" ? "," : ".";
    expect([...root.querySelectorAll(".pressure-number")].map((node) => node.textContent)).toEqual([
      `3${decimal}7`,
      `4${decimal}1`,
    ]);
    expect([...root.querySelectorAll(".pressure-unit")].map((node) => node.textContent)).toEqual([
      "bar · 54 psi",
      "bar · 59 psi",
    ]);
    expect(root.querySelectorAll("tbody tr")).toHaveLength(1);
    expect(root.querySelector("tbody th")?.textContent).toBe(copy.tirePressure.surfaceValues.averageAsphalt);
    expect(root.querySelector(".pdf-tires-blank")?.textContent).toBe("");
  });

  it.each(["en", "nl"] as const)("localizes pressure goals and rider-weight decimals (%s)", (locale) => {
    for (const label of ["goal", "ridingGoal"]) {
      for (const goal of ["speed", "comfort", "balance"] as const) {
        const root = parse(
          renderTiresPage(
            {
              ...reportPdfFixture,
              tirePressure: {
                ...ready(),
                inputs: [
                  { label, value: goal[0].toUpperCase() + goal.slice(1) },
                  { label: "riderWeight", value: "72.0 kg" },
                ],
              },
            },
            getReportV2Copy(locale),
            assets,
          ),
        );
        const meta = root.querySelector(".pdf-tires-meta")!;
        expect(meta.textContent).toContain(PDF_TIRES_COPY[locale].ridingGoals[goal]);
        expect(meta.textContent).toContain(locale === "nl" ? "72,0 kg" : "72.0 kg");
        expect(meta.textContent).not.toContain("ridingGoal");
      }
    }
  });

  it("hides quick-start sample values and personal gauges/table when pressure data is pending", () => {
    const copy = getReportV2Copy("nl");
    const root = parse(
      renderTiresPage(
        {
          ...reportPdfFixture,
          tirePressure: {
            status: "pending_required_inputs",
            required: ["tireWidth", "tireType"],
            quickStartTable: [{ weightLabel: "invented-weight", tireSizeLabel: "999 mm", psiLabel: "999 psi" }],
          },
        },
        copy,
        assets,
      ),
    );
    expect(root.querySelector(".pdf-tires-gauges, table")).toBeNull();
    expect(root.textContent).not.toContain("999");
    expect(root.textContent).not.toContain("invented-weight");
    expect(root.textContent).toContain(copy.tirePressure.missingDataLabels.tireWidth);
    expect(root.querySelector(".pdf-tires-maximum")).not.toBeNull();
  });

  it("preserves an unknown surface without fabricating other terrain recommendations", () => {
    const root = parse(
      renderTiresPage(
        { ...reportPdfFixture, tirePressure: { ...ready(), surface: "private_test_surface" } },
        getReportV2Copy("en"),
        assets,
      ),
    );
    expect(root.querySelector("tbody th")?.textContent).toBe("private_test_surface");
    expect(root.querySelectorAll("tbody tr")).toHaveLength(1);
    expect(root.textContent).not.toContain("Smooth asphalt");
    expect(root.textContent).not.toContain("Rough asphalt");
  });

  it("retains and escapes actual warning text, including manufacturer maximum warnings", () => {
    const warnings = [
      '<img src=x onerror="alert(1)">',
      "Do not exceed this tire’s 4.2 bar maximum.",
      "Use the same gauge for repeat measurements.",
    ];
    const root = parse(
      renderTiresPage(
        { ...reportPdfFixture, tirePressure: { ...ready(), warnings } },
        getReportV2Copy("en"),
        assets,
      ),
    );
    expect(root.querySelector("[onerror]")).toBeNull();
    expect([...root.querySelectorAll(".pdf-tires-warnings li")].map((node) => node.textContent)).toEqual(warnings);
    expect(root.querySelector(".pdf-tires-maximum")?.textContent).toContain("Follow the lower limit");
  });

  it.each(["en", "nl"] as const)("replaces over-budget warnings with a complete-list notice (%s)", (locale) => {
    for (const warnings of [
      ["Do not exceed this tire’s 4.2 bar maximum.", "Long safety context. ".repeat(100)],
      ["First", "Second", "Third", "Fourth", "Fifth"],
    ]) {
      const root = parse(
        renderTiresPage(
          { ...reportPdfFixture, tirePressure: { ...ready(), warnings } },
          getReportV2Copy(locale),
          assets,
        ),
      );
      const section = root.querySelector(".pdf-tires-warnings")!;
      expect(section.querySelector("ul")).toBeNull();
      expect(section.textContent).toContain(PDF_TIRES_COPY[locale].warningsNotice);
      expect(section.textContent).toContain(
        PDF_TIRES_COPY[locale].warningsCount.replace("{count}", String(warnings.length)),
      );
      for (const warning of warnings) expect(section.textContent).not.toContain(warning);
      expect(section.textContent!.length).toBeLessThan(250);
      expect(root.querySelector(".pdf-tires-maximum")).not.toBeNull();
    }
  });

  it("hides invalid personal pressures without hiding manufacturer-limit guidance", () => {
    const root = parse(
      renderTiresPage(
        { ...reportPdfFixture, tirePressure: { ...ready(), frontBar: Number.NaN } },
        getReportV2Copy("en"),
        assets,
      ),
    );
    expect(root.querySelector(".pdf-tires-gauges, table")).toBeNull();
    expect(root.querySelector(".pdf-tires-maximum")).not.toBeNull();
    expect(root.textContent).not.toContain("NaN");
  });
});
