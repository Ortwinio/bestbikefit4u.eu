import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { mkdtemp, mkdir, readFile, rm, symlink, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";
import { pages, locales, viewports } from "./routes.mjs";
import { manualRequirements } from "./rules.mjs";
import { sourceFingerprint, startBuildProvenance, finishBuildProvenance } from "./provenance.mjs";
import { finalizeReview, finalizeReportFiles, parseReviewOptions } from "./review.mjs";

const hash = value => createHash("sha256").update(value).digest("hex");
const image = Buffer.from("deterministic test image");

function setup(scope = "U1") {
  const sourceHash = "a".repeat(64);
  const artifactHashes = {};
  const checks = [];
  const records = pages.filter(page => scope === "all" || page.owner === scope).flatMap(descriptor => locales.flatMap(locale => viewports.map(viewport => {
    const screenshot = `${descriptor.id}-${locale}-${viewport.width}.png`;
    const record = { id: descriptor.id, owner: descriptor.owner, locale, ...viewport, screenshot, screenshotHash: hash(image),
      metrics: { capturedAt: 123456789 }, stateScreenshots: [{ state: "edited", filename: `edited-${screenshot}`, hash: hash(image) }],
      interactionChecks: [], checks: Array.from({ length: 15 }, (_, index) => ({ rule: index + 1, status: "pass" })), errors: [], accessibility: [] };
    artifactHashes[screenshot] = hash(image);
    artifactHashes[`edited-${screenshot}`] = hash(image);
    record.evidenceHash = hash(JSON.stringify({ metrics: record.metrics, screenshotHash: record.screenshotHash,
      states: record.stateScreenshots, interactions: record.interactionChecks }));
    for (const required of manualRequirements(descriptor)) {
      record.checks.push({ ...required, status: "manual" });
      checks.push({ id: record.id, locale, width: viewport.width, rule: required.rule, status: "pass",
        reviewer: "Test reviewer", note: "Synthetic test evidence reviewed", screenshotHash: record.screenshotHash, evidenceHash: record.evidenceHash });
    }
    return record;
  })));
  return { report: { scope, buildId: "build-1", sourceHash, filter: null, automatedPassed: true,
    buildProvenance: { valid: true }, staleBuildSources: [], records },
    review: { buildId: "build-1", sourceHash, checks }, currentBuildId: "build-1", currentSourceHash: sourceHash,
    buildProvenance: { valid: true }, artifactHashes };
}

test("saved evidence can be approved without rerendering or mutating the raw report", () => {
  const input = setup();
  const original = JSON.stringify(input.report);
  const result = finalizeReview(input);
  assert.equal(result.passed, true);
  assert.equal(result.releasePassed, false);
  assert.equal(result.manualOutstanding, false);
  assert.equal(JSON.stringify(input.report), original);
});

test("missing, duplicate and incorrectly bound approvals remain pending", () => {
  for (const change of [input => { input.review.checks = []; }, input => { input.review.sourceHash = "b".repeat(64); },
    input => { input.review.checks[0].evidenceHash = "b".repeat(64); }, input => { input.review.checks[0].screenshotHash = "b".repeat(64); },
    input => { input.review.checks.push(input.review.checks[0]); }, input => { input.review.checks[0].status = "fail"; }]) {
    const input = setup(); change(input);
    const result = finalizeReview(input);
    assert.equal(result.passed, false);
    assert.equal(result.manualOutstanding, true);
  }
});

test("automated failures, changed artifacts and edited metrics cannot be overridden", () => {
  const changes = [input => { input.report.automatedPassed = false; }, input => { input.report.records[0].checks[0].status = "fail"; },
    input => { input.report.records[0].errors.push("browser error"); }, input => { input.report.records[0].metrics.capturedAt++; },
    input => { delete input.artifactHashes[input.report.records[0].screenshot]; },
    input => { delete input.artifactHashes[input.report.records[0].stateScreenshots[0].filename]; },
    input => { input.report.records[0].accessibility = [{ impact: "serious" }]; }];
  for (const change of changes) {
    const input = setup(); change(input);
    const result = finalizeReview(input);
    assert.equal(result.passed, false);
    assert.equal(result.automatedPassed, false);
  }
});

test("filtered, incomplete, duplicate and wrong-build reports fail closed", () => {
  for (const change of [input => { input.report.filter = "home"; }, input => { input.report.records.pop(); },
    input => { input.report.records[0] = input.report.records[1]; }, input => { input.currentSourceHash = "b".repeat(64); },
    input => { input.currentBuildId = "build-2"; }, input => { input.buildProvenance = { valid: false }; },
    input => { input.report.records[0].checks = []; }]) {
    const input = setup(); change(input);
    assert.equal(finalizeReview(input).passed, false);
  }
});

test("report and email surfaces require distinct exact-file approvals", () => {
  const input = setup("U3");
  assert.equal(finalizeReview(input).manualOutstanding, true);
  input.review.surfaces = ["FitReport.dc.html", "FitRapport5.dc.html", "mail-pressure-text"].flatMap(surface => locales.map(locale => {
    const file = `/renders/${surface}-${locale}.png`;
    input.artifactHashes[file] = hash(image);
    return { surface, locale, file, sha256: hash(image), reviewer: "Test reviewer", note: "Synthetic surface", status: "pass" };
  }));
  assert.equal(finalizeReview(input).passed, true);
  input.review.surfaces.push(input.review.surfaces[0]);
  assert.equal(finalizeReview(input).passed, false);
});

test("file workflow validates real screenshots and writes separate reports", async context => {
  const root = await mkdtemp(join(tmpdir(), "usability-review-"));
  context.after(() => rm(root, { recursive: true, force: true }));
  const output = join(root, "plans/usability/renders/guard/U1");
  await mkdir(output, { recursive: true });
  await mkdir(join(root, ".next"));
  const start = await startBuildProvenance(root);
  start.startedAt = "2020-01-01T00:00:00.000Z";
  await writeFile(join(root, ".next/BUILD_ID"), "build-1");
  await writeFile(join(root, ".next/usability-provenance.json"), JSON.stringify(await finishBuildProvenance(root, start)));
  const input = setup();
  input.report.sourceHash = input.review.sourceHash = await sourceFingerprint(root);
  for (const filename of Object.keys(input.artifactHashes)) await writeFile(join(output, filename), image);
  const reportPath = join(output, "report.json");
  const manualPath = join(output, "review.json");
  const original = JSON.stringify(input.report);
  await writeFile(reportPath, original);
  await writeFile(manualPath, JSON.stringify(input.review));
  const result = await finalizeReportFiles({ root, reportPath, manualPath });
  assert.equal(result.passed, true);
  assert.equal(await readFile(reportPath, "utf8"), original);
  assert.equal(JSON.parse(await readFile(result.output.json, "utf8")).passed, true);
  const filename = input.report.records[0].stateScreenshots[0].filename;
  await rm(join(output, filename));
  const outside = join(root, "outside.png");
  await writeFile(outside, image);
  await symlink(outside, join(output, filename));
  const invalid = await finalizeReportFiles({ root, reportPath, manualPath });
  assert.equal(invalid.passed, false);
  assert.match(invalid.records[0].errors.join(" "), /State screenshot invalid/);
  await rm(join(output, filename));
  await symlink(join(output, input.report.records[0].screenshot), join(output, filename));
  assert.equal((await finalizeReportFiles({ root, reportPath, manualPath })).passed, false);
  await rm(join(output, "reviewed-report.json"));
  await symlink(reportPath, join(output, "reviewed-report.json"));
  await finalizeReportFiles({ root, reportPath, manualPath });
  assert.equal(await readFile(reportPath, "utf8"), original);
});

test("CLI requires explicit absolute inputs and rejects duplicates", () => {
  assert.deepEqual(parseReviewOptions(["--report=/tmp/report.json", "--manual-file=/tmp/review.json"]),
    { reportPath: "/tmp/report.json", manualPath: "/tmp/review.json" });
  for (const args of [[], ["--report=relative"], ["--report=/tmp/report.json", "--report=/tmp/other.json"], ["--approve-all"]]) {
    assert.throws(() => parseReviewOptions(args));
  }
});
