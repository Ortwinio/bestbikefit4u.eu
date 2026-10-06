#!/usr/bin/env node
import { spawn } from "node:child_process";
import { createHash } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright";
import AxeBuilder from "@axe-core/playwright";
import { createPreviewCertificate, createPreviewFetch } from "../tests/visual/final-sweep/tls.mjs";
import { classifyExpectedDiagnostic } from "../tests/visual/final-sweep/diagnostics.mjs";
import { pages, calculators, locales, viewports, localizedPagePath, pressureSurfaces } from "./usability/routes.mjs";
import { checkRules, manualRequirements, summarize } from "./usability/rules.mjs";
import { measureDocument } from "./usability/measure.mjs";
import { localOrigin, parseOptions } from "./usability/options.mjs";
import { verifyEditedHandoff } from "./usability/handoff.mjs";
import { runPool } from "./usability/pool.mjs";
import { sourceFingerprint, findSourcesNewerThanBuild, verifyManualApproval, verifyBuildProvenance } from "./usability/provenance.mjs";

const root = fileURLToPath(new URL("../", import.meta.url));
const options = parseOptions(process.argv.slice(2));
const selected = pages.filter(page => (options.scope === "all" || page.owner === options.scope)
  && (!options.filter || [page.path, page.id, ...Object.values(page.localizedPaths ?? {})]
    .some(path => options.filter.split(",").some(filter => path.includes(filter)))));
if (!selected.length) throw new Error("No matching usability routes");
const output = options.output ? resolve(options.output)
  : resolve(root, "plans/usability/renders/guard", options.scope);
const buildId = (await readFile(resolve(root, ".next/BUILD_ID"), "utf8")).trim();
const sourceHash = await sourceFingerprint(root);
await mkdir(output, { recursive: true });
const review = options.manualFile ? JSON.parse(await readFile(resolve(options.manualFile), "utf8")) : null;
let production, fixtures, browser, fatalError;
let staleBuildSources = [];
let buildProvenance;
const records = [];

async function startProduction() {
  const certificate = await createPreviewCertificate();
  const origin = `https://127.0.0.1:${options.port}`;
  const child = spawn(process.execPath, [resolve(root, "scripts/seo-crawl/server.mjs"), String(options.port),
    certificate.keyPath, certificate.certPath], { cwd: root, stdio: ["ignore", "pipe", "pipe"],
    env: { ...process.env, NEXT_PUBLIC_SITE_URL: "https://bikefitboost.com", NEXT_PUBLIC_CONVEX_URL: "http://127.0.0.1:9",
      NEXT_PUBLIC_CONVEX_SITE_URL: "http://127.0.0.1:9", CONVEX_SITE_URL: "http://127.0.0.1:9",
      STRIPE_BILLING_ENABLED: "false", NEXT_PUBLIC_STRIPE_BILLING_ENABLED: "false", NEXT_TELEMETRY_DISABLED: "1" } });
  const close = async () => {
    if (child.pid && child.exitCode === null && child.signalCode === null) {
      const stopped = new Promise(done => child.once("exit", done));
      child.kill("SIGTERM");
      await stopped;
    }
    await certificate.close();
  };
  try {
    await new Promise((done, reject) => {
      let stderr = "";
      const timer = setTimeout(() => reject(new Error(`Local production startup timed out: ${stderr}`)), 45000);
      child.stderr.on("data", chunk => { stderr += chunk; });
      child.once("error", error => { clearTimeout(timer); reject(error); });
      child.once("exit", code => { clearTimeout(timer); reject(new Error(`Local server exited ${code}: ${stderr}`)); });
      child.stdout.on("data", chunk => {
        if (String(chunk).includes("HTTPS server ready")) { clearTimeout(timer); done(); }
      });
    });
    return { origin, close, fetch: createPreviewFetch(origin, certificate.cert) };
  } catch (error) { await close(); throw error; }
}

