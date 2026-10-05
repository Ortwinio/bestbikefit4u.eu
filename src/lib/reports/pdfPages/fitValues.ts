import { PDF_FIT_VALUES_COPY, type ReportV2Copy } from "../reportV2Copy";
import type { ReportDetailedRow, ReportV2Payload } from "../reportV2Types";
import { escapeHtml, type PdfReportAssets } from "../pdfShared";

const LETTERS: Partial<Record<ReportDetailedRow["key"], string>> = {
  saddleHeight: "A",
  saddleSetback: "B",
  handlebarDrop: "C",
  handlebarReach: "D",
};
const NUMBER = "[+-]?\\d+(?:[.,]\\d+)?";
const MILLIMETRES = new RegExp(`^\\s*(${NUMBER})\\s*mm(?:\\s*@.*)?$`);
const ANGLE = new RegExp(`@\\s*(${NUMBER})\\s*(?:°|deg(?:rees)?)\\s*$`, "i");
const number = (value: string) => Number(value.replace(",", "."));

function rangeBar(row: ReportDetailedRow, locale: string): string {
  const range = row.reliability95;
  if (row.status === "pending_data" || !range) return "";
  const { lower: low, upper: high, value, scaleMin: min, scaleMax: max } = range;
  if (![low, high, value, min, max].every(Number.isFinite) || high <= low || max <= min) return "";
  const percent = (n: number) => (((n - min) / (max - min)) * 100).toFixed(2);
  const fmt = new Intl.NumberFormat(locale, { maximumFractionDigits: 1 });
  const label = `${fmt.format(low)}–${fmt.format(high)} mm (95%)`;
  return `<div class="pdf-fit-range" aria-label="${escapeHtml(label)}">
    <div class="pdf-fit-track"></div>
    <div class="pdf-fit-zone" style="left:${percent(low)}%;
      width:${(((high - low) / (max - min)) * 100).toFixed(2)}%"></div>
    ${range.kind === "size" ? range.options
      .filter((option) => option >= min && option <= max)
      .map((option) => `<i class="pdf-fit-size" style="left:${percent(option)}%"></i>`).join("") : ""}
    <div class="pdf-fit-mark" style="left:${percent(value)}%"></div>
    <span class="pdf-fit-low" style="left:${percent(low)}%">${fmt.format(low)}</span>
    <span class="pdf-fit-high" style="left:${percent(high)}%">${fmt.format(high)}</span>
  </div>`;
}

function targetValue(row: ReportDetailedRow, copy: ReportV2Copy): string {
  if (row.status === "pending_data" || !row.targetLabel || row.targetLabel === "n/a") {
    return `<span class="pdf-fit-pending">${escapeHtml(copy.status.pendingData)}</span>`;
  }
  const target = row.targetLabel.match(MILLIMETRES);
  if (!target) return `<span class="pdf-fit-target-text">${escapeHtml(row.targetLabel)}</span>`;
  const formatted = new Intl.NumberFormat(copy.locale, { maximumFractionDigits: 2 }).format(
    number(target[1]),
  );
  return `${formatted}<span class="pdf-fit-unit"> mm</span>`;
}

function stemCard(report: ReportV2Payload, copy: ReportV2Copy): string {
  const text = PDF_FIT_VALUES_COPY[copy.locale === "nl" ? "nl" : "en"];
  const stem = report.detailedFit.find((row) => row.key === "stem" && row.status !== "pending_data");
  const match = stem?.targetLabel.replace(/−/g, "-").match(ANGLE);
  if (!match) return "";
  const angle = number(match[1]);
  if (!Number.isFinite(angle)) return "";
  const display = new Intl.NumberFormat(copy.locale, { maximumFractionDigits: 2 }).format(angle);
  const radians = (angle * Math.PI) / 180;
  const x = (14 + 72 * Math.cos(radians)).toFixed(2);
  const y = (60 - 72 * Math.sin(radians)).toFixed(2);
  return `<section class="pdf-fit-stem">
    <svg width="86" height="86" viewBox="0 0 96 96" role="img" aria-label="${escapeHtml(text.stemDrawing)}">
      <line x1="10" y1="60" x2="88" y2="60" class="pdf-fit-stem-baseline"/>
      <line x1="14" y1="60" x2="${x}" y2="${y}" class="pdf-fit-stem-line"/>
      <circle cx="14" cy="60" r="9" class="pdf-fit-stem-pivot"/>
    </svg>
    <div><h3>${escapeHtml(text.stemAngle)}</h3><div class="pdf-fit-angle">${display}°</div>
    <p>${escapeHtml(text.stemNote)}</p></div>
  </section>`;
}

