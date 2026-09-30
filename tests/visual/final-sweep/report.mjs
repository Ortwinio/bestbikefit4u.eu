import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { CHECK_NAMES } from "./checks.mjs";

const cell = (value) => String(value ?? "").replace(/\|/g, "\\|").replace(/\r?\n/g, " ");
const mark = (status) => ({ pass: "✓", fail: "✗", skip: "—" })[status] ?? "?";

export function summarize(results) {
  const checks = Object.fromEntries(CHECK_NAMES.map((name) => [name, { pass: 0, fail: 0, skip: 0 }]));
  for (const item of results) {
    for (const name of CHECK_NAMES) {
      const status = item.checks?.[name]?.status ?? "skip";
      checks[name][status] = (checks[name][status] ?? 0) + 1;
    }
  }
  return {
    routes: new Set(results.map((item) => item.route)).size,
    cases: results.length,
    passingCases: results.filter((item) => CHECK_NAMES.every((name) => item.checks?.[name]?.status !== "fail")).length,
    failingCases: results.filter((item) => CHECK_NAMES.some((name) => item.checks?.[name]?.status === "fail")).length,
    checks,
  };
}

export async function writeReports({ results, outputDir, metadata = {} }) {
  await mkdir(outputDir, { recursive: true });
  const summary = summarize(results);
  const report = { generatedAt: new Date().toISOString(), metadata, summary, results };
  const lines = [
    "# Whole-app QA sweep", "",
    `${summary.routes} routes; ${summary.cases} locale/viewport cases; `
      + `${summary.passingCases} without failures; ${summary.failingCases} with failures.`, "",
    "✓ pass · ✗ fail · — skipped/not applicable. A skipped check is not a pass.", "",
    "## Run context", "", "```json", JSON.stringify(metadata, null, 2), "```", "",
    "## Check totals", "", "| Check | ✓ | ✗ | — |", "| --- | ---: | ---: | ---: |",
    ...CHECK_NAMES.map((name) => {
      const counts = summary.checks[name];
      return `| ${name} | ${counts.pass} | ${counts.fail} | ${counts.skip} |`;
    }), "", "## Route matrix", "",
    `| Route | Locale | Width | ${CHECK_NAMES.join(" | ")} | Screenshot |`,
    `| --- | --- | ---: | ${CHECK_NAMES.map(() => "---").join(" | ")} | --- |`,
  ];
  for (const item of results) {
    const screenshotPath = item.screenshot && (path.isAbsolute(item.screenshot)
      ? path.relative(outputDir, item.screenshot) : item.screenshot);
    const screenshot = screenshotPath ? `[view](${cell(screenshotPath)})` : "missing";
    lines.push(`| ${cell(item.route)} | ${cell(item.locale)} | ${cell(item.viewportWidth)} | `
      + `${CHECK_NAMES.map((name) => mark(item.checks?.[name]?.status)).join(" | ")} | ${screenshot} |`);
  }
  lines.push("", "## Expected local diagnostics", "",
    "These narrowly classified diagnostics remain in JSON and are not counted as unexpected application errors.", "");
  for (const item of results) {
    if (!item.expectedLocalDiagnostics?.length) continue;
    lines.push(`- ${item.route} · ${item.locale} · ${item.viewportWidth}: `
      + item.expectedLocalDiagnostics.map((diagnostic) => `${diagnostic.kind}: ${diagnostic.connection}`).join("; "));
  }
  lines.push("", "## Findings and skipped checks", "");
  for (const item of results) {
    const findings = CHECK_NAMES.filter((name) => item.checks?.[name]?.status !== "pass");
    if (!findings.length) continue;
    lines.push(`### ${item.route} · ${item.locale} · ${item.viewportWidth}`, "");
    if (item.url) lines.push(`URL: ${item.url}`, "");
    if (item.mode) lines.push(`Rendering mode: ${item.mode}`, "");
    for (const name of findings) {
      const finding = item.checks?.[name];
      lines.push(`**${name} ${mark(finding?.status)}**`, "", "```json",
        JSON.stringify(finding?.details ?? ["Check was not run."], null, 2), "```", "");
    }
  }
  await writeFile(path.join(outputDir, "report.json"), `${JSON.stringify(report, null, 2)}\n`);
  await writeFile(path.join(outputDir, "report.md"), `${lines.join("\n")}\n`);
  return summary;
}
