import assert from "node:assert/strict";
import { createServer } from "node:http";
import { createHash } from "node:crypto";
import { readFile, mkdir, writeFile } from "node:fs/promises";
import { resolve, extname, dirname } from "node:path";
import { build } from "esbuild";
import postcss from "postcss";
import tailwind from "@tailwindcss/postcss";
import { chromium } from "playwright";
import AxeBuilder from "@axe-core/playwright";

const root = "/Users/ortwinverreck/Developer/bikefitboost-stripe";
const folder = `${root}/tests/visual/stripe-live-s2`;
const output = `${root}/plans/feature-stripe-live-release/renders`;
const audit = `${root}/plans/feature-stripe-live-release/audit/S2-visual.json`;
const captureRequested = process.argv.includes("--capture");
assert(process.argv.slice(2).every(value => ["--prepare", "--capture"].includes(value)), "Use --prepare or --capture");
const cases = ["off", "on"].flatMap(flag => ["pricing", "checkout"].flatMap(surface =>
  ["nl", "en"].flatMap(locale => [1440, 390].map(width => ({ flag, surface, locale, width })))));
const hashes = new Map();
async function track(path) {
  const hash = createHash("sha256").update(await readFile(path)).digest("hex");
  if (hashes.has(path)) assert.equal(hashes.get(path), hash, `Source changed while bundling: ${path}`);
  hashes.set(path, hash);
}
const bundles = {};
for (const flag of ["off", "on"]) {
  const bundle = await build({
    absWorkingDir: root, entryPoints: [`${folder}/entry.jsx`], bundle: true, metafile: true,
    write: false, outdir: `${folder}/.memory`, format: "esm", platform: "browser",
    jsx: "automatic", logLevel: "error",
    define: {
      "process.env": "{}", "process.env.NODE_ENV": '"production"',
      "process.env.NEXT_PUBLIC_PERSONAL_FIT_SALES_ENABLED": flag === "on" ? '"true"' : "undefined",
      "process.env.PERSONAL_FIT_SALES_ENABLED": flag === "on" ? '"true"' : "undefined",
    },
    plugins: [{ name: "s2-isolated-boundaries", setup(builder) {
      builder.onLoad({ filter: /\.(tsx?|jsx?|css)$/ }, async args => {
        if (!args.path.includes("/node_modules/")) await track(args.path);
        return undefined;
      });
      builder.onResolve({ filter: /^next\/link$/ }, () => ({ path: `${root}/tests/visual/account-batch1/link.jsx` }));
      builder.onResolve({ filter: /^next\/image$/ }, () => ({ path: `${root}/tests/visual/account-batch1/image.jsx` }));
      builder.onResolve({ filter: /^(@\/i18n\/(request|metadata)|@\/components\/(analytics\/(MarketingEventTracker|TrackedCtaLink)|seo\/JsonLd))$/ }, () => ({ path: `${root}/tests/visual/pricing-ui/runtime.jsx` }));
      builder.onResolve({ filter: /^@\/components\/ui$/ }, () => ({ path: `${root}/tests/visual/pricing-ui/ui.jsx` }));
    } }],
  });
  bundles[flag] = {
    script: bundle.outputFiles.find(file => file.path.endsWith(".js")).contents,
    css: bundle.outputFiles.filter(file => file.path.endsWith(".css")).map(file => file.text).join("\n"),
  };
  assert(bundles[flag].css.includes("annualColumn") && bundles[flag].css.includes("summaryDetails"), "Real pricing and checkout styles required");
}
const globals = `${root}/src/app/globals.css`;
await track(globals);
const styles = await postcss([tailwind({ base: root })]).process(await readFile(globals, "utf8"), { from: globals });
const fonts = "@font-face{font-family:Figtree;src:url('/brand/report/fonts/figtree-latin.woff2')}@font-face{font-family:Bricolage;src:url('/brand/report/fonts/bricolage-grotesque-latin.woff2')}@font-face{font-family:DMMono;src:url('/brand/report/fonts/dm-mono-latin.woff2')}html{--font-body:Figtree;--font-display:Bricolage;--font-mono:DMMono;--font-data:DMMono}body{font-family:Figtree,sans-serif}";
if (!captureRequested) {
  console.log(JSON.stringify({ prepared: true, cases: cases.length, bundles: Object.keys(bundles), captures: 0, waitingForUiOwner: true }));
  process.exit(0);
}
await mkdir(output, { recursive: true });
const server = createServer(async (request, response) => {
  try {
    const url = new URL(request.url, "http://localhost");
    const flag = url.searchParams.get("flag") === "on" ? "on" : "off";
    if (url.pathname === "/fixture.js") { response.setHeader("Content-Type", "text/javascript"); response.end(bundles[flag].script); return; }
    if (url.pathname === "/fixture.css") { response.setHeader("Content-Type", "text/css"); response.end(styles.css + bundles[flag].css + fonts); return; }
    if (url.pathname.startsWith("/api/")) { response.writeHead(404); response.end(); return; }
    if (extname(url.pathname)) {
      const asset = resolve(root, "public", `.${decodeURIComponent(url.pathname)}`);
      assert(asset.startsWith(`${root}/public/`), "Invalid asset path");
      response.setHeader("Content-Type", ({ ".woff2": "font/woff2", ".svg": "image/svg+xml", ".png": "image/png", ".webp": "image/webp" })[extname(asset)] ?? "application/octet-stream");
      response.end(await readFile(asset)); return;
    }
    response.setHeader("Content-Type", "text/html");
    response.end(`<!doctype html><html lang="nl"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><link rel="stylesheet" href="/fixture.css?flag=${flag}"><title>S2 personal fit sales fixture</title></head><body><div id="root"></div><script type="module" src="/fixture.js?flag=${flag}"></script></body></html>`);
  } catch { response.writeHead(500); response.end("Fixture asset error"); }
});
await new Promise((done, reject) => { server.once("error", reject); server.listen(0, "127.0.0.1", done); });
const origin = `http://127.0.0.1:${server.address().port}`;
const results = [];
let browser;
let changedSources = [];
try {
  browser = await chromium.launch({ headless: true });
  for (const scenario of cases) {
    const { flag, surface, locale, width } = scenario;
    const context = await browser.newContext({ viewport: { width, height: width === 390 ? 844 : 1000 }, locale, reducedMotion: "reduce", colorScheme: "light", serviceWorkers: "block" });
    const result = { ...scenario, screenshot: `${output}/S2-${surface}-${flag}-${locale}-${width}.png`, errors: [], blockedRequests: [], assertions: [] };
    results.push(result);
    await context.route("**/*", route => {
      const url = new URL(route.request().url());
      if (url.origin !== origin || url.pathname.startsWith("/api/")) {
        result.blockedRequests.push(url.href);
        return route.abort();
      }
      return route.continue();
    });
    const page = await context.newPage();
    page.on("pageerror", error => result.errors.push(error.message));
    page.on("console", message => { if (message.type() === "error") result.errors.push(message.text()); });
    const check = (name, passed) => result.assertions.push({ name, passed });
    try {
      await page.goto(`${origin}/?${new URLSearchParams({ flag, surface, locale })}`, { waitUntil: "networkidle" });
      await page.getByRole("heading", { level: 1 }).waitFor();
      await page.evaluate(() => document.fonts.ready);
      check("public flag matches case", await page.evaluate(() => window.__fixture.visible) === (flag === "on"));
      const body = await page.locator("body").innerText();
      if (flag === "on") check("no bracketed appointment placeholders", !/\[(?:LOCATIE|DUUR AFSPRAAK|VOORWAARDEN AFSPRAAK[^\]]*|AGENDALINK|LOCATION|APPOINTMENT[^\]]*|DURATION|AGENDA[^\]]*)\]/i.test(body));
      const soon = locale === "nl" ? /binnenkort beschikbaar/i : /available soon/i;
      if (surface === "pricing") {
        const cards = page.locator('[data-product="annual_personal"]:visible');
        check("personal card visible", await cards.count() > 0);
        for (const card of await cards.all()) {
          check("personal card sales state", flag === "off" ? soon.test(await card.innerText()) && await card.locator('a[href],button:not(:disabled)').count() === 0 : await card.locator('a[href*="checkout"]').count() > 0);
        }
        if (flag === "off") check("no personal purchase links", await page.locator('a[href*="checkout"][href*="personal"]:visible').count() === 0);
      } else {
        for (const product of ["personal", "personal_fit_standalone"]) {
          const radio = page.locator(`input[type="radio"][value="${product}"]`);
          check(`${product} selection state`, await radio.count() === 1 && await radio.isDisabled() === (flag === "off"));
          if (await radio.count()) {
            const card = page.locator("label").filter({ has: radio });
            if (flag === "off") check(`${product} available soon without buy button`, soon.test(await card.innerText()) && await card.locator('a[href],button:not(:disabled)').count() === 0);
          }
        }
        check("still on checkout step one", await page.locator('input[type="radio"][value="annual"]').isChecked());
      }
      result.metrics = await page.evaluate(() => ({ overflow: document.documentElement.scrollWidth > innerWidth, scrollWidth: document.documentElement.scrollWidth, viewport: innerWidth, fontsReady: document.fonts.status === "loaded" }));
      result.axe = (await new AxeBuilder({ page }).analyze()).violations.map(({ id, impact, nodes }) => ({ id, impact, nodes: nodes.map(({ target, failureSummary }) => ({ target, failureSummary })) }));
      result.calls = await page.evaluate(() => window.__fixture.calls);
      check("no auth or payment calls", result.calls.length === 0);
      await page.evaluate(() => scrollTo(0, 0));
      await page.screenshot({ path: result.screenshot, fullPage: true, animations: "disabled" });
    } catch (error) { result.errors.push(String(error)); }
    await context.close();
    console.log(`Captured ${results.length}/${cases.length}: ${surface} ${flag} ${locale} ${width}`);
  }
} finally {
  await browser?.close();
  await new Promise(done => server.close(done));
  for (const [path, hash] of hashes) {
    if (createHash("sha256").update(await readFile(path)).digest("hex") !== hash) changedSources.push(path);
  }
  await mkdir(dirname(audit), { recursive: true });
  await writeFile(audit, JSON.stringify({ scope: "Isolated real PricingPage and CheckoutFlow step one; mocked authenticated/eligible props and framework/analytics adapters. No live auth, Stripe, backend, mail, Next build or hydration proof. OFF flags are unset; ON flags are exact true. No axe rules disabled.", capturedAt: new Date().toISOString(), expectedCaptures: 16, sourceHashes: Object.fromEntries(hashes), changedSources, results }, null, 2));
}
const failures = results.filter(result => result.errors.length || result.blockedRequests.length || !result.metrics || result.metrics.overflow || !result.metrics.fontsReady || !result.axe || result.axe.length || result.assertions.some(item => !item.passed));
console.log(JSON.stringify({ captures: results.length, failures: failures.length, changedSources, audit, failedCases: failures }, null, 2));
if (failures.length || changedSources.length || results.length !== 16) process.exitCode = 1;
