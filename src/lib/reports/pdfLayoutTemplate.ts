import { BRAND } from "@/config/brand";
import type { PdfReportViewModel } from "@/lib/reports/pdfValueMapping";

export type PdfTemplateAssets = {
  logoUrl?: string;
  heroUrl?: string;
  iconCockpitUrl?: string;
  iconStepsUrl?: string;
  iconWarningUrl?: string;
  measurementGuideUrl?: string;
};

function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function renderIcon(url: string | undefined, alt: string): string {
  if (!url) {
    return "";
  }
  return `<img class="icon" src="${escapeHtml(url)}" alt="${escapeHtml(alt)}" />`;
}

function renderSummaryCards(cards: PdfReportViewModel["summaryCards"]): string {
  return cards
    .map(
      (card) => `<div class="card" data-key="${escapeHtml(card.key)}">
  <div class="cardLabel">${escapeHtml(card.label)}</div>
  <div class="cardValue">${escapeHtml(card.value)}</div>
  <div class="cardSubtitle">${escapeHtml(card.subtitle)}</div>
</div>`
    )
    .join("\n");
}

function renderPriorityList(items: string[]): string {
  return items
    .map(
      (item, index) =>
        `<li><span class="priorityIndex">${index + 1}.</span> ${escapeHtml(item)}</li>`
    )
    .join("\n");
}

function renderCoreTargets(rows: PdfReportViewModel["coreTargets"]): string {
  return rows
    .map(
      (row) => `<tr>
  <td>${escapeHtml(row.parameter)}</td>
  <td>${escapeHtml(row.target)}</td>
  <td>${escapeHtml(row.range)}</td>
  <td>${escapeHtml(row.why)}</td>
</tr>`
    )
    .join("\n");
}

function renderImplementationRows(
  rows: PdfReportViewModel["implementationPlan"]
): string {
  return rows
    .map(
      (row) => `<tr>
  <td>${escapeHtml(row.days)}</td>
  <td>${escapeHtml(row.action)}</td>
  <td>${escapeHtml(row.track)}</td>
</tr>`
    )
    .join("\n");
}

function renderDefinitionsRows(
  rows: PdfReportViewModel["measurementDefinitions"]
): string {
  return rows
    .map(
      (row) => `<tr>
  <td>${escapeHtml(row.metric)}</td>
  <td>${escapeHtml(row.method)}</td>
  <td>${escapeHtml(row.tools)}</td>
</tr>`
    )
    .join("\n");
}

function renderWarningList(items: string[]): string {
  return items
    .map((item) => `<li>${escapeHtml(item)}</li>`)
    .join("\n");
}

function renderFitNotes(notes: string[]): string {
  if (notes.length === 0) {
    return "";
  }

  const list = notes.map((note) => `<li>${escapeHtml(note)}</li>`).join("\n");

  return `<section class="fitNotes">
  <h2>Additional fit notes</h2>
  <ul>${list}</ul>
</section>`;
}

function renderLogo(assets: PdfTemplateAssets): string {
  if (!assets.logoUrl) {
    return `<div class="logoFallback">${escapeHtml(BRAND.name)}</div>`;
  }
  return `<img class="logo" src="${escapeHtml(assets.logoUrl)}" alt="${escapeHtml(
    BRAND.name
  )}" />`;
}

function renderHero(assets: PdfTemplateAssets): string {
  if (!assets.heroUrl) {
    return `<div class="assetFallback">Hero image unavailable in this runtime.</div>`;
  }
  return `<img class="imgRound" src="${escapeHtml(
    assets.heroUrl
  )}" alt="Rider on bike" />`;
}

function renderMeasurementImage(assets: PdfTemplateAssets): string {
  if (!assets.measurementGuideUrl) {
    return `<div class="assetFallback">Measurement guide image unavailable in this runtime.</div>`;
  }
  return `<img class="imgRound" src="${escapeHtml(
    assets.measurementGuideUrl
  )}" alt="Measurement guide" />`;
}

