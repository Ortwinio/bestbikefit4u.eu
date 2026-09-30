import { PDF_SUMMARY_COPY, type ReportV2Copy } from "../reportV2Copy";
import type { ReportParameterKey, ReportV2Payload } from "../reportV2Types";
import { escapeHtml, formatPdfDate, localizePdfValue, type PdfReportAssets } from "../pdfShared";

const MEASUREMENTS: Array<{ key: ReportParameterKey; letter: string }> = [
  { key: "saddleHeight", letter: "A" },
  { key: "saddleSetback", letter: "B" },
  { key: "handlebarDrop", letter: "C" },
  { key: "handlebarReach", letter: "D" },
];

export function renderSummaryPage(report: ReportV2Payload, copy: ReportV2Copy, assets: PdfReportAssets): string {
  const compact =
    (report.rider.name?.length ?? 0) > 35 || report.bike.name.length > 45 || report.profile.sessionId.length > 40;
  const labels = PDF_SUMMARY_COPY[copy.locale === "nl" ? "nl" : "en"];
  const measurements = MEASUREMENTS.flatMap(({ key, letter }) => {
    const row = report.detailedFit.find((item) => item.key === key);
    return row && row.status !== "pending_data" && row.targetLabel && row.targetLabel !== "n/a"
      ? [{ key, letter, value: row.targetLabel }]
      : [];
  });
  const meta = [
    { label: labels.bike, value: report.bike.name, mono: false },
    { label: labels.date, value: formatPdfDate(report.reportDate, copy), mono: true },
    { label: labels.goal, value: localizePdfValue(report.profile.goal, copy, "goal"), mono: false },
    { label: labels.session, value: report.profile.sessionId, mono: true },
  ].filter((item) => item.value);
  const confidence = report.profile.globalConfidence;
  const showConfidence =
    report.detailedFit.length > 0 && Number.isFinite(confidence) && confidence >= 0 && confidence <= 100;
  const priorities = report.prioritySummary
    .filter((row) => row.status !== "pending_data" && row.targetLabel && row.targetLabel !== "n/a")
    .slice(0, 3);
  const diagram =
    assets.bikeDimensions && measurements.length
      ? `
    <figure class="pdf-summary-figure">
      <div class="pdf-summary-bike">
        <img src="${escapeHtml(assets.bikeDimensions)}" alt="${escapeHtml(labels.diagramAlt)}" />
        <svg class="pdf-summary-reach-correction" viewBox="0 0 650 430" aria-hidden="true">
          <rect width="650" height="24" fill="var(--bbf-papier)" />
          <path d="M219 13H460 M226 9L219 13L226 17 M453 9L460 13L453 17"
            fill="none" stroke="var(--bbf-petrol)" stroke-width="1.3" />
          <path d="M219 13V60 M460 13V24" fill="none" stroke="var(--bbf-petrol)"
            stroke-width="1" stroke-dasharray="5 4" />
        </svg>
        ${measurements
          .map(
            (item) => `
          <div class="pdf-summary-measure pdf-summary-measure-${item.letter}" data-measurement="${item.key}">
            <b>${item.letter}</b><span class="mono">${escapeHtml(item.value)}</span>
          </div>`,
          )
          .join("")}
      </div>
      <figcaption>${measurements
        .map(
          (item) => `
        <span><strong>${item.letter}</strong> ${escapeHtml(copy.parameters[item.key].label)}</span>`,
        )
        .join("")}
        <span class="pdf-summary-reference">${escapeHtml(labels.reference)}</span>
      </figcaption>
    </figure>`
      : "";
  const gauge = showConfidence
    ? `
    <section class="pdf-summary-confidence" aria-label="${escapeHtml(labels.confidence)}">
      <h2>${escapeHtml(labels.confidence)}</h2>
      <svg width="150" height="86" viewBox="0 0 150 86" fill="none" aria-hidden="true">
        <path d="M15 78A60 60 0 0 1 135 78" class="pdf-summary-gauge-track" />
        <path d="M15 78A60 60 0 0 1 135 78" class="pdf-summary-gauge-value"
          pathLength="100" stroke-dasharray="${confidence} 100" />
      </svg>
      <div class="pdf-summary-percent mono">${escapeHtml(confidence)}<span>%</span></div>
      <p>${escapeHtml(labels.confidenceBody)}</p>
    </section>`
    : "";
  const order = priorities.length
    ? `
    <section class="pdf-summary-priorities">
      <h2>${escapeHtml(labels.priorities)}</h2>
      <p>${escapeHtml(labels.prioritiesBody)}</p>
      <ol>${priorities
        .map((row, index) => {
          const letter = MEASUREMENTS.find((item) => item.key === row.key)?.letter;
          return `<li><b class="pdf-summary-order mono">${index + 1}</b>
          <span>${escapeHtml(copy.parameters[row.key].label)}${letter ? ` (${letter})` : ""}</span>
          <span class="pdf-summary-target mono">${escapeHtml(row.targetLabel)}</span></li>`;
        })
        .join("")}</ol>
    </section>`
    : "";
  return `<div class="pdf-summary-body${compact ? " pdf-summary-compact" : ""}">
    <div class="pdf-summary-name"><p>${escapeHtml(labels.forRider)}</p>
      <h1>${escapeHtml(report.rider.name || copy.rider.anonymousRider)}</h1></div>
    <dl class="pdf-summary-meta">${meta
      .map(
        (item) => `
      <div><dt>${escapeHtml(item.label)}</dt>
        <dd class="${item.mono ? "mono" : ""}">${escapeHtml(item.value)}</dd></div>`,
      )
      .join("")}</dl>
    ${diagram}
    ${
      gauge || order
        ? `<div class="pdf-summary-bottom${gauge ? "" : " pdf-summary-no-confidence"}">
      ${gauge}${order}</div>`
        : ""
    }
  </div>`;
}

