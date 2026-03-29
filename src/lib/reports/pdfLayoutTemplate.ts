import { BRAND } from "@/config/brand";
import type { ReportV2Copy } from "@/lib/reports/reportV2Copy";
import type { ReportRiderSection, ReportV2Payload } from "@/lib/reports/reportV2Types";

type ScoreValue = 1 | 2 | 3 | 4 | 5;
type ReportLocale = ReportV2Copy["locale"];

const SCORE_COLORS: Record<ScoreValue, string> = {
  1: "#ef4444",
  2: "#f97316",
  3: "#f59e0b",
  4: "#22c55e",
  5: "#16a34a",
};

const LOCALE_VALUE_LABELS = {
  en: {
    bikeType: {
      road: "Road",
      gravel: "Gravel",
      mountain: "Mountain",
      hybrid: "Hybrid",
      tt_triathlon: "TT / triathlon",
      cyclocross: "Cyclocross",
      touring: "Touring",
      city: "City",
    },
    ridingStyle: {
      recreational: "Recreational",
      fitness: "Fitness",
      sportive: "Sportive",
      racing: "Racing",
      commuting: "Commuting",
      touring: "Touring",
    },
    goal: {
      comfort: "Comfort",
      balanced: "Balanced",
      performance: "Performance",
      aero: "Aero",
    },
    experienceLevel: {
      beginner: "Beginner",
      intermediate: "Intermediate",
      advanced: "Advanced",
    },
    weeklyHours: {
      "0-3": "0-3 hrs/week",
      "3-6": "3-6 hrs/week",
      "6-10": "6-10 hrs/week",
      "10-15": "10-15 hrs/week",
      "15+": "15+ hrs/week",
    },
    rideLength: {
      short: "Short (<30 km)",
      medium: "Medium (30-80 km)",
      long: "Long (80-150 km)",
      ultra: "Ultra (150+ km)",
    },
    positionPriority: {
      comfort: "Maximum comfort",
      balanced: "Balanced",
      performance: "Performance",
    },
    typeOfRiding: {
      casual: "Casual / fitness",
      group: "Group rides",
      training: "Structured training",
      racing: "Racing",
      tt: "Time trial / triathlon",
      asphalt: "Asphalt only",
      paved: "Paved + light gravel",
      xc: "Cross-country",
      trail: "Trail",
      enduro: "Enduro",
      dh: "Downhill / bike park",
    },
  },
  nl: {
    bikeType: {
      road: "Racefiets",
      gravel: "Gravelbike",
      mountain: "Mountainbike",
      hybrid: "Hybride fiets",
      tt_triathlon: "TT / triatlon",
      cyclocross: "Cyclocross",
      touring: "Toerfiets",
      city: "Stadsfiets",
    },
    ridingStyle: {
      recreational: "Recreatief",
      fitness: "Fitness",
      sportive: "Sportief",
      racing: "Wedstrijd",
      commuting: "Woon-werk",
      touring: "Toeren",
    },
    goal: {
      comfort: "Comfort",
      balanced: "Gebalanceerd",
      performance: "Prestatie",
      aero: "Aero",
    },
    experienceLevel: {
      beginner: "Beginner",
      intermediate: "Gevorderd",
      advanced: "Vergevorderd",
    },
    weeklyHours: {
      "0-3": "0-3 uur/week",
      "3-6": "3-6 uur/week",
      "6-10": "6-10 uur/week",
      "10-15": "10-15 uur/week",
      "15+": "15+ uur/week",
    },
    rideLength: {
      short: "Kort (<30 km)",
      medium: "Middel (30-80 km)",
      long: "Lang (80-150 km)",
      ultra: "Ultra (150+ km)",
    },
    positionPriority: {
      comfort: "Maximaal comfort",
      balanced: "Gebalanceerd",
      performance: "Prestatie",
    },
    typeOfRiding: {
      casual: "Casual / fitness",
      group: "Groepsritten",
      training: "Gestructureerde training",
      racing: "Wedstrijd",
      tt: "Tijdrit / triatlon",
      asphalt: "Alleen asfalt",
      paved: "Verhard + lichte gravel",
      xc: "Cross-country",
      trail: "Trail",
      enduro: "Enduro",
      dh: "Downhill / bike park",
    },
  },
} as const;

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

