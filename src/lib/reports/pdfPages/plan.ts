import { localizePdfEngineNotes } from "../pdfEngineNotes";
import { PDF_PLAN_COPY, type ReportV2Copy } from "../reportV2Copy";
import { escapeHtml, type PdfReportAssets } from "../pdfShared";
import type { ReportV2Payload } from "../reportV2Types";

export const planStyles = `
.pdf-plan { padding-top: 24px; }
.pdf-plan h2, .pdf-plan h3 { margin: 0; font-family: 'Bricolage Grotesque', sans-serif; }
.pdf-plan-title { font-size: 40px; line-height: 1.05; font-weight: 800; letter-spacing: -0.03em; }
.pdf-plan-intro { margin: 8px 0 0; max-width: 590px; font-size: 15px; line-height: 1.5; color: var(--bbf-tekst); }
.pdf-plan-days { margin-top: 16px; display: grid; grid-template-columns: repeat(14, minmax(0, 1fr)); gap: 3px; }
.pdf-plan-day { height: 30px; display: flex; align-items: center; justify-content: center; border-radius: 6px; }
.pdf-plan-day { font: 12px 'DM Mono', monospace; border: 1px solid var(--bbf-petrol); }
.pdf-plan-phase-0 { background: var(--bbf-lime); border-color: var(--bbf-lime); }
.pdf-plan-phase-1 { background: var(--bbf-petrol-zacht); border-color: var(--bbf-gedempt); }
.pdf-plan-phase-2 { background: var(--bbf-wit); }
.pdf-plan-phases { margin-top: 10px; display: grid; grid-template-columns: 3fr 4fr 7fr; gap: 10px; }
.pdf-plan-phase { min-width: 0; padding: 14px; border-radius: 16px; border-width: 1px; border-style: solid; }
.pdf-plan-phase-2.pdf-plan-phase { border-style: dashed; }
.pdf-plan-phase-label { font-size: 12px; font-weight: 700; }
.pdf-plan-number { font-family: 'DM Mono', monospace; font-weight: 500; }
.pdf-plan-phase h3 { margin-top: 6px; font-size: 18px; line-height: 1.15; font-weight: 700; overflow-wrap: anywhere; }
.pdf-plan-phase p { margin: 6px 0 0; font-size: 12px; line-height: 1.45; overflow-wrap: anywhere; }
.pdf-plan-phase .pdf-plan-target { font-family: 'DM Mono', monospace; font-size: 14px; font-weight: 500; }
.pdf-plan-section { margin-top: 18px; }
.pdf-plan-section h2 { font-size: 22px; line-height: 1.15; font-weight: 800; letter-spacing: -0.02em; }
.pdf-plan-table-frame { margin-top: 10px; border: 1px solid var(--bbf-rand); border-radius: 16px; overflow: hidden; }
.pdf-plan-table { width: 100%; table-layout: fixed; border-collapse: collapse; font-size: 13px; line-height: 1.35; }
.pdf-plan-table th { padding: 8px 14px; background: var(--bbf-papier); font-size: 12px; text-align: left; }
.pdf-plan-table td { padding: 9px 14px; border-top: 1px solid var(--bbf-rand); vertical-align: middle; }
.pdf-plan-table td:first-child { font-weight: 700; }
.pdf-plan-table .pdf-plan-arrow { width: 28px; padding-left: 0; padding-right: 0; color: var(--bbf-petrol); }
.pdf-plan-caution { margin: 8px 0 0; font-size: 12px; line-height: 1.45; color: var(--bbf-gedempt); }
.pdf-plan-log-heading { display: flex; justify-content: space-between; align-items: baseline; gap: 16px; }
.pdf-plan-log-hint { font-size: 12px; color: var(--bbf-gedempt); }
.pdf-plan-log-frame { margin-top: 8px; border: 1px solid var(--bbf-gedempt); border-radius: 12px; overflow: hidden; }
.pdf-plan-log { width: 100%; table-layout: fixed; border-collapse: collapse; font-size: 12px; }
.pdf-plan-log th { padding: 8px 10px; text-align: left; background: var(--bbf-papier); color: var(--bbf-tekst); }
.pdf-plan-log th, .pdf-plan-log td { border-left: 1px solid var(--bbf-rand); }
.pdf-plan-log th:first-child, .pdf-plan-log td:first-child { border-left: 0; }
.pdf-plan-log td { height: 29px; padding: 4px 10px; border-top: 1px solid var(--bbf-rand); }
.pdf-plan-log td:first-child { font-family: 'DM Mono', monospace; }
.pdf-plan-notes { margin-top: 14px; padding: 12px 16px; border-radius: 12px; background: var(--bbf-papier); }
.pdf-plan-notes h3 { font-size: 15px; line-height: 1.2; }
.pdf-plan-notes ul { margin: 5px 0 0; padding-left: 16px; }
.pdf-plan-notes li { margin: 2px 0 0; font-size: 11px; line-height: 1.35; overflow-wrap: anywhere; }
.pdf-plan-notes p { margin: 5px 0 0; font-size: 11px; line-height: 1.35; font-weight: 700; }
.pdf-plan:has([data-notes-compact="true"]) .pdf-plan-log td { height: 19px; padding: 2px 10px; }
.pdf-plan:has([data-notes-compact="true"]) .pdf-plan-section { margin-top: 12px; }
.pdf-plan:has([data-notes-compact="true"]) .pdf-plan-notes { margin-top: 8px; padding: 8px 12px; }
`;

