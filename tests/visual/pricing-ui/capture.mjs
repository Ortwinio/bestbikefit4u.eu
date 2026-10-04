import assert from "node:assert/strict";
import { createServer } from "node:http";
import { createHash } from "node:crypto";
import { readFile, mkdir, writeFile } from "node:fs/promises";
import { resolve, extname } from "node:path";
import { fileURLToPath } from "node:url";
import { build } from "esbuild";
import postcss from "postcss";
import tailwind from "@tailwindcss/postcss";
import { chromium } from "playwright";
import AxeBuilder from "@axe-core/playwright";
import { scenarios } from "./cases.mjs";

const root = fileURLToPath(new URL("../../../", import.meta.url));
const folder = resolve(root, "tests/visual/pricing-ui");
const output = resolve(root, "plans/pricing-stripe/renders");
const filter = process.argv.find(argument => argument.startsWith("--cases="))?.slice(8).split(",");
const selected = filter ? scenarios.filter(scenario => filter.includes(scenario.id)) : scenarios;
assert(selected.length > 0, "No selected scenarios");
const audit = resolve(root, `plans/pricing-stripe/audit/S3-visual${filter ? "-smoke" : ""}.json`);
await mkdir(output, { recursive: true });
const trackedSources = ["src/app/(public)/pricing/page.tsx", "src/app/(public)/pricing/pricing.module.css", "src/components/pricing/PricingCard.tsx", "src/components/pricing/PricingCard.module.css", "src/components/checkout/CheckoutFlow.tsx", "src/components/checkout/CheckoutFlow.module.css", "src/components/account/SubscriptionOverview.tsx", "src/i18n/marketing/pricing.ts", "src/i18n/marketing/checkout.ts", "src/i18n/account/subscription.ts", "shared/pricing/products.ts", "src/app/globals.css"];
async function sourceHashes() {
  return Object.fromEntries(await Promise.all(trackedSources.map(async path => [path, createHash("sha256").update(await readFile(resolve(root, path))).digest("hex")])));
}
const before = await sourceHashes();
const bundle = await build({
  absWorkingDir: root, entryPoints: [resolve(folder, "entry.jsx")], bundle: true,
  write: false, outdir: resolve(folder, ".memory"), format: "esm", platform: "browser",
  jsx: "automatic", logLevel: "error", define: { "process.env": "{}", "process.env.NODE_ENV": '"production"' },
  plugins: [{ name: "pricing-fixture-boundaries", setup(builder) {
    builder.onResolve({ filter: /^next\/link$/ }, () => ({ path: resolve(root, "tests/visual/account-batch1/link.jsx") }));
    builder.onResolve({ filter: /^next\/image$/ }, () => ({ path: resolve(root, "tests/visual/account-batch1/image.jsx") }));
    builder.onResolve({ filter: /^(@\/i18n\/(request|metadata)|@\/components\/(analytics\/(MarketingEventTracker|TrackedCtaLink)|seo\/JsonLd))$/ }, () => ({ path: resolve(folder, "runtime.jsx") }));
    builder.onResolve({ filter: /^@\/components\/ui$/ }, () => ({ path: resolve(folder, "ui.jsx") }));
  } }],
});
const script = bundle.outputFiles.find(file => file.path.endsWith(".js")).contents;
const moduleCss = bundle.outputFiles.filter(file => file.path.endsWith(".css")).map(file => file.text).join("\n");
assert(moduleCss.includes("summaryDetails") && moduleCss.includes("annualColumn"), "Real checkout and pricing CSS modules must be bundled");
const globals = resolve(root, "src/app/globals.css");
const styles = await postcss([tailwind({ base: root })]).process(await readFile(globals, "utf8"), { from: globals });
const fonts = "@font-face{font-family:Figtree;src:url('/brand/report/fonts/figtree-latin.woff2')}@font-face{font-family:Bricolage;src:url('/brand/report/fonts/bricolage-grotesque-latin.woff2')}@font-face{font-family:DMMono;src:url('/brand/report/fonts/dm-mono-latin.woff2')}html{--font-body:Figtree;--font-display:Bricolage;--font-mono:DMMono;--font-data:DMMono}body{font-family:Figtree,sans-serif}";
const server = createServer(async (request, response) => {
  try {
    const pathname = new URL(request.url, "http://localhost").pathname;
    if (pathname === "/fixture.js") { response.setHeader("Content-Type", "text/javascript"); response.end(script); return; }
    if (pathname === "/fixture.css") { response.setHeader("Content-Type", "text/css"); response.end(styles.css + moduleCss + fonts); return; }
    if (pathname.startsWith("/api/")) { response.statusCode = 404; response.end("No live APIs in fixture"); return; }
    if (extname(pathname)) {
      const asset = resolve(root, "public", `.${decodeURIComponent(pathname)}`);
      if (!asset.startsWith(resolve(root, "public") + "/")) throw new Error("Invalid asset path");
      const types = { ".woff2": "font/woff2", ".svg": "image/svg+xml", ".png": "image/png", ".webp": "image/webp" };
      response.setHeader("Content-Type", types[extname(pathname)] ?? "application/octet-stream");
      response.end(await readFile(asset)); return;
    }
    response.setHeader("Content-Type", "text/html");
    response.end('<!doctype html><html lang="nl"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><link rel="stylesheet" href="/fixture.css"><title>Pricing UI fixture</title></head><body><div id="root"></div><script type="module" src="/fixture.js"></script></body></html>');
  } catch (error) { console.error(error); response.statusCode = 500; response.end("Fixture error"); }
});
await new Promise((done, reject) => { server.once("error", reject); server.listen(0, "127.0.0.1", done); });
const origin = `http://127.0.0.1:${server.address().port}`;
const results = [];
let browser;
let changedDuringCapture = [];