const seedValues = { heightCm: [184, "cm"], inseamCm: [86, "cm"], weightKg: [80, "kg"],
  hipCircumferenceCm: [100, "cm"], sitBoneWidthMm: [122, "mm"], ftpWatts: [240, "W"],
  powerWatts: [220, "W"], speedKph: [30, "km/h"], bikeWeightKg: [9, "kg"], gradientPercent: [7, "%"],
  distanceKm: [12, "km"], durationMinutes: [150, "min"], temperatureC: [22, "°C"], bottleSizeMl: [750, "ml"],
  twentyMinuteWatts: [250, "W"], rampWatts: [320, "W"], bikeCategory: ["road", "none"],
  intensity: ["endurance", "none"], outerChainringTeeth: [50, "teeth"], innerChainringTeeth: [34, "teeth"],
  cassetteSmallestCogTeeth: [11, "teeth"], cassetteLargestCogTeeth: [34, "teeth"],
  tireWidthFrontMm: [28, "mm"], tireWidthRearMm: [28, "mm"], surface: ["average_asphalt", "none"], rimType: ["hooked", "none"] };

const expectedFirstValues = { home: 184, "saddle-height": 184, "frame-size": 184, "crank-length": 184,
  "saddle-width": 184, "bike-fit": 184, "tire-pressure": 80, gearing: 34,
  "climb-planner": 12, "power-speed": 220, "ftp-wkg": 240, "fuel-hydration": 2.5 };
const sliderValue = page => page.getByRole("slider").first().evaluate(node => Number(node.getAttribute("aria-valuenow") ?? node.value));

async function inspectExpandedStates(page, record, serverHtml, calculatorPaths, descriptor) {
  const capture = async state => {
    const metrics = await page.evaluate(measureDocument, { serverHtml, calculatorPaths,
      viewport: { width: record.width, height: record.height } });
    const axe = await new AxeBuilder({ page }).analyze();
    const filename = `${record.id}-${record.locale}-${record.width}-${state}.png`;
    await page.screenshot({ path: resolve(output, filename), fullPage: true, animations: "disabled" });
    record.stateScreenshots ??= [];
    record.stateScreenshots.push({ state, filename,
      hash: createHash("sha256").update(await readFile(resolve(output, filename))).digest("hex") });
    record.interactionChecks ??= [];
    record.interactionChecks.push({ state, numericInputs: metrics.numericInputs, smallTargets: metrics.smallTargets,
      violations: axe.violations, overflow: metrics.overflow,
      forbidden: metrics.forbidden, upgradeOverlays: metrics.upgradeOverlays, urgency: metrics.urgency });
    return metrics;
  };
  const menu = page.locator('[data-usability="menu-trigger"]:visible');
  if (record.width === 390 && await menu.count()) {
    await menu.click();
    await page.waitForTimeout(100);
    await capture("menu-open");
    await page.keyboard.press("Escape");
    if (await menu.getAttribute("aria-expanded") === "true") await menu.click();
  }
  const summaries = page.locator("main details:not([open]) > summary:visible");
  const initialOpen = await page.locator("main details").evaluateAll(nodes => nodes.map(node => node.open));
  let opened = 0;
  for (let index = 0; index < initialOpen.length && await summaries.count() > 0; index += 1) {
    await summaries.first().click();
    opened++;
  }
  if (opened) {
    await capture("details-open");
    await page.locator("main details").evaluateAll((nodes, states) =>
      nodes.forEach((node, index) => { node.open = states[index] ?? false; }), initialOpen);
  }
  if (descriptor.kind === "account" && descriptor.measurementKind
    && await page.locator('[data-usability="measurement-kind"]:visible').count() === 0) {
    const editor = descriptor.id.startsWith("welcome")
      ? page.locator('button[aria-controls="edit-heightCm"], button[aria-controls="edit-inseamCm"]').first()
      : page.getByRole("button", { name: record.locale === "nl"
        ? /^(Wijzig|Vul aan): Lichaamslengte$/ : /^(Change|Add detail): Body height$/ });
    if (!await editor.count()) throw new Error(`Required numeric measurement editor is missing: ${descriptor.id}`);
    await editor.click();
    await page.locator('[data-usability="measurement-kind"]:visible').waitFor();
    return capture("measurement-editor");
  }
}

