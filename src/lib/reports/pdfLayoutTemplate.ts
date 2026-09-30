import type { ReportV2Copy } from "./reportV2Copy";
import { PDF_SHELL_COPY } from "./reportV2Copy";
import type { ReportV2Payload } from "./reportV2Types";
import { getPdfReportAssets } from "./pdfAssets";
import { escapeHtml, formatPdfDate } from "./pdfShared";
import { renderSummaryPage, summaryStyles } from "./pdfPages/summary";
import { renderBaseDataPage, baseDataStyles } from "./pdfPages/baseData";
import { renderFitValuesPage, fitValuesStyles } from "./pdfPages/fitValues";
import { renderTiresPage, tiresStyles } from "./pdfPages/tires";
import { renderPlanPage, planStyles } from "./pdfPages/plan";
import { renderMeasurementPage, measurementStyles } from "./pdfPages/measurement";

const documentStyles = `
  @page { size: A4; margin: 0; }
  :root {
    --bbf-inkt:#0f2420; --bbf-lime:#cff26a; --bbf-lime-zacht:#e6f8a8;
    --bbf-petrol:#0a7263; --bbf-petrol-zacht:#e1f2ee; --bbf-tekst:#3b4f4a;
    --bbf-gedempt:#4a5f5a; --bbf-rand:#dce6e1; --bbf-papier:#f5f8f3;
    --bbf-wit:#fff; --bbf-warning:#ffd66b; --bbf-destructive:#ffb199;
  }
  * { box-sizing: border-box; }
  html,body { margin:0; padding:0; background:var(--bbf-wit); color:var(--bbf-inkt); }
  body { font-family:'Figtree',sans-serif; font-size:14px; line-height:1.4;
    -webkit-print-color-adjust:exact; print-color-adjust:exact; }
  h1,h2,h3 { font-family:'Bricolage Grotesque',sans-serif; line-height:1.1;
    letter-spacing:-.025em; page-break-after:avoid; }
  h1,h2,h3,p { margin:0; }
  img { max-width:100%; }
  .mono { font-family:'DM Mono',monospace; font-weight:500; }
  .report-page { width:210mm; height:297mm; padding:40px 64px;
    display:flex; flex-direction:column; break-after:page; page-break-after:always; }
  .report-page:last-child { break-after:auto; page-break-after:auto; }
  .report-header { display:flex; justify-content:space-between; align-items:center;
    flex:none; gap:18px; border-bottom:4px solid var(--bbf-lime); padding-bottom:14px; }
  .report-header img { width:179px; height:30px; object-fit:contain; }
  .report-header span { font-size:12px; font-weight:700; letter-spacing:.08em;
    text-transform:uppercase; color:var(--bbf-petrol); text-align:right; }
  .report-content { flex:1; min-height:0; overflow-wrap:anywhere; }
  .report-footer { flex:none; display:flex; gap:12px; justify-content:space-between;
    border-top:1px solid var(--bbf-rand); padding-top:10px; font-size:10px; color:var(--bbf-gedempt); }
  .report-footer-person { display:flex; align-items:baseline; min-width:0; gap:4px; white-space:nowrap; }
  .report-footer-name { min-width:0; overflow:hidden; text-overflow:ellipsis; }
  .report-footer-fixed { flex:none; }
  .report-footer-page { font-family:'DM Mono',monospace; white-space:nowrap; }
`;

/** Headers and footers are now part of each sheet so bundled fonts apply to them as well. */
export function renderPdfHeaderTemplate(_params: { report: ReportV2Payload; copy: ReportV2Copy }): string {
  return "";
}

export function renderPdfFooterTemplate(): string {
  return "";
}

export function renderPdfReportHtml({
  report,
  copy,
}: {
  report: ReportV2Payload;
  copy: ReportV2Copy;
}): string {
  const { images, fontCss } = getPdfReportAssets();
  const locale = copy.locale === "nl" ? "nl" : "en";
  const text = PDF_SHELL_COPY[locale];
  const pages = [
    ["FitRapport1", renderSummaryPage(report, copy, images)],
    ["FitRapport6", renderBaseDataPage(report, copy, images)],
    ["FitRapport2", renderFitValuesPage(report, copy, images)],
    ["FitRapport5", renderTiresPage(report, copy, images)],
    ["FitRapport3", renderPlanPage(report, copy, images)],
    ["FitRapport4", renderMeasurementPage(report, copy, images)],
  ];
  const date = formatPdfDate(report.reportDate, copy);
  const footerPerson = `<span class="report-footer-fixed">${escapeHtml(text.footerLabel)}</span>
    ${report.rider.name ? `<span>·</span><span class="report-footer-name">${escapeHtml(report.rider.name)}</span>` : ""}
    ${date ? `<span>·</span><span class="mono report-footer-fixed">${escapeHtml(date)}</span>` : ""}
    <span class="report-footer-fixed">· bestbikefit4u.eu</span>`;
  return `<!doctype html><html lang="${locale}"><head><meta charset="utf-8">
    <title>${escapeHtml(text.title)}</title><style>${fontCss}${documentStyles}
    ${summaryStyles}${baseDataStyles}${fitValuesStyles}${tiresStyles}${planStyles}${measurementStyles}
    </style></head><body><main class="report-shell">
    ${pages
      .map(
        ([board, body], index) => `<article class="report-page" data-report-page="${index + 1}"
      data-board="${board}"><header class="report-header">
      <img src="${images.logo}" alt="BestBikeFit4U"><span>${escapeHtml(text.sections[index])}</span>
      </header><div class="report-content">${body}</div><footer class="report-footer">
      <span class="report-footer-person">${footerPerson}</span>
      <span class="report-footer-page">${index + 1} / 6</span></footer></article>`,
      )
      .join("")}
    </main></body></html>`;
}
