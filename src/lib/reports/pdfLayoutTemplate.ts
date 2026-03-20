import type { ReportV2Copy } from "@/lib/reports/reportV2Copy";
import type { ReportV2Payload } from "@/lib/reports/reportV2Types";

function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function getStatusLabel(
  status: "ready" | "pending_data" | "optional",
  copy: ReportV2Copy
): string {
  switch (status) {
    case "ready":
      return copy.status.ready;
    case "pending_data":
      return copy.status.pendingData;
    case "optional":
      return copy.status.optional;
  }
}

function renderRows(report: ReportV2Payload["prioritySummary"], copy: ReportV2Copy): string {
  return report
    .map((row) => {
      const parameter = copy.parameters[row.key];
      return `<tr>
  <td>${escapeHtml(parameter.label)}</td>
  <td>${escapeHtml(row.targetLabel)}</td>
  <td>${escapeHtml(parameter.whyItMatters)}</td>
  <td>${escapeHtml(parameter.riderValidationCue)}</td>
  <td>${escapeHtml(getStatusLabel(row.status, copy))}</td>
</tr>`;
    })
    .join("\n");
}

function renderDetailedRows(
  report: ReportV2Payload["detailedFit"],
  copy: ReportV2Copy
): string {
  return report
    .map((row) => {
      const parameter = copy.parameters[row.key];
      return `<tr>
  <td>${escapeHtml(parameter.label)}</td>
  <td>${escapeHtml(row.targetLabel)}</td>
  <td>${escapeHtml(row.rangeLabel ?? "n/a")}</td>
  <td>${escapeHtml(parameter.methodLabel)}</td>
  <td>${escapeHtml(parameter.feelDescription)}</td>
  <td>${escapeHtml(`${parameter.watchOutHigh} ${parameter.watchOutLow}`)}</td>
</tr>`;
    })
    .join("\n");
}

function renderAdjustmentSteps(
  report: ReportV2Payload["adjustmentSequence"],
  copy: ReportV2Copy
): string {
  return report
    .map((step) => {
      const parameter = copy.parameters[step.key];
      return `<li>
  <strong>${step.order}. ${escapeHtml(parameter.label)}</strong><br />
  ${escapeHtml(step.targetLabel)}<br />
  <span class="muted">${escapeHtml(parameter.measurementReference)}</span><br />
  <span class="muted">${escapeHtml(parameter.sequenceNote)}</span>
</li>`;
    })
    .join("\n");
}

function renderTirePressure(report: ReportV2Payload["tirePressure"], copy: ReportV2Copy): string {
  if (report.status === "ready") {
    const inputs = report.inputs
      .map(
        (input) =>
          `<li>${escapeHtml(
            copy.tirePressure.inputLabels[
              input.label as keyof typeof copy.tirePressure.inputLabels
            ] ?? input.label
          )}: ${escapeHtml(input.value)}</li>`
      )
      .join("\n");

    const warnings = report.warnings.length
      ? `<ul>${report.warnings.map((warning) => `<li>${escapeHtml(warning)}</li>`).join("\n")}</ul>`
      : `<p>${escapeHtml(copy.tirePressure.noWarnings)}</p>`;

    return `<div class="panel">
  <p><strong>${escapeHtml(copy.tirePressure.front)}:</strong> ${Math.round(
      report.frontPsi
    )} psi / ${report.frontBar.toFixed(1)} bar</p>
  <p><strong>${escapeHtml(copy.tirePressure.rear)}:</strong> ${Math.round(
      report.rearPsi
    )} psi / ${report.rearBar.toFixed(1)} bar</p>
  <p><strong>${escapeHtml(copy.tirePressure.confidence)}:</strong> ${
      report.confidence ? `${report.confidence}%` : "n/a"
    }</p>
  <p><strong>${escapeHtml(copy.tirePressure.inputLabels.surface)}:</strong> ${
      report.surface ?? "n/a"
    }</p>
  <h3>${escapeHtml(copy.tirePressure.inputsTitle)}</h3>
  <ul>${inputs}</ul>
  <h3>${escapeHtml(copy.tirePressure.warnings)}</h3>
  ${warnings}
</div>`;
  }

  const missing = report.required
    .map(
      (item) =>
        `<li>${escapeHtml(
          copy.tirePressure.missingDataLabels[
            item as keyof typeof copy.tirePressure.missingDataLabels
          ] ?? item
        )}</li>`
    )
    .join("\n");
  const quickStart = report.quickStartTable
    .map(
      (row) => `<tr>
  <td>${escapeHtml(row.weightLabel)}</td>
  <td>${escapeHtml(row.tireSizeLabel)}</td>
  <td>${escapeHtml(row.psiLabel)}</td>
</tr>`
    )
    .join("\n");

  return `<div class="panel warning">
  <p><strong>${escapeHtml(copy.tirePressure.pendingTitle)}</strong></p>
  <p>${escapeHtml(copy.tirePressure.pendingDescription)}</p>
  <ul>${missing}</ul>
  <h3>${escapeHtml(copy.tirePressure.quickStartTitle)}</h3>
  <p class="muted">${escapeHtml(copy.tirePressure.quickStartNote)}</p>
  <table>
    <thead><tr><th>Weight</th><th>Tyre size</th><th>PSI</th></tr></thead>
    <tbody>${quickStart}</tbody>
  </table>
</div>`;
}

