#!/usr/bin/env node
import { mkdir, writeFile, appendFile } from "node:fs/promises";
import { resolve } from "node:path";
import { parseArgs } from "node:util";
import { createRequire } from "node:module";
import { chromium } from "playwright";
import { build } from "esbuild";
import { prepareProduction } from "./production.mjs";
import { resolveRoutes, discoverBlogSlug } from "./routes.mjs";
import { prepareAccountFixtures } from "./account-fixture.mjs";
import { prepareBlogFixture } from "./blog-fixture.mjs";
import { classifyDutchFinding } from "./nl-classify.mjs";
import { analyzeDutchText, collectDutchLanguage } from "./nl-language.mjs";
import { auditDutchInteractions } from "./nl-interactions.mjs";
import { writeDutchReport } from "./nl-report.mjs";
import { buildSourceIndex, locateFinding } from "./nl-source-map.mjs";

const { values: options } = parseArgs({ options: {
  filter: { type: "string" }, exclude: { type: "string" }, output: { type: "string" },
  label: { type: "string", default: "40a" },
} });
if (!/^[a-zA-Z0-9.-]+$/.test(options.label)) throw new Error("Invalid report label");
if ((options.filter || options.exclude) && !options.output) {
  throw new Error("Filtered runs require --output so the whole-app report is preserved");
}
const root = process.cwd();
const output = resolve(root, options.output ?? "plans/redesign-canvas/final-sweep/40a-nl");
const audit = resolve(root, "plans/redesign-canvas/audit");
await mkdir(output, { recursive: true });
await mkdir(audit, { recursive: true });
await writeFile(resolve(output, "cases.jsonl"), "");
let production, accounts, blog, browser;
const cases = [];
const findings = new Map();
const metadata = { label: options.label, filter: options.filter, exclude: options.exclude,
  partial: Boolean(options.filter || options.exclude), capturedAt: new Date().toISOString(), locales: ["nl"], widths: [1440, 390],
  policy: "English word-list and ratio; human review required",
  limitations: [
    "Account fixtures mock auth/data/mutations; live account metadata and backend toasts are not certified.",
    "Only reachable main interactions are sampled; skipped/failed actions are recorded per case.",
    "Non-GET/HEAD network requests are blocked; this audit cannot persist changes or send forms.",
    "Native browser validation wording can depend on browser distribution, separately labelled.",
    "English source citations, names, user/CMS data and fixture copy require review, not automatic translation.",
    "Source locations refer to the frozen snapshot; candidates and uncertain fallbacks are explicit.",
  ] };
