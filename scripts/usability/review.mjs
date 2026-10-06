import { createHash, randomUUID } from "node:crypto";
import { readFile, realpath, rename, rm, writeFile } from "node:fs/promises";
import { dirname, isAbsolute, relative, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";
import { pages, locales, viewports, pressureSurfaces } from "./routes.mjs";
import { manualRequirements, summarize } from "./rules.mjs";
import { sourceFingerprint, verifyBuildProvenance, verifyManualApproval } from "./provenance.mjs";

const hash = value => createHash("sha256").update(value).digest("hex");
const validHash = value => typeof value === "string" && /^[a-f0-9]{64}$/.test(value);
const nonblank = value => typeof value === "string" && Boolean(value.trim());
const caseKey = record => `${record.id}|${record.locale}|${record.width}|${record.height}`;
const validStatuses = new Set(["pass", "fail", "manual", "not-applicable"]);

export function finalizeReview({ report, review, currentSourceHash, currentBuildId, buildProvenance, artifactHashes = {}, validationErrors = [] }) {
  const errors = [...validationErrors];
  const selected = pages.filter(page => report.scope === "all" || page.owner === report.scope);
  if (!["all", "U1", "U2", "U3"].includes(report.scope) || !selected.length) errors.push("Unknown review scope");
  if (report.filter) errors.push("Filtered reports cannot complete a scope");
  if (!validHash(report.sourceHash) || report.sourceHash !== currentSourceHash) errors.push("Current source does not match the captured report");
  if (!nonblank(report.buildId) || report.buildId !== currentBuildId) errors.push("Current build does not match the captured report");
  if (buildProvenance?.valid !== true) errors.push(`Build provenance invalid: ${buildProvenance?.reason ?? "missing"}`);
  if (report.buildProvenance?.valid !== true) errors.push("Captured report has no valid build provenance");
  if (report.automatedPassed !== true || report.fatalError || report.staleBuildSources?.length) errors.push("Captured automated failures cannot be overridden by manual review");
  const expected = new Set(selected.flatMap(page => locales.flatMap(locale => viewports.map(viewport => caseKey({ id: page.id, locale, ...viewport })))));
  const seen = new Set();
  const records = structuredClone(Array.isArray(report.records) ? report.records : []);
  for (const record of records) {
    const key = caseKey(record);
    if (!expected.has(key) || seen.has(key)) errors.push(`Unexpected or duplicate case: ${key}`);
    seen.add(key);
    const descriptor = selected.find(page => page.id === record.id);
    if (!descriptor || descriptor.owner !== record.owner) errors.push(`Wrong route ownership: ${key}`);
    record.errors = Array.isArray(record.errors) ? record.errors : ["Captured case has no error inventory"];
    if (!Array.isArray(record.checks)) record.checks = [];
    if (!record.metrics) record.errors.push("Captured metrics are missing");
    if (!validHash(record.screenshotHash) || artifactHashes[record.screenshot] !== record.screenshotHash) record.errors.push("Initial screenshot is missing, changed, or outside the report directory");
    for (const state of record.stateScreenshots ?? []) {
      if (!nonblank(state.state) || !validHash(state.hash) || artifactHashes[state.filename] !== state.hash) record.errors.push(`State screenshot invalid: ${state.state ?? "unnamed"}`);
    }
    const expectedHash = hash(JSON.stringify({ metrics: record.metrics, screenshotHash: record.screenshotHash,
      states: record.stateScreenshots ?? [], interactions: record.interactionChecks ?? [] }));
    if (!validHash(record.evidenceHash) || record.evidenceHash !== expectedHash) record.errors.push("Captured evidence hash does not match metrics and interaction evidence");
    const requirements = descriptor ? manualRequirements(descriptor) : [];
    const automated = record.checks.filter(check => !requirements.some(required => check.rule === required.rule && check.reason === required.reason));
    if (automated.some(check => !Number.isInteger(check.rule) || check.rule < 1 || check.rule > 15 || !validStatuses.has(check.status))) record.errors.push("Invalid captured automated check");
    for (let rule = 1; rule <= 15; rule++) {
      if (!automated.some(check => check.rule === rule)) record.errors.push(`Missing captured automated rule ${rule}`);
    }
    record.checks = [...automated, ...requirements.map(required => {
      const approved = verifyManualApproval(review, record, required, {
        buildId: report.buildId, sourceHash: report.sourceHash, evidenceHash: record.evidenceHash,
      });
      return { ...required, status: approved ? "pass" : "manual",
        evidence: approved ? { reviewer: approved.reviewer, note: approved.note, screenshot: record.screenshot } : record.screenshot };
    })];
  }
  if (records.length !== expected.size || [...expected].some(key => !seen.has(key))) errors.push("Report does not contain the complete locale/viewport matrix for its scope");
  const rules = summarize(records);
  if (["all", "U3"].includes(report.scope)) {
    for (const surface of [...pressureSurfaces.filter(item => !item.pageId).map(item => item.board), "mail-pressure-text"]) {
      for (const locale of locales) {
        const matches = (Array.isArray(review?.surfaces) ? review.surfaces : []).filter(item => item.surface === surface && item.locale === locale);
        const evidence = matches.length === 1 ? matches[0] : null;
        const approved = review?.buildId === report.buildId && review?.sourceHash === report.sourceHash
          && evidence?.status === "pass" && nonblank(evidence.reviewer) && nonblank(evidence.note)
          && validHash(evidence.sha256) && nonblank(evidence.file) && artifactHashes[evidence.file] === evidence.sha256;
        rules[10].checks.push({ rule: 11, page: surface, locale, status: approved ? "pass" : "manual",
          evidence: approved ? evidence : "Rendered report/email pressure evidence required; no standalone route" });
      }
    }
    rules[10].status = rules[10].checks.some(check => check.status === "fail") ? "fail"
      : rules[10].checks.some(check => check.status === "manual") ? "manual" : "pass";
  }
  const automaticFailure = errors.length > 0 || records.some(record => record.errors.length
    || record.accessibility?.some(violation => ["serious", "critical"].includes(violation.impact)))
    || rules.some(rule => rule.status === "fail");
  const manualOutstanding = rules.some(rule => rule.status === "manual");
  return { ...structuredClone(report), records, rules, reviewErrors: errors,
    reviewMode: "saved-evidence", automatedPassed: !automaticFailure, manualOutstanding,
    passed: !automaticFailure && !manualOutstanding,
    releasePassed: report.scope === "all" && !automaticFailure && !manualOutstanding };
}

async function containedArtifactHash(base, filename) {
  if (!nonblank(filename)) return null;
  try {
    const directory = await realpath(base);
    const candidate = resolve(base, filename);
    if (!candidate.startsWith(resolve(base) + sep)) return null;
    const actual = await realpath(candidate);
    if (!actual.startsWith(directory + sep) || actual !== resolve(directory, relative(resolve(base), candidate))) return null;
    return hash(await readFile(actual));
  } catch { return null; }
}

async function writeSeparateOutput(filename, contents) {
  const temporary = `${filename}.${randomUUID()}.tmp`;
  try {
    await writeFile(temporary, contents, { flag: "wx" });
    await rename(temporary, filename);
  } finally {
    await rm(temporary, { force: true });
  }
}

export async function finalizeReportFiles({ root, reportPath, manualPath }) {
  if (!isAbsolute(reportPath) || !isAbsolute(manualPath)) throw new Error("Report and manual-review paths must be absolute");
  if (reportPath === manualPath) throw new Error("Report and manual-review files must differ");
  const output = dirname(reportPath);
  const jsonPath = resolve(output, "reviewed-report.json");
  const markdownPath = resolve(output, "reviewed-report.md");
  if ([jsonPath, markdownPath].includes(resolve(reportPath)) || [jsonPath, markdownPath].includes(resolve(manualPath))) throw new Error("Input files cannot be reviewed-report output files");
  const raw = await readFile(reportPath, "utf8");
  const report = JSON.parse(raw);
  const review = JSON.parse(await readFile(manualPath, "utf8"));
  const currentSourceHash = await sourceFingerprint(root);
  let stamp;
  try { stamp = JSON.parse(await readFile(resolve(root, ".next/usability-provenance.json"), "utf8")); }
  catch { stamp = null; }
  const buildProvenance = await verifyBuildProvenance(root, stamp);
  let currentBuildId;
  try { currentBuildId = (await readFile(resolve(root, ".next/BUILD_ID"), "utf8")).trim(); }
  catch { currentBuildId = null; }
  const artifactHashes = Object.create(null);
  for (const record of report.records ?? []) {
    for (const name of [record.screenshot, ...(record.stateScreenshots ?? []).map(state => state.filename)]) {
      if (nonblank(name)) artifactHashes[name] = await containedArtifactHash(output, name);
    }
  }
  for (const evidence of review.surfaces ?? []) {
    if (nonblank(evidence.file)) artifactHashes[evidence.file] = isAbsolute(evidence.file)
      ? await containedArtifactHash(resolve(root, "plans/usability/renders"), evidence.file) : null;
  }
  const validationErrors = await sourceFingerprint(root) === currentSourceHash ? [] : ["Source changed while validating saved evidence"];
  const result = finalizeReview({ report, review, currentSourceHash, currentBuildId, buildProvenance, artifactHashes, validationErrors });
  result.sourceReport = { path: reportPath, sha256: hash(raw) };
  result.reviewedAt = new Date().toISOString();
  await writeSeparateOutput(jsonPath, JSON.stringify(result, null, 2));
  await writeSeparateOutput(markdownPath, `# Reviewed usability guard ${result.scope}\n\nBuild: ${result.buildId}\n\n`
    + result.rules.map(rule => `- Rule ${rule.rule}: **${rule.status}** — ${rule.title}`).join("\n")
    + `\n\n${result.records.length} saved cases. Automated checks: ${result.automatedPassed ? "pass" : "fail"}. `
    + `Manual review: ${result.manualOutstanding ? "outstanding" : "complete"}. Scope passed: ${result.passed}. Release passed: ${result.releasePassed}.\n`
    + (result.reviewErrors.length ? `\n${result.reviewErrors.map(error => `- ${error}`).join("\n")}\n` : ""));
  return { ...result, output: { json: jsonPath, markdown: markdownPath } };
}

export function parseReviewOptions(args) {
  const options = {};
  for (const argument of args) {
    const match = argument.match(/^--(report|manual-file)=(.+)$/);
    if (!match || options[match[1]]) throw new Error(`Unknown or duplicate review option: ${argument}`);
    if (!isAbsolute(match[2])) throw new Error("Review paths must be absolute");
    options[match[1]] = match[2];
  }
  if (!options.report || !options["manual-file"]) throw new Error("Use --report=/absolute/report.json --manual-file=/absolute/review.json");
  return { reportPath: options.report, manualPath: options["manual-file"] };
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try {
    const result = await finalizeReportFiles({ root: fileURLToPath(new URL("../../", import.meta.url)), ...parseReviewOptions(process.argv.slice(2)) });
    console.log(JSON.stringify({ output: result.output, passed: result.passed, releasePassed: result.releasePassed,
      automatedPassed: result.automatedPassed, manualOutstanding: result.manualOutstanding, errors: result.reviewErrors }, null, 2));
    if (!result.passed) process.exitCode = 1;
  } catch (error) {
    console.error(error.message);
    process.exitCode = 1;
  }
}