export function renderPdfReportHtml(params: {
  report: PdfReportViewModel;
  assets?: PdfTemplateAssets;
}): string {
  const report = params.report;
  const assets = params.assets ?? {};

  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <title>${escapeHtml(report.title)}</title>
  <style>
    @page { size: A4; margin: 18mm 18mm 16mm 18mm; }
    :root {
      --bbf-color-brand: #0B1E3B;
      --bbf-color-text: #111827;
      --bbf-color-muted: #6B7280;
      --bbf-color-border: #E5E7EB;
      --bbf-color-card: #0B1E3B;
      --bbf-color-callout-bg: #EFF6FF;
      --bbf-color-callout-border: #60A5FA;
      --bbf-color-warn-bg: #FFF7ED;
      --bbf-color-warn-border: #FB923C;
      --bbf-space-xs: 6px;
      --bbf-space-sm: 10px;
      --bbf-space-md: 14px;
      --bbf-space-lg: 18px;
      --bbf-radius-md: 10px;
      --bbf-radius-lg: 12px;
    }
    * { box-sizing: border-box; }
    body {
      font-family: "Arial", "Helvetica", sans-serif;
      color: var(--bbf-color-text);
      font-size: 12px;
      line-height: 1.4;
      margin: 0;
    }
    .header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-bottom: 1px solid var(--bbf-color-border);
      padding-bottom: var(--bbf-space-sm);
    }
    .logo { height: 28px; max-width: 220px; object-fit: contain; }
    .logoFallback {
      color: var(--bbf-color-brand);
      font-weight: 700;
      font-size: 18px;
      letter-spacing: 0.2px;
    }
    .meta {
      color: var(--bbf-color-muted);
      font-size: 11px;
      text-align: right;
      line-height: 1.45;
    }
    h1 {
      color: var(--bbf-color-brand);
      font-size: 22px;
      margin: var(--bbf-space-md) 0 var(--bbf-space-sm);
    }
    h2 {
      color: var(--bbf-color-brand);
      font-size: 14px;
      margin: var(--bbf-space-md) 0 var(--bbf-space-sm);
      display: flex;
      align-items: center;
      gap: var(--bbf-space-sm);
    }
    .icon { width: 22px; height: 22px; object-fit: contain; }
    .grid2 {
      display: grid;
      grid-template-columns: 1.35fr 0.65fr;
      gap: var(--bbf-space-md);
      align-items: start;
    }
    .muted { color: var(--bbf-color-muted); font-size: 11px; }
    .imgRound {
      border-radius: var(--bbf-radius-lg);
      width: 100%;
      display: block;
      border: 1px solid var(--bbf-color-border);
    }
    .assetFallback {
      border: 1px dashed #9CA3AF;
      border-radius: var(--bbf-radius-lg);
      color: var(--bbf-color-muted);
      padding: 20px 16px;
      font-size: 11px;
      min-height: 120px;
      display: flex;
      align-items: center;
      justify-content: center;
      text-align: center;
    }
    .cardRow {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: var(--bbf-space-sm);
      margin: var(--bbf-space-sm) 0 var(--bbf-space-md);
    }
    .card {
      background: var(--bbf-color-card);
      color: #FFFFFF;
      border-radius: var(--bbf-radius-md);
      padding: 12px;
      min-height: 84px;
    }
    .cardLabel { font-size: 11px; opacity: 0.9; }
    .cardValue { font-size: 22px; font-weight: 700; margin: 6px 0; }
    .cardSubtitle { font-size: 10px; opacity: 0.9; }
    .callout {
      background: var(--bbf-color-callout-bg);
      border: 1px solid var(--bbf-color-callout-border);
      border-radius: var(--bbf-radius-md);
      padding: 12px;
      margin: 0 0 var(--bbf-space-md);
    }
    .callout ul { margin: 8px 0 0; padding: 0; list-style: none; }
    .callout li { margin-bottom: 6px; }
    .priorityIndex { font-weight: 700; }
    table {
      width: 100%;
      border-collapse: collapse;
      margin: 8px 0 0;
    }
    th {
      background: var(--bbf-color-brand);
      color: #FFFFFF;
      text-align: left;
      padding: 8px;
      font-size: 11px;
    }
    td {
      border: 1px solid var(--bbf-color-border);
      padding: 8px;
      vertical-align: top;
    }
    .warn {
      background: var(--bbf-color-warn-bg);
      border: 1px solid var(--bbf-color-warn-border);
      border-radius: var(--bbf-radius-md);
      padding: 12px;
    }
    .warn ul { margin: 0; padding-left: 16px; }
    .warn li { margin-bottom: 6px; }
    .fitNotes ul { margin: 0; padding-left: 18px; }
    .frameGuidance {
      margin-top: var(--bbf-space-md);
      padding: 12px;
      border: 1px solid var(--bbf-color-border);
      border-radius: var(--bbf-radius-md);
      background: #F9FAFB;
    }
    .pageBreak { page-break-before: always; }
  </style>