function renderDocumentStyles(): string {
  return `@page { size: A4; margin: 16mm; }
    body { font-family: Arial, Helvetica, sans-serif; color: #0f172a; font-size: 12px; line-height: 1.5; }
    h1, h2, h3 { margin: 0; }
    p { margin: 0 0 8px; }
    ul, ol { margin: 8px 0 0 18px; padding: 0; }
    li { margin-bottom: 6px; }
    table { width: 100%; border-collapse: collapse; margin-top: 10px; }
    th, td { border-bottom: 1px solid #e2e8f0; text-align: left; padding: 8px 6px; vertical-align: top; overflow-wrap: anywhere; word-break: break-word; }
    th { background: #f8fafc; color: #475569; font-size: 10.5px; text-transform: uppercase; letter-spacing: 0.05em; }
    tbody tr:nth-child(even) td { background: #fafcff; }
    .muted { color: #64748b; }
    .report-shell { display: block; }
    .report-header { display: grid; grid-template-columns: 1fr auto; gap: 18px; align-items: start; margin-bottom: 18px; padding-bottom: 16px; border-bottom: 3px solid #0ea5e9; }
    .brand-lockup { display: flex; gap: 12px; align-items: center; }
    .brand-mark { width: 42px; height: 42px; object-fit: contain; }
    .brand-name { font-size: 11px; font-weight: 700; letter-spacing: 0.08em; text-transform: uppercase; color: #0369a1; margin: 0 0 4px; }
    .report-title { font-size: 24px; line-height: 1.1; }
    .report-date { text-align: right; font-size: 11px; color: #475569; }
    .report-cover { margin-bottom: 18px; }
    .report-section { margin-top: 22px; }
    .report-section, .content-tile, .callout-panel, .score-section, .bike-description, .measurements-grid, .bike-meta-grid, .tp-panel, .fit-notes-box, .report-header { page-break-inside: avoid; break-inside: avoid; }
    .section-title { font-size: 16px; font-weight: 700; color: #0369a1; border-left: 4px solid #0ea5e9; padding-left: 10px; margin: 0 0 12px; page-break-after: avoid; break-after: avoid; }
    .section-intro { font-size: 12px; color: #334155; margin-bottom: 10px; }
    .content-tile { border: 1px solid #e2e8f0; border-radius: 10px; padding: 12px; background: #ffffff; }
    .callout-panel { border: 1px solid #bae6fd; border-radius: 12px; padding: 14px; background: #f0f9ff; }
    .warning { background: #fff7ed; border-color: #fdba74; }
    .chip { display: inline-block; border: 1px solid #cbd5e1; border-radius: 999px; padding: 2px 8px; font-size: 11px; margin: 0 6px 6px 0; }
    .about-grid { display: grid; grid-template-columns: 1.3fr 1fr; gap: 12px; }
    .about-bullets { margin: 8px 0 0; padding: 0; list-style: none; }
    .about-bullets li { margin-bottom: 8px; padding-left: 14px; position: relative; }
    .about-bullets li::before { content: "•"; position: absolute; left: 0; color: #0369a1; font-weight: 700; }
    .rider-summary { display: grid; grid-template-columns: 80px 1fr; gap: 16px; align-items: start; }
    .rider-avatar { width: 80px; height: 80px; border-radius: 50%; display: flex; align-items: center; justify-content: center; background: #e0f2fe; border: 2px solid #bae6fd; color: #0369a1; font-size: 26px; font-weight: 700; }
    .rider-name { font-size: 18px; font-weight: 700; color: #0f172a; margin-bottom: 4px; overflow-wrap: anywhere; }
    .measurements-grid, .bike-meta-grid, .report-meta-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; margin-top: 12px; }
    .measurement-tile, .bike-meta-tile { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 10px 12px; overflow-wrap: anywhere; }
    .tile-label { font-size: 10px; text-transform: uppercase; letter-spacing: 0.05em; color: #64748b; }
    .tile-value { font-size: 15px; font-weight: 700; color: #0f172a; margin-top: 2px; }
    .tile-unit { font-size: 11px; color: #64748b; font-weight: 400; }
    .bmi-panel { margin-top: 14px; border: 1px solid #e2e8f0; border-radius: 10px; padding: 12px 14px; background: #f8fafc; }
    .bmi-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px; }
    .bmi-track { width: 100%; height: 10px; border-radius: 999px; background: linear-gradient(to right, #60a5fa 0%, #4ade80 34%, #facc15 65%, #f87171 100%); position: relative; }
    .bmi-marker { position: absolute; top: -3px; width: 4px; height: 16px; background: #0f172a; border-radius: 2px; transform: translateX(-50%); }
    .bmi-row { display: flex; justify-content: space-between; align-items: center; margin-top: 8px; }
    .bmi-value { font-size: 20px; font-weight: 700; }
    .bmi-badge { font-size: 11px; font-weight: 600; border-radius: 999px; padding: 2px 8px; }
    .bmi-badge.underweight { background: #dbeafe; color: #1d4ed8; }
    .bmi-badge.normal { background: #dcfce7; color: #15803d; }
    .bmi-badge.overweight { background: #fef3c7; color: #a16207; }
    .bmi-badge.obese { background: #fee2e2; color: #b91c1c; }
    .score-section { border: 1px solid #e2e8f0; border-radius: 10px; padding: 14px 16px; background: #f8fafc; }
    .score-header { display: flex; justify-content: space-between; align-items: center; gap: 8px; margin-bottom: 10px; }
    .score-label { font-size: 15px; font-weight: 700; color: #0f172a; }
    .score-badge { font-size: 11px; font-weight: 600; background: #e2e8f0; color: #475569; padding: 2px 10px; border-radius: 999px; white-space: nowrap; }
    .progress-track { width: 100%; height: 10px; border-radius: 999px; overflow: hidden; background: #e2e8f0; margin-bottom: 8px; }
    .progress-fill { height: 100%; border-radius: 999px; }
    .segment-bar { display: flex; gap: 5px; margin-bottom: 8px; }
    .segment { flex: 1; height: 10px; border-radius: 999px; background: #e2e8f0; }
    .score-description { font-size: 11px; color: #64748b; line-height: 1.5; }
    .bike-hero { display: grid; grid-template-columns: minmax(0, 1.25fr) minmax(0, 1fr); gap: 14px; align-items: start; }
    .bike-photo-wrap { width: 100%; min-height: 200px; border-radius: 10px; overflow: hidden; border: 1px solid #bae6fd; background: #f0f9ff; display: flex; align-items: center; justify-content: center; }
    .bike-photo-wrap img { width: 100%; max-height: 240px; object-fit: cover; display: block; }
    .bike-photo-placeholder { padding: 32px; font-size: 44px; color: #7dd3fc; }
    .bike-heading { font-size: 18px; font-weight: 700; margin-bottom: 10px; overflow-wrap: anywhere; }
    .bike-context { border: 1px solid #e2e8f0; border-radius: 8px; padding: 12px 14px; background: #f8fafc; margin-top: 12px; }
    .context-row { display: flex; justify-content: space-between; gap: 12px; padding: 5px 0; border-bottom: 1px solid #e5e7eb; font-size: 11.5px; }
    .context-row:last-child { border-bottom: none; }
    .context-label { color: #64748b; }
    .context-value { font-weight: 600; color: #0f172a; text-align: right; }
    .bike-description { font-size: 11.5px; color: #334155; line-height: 1.6; background: #f0f9ff; border: 1px solid #bae6fd; border-radius: 8px; padding: 12px 14px; margin-top: 12px; overflow-wrap: anywhere; }
    .status-badge { display: inline-block; font-size: 10px; font-weight: 600; padding: 2px 8px; border-radius: 999px; white-space: nowrap; }
    .status-badge.ready { background: #dcfce7; color: #15803d; }
    .status-badge.optional { background: #fef3c7; color: #a16207; }
    .status-badge.pending_data { background: #f1f5f9; color: #64748b; }
    .target-col { font-weight: 700; color: #0369a1; }
    .adj-list { list-style: none; margin: 0; padding: 0; }
    .adj-item { display: grid; grid-template-columns: 32px 1fr; gap: 12px; align-items: start; padding: 10px 0; border-bottom: 1px solid #e2e8f0; page-break-inside: avoid; break-inside: avoid; }
    .adj-item:last-child { border-bottom: none; }
    .adj-number { width: 32px; height: 32px; border-radius: 50%; background: #0ea5e9; color: #ffffff; display: flex; align-items: center; justify-content: center; font-size: 13px; font-weight: 700; }
    .adj-title { font-size: 13px; font-weight: 700; color: #0f172a; }
    .adj-target { font-size: 12px; color: #0369a1; font-weight: 600; margin-top: 2px; }
    .adj-note { font-size: 11px; color: #64748b; margin-top: 2px; }
    .tp-panel { border: 1px solid #bae6fd; background: #f0f9ff; border-radius: 10px; padding: 14px 16px; }
    .tp-readings { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 12px; }
    .tp-reading-tile { background: #ffffff; border: 1px solid #bae6fd; border-radius: 8px; padding: 10px 14px; text-align: center; }
    .tp-pos { font-size: 10px; text-transform: uppercase; letter-spacing: 0.05em; color: #64748b; }
    .tp-psi { font-size: 22px; font-weight: 700; color: #0369a1; }
    .tp-bar { font-size: 12px; color: #64748b; }
    .tp-visual-track { width: 100%; height: 10px; border-radius: 999px; background: #dbeafe; overflow: hidden; margin: 10px 0 8px; }
    .tp-visual-fill { height: 100%; border-radius: 999px; background: linear-gradient(90deg, #38bdf8 0%, #089BE9 55%, #0369a1 100%); }
    .fit-notes-box { background: #f0f9ff; border: 1px solid #bae6fd; border-radius: 10px; padding: 14px 16px; }
    .fit-notes-box ul { margin: 0; padding-left: 18px; }
    .fit-notes-box li { margin-bottom: 6px; font-size: 12px; color: #0c4a6e; }
  `;
}

