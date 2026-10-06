import { pressureDisplayStyles, renderPressureDisplay } from "../../../../shared/pressure/display";
import { PDF_TIRES_COPY, type ReportV2Copy } from "../reportV2Copy";
import type { ReportV2Payload } from "../reportV2Types";
import { escapeHtml, localizePdfValue, type PdfReportAssets } from "../pdfShared";

function surfaceLabel(value: string | null, copy: ReportV2Copy): string {
  if (!value) return "";
  const normalized = value.replace(/[_ -]/g, "").toLowerCase();
  const entry = Object.entries(copy.tirePressure.surfaceValues).find(([key]) => key.toLowerCase() === normalized);
  return entry?.[1] ?? value;
}

export function renderTiresPage(report: ReportV2Payload, copy: ReportV2Copy, assets: PdfReportAssets): string {
  const labels = PDF_TIRES_COPY[copy.locale === "nl" ? "nl" : "en"];
  const pressure = report.tirePressure;
  const number = new Intl.NumberFormat(copy.locale, { maximumFractionDigits: 1, minimumFractionDigits: 1 });
  let personal = "";
  if (pressure.status === "ready") {
    const valid = [pressure.frontBar, pressure.rearBar, pressure.frontPsi, pressure.rearPsi].every(
      (value) => Number.isFinite(value) && value > 0,
    );
    const surface = surfaceLabel(pressure.surface, copy);
    const gauges = valid ? `<div class="pdf-tires-shared">${renderPressureDisplay({
      ...pressure, locale: copy.locale === "nl" ? "nl" : "en", compact: true,
    })}</div><p class="pdf-tires-scale">${escapeHtml(labels.scale)}</p>` : "";
    const inputs = pressure.inputs.filter((input) => input.value && input.value !== "n/a");
    const meta = inputs.length
      ? `<dl class="pdf-tires-meta">${inputs
          .map((input) => {
            const key = input.label === "ridingGoal" ? "goal" : input.label;
            const inputLabel =
              copy.tirePressure.inputLabels[key as keyof typeof copy.tirePressure.inputLabels] ?? input.label;
            let value =
              key === "surface"
                ? surfaceLabel(input.value, copy)
                : localizePdfValue(input.value, copy, key === "goal" ? "goal" : undefined);
            if (key === "goal") {
              const goal = input.value.trim().toLowerCase();
              value = labels.ridingGoals[goal as keyof typeof labels.ridingGoals] ?? value;
            }
            if (key === "riderWeight") {
              const weight = input.value.match(/^\s*(\d+(?:[.,]\d+)?)\s*kg\s*$/i);
              if (weight) value = `${number.format(Number(weight[1].replace(",", ".")))} kg`;
            }
            return `<div><dt>${escapeHtml(inputLabel)}</dt><dd>${escapeHtml(value)}</dd></div>`;
          })
          .join("")}</dl>`
      : "";
    const table = valid
      ? `<section class="pdf-tires-table-section">
      <div class="pdf-tires-table-heading"><h2>${escapeHtml(labels.surfaceTitle)}</h2>
        <span>${escapeHtml(labels.tableHint)}</span></div>
      <table><thead><tr><th>${escapeHtml(copy.tirePressure.inputLabels.surface)}</th>
        <th>${escapeHtml(copy.tirePressure.front)}</th><th>${escapeHtml(copy.tirePressure.rear)}</th>
        <th>${escapeHtml(labels.measured)}</th></tr></thead>
        <tbody><tr><th scope="row">${escapeHtml(surface || labels.recorded)}</th>
          <td class="mono">${number.format(pressure.frontBar)} <small>bar</small></td>
          <td class="mono">${number.format(pressure.rearBar)} <small>bar</small></td>
          <td class="pdf-tires-blank" aria-label="${escapeHtml(labels.fillIn)}"></td></tr></tbody></table>
      <p>${escapeHtml(labels.tableNote)}</p></section>`
      : "";
    const fullWarningsInDashboard =
      pressure.warnings.length > 3 ||
      pressure.warnings.reduce((length, warning) => length + warning.length, 0) > 240;
    const warningContent = fullWarningsInDashboard
      ? `<p class="pdf-tires-warning-notice">${escapeHtml(labels.warningsNotice)}</p>
        <p>${escapeHtml(labels.warningsCount.replace("{count}", String(pressure.warnings.length)))}</p>`
      : `<ul>${pressure.warnings.map((warning) => `<li>${escapeHtml(warning)}</li>`).join("")}</ul>`;
    const warnings = pressure.warnings.length
      ? `<section class="pdf-tires-warnings"><h2>${escapeHtml(copy.tirePressure.warnings)}</h2>
        ${warningContent}</section>`
      : "";
    personal = `${gauges}${meta}${table}${warnings}`;
  } else {
    const missing = pressure.required.map(
      (key) => copy.tirePressure.missingDataLabels[key as keyof typeof copy.tirePressure.missingDataLabels] ?? key,
    );
    personal = `<section class="pdf-tires-pending"><h2>${escapeHtml(labels.pending)}</h2>
      <p>${escapeHtml(labels.pendingBody)}</p>${
        missing.length
          ? `<h3>${escapeHtml(labels.missing)}</h3>
        <ul>${missing.map((label) => `<li>${escapeHtml(label)}</li>`).join("")}</ul>`
          : ""
      }</section>`;
  }
  return `<div class="pdf-tires-body">
    <div class="pdf-tires-intro"><div><h1>${escapeHtml(labels.title)}</h1>
      <p>${escapeHtml(labels.intro)}</p>${
        report.bike.name ? `<p class="pdf-tires-bike">${escapeHtml(report.bike.name)}</p>` : ""
      }</div>
      ${assets.pressure ? `<img src="${escapeHtml(assets.pressure)}" alt="${escapeHtml(labels.illustration)}" />` : ""}
    </div>${personal}
    <div class="pdf-tires-guidance"><section class="pdf-tires-test"><h2>${escapeHtml(labels.testTitle)}</h2>
      <ol>${labels.steps
        .map(
          (step, index) => `<li><b class="mono">${index + 1}</b>
        <span>${escapeHtml(step)}</span></li>`,
        )
        .join("")}</ol></section>
      <section class="pdf-tires-maximum"><h2>${escapeHtml(labels.maximum)}</h2>
        <p>${escapeHtml(labels.maximumBody)}</p></section></div>
  </div>`;
}

