import { readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
const audit = resolve("plans/seo-semrush/audit");
const before = JSON.parse(await readFile(resolve(audit, "S10-before/summary.json"), "utf8"));
const after = JSON.parse(await readFile(resolve(audit, "S10-after/summary.json"), "utf8"));
if (JSON.stringify(before.settings) !== JSON.stringify(after.settings)) throw new Error("Before/after settings differ");
const rows = after.summary.map(row => {
  const previous = before.summary.find(item => new URL(item.url).pathname === new URL(row.url).pathname);
  if (!previous) throw new Error(`Missing baseline for ${row.url}`);
  return { path: new URL(row.url).pathname, metrics: Object.fromEntries(Object.entries(row.metrics).map(([id, metric]) => {
    const initial = previous.metrics[id].median;
    return [id, { before: initial, after: metric.median,
      delta: initial !== null && metric.median !== null ? metric.median - initial : null, pass: metric.pass }];
  })) };
});
await writeFile(resolve(audit, "S10-comparison.json"), JSON.stringify({ before: before.collectedAt, after: after.collectedAt, rows }, null, 2) + "\n");
const lines = ["# S10 before / after", "", "Three simulated-mobile lab runs per template on local production builds. The after build contains combined S10 image changes and S11 answer sections; it does not isolate either change. Medians below; run-to-run variation is not evidence of causation.", "",
  "| Route | Metric | Before | After | Delta | After budget |", "| --- | --- | ---: | ---: | ---: | --- |"];
const value = number => number === null ? "unavailable" : Number(number.toFixed(3));
for (const row of rows) for (const [id, metric] of Object.entries(row.metrics)) {
  lines.push(`| ${row.path} | ${id} | ${value(metric.before)} | ${value(metric.after)} | ${value(metric.delta)} | ${metric.pass ? "PASS" : "FAIL"} |`);
}
await writeFile(resolve(audit, "S10-comparison.md"), lines.join("\n") + "\n");