async function prepare(page, scenario) {
  const text = await page.evaluate(() => window.__fixture.checkoutCopy);
  if (scenario.surface === "checkout" && ["review", "auth", "code", "payment-error", "billing-off", "standalone-ineligible"].includes(scenario.state)) {
    await page.getByRole("button", { name: new RegExp(`^${text.continue}`) }).click();
    if (scenario.state === "code") {
      await page.getByLabel(text.email, { exact: true }).fill("rider@example.test");
      await page.getByRole("button", { name: text.sendCode, exact: true }).click();
      await page.getByLabel(text.code, { exact: true }).waitFor();
    } else if (scenario.state !== "auth") {
      await page.getByRole("button", { name: text.continue, exact: true }).click();
      await page.getByRole("checkbox").check();
      if (["payment-error", "billing-off"].includes(scenario.state)) {
        await page.getByRole("button", { name: new RegExp(`^${text.pay}`) }).click();
        await page.getByRole(scenario.state === "payment-error" ? "alert" : "status").waitFor();
      }
    }
  }
  if (scenario.surface === "subscription" && scenario.state.startsWith("cancel-")) {
    const copy = await page.evaluate(() => window.__fixture.subscriptionCopy);
    await page.getByRole("button", { name: copy.cancel, exact: true }).click();
    if (scenario.state !== "cancel-confirm") {
      await page.getByRole("button", { name: copy.confirm, exact: true }).click();
      await page.getByRole("status").waitFor();
      if (scenario.state.endsWith("confirmed")) {
        assert.equal(await page.getByRole("status").innerText(), copy.cancelConfirmed);
        assert.equal(await page.getByRole("button", { name: copy.cancel, exact: true }).count(), 0);
        assert.equal(await page.getByText(copy.renewal, { exact: true }).count(), 0);
      }
    }
  }
}

