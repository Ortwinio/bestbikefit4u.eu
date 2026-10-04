import { createServer } from "node:http";
import { readFile, mkdir, writeFile } from "node:fs/promises";
import { resolve, extname } from "node:path";
import { fileURLToPath } from "node:url";
import { build } from "esbuild";
import postcss from "postcss";
import tailwind from "@tailwindcss/postcss";
import { chromium } from "playwright";
import AxeBuilder from "@axe-core/playwright";

const root = fileURLToPath(new URL("../../../", import.meta.url));
const folder = resolve(root, "tests/visual/pricing-gifts");
const output = resolve(root, "plans/pricing-stripe/renders");
const audit = resolve(root, "plans/pricing-stripe/audit/S2-gift-visual.json");
await mkdir(output, { recursive: true });
const bundle = await build({
  absWorkingDir: root, entryPoints: [resolve(folder, "entry.jsx")], bundle: true,
  write: false, outdir: "/private/tmp/pricing-gifts-memory", format: "esm", platform: "browser",
  jsx: "automatic", logLevel: "error", define: { "process.env": "{}", "process.env.NODE_ENV": '"production"' },
  plugins: [{ name: "gift-fixture-link", setup(builder) {
    builder.onResolve({ filter: /^next\/link$/ }, () => ({ path: resolve(root, "tests/visual/account-batch1/link.jsx") }));
  } }],
});
const script = bundle.outputFiles.find(file => file.path.endsWith(".js")).contents;
const globals = resolve(root, "src/app/globals.css");
const styles = await postcss([tailwind({ base: root })]).process(await readFile(globals, "utf8"), { from: globals });
const fonts = "@font-face{font-family:Figtree;src:url('/brand/report/fonts/figtree-latin.woff2')}@font-face{font-family:Bricolage;src:url('/brand/report/fonts/bricolage-grotesque-latin.woff2')}@font-face{font-family:DMMono;src:url('/brand/report/fonts/dm-mono-latin.woff2')}html{--font-body:Figtree;--font-display:Bricolage;--font-data:DMMono}body{font-family:Figtree,sans-serif}";
const server = createServer(async (request, response) => {
  try {
    const pathname = new URL(request.url, "http://localhost").pathname;
    if (pathname === "/fixture.js") { response.setHeader("Content-Type", "text/javascript"); response.end(script); return; }
    if (pathname === "/fixture.css") { response.setHeader("Content-Type", "text/css"); response.end(styles.css + fonts); return; }
    if (extname(pathname)) {
      const asset = resolve(root, "public", `.${decodeURIComponent(pathname)}`);
      if (!asset.startsWith(resolve(root, "public") + "/")) throw new Error("Invalid asset path");
      response.setHeader("Content-Type", extname(pathname) === ".woff2" ? "font/woff2" : "application/octet-stream");
      response.end(await readFile(asset)); return;
    }
    response.setHeader("Content-Type", "text/html");
    response.end('<!doctype html><html lang="nl"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><link rel="stylesheet" href="/fixture.css"><title>Gift measurements</title></head><body><div id="root"></div><script type="module" src="/fixture.js"></script></body></html>');
  } catch (error) { response.statusCode = 500; response.end(String(error)); }
});
await new Promise(done => server.listen(0, "127.0.0.1", done));
const origin = `http://127.0.0.1:${server.address().port}`;
let browser;
const results = [];
try {
  browser = await chromium.launch({ headless: true });
  for (const locale of ["nl", "en"]) for (const width of [1440, 390]) for (const state of ["give", "give-exhausted", "give-ineligible", "valid", "soon", "redeem", "expired"]) {
    const context = await browser.newContext({ viewport: { width, height: width === 390 ? 844 : 1000 }, locale, reducedMotion: "reduce", colorScheme: "light" });
    await context.route("**/*", route => new URL(route.request().url()).origin === origin ? route.continue() : route.abort());
    const page = await context.newPage();
    const errors = [];
    page.on("pageerror", error => { errors.push(error.message); console.error(error.message); });
    await page.goto(`${origin}/?locale=${locale}&state=${state}`, { waitUntil: "networkidle" });
    await page.getByRole("heading", { level: 1 }).waitFor();
    await page.evaluate(() => document.fonts.ready);
    const screenshot = `S2-gift-${locale}-${state}-${width}.png`;
    await page.screenshot({ path: resolve(output, screenshot), fullPage: true, animations: "disabled" });
    const metrics = await page.evaluate(() => ({
      overflow: document.documentElement.scrollWidth > window.innerWidth,
      smallControls: [...document.querySelectorAll("main button, main a, main input:not([type=hidden]), main textarea")].filter(node => {
        if (node.closest('[aria-hidden="true"]')) return false;
        const bounds = node.getBoundingClientRect();
        return bounds.width > 0 && bounds.height > 0 && (bounds.width < 44 || bounds.height < 44);
      }).map(node => ({ label: node.textContent || node.getAttribute("aria-label") || node.id, width: node.getBoundingClientRect().width, height: node.getBoundingClientRect().height })),
    }));
    const axe = await new AxeBuilder({ page }).analyze();
    results.push({ locale, width, state, screenshot, metrics, errors, axe: axe.violations.map(({ id, impact, nodes }) => ({ id, impact, nodes: nodes.map(({ target, failureSummary }) => ({ target, failureSummary })) })) });
    await context.close();
  }
} finally {
  await browser?.close();
  await new Promise(done => server.close(done));
  await mkdir(resolve(root, "plans/pricing-stripe/audit"), { recursive: true });
  await writeFile(audit, JSON.stringify({ scope: "Isolated production gift components with fixture props, real app CSS and local fonts; no live backend or page-shell coverage.", results }, null, 2));
}
const failures = results.filter(result => result.metrics.overflow || result.metrics.smallControls.length || result.errors.length || result.axe.length);
console.log(JSON.stringify({ captures: results.length, failures: failures.length, audit, failedCases: failures.map(({ locale, width, state, metrics, errors, axe }) => ({ locale, width, state, metrics, errors, axe })) }, null, 2));
if (failures.length || results.length !== 28) process.exitCode = 1;
