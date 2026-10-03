#!/usr/bin/env node
import { mkdir, writeFile, readFile } from "node:fs/promises";
import { createServer } from "node:net";
import { get } from "node:https";
import { spawn } from "node:child_process";
import { once } from "node:events";
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";
import { JSDOM } from "jsdom";
import { chromium } from "playwright";
import { require as importTs } from "tsx/cjs/api";
import { createPreviewCertificate } from "../tests/visual/final-sweep/tls.mjs";

export function inspectHtml(html) {
  const dom = new JSDOM(html);
  const document = dom.window.document;
  const flatten = value => Array.isArray(value) ? value.flatMap(flatten)
    : value && typeof value === "object" ? [value, ...Object.values(value).flatMap(flatten)] : [];
  const schemas = [...document.querySelectorAll('script[type="application/ld+json"]')]
    .flatMap(node => { try { return flatten(JSON.parse(node.textContent)); } catch { return []; } });
  const content = (document.querySelector("main") ?? document.body).cloneNode(true);
  content.querySelectorAll("script,style,noscript").forEach(node => node.remove());
  const result = {
    titleCount: document.head.querySelectorAll("title").length,
    descriptionCount: document.head.querySelectorAll('meta[name="description"]').length,
    canonical: document.head.querySelector('link[rel="canonical"]')?.getAttribute("href"),
    alternatives: [...document.head.querySelectorAll('link[hreflang]')].map(node => ({
      locale: node.getAttribute("hreflang"), href: node.getAttribute("href"),
    })),
    text: content.textContent.replace(/\s+/g, " ").trim(),
    attributionText: [...content.querySelectorAll("[data-guide-attribution]")]
      .map(node => node.textContent.replace(/\s+/g, " ").trim()).join(" "),
    dates: [...content.querySelectorAll("time[datetime]")].map(node => node.getAttribute("datetime")),
    authorLinks: [...content.querySelectorAll('a[href*="/authors/"]')].map(node => node.getAttribute("href")),
    tables: [...content.querySelectorAll("table[data-pressure-setup]")].map(table => ({
      setup: table.getAttribute("data-pressure-setup"), rows: table.querySelectorAll("tbody tr").length,
      cells: [...table.querySelectorAll("tbody tr")].map(row => [...row.querySelectorAll("td,th")].map(cell => cell.textContent.trim())),
    })),
    schemas,
  };
  dom.window.close();
  return result;
}

export function calculatorSchemaFailures(schemas) {
  const types = schemas.flatMap(schema => schema["@type"] ?? []);
  const failures = [];
  for (const type of ["WebApplication", "SoftwareApplication"]) {
    if (types.includes(type)) failures.push(`forbidden ${type}`);
  }
  if (types.includes("AggregateRating") || schemas.some(schema => Object.hasOwn(schema, "aggregateRating"))) {
    failures.push("forbidden aggregateRating");
  }
  for (const type of ["WebPage", "BreadcrumbList", "FAQPage"]) {
    if (!types.includes(type)) failures.push(`missing ${type}`);
  }
  return failures;
}

async function startLocal() {
  const certificate = await createPreviewCertificate();
  const probe = createServer(); probe.listen(0, "127.0.0.1"); await once(probe, "listening");
  const port = probe.address().port; await new Promise(done => probe.close(done));
  const child = spawn(process.execPath, ["scripts/seo-crawl/server.mjs", String(port),
    certificate.keyPath, certificate.certPath], { stdio: ["ignore", "pipe", "inherit"], env: process.env });
  await new Promise((done, reject) => {
    const timer = setTimeout(() => reject(new Error("Local production server startup timeout")), 60000);
    child.once("error", reject);
    child.once("exit", code => reject(new Error(`Local server exited ${code}`)));
    child.stdout.on("data", data => {
      if (String(data).includes("HTTPS server ready")) { clearTimeout(timer); done(); }
    });
  });
  return { base: `https://127.0.0.1:${port}`, certificate,
    close: async () => { child.kill("SIGTERM"); await certificate.close(); } };
}

