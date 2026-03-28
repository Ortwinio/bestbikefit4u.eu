# 06 — PDF Template: Fit Sections Styling

## Goal
Apply brand colours, improved typography, and visual enhancements to the existing fit sections (Profile, Priority Summary, Detailed Fit, Adjustment Sequence, Tyre Pressure, Validation Plan, Fit Notes) without changing their data or structure.

## Current sections to improve

| Section | Current state | Improvements |
|---------|--------------|--------------|
| Profile header | Plain `<h2>` + 3 `<div class="panel">` tiles | Keep hero layout; add status badge for data quality; colour partial/complete badge |
| Priority Summary | Plain table | Colour-code the Status column (green = ready, yellow = optional, grey = pending) |
| Detailed Fit | Wide 6-column table | Highlight the target column in blue; use alternating row shading |
| Adjustment Sequence | Plain `<ol>` | Styled numbered badges + card per step |
| Tyre Pressure | Plain panel | Blue accent for ready state; keep orange warning for pending |
| Validation Plan | Plain table | Alternating row shading |
| Fit Notes | Plain `<ul>` | Light-blue callout box |

## CSS additions (to add into the existing `<style>` block)

```css
/* ─── Table enhancements ─── */
table { width: 100%; border-collapse: collapse; margin-top: 10px; }
th, td { border-bottom: 1px solid #e2e8f0; text-align: left; padding: 8px 6px; vertical-align: top; }
th { background: #f8fafc; color: #475569; font-size: 10.5px; text-transform: uppercase; letter-spacing: 0.05em; }
tbody tr:nth-child(even) td { background: #fafafa; }

/* Target column highlight */
td.target-col { font-weight: 700; color: #0369a1; }

/* Status badge in table */
.status-badge {
  display: inline-block;
  font-size: 10px;
  font-weight: 600;
  padding: 2px 8px;
  border-radius: 999px;
  white-space: nowrap;
}
.status-badge.ready       { background: #dcfce7; color: #15803d; }
.status-badge.optional    { background: #fef9c3; color: #a16207; }
.status-badge.pending_data { background: #f1f5f9; color: #64748b; }

/* ─── Adjustment sequence ─── */
.adj-list { list-style: none; margin: 0; padding: 0; }
.adj-item {
  display: grid;
  grid-template-columns: 32px 1fr;
  gap: 12px;
  align-items: start;
  padding: 10px 0;
  border-bottom: 1px solid #e2e8f0;
}
.adj-item:last-child { border-bottom: none; }
.adj-number {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: #0ea5e9;
  color: #fff;
  font-size: 13px;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
.adj-body .adj-title { font-size: 13px; font-weight: 700; color: #0f172a; }
.adj-body .adj-target { font-size: 12px; color: #0369a1; font-weight: 600; margin-top: 2px; }
.adj-body .adj-note { font-size: 11px; color: #64748b; margin-top: 2px; }

/* ─── Tyre pressure — ready state ─── */
.tp-panel {
  border: 1px solid #bae6fd;
  background: #f0f9ff;
  border-radius: 10px;
  padding: 14px 16px;
  margin-top: 10px;
}
.tp-readings {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
  margin-bottom: 12px;
}
.tp-reading-tile {
  background: #fff;
  border: 1px solid #bae6fd;
  border-radius: 8px;
  padding: 10px 14px;
  text-align: center;
}
.tp-reading-tile .tp-pos { font-size: 10px; text-transform: uppercase; letter-spacing: 0.05em; color: #64748b; }
.tp-reading-tile .tp-psi { font-size: 22px; font-weight: 700; color: #0369a1; }
.tp-reading-tile .tp-bar { font-size: 12px; color: #64748b; }

/* ─── Fit notes callout ─── */
.fit-notes-box {
  background: #f0f9ff;
  border: 1px solid #bae6fd;
  border-radius: 10px;
  padding: 14px 16px;
}
.fit-notes-box ul { margin: 0; padding-left: 18px; }
.fit-notes-box li { margin-bottom: 6px; font-size: 12px; color: #0c4a6e; }
```

## Updated render functions

### `renderRows` — add status badge to Priority Summary

```typescript
function renderRows(report: ReportV2Payload["prioritySummary"], copy: ReportV2Copy): string {
  return report
    .map((row) => {
      const parameter = copy.parameters[row.key];
      const statusClass = row.status; // "ready" | "pending_data" | "optional"
      return `<tr>
  <td>${escapeHtml(parameter.label)}</td>
  <td class="target-col">${escapeHtml(row.targetLabel)}</td>
  <td>${escapeHtml(parameter.whyItMatters)}</td>
  <td>${escapeHtml(parameter.riderValidationCue)}</td>
  <td><span class="status-badge ${statusClass}">${escapeHtml(getStatusLabel(row.status, copy))}</span></td>