function frameCard(report: ReportV2Payload, copy: ReportV2Copy, assets: PdfReportAssets): string {
  const text = PDF_FIT_VALUES_COPY[copy.locale === "nl" ? "nl" : "en"];
  const frame = report.frameTargets;
  const values: Array<[string, number | null]> = [
    [text.stack, frame.stackMm],
    [text.reach, frame.reachMm],
    [text.topTube, frame.effectiveTopTubeMm],
  ];
  const available = values.filter(
    (entry): entry is [string, number] =>
      typeof entry[1] === "number" && Number.isFinite(entry[1]) && entry[1] > 0,
  );
  if (!frame.recommendedFrameLabel && available.length === 0) return "";
  const fmt = new Intl.NumberFormat(copy.locale, { maximumFractionDigits: 1 });
  return `<section class="pdf-fit-frame">
    <img src="${escapeHtml(assets.stackReach)}" alt="${escapeHtml(text.frameDrawing)}"/>
    <div>
    <h3>${escapeHtml(text.frame)}</h3>
    ${frame.recommendedFrameLabel
      ? `<div class="pdf-fit-frame-size">${escapeHtml(frame.recommendedFrameLabel)}</div>` : ""}
    <p>${available.map(([label, value]) => `${escapeHtml(label)} ${fmt.format(value)} mm`).join(" · ")}</p>
    <p>${escapeHtml(text.frameNote)}</p>
  </div></section>`;
}

export function renderFitValuesPage(
  report: ReportV2Payload,
  copy: ReportV2Copy,
  assets: PdfReportAssets,
): string {
  const text = PDF_FIT_VALUES_COPY[copy.locale === "nl" ? "nl" : "en"];
  const rows = report.detailedFit
    .filter((row) => row.status !== "pending_data" && row.targetLabel && row.targetLabel !== "n/a")
    .map((row) => {
      const letter = LETTERS[row.key];
      return `<div role="row" class="pdf-fit-row">
      <div role="cell"><div class="pdf-fit-name">
        ${letter ? `<span class="pdf-fit-letter">${letter}</span>` : ""}
        <span>${escapeHtml(copy.parameters[row.key].label)}</span></div>
        <p class="pdf-fit-why">${escapeHtml(text.why[row.key])}</p></div>
      <div role="cell">${rangeBar(row, copy.locale)}</div>
      <div role="cell" class="pdf-fit-target">${targetValue(row, copy)}${row.reliability95
        ? `<small class="pdf-fit-uncertainty">± ${row.reliability95.halfWidth} mm</small>` : ""}</div>
      <div role="cell" class="pdf-fit-now" aria-label="${escapeHtml(text.fillIn)}"></div>
    </div>`;
    })
    .join("");
  return `<div class="pdf-fit-values">
    <h2>${escapeHtml(text.title)}</h2><p class="pdf-fit-intro">${escapeHtml(text.intro)}</p>
    <div class="pdf-fit-legend"><span><i class="pdf-fit-key-range"></i>${escapeHtml(text.margin)}</span>
      <span><i class="pdf-fit-key-target"></i>${escapeHtml(text.target)}</span>
      <span><b class="pdf-fit-letter">A</b>${escapeHtml(text.drawing)}</span></div>
    ${
      rows
        ? `<div role="table" aria-label="${escapeHtml(text.title)}" class="pdf-fit-table">
      <div role="row" class="pdf-fit-columns">
        <span role="columnheader">${escapeHtml(text.component)}</span>
        <span role="columnheader">${escapeHtml(text.margin)}</span>
        <span role="columnheader">${escapeHtml(text.target)}</span>
        <span role="columnheader">${escapeHtml(text.now)}</span>
      </div>${rows}</div>`
        : `<p class="pdf-fit-empty">${escapeHtml(text.unavailable)}</p>`
    }
    <div class="pdf-fit-extras">${stemCard(report, copy)}${frameCard(report, copy, assets)}</div>
  </div>`;
}