function renderValidationPlan(copy: ReportV2Copy): string {
  return copy.validationPlan.rows
    .map(
      (row) => `<tr>
  <td>${escapeHtml(row.dayBlock)}</td>
  <td>${escapeHtml(row.change)}</td>
  <td>${escapeHtml(row.rideDuration)}</td>
  <td>${escapeHtml(row.whatToScore)}</td>
</tr>`
    )
    .join("\n");
}

export function renderPdfReportHtml(params: {
  report: ReportV2Payload;
  copy: ReportV2Copy;
}): string {
  const { report, copy } = params;

  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <title>${escapeHtml(copy.introTitle)}</title>
  <style>
    @page { size: A4; margin: 16mm; }
    body { font-family: Arial, Helvetica, sans-serif; color: #111827; font-size: 12px; line-height: 1.45; }
    h1, h2, h3 { color: #0f172a; margin: 0 0 10px; }
    h1 { font-size: 24px; margin-bottom: 8px; }
    h2 { font-size: 16px; margin-top: 24px; }
    h3 { font-size: 13px; margin-top: 16px; }
    p { margin: 0 0 8px; }
    ul, ol { margin: 8px 0 0 18px; padding: 0; }
    li { margin-bottom: 6px; }
    table { width: 100%; border-collapse: collapse; margin-top: 10px; }
    th, td { border-bottom: 1px solid #e5e7eb; text-align: left; padding: 8px 6px; vertical-align: top; }
    th { color: #475569; font-size: 11px; text-transform: uppercase; letter-spacing: 0.03em; }
    .muted { color: #64748b; }
    .panel { border: 1px solid #e5e7eb; border-radius: 10px; padding: 12px; margin-top: 10px; }
    .warning { background: #fff7ed; border-color: #fdba74; }
    .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
    .meta { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
    .hero { display: grid; grid-template-columns: 160px 1fr 1fr; gap: 12px; align-items: start; }
    .bike-image { width: 160px; height: 120px; object-fit: cover; border-radius: 10px; border: 1px solid #e5e7eb; }
    .chip { display: inline-block; border: 1px solid #cbd5e1; border-radius: 999px; padding: 2px 8px; font-size: 11px; margin: 0 6px 6px 0; }
  </style>
</head>
<body>
  <h1>${escapeHtml(copy.introTitle)}</h1>
  <p class="muted">${escapeHtml(copy.introBody)}</p>

  <h2>${escapeHtml(copy.sections.profile)}</h2>
  <div class="hero">
    <div class="panel">
      ${
        report.profile.bikeImageUrl
          ? `<img class="bike-image" src="${escapeHtml(report.profile.bikeImageUrl)}" alt="Bike photo" />`
          : `<div class="bike-image" style="display:flex;align-items:center;justify-content:center;background:#f3f4f6;color:#64748b;">Bike</div>`
      }
    </div>
    <div class="panel">
      <p><strong>${escapeHtml(copy.profileFields.sessionId)}:</strong> ${escapeHtml(report.profile.sessionId)}</p>
      <p><strong>${escapeHtml(copy.profileFields.bikeType)}:</strong> ${escapeHtml(report.profile.bikeType)}</p>
      <p><strong>${escapeHtml(copy.profileFields.ridingStyle)}:</strong> ${escapeHtml(report.profile.ridingStyle)}</p>
      <p><strong>${escapeHtml(copy.profileFields.goal)}:</strong> ${escapeHtml(report.profile.goal)}</p>
    </div>
    <div class="panel">
      <p><strong>${escapeHtml(copy.profileFields.algorithmVersion)}:</strong> ${escapeHtml(report.profile.algorithmVersion)}</p>
      <p><strong>${escapeHtml(copy.profileFields.engineVersion)}:</strong> ${escapeHtml(report.profile.engineVersion)}</p>
      <p><strong>${escapeHtml(copy.profileFields.confidence)}:</strong> ${report.profile.globalConfidence}%</p>
      <p><strong>${escapeHtml(copy.profileFields.dataQuality)}:</strong> ${escapeHtml(
        report.profile.dataQualityStatus === "complete"
          ? copy.dataQuality.complete
          : copy.dataQuality.partial
      )}</p>
    </div>
  </div>
  ${
    report.profile.missingData.length
      ? `<div class="panel warning"><p>${escapeHtml(copy.dataQuality.banner)}</p>${report.profile.missingData
          .map(
            (item) =>
              `<span class="chip">${escapeHtml(
                copy.tirePressure.missingDataLabels[
                  item as keyof typeof copy.tirePressure.missingDataLabels
                ] ?? item
              )}</span>`
          )
          .join("")}</div>`
      : ""
  }

  <h2>${escapeHtml(copy.sections.prioritySummary)}</h2>
  <table>
    <thead>
      <tr>
        <th>${escapeHtml(copy.table.parameter)}</th>
        <th>${escapeHtml(copy.table.target)}</th>
        <th>${escapeHtml(copy.table.whyItMatters)}</th>
        <th>${escapeHtml(copy.table.riderValidationCue)}</th>
        <th>${escapeHtml(copy.table.status)}</th>
      </tr>
    </thead>
    <tbody>${renderRows(report.prioritySummary, copy)}</tbody>
  </table>

  <h2>${escapeHtml(copy.sections.detailedFit)}</h2>
  <table>
    <thead>
      <tr>
        <th>${escapeHtml(copy.table.parameter)}</th>
        <th>${escapeHtml(copy.table.target)}</th>
        <th>${escapeHtml(copy.table.range)}</th>
        <th>${escapeHtml(copy.table.method)}</th>
        <th>${escapeHtml(copy.table.feelDescription)}</th>
        <th>${escapeHtml(copy.table.watchOuts)}</th>
      </tr>
    </thead>
    <tbody>${renderDetailedRows(report.detailedFit, copy)}</tbody>
  </table>

  <h2>${escapeHtml(copy.sections.adjustmentSequence)}</h2>
  <p class="muted">${escapeHtml(copy.adjustmentGuideline)}</p>
  <ol>${renderAdjustmentSteps(report.adjustmentSequence, copy)}</ol>

  <h2>${escapeHtml(copy.sections.tirePressure)}</h2>
  ${renderTirePressure(report.tirePressure, copy)}

  <h2>${escapeHtml(copy.sections.validationPlan)}</h2>
  <table>
    <thead>
      <tr>
        <th>${escapeHtml(copy.validationPlan.dayBlock)}</th>
        <th>${escapeHtml(copy.validationPlan.change)}</th>
        <th>${escapeHtml(copy.validationPlan.rideDuration)}</th>
        <th>${escapeHtml(copy.validationPlan.whatToScore)}</th>
      </tr>
    </thead>
    <tbody>${renderValidationPlan(copy)}</tbody>
  </table>

  ${
    report.fitNotes.length
      ? `<h2>${escapeHtml(copy.sections.fitNotes)}</h2><ul>${report.fitNotes
          .map((note) => `<li>${escapeHtml(note)}</li>`)
          .join("\n")}</ul>`
      : ""
  }
</body>
</html>`;
}
