import { createServer } from "node:http";
import { readFile, writeFile, mkdir } from "node:fs/promises";
import { resolve, extname, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { createHash } from "node:crypto";
import { runInNewContext } from "node:vm";
import { chromium } from "playwright";
import { build } from "esbuild";
import sharp from "sharp";
import { bundleFixture } from "./P2-visual-fixtures.mjs";
import { matrix, limitations } from "./P2-visual-matrix.mjs";
import { serveQaAsset } from "../../../tests/visual/final-sweep/assets.mjs";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "../../..");
if (root !== "/Users/ortwinverreck/Developer/bestbikefit4u-pricing") throw new Error("Run only in the pricing worktree");
const capture = process.argv.includes("--capture");
const useDevCss = process.argv.includes("--dev-css");
const filter = process.argv.find(value => value.startsWith("--filter="))?.slice(9) || "";
const output = resolve(root, "plans/pricing-v3/renders/p2-visual");
const cases = matrix(filter);
if (!cases.length) throw new Error(`No scenarios match ${filter}`);
const previousResults = filter ? JSON.parse(await readFile(resolve(output, "results.json"), "utf8").catch(() => "[]")) : [];
const hash = value => createHash("sha256").update(value).digest("hex");
const bundles = new Map();
const preparation = [];
for (const family of [...new Set(cases.map(entry => entry.family))]) {
  for (const enforced of [false, true]) {
    const key = `${family}-${enforced ? "on" : "off"}`;
    try {
      const bundle = await bundleFixture(root, family, enforced);
      bundles.set(key, bundle);
      preparation.push({ key, ready: true, scriptSha256: hash(bundle.script), moduleCssSha256: hash(bundle.css), inputs: bundle.inputs });
    } catch (error) {
      preparation.push({ key, ready: false, error: String(error), details: error.errors?.map(item => item.text) });
    }
  }
}
await mkdir(output, { recursive: true });
const readiness = { preparedAt: new Date().toISOString(), captureStarted: false,
  matrixCount: cases.length, cases, preparation, limitations,
  next: "Parent starts the local frontend after its build gate. Run node plans/pricing-v3/audit/P2-visual.mjs --capture. Set P2_VISUAL_ORIGIN for a non-default loopback port. Explicit --dev-css uses the allowed dev-CSS fixture fallback and is recorded.",
};
await writeFile(resolve(output, "readiness.json"), JSON.stringify(readiness, null, 2));
console.log(JSON.stringify({ readiness: resolve(output, "readiness.json"), cases: cases.length,
  bundles: preparation.map(({ key, ready, error }) => ({ key, ready, error })), captured: false }));
if (preparation.some(entry => !entry.ready)) process.exitCode = 1;
if (!capture || process.exitCode) process.exit(process.exitCode || 0);