function formatReportDate(locale: ReportV2Copy["locale"], reportDate: string): string {
  const date = new Date(reportDate);
  return new Intl.DateTimeFormat(locale === "nl" ? "nl-NL" : "en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(date);
}

function getPrintHeaderLogoDataUri(): string {
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 220 36" width="220" height="36">
      <circle cx="18" cy="18" r="14" fill="#089BE9"/>
      <path d="M10 22c3-6 6-10 8-12 2 2 5 5 8 12" fill="none" stroke="#ffffff" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/>
      <text x="42" y="23" font-family="Arial, Helvetica, sans-serif" font-size="18" font-weight="700" fill="#1C1F29">BestBikeFit4U</text>
    </svg>
  `.trim();
  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
}

export function renderPdfHeaderTemplate(params: {
  report: ReportV2Payload;
  copy: ReportV2Copy;
}): string {
  const { report, copy } = params;
  return `
    <div style="width:100%;font-family:Arial, Helvetica, sans-serif;font-size:9px;color:#475569;padding:0 18mm;">
      <div style="display:flex;align-items:center;justify-content:space-between;width:100%;border-bottom:1px solid #dbe3ec;padding:6px 0 7px;">
        <div style="display:flex;align-items:center;gap:10px;">
          <img src="${getPrintHeaderLogoDataUri()}" alt="${escapeHtml(copy.shell.brandAlt)}" style="height:18px;width:auto;" />
        </div>
        <div style="display:flex;align-items:center;gap:12px;white-space:nowrap;">
          <span style="font-weight:600;color:#1C1F29;">${escapeHtml(copy.introTitle)}</span>
          <span>${escapeHtml(copy.shell.dateLabel)}: ${escapeHtml(
            formatReportDate(copy.locale, report.reportDate)
          )}</span>
        </div>
      </div>
    </div>
  `.trim();
}

export function renderPdfFooterTemplate(): string {
  return `
    <div style="width:100%;font-family:Arial, Helvetica, sans-serif;font-size:9px;color:#475569;padding:0 18mm;">
      <div style="display:flex;align-items:center;justify-content:space-between;width:100%;border-top:1px solid #dbe3ec;padding:6px 0 0;">
        <span>Copyrights BestBikefit4U.eu</span>
        <span><span class="pageNumber"></span></span>
      </div>
    </div>
  `.trim();
}

function renderSection(title: string, body: string): string {
  return `<section class="report-section">
  <h2 class="section-title">${escapeHtml(title)}</h2>
  ${body}
</section>`;
}

function getInitials(name: string | null): string {
  if (!name) return "R";
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("") || "R";
}

function asScoreValue(score: number): ScoreValue {
  if (score <= 1) return 1;
  if (score >= 5) return 5;
  return Math.round(score) as ScoreValue;
}

function getScoreText(record: Record<number, string>, score: ScoreValue): string {
  return record[score] ?? "";
}

function localizeValue(
  locale: ReportLocale,
  group: keyof typeof LOCALE_VALUE_LABELS.en,
  value: string | null
): string | null {
  if (!value) return null;
  const localeMap = LOCALE_VALUE_LABELS as Record<
    ReportLocale,
    Record<string, Record<string, string>>
  >;
  const labelSet = localeMap[locale][group];
  return labelSet[value] ?? value.replaceAll("_", " ");
}

function renderRows(report: ReportV2Payload["prioritySummary"], copy: ReportV2Copy): string {
  return report
    .map((row) => {
      const parameter = copy.parameters[row.key];
      return `<tr>
  <td>${escapeHtml(parameter.label)}</td>
  <td class="target-col">${escapeHtml(row.targetLabel)}</td>
  <td>${escapeHtml(parameter.whyItMatters)}</td>
  <td>${escapeHtml(parameter.riderValidationCue)}</td>
  <td><span class="status-badge ${row.status}">${escapeHtml(getStatusLabel(row.status, copy))}</span></td>
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
  <td class="target-col">${escapeHtml(row.targetLabel)}</td>
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
      return `<li class="adj-item">
  <div class="adj-number">${step.order}</div>
  <div>
    <div class="adj-title">${escapeHtml(parameter.label)}</div>
    <div class="adj-target">${escapeHtml(step.targetLabel)}</div>
    <div class="adj-note">${escapeHtml(parameter.measurementReference)} — ${escapeHtml(parameter.sequenceNote)}</div>
  </div>
</li>`;
    })
    .join("\n");
}