</tr>`;
    })
    .join("\n");
}
```

### `renderDetailedRows` — highlight target column

```typescript
function renderDetailedRows(
  report: ReportV2Payload["detailedFit"],
  copy: ReportV2Copy
): string {
  return report
    .map((row) => {
      const parameter = copy.parameters[row.key];
      return `<tr>
  <td>${escapeHtml(parameter.label)}</td>
  <td class="target-col">${escapeHtml(row.targetLabel)}</td>
  <td>${escapeHtml(row.rangeLabel ?? "n/a")}</td>
  <td>${escapeHtml(parameter.methodLabel)}</td>
  <td>${escapeHtml(parameter.feelDescription)}</td>
  <td>${escapeHtml(`${parameter.watchOutHigh} ${parameter.watchOutLow}`)}</td>
</tr>`;
    })
    .join("\n");
}
```

### `renderAdjustmentSteps` — card layout with numbered circles

```typescript
function renderAdjustmentSteps(
  report: ReportV2Payload["adjustmentSequence"],
  copy: ReportV2Copy
): string {
  return report
    .map((step) => {
      const parameter = copy.parameters[step.key];
      return `<li class="adj-item">
  <div class="adj-number">${step.order}</div>
  <div class="adj-body">
    <div class="adj-title">${escapeHtml(parameter.label)}</div>
    <div class="adj-target">${escapeHtml(step.targetLabel)}</div>
    <div class="adj-note">${escapeHtml(parameter.measurementReference)} — ${escapeHtml(parameter.sequenceNote)}</div>
  </div>
</li>`;
    })
    .join("\n");
}
// Caller: <ul class="adj-list">${renderAdjustmentSteps(...)}</ul>
```

### `renderTirePressure` — blue panel for ready state

```typescript
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
      ? `<ul>${report.warnings.map((w) => `<li>${escapeHtml(w)}</li>`).join("\n")}</ul>`
      : `<p>${escapeHtml(copy.tirePressure.noWarnings)}</p>`;

    return `<div class="tp-panel">
  <div class="tp-readings">
    <div class="tp-reading-tile">
      <div class="tp-pos">${escapeHtml(copy.tirePressure.front)}</div>
      <div class="tp-psi">${Math.round(report.frontPsi)} psi</div>
      <div class="tp-bar">${report.frontBar.toFixed(1)} bar</div>
    </div>
    <div class="tp-reading-tile">
      <div class="tp-pos">${escapeHtml(copy.tirePressure.rear)}</div>
      <div class="tp-psi">${Math.round(report.rearPsi)} psi</div>
      <div class="tp-bar">${report.rearBar.toFixed(1)} bar</div>
    </div>
  </div>
  <p style="font-size:11px;color:#64748b;margin-bottom:6px"><strong>${escapeHtml(copy.tirePressure.confidence)}:</strong> ${
    report.confidence ? `${report.confidence}%` : "n/a"
  }</p>
  <h3 style="font-size:12px;margin:8px 0 4px">${escapeHtml(copy.tirePressure.inputsTitle)}</h3>
  <ul style="font-size:11px">${inputs}</ul>
  <h3 style="font-size:12px;margin:8px 0 4px">${escapeHtml(copy.tirePressure.warnings)}</h3>
  ${warnings}
</div>`;
  }

  // Pending — keep existing orange warning panel unchanged
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
```

### Fit notes — callout box

Replace the existing fit notes block in `renderPdfReportHtml`:

```typescript
${
  report.fitNotes.length
    ? `<h2 class="section-title">${escapeHtml(copy.sections.fitNotes)}</h2>
       <div class="fit-notes-box"><ul>${report.fitNotes
         .map((note) => `<li>${escapeHtml(note)}</li>`)
         .join("\n")}</ul></div>`
    : ""
}
```

## Changes to `renderPdfReportHtml` body

- Replace `<ol>` with `<ul class="adj-list">` for adjustment steps
- Replace `.panel` with `.tp-panel` in ready tyre pressure output
- Add `class="section-title"` to all `<h2>` section headings inside the main body
- Remove the old plain `h1` + `p.muted` opening block (replaced by cover header from prompt 02)

## Acceptance criteria
- Priority Summary table has coloured status badges (green/yellow/grey)
- Priority Summary and Detailed Fit tables have target value highlighted in blue
- Tables use alternating row shading
- Adjustment sequence uses numbered circle badges on a card-per-step layout
- Tyre Pressure in ready state uses blue accent panel with front/rear tiles; pending state keeps orange warning
- Fit notes use a light-blue callout box
- All section headings use `h2.section-title` style with blue left-border accent
- No data is lost — all existing fields remain visible
