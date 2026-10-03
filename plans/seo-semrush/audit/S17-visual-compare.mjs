import { readFile, writeFile, readdir } from "node:fs/promises";
import { createHash } from "node:crypto";
import { resolve } from "node:path";

const audit = resolve("plans/seo-semrush/audit");
const renders = resolve("plans/seo-semrush/renders");
const previous = JSON.parse(await readFile(resolve(audit, "S15-visual-after.json"), "utf8"));
const current = JSON.parse(await readFile(resolve(audit, "S17-visual-after.json"), "utf8"));
if (current.results.length !== 84 || previous.results.length !== 84) throw new Error("Complete 84-case captures required");
const comparisons = [];
for (const row of current.results) {
  const prior = previous.results.find(item => item.id === row.id && item.locale === row.locale && item.width === row.width);
  const hash = async name => createHash("sha256").update(await readFile(resolve(renders, name))).digest("hex");
  const beforeSha256 = await hash(prior.screenshot);
  const afterSha256 = await hash(row.screenshot);
  comparisons.push({ id: row.id, locale: row.locale, width: row.width, beforeSha256, afterSha256,
    identical: beforeSha256 === afterSha256, heightDelta: row.metrics.height - prior.metrics.height,
    personalizeCount: row.integration.personalize.length, answerIds: row.integration.answers.map(answer => answer.id),
    handoffLinks: row.integration.personalize.flatMap(block => block.links) });
}
const findings = current.results.filter(row => row.failure || row.status !== 200 || row.errors.length ||
  row.consoleErrors.length || row.failedAssets.length || row.blockedRequests.length ||
  row.metrics.scrollWidth > row.width || row.metrics.brokenImages.length || row.axe.violations.length);
await writeFile(resolve(audit, "S17-visual-comparison.json"), JSON.stringify({
  previousBuild: previous.buildId, currentBuild: current.buildId, findings, comparisons,
}, null, 2) + "\n");
const files = [
  ...(await readdir(audit)).filter(name => name.startsWith("S17-visual")).map(name => "plans/seo-semrush/audit/" + name),
  ...(await readdir(renders)).filter(name => name.startsWith("S17-")).map(name => "plans/seo-semrush/renders/" + name),
  "plans/seo-semrush/audit/S17-visual-manifest.txt",
];
await writeFile(resolve(audit, "S17-visual-manifest.txt"), [...new Set(files)].sort().join("\n") + "\n");
console.log(JSON.stringify({ cases: comparisons.length, findings: findings.length,
  identical: comparisons.filter(row => row.identical).length,
  changed: comparisons.filter(row => !row.identical).map(row => [row.id, row.locale, row.width, row.heightDelta]),
  calculatorIntegration: comparisons.filter(row => row.personalizeCount || row.answerIds.length),
}));