/** Educational timeline; personalized changes come only from the ordered adjustment sequence. */
export function renderPlanPage(report: ReportV2Payload, copy: ReportV2Copy, _assets: PdfReportAssets): string {
  const text = PDF_PLAN_COPY[copy.locale === "nl" ? "nl" : "en"];
  const steps = report.adjustmentSequence
    .filter(
      (step) =>
        step.targetLabel.trim() &&
        step.targetLabel !== "n/a" &&
        report.detailedFit.find((row) => row.key === step.key)?.status !== "pending_data",
    )
    .sort((a, b) => a.order - b.order)
    .slice(0, 3);
  const days = Array.from({ length: 14 }, (_, index) => {
    const day = index + 1;
    const phase = day <= 3 ? 0 : day <= 7 ? 1 : 2;
    return `<span class="pdf-plan-day pdf-plan-phase-${phase}">${day}</span>`;
  }).join("");
  const phases = text.phases
    .map((phase, index) => {
      const step = steps[index];
      const title = step ? copy.parameters[step.key].label : phase.title;
      return `<article class="pdf-plan-phase pdf-plan-phase-${index}" data-personalized="${Boolean(step)}">
      <div class="pdf-plan-phase-label">${escapeHtml(text.day)}
        <span class="pdf-plan-number">${escapeHtml(phase.range)}</span></div>
      <h3>${escapeHtml(title)}</h3>
      ${step ? `<p class="pdf-plan-target">${escapeHtml(step.targetLabel)}</p>` : ""}
      <p>${escapeHtml(phase.body)}</p>
    </article>`;
    })
    .join("");
  const sourceNotes = localizePdfEngineNotes(report.fitNotes, copy.locale);
  const noteLimit = 150;
  const notes = sourceNotes.slice(0, 2).map((note) => {
    const characters = Array.from(note);
    return characters.length > noteLimit ? `${characters.slice(0, noteLimit).join("")}…` : note;
  });
  const notesCompact = notes.length > 1 || notes.join("").length > 80;
  const notesOverflow =
    sourceNotes.length > notes.length || sourceNotes.slice(0, 2).some((note) => Array.from(note).length > noteLimit);
  const arrow =
    '<svg width="20" height="12" viewBox="0 0 20 12" fill="none" aria-hidden="true">' +
    '<path d="M1 6h16M12 1l5 5-5 5" stroke="currentColor" stroke-width="2" ' +
    'stroke-linecap="round" stroke-linejoin="round"/></svg>';
  return `<div class="pdf-plan">
    <h2 class="pdf-plan-title">${escapeHtml(text.title)}</h2>
    <p class="pdf-plan-intro">${escapeHtml(text.intro)}</p>
    <div class="pdf-plan-days" aria-hidden="true">${days}</div>
    <div class="pdf-plan-phases">${phases}</div>
    <section class="pdf-plan-section">
      <h2>${escapeHtml(text.feelTitle)}</h2>
      <div class="pdf-plan-table-frame">
        <table class="pdf-plan-table" aria-label="${escapeHtml(text.feelCaption)}">
          <colgroup><col style="width:44%"><col style="width:28px"><col></colgroup>
          <thead><tr><th scope="col">${escapeHtml(text.feel)}</th>
            <th class="pdf-plan-arrow"></th><th scope="col">${escapeHtml(text.try)}</th></tr></thead>
          <tbody>${text.symptoms
            .map(
              (row) => `<tr><td>${escapeHtml(row.feeling)}</td>
            <td class="pdf-plan-arrow">${arrow}</td><td>${escapeHtml(row.action)}</td></tr>`,
            )
            .join("")}</tbody>
        </table>
      </div>
      <p class="pdf-plan-caution">${escapeHtml(text.caution)}</p>
    </section>
    <section class="pdf-plan-section">
      <div class="pdf-plan-log-heading"><h2>${escapeHtml(text.logTitle)}</h2>
        <span class="pdf-plan-log-hint">${escapeHtml(text.logHint)}</span></div>
      <div class="pdf-plan-log-frame">
        <table class="pdf-plan-log" aria-label="${escapeHtml(text.logCaption)}">
          <colgroup><col style="width:9%"><col style="width:27%"><col style="width:10%">
            <col style="width:18%"><col style="width:36%"></colgroup>
          <thead><tr>${[text.day, text.change, text.distance, text.pain, text.comment]
            .map((label) => `<th scope="col">${escapeHtml(label)}</th>`)
            .join("")}</tr></thead>
          <tbody>${[1, 3, 4, 6, 8, 11, 14]
            .map((day) => `<tr><td>${day}</td><td></td><td></td><td></td><td></td></tr>`)
            .join("")}</tbody>
        </table>
      </div>
    </section>
    ${
      notes.length
        ? `<section class="pdf-plan-notes" data-notes-overflow="${notesOverflow}" data-notes-compact="${notesCompact}">
      <h3>${escapeHtml(text.notesTitle)}</h3><ul>${notes.map((note) => `<li>${escapeHtml(note)}</li>`).join("")}</ul>
      ${notesOverflow ? `<p>${escapeHtml(text.moreNotes)}</p>` : ""}
    </section>`
        : ""
    }
  </div>`;
}
