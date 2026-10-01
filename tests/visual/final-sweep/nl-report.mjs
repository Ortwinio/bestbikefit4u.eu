import { writeFile } from "node:fs/promises";
import { resolve, relative } from "node:path";

const escape = (text) => String(text).replaceAll("|", "\\|").replaceAll("\n", " ");

export async function writeDutchReport({ metadata, cases, findings, output, audit }) {
  const report = { metadata, cases: cases.map(({ chunks, ...row }) => ({ ...row, chunkCount: chunks.length })),
    findings };
  await writeFile(resolve(output, "report.json"), JSON.stringify(report, null, 2) + "\n");
  const reportPath = relative(audit, output).split("\\").join("/");
  const label = metadata.label ?? "40a";
  const lines = [`# ${label} — Strict Dutch audit findings`, "", `Cases completed: ${cases.length}; `
    + `route/capture errors: ${cases.filter((row) => row.error).length}; `
    + `unique candidates: ${findings.length}.`, "",
    "English candidates are not all confirmed bugs. Inspect source/citation/user-data and fixture context before editing.",
    "Source line locations use the frozen snapshot; fallback mappings explicitly require confirmation.", "",
    `[Raw report](${reportPath}/report.json) · [all collected text and interaction coverage]`
      + `(${reportPath}/cases.jsonl)`, "", "## Run context", "", "```json",
    JSON.stringify(metadata, null, 2), "```", ""];
  for (const owner of ["A", "B", "C", "D"]) {
    lines.push(`## Owner ${owner}`, "", "| Text / field | Source candidates | Routes / states | Classification |",
      "|---|---|---|---|");
    for (const finding of report.findings.filter((item) => item.owner === owner)) {
      const locations = (finding.locations ?? []).map((item) => `${item.file}:${item.line} (${item.confidence})`);
      for (const item of finding.labelLocations ?? []) {
        locations.push(`${item.file}:${item.line} (label copy, owner ${item.owner})`);
      }
      const occurrences = [...new Set(finding.occurrences.map((item) => `${item.route}: ${item.stage}`))];
      lines.push(`| ${escape(finding.kind)}: ${escape(finding.text)} | ${escape(locations.join("; "))} | `
        + `${escape(occurrences.join("; "))} | ${escape(finding.classification)}; ${finding.confidence} |`);
    }
    lines.push("");
  }
  lines.push("## Coverage gaps", "");
  for (const row of cases) {
    if (row.error) lines.push(`- ${row.route} (${row.width}): ${escape(row.error)}`);
  }
  lines.push("", "Per-case skipped interactions and fixture limitations remain in the raw report.", "");
  await writeFile(resolve(audit, `${label}-nl-findings.md`), lines.join("\n"));
}