export const summaryStyles = `
.pdf-summary-body { padding-top: 24px; }
.pdf-summary-name p { margin: 0; color: var(--bbf-tekst); font-size: 14px; font-weight: 700; }
.pdf-summary-name h1 { margin: 4px 0 0; font-size: 52px; line-height: 1; letter-spacing: -.03em;
  font-weight: 800; overflow-wrap: anywhere; }
.pdf-summary-meta { margin: 18px 0 0; display: grid; grid-template-columns: 1.4fr 1fr 1fr 1.3fr; gap: 12px; }
.pdf-summary-meta > div { min-width: 0; padding: 10px 12px; border-radius: 12px; background: var(--bbf-papier); }
.pdf-summary-meta dt { font-size: 12px; color: var(--bbf-gedempt); }
.pdf-summary-meta dd { margin: 2px 0 0; font-size: 15px; font-weight: 700; overflow-wrap: anywhere; }
.pdf-summary-meta dd.mono { font-size: 13px; font-weight: 400; }
.pdf-summary-figure { margin: 18px 0 0; padding: 8px 8px 12px; border-radius: 24px;
  background: var(--bbf-papier); }
.pdf-summary-bike { position: relative; width: 650px; height: 430px; }
.pdf-summary-bike img { width: 650px; height: 430px; display: block; object-fit: contain; }
.pdf-summary-reach-correction { position: absolute; inset: 0; width: 650px; height: 430px; }
.pdf-summary-measure { position: absolute; display: flex; align-items: center; gap: 6px; height: 28px;
  padding: 0 10px 0 4px; border-radius: 999px; background: var(--bbf-wit); border: 1.5px solid var(--bbf-petrol);
  font-size: 14px; white-space: nowrap; }
.pdf-summary-measure b { display: flex; align-items: center; justify-content: center; width: 20px; height: 20px;
  border-radius: 50%; background: var(--bbf-lime); font-size: 12px; font-weight: 800; }
.pdf-summary-measure-A { left: 182px; top: 178px; }
.pdf-summary-measure-B { left: 226px; top: 90px; }
.pdf-summary-measure-C { right: 8px; top: 62px; }
.pdf-summary-measure-D { left: 286px; top: 0; }
.pdf-summary-figure figcaption { margin: 8px 8px 0; display: flex; flex-wrap: wrap; gap: 6px 14px;
  font-size: 12px; line-height: 1.35; color: var(--bbf-tekst); }
.pdf-summary-figure strong { color: var(--bbf-inkt); }
.pdf-summary-reference { flex-basis: 100%; text-align: right; font-size: 11px; }
.pdf-summary-bottom { margin-top: 18px; display: grid; grid-template-columns: 200px 1fr; gap: 16px; }
.pdf-summary-no-confidence { grid-template-columns: 1fr; }
.pdf-summary-confidence { display: flex; flex-direction: column; align-items: center; gap: 4px;
  padding: 18px 16px; border: 1px solid var(--bbf-rand); border-radius: 20px; }
.pdf-summary-confidence h2 { margin: 0; align-self: flex-start; font-size: 14px; font-weight: 700; }
.pdf-summary-confidence svg { margin-top: 6px; }
.pdf-summary-gauge-track, .pdf-summary-gauge-value { stroke-width: 14; stroke-linecap: round; }
.pdf-summary-gauge-track { stroke: var(--bbf-rand); }
.pdf-summary-gauge-value { stroke: var(--bbf-petrol); }
.pdf-summary-percent { margin-top: -34px; font-size: 34px; line-height: 1; }
.pdf-summary-percent span { font-size: 16px; color: var(--bbf-gedempt); }
.pdf-summary-confidence p { margin: 10px 0 0; font-size: 12px; line-height: 1.4;
  color: var(--bbf-gedempt); text-align: center; }
.pdf-summary-priorities { padding: 18px 22px; border-radius: 20px; background: var(--bbf-lime); }
.pdf-summary-priorities h2 { margin: 0; font-size: 22px; font-weight: 800; letter-spacing: -.02em; }
.pdf-summary-priorities p { margin: 4px 0 0; font-size: 13px; color: var(--bbf-tekst); line-height: 1.4; }
.pdf-summary-priorities ol { margin: 12px 0 0; padding: 0; list-style: none;
  display: flex; flex-direction: column; gap: 8px; }
.pdf-summary-priorities li { display: grid; grid-template-columns: 28px 1fr auto; align-items: center; gap: 10px;
  padding: 8px 10px; border-radius: 12px; background: var(--bbf-wit); font-size: 14px; font-weight: 600; }
.pdf-summary-order { display: flex; align-items: center; justify-content: center; width: 28px; height: 28px;
  border-radius: 50%; background: var(--bbf-inkt); color: var(--bbf-wit); font-size: 13px; }
.pdf-summary-target { max-width: 140px; font-size: 14px; font-weight: 400; overflow-wrap: anywhere; }
.pdf-summary-compact .pdf-summary-name h1 { font-size: 32px; line-height: 1.05; }
.pdf-summary-compact .pdf-summary-meta dd { font-size: 12px; line-height: 1.3; }
.pdf-summary-compact .pdf-summary-meta { margin-top: 12px; }
.pdf-summary-compact .pdf-summary-bike { height: 365px; transform: scale(.85); transform-origin: top center; }
.pdf-summary-compact .pdf-summary-figure { margin-top: 12px; }
.pdf-summary-compact .pdf-summary-bottom { margin-top: 12px; }
`;
