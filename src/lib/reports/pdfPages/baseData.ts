import { PDF_BASE_DATA_COPY, type ReportV2Copy } from "../reportV2Copy";
import { escapeHtml, localizePdfValue, type PdfReportAssets } from "../pdfShared";
import type { ReportV2Payload } from "../reportV2Types";

export const baseDataStyles = `
.pdf-base { padding-top: 24px; }
.pdf-base h2, .pdf-base h3 { margin: 0; font-family: 'Bricolage Grotesque', sans-serif; }
.pdf-base h2 { font-size: 40px; line-height: 1.05; font-weight: 800; letter-spacing: -0.03em; }
.pdf-base h3 { font-size: 20px; line-height: 1.15; font-weight: 800; letter-spacing: -0.02em; }
.pdf-base-intro { margin: 8px 0 18px; max-width: 610px; font-size: 15px; line-height: 1.5; color: var(--bbf-tekst); }
.pdf-base-rider { padding: 18px 20px; border-radius: 20px; background: var(--bbf-papier); }
.pdf-base-rider-heading { display: flex; align-items: baseline; justify-content: space-between; gap: 16px; }
.pdf-base-name { max-width: 72%; text-align: right; overflow-wrap: anywhere; font-size: 13px; font-weight: 700; }
.pdf-base-metrics { margin: 12px 0 0; display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 10px; }
.pdf-base-metric { padding: 10px 12px; border-radius: 12px; background: var(--bbf-wit); }
.pdf-base-metric dt { font-size: 12px; color: var(--bbf-gedempt); }
.pdf-base-metric dd { margin: 2px 0 0; font-family: 'DM Mono', monospace; font-size: 22px; line-height: 1.3; }
.pdf-base-unit { font-family: Figtree, sans-serif; font-size: 12px; color: var(--bbf-gedempt); }
.pdf-base-metric .pdf-base-missing { margin-top: 5px; font: 700 12px/1.4 Figtree, sans-serif; }
.pdf-base-extra { border: 1px dashed var(--bbf-gedempt); }
.pdf-base-extra .pdf-base-extra-list { margin-top: 5px; font: 12px/1.45 Figtree, sans-serif; }
.pdf-base-extra-row { display: block; }
.pdf-base-number { font-family: 'DM Mono', monospace; font-weight: 500; }
.pdf-base-scores { margin-top: 14px; display: flex; flex-direction: column; gap: 10px; }
.pdf-base-score { display: grid; grid-template-columns: 128px 142px 1fr; gap: 12px; align-items: center; }
.pdf-base-score-title { font-size: 13px; line-height: 1.35; font-weight: 700; }
.pdf-base-segments { display: grid; grid-template-columns: repeat(5, minmax(0, 1fr)); gap: 3px; }
.pdf-base-segment { height: 12px; border-radius: 3px; border: 1px solid var(--bbf-gedempt); overflow: hidden; }
.pdf-base-segment { background: var(--bbf-wit); }
.pdf-base-segment > span { display: block; height: 100%; background: var(--bbf-petrol); }
.pdf-base-score-copy { font-size: 12px; line-height: 1.4; color: var(--bbf-tekst); }
.pdf-base-score-copy strong { color: var(--bbf-inkt); }
.pdf-base-score-copy p { margin: 2px 0 0; }
.pdf-base-columns { margin-top: 14px; display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 14px; }
.pdf-base-table { padding: 16px 18px; border-radius: 20px; border: 1px solid var(--bbf-rand); }
.pdf-base-table dl { margin: 8px 0 0; }
.pdf-base-row { display: flex; justify-content: space-between; gap: 12px; padding: 8px 0; }
.pdf-base-row { font-size: 13px; line-height: 1.4; }
.pdf-base-row { border-bottom: 1px solid var(--bbf-rand); break-inside: avoid; }
.pdf-base-row:last-child { border-bottom: 0; }
.pdf-base-row dt { flex: 0 1 43%; color: var(--bbf-gedempt); }
.pdf-base-row dd { flex: 1; margin: 0; text-align: right; font-weight: 700; overflow-wrap: anywhere; }
.pdf-base-improve { margin-top: 14px; padding: 16px 20px; border-radius: 20px; background: var(--bbf-lime); }
.pdf-base-improve h3 { font-size: 17px; }
.pdf-base-improve p { margin: 4px 0 0; font-size: 13px; line-height: 1.45; }
.pdf-base-pain { margin-top: 14px; }
.pdf-base-pain h4 { margin: 0; font-size: 13px; font-weight: 700; }
.pdf-base-pain ul { display: flex; flex-wrap: wrap; gap: 6px; padding: 0; margin: 6px 0 0; list-style: none; }
.pdf-base-pain li { padding: 5px 9px; border: 1px solid var(--bbf-rand); border-radius: 999px;
  background: var(--bbf-wit); font-size: 12px; line-height: 1.35; overflow-wrap: anywhere; }
`;