export const fitValuesStyles = `
.pdf-fit-values{padding-top:24px;color:var(--bbf-inkt)}
.pdf-fit-values h2{margin:0;font-family:'Bricolage Grotesque',sans-serif;font-size:40px;line-height:1.05;
 letter-spacing:-.03em}
.pdf-fit-intro{margin:8px 0 0;max-width:600px;font-size:15px;line-height:1.5;color:var(--bbf-tekst)}
.pdf-fit-legend{margin-top:14px;display:flex;gap:20px;font-size:12px;color:var(--bbf-tekst)}
.pdf-fit-legend>span{display:flex;align-items:center;gap:8px}
.pdf-fit-key-range{width:28px;height:12px;border-radius:4px;background:var(--bbf-lime);
 border:1.5px solid var(--bbf-inkt)}
.pdf-fit-key-target{width:4px;height:18px;border-radius:2px;background:var(--bbf-inkt)}
.pdf-fit-letter{display:inline-flex;align-items:center;justify-content:center;flex-shrink:0;width:20px;height:20px;
 border-radius:50%;background:var(--bbf-lime);font-size:11px;font-weight:800;color:var(--bbf-inkt)}
.pdf-fit-table{margin-top:12px}
.pdf-fit-row,.pdf-fit-columns{display:grid;grid-template-columns:196px minmax(0,1fr) 84px 72px;gap:16px}
.pdf-fit-columns{padding-bottom:6px;font-size:12px;font-weight:700;color:var(--bbf-tekst)}
.pdf-fit-columns>:nth-child(3){text-align:right}.pdf-fit-columns>:last-child{text-align:center}
.pdf-fit-row{align-items:center;min-height:68px;padding:10px 0;border-top:1px solid var(--bbf-rand);
 box-sizing:border-box}
.pdf-fit-name{display:flex;align-items:center;gap:8px;font-size:16px;font-weight:700}
.pdf-fit-why{margin:3px 0 0;font-size:12px;line-height:1.3;color:var(--bbf-gedempt)}
.pdf-fit-target{text-align:right;font-family:'DM Mono',monospace;font-size:22px;white-space:nowrap}
.pdf-fit-uncertainty{display:block;font-size:12px;margin-top:3px}
.pdf-fit-unit{font-size:12px;color:var(--bbf-gedempt)}
.pdf-fit-now{height:36px;border:1px solid var(--bbf-gedempt);border-radius:8px;background:var(--bbf-wit)}
.pdf-fit-pending,.pdf-fit-target-text{font-family:Figtree,sans-serif;font-size:12px;line-height:1.3}
.pdf-fit-range{position:relative;height:44px}.pdf-fit-range-text{font-size:12px;color:var(--bbf-gedempt)}
.pdf-fit-track{position:absolute;inset:16px 0 auto;height:10px;border:1px solid var(--bbf-gedempt);
 border-radius:99px;background:var(--bbf-papier)}
.pdf-fit-zone{position:absolute;top:13px;height:16px;border-radius:5px;background:var(--bbf-lime);
 border:1.5px solid var(--bbf-inkt);box-sizing:border-box}
.pdf-fit-size{position:absolute;top:16px;width:2px;height:10px;background:var(--bbf-gedempt)}
.pdf-fit-mark{position:absolute;top:8px;width:4px;height:26px;margin-left:-2px;border-radius:2px;
 background:var(--bbf-inkt)}
.pdf-fit-low,.pdf-fit-high{position:absolute;top:32px;font-family:'DM Mono',monospace;font-size:11px;
 color:var(--bbf-tekst)}
.pdf-fit-low{transform:translateX(-100%);padding-right:4px}.pdf-fit-high{padding-left:4px}
.pdf-fit-extras{margin-top:16px;display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:16px}
.pdf-fit-stem,.pdf-fit-frame{padding:16px;border-radius:20px;background:var(--bbf-papier)}
.pdf-fit-stem{display:grid;grid-template-columns:86px minmax(0,1fr);align-items:center;gap:12px}
.pdf-fit-extras h3{margin:0;font-family:Figtree,sans-serif;font-size:14px;font-weight:700}
.pdf-fit-extras p{margin:6px 0 0;font-size:12px;line-height:1.4;color:var(--bbf-gedempt)}
.pdf-fit-angle,.pdf-fit-frame-size{margin-top:4px;font-family:'DM Mono',monospace;font-size:30px;line-height:1.1}
.pdf-fit-frame{display:grid;grid-template-columns:92px minmax(0,1fr);align-items:center;gap:12px;
 background:var(--bbf-inkt);color:var(--bbf-wit)}
.pdf-fit-frame img{width:92px;height:78px;object-fit:cover;border-radius:10px}
.pdf-fit-frame h3,.pdf-fit-frame p{color:var(--bbf-op-donker)}
.pdf-fit-frame-size{color:var(--bbf-lime);overflow-wrap:anywhere}
.pdf-fit-stem-baseline{stroke:var(--bbf-gedempt);stroke-width:1.5;stroke-dasharray:4 4}
.pdf-fit-stem-line{stroke:var(--bbf-inkt);stroke-width:10;stroke-linecap:round}
.pdf-fit-stem-pivot{fill:var(--bbf-lime);stroke:var(--bbf-inkt);stroke-width:2}
.pdf-fit-empty{margin-top:28px;font-size:15px;color:var(--bbf-gedempt)}
`;