try {
  production = await prepareProduction({ root, outputDir: output, port: 4351 });
  metadata.production = { sourceHash: production.sourceHash, snapshot: production.snapshot,
    buildId: production.buildId };
  const sourceIndex = await buildSourceIndex(production.snapshot);
  let slug;
  try { slug = await discoverBlogSlug(production.origin, production.fetch); }
  catch (error) { metadata.limitations.push(`CMS discovery: ${error.message}`); }
  const routes = resolveRoutes({ blogSlug: slug }).filter((route) =>
    (!options.filter || route.sourceRoute.includes(options.filter))
    && (!options.exclude || !route.sourceRoute.includes(options.exclude)));
  if (!routes.length) throw new Error("No audited routes match the requested filter");
  metadata.routeCount = routes.length;
  accounts = await prepareAccountFixtures({ root: production.snapshot, origin: production.origin,
    fetch: production.fetch });
  if (routes.some((route) => route.fixture === "blog")) {
    blog = await prepareBlogFixture({ root: production.snapshot, origin: production.origin, fetch: production.fetch });
  }
  browser = await chromium.launch({ headless: true });
  async function scan({ route, sourceFile, url, mode, width, html }) {
    const row = { route, sourceFile, url, mode, width, chunks: [], blockedWrites: [], coverage: null };
    const seen = new Map();
    const context = await browser.newContext({ locale: "nl-NL", viewport: { width, height: 1000 },
      colorScheme: "light", reducedMotion: "reduce", ignoreHTTPSErrors: mode === "production" });
    await context.route("**/*", (request) => {
      if (!["GET", "HEAD"].includes(request.request().method())) {
        row.blockedWrites.push({ method: request.request().method(), url: request.request().url() });
        return request.abort("blockedbyclient");
      }
      return request.continue();
    });
    try {
      const page = await context.newPage();
      page.setDefaultTimeout(1500);
      if (html) await page.setContent(html, { waitUntil: "load" });
      else {
        const response = await page.goto(url, { waitUntil: "load", timeout: 60000 });
        row.status = response?.status();
        if (mode.endsWith("fixture")) {
          await page.waitForFunction(() => window.__visualReady === true, null, { timeout: 20000 });
        }
      }
      await page.evaluate(() => document.fonts.ready);
      await page.waitForTimeout(400);
      const collect = async (stage) => {
        for (const chunk of await collectDutchLanguage(page)) {
          const key = `${chunk.kind}|${chunk.selector}|${chunk.text}`;
          const old = seen.get(key);
          if (old) { if (!old.stages.includes(stage)) old.stages.push(stage); continue; }
          const entry = { ...chunk, stages: [stage] };
          seen.set(key, entry);
          const detection = analyzeDutchText(chunk.text);
          if (!detection) continue;
          const location = locateFinding(sourceIndex, { text: chunk.text, route, sourceFile, kind: chunk.kind });
          const classification = classifyDutchFinding({ chunk, mode, location, detection });
          const findingKey = `${chunk.kind}|${chunk.text}|${location.owner}`;
          if (!findings.has(findingKey)) findings.set(findingKey, { ...chunk, detection, ...location,
            classification, occurrences: [] });
          const finding = findings.get(findingKey);
          finding.occurrences.push({ route, mode, width, stage, selector: chunk.selector });
        }
      };
      await collect("initial");
      if (!html) row.coverage = await auditDutchInteractions(page, collect);
      else row.coverage = { completed: [], skipped: [], limitations: ["Static PDF HTML; no interactive controls."] };
      row.chunks = [...seen.values()];
    } catch (error) { row.error = error.stack; }
    finally { await context.close(); }
    cases.push(row);
    await appendFile(resolve(output, "cases.jsonl"), JSON.stringify(row) + "\n");
    console.log(JSON.stringify({ completed: cases.length, route, width, chunks: row.chunks.length, error: row.error }));
  }
  const queue = routes.flatMap((route) => metadata.widths.map((width) => {
    const fixture = route.fixture === "account" ? accounts : route.fixture === "blog" ? blog : null;
    return { route: route.sourceRoute, sourceFile: route.sourceFile, width,
      url: `${fixture?.origin ?? production.origin}${route.paths.nl}`,
      mode: fixture ? `${route.fixture}-fixture` : "production" };
  }));
  let cursor = 0;
  await Promise.all(Array.from({ length: 3 }, async () => {
    while (cursor < queue.length) await scan(queue[cursor++]);
  }));
  if (!metadata.partial) {
    const bundle = resolve(production.snapshot, "nl-audit-pdf.cjs");
    await build({ stdin: { contents: `export { reportPdfFixture, reportPdfFullFixture } from './tests/fixtures/reportPdf';
      export { getReportV2Copy } from './src/lib/reports/reportV2Copy';
      export { renderPdfReportHtml } from './src/lib/reports/pdfLayoutTemplate';`,
      resolveDir: production.snapshot, loader: "ts" }, outfile: bundle, absWorkingDir: production.snapshot,
      bundle: true, platform: "node", format: "cjs", packages: "external" });
    const pdf = createRequire(import.meta.url)(bundle);
    for (const name of ["reportPdfFixture", "reportPdfFullFixture"]) {
      await scan({ route: `PDF HTML/${name}`, sourceFile: "src/lib/reports/pdfLayoutTemplate.ts", mode: "pdf-html",
        width: 794, html: pdf.renderPdfReportHtml({ report: pdf[name], copy: pdf.getReportV2Copy("nl") }) });
    }
  }
} catch (error) { metadata.error = error.stack; }
finally {
  await browser?.close();
  await blog?.close();
  await accounts?.close();
  await production?.close();
  await writeDutchReport({ metadata, cases, findings: [...findings.values()], output, audit });
  if (metadata.error || cases.some((row) => row.error)) process.exitCode = 2;
  else if (findings.size) process.exitCode = 1;
}
