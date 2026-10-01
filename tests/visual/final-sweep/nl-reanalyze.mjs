#!/usr/bin/env node
import { readFile, stat } from "node:fs/promises";
import { resolve } from "node:path";
import { classifyDutchFinding } from "./nl-classify.mjs";
import { analyzeDutchText } from "./nl-language.mjs";
import { buildSourceIndex, locateFinding } from "./nl-source-map.mjs";
import { writeDutchReport } from "./nl-report.mjs";

// Reclassify the original evidence without browsing a changed working tree.
const output = resolve(process.argv[2] ?? "plans/redesign-canvas/final-sweep/40a-nl");
const audit = resolve("plans/redesign-canvas/audit");
const previous = JSON.parse(await readFile(resolve(output, "report.json"), "utf8"));
const cases = (await readFile(resolve(output, "cases.jsonl"), "utf8")).trim().split("\n").map(JSON.parse);
const index = await buildSourceIndex(previous.metadata.production.snapshot);
const findings = new Map();
for (const row of cases) {
  for (const chunk of row.chunks) {
    const detection = analyzeDutchText(chunk.text);
    if (!detection) continue;
    const location = locateFinding(index, { ...chunk, route: row.route, sourceFile: row.sourceFile });
    const key = `${chunk.kind}|${chunk.text}|${location.owner}`;
    const classification = classifyDutchFinding({ chunk, mode: row.mode, location, detection });
    if (!findings.has(key)) findings.set(key, { ...chunk, detection, ...location, classification, occurrences: [] });
    for (const stage of chunk.stages) findings.get(key).occurrences.push({ route: row.route, mode: row.mode,
      width: row.width, stage, selector: chunk.selector });
  }
}
previous.metadata.capturedAt ??= (await stat(resolve(output, "cases.jsonl"))).mtime.toISOString();
previous.metadata.reanalyzedAt = new Date().toISOString();
previous.metadata.limitations = [...new Set([...previous.metadata.limitations,
  "The retired listing-import flow may still appear in this historical snapshot."])];
await writeDutchReport({ metadata: previous.metadata, cases, findings: [...findings.values()], output, audit });
console.log(JSON.stringify({ cases: cases.length, findings: findings.size }));