/** Base-data page: payload facts only; unavailable body scores and bike fields are omitted. */
export function renderBaseDataPage(report: ReportV2Payload, copy: ReportV2Copy, _assets: PdfReportAssets): string {
  const locale = copy.locale === "nl" ? "nl" : "en";
  const text = PDF_BASE_DATA_COPY[locale];
  const format = (value: number) => new Intl.NumberFormat(locale, { maximumFractionDigits: 1 }).format(value);
  const measured = (value: number | null) => typeof value === "number" && Number.isFinite(value) && value > 0;
  const metric = (label: string, value: number | null, unit: string) =>
    measured(value)
      ? `
    <div class="pdf-base-metric"><dt>${escapeHtml(label)}</dt>
      <dd>${escapeHtml(format(value!))}<span class="pdf-base-unit"> ${escapeHtml(unit)}</span></dd>
    </div>`
      : "";
  const extras = [
    { label: copy.rider.torsoLength, value: report.rider.torsoLengthCm },
    { label: copy.rider.armLength, value: report.rider.armLengthCm },
    { label: copy.rider.shoulderWidth, value: report.rider.shoulderWidthCm },
  ];
  const enteredExtras = extras.filter((entry) => measured(entry.value));
  const scores = [
    { value: report.rider.flexibilityScore, meta: copy.scoreMeta.flexibility },
    {
      value: report.rider.coreStabilityScore,
      meta: { ...copy.scoreMeta.coreStability, title: text.coreStability },
    },
    { value: report.rider.comfortScore, meta: copy.scoreMeta.comfort },
  ].flatMap(({ value, meta }) => {
    if (value === null || !Number.isFinite(value) || value < 0 || value > 5) return [];
    const label = (meta.labels as Record<number, string>)[value];
    const description = (meta.descriptions as Record<number, string>)[value];
    const segments = Array.from({ length: 5 }, (_, index) => {
      const fill = Math.min(1, Math.max(0, value - index)) * 100;
      return `<span class="pdf-base-segment"><span style="width:${fill}%"></span></span>`;
    }).join("");
    return [
      `<div class="pdf-base-score" data-score="${value}">
      <span class="pdf-base-score-title">${escapeHtml(meta.title)}</span>
      <div class="pdf-base-segments" aria-hidden="true">${segments}</div>
      <div class="pdf-base-score-copy">
        ${label ? `<strong>${escapeHtml(label)}</strong> ` : ""}
        <span class="pdf-base-number">${escapeHtml(format(value))}/5</span>
        ${description ? `<p>${escapeHtml(description)}</p>` : ""}
      </div>
    </div>`,
    ];
  });
  const rows = (entries: Array<[string, string | null | undefined, string?]>) =>
    entries
      .flatMap(([label, value, group]) => {
        if (!value?.trim() || value === "n/a" || value === "unknown") return [];
        return [
          `<div class="pdf-base-row"><dt>${escapeHtml(label)}</dt>
        <dd>${escapeHtml(group ? localizePdfValue(value, copy, group) : value)}</dd></div>`,
        ];
      })
      .join("");
  const bikeRows = rows([
    [text.bike, report.bike.name],
    [copy.bike.bikeType, report.bike.bikeType, "bikeType"],
    [copy.bike.brand, report.bike.brand],
    [copy.bike.model, report.bike.model],
    [text.currentFrameSize, report.bike.currentFrameSize],
  ]);
  const ridingRows = rows([
    [copy.bike.goal, report.bike.goal ?? report.profile.goal, "goal"],
    [copy.bike.ridingStyle, report.bike.ridingStyle ?? report.profile.ridingStyle, "ridingStyle"],
    [copy.bike.experienceLevel, report.bike.questionnaire.experienceLevel, "experienceLevel"],
    [copy.bike.weeklyHours, report.bike.questionnaire.weeklyHours, "weeklyHours"],
    [copy.bike.rideLength, report.bike.questionnaire.rideLength, "rideLength"],
    [copy.bike.positionPriority, report.bike.questionnaire.positionPriority, "positionPriority"],
    [copy.bike.typeOfRiding, report.bike.questionnaire.typeOfRiding, "typeOfRiding"],
  ]);
  const metrics = [
    metric(copy.rider.height, report.rider.heightCm, "cm"),
    metric(copy.rider.inseam, report.rider.inseamCm, "cm"),
    metric(copy.rider.weight, report.rider.weightKg, "kg"),
    enteredExtras.length
      ? `<div class="pdf-base-metric pdf-base-extra">
      <dt>${escapeHtml(text.extraMeasurements)}</dt><dd class="pdf-base-extra-list">
      ${enteredExtras
        .map(
          ({ label, value }) =>
            `<span class="pdf-base-extra-row">${escapeHtml(label)} ` +
            `<span class="pdf-base-number">${escapeHtml(format(value!))}</span> cm</span>`,
        )
        .join("")}
      </dd></div>`
      : "",
  ].join("");
  const painAreas = (report.rider.painAreas ?? [])
    .filter((value) => value.trim())
    .map((value) => {
      const key = value.trim().toLowerCase();
      return text.painAreaLabels[key as keyof typeof text.painAreaLabels] ?? value;
    });
  const pain = painAreas.length
    ? `<div class="pdf-base-pain"><h4>${escapeHtml(text.painAreas)}</h4>
    <ul>${painAreas.map((value) => `<li>${escapeHtml(value)}</li>`).join("")}</ul></div>`
    : "";
  const rider =
    metrics || scores.length || pain
      ? `<section class="pdf-base-rider">
    <div class="pdf-base-rider-heading"><h3>${escapeHtml(text.rider)}</h3>
      ${report.rider.name ? `<span class="pdf-base-name">${escapeHtml(report.rider.name)}</span>` : ""}
    </div>
    ${metrics ? `<dl class="pdf-base-metrics">${metrics}</dl>` : ""}
    ${scores.length ? `<div class="pdf-base-scores">${scores.join("")}</div>` : ""}
    ${pain}
  </section>`
      : "";
  const tables = [
    bikeRows
      ? `<section class="pdf-base-table">
      <h3>${escapeHtml(text.bike)}</h3><dl>${bikeRows}</dl></section>`
      : "",
    ridingRows
      ? `<section class="pdf-base-table">
      <h3>${escapeHtml(text.howYouRide)}</h3><dl>${ridingRows}</dl></section>`
      : "",
  ].join("");
  return `<div class="pdf-base">
    <h2>${escapeHtml(text.title)}</h2>
    <p class="pdf-base-intro">${escapeHtml(text.intro)}</p>
    ${rider}
    ${tables ? `<div class="pdf-base-columns">${tables}</div>` : ""}
    ${
      enteredExtras.length < extras.length
        ? `<section class="pdf-base-improve">
      <h3>${escapeHtml(text.improveTitle)}</h3><p>${escapeHtml(text.improveBody)}</p>
    </section>`
        : ""
    }
  </div>`;
}
