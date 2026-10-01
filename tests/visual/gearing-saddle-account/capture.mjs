import { sendFixtureError } from "../lib/http-errors.mjs";
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
const folder = resolve(root, "tests/visual/gearing-saddle-account");
const renders = resolve(root, "plans/redesign-canvas/code-renders");
const audit = resolve(root, "plans/redesign-canvas/audit/43c-browser.json");
await mkdir(renders, { recursive: true });
const bundle = await build({
  absWorkingDir: root, entryPoints: [resolve(folder, "entry.jsx")], bundle: true,
  write: false, outdir: "/tmp/gearing-saddle-account-memory", format: "esm", platform: "browser",
  jsx: "automatic", logLevel: "error", define: { "process.env": "{}", "process.env.NODE_ENV": '"production"' },
  plugins: [{ name: "gearing-saddle-fixture-boundaries", setup(builder) {
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
    response.end('<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><link rel="stylesheet" href="/fixture.css"><title>Gearing and saddle comparison</title></head><body><div id="root"></div><script type="module" src="/fixture.js"></script></body></html>');
  } catch (error) { sendFixtureError(response, error); }
});
await new Promise((done) => server.listen(0, "127.0.0.1", done));
const origin = `http://127.0.0.1:${server.address().port}`;
const browser = await chromium.launch({ headless: true });
const results = [];
const persistence = [];
function writes(page, tool) {
  return page.evaluate((value) => window.__visualActions.filter((entry) => entry.name ===
    (value === "gearing" ? "gearing/mutations:createDashboardGearingSession" : "saddleWidth/mutations:createDashboardSaddleWidthSession")), tool);
}
async function open(page, route) {
  await page.goto(`${origin}${route}`, { waitUntil: "networkidle" });
  await page.getByRole("slider").first().waitFor();
  await page.evaluate(() => document.fonts.ready);
}
try {
  for (const tool of ["gearing", "saddle-width"]) {
    for (const locale of ["nl", "en"]) for (const theme of ["light", "dark"]) for (const width of [1440, 390]) {
      const context = await browser.newContext({ viewport: { width, height: width === 390 ? 844 : 1000 },
        colorScheme: theme, locale, reducedMotion: "reduce" });
      await context.addInitScript((value) => localStorage.setItem("theme", value), theme);
      for (const account of [false, true]) {
        const page = await context.newPage();
        const errors = [];
        page.on("pageerror", (error) => errors.push(error.message));
        page.on("console", (message) => { if (message.type() === "error") errors.push(message.text()); });
        const route = `/${locale}/${account ? (tool === "gearing" ? "gearing" : "saddle-selector") : `calculators/${tool}`}${account ? "?bikeId=bike1" : ""}`;
        await open(page, route);
        assert.equal((await writes(page, tool)).length, 0, "Initial hydration must not autosave");
        if (account) assert.equal(await page.evaluate(() =>
          window.__visualActions.filter((entry) => entry.name?.includes("createPublic")).length), 0);
        const screenshot = `43c-${tool}-${account ? "account" : "public"}-${locale}-${theme}-${width}.png`;
        await page.screenshot({ path: resolve(renders, screenshot), fullPage: true, animations: "disabled" });
        const metrics = await page.evaluate(() => ({
          overflow: document.documentElement.scrollWidth > window.innerWidth,
          smallControls: [...document.querySelectorAll("main button, main a, main input:not([type=hidden]), main [role=slider]")].filter((node) => {
            if (node.getAttribute("aria-hidden") === "true" || node.closest('[aria-hidden="true"]')) return false;
            const rect = node.getBoundingClientRect();
            return rect.width > 0 && rect.height > 0 && (rect.width < 44 || rect.height < 44);
          }).map((node) => ({ label: node.textContent || node.getAttribute("aria-label"),
            width: node.getBoundingClientRect().width, height: node.getBoundingClientRect().height })),
        }));
        const axe = await new AxeBuilder({ page }).analyze();
        results.push({ tool, locale, theme, width, account, screenshot, metrics,
          axe: axe.violations.map(({ id, impact, nodes }) => ({ id, impact,
            nodes: nodes.map(({ target, failureSummary }) => ({ target, failureSummary })) })), errors });
        if (account) {
          await page.evaluate(() => { window.__calculatorSaveDelay = 500; });
          const field = page.getByRole("slider").first();
          await field.focus();
          await page.keyboard.press("ArrowRight");
          await page.getByRole("status").filter({ hasText: locale === "nl" ? "Opslaan" : "Saving" }).first().waitFor();
          if (theme === "light") await page.screenshot({ path: resolve(renders, `43c-${tool}-saving-${locale}-${width}.png`), fullPage: true });
          await page.getByRole("status").filter({ hasText: locale === "nl" ? "Opgeslagen" : "Saved" }).first().waitFor();
          const changed = await field.getAttribute("aria-valuenow");
          await page.reload({ waitUntil: "networkidle" });
          assert.equal(await page.getByRole("slider").first().getAttribute("aria-valuenow"), changed);
          assert.equal((await writes(page, tool)).length, 0);
          const revisit = await context.newPage();
          await open(revisit, route);
          assert.equal(await revisit.getByRole("slider").first().getAttribute("aria-valuenow"), changed);
          assert.equal((await writes(revisit, tool)).length, 0);
          await revisit.close();
          await page.evaluate(() => { window.__calculatorSaveError = true; });
          await page.getByRole("slider").first().focus();
          await page.keyboard.press("ArrowRight");
          const retry = page.getByRole("button", { name: locale === "nl" ? "Opnieuw proberen" : "Try again", exact: true });
          await retry.waitFor();
          const retained = await page.getByRole("slider").first().getAttribute("aria-valuenow");
          if (theme === "light") await page.screenshot({ path: resolve(renders, `43c-${tool}-error-${locale}-${width}.png`), fullPage: true });
          await page.evaluate(() => { window.__calculatorSaveError = false; });
          await retry.click();
          await page.getByRole("status").filter({ hasText: locale === "nl" ? "Opgeslagen" : "Saved" }).first().waitFor();
          assert.equal(await page.getByRole("slider").first().getAttribute("aria-valuenow"), retained);
          persistence.push({ tool, locale, theme, width, reload: true, freshAuthenticatedFixtureClient: true,
            noInitialWrites: true, saving: true, retryRetainsValue: true });
        }
        console.log(JSON.stringify({ tool, locale, theme, width, account, metrics, axe: results.at(-1).axe, errors }));
        await page.close();
      }
      await context.close();
    }
  }
  for (const tool of ["gearing", "saddle-width"]) for (const locale of ["nl", "en"]) {
    const context = await browser.newContext({ viewport: { width: 390, height: 844 }, locale, reducedMotion: "reduce" });
    const page = await context.newPage();
    const route = `/${locale}/${tool === "gearing" ? "gearing" : "saddle-selector"}?fixture=empty`;
    await open(page, route);
    assert.equal((await writes(page, tool)).length, 0);
    await page.getByRole("slider").first().focus();
    await page.keyboard.press("ArrowRight");
    await page.getByRole("status").filter({ hasText: locale === "nl" ? "Opgeslagen" : "Saved" }).first().waitFor();
    const changed = await page.getByRole("slider").first().getAttribute("aria-valuenow");
    assert.equal((await writes(page, tool)).at(-1).args[0].bikeId, undefined);
    assert.equal(await page.evaluate(() => window.__visualActions.filter((entry) =>
      entry.name?.startsWith("profiles/mutations:")).length), 0);
    await page.reload({ waitUntil: "networkidle" });
    assert.equal(await page.getByRole("slider").first().getAttribute("aria-valuenow"), changed);
    assert.equal((await writes(page, tool)).length, 0);
    persistence.push({ tool, locale, noBike: true, reload: true, noInitialWrites: true, profileUnchanged: true });
    await context.close();
  }
} finally {
  await writeFile(audit, JSON.stringify({ fixture: "Actual public shared forms and account pages/shell; current globals compiled. Auth/Convex/router mocked. Fixture localStorage represents server records; reload/fresh-client checks prove UI restoration, not live authentication.",
    results, persistence }, null, 2) + "\n");
  await browser.close();
  await new Promise((done) => server.close(done));
}
assert.equal(results.length, 32);
assert(!results.some((row) => row.metrics.overflow || row.errors.length
  || row.axe.some((violation) => ["serious", "critical"].includes(violation.impact))
  || (row.width === 390 && row.metrics.smallControls.length)), "Browser checks failed; see audit");