try {
  browser = await chromium.launch({ headless: true });
  const jobs = ["nl", "en"].flatMap(locale => [1440, 390].flatMap(width => selected.map(scenario => ({ locale, width, scenario }))));
  async function capture({ locale, width, scenario }) {
    const context = await browser.newContext({ viewport: { width, height: width === 390 ? 844 : 1000 }, locale, reducedMotion: "reduce", colorScheme: "light" });
    const errors = [];
    const blockedRequests = [];
    const mockRequests = [];
    const expectedConsole = [];
    await context.route("**/*", route => {
      const url = new URL(route.request().url());
      if (url.origin === origin && url.pathname === "/api/stripe/cancel" && route.request().method() === "POST") {
        mockRequests.push({ path: url.pathname, body: route.request().postData() });
        const confirmed = scenario.state.endsWith("confirmed");
        return route.fulfill({ status: scenario.state === "cancel-off" ? 501 : 200, contentType: "application/json", body: JSON.stringify(scenario.state === "cancel-off" ? { code: "STRIPE_NOT_IMPLEMENTED" } : { cancelled: confirmed }) });
      }
      if (url.origin !== origin || url.pathname.startsWith("/api/")) { blockedRequests.push(route.request().url()); return route.abort(); }
      return route.continue();
    });
    const page = await context.newPage();
    page.on("pageerror", error => errors.push(error.message));
    page.on("console", message => {
      if (message.type() !== "error") return;
      if (scenario.state === "cancel-off" && mockRequests.length && message.text().includes("501 (Not Implemented)")) expectedConsole.push(message.text());
      else errors.push(message.text());
    });
    const screenshot = `S3-${scenario.id}-${locale}-${width}.png`;
    const result = { locale, width, ...scenario, screenshot, errors, expectedConsole, blockedRequests, mockRequests };
    try {
      await page.goto(`${origin}/?locale=${locale}&case=${scenario.id}`, { waitUntil: "networkidle" });
      await page.getByRole("heading", { level: 1 }).waitFor({ timeout: 10000 });
      await prepare(page, scenario);
      const visibleCopy = await page.locator("body").innerText();
      assert(!/24[,.]50|19[,.]50|annual_entry|Alpe d.HuZes/.test(visibleCopy), "Obsolete pricing or campaign copy");
      if (scenario.surface === "checkout") {
        const expectedPrice = { single: "13.50", annual: "21.50", annual_upgrade: "9.50", annual_personal: "234.50", personal_fit_standalone: "209.50" }[scenario.product];
        assert(visibleCopy.includes(locale === "nl" ? expectedPrice.replace(".", ",") : expectedPrice), "Expected catalog price is rendered");
      }
      await page.evaluate(() => document.fonts.ready);
      await page.evaluate(() => window.scrollTo(0, 0));
      result.metrics = await page.evaluate(() => {
        const describe = node => ({ tag: node.tagName, label: (node.getAttribute("aria-label") || node.textContent || node.id || node.getAttribute("name") || "").trim().slice(0, 140) });
        const rawSmallControls = [];
        const smallControls = [];
        for (const node of document.querySelectorAll('a[href], button, input:not([type=hidden]), select, textarea, summary, [role=button]')) {
          if (node.closest('[aria-hidden="true"]') || getComputedStyle(node).visibility === "hidden") continue;
          const bounds = node.getBoundingClientRect();
          if (!bounds.width || !bounds.height) continue;
          const item = { ...describe(node), width: bounds.width, height: bounds.height, disabled: Boolean(node.disabled) };
          if (bounds.width < 44 || bounds.height < 44) rawSmallControls.push(item);
          const label = node.labels?.[0]?.getBoundingClientRect();
          const effective = label && label.width >= bounds.width && label.height >= bounds.height ? label : bounds;
          if (!node.disabled && (effective.width < 44 || effective.height < 44)) smallControls.push({ ...item, effectiveWidth: effective.width, effectiveHeight: effective.height });
        }
        return { overflow: document.documentElement.scrollWidth > window.innerWidth, scrollWidth: document.documentElement.scrollWidth, viewport: window.innerWidth, smallControls, rawSmallControls, fontsReady: document.fonts.status === "loaded" };
      });
      result.axe = (await new AxeBuilder({ page }).analyze()).violations.map(({ id, impact, nodes }) => ({ id, impact, nodes: nodes.map(({ target, failureSummary }) => ({ target, failureSummary })) }));
      result.calls = await page.evaluate(() => window.__fixture.calls);
      result.headings = await page.getByRole("heading").allTextContents();
      await page.screenshot({ path: resolve(output, screenshot), fullPage: true, animations: "disabled" });
    } catch (error) { errors.push(String(error)); }
    results.push(result);
    await context.close();
    if (results.length % 12 === 0) console.log(`Captured ${results.length}/${selected.length * 4}`);
  }
  await Promise.all(Array.from({ length: 3 }, async () => {
    while (jobs.length) await capture(jobs.shift());
  }));
} finally {
  await browser?.close();
  await new Promise(done => server.close(done));
  const after = await sourceHashes();
  changedDuringCapture = trackedSources.filter(path => before[path] !== after[path]);
  results.sort((left, right) => `${left.locale}-${left.width}-${left.id}`.localeCompare(`${right.locale}-${right.width}-${right.id}`));
  await mkdir(resolve(root, "plans/pricing-stripe/audit"), { recursive: true });
  await writeFile(audit, JSON.stringify({ scope: "Real pricing page/cards, CheckoutFlow and SubscriptionOverview; esbuild CSS modules, Tailwind globals, local brand fonts. Isolated framework/analytics adapters and fixture service results. No Next build, live authentication, real checkout, backend, email or external network. Checkout paid props are fixtures, not URL proof.", capturedAt: new Date().toISOString(), sourceHashes: before, changedDuringCapture, expectedCaptures: selected.length * 4, results }, null, 2));
}
const failures = results.filter(result => result.errors.length || result.blockedRequests.length || result.metrics?.overflow || result.metrics?.smallControls.length || result.axe?.length);
console.log(JSON.stringify({ captures: results.length, failures: failures.length, audit, failedCases: failures.map(({ id, locale, width, errors, metrics, axe }) => ({ id, locale, width, errors, overflow: metrics?.overflow, smallTargets: metrics?.smallControls.length, axe: axe?.map(item => item.id) })) }, null, 2));
if (failures.length || changedDuringCapture.length || results.length !== selected.length * 4) process.exitCode = 1;