function renderTirePressure(report: ReportV2Payload["tirePressure"], copy: ReportV2Copy): string {
  if (report.status === "ready") {
    const pressureScaleMax = Math.max(120, Math.ceil(Math.max(report.frontPsi, report.rearPsi) / 10) * 10);
    const frontWidth = Math.max(0, Math.min(100, (report.frontPsi / pressureScaleMax) * 100));
    const rearWidth = Math.max(0, Math.min(100, (report.rearPsi / pressureScaleMax) * 100));
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

    return `<div class="tp-panel">
  <div class="tp-readings">
    <div class="tp-reading-tile">
      <div class="tp-pos">${escapeHtml(copy.tirePressure.front)}</div>
      <div class="tp-psi">${Math.round(report.frontPsi)} psi</div>
      <div class="tp-visual-track"><div class="tp-visual-fill" style="width:${frontWidth.toFixed(1)}%"></div></div>
      <div class="tp-bar">${report.frontBar.toFixed(1)} bar</div>
    </div>
    <div class="tp-reading-tile">
      <div class="tp-pos">${escapeHtml(copy.tirePressure.rear)}</div>
      <div class="tp-psi">${Math.round(report.rearPsi)} psi</div>
      <div class="tp-visual-track"><div class="tp-visual-fill" style="width:${rearWidth.toFixed(1)}%"></div></div>
      <div class="tp-bar">${report.rearBar.toFixed(1)} bar</div>
    </div>
  </div>
  <p class="section-intro"><strong>${escapeHtml(copy.tirePressure.confidence)}:</strong> ${
      report.confidence ? `${report.confidence}%` : "n/a"
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

  return `<div class="callout-panel warning">
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

function renderHeader(report: ReportV2Payload, copy: ReportV2Copy): string {
  return `<header class="report-header">
  <div class="brand-lockup">
    <img class="brand-mark" src="${escapeHtml(
      `${BRAND.siteUrl}/logo/bestbikefit4u_mark.png`
    )}" alt="${escapeHtml(copy.shell.brandAlt)}" />
    <div>
      <p class="brand-name">${escapeHtml(BRAND.name)}</p>
      <h1 class="report-title">${escapeHtml(copy.introTitle)}</h1>
      <p class="muted">${escapeHtml(copy.shell.coverSupport)}</p>
    </div>
  </div>
  <div class="report-date">
    <p><strong>${escapeHtml(copy.shell.dateLabel)}:</strong> ${escapeHtml(
      formatReportDate(copy.locale, report.reportDate)
    )}</p>
  </div>
</header>`;
}

function renderAboutSection(copy: ReportV2Copy): string {
  return `<section class="report-cover report-section">
  <div class="about-grid">
    <div class="callout-panel">
      <h2 class="section-title">${escapeHtml(copy.sections.about)}</h2>
      <p>${escapeHtml(copy.introBody)}</p>
      <p class="muted">${escapeHtml(copy.shell.aboutBody)}</p>
    </div>
    <div class="content-tile">
      <h3>${escapeHtml(copy.shell.aboutTitle)}</h3>
      <ul class="about-bullets">
        ${copy.shell.aboutBullets
          .map((item) => `<li>${escapeHtml(item)}</li>`)
          .join("\n")}
      </ul>
    </div>
  </div>
</section>`;
}

function renderMeasurementTile(label: string, value: number, unit: string): string {
  return `<div class="measurement-tile">
  <div class="tile-label">${escapeHtml(label)}</div>
  <div class="tile-value">${escapeHtml(String(value))} <span class="tile-unit">${escapeHtml(unit)}</span></div>
</div>`;
}

function renderRiderSection(rider: ReportRiderSection, copy: ReportV2Copy): string {
  const measurements = [
    rider.heightCm !== null ? renderMeasurementTile(copy.rider.height, rider.heightCm, "cm") : null,
    rider.weightKg !== null ? renderMeasurementTile(copy.rider.weight, rider.weightKg, "kg") : null,
    rider.inseamCm !== null ? renderMeasurementTile(copy.rider.inseam, rider.inseamCm, "cm") : null,
    rider.armLengthCm !== null ? renderMeasurementTile(copy.rider.armLength, rider.armLengthCm, "cm") : null,
    rider.torsoLengthCm !== null ? renderMeasurementTile(copy.rider.torsoLength, rider.torsoLengthCm, "cm") : null,
    rider.shoulderWidthCm !== null
      ? renderMeasurementTile(copy.rider.shoulderWidth, rider.shoulderWidthCm, "cm")
      : null,
  ]
    .filter(Boolean)
    .join("\n");

  const bmiPercent =
    rider.bmi === null
      ? null
      : Math.max(0, Math.min(100, ((rider.bmi - 15) / (40 - 15)) * 100));

  const bmiHtml =
    rider.bmi !== null && bmiPercent !== null && rider.bmiCategory
      ? `<div class="bmi-panel">
  <div class="bmi-header">
    <span class="tile-label">${escapeHtml(copy.rider.bmi)}</span>
    <span class="muted">${escapeHtml(copy.rider.bmiCategories[rider.bmiCategory])}</span>
  </div>
  <div class="bmi-track">
    <div class="bmi-marker" style="left:${bmiPercent.toFixed(1)}%"></div>
  </div>
  <div class="bmi-row">
    <span class="bmi-value">${escapeHtml(rider.bmi.toFixed(1))}</span>
    <span class="bmi-badge ${escapeHtml(rider.bmiCategory)}">${escapeHtml(
          copy.rider.bmiCategories[rider.bmiCategory]
        )}</span>
  </div>
</div>`
      : "";

  return renderSection(
    copy.sections.rider,
    `<div class="rider-summary">
  ${
    rider.imageUrl
      ? `<img class="rider-avatar" src="${escapeHtml(rider.imageUrl)}" alt="${escapeHtml(rider.name ?? copy.rider.anonymousRider)}" style="object-fit:cover;" />`
      : `<div class="rider-avatar">${escapeHtml(getInitials(rider.name ?? copy.rider.anonymousRider))}</div>`
  }
  <div>
    <div class="rider-name">${escapeHtml(rider.name ?? copy.rider.anonymousRider)}</div>
    <div class="muted">${escapeHtml(copy.rider.subtitle)}</div>
  </div>
</div>
${measurements ? `<div class="measurements-grid">${measurements}</div>` : ""}
${bmiHtml}`
  );
}

function renderProgressBar(score: ScoreValue): string {
  return `<div class="progress-track">
  <div class="progress-fill" style="width:${(score / 5) * 100}%;background:${SCORE_COLORS[score]}"></div>
</div>`;
}

function renderSegmentBar(score: ScoreValue): string {
  return `<div class="segment-bar">${([1, 2, 3, 4, 5] as ScoreValue[])
    .map(
      (index) =>
        `<div class="segment" style="background:${index <= score ? SCORE_COLORS[score] : "#e2e8f0"}"></div>`
    )
    .join("")}</div>`;
}

function renderFlexibilitySection(rider: ReportRiderSection, copy: ReportV2Copy): string {
  if (rider.flexibilityScore === null) return "";
  const score = asScoreValue(rider.flexibilityScore);

  return renderSection(
    copy.sections.flexibility,
    `<div class="score-section">
  <div class="score-header">
    <span class="score-label">${escapeHtml(getScoreText(copy.scoreMeta.flexibility.labels, score))}</span>
    <span class="score-badge">${score}/5</span>
  </div>
  ${renderProgressBar(score)}
  <p class="score-description">${escapeHtml(
    getScoreText(copy.scoreMeta.flexibility.descriptions, score)
  )}</p>
</div>`
  );
}

function renderCoreSection(rider: ReportRiderSection, copy: ReportV2Copy): string {
  if (rider.coreStabilityScore === null) return "";
  const score = asScoreValue(rider.coreStabilityScore);

  return renderSection(
    copy.sections.coreStability,
    `<div class="score-section">
  <div class="score-header">
    <span class="score-label">${escapeHtml(getScoreText(copy.scoreMeta.coreStability.labels, score))}</span>
    <span class="score-badge">${score}/5</span>
  </div>
  ${renderSegmentBar(score)}
  <p class="score-description">${escapeHtml(
    getScoreText(copy.scoreMeta.coreStability.descriptions, score)
  )}</p>
</div>`
  );
}

function renderComfortSection(rider: ReportRiderSection, copy: ReportV2Copy): string {
  if (rider.comfortScore === null) return "";
  const score = asScoreValue(rider.comfortScore);

  return renderSection(
    copy.sections.comfort,
    `<div class="score-section">
  <div class="score-header">
    <span class="score-label">${escapeHtml(getScoreText(copy.scoreMeta.comfort.labels, score))}</span>
    <span class="score-badge">${score}/5</span>
  </div>
  ${renderSegmentBar(score)}
  <p class="score-description">${escapeHtml(getScoreText(copy.scoreMeta.comfort.descriptions, score))}</p>
</div>
<p class="section-intro" style="margin-top:10px">${escapeHtml(copy.scoreMeta.comfort.impactText)}</p>`
  );
}

function renderMetaTile(label: string, value: string): string {
  return `<div class="bike-meta-tile">
  <div class="tile-label">${escapeHtml(label)}</div>
  <div class="tile-value">${escapeHtml(value)}</div>
</div>`;
}

function renderBikeSection(report: ReportV2Payload, copy: ReportV2Copy): string {
  const bike = report.bike;
  const bikeTiles = [
    bike.bikeType
      ? renderMetaTile(
          copy.bike.bikeType,
          localizeValue(copy.locale, "bikeType", bike.bikeType) ?? bike.bikeType
        )
      : null,
    bike.brand ? renderMetaTile(copy.bike.brand, bike.brand) : null,
    bike.model ? renderMetaTile(copy.bike.model, bike.model) : null,
    bike.ridingStyle
      ? renderMetaTile(
          copy.bike.ridingStyle,
          localizeValue(copy.locale, "ridingStyle", bike.ridingStyle) ?? bike.ridingStyle
        )
      : null,
    bike.goal
      ? renderMetaTile(copy.bike.goal, localizeValue(copy.locale, "goal", bike.goal) ?? bike.goal)
      : null,
  ]
    .filter(Boolean)
    .join("\n");

  const contextRows = [
    bike.questionnaire.experienceLevel
      ? `<div class="context-row"><span class="context-label">${escapeHtml(copy.bike.experienceLevel)}</span><span class="context-value">${escapeHtml(localizeValue(copy.locale, "experienceLevel", bike.questionnaire.experienceLevel) ?? bike.questionnaire.experienceLevel)}</span></div>`
      : null,
    bike.questionnaire.weeklyHours
      ? `<div class="context-row"><span class="context-label">${escapeHtml(copy.bike.weeklyHours)}</span><span class="context-value">${escapeHtml(localizeValue(copy.locale, "weeklyHours", bike.questionnaire.weeklyHours) ?? bike.questionnaire.weeklyHours)}</span></div>`
      : null,
    bike.questionnaire.rideLength
      ? `<div class="context-row"><span class="context-label">${escapeHtml(copy.bike.rideLength)}</span><span class="context-value">${escapeHtml(localizeValue(copy.locale, "rideLength", bike.questionnaire.rideLength) ?? bike.questionnaire.rideLength)}</span></div>`
      : null,
    bike.questionnaire.positionPriority
      ? `<div class="context-row"><span class="context-label">${escapeHtml(copy.bike.positionPriority)}</span><span class="context-value">${escapeHtml(localizeValue(copy.locale, "positionPriority", bike.questionnaire.positionPriority) ?? bike.questionnaire.positionPriority)}</span></div>`
      : null,
    bike.questionnaire.typeOfRiding
      ? `<div class="context-row"><span class="context-label">${escapeHtml(copy.bike.typeOfRiding)}</span><span class="context-value">${escapeHtml(localizeValue(copy.locale, "typeOfRiding", bike.questionnaire.typeOfRiding) ?? bike.questionnaire.typeOfRiding)}</span></div>`
      : null,
  ]
    .filter(Boolean)
    .join("\n");

  const reportTiles = [
    renderMetaTile(copy.bike.reportConfidence, `${report.profile.globalConfidence}%`),
    renderMetaTile(copy.bike.algorithmVersion, report.profile.algorithmVersion),
    renderMetaTile(copy.bike.engineVersion, report.profile.engineVersion),
    renderMetaTile(
      copy.bike.dataQuality,
      report.profile.dataQualityStatus === "complete"
        ? copy.dataQuality.complete
        : copy.dataQuality.partial
    ),
  ].join("\n");

  return renderSection(
    copy.sections.yourBike,
    `<div class="bike-hero">
  <div>
    <div class="bike-heading">${escapeHtml(bike.name)}</div>
    <div class="bike-photo-wrap">
      ${
        bike.imageUrl
          ? `<img src="${escapeHtml(bike.imageUrl)}" alt="${escapeHtml(bike.name)}" />`
          : `<div class="bike-photo-placeholder">🚲</div>`
      }
    </div>
  </div>
  <div>
    ${bikeTiles ? `<div class="bike-meta-grid">${bikeTiles}</div>` : ""}
    ${contextRows ? `<div class="bike-context">${contextRows}</div>` : ""}
    <div class="report-meta-grid">${reportTiles}</div>
  </div>
</div>
${
  bike.description
    ? `<div class="bike-description">${escapeHtml(bike.description)}</div>`
    : `<div class="bike-description muted">${escapeHtml(copy.bike.descriptionFallback)}</div>`
}
${
  report.profile.missingData.length
    ? `<div class="callout-panel warning" style="margin-top:12px"><p>${escapeHtml(copy.dataQuality.banner)}</p>${report.profile.missingData
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
}`
  );
}

