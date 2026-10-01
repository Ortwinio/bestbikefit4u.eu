import assert from "node:assert/strict";
import { createServer } from "node:http";
import { readFile, mkdir, writeFile } from "node:fs/promises";
import { resolve, extname } from "node:path";
import { build } from "esbuild";
import postcss from "postcss";
import tailwind from "@tailwindcss/postcss";
import { chromium } from "playwright";
import AxeBuilder from "@axe-core/playwright";

const root = process.cwd();
const folder = resolve(root, "tests/visual/pressure-account");
const renders = resolve(root, "plans/redesign-canvas/code-renders");
const audit = resolve(root, "plans/redesign-canvas/audit/42-browser.json");
await mkdir(renders, { recursive: true });
const bundle = await build({
  absWorkingDir: root, entryPoints: [resolve(folder, "entry.jsx")], bundle: true,
  write: false, outdir: "/tmp/pressure-account-memory", format: "esm", platform: "browser",
  jsx: "automatic", logLevel: "error", define: { "process.env": "{}", "process.env.NODE_ENV": '"production"' },
  plugins: [{ name: "pressure-fixture-boundaries", setup(builder) {
    builder.onResolve({ filter: /^(convex\/react|@convex-dev\/auth\/react|next\/navigation|@\/i18n\/request|@sentry\/nextjs|@\/components\/feedback\/FeedbackPanelProvider)$/ }, () => ({ path: resolve(root, "tests/visual/account-batch4/runtime.jsx") }));
    builder.onResolve({ filter: /^next\/link$/ }, () => ({ path: resolve(root, "tests/visual/account-batch1/link.jsx") }));
    builder.onResolve({ filter: /^next\/image$/ }, () => ({ path: resolve(root, "tests/visual/account-batch1/image.jsx") }));
  } }],
});
const script = bundle.outputFiles.find((file) => file.path.endsWith(".js")).contents;
const moduleCss = bundle.outputFiles.filter((file) => file.path.endsWith(".css")).map((file) => file.text).join("\n");
const globals = resolve(root, "src/app/globals.css");
const styles = await postcss([tailwind({ base: root })]).process(await readFile(globals, "utf8"), { from: globals });
const fonts = `@font-face{font-family:Figtree;src:url('/brand/report/fonts/figtree-latin.woff2')}@font-face{font-family:Bricolage;src:url('/brand/report/fonts/bricolage-grotesque-latin.woff2')}@font-face{font-family:DMMono;src:url('/brand/report/fonts/dm-mono-latin.woff2')}html{--font-body:Figtree;--font-display:Bricolage;--font-data:DMMono}body{font-family:Figtree,sans-serif}`;
const server = createServer(async (request, response) => {
  try {
    const pathname = new URL(request.url, "http://localhost").pathname;
    if (pathname === "/fixture.js") { response.setHeader("Content-Type", "text/javascript"); response.end(script); return; }
    if (pathname === "/fixture.css") { response.setHeader("Content-Type", "text/css"); response.end(styles.css + moduleCss + fonts); return; }
    if (extname(pathname)) {
      const path = resolve(root, "public", `.${decodeURIComponent(pathname)}`);
      if (!path.startsWith(resolve(root, "public") + "/")) throw new Error("Invalid asset path");
      const types = { ".woff2": "font/woff2", ".svg": "image/svg+xml", ".png": "image/png", ".webp": "image/webp", ".jpg": "image/jpeg" };
      response.setHeader("Content-Type", types[extname(pathname)] || "application/octet-stream");
      response.end(await readFile(path)); return;
    }
    response.setHeader("Content-Type", "text/html");
    response.end('<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><link rel="stylesheet" href="/fixture.css"><title>Pressure calculator comparison</title></head><body><div id="root"></div><script type="module" src="/fixture.js"></script></body></html>');
  } catch (error) { response.statusCode = 500; response.end(String(error)); }
});
await new Promise((done) => server.listen(0, "127.0.0.1", done));
const origin = `http://127.0.0.1:${server.address().port}`;
const browser = await chromium.launch({ headless: true });
const results = [];
const persistence = [];
function weight(page, locale) { return page.getByRole("slider", { name: locale === "nl" ? /gewicht/i : /weight/i }).first(); }
function writes(page) { return page.evaluate(() => window.__visualActions.filter((entry) => entry.name === "pressureCalculations/mutations:upsertBasic")); }
async function open(page, route) {
  await page.goto(`${origin}${route}`, { waitUntil: "networkidle" });
  await page.getByRole("slider").first().waitFor();
  await page.evaluate(() => document.fonts.ready);
}
try {
  for (const locale of ["nl", "en"]) for (const theme of ["light", "dark"]) for (const width of [1440, 390]) {
    const context = await browser.newContext({ viewport: { width, height: width === 390 ? 844 : 1000 }, colorScheme: theme, locale, reducedMotion: "reduce" });
    await context.addInitScript((value) => localStorage.setItem("theme", value), theme);
    for (const account of [false, true]) {
      const page = await context.newPage();
      const errors = [];
      page.on("pageerror", (error) => { errors.push(error.message); console.error(error.message); });
      const route = `/${locale}/${account ? "pressure-calculator" : "bandenspanning-calculator"}`;
      await open(page, route);
      assert.equal((await writes(page)).length, 0, "Initial hydration must not save");
      const screenshot = `42-${account ? "account" : "public"}-${locale}-${theme}-${width}.png`;
      await page.screenshot({ path: resolve(renders, screenshot), fullPage: true, animations: "disabled" });
      const metrics = await page.evaluate(() => ({
        overflow: document.documentElement.scrollWidth > window.innerWidth,
        smallControls: [...document.querySelectorAll("main button, main a, main input:not([type=hidden]), main [role=slider]")].filter((node) => {
          if (node.getAttribute("aria-hidden") === "true" || node.closest('[aria-hidden="true"]')) return false;
          const rect = node.getBoundingClientRect();
          return rect.width > 0 && rect.height > 0 && (rect.width < 44 || rect.height < 44);
        }).map((node) => ({ label: node.textContent || node.getAttribute("aria-label"), width: node.getBoundingClientRect().width, height: node.getBoundingClientRect().height })),
      }));
      const axe = await new AxeBuilder({ page }).analyze();
      results.push({ locale, theme, width, account, screenshot, metrics, axe: axe.violations.map(({ id, impact, nodes }) => ({ id, impact, nodes: nodes.map(({ target, failureSummary }) => ({ target, failureSummary })) })), errors });
      if (account) {
        await page.evaluate(() => { window.__pressureSaveDelay = 500; });
        const field = weight(page, locale);
        await field.focus();
        await page.keyboard.press("ArrowRight");
        await page.getByRole("status").filter({ hasText: locale === "nl" ? "Opslaan" : "Saving" }).first().waitFor();
        if (theme === "light") await page.screenshot({ path: resolve(renders, `42-saving-${locale}-${width}.png`), fullPage: true });
        await page.getByRole("status").filter({ hasText: locale === "nl" ? "Opgeslagen" : "Saved" }).first().waitFor();
        const changed = await field.getAttribute("aria-valuenow");
        await page.reload({ waitUntil: "networkidle" });
        assert.equal(await weight(page, locale).getAttribute("aria-valuenow"), changed);
        assert.equal((await writes(page)).length, 0);
        const revisit = await context.newPage();
        await open(revisit, route);
        assert.equal(await weight(revisit, locale).getAttribute("aria-valuenow"), changed);
        assert.equal((await writes(revisit)).length, 0);
        await revisit.close();
        await page.evaluate(() => { window.__pressureSaveError = true; });
        await weight(page, locale).focus();
        await page.keyboard.press("ArrowRight");
        const retry = page.getByRole("button", { name: locale === "nl" ? "Opnieuw proberen" : "Try again", exact: true });
        await retry.waitFor();
        const retained = await weight(page, locale).getAttribute("aria-valuenow");
        if (theme === "light") await page.screenshot({ path: resolve(renders, `42-error-${locale}-${width}.png`), fullPage: true });
        await page.evaluate(() => { window.__pressureSaveError = false; });
        await retry.click();
        await page.getByRole("status").filter({ hasText: locale === "nl" ? "Opgeslagen" : "Saved" }).first().waitFor();
        assert.equal(await weight(page, locale).getAttribute("aria-valuenow"), retained);
        persistence.push({ locale, theme, width, reload: true, freshAuthenticatedFixtureClient: true, noInitialWrites: true, saving: true, retryRetainsValue: true });
      }
      console.log(JSON.stringify({ locale, theme, width, account, metrics, axe: results.at(-1).axe, errors }));
      await page.close();
    }
    await context.close();
  }
  for (const locale of ["nl", "en"]) {
    const context = await browser.newContext({ viewport: { width: 390, height: 844 }, reducedMotion: "reduce", locale });
    const page = await context.newPage();
    const route = `/${locale}/pressure-calculator?fixture=empty`;
    await open(page, route);
    assert.equal((await writes(page)).length, 0);
    await weight(page, locale).focus();
    await page.keyboard.press("ArrowRight");
    await page.getByRole("status").filter({ hasText: locale === "nl" ? "Opgeslagen" : "Saved" }).first().waitFor();
    const changed = await weight(page, locale).getAttribute("aria-valuenow");
    const saved = await writes(page);
    assert.equal(saved.at(-1).args[0].bikeId, undefined);
    await page.reload({ waitUntil: "networkidle" });
    assert.equal(await weight(page, locale).getAttribute("aria-valuenow"), changed);
    assert.equal((await writes(page)).length, 0);
    persistence.push({ locale, noBike: true, reload: true, noInitialWrites: true });
    await page.screenshot({ path: resolve(renders, `42-no-bike-${locale}-390.png`), fullPage: true });
    await context.close();
  }
} finally {
  await writeFile(audit, JSON.stringify({ fixture: "Actual public PressureCalculatorForm with public props and actual authenticated pressure page/account shell; current globals compiled. Auth/Convex/router mocked. Per-bike backend records persisted in fixture localStorage; reload/new authenticated fixture client proves UI restoration, not real Convex login persistence.", results, persistence }, null, 2) + "\n");
  await browser.close();
  await new Promise((done) => server.close(done));
}
assert.equal(results.length, 16);
assert(!results.some((row) => row.metrics.overflow || row.errors.length
  || row.axe.some((violation) => ["serious", "critical"].includes(violation.impact))
  || (row.width === 390 && row.metrics.smallControls.length)), "Browser checks failed; see audit");
