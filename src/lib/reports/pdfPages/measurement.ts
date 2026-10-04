import { PDF_MEASUREMENT_COPY, type ReportV2Copy } from "../reportV2Copy";
import type { ReportV2Payload } from "../reportV2Types";
import { escapeHtml, type PdfReportAssets } from "../pdfShared";

const KEYS = ["saddleHeight", "saddleSetback", "handlebarDrop", "handlebarReach"] as const;

export function renderMeasurementPage(
  report: ReportV2Payload,
  copy: ReportV2Copy,
  assets: PdfReportAssets,
): string {
  const locale = copy.locale === "nl" ? "nl" : "en";
  const text = PDF_MEASUREMENT_COPY[locale];
  const guide = `${BRAND.siteUrl}/${locale}/measurement-guide`;
  return `<div class="pdf-measurement-body">
    <div class="pdf-measurement-intro"><div><h1>${escapeHtml(text.title)}</h1>
      <p>${escapeHtml(text.intro)}</p><p class="pdf-measurement-tools"><strong>${escapeHtml(text.toolsLabel)}</strong>
        ${escapeHtml(text.tools)}</p></div>
      ${
        assets.measureSet
          ? `<img src="${escapeHtml(assets.measureSet)}"
        alt="${escapeHtml(text.illustration)}" />`
          : ""
      }</div>
    <div class="pdf-measurement-grid">${KEYS.map((key, index) => {
      const row = report.detailedFit.find((item) => item.key === key);
      const target = row && row.status !== "pending_data" && row.targetLabel !== "n/a" ? row.targetLabel : "";
      return `<article data-measurement-guide="${key}">
        <div class="pdf-measurement-card-heading"><h3><b>${"ABCD"[index]}</b>
          ${escapeHtml(copy.parameters[key].label)}</h3>
          ${target ? `<span class="mono">${escapeHtml(target)}</span>` : ""}</div>
        <p>${escapeHtml(text.methods[key])}</p><p class="pdf-measurement-equipment">
          ${escapeHtml(text.equipment[key])}</p></article>`;
    }).join("")}</div>
    <section class="pdf-measurement-pressure">
      <svg width="72" height="44" viewBox="0 0 72 44" fill="none" aria-hidden="true">
        <path d="M8 40A28 28 0 0 1 64 40" class="pdf-measurement-track" />
        <path d="M36 40L52 24" class="pdf-measurement-needle" />
        <circle cx="36" cy="40" r="4" fill="var(--bbf-inkt)" />
      </svg><div><h3>${escapeHtml(text.pressureTitle)}</h3><p>${escapeHtml(text.pressureBody)}</p></div>
    </section>
    <section class="pdf-measurement-disclaimer"><h2>${escapeHtml(text.disclaimerTitle)}</h2>
      <p>${escapeHtml(text.disclaimerBody)}</p></section>
    <section class="pdf-measurement-checklist"><h2>${escapeHtml(text.checklistTitle)}</h2>
      <ul>${text.checklist.map((item) => `<li><span aria-hidden="true"></span>${escapeHtml(item)}</li>`).join("")}</ul>
    </section>
    <p class="pdf-measurement-guide">${escapeHtml(text.guide)}
      <a href="${guide}">${guide.replace("https://", "")}</a>. ${escapeHtml(text.update)}</p>
  </div>`;
}

export const measurementStyles = `
.pdf-measurement-body { padding-top: 24px; }
.pdf-measurement-intro { display: grid; grid-template-columns: 1fr 220px; gap: 24px; align-items: center; }
.pdf-measurement-intro h1 { margin: 0; font-size: 40px; line-height: 1.05; letter-spacing: -.03em; font-weight: 800; }
.pdf-measurement-intro p { margin: 8px 0 0; font-size: 15px; line-height: 1.5; color: var(--bbf-tekst); }
.pdf-measurement-intro .pdf-measurement-tools { margin-top: 10px; font-size: 13px; color: var(--bbf-inkt); }
.pdf-measurement-intro img { width: 220px; height: 165px; object-fit: contain; border-radius: 16px; }
.pdf-measurement-grid { margin-top: 20px; display: grid; grid-template-columns: repeat(2, 1fr); gap: 12px; }
.pdf-measurement-grid article { display: flex; flex-direction: column; gap: 6px; padding: 16px;
  border-radius: 18px; border: 1px solid var(--bbf-rand); }
.pdf-measurement-card-heading { display: flex; align-items: center; justify-content: space-between; gap: 6px; }
.pdf-measurement-card-heading h3 { margin: 0; display: flex; align-items: center; gap: 10px;
  font-size: 17px; font-weight: 700; }
.pdf-measurement-card-heading h3 b { width: 28px; height: 28px; flex-shrink: 0; border-radius: 50%;
  background: var(--bbf-lime); display: flex; align-items: center; justify-content: center;
  font-size: 14px; font-weight: 800; }
.pdf-measurement-card-heading > span { font-size: 14px; white-space: nowrap; }
.pdf-measurement-grid p { margin: 0; font-size: 13px; line-height: 1.45; color: var(--bbf-tekst); }
.pdf-measurement-grid .pdf-measurement-equipment { font-size: 12px; color: var(--bbf-gedempt); }
.pdf-measurement-pressure { margin-top: 16px; display: grid; grid-template-columns: 72px 1fr; gap: 16px;
  align-items: center; padding: 16px 18px; border-radius: 18px; background: var(--bbf-petrol-zacht); }
.pdf-measurement-track { stroke: var(--bbf-gedempt); stroke-width: 8; stroke-linecap: round; }
.pdf-measurement-needle { stroke: var(--bbf-inkt); stroke-width: 3; stroke-linecap: round; }
.pdf-measurement-pressure h3 { margin: 0; font-size: 16px; font-weight: 700; }
.pdf-measurement-pressure p { margin: 4px 0 0; font-size: 13px; line-height: 1.45; color: var(--bbf-tekst); }
.pdf-measurement-disclaimer, .pdf-measurement-checklist { margin-top: 16px; padding: 18px 20px; border-radius: 18px; }
.pdf-measurement-disclaimer { border: 2px solid var(--bbf-inkt); }
.pdf-measurement-disclaimer h2, .pdf-measurement-checklist h2 { margin: 0; font-size: 20px;
  font-weight: 800; letter-spacing: -.02em; }
.pdf-measurement-disclaimer p { margin: 6px 0 0; font-size: 13px; line-height: 1.5; color: var(--bbf-tekst); }
.pdf-measurement-checklist { background: var(--bbf-lime); }
.pdf-measurement-checklist ul { margin: 10px 0 0; padding: 0; list-style: none; display: grid;
  grid-template-columns: repeat(2, 1fr); gap: 8px 20px; font-size: 14px; }
.pdf-measurement-checklist li { display: flex; align-items: center; gap: 10px; }
.pdf-measurement-checklist li span { flex-shrink: 0; width: 18px; height: 18px; border: 2px solid var(--bbf-inkt);
  border-radius: 4px; background: var(--bbf-wit); }
.pdf-measurement-guide { margin: 14px 0 0; font-size: 13px; line-height: 1.45; color: var(--bbf-tekst); }
.pdf-measurement-guide a { font-weight: 700; color: var(--bbf-petrol-hover); }
`;
import { BRAND } from "@/config/brand";