const cssMode = useDevCss ? "dev-css-fixture-fallback" : "production-css-fixture";
const buildId = useDevCss ? null : (await readFile(resolve(root, ".next/BUILD_ID"), "utf8")).trim();
const origin = new URL(process.env.P2_VISUAL_ORIGIN || "http://127.0.0.1:3000");
if (origin.protocol !== "http:" || !["localhost", "127.0.0.1", "[::1]"].includes(origin.hostname)) {
  throw new Error("P2_VISUAL_ORIGIN must be an HTTP loopback origin");
}
async function localText(pathname, redirects = 0) {
  const url = new URL(pathname, origin);
  if (url.origin !== origin.origin) throw new Error("External CSS origin refused");
  const response = await fetch(url, { redirect: "manual", signal: AbortSignal.timeout(15000) });
  if ([301, 302, 303, 307, 308].includes(response.status)) {
    const location = response.headers.get("location");
    if (!location || redirects >= 5) throw new Error("Invalid local CSS redirect");
    const destination = new URL(location, url);
    if (destination.origin !== origin.origin) throw new Error("External CSS redirect refused");
    return localText(destination.href, redirects + 1);
  }
  if (!response.ok) throw new Error(`${url.pathname}: HTTP ${response.status}`);
  return response.text();
}
let globalCss, htmlClass, bodyClass, cssProvenance;
try {
  const loginHtml = await localText("/nl/login");
  const cssPaths = [...new Set([...loginHtml.matchAll(/href="([^" ]+\.css(?:\?[^" ]*)?)"/g)].map(match => match[1]))];
  if (!cssPaths.length) throw new Error("No compiled Next CSS found");
  globalCss = (await Promise.all(cssPaths.map(localText))).join("\n");
  htmlClass = loginHtml.match(/<html[^>]*class="([^"]+)"/)?.[1] || "";
  bodyClass = loginHtml.match(/<body[^>]*class="([^"]+)"/)?.[1] || "";
  cssProvenance = { source: "production-server", origin: origin.href, paths: cssPaths };
} catch (error) {
  if (useDevCss) throw error;
  const manifestPath = ".next/server/app/(auth)/login/page_client-reference-manifest.js";
  const context = {};
  runInNewContext(await readFile(resolve(root, manifestPath), "utf8"), context);
  const manifest = Object.values(context.__RSC_MANIFEST)[0];
  const entries = manifest.entryCSSFiles[resolve(root, "src/app/layout")];
  if (!entries?.length) throw new Error("Production root CSS missing from manifest");
  const paths = entries.map(entry => entry.path);
  if (paths.some(path => !/^static\/css\/[\w.-]+\.css$/.test(path))) throw new Error("Invalid production CSS path");
  globalCss = (await Promise.all(paths.map(path => readFile(resolve(root, ".next", path), "utf8")))).join("\n");
  htmlClass = [...globalCss.matchAll(/\.([\w-]+)\{--font-(?:display|body|mono):/g)].map(match => match[1]).join(" ");
  if (htmlClass.split(" ").length !== 3) throw new Error("Production font classes missing");
  const layout = await readFile(resolve(root, "src/app/layout.tsx"), "utf8");
  bodyClass = layout.match(/<body className="([^"]+)"/)?.[1];
  if (!bodyClass) throw new Error("Actual root body class unavailable");
  cssProvenance = { source: "same-build-disk-manifest", buildId, manifestPath, paths, serverFailure: String(error), origin: origin.href };
  console.log(JSON.stringify({ cssProvenance }));
}
const stubBundle = await build({ entryPoints: [resolve(root, "shared/billing/stripeStub.ts")], bundle: true, write: false, platform: "node", format: "esm", logLevel: "silent" });
const { stripeNotImplemented } = await import(`data:text/javascript;base64,${Buffer.from(stubBundle.outputFiles[0].contents).toString("base64")}`);
const serverErrors = [];
const server = createServer(async (request, response) => {
  try {
    const url = new URL(request.url, "http://127.0.0.1");
    if (url.pathname.startsWith("/api/")) {
      if (request.method !== "POST" || !/^\/api\/stripe\/(cancel|portal|checkout|refund)$/.test(url.pathname)) {
        response.writeHead(403); response.end("Service request blocked by fixture"); return;
      }
      let body = "";
      for await (const chunk of request) { body += chunk; if (body.length > 4096) throw new Error("Oversized fixture request"); }
      const locale = JSON.parse(body || "{}").locale === "en" ? "en" : "nl";
      response.writeHead(501, { "content-type": "application/json", "x-qa-fixture": "shared-stripe-stub" });
      response.end(JSON.stringify(stripeNotImplemented(locale))); return;
    }
    if (request.method !== "GET" && request.method !== "HEAD") { response.writeHead(403); response.end(); return; }
    const asset = url.pathname.match(/^\/__p2\/(account|pricing|checkout)-(on|off)\.(js|css)$/);
    if (asset) {
      const bundle = bundles.get(`${asset[1]}-${asset[2]}`);
      if (!bundle) throw new Error("Unprepared fixture bundle");
      response.setHeader("content-type", asset[3] === "js" ? "text/javascript" : "text/css");
      response.end(asset[3] === "js" ? bundle.script : globalCss + "\n" + bundle.css); return;
    }
    if (await serveQaAsset(request, response, { staticDir: resolve(root, useDevCss ? ".next/dev/static" : ".next/static") })) return;
    if (extname(url.pathname)) {
      const publicRoot = resolve(root, "public");
      const file = resolve(publicRoot, `.${decodeURIComponent(url.pathname)}`);
      if (!file.startsWith(publicRoot + "/")) throw new Error("Invalid public asset path");
      response.setHeader("content-type", ({ ".svg": "image/svg+xml", ".png": "image/png", ".webp": "image/webp", ".jpg": "image/jpeg", ".ico": "image/x-icon" })[extname(file)] || "application/octet-stream");
      response.end(await readFile(file)); return;
    }
    const route = url.pathname.replace(/^\/(nl|en)\//, "");
    const family = route === "pricing" ? "pricing" : route === "checkout" ? "checkout" :
      ["settings", "dashboard", "fit/visual-session/results"].includes(route) ? "account" : null;
    if (!family) { response.writeHead(404); response.end("Unknown fixture route"); return; }
    const key = `${family}-${url.searchParams.get("enforced") === "true" ? "on" : "off"}`;
    response.setHeader("content-type", "text/html; charset=utf-8");
    response.setHeader("x-qa-fixture", "pricing-v3-real-app-synthetic-services");
    response.end(`<!doctype html><html lang="${url.pathname.startsWith("/nl/") ? "nl" : "en"}" class="${htmlClass}"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><link rel="stylesheet" href="/__p2/${key}.css"><title>P2 app fixture</title></head><body class="${bodyClass}"><div id="root"></div><script type="module" src="/__p2/${key}.js"></script></body></html>`);
  } catch (error) {
    serverErrors.push({ path: request.url, error: String(error) });
    response.writeHead(500); response.end("Fixture error");
  }
});
await new Promise((done, reject) => { server.once("error", reject); server.listen(0, "127.0.0.1", done); });
const fixtureOrigin = `http://127.0.0.1:${server.address().port}`;
let browser;
const results = previousResults.filter(previous => !cases.some(entry => entry.name === previous.name));
try {
  browser = await chromium.launch({ headless: true });
  for (const entry of cases) {
    const context = await browser.newContext({ viewport: { width: entry.width, height: entry.height },
      deviceScaleFactor: 1, colorScheme: "light", reducedMotion: "reduce", locale: entry.locale === "nl" ? "nl-NL" : "en-GB", serviceWorkers: "block" });
    const result = { ...entry, buildId, cssProvenance, captured: false, errors: [], blockedRequests: [], failedRequests: [], interactions: [] };
    await context.route("**/*", route => {
      if (new URL(route.request().url()).origin === fixtureOrigin) return route.continue();
      result.blockedRequests.push(route.request().url()); return route.abort();
    });
    await context.routeWebSocket("**/*", socket => { result.blockedRequests.push(socket.url()); socket.close(); });
    await context.addInitScript(() => localStorage.setItem("theme", "light"));
    const page = await context.newPage();
    page.on("pageerror", error => result.errors.push(error.message));
    page.on("requestfailed", request => result.failedRequests.push({ url: request.url(), error: request.failure()?.errorText }));
    try {
      await page.goto(`${fixtureOrigin}/${entry.locale}/${entry.route}?state=${entry.state}&enforced=${entry.enforced}&${entry.query || ""}`);
      await page.waitForFunction(() => window.__visualReady && document.querySelector("h1"), undefined, { timeout: 15000 });
      await page.evaluate(() => document.fonts.ready);
      await drive(page, entry, result);
      await page.waitForTimeout(250);
      await settleScroll(page);
      result.metrics = await page.evaluate(() => ({
        width: innerWidth, documentWidth: document.documentElement.scrollWidth,
        overflow: document.documentElement.scrollWidth > innerWidth + 1,
        headings: [...document.querySelectorAll("h1,h2")].map(node => node.textContent),
        fonts: document.fonts.status,
        queries: window.__visualQueries, unknownQueries: window.__visualUnknownQueries,
        serviceCalls: window.__visualActions, expected: window.__visualExpected,
        smallControls: [...document.querySelectorAll("button,a,input,select")].filter(node => {
          const box = node.getBoundingClientRect(); return box.width > 0 && box.height > 0 && getComputedStyle(node).opacity !== "0" && (box.width < 44 || box.height < 44);
        }).map(node => ({ text: (node.textContent || node.getAttribute("aria-label") || node.type || "").trim().slice(0, 90), width: node.getBoundingClientRect().width, height: node.getBoundingClientRect().height })),
      }));
      if (entry.route.endsWith("/results")) {
        const unlock = page.getByRole("heading", { name: entry.locale === "nl" ? "Volledig stappenplan voor deze fiets" : "Full adjustment plan for this bike", exact: true });
        const shouldLock = !result.metrics.expected.reportAccess.fullReport;
        if ((await unlock.count() > 0) !== shouldLock) throw new Error("Report gating DOM does not match fixture access");
      }
      result.screenshot = `${entry.name}.png`;
      if (entry.route === "checkout" && entry.width === 390) {
        result.metrics.fixedActionBeforeScreenshot = await fixedActionBounds(page);
      }
      const interactionScroll = await page.evaluate(() => ({ x: scrollX, y: scrollY }));
      await page.evaluate(() => window.scrollTo(0, 0));
      await settleScroll(page);
      await page.screenshot({ path: resolve(output, result.screenshot), fullPage: true, animations: "disabled" });
      if (entry.width === 390) {
        await page.evaluate(position => window.scrollTo(position.x, position.y), interactionScroll);
        await settleScroll(page);
        await page.screenshot({ path: resolve(output, `${entry.name}-viewport.png`), animations: "disabled" });
      }
      const png = await sharp(resolve(output, result.screenshot)).metadata();
      result.metrics.screenshotWidth = png.width;
      result.metrics.postScreenshotDocumentWidth = await page.evaluate(() => Math.max(document.documentElement.scrollWidth, document.body.scrollWidth));
      result.metrics.overflow = result.metrics.overflow || png.width !== entry.width || result.metrics.postScreenshotDocumentWidth > entry.width + 1;
      if (entry.route === "checkout" && entry.width === 390) {
        result.metrics.fixedActionAfterScreenshot = await fixedActionBounds(page);
        const observations = [result.metrics.fixedActionBeforeScreenshot, result.metrics.fixedActionAfterScreenshot];
        result.metrics.fixedActionBoundsFailure = observations.some(actions => actions.some(action => !action.withinGutters))
          || (entry.id === "checkout-success-preview" && observations.some(actions => actions.length === 0));
      }
      result.captured = true;
    } catch (error) { result.error = String(error); }
    finally { await context.close(); }
    results.push(result);
    await writeFile(resolve(output, "results.json"), JSON.stringify(results, null, 2));
    console.log(JSON.stringify({ name: entry.name, captured: result.captured, error: result.error, runtimeErrors: result.errors.length, overflow: result.metrics?.overflow, fixedActionBoundsFailure: result.metrics?.fixedActionBoundsFailure }));
  }
} finally {
  await browser?.close();
  await new Promise(done => server.close(done));
  const failed = results.filter(result => !result.captured || result.errors.length || result.metrics?.overflow || result.metrics?.fixedActionBoundsFailure || result.metrics?.unknownQueries?.length || result.failedRequests.length);
  const report = { completedAt: new Date().toISOString(), cssMode, cssProvenance, buildId, globalCssSha256: hash(globalCss),
    planned: matrix().length, runCases: cases.length, attempted: results.length, captured: results.filter(result => result.captured).length,
    failures: failed.map(result => result.name), serverErrors, preparation, limitations,
    visualInspection: "Not performed by the automated harness. Inspect PNGs before claiming visual acceptance.",
  };
  await writeFile(resolve(output, "report.json"), JSON.stringify(report, null, 2));
  if (failed.length || serverErrors.length || results.length !== matrix().length) process.exitCode = 1;
}

async function fixedActionBounds(page) {
  return page.evaluate(() => [...document.querySelectorAll("button,a")].filter(node => {
    const style = getComputedStyle(node);
    const box = node.getBoundingClientRect();
    return style.position === "fixed" && style.visibility !== "hidden" && style.opacity !== "0" && box.width > 0 && box.height > 0;
  }).map(node => {
    const box = node.getBoundingClientRect();
    return {
      text: node.textContent?.trim(), left: box.left, right: box.right, width: box.width,
      viewportWidth: innerWidth, requiredGutter: 16,
      withinGutters: box.left >= 15.5 && box.right <= innerWidth - 15.5,
    };
  }));
}

async function settleScroll(page) {
  await page.evaluate(() => new Promise((resolveScroll, rejectScroll) => {
    let previous = `${scrollX}:${scrollY}:${document.documentElement.scrollHeight}`;
    let stableFrames = 0;
    const started = performance.now();
    function check() {
      const current = `${scrollX}:${scrollY}:${document.documentElement.scrollHeight}`;
      stableFrames = current === previous ? stableFrames + 1 : 0;
      previous = current;
      if (stableFrames >= 12 && performance.now() - started >= 350) return resolveScroll();
      if (performance.now() - started > 5000) return rejectScroll(new Error("Scroll/layout did not settle before screenshot"));
      requestAnimationFrame(check);
    }
    requestAnimationFrame(check);
  }));
}

async function drive(page, entry, result) {
  const dutch = entry.locale === "nl";
  if (entry.id === "settings-personal") {
    const appointment = page.getByRole("link", { name: dutch ? "Plan je afspraak" : "Book your appointment", exact: true });
    if (await appointment.getAttribute("href") !== `/${entry.locale}/checkout?appointment=1`) throw new Error("Missing authoritative appointment CTA");
    result.interactions.push("Personal entitlement exposes guarded scheduling link; no sender invoked.");
  }
  if (entry.id === "checkout-appointment") {
    await page.getByRole("heading", { level: 1, name: dutch ? "Plan je afspraak" : "Book your appointment", exact: true }).waitFor();
    if (await page.getByRole("note").count()) throw new Error("Actual entitlement appointment incorrectly marked as preview");
    if (!await page.evaluate(() => window.__visualExpected.appointmentAvailable)) throw new Error("Missing appointment entitlement");
    result.interactions.push("Authoritative personal entitlement appointment block; distinct from success preview; no mail sent.");
  }
  if (entry.action === "cancel") {
    await page.getByRole("button", { name: dutch ? "Abonnement opzeggen" : "Cancel subscription", exact: true }).click();
    await page.getByRole("button", { name: dutch ? "Ja, zeg mijn abonnement op" : "Yes, cancel my subscription", exact: true }).click();
    await page.getByText(dutch ? "Je abonnement is niet opgezegd. Er is geen terugbetaling uitgevoerd." : "Your subscription has not been cancelled. No refund has been issued.").waitFor();
    result.interactions.push("Cancellation intent persisted; fixture-only shared Stripe stub; entitlement unchanged.");
  }
  if (entry.family !== "checkout" || !entry.action) return;
  const next = () => page.getByRole("button", { name: dutch ? /^Doorgaan/ : /^Continue/ }).click();
  await next();
  if (entry.action === "code") {
    await page.getByRole("textbox", { name: dutch ? "E-mailadres" : "Email address", exact: true }).fill("visual@example.invalid");
    await page.getByRole("button", { name: dutch ? "Stuur code" : "Send code", exact: true }).click();
    await page.getByRole("textbox", { name: dutch ? "Code van 7 letters en cijfers" : "7-character code (letters and numbers)", exact: true }).waitFor();
    result.interactions.push("Fake auth hook only; no email sent.");
  }
  if (["confirm", "pay"].includes(entry.action)) {
    await next();
    const pay = page.getByRole("button", { name: dutch ? /^Betaal / : /^Pay / });
    if (!await pay.isDisabled()) throw new Error("Pay enabled without withdrawal consent");
    result.interactions.push("Pay disabled before withdrawal consent.");
    if (entry.action === "pay") {
      await page.getByRole("checkbox").check();
      await pay.click();
      await page.getByText(/Stripe.*(?:niet geïmplementeerd|not been implemented)/).waitFor();
      const persisted = await page.evaluate(() => localStorage.getItem("bbf-checkout-v3"));
      if (!persisted) throw new Error("Checkout choice missing after stub");
      result.interactions.push("Consent checked; real app stub message; choice persisted; no payment.");
    }
  }
}