async function stateChecks(page, descriptor, metrics, url, locale, record) {
  if (!["calculator", "home"].includes(descriptor.kind)) return;
  const screenshot = async state => {
    const stateMetrics = await page.evaluate(measureDocument, { serverHtml: "", calculatorPaths: [],
      viewport: { width: record.width, height: record.height } });
    const axe = await new AxeBuilder({ page }).analyze();
    record.interactionChecks ??= [];
    record.interactionChecks.push({ state, numericInputs: stateMetrics.numericInputs, smallTargets: stateMetrics.smallTargets,
      violations: axe.violations, overflow: stateMetrics.overflow,
      forbidden: stateMetrics.forbidden, upgradeOverlays: stateMetrics.upgradeOverlays, urgency: stateMetrics.urgency });
    const filename = `${descriptor.id}-${locale}-${metrics.width}-${state}.png`;
    await page.screenshot({ path: resolve(output, filename), fullPage: true, animations: "disabled" });
    record.stateScreenshots ??= [];
    record.stateScreenshots.push({ state, filename,
      hash: createHash("sha256").update(await readFile(resolve(output, filename))).digest("hex") });
  };
  const consent = page.getByRole("button", { name: locale === "nl" ? "Alleen essentieel" : "Essential only", exact: true });
  if (await consent.isVisible()) await consent.click();
  const reason = page.locator('[data-usability="account-reason"]:visible').first();
  if (await reason.count()) { await reason.scrollIntoViewIfNeeded(); await page.waitForTimeout(150); }
  const slider = page.getByRole("slider").first();
  if (await slider.count()) {
    const before = await sliderValue(page);
    await slider.focus();
    await slider.press("ArrowRight");
    await page.waitForTimeout(100);
    metrics.example.afterEdit = await page.locator('[data-usability="example"]:visible').count() > 0;
    metrics.example.inputChanged = await sliderValue(page) !== before;
    await screenshot("edited");
  }
  const next = calculators.find(candidate => candidate.calculator === descriptor.nextCalculator);
  metrics.nextMatches = !next ? metrics.nextLinks?.length > 0
    : (metrics.nextLinks ?? []).some(href => new URL(href, url).pathname === localizedPagePath(next, locale));
  if (next && metrics.nextMatches) {
    metrics.nextJourney = await verifyEditedHandoff(page, descriptor, next, locale, localizedPagePath);
    const nextReasons = await page.locator('[data-usability="account-reason"]:visible').evaluateAll(nodes =>
      nodes.map(node => node.getAttribute("data-reason-id")));
    metrics.nextJourney.differentReason = nextReasons.length > 0
      && nextReasons.every(id => id && !(metrics.accountReasonIds ?? []).includes(id));
    await screenshot("next-calculator");
    await page.goto(url, { waitUntil: "networkidle" });
  }
  await page.evaluate(({ values, calculator }) => {
    const entries = Object.entries(values).map(([field, [value, unit]]) => ({ field, value, unit, calculator,
      method: field === "inseamCm" || field === "sitBoneWidthMm" ? "measured" : "declared", touchedAt: Date.now() }));
    sessionStorage.setItem("bbf.handoff", JSON.stringify({ version: 1, entries }));
  }, { values: seedValues, calculator: descriptor.calculator ?? "saddle-height" });
  await page.goto(url, { waitUntil: "networkidle" });
  metrics.example.afterReuse = await page.locator('[data-usability="example"]:visible').count() > 0;
  const known = page.locator('[data-usability="known-values"]:visible');
  metrics.reuse = { known: await known.count() > 0,
    prefill: await page.getByText(locale === "nl" ? /Uit je eerdere invoer/ : /From your (?:earlier|previous) input/).count() > 0,
    actual: await sliderValue(page), expected: expectedFirstValues[descriptor.id] };
  metrics.reuse.valueMatches = metrics.reuse.actual === metrics.reuse.expected;
  const revisitedReasons = await page.locator('[data-usability="account-reason"]:visible').evaluateAll(nodes =>
    nodes.map(node => node.getAttribute("data-reason-id")));
  metrics.reasonSuppressedOnRevisit = !(metrics.accountReasonIds ?? []).some(id => revisitedReasons.includes(id));
  await screenshot("reused");
  if (descriptor.safetyStates) {
    metrics.safetyStates = [];
    for (const state of descriptor.safetyStates) {
      if (state.activate) await page.locator(state.activate).click();
      await page.locator(state.selector).waitFor();
      const safety = page.locator(state.selector).locator(`${state.safetySelector ?? '[data-usability="safety"]'}:visible`);
      const safetyText = await safety.allTextContents();
      metrics.safetyStates.push({ id: state.id, visible: safetyText.some(text => text.trim()), text: safetyText });
      await screenshot(state.id);
    }
    await page.goto(url, { waitUntil: "networkidle" });
  }
}