</head>
<body>
  <header class="header">
    ${renderLogo(assets)}
    <div class="meta">
      Session: ${escapeHtml(report.meta.sessionId)}<br/>
      Created: ${escapeHtml(report.meta.createdDate)}<br/>
      Completed: ${escapeHtml(report.meta.completedDate)}<br/>
      Bike: ${escapeHtml(report.meta.bikeType)} | Goal: ${escapeHtml(
    report.meta.goal
  )}<br/>
      Riding style: ${escapeHtml(report.meta.ridingStyle)}<br/>
      Algorithm: v${escapeHtml(report.meta.algorithmVersion)} | Confidence: ${escapeHtml(
    report.meta.confidence
  )}
    </div>
  </header>

  <h1>${escapeHtml(report.intro.headline)}</h1>

  <section class="grid2">
    <div>
      <p>${escapeHtml(report.intro.paragraphs[0] ?? "")}</p>
      <p>${escapeHtml(report.intro.paragraphs[1] ?? "")}</p>
      <p class="muted">${escapeHtml(report.intro.bestPractice)}</p>
    </div>
    ${renderHero(assets)}
  </section>

  <section class="cardRow">
    ${renderSummaryCards(report.summaryCards)}
  </section>

  <section class="callout">
    <strong>Your 3 priority changes (start here)</strong>
    <ul>
      ${renderPriorityList(report.priorityChanges)}
    </ul>
  </section>

  <h2>${renderIcon(assets.iconCockpitUrl, "Core targets icon")}Core fit targets</h2>
  <table>
    <thead>
      <tr><th>Parameter</th><th>Target</th><th>Range</th><th>Why it matters</th></tr>
    </thead>
    <tbody>
      ${renderCoreTargets(report.coreTargets)}
    </tbody>
  </table>

  <section class="frameGuidance">
    <strong>Frame guidance:</strong> ${escapeHtml(report.frameGuidance.size)}<br/>
    <span class="muted">Fit score: ${escapeHtml(report.frameGuidance.fitScore)}</span><br/>
    <span class="muted">${escapeHtml(report.frameGuidance.notes)}</span>
  </section>

  <div class="pageBreak"></div>

  <h1>Implementation plan</h1>
  <h2>${renderIcon(assets.iconStepsUrl, "Plan icon")}14-day progressive plan</h2>
  <table>
    <thead>
      <tr><th>Days</th><th>What to do</th><th>What to track</th></tr>
    </thead>
    <tbody>
      ${renderImplementationRows(report.implementationPlan)}
    </tbody>
  </table>

  <h2>${renderIcon(assets.iconWarningUrl, "Warning icon")}If you feel this -> try this</h2>
  <section class="warn">
    <ul>
      ${renderWarningList(report.warningActions)}
    </ul>
  </section>

  ${renderFitNotes(report.fitNotes)}

  <div class="pageBreak"></div>

  <h1>Measurement guide</h1>
  <p class="muted">Use consistent reference points. See definitions below.</p>
  ${renderMeasurementImage(assets)}

  <h2>Definitions</h2>
  <table>
    <thead>
      <tr><th>Metric</th><th>How to measure</th><th>Tools</th></tr>
    </thead>
    <tbody>
      ${renderDefinitionsRows(report.measurementDefinitions)}
    </tbody>
  </table>

  <p class="muted">${escapeHtml(report.safetyDisclaimer)}</p>
</body>
</html>`;
}
