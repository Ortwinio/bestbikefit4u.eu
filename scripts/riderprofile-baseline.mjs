#!/usr/bin/env node
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { mkdir, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const run = promisify(execFile);

export function parseDate(value) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value ?? "")) throw new Error("Use UTC dates in YYYY-MM-DD format");
  const timestamp = Date.parse(`${value}T00:00:00.000Z`);
  if (!Number.isFinite(timestamp) || new Date(timestamp).toISOString().slice(0, 10) !== value) {
    throw new Error("Invalid calendar date");
  }
  return timestamp;
}

export function assertAggregateReport(report) {
  if (report?.version !== 1 || !Array.isArray(report.publicCalculators) || !Array.isArray(report.limitations)) {
    throw new Error("Unexpected baseline report format");
  }
  const forbidden = /^(?:_id|userId|sessionId|email|name|phone|value|values|state|profiles|users)$/i;
  function check(value) {
    if (typeof value === "string" && /[^\s]+@[^\s]+\.[^\s]+/.test(value)) {
      throw new Error("Report contains a possible email address");
    }
    if (!value || typeof value !== "object") return;
    for (const [key, child] of Object.entries(value)) {
      if (forbidden.test(key)) throw new Error("Report contains non-aggregate fields");
      check(child);
    }
  }
  check(report);
}

export function summary(report, from, to) {
  const number = (value) => value === null ? "unavailable" : String(value);
  return [
    `# Rider profile baseline: ${from} to ${to}`,
    "", "UTC interval: start inclusive, end exclusive. Read-only production query; no deploy or data writes.", "",
    `New users: ${report.newUsers}. Calculator-attributed verified login events: ${report.verifiedLoginsFromCalculators}.`,
    "", "| Calculator | Result views | Login CTA clicks | Verified logins |",
    "| --- | ---: | ---: | ---: |",
    ...report.publicCalculators.map((row) =>
      `| ${row.calculator} | ${row.resultViews} | ${row.loginCtaClicks} | ${row.verifiedLogins} |`),
    "", "## Profile completeness", "",
    ...[report.profileCompleteness.at7Days, report.profileCompleteness.at30Days].map((row) =>
      `Day ${row.days}: historical median ${number(row.medianFilledFieldsAtAge)}; `
      + `current proxy median ${number(row.currentMedianFilledFieldsForEligibleUsers)} `
      + `across ${row.eligibleUsers} eligible users.`),
    "", "## Latest account calculator state updates", "",
    "| UTC month | Active updating users | Latest state rows | Rows per active updating user |",
    "| --- | ---: | ---: | ---: |",
    ...report.accountCalculatorUse.map((row) =>
      `| ${row.month} | ${row.activeUpdatingUsers} | ${row.latestUpdatedStateRows} `
      + `| ${number(row.rowsPerActiveUpdatingUser)} |`),
    "", `Ride feedback: ${report.recommendationFeedback.withRideFeedback}`
      + ` / ${report.recommendationFeedback.recommendations} recommendations.`,
    `Observed return within 30 days: ${report.returnWithin30Days.observedReturns}`
      + ` / ${report.returnWithin30Days.eligibleUsers} mature users; `
      + `${report.returnWithin30Days.unknownUsers} unknown (lower bound, not a measured full retention rate).`,
    "", "## Measurement limits", "", ...report.limitations.map((limit) => `- ${limit}`), "",
  ].join("\n");
}

export async function main(argv = process.argv.slice(2)) {
  const options = new Map();
  for (let index = 0; index < argv.length; index += 2) {
    if (!["--from", "--to"].includes(argv[index]) || !argv[index + 1] || options.has(argv[index])) {
      throw new Error("Usage: node scripts/riderprofile-baseline.mjs --from YYYY-MM-DD --to YYYY-MM-DD");
    }
    options.set(argv[index], argv[index + 1]);
  }
  const fromLabel = options.get("--from");
  const toLabel = options.get("--to");
  const from = parseDate(fromLabel);
  const to = parseDate(toLabel);
  if (from >= to || to > Date.now()) throw new Error("Date interval must be nonempty and end no later than today");
  // Fixed internal query only. No shell, --push, deploy, mutation or data export command.
  let stdout;
  try {
    ({ stdout } = await run(resolve(root, "node_modules/.bin/convex"), [
      "run", "--prod", "analytics/baseline:riderProfileBaseline", JSON.stringify({ from, to }),
    ], { cwd: root, maxBuffer: 10 * 1024 * 1024 }));
  } catch {
    throw new Error("Baseline query failed. Check production access and that the query has been released; nothing was written.");
  }
  const report = JSON.parse(stdout);
  assertAggregateReport(report);
  const output = resolve(root, "plans/riderprofile-baseline", `baseline-${fromLabel}-${toLabel}`);
  await mkdir(dirname(output), { recursive: true });
  await writeFile(`${output}.json`, `${JSON.stringify(report, null, 2)}\n`);
  await writeFile(`${output}.md`, summary(report, fromLabel, toLabel));
  console.log(`Wrote baseline-${fromLabel}-${toLabel}.json and .md`);
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  main().catch((error) => {
    console.error(error instanceof Error ? error.message : "Baseline report failed");
    process.exitCode = 1;
  });
}
