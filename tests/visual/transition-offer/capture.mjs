import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { createServer } from "node:http";
import { access, mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, extname, resolve } from "node:path";
import { root, folder, audit, renders, cases } from "./cases.mjs";

assert.deepEqual(process.argv.slice(2), ["--parent-freeze"],
  "Capture requires the parent's explicit UI interface and source/build freeze; use --parent-freeze only after that handoff.");
await access(`${folder}/entry.jsx`).catch(() => {
  throw new Error("Awaiting confirmed UI interface: entry.jsx has intentionally not been invented. No capture was produced.");
});
const [{ build }, { default: postcss }, { default: tailwind }, { chromium }, { default: AxeBuilder }] = await Promise.all([
  import("esbuild"), import("postcss"), import("@tailwindcss/postcss"), import("playwright"), import("@axe-core/playwright"),
]);
const hashes = new Map();
async function track(path) {
  const hash = createHash("sha256").update(await readFile(path)).digest("hex");
  if (hashes.has(path)) assert.equal(hashes.get(path), hash, `Source changed: ${path}`);
  hashes.set(path, hash);
}
const bundle = await build({
  absWorkingDir: root, entryPoints: [`${folder}/entry.jsx`], bundle: true, write: false,
  outdir: `${folder}/.memory`, format: "esm", platform: "browser", jsx: "automatic", logLevel: "error",
  define: { "process.env": "{}", "process.env.NODE_ENV": '"production"',
    "process.env.NEXT_PUBLIC_STRIPE_BILLING_ENABLED": '"false"',
    "process.env.STRIPE_BILLING_ENABLED": '"false"',
    "process.env.NEXT_PUBLIC_PAID_ACCESS_ENFORCED": '"true"',
    "process.env.PAID_ACCESS_ENFORCED": '"true"' },
  plugins: [{ name: "transition-offline-boundaries", setup(builder) {
    builder.onLoad({ filter: /\.(tsx?|jsx?|css)$/ }, async args => {
      if (!args.path.includes("/node_modules/")) await track(args.path);
      return undefined;
    });
    builder.onResolve({ filter: /^convex\/react$/ }, () => ({ path: `${folder}/runtime.jsx` }));
    builder.onResolve({ filter: /^next\/navigation$/ }, () => ({ path: `${folder}/runtime.jsx` }));
    builder.onResolve({ filter: /^next\/link$/ }, () => ({ path: `${root}/tests/visual/account-batch1/link.jsx` }));
    builder.onResolve({ filter: /^next\/image$/ }, () => ({ path: `${root}/tests/visual/account-batch1/image.jsx` }));
  } }],
});
const script = bundle.outputFiles.find(file => file.path.endsWith(".js"));
assert(script, "Fixture JavaScript is required");
const globals = `${root}/src/app/globals.css`;
await track(globals);
const styles = await postcss([tailwind({ base: root })]).process(await readFile(globals, "utf8"), { from: globals });
const fonts = "@font-face{font-family:Figtree;src:url('/brand/report/fonts/figtree-latin.woff2')}@font-face{font-family:Bricolage;src:url('/brand/report/fonts/bricolage-grotesque-latin.woff2')}@font-face{font-family:DMMono;src:url('/brand/report/fonts/dm-mono-latin.woff2')}html{--font-body:Figtree;--font-display:Bricolage;--font-mono:DMMono;--font-data:DMMono}body{font-family:Figtree,sans-serif}";
const css = styles.css + bundle.outputFiles.filter(file => file.path.endsWith(".css")).map(file => file.text).join("\n") + fonts;
const server = createServer(async (request, response) => {
  try {
    const url = new URL(request.url, "http://localhost");
    if (request.method !== "GET") { response.writeHead(405); response.end(); return; }
    if (url.pathname === "/fixture.js") { response.setHeader("Content-Type", "text/javascript"); response.end(script.contents); return; }
    if (url.pathname === "/fixture.css") { response.setHeader("Content-Type", "text/css"); response.end(css); return; }
    if (url.pathname.startsWith("/brand/") && [".woff2", ".svg", ".png", ".webp"].includes(extname(url.pathname))) {
      const asset = resolve(root, "public", `.${decodeURIComponent(url.pathname)}`);
      assert(asset.startsWith(`${root}/public/brand/`));
      response.setHeader("Content-Type", ({ ".woff2": "font/woff2", ".svg": "image/svg+xml", ".png": "image/png", ".webp": "image/webp" })[extname(asset)]);
      response.end(await readFile(asset)); return;
    }
    if (url.pathname !== "/") { response.writeHead(404); response.end(); return; }
    response.setHeader("Content-Type", "text/html");
    response.setHeader("Content-Security-Policy", "default-src 'self'; script-src 'self' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; font-src 'self'; connect-src 'none'; worker-src 'none'; form-action 'none'");
    response.end('<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><link rel="stylesheet" href="/fixture.css"><title>Transition offer fixture</title></head><body><div id="root"></div><script type="module" src="/fixture.js"></script></body></html>');
  } catch { response.writeHead(500); response.end("Fixture asset error"); }
});
await new Promise((done, reject) => { server.once("error", reject); server.listen(0, "127.0.0.1", done); });
const origin = `http://127.0.0.1:${server.address().port}`;
const results = [];
const changedSources = [];
let browser;
try {
  await mkdir(renders, { recursive: true });
  browser = await chromium.launch({ headless: true });
  for (const scenario of cases) {
    const { surface, state, locale, width } = scenario;
    const result = { ...scenario, errors: [], blockedRequests: [], assertions: [] };
    results.push(result);
    const context = await browser.newContext({ viewport: { width, height: width === 390 ? 844 : 1000 },
      locale, timezoneId: "Europe/Amsterdam", colorScheme: "light", reducedMotion: "reduce", serviceWorkers: "block" });
    await context.route("**/*", route => {
      const request = route.request();
      const url = new URL(request.url());
      const allowed = url.origin === origin && request.method() === "GET"
        && ["document", "script", "stylesheet", "font", "image"].includes(request.resourceType())
        && (["/", "/fixture.js", "/fixture.css"].includes(url.pathname) || url.pathname.startsWith("/brand/"));
      if (allowed) return route.continue();
      result.blockedRequests.push(url.href);
      return route.abort();
    });
    await context.routeWebSocket(/.*/, socket => {
      result.blockedRequests.push(socket.url());
      socket.close();
    });
    const page = await context.newPage();
    page.on("pageerror", error => result.errors.push(error.message));
    page.on("console", message => { if (message.type() === "error") result.errors.push(message.text()); });
    try {
      await page.goto(`${origin}/?${new URLSearchParams({ surface, state, locale })}`, { waitUntil: "networkidle" });
      await page.waitForFunction(() => window.__transitionFixture?.ready === true);
      await page.evaluate(() => document.fonts.ready);
      result.assertions = await page.evaluate(() => window.__transitionFixture.verifyState());
      assert(result.assertions.length > 0, "UI binding must provide real state assertions");
      result.calls = await page.evaluate(() => window.__transitionFixture.calls);
      assert(Array.isArray(result.calls), "Explicit service-call recorder required");
      result.metrics = await page.evaluate(() => ({ overflow: document.documentElement.scrollWidth > innerWidth,
        fontsReady: document.fonts.status === "loaded", locale: document.documentElement.lang }));
      result.axe = (await new AxeBuilder({ page }).analyze()).violations.map(({ id, impact, nodes }) =>
        ({ id, impact, nodes: nodes.map(({ target, failureSummary }) => ({ target, failureSummary })) }));
      const screenshot = `${renders}/02a-${surface}-${state}-${locale}-${width}.png`;
      await page.screenshot({ path: screenshot, fullPage: true, animations: "disabled" });
      result.screenshot = screenshot;
    } catch (error) { result.errors.push(String(error)); }
    finally { await context.close(); }
    console.log(`Captured ${results.length}/${cases.length}: ${surface} ${state} ${locale} ${width}`);
  }
} finally {
  await browser?.close();
  await new Promise(done => server.close(done));
  for (const [path, hash] of hashes) {
    if (createHash("sha256").update(await readFile(path)).digest("hex") !== hash) changedSources.push(path);
  }
  await mkdir(dirname(audit), { recursive: true });
  await writeFile(audit, JSON.stringify({ scope: "Isolated production components, offline fixtures; billing OFF, paid access enforced. No full-route/build/real-redemption proof.",
    capturedAt: new Date().toISOString(), expectedCaptures: cases.length, sourceHashes: Object.fromEntries(hashes), changedSources, results }, null, 2));
}
const failures = results.filter(result => result.errors.length || result.blockedRequests.length || result.calls?.length !== 0
  || !result.screenshot || !result.metrics || result.metrics.overflow || !result.metrics.fontsReady || result.metrics.locale !== result.locale
  || !result.axe || result.axe.length || !result.assertions.length || result.assertions.some(item => item.passed !== true));
console.log(JSON.stringify({ audit, captures: results.filter(result => result.screenshot).length, failures: failures.length, changedSources }, null, 2));
if (failures.length || changedSources.length || results.length !== cases.length) process.exitCode = 1;