export async function runCheck() {
  const local = await startLocal(); // Uses the lead's existing production build; never builds or deploys.
  const audit = resolve("plans/seo-semrush/audit");
  const renders = resolve("plans/seo-semrush/renders");
  await mkdir(audit, { recursive: true }); await mkdir(renders, { recursive: true });
  const report = { startedAt: new Date().toISOString(), buildId: (await readFile(".next/BUILD_ID", "utf8")).trim(),
    calculators: [], pressure: [], redirects: [], pages: [], guides: [], legacyWithoutDate: [], screenshots: [], failures: [] };
  const check = (condition, message) => { if (!condition) report.failures.push(message); };
  const request = path => new Promise((done, reject) => {
    const req = get(new URL(path, local.base), { ca: local.certificate.cert, servername: "localhost",
      headers: { host: "bestbikefit4u.eu", "user-agent": "Screaming Frog SEO Spider/23.0" },
      signal: AbortSignal.timeout(45000) }, response => {
      let html = ""; response.setEncoding("utf8"); response.on("data", chunk => { html += chunk; });
      response.on("end", () => done({ status: response.statusCode, location: response.headers.location, html }));
    });
    req.on("error", reject);
  });
  const inspectPage = async path => {
    const response = await request(path);
    const parsed = inspectHtml(response.html);
    check(response.status === 200, `${path}: expected200 got${response.status}`);
    check(parsed.titleCount === 1 && parsed.descriptionCount === 1, `${path}: metadata missing/duplicated/outsidehead`);
    check(parsed.canonical === `https://bestbikefit4u.eu${path}`, `${path}: canonical ${parsed.canonical}`);
    check(parsed.schemas.some(schema => schema["@type"] === "Organization"), `${path}: missingOrganization`);
    for (const language of ["nl", "en"]) {
      check(parsed.alternatives.some(alternate => alternate.locale === language
        && alternate.href?.startsWith(`https://bestbikefit4u.eu/${language}/`)), `${path}: missing${language}hreflang`);
    }
    for (const schema of parsed.schemas.filter(item => ["Person", "Organization"].includes(item["@type"]))) {
      check(Array.isArray(schema.sameAs) && schema.sameAs.length === 0, `${path}: sameAs must be empty`);
    }
    return { path, status: response.status, ...parsed };
  };
  let browser;
  try {
    const { getSitemapNodes } = importTs("../src/lib/seo/sitemap/sources.ts", import.meta.url);
    const calculatorPaths = getSitemapNodes("calculators").map(node => new URL(node.loc).pathname)
      .filter(path => /^\/(?:en|nl)\/(?:calculators\/|(?:tire-pressure|bandenspanning)-calculator$)/.test(path));
    check(calculatorPaths.length === 22, "expected eleven calculators in both locales");
    for (const path of calculatorPaths) {
      const page = await inspectPage(path);
      for (const failure of calculatorSchemaFailures(page.schemas)) check(false, `${path}: ${failure}`);
      report.calculators.push({ path, status: page.status,
        schemaTypes: page.schemas.flatMap(schema => schema["@type"] ?? []) });
    }
    console.log(`Calculator schema checks: ${report.calculators.length}`);
    const { WEIGHT_STEPS, EN_BIKE_TYPES, NL_TO_EN } = importTs(
      "../src/lib/seo/programmatic/tirePressure.ts", import.meta.url);
    const { listGuideRewrites } = importTs("../src/lib/guides/rewrites.ts", import.meta.url);
    const { getGuideBacklog } = importTs("../src/lib/guides/backlog.ts", import.meta.url);
    const nlType = bike => Object.keys(NL_TO_EN).find(key => NL_TO_EN[key] === bike);
    for (const locale of ["nl", "en"]) for (const bike of EN_BIKE_TYPES) {
      const destination = locale === "nl" ? `/nl/bandenspanning/${nlType(bike)}` : `/en/tire-pressure/${bike}`;
      const page = await inspectPage(destination);
      check(page.tables.length === 2 && page.tables.every(table => table.rows === 10), `${destination}: expected2x10rows`);
      for (const table of page.tables) check(table.cells.every((cells, index) =>
        cells[0].includes(String(WEIGHT_STEPS[index]))), `${destination}: incorrect weight order`);
      report.pressure.push(page);
      console.log(`Pressure ${destination}: ${page.status}`);
      for (const weight of WEIGHT_STEPS) {
        const path = locale === "nl" ? `/nl/bandenspanning/${weight}kg-${nlType(bike)}`
          : `/en/tire-pressure/${weight}kg-${bike}`;
        const response = await request(path);
        const target = response.location && new URL(response.location, local.base).pathname;
        const final = target ? await request(target) : { status: 0 };
        check(response.status === 301 && target === destination && final.status === 200,
          `${path}: expected single301 ${destination}, got${response.status} ${target} then${final.status}`);
        report.redirects.push({ path, status: response.status, target, finalStatus: final.status });
      }
    }
    for (const [path, destination] of [
      ["/nl/tire-pressure/70kg-road-bike", "/nl/bandenspanning/racefiets"],
      ["/en/bandenspanning/70kg-racefiets", "/en/tire-pressure/road-bike"],
      ["/nl/tire-pressure/gravel-bike", "/nl/bandenspanning/gravelbike"],
      ["/en/bandenspanning/gravelbike", "/en/tire-pressure/gravel-bike"],
      ["/nl/bandenspanning/mtb", "/nl/bandenspanning/mountainbike"],
    ]) {
      const response = await request(path);
      const target = response.location && new URL(response.location, local.base).pathname;
      const final = target ? await request(target) : { status: 0 };
      check(response.status === 301 && target === destination && final.status === 200, `${path}: aliasredirectfailed`);
      report.redirects.push({ path, status: response.status, target, finalStatus: final.status });
    }
    for (const locale of ["nl", "en"]) {
      for (const path of ["/authors/ortwin-verreck", "/methods"]) report.pages.push(await inspectPage(`/${locale}${path}`));
      const rewrites = new Map(listGuideRewrites().map(guide => [guide.slug, guide]));
      for (const entry of getGuideBacklog(locale).filter(entry => entry.path.startsWith("/guides/"))) {
        const page = await inspectPage(`/${locale}/guides/${entry.slug}`);
        const expectedDate = rewrites.get(entry.slug)?.updatedAt;
        check(page.authorLinks.includes(`/${locale}/authors/ortwin-verreck`), `${page.path}: missingauthorlink`);
        check(!/reviewed by|beoordeeld door|gereviewd door/i.test(page.attributionText), `${page.path}: unsupportedreviewclaim`);
        const articles = page.schemas.filter(schema => schema["@type"] === "Article");
        check(articles.some(schema => schema.author?.name === "Ortwin Verreck"), `${page.path}: missingarticleauthor`);
        check(articles.every(schema => !schema.reviewedBy && !schema.dateReviewed), `${page.path}: reviewschema`);
        if (expectedDate) {
          check(page.dates.includes(expectedDate), `${page.path}: missingrealdate ${expectedDate}`);
          check(articles.some(schema => schema.dateModified === expectedDate), `${page.path}: dateModified mismatch`);
        } else report.legacyWithoutDate.push({ path: page.path, dates: page.dates, reason: "No dated static rewrite record" });
        report.guides.push({ ...page, expectedDate });
        if (report.guides.length % 12 === 0) console.log(`Guides checked: ${report.guides.length}`);
      }
    }
    browser = await chromium.launch({ headless: true });
    for (const locale of ["nl", "en"]) for (const width of [1440, 390]) {
      const context = await browser.newContext({ viewport: { width, height: 1000 }, ignoreHTTPSErrors: true });
      const page = await context.newPage();
      for (const [template, path] of [["pressure", locale === "nl" ? "/bandenspanning/racefiets" : "/tire-pressure/road-bike"],
        ["guide", "/guides/saddle-height-guide"]]) {
        const response = await page.goto(`${local.base}/${locale}${path}`, { waitUntil: "networkidle" });
        check(response?.status() === 200, `${locale}${path}: screenshotstatus`);
        await page.evaluate(() => document.fonts.ready);
        check(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), `${locale}${path}@${width}: overflow`);
        const filename = `S12-S13-${template}-${locale}-${width}.png`;
        await page.screenshot({ path: resolve(renders, filename), fullPage: true });
        report.screenshots.push(filename);
      }
      await context.close();
    }
  } catch (error) {
    report.failures.push(`Harness error: ${error instanceof Error ? error.message : String(error)}`);
    throw error;
  } finally {
    await browser?.close(); await local.close();
    report.finishedAt = new Date().toISOString();
    await writeFile(resolve(audit, "S12-S13-raw-html.json"), JSON.stringify(report, null, 2) + "\n");
    await writeFile(resolve(audit, "S12-S13-check-notes.md"),
      `# S12/S13 production-build checks\n\nBuild: ${report.buildId}\n\n`
      + `Calculator locales: ${report.calculators.length}.\n`
      + `Pressure pages: ${report.pressure.length}; redirects: ${report.redirects.length}; guide locales: ${report.guides.length}.\n`
      + `Legacy guide locales without a dated static rewrite: ${report.legacyWithoutDate.length}. No date is invented.\n`
      + `Screenshots: ${report.screenshots.length}. Failures: ${report.failures.length}.\n\n`
      + report.failures.map(value => `- ${value}`).join("\n") + "\n");
  }
  if (report.failures.length) throw new Error(`${report.failures.length} S12/S13 checks failed; see audit JSON`);
  console.log(`S12/S13: ${report.pressure.length} pressure, ${report.redirects.length} redirects, ${report.guides.length} guide locales passed`);
}
if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) await runCheck();