export function renderPdfReportHtml(params: {
  report: ReportV2Payload;
  copy: ReportV2Copy;
}): string {
  const { report, copy } = params;

  return `<!doctype html>
<html lang="${escapeHtml(copy.locale)}">
<head>
  <meta charset="utf-8" />
  <title>${escapeHtml(copy.introTitle)}</title>
  <style>
    ${renderDocumentStyles()}
  </style>
</head>
<body>
  <main class="report-shell">
    ${renderHeader(report, copy)}
    ${renderAboutSection(copy)}
    ${renderRiderSection(report.rider, copy)}
    ${renderFlexibilitySection(report.rider, copy)}
    ${renderCoreSection(report.rider, copy)}
    ${renderComfortSection(report.rider, copy)}
    ${renderBikeSection(report, copy)}
    ${renderSection(
      copy.sections.prioritySummary,
      `<table>
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
    </table>`
    )}
    ${renderSection(
      copy.sections.detailedFit,
      `<table>
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
    </table>`
    )}
    ${renderSection(
      copy.sections.adjustmentSequence,
      `<p class="section-intro">${escapeHtml(copy.adjustmentGuideline)}</p>
    <ul class="adj-list">${renderAdjustmentSteps(report.adjustmentSequence, copy)}</ul>`
    )}
    ${renderSection(copy.sections.tirePressure, renderTirePressure(report.tirePressure, copy))}
    ${renderSection(
      copy.sections.validationPlan,
      `<table>
      <thead>
        <tr>
          <th>${escapeHtml(copy.validationPlan.dayBlock)}</th>
          <th>${escapeHtml(copy.validationPlan.change)}</th>
          <th>${escapeHtml(copy.validationPlan.rideDuration)}</th>
          <th>${escapeHtml(copy.validationPlan.whatToScore)}</th>
        </tr>
      </thead>
      <tbody>${renderValidationPlan(copy)}</tbody>
    </table>`
    )}
    ${
      report.fitNotes.length
        ? renderSection(
            copy.sections.fitNotes,
            `<div class="fit-notes-box"><ul>${report.fitNotes
              .map((note) => `<li>${escapeHtml(note)}</li>`)
              .join("\n")}</ul></div>`
          )
        : ""
    }
  </main>
</body>
</html>`;
}