export const tiresStyles = `${pressureDisplayStyles}
.pdf-tires-shared { margin-top: 18px; }

.pdf-tires-body { padding-top: 24px; }
.pdf-tires-intro { display: grid; grid-template-columns: 1fr 200px; gap: 24px; align-items: center; }
.pdf-tires-intro h1 { margin: 0; font-size: 40px; line-height: 1.05; letter-spacing: -.03em; font-weight: 800; }
.pdf-tires-intro p { margin: 8px 0 0; font-size: 15px; line-height: 1.5; color: var(--bbf-tekst); }
.pdf-tires-intro .pdf-tires-bike { font-weight: 700; }
.pdf-tires-intro img { width: 200px; height: 150px; object-fit: contain; border-radius: 16px; }
.pdf-tires-scale { margin: 6px 0 0; font-size: 11px; color: var(--bbf-gedempt); text-align: right; }
.pdf-tires-meta { margin: 14px 0 0; display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; }
.pdf-tires-meta > div { padding: 9px 12px; border-radius: 12px; background: var(--bbf-papier); }
.pdf-tires-meta dt { font-size: 12px; color: var(--bbf-gedempt); }
.pdf-tires-meta dd { margin: 2px 0 0; font-size: 15px; font-weight: 700; overflow-wrap: anywhere; }
.pdf-tires-table-section { margin-top: 20px; }
.pdf-tires-table-heading { display: flex; align-items: baseline; justify-content: space-between; gap: 12px; }
.pdf-tires-table-heading h2 { margin: 0; font-size: 22px; letter-spacing: -.02em; }
.pdf-tires-table-heading span { font-size: 12px; color: var(--bbf-gedempt); }
.pdf-tires-table-section table { width: 100%; margin-top: 8px; border-collapse: collapse; table-layout: fixed; }
.pdf-tires-table-section th, .pdf-tires-table-section td { padding: 11px 12px;
  border: 1px solid var(--bbf-rand); text-align: right; font-size: 15px; }
.pdf-tires-table-section thead th { background: var(--bbf-papier); font-size: 12px; padding: 8px 12px; }
.pdf-tires-table-section th:first-child { width: 32%; text-align: left; }
.pdf-tires-table-section tbody { background: var(--bbf-lime-zacht); }
.pdf-tires-table-section tbody th { font-size: 14px; }
.pdf-tires-table-section small { font-size: 11px; color: var(--bbf-gedempt); }
.pdf-tires-table-section .pdf-tires-blank { background: var(--bbf-wit); }
.pdf-tires-table-section p { margin: 8px 0 0; font-size: 12px; line-height: 1.45; color: var(--bbf-gedempt); }
.pdf-tires-guidance { margin-top: 18px; display: grid; grid-template-columns: 1.25fr 1fr; gap: 14px; }
.pdf-tires-guidance section { padding: 16px 18px; border-radius: 18px; }
.pdf-tires-guidance h2 { margin: 0; font-size: 19px; letter-spacing: -.02em; }
.pdf-tires-test { background: var(--bbf-lime); }
.pdf-tires-test ol { margin: 10px 0 0; padding: 0; list-style: none; display: flex;
  flex-direction: column; gap: 8px; font-size: 13px; line-height: 1.4; }
.pdf-tires-test li { display: grid; grid-template-columns: 24px 1fr; gap: 8px; align-items: start; }
.pdf-tires-test b { width: 22px; height: 22px; border-radius: 50%; background: var(--bbf-inkt);
  color: var(--bbf-wit); display: flex; align-items: center; justify-content: center; font-size: 11px; }
.pdf-tires-maximum { border: 2px solid var(--bbf-inkt); }
.pdf-tires-maximum p { margin: 8px 0 0; font-size: 13px; line-height: 1.45; color: var(--bbf-tekst); }
.pdf-tires-pending { margin-top: 20px; padding: 24px; border-radius: 20px; background: var(--bbf-papier); }
.pdf-tires-pending h2 { margin: 0; font-size: 24px; }
.pdf-tires-pending p { font-size: 15px; line-height: 1.5; }
.pdf-tires-pending h3 { font-size: 16px; }
.pdf-tires-pending ul { columns: 2; font-size: 14px; line-height: 1.7; }
.pdf-tires-warnings { margin-top: 16px; padding: 12px 16px; border-left: 4px solid var(--bbf-warning); }
.pdf-tires-warnings h2 { margin: 0; font-size: 16px; }
.pdf-tires-warnings p { margin: 6px 0 0; font-size: 12px; line-height: 1.4; }
.pdf-tires-warning-notice { font-weight: 700; }
.pdf-tires-warnings ul { margin: 6px 0 0; padding-left: 18px; font-size: 12px; line-height: 1.4; }
`;