try {
  staleBuildSources = await findSourcesNewerThanBuild(root);
  let stamp;
  try { stamp = JSON.parse(await readFile(resolve(root, ".next/usability-provenance.json"), "utf8")); }
  catch { stamp = null; }
  buildProvenance = await verifyBuildProvenance(root, stamp);
  if (!buildProvenance.valid && !options.automatedOnly) throw new Error(buildProvenance.reason);
  if (staleBuildSources.length && !options.automatedOnly) {
    throw new Error(`Production build is stale; coordinate a rebuild: ${staleBuildSources.join(", ")}`);
  }
  production = options.local ? await startProduction() : { origin: localOrigin(options.origin), fetch, close: async () => {} };
  const manifest = await production.fetch(new URL(`/_next/static/${buildId}/_buildManifest.js`, production.origin));
  if (!manifest.ok || await manifest.text() !== await readFile(resolve(root, `.next/static/${buildId}/_buildManifest.js`), "utf8")) {
    throw new Error("Served production build does not match local BUILD_ID");
  }
  const needed = [...new Set(selected.map(page => page.fixture).filter(Boolean))];
  if (needed.length) {
    const { prepareUsabilityFixtures } = await import("./usability/fixtures.mjs");
    fixtures = await prepareUsabilityFixtures({ root, origin: production.origin, fetch: production.fetch, needed });
  }
  browser = await chromium.launch({ headless: true });
  const cases = selected.flatMap(descriptor => locales.flatMap(locale => viewports.map(viewport => ({ descriptor, locale, viewport }))));
  await runPool(cases, 4, async ({ descriptor, locale, viewport }) => {
    const record = { id: descriptor.id, owner: descriptor.owner, locale, ...viewport, board: descriptor.board,
      fixture: descriptor.fixture ?? null, checks: [], errors: [], expectedDiagnostics: [] };
    records.push(record);
    const origin = descriptor.fixture ? fixtures?.origins[descriptor.fixture] : production.origin;
    if (!origin) { record.errors.push(`Required ${descriptor.fixture} fixture unavailable`); return; }
    localOrigin(origin);
    const url = new URL(localizedPagePath(descriptor, locale), origin).href;
    record.url = url;
    const context = await browser.newContext({ viewport, locale, ignoreHTTPSErrors: true, serviceWorkers: "block",
      reducedMotion: "reduce", hasTouch: viewport.width === 390, isMobile: viewport.width === 390 });
    if (descriptor.id.startsWith("welcome") && descriptor.kind === "account") {
      const { welcomeHandoffFixture } = await import("./usability/fixtures.mjs");
      const handoff = welcomeHandoffFixture(Date.now());
      record.fixtureData = { state: "carried-body-measurements", storage: "sessionStorage", handoff };
      await context.addInitScript(({ fixtureOrigin, handoff }) => {
        if (location.origin === fixtureOrigin && /^\/(nl|en)\/welcome\/?$/.test(location.pathname)) {
          sessionStorage.setItem("bbf.handoff", JSON.stringify(handoff));
        }
      }, { fixtureOrigin: origin, handoff });
    }
    await context.route("**/*", route => {
      const request = new URL(route.request().url());
      if (request.origin !== origin || !["GET", "HEAD"].includes(route.request().method())) return route.abort();
      if (["/_vercel/insights/script.js", "/_vercel/speed-insights/script.js"].includes(request.pathname)) {
        return route.fulfill({ contentType: "application/javascript", body: "" });
      }
      return route.continue();
    });
    await context.routeWebSocket("**/*", socket => socket.close());
    const page = await context.newPage();
    page.on("pageerror", error => record.errors.push(error.message));
    page.on("console", message => {
      if (message.type() !== "error") return;
      const diagnostic = { type: "console", message: message.text() };
      const expected = classifyExpectedDiagnostic(diagnostic, { configuredConvexUrl: "http://127.0.0.1:9", pageUrl: url });
      if (expected) record.expectedDiagnostics.push(expected);
      else record.errors.push(message.text());
    });
    try {
      const response = await page.goto(url, { waitUntil: "networkidle", timeout: 30000 });
      if (!response?.ok()) throw new Error(`Page HTTP ${response?.status()}`);
      const serverHtml = await response.text();
      if (descriptor.fixture === "checkout") {
        await page.waitForFunction(() => Boolean(window.__usabilityFixtureReady));
        await page.evaluate(() => window.__usabilityFixtureReady);
        const actual = await page.evaluate(() => document.documentElement.dataset.usabilityFixtureState);
        if (actual !== descriptor.state) throw new Error(`Wrong checkout fixture state: ${actual}`);
      }
      await page.locator("h1").first().waitFor({ timeout: 10000 });
      if (descriptor.accessScenario) {
        const actual = await page.evaluate(() => document.documentElement.dataset.usabilityAccess);
        if (actual !== descriptor.accessScenario) throw new Error(`Wrong account access scenario: ${actual}`);
        record.accessScenario = actual;
      }
      await page.evaluate(() => document.fonts.ready);
      if (descriptor.fixture && !descriptor.path.includes("login") && /\/login(?:[/?]|$)/.test(page.url())) {
        throw new Error("Login redirect is not authenticated fixture coverage");
      }
      const metrics = await page.evaluate(measureDocument, { serverHtml, viewport,
        calculatorPaths: calculators.map(calculator => localizedPagePath(calculator, locale)) });
      const axe = await new AxeBuilder({ page }).analyze();
      metrics.contrast = axe.violations.filter(violation => violation.id === "color-contrast");
      record.accessibility = axe.violations;
      record.screenshot = `${descriptor.id}-${locale}-${viewport.width}.png`;
      await page.screenshot({ path: resolve(output, record.screenshot), fullPage: true, animations: "disabled" });
      record.screenshotHash = createHash("sha256").update(await readFile(resolve(output, record.screenshot))).digest("hex");
      const consent = page.getByRole("button", { name: locale === "nl" ? "Alleen essentieel" : "Essential only", exact: true });
      if (await consent.isVisible()) await consent.click();
      const editorMetrics = await inspectExpandedStates(page, record, serverHtml,
        calculators.map(calculator => localizedPagePath(calculator, locale)), descriptor);
      if (editorMetrics) metrics.measurementKinds = editorMetrics.measurementKinds;
      await stateChecks(page, descriptor, metrics, url, locale, record);
      record.metrics = metrics;
      record.checks = checkRules(descriptor, metrics);
      for (const state of record.interactionChecks ?? []) {
        record.checks.push({ rule: 9, status: state.numericInputs.length ? "fail" : "pass", evidence: state });
        record.checks.push({ rule: 12, status: state.upgradeOverlays.length || state.urgency.length ? "fail" : "pass", evidence: state });
        record.checks.push({ rule: 14, status: state.forbidden.length ? "fail" : "pass", evidence: state });
        record.checks.push({ rule: 15, status: state.smallTargets.length || state.overflow
          || state.violations.some(violation => violation.id === "color-contrast" || ["serious", "critical"].includes(violation.impact))
          ? "fail" : "pass", evidence: state });
      }
      record.evidenceHash = createHash("sha256").update(JSON.stringify({ metrics,
        screenshotHash: record.screenshotHash, states: record.stateScreenshots ?? [],
        interactions: record.interactionChecks ?? [] })).digest("hex");
      for (const required of manualRequirements(descriptor)) {
        const approved = verifyManualApproval(review, record, required,
          { buildId, sourceHash, evidenceHash: record.evidenceHash });
        record.checks.push({ ...required, status: approved ? "pass" : "manual",
          evidence: approved ? { reviewer: approved.reviewer, note: approved.note, screenshot: record.screenshot } : record.screenshot });
      }
      if (descriptor.manualRequired || descriptor.limitation) record.limitations = [descriptor.manualRequired ?? descriptor.limitation];
    } catch (error) { record.errors.push(String(error)); }
    finally { await context.close(); }
    console.log(`${descriptor.id} ${locale} ${viewport.width}: ${record.checks.filter(check => check.status === "fail").length} failed checks, ${record.errors.length} errors`);
  });
} catch (error) {
  fatalError = String(error);
  process.exitCode = 1;
} finally {
  for (const resource of [browser, fixtures, production]) {
    try { await resource?.close(); } catch (error) { fatalError = `${fatalError ?? ""} Cleanup: ${error}`; }
  }
  if (await sourceFingerprint(root) !== sourceHash) fatalError = "Source changed during this run; rerun on a frozen tree";
  const rules = summarize(records);
  if (["all", "U3"].includes(options.scope) && !options.filter) {
    const required = [...pressureSurfaces.filter(surface => !surface.pageId).map(surface => surface.board), "mail-pressure-text"];
    for (const surface of required) for (const locale of locales) {
      const evidence = review?.surfaces?.find(item => item.surface === surface && item.locale === locale);
      let approved = false;
      if (review?.buildId === buildId && review?.sourceHash === sourceHash && evidence?.reviewer?.trim()
        && evidence?.note?.trim() && evidence.status === "pass" && typeof evidence.file === "string"
        && resolve(evidence.file).startsWith(resolve(root, "plans/usability/renders") + "/")) {
        try {
          approved = createHash("sha256").update(await readFile(evidence.file)).digest("hex") === evidence.sha256;
        } catch { approved = false; }
      }
      rules[10].checks.push({ rule: 11, page: surface, locale, status: approved ? "pass" : "manual",
        evidence: approved ? evidence : "Rendered report/email pressure evidence required; no standalone route" });
      if (!approved && rules[10].status !== "fail") rules[10].status = "manual";
    }
  }
  const failed = Boolean(fatalError) || !buildProvenance?.valid || staleBuildSources.length > 0
    || records.length !== selected.length * locales.length * viewports.length
    || records.some(record => record.errors.length || !record.checks.length
    || record.accessibility?.some(violation => ["serious", "critical"].includes(violation.impact)))
    || rules.some(rule => rule.status === "fail");
  const manual = rules.some(rule => rule.status === "manual");
  const report = { buildId, sourceHash, scope: options.scope, filter: options.filter || null, generatedAt: new Date().toISOString(),
    automatedOnly: options.automatedOnly, passed: !failed && !manual && !options.filter, automatedPassed: !failed,
    fatalError, staleBuildSources, buildProvenance,
    requiredNonRouteSurfaces: pressureSurfaces.filter(surface => !surface.pageId),
    limitations: ["Loopback only; account/checkout fixtures do not prove backend authentication, persistence or payment.",
      "Manual checks require human-reviewed evidence tied to this build and exact screenshot hash.", ...(fixtures?.limitations ?? [])], rules, records };
  await writeFile(resolve(output, "report.json"), JSON.stringify(report, null, 2));
  await writeFile(resolve(output, "report.md"), `# Usability guard ${options.scope}\n\nBuild: ${buildId}\n\n`
    + rules.map(rule => `- Rule ${rule.rule}: **${rule.status}** — ${rule.title}`).join("\n")
    + `\n\n${records.length} page/locale/viewport cases. ${failed ? "Automated failures." : "Automated checks pass."} `
    + `${manual ? "Manual review outstanding; not release green." : "Manual review complete."}\n`);
  console.log(JSON.stringify({ output, cases: records.length, automatedPassed: !failed, manualOutstanding: manual,
    scopePassed: report.passed, releasePassed: report.passed && options.scope === "all" }, null, 2));
  if (failed || (!options.automatedOnly && (manual || options.filter))) process.exitCode = 1;
}
