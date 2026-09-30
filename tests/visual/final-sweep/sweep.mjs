#!/usr/bin/env node
import { mkdir, writeFile, appendFile, readFile } from "node:fs/promises";
import { resolve, relative } from "node:path";
import { chromium } from "playwright";
import { prepareProduction } from "./production.mjs";
import { routes as inventory, resolveRoutes, discoverBlogSlug, locales, viewports } from "./routes.mjs";
import { prepareAccountFixtures } from "./account-fixture.mjs";
import { checkPage, CHECK_NAMES } from "./checks.mjs";
import { writeReports } from "./report.mjs";

const root = process.cwd();
const args = process.argv.slice(2);
const option = (name, fallback) => args.find((arg) => arg.startsWith(`--${name}=`))?.split("=").slice(1).join("=")
  ?? fallback;
const outputDir = resolve(root, option("output", "plans/redesign-canvas/final-sweep"));
const filter = option("filter", "");
const concurrency = Math.max(1, Math.min(6, Number(option("workers", "3"))));
const withoutAxe = args.includes("--without-axe");
const metadata = {
  inventory: "plans/redesign-canvas/audit/route-map.md", inventoryRoutes: inventory.length,
  scope: "70 audited non-admin routes; later /design-system excluded.",
  billing: "STRIPE_BILLING_ENABLED=false, NEXT_PUBLIC_STRIPE_BILLING_ENABLED=false (process env only)",
  browser: "Chromium; light theme; reduced motion; 1440x1000 and 390x844; viewport screenshots",
  filtering: filter || null, concurrency, label: option("label", null),
  limitations: [
    "Account fixtures test actual UI with mocked auth/Convex; not backend authorization or persistence.",
    "Small UI-word language detector is heuristic, not a complete translation audit.",
    "Automated axe serious/critical checks do not establish full accessibility conformance.",
    "Initial route states only; this sweep does not submit forms or exercise destructive actions.",
    "Local preview lacks Vercel analytics endpoints; resulting console errors remain failures.",
    "Expected document-404 console diagnostics are retained separately, not treated as unexpected errors.",
    "Production uses the established custom Next server; next start caused a self-redirect loop in this preview.",
  ],
};
let production;
let accounts;
let blog;
let browser;
let axeBuilder;
const results = [];
await mkdir(outputDir, { recursive: true });
await writeFile(resolve(outputDir, "results.jsonl"), "");
try {
  if (!withoutAxe) {
    try {
      axeBuilder = (await import("@axe-core/playwright")).default;
      const adapterPath = resolve(root, "node_modules/@axe-core/playwright/package.json");
      const adapter = JSON.parse(await readFile(adapterPath, "utf8"));
      metadata.axe = { adapter: "@axe-core/playwright", version: adapter.version, impacts: ["serious", "critical"] };
    }
    catch { throw new Error("@axe-core/playwright is not installed. Obtain lead approval before adding it."); }
  } else {
    metadata.limitations.push(
      "Axe explicitly disabled by --without-axe; accessibility checks are skipped, not passed.",
    );
  }
  production = await prepareProduction({ root, outputDir, port: Number(option("port", "4321")) });
  metadata.production = {
    origin: production.origin, sourceHash: production.sourceHash, buildId: production.buildId,
    snapshot: production.snapshot, reused: production.reused,
  };
  let blogSlug;
  try { blogSlug = await discoverBlogSlug(production.origin); }
  catch (error) { metadata.limitations.push(`CMS blog discovery failed: ${error.message}`); }
  metadata.blog = blogSlug ? { mode: "production", slug: blogSlug }
    : { mode: "fixture", reason: "No published CMS slug available; existing visual-article-1 fixture." };
  const routes = resolveRoutes({ blogSlug }).filter((route) => !filter || route.sourceRoute.includes(filter));
  if (!routes.length) throw new Error(`No routes match filter ${filter}`);
  if (routes.some((route) => route.fixture === "account")) {
    accounts = await prepareAccountFixtures({ root: production.snapshot, origin: production.origin });
    metadata.limitations.push(...accounts.limitations);
  }
  if (routes.some((route) => route.fixture === "blog")) {
    const { prepareBlogFixture } = await import("./blog-fixture.mjs");
    blog = await prepareBlogFixture({ root: production.snapshot, origin: production.origin });
    metadata.limitations.push(...blog.limitations);
  }
  browser = await chromium.launch({ headless: true });
  const matrix = routes.flatMap((route) => locales.flatMap((locale) => viewports.map((viewportWidth) => ({
    route, locale, viewportWidth,
  }))));
  let cursor = 0;
  async function capture({ route, locale, viewportWidth }) {
    const fixture = route.fixture === "account" ? accounts : route.fixture === "blog" ? blog : null;
    const url = `${fixture?.origin ?? production.origin}${route.paths[locale]}`;
    const expected = route.expected[locale];
    const name = `${route.id.replaceAll(/[^a-z0-9-]/gi, "")}-${locale}-${viewportWidth}.png`;
    const screenshot = resolve(outputDir, name);
    const entry = { route: route.sourceRoute, locale, viewportWidth, url, expected,
      mode: fixture ? `${route.fixture}-fixture` : "production", screenshot: relative(outputDir, screenshot) };
    const context = await browser.newContext({ viewport: { width: viewportWidth,
      height: viewportWidth === 390 ? 844 : 1000 }, locale: locale === "nl" ? "nl-NL" : "en-GB",
      colorScheme: "light", reducedMotion: "reduce", deviceScaleFactor: 1 });
    const page = await context.newPage();
    const errors = [];
    const documents = [];
    page.on("pageerror", (error) => errors.push({ type: "pageerror", message: error.message }));
    page.on("console", (message) => {
      if (message.type() === "error") errors.push({ type: "console", message: message.text(),
        location: message.location() });
    });
    page.on("response", (response) => {
      if (response.request().isNavigationRequest() && response.frame() === page.mainFrame()) {
        documents.push({ url: response.url(), status: response.status(), location: response.headers().location });
      }
    });
    try {
      const response = await page.goto(url, { waitUntil: "load", timeout: 60000 });
      if (fixture) await page.waitForFunction(() => window.__visualReady === true, null, { timeout: 20000 });
      await page.evaluate(() => document.fonts.ready);
      await page.waitForTimeout(700);
      const consent = page.getByRole("button", {
        name: /^(Alleen essentieel|Essential only|Alleen noodzakelijk|Necessary only)$/i,
      });
      if (await consent.count() && await consent.first().isVisible()) await consent.first().click();
      await page.evaluate(async () => {
        for (const image of document.images) image.loading = "eager";
        await Promise.race([
          Promise.all([...document.images].map((image) => image.decode().catch(() => {}))),
          new Promise((done) => setTimeout(done, 6000)),
        ]);
        scrollTo(0, 0);
      });
      let axeResults;
      let axeUnavailableReason = withoutAxe
        ? "Explicit --without-axe; accessibility analysis disabled for this run." : null;
      if (axeBuilder && expected.status !== 404) {
        try { axeResults = await new axeBuilder({ page }).analyze(); }
        catch (error) {
          errors.push({ type: "axe-runner", message: error.message });
          axeUnavailableReason = `Axe execution failed: ${error.message}`;
        }
      }
      entry.axeEngineVersion = axeResults?.testEngine?.version;
      const fixtureQueries = fixture ? await page.evaluate(() => ({
        queries: window.__visualQueries ?? [], unknown: window.__visualUnknownQueries ?? [],
      })) : undefined;
      if (fixtureQueries?.unknown.length) errors.push({ type: "fixture-query", queries: fixtureQueries.unknown });
      entry.documents = documents;
      entry.finalUrl = page.url();
      entry.fixtureQueries = fixtureQueries;
      entry.consoleErrors = errors;
      entry.expectedConsoleDiagnostics = errors.filter((error) => expected.status === 404
        && error.type === "console" && error.location?.url === url
        && /^Failed to load resource: the server responded with a status of 404/.test(error.message));
      const unexpectedErrors = errors.filter((error) => !entry.expectedConsoleDiagnostics.includes(error));
      entry.checks = await checkPage(page, {
        locale, viewportWidth, publicPage: route.kind === "public", errors: unexpectedErrors,
        requiredAlternateLocales: ["/bike-fitting", "/bikefitting"].includes(route.sourceRoute) ? [locale] : locales,
        expectedStatus: expected.status, status: documents[0]?.status ?? response?.status() ?? 0,
        expectedRedirect: expected.redirectTo, finalUrl: page.url(), axeResults, axeUnavailableReason,
        seoUnavailableReason: route.fixture === "blog"
          ? "CMS fixture renders actual content; production metadata injection is not exercised." : null,
      });
      if (expected.redirectTo && response?.status() !== 200) {
        entry.checks.status.status = "fail";
        entry.checks.status.details.push(`Redirect destination returned HTTP ${response?.status()}`);
      }
      await page.screenshot({ path: screenshot, fullPage: false, animations: "disabled", timeout: 20000 });
    } catch (error) {
      entry.checks = Object.fromEntries(CHECK_NAMES.map((key) => [key, {
        status: key === "errors" ? "fail" : "skip", details: [`Capture failed: ${error.message}`],
      }]));
      entry.consoleErrors = errors;
      entry.documents = documents;
      await page.screenshot({ path: screenshot, fullPage: false, timeout: 10000 }).catch(() => {
        entry.screenshot = null;
      });
    } finally {
      await context.close();
    }
    results.push(entry);
    const completed = results.length;
    await appendFile(resolve(outputDir, "results.jsonl"), JSON.stringify(entry) + "\n");
    console.log(JSON.stringify({ completed, total: matrix.length, route: entry.route, locale,
      width: viewportWidth, failed: CHECK_NAMES.filter((key) => entry.checks[key].status === "fail") }));
  }
  await Promise.all(Array.from({ length: concurrency }, async () => {
    while (cursor < matrix.length) {
      const current = matrix[cursor++];
      await capture(current);
    }
  }));
  const order = new Map(routes.map((route, index) => [route.sourceRoute, index]));
  results.sort((a, b) => order.get(a.route) - order.get(b.route)
    || locales.indexOf(a.locale) - locales.indexOf(b.locale)
    || viewports.indexOf(a.viewportWidth) - viewports.indexOf(b.viewportWidth));
  const summary = await writeReports({ results, outputDir, metadata });
  console.log(JSON.stringify(summary, null, 2));
  if (summary.failingCases) process.exitCode = 1;
} catch (error) {
  metadata.fatalError = error.stack;
  await writeReports({ results, outputDir, metadata });
  console.error(error);
  process.exitCode = 2;
} finally {
  await browser?.close();
  await blog?.close();
  await accounts?.close();
  await production?.close();
  await writeFile(resolve(outputDir, "run-context.json"), JSON.stringify(metadata, null, 2) + "\n");
}
