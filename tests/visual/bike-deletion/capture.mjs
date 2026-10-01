import { sendFixtureError } from "../lib/http-errors.mjs";
import assert from "node:assert/strict";
import { createServer } from "node:http";
import { readFile, mkdir, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { build } from "esbuild";
import postcss from "postcss";
import tailwind from "@tailwindcss/postcss";
import { chromium } from "playwright";

const root = process.cwd();
const folder = resolve(root, "tests/visual/bike-deletion");
const renders = resolve(root, "plans/redesign-canvas/code-renders");
const audit = resolve(root, "plans/redesign-canvas/audit/45-browser.json");
await mkdir(renders, { recursive: true });
const bundle = await build({
  absWorkingDir: root, entryPoints: [resolve(folder, "entry.jsx")], bundle: true,
  write: false, outdir: "/tmp/bike-deletion-memory", format: "esm", platform: "browser",
  jsx: "automatic", logLevel: "error", define: { "process.env": "{}", "process.env.NODE_ENV": '"development"' },
  plugins: [{ name: "deletion-fixture-boundaries", setup(builder) {
    builder.onResolve({ filter: /^(convex\/react|next\/navigation)$/ }, () => ({ path: resolve(folder, "runtime.jsx") }));
  } }],
});
const script = bundle.outputFiles.find((file) => file.path.endsWith(".js")).contents;
const globals = resolve(root, "src/app/globals.css");
const styles = await postcss([tailwind({ base: root })]).process(await readFile(globals, "utf8"), { from: globals });
const fonts = `@font-face{font-family:Figtree;src:url('/brand/report/fonts/figtree-latin.woff2')}@font-face{font-family:Bricolage;src:url('/brand/report/fonts/bricolage-grotesque-latin.woff2')}@font-face{font-family:DMMono;src:url('/brand/report/fonts/dm-mono-latin.woff2')}html{--font-body:Figtree;--font-display:Bricolage;--font-data:DMMono}body{font-family:Figtree,sans-serif}`;
const server = createServer(async (request, response) => {
  try {
    const pathname = new URL(request.url, "http://localhost").pathname;
    if (pathname === "/fixture.js") { response.setHeader("Content-Type", "text/javascript"); response.end(script); return; }
    if (pathname === "/fixture.css") { response.setHeader("Content-Type", "text/css"); response.end(styles.css + fonts); return; }
    if (pathname.startsWith("/brand/report/fonts/") && !pathname.includes("..")) {
      response.setHeader("Content-Type", "font/woff2"); response.end(await readFile(resolve(root, "public", `.${pathname}`))); return;
    }
    response.setHeader("Content-Type", "text/html");
    response.end('<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><link rel="stylesheet" href="/fixture.css"><title>Bike deletion dialog</title></head><body><div id="root"></div><script type="module" src="/fixture.js"></script></body></html>');
  } catch (error) { sendFixtureError(response, error); }
});
await new Promise((done) => server.listen(0, "127.0.0.1", done));
const browser = await chromium.launch({ headless: true });
const results = [];
try {
  for (const locale of ["nl", "en"]) for (const theme of ["light", "dark"]) for (const width of [1440, 390]) {
    const context = await browser.newContext({ viewport: { width, height: width === 390 ? 844 : 1000 }, colorScheme: theme, locale, reducedMotion: "reduce" });
    const page = await context.newPage();
    const errors = [];
    page.on("pageerror", (error) => { errors.push(error.message); console.error(error.message); });
    page.on("console", (message) => { if (message.type() === "error") errors.push(message.text()); });
    await page.goto(`http://127.0.0.1:${server.address().port}/${locale}/bikes?theme=${theme}`);
    const trigger = page.getByRole("button", { name: locale === "nl" ? "Verwijder fiets" : "Delete bike", exact: true });
    await trigger.click();
    const dialog = page.getByRole("dialog");
    await dialog.waitFor();
    const input = dialog.getByRole("textbox");
    const confirm = dialog.getByRole("button", { name: locale === "nl" ? "Definitief verwijderen" : "Permanently delete", exact: true });
    assert(await confirm.isDisabled());
    assert((await dialog.innerText()).includes(locale === "nl" ? "3 fitsessies" : "3 fit sessions"));
    await input.fill("wrong name");
    assert(await confirm.isDisabled());
    await input.fill("Trek Domane SL 6");
    assert(await confirm.isEnabled());
    await page.evaluate(() => document.fonts.ready);
    await page.waitForTimeout(200);
    const smallControls = await dialog.locator("button,input").evaluateAll((nodes) => nodes.map((node) => ({ label: node.textContent || node.getAttribute("aria-label"), width: node.getBoundingClientRect().width, height: node.getBoundingClientRect().height })).filter((bounds) => bounds.width < 44 || bounds.height < 44));
    assert.deepEqual(smallControls, []);
    assert(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth));
    const screenshot = `45-${locale}-${theme}-${width}.png`;
    await page.screenshot({ path: resolve(renders, screenshot), animations: "disabled" });
    for (let index = 0; index < 10; index++) {
      await page.keyboard.press("Tab");
      await page.waitForTimeout(50);
      assert(await dialog.evaluate((node) => node.contains(document.activeElement)));
    }
    await page.keyboard.press("Escape");
    await dialog.waitFor({ state: "hidden" });
    assert(await trigger.evaluate((node) => node === document.activeElement));
    await trigger.click();
    await input.fill("Trek Domane SL 6");
    await page.evaluate(() => { window.__deletionFail = true; });
    await confirm.click();
    await dialog.getByRole("alert").waitFor();
    assert(await confirm.isEnabled());
    await page.evaluate(() => { window.__deletionFail = false; });
    await confirm.click();
    await dialog.waitFor({ state: "hidden" });
    const mutation = await page.evaluate(() => ({ args: window.__deletionArguments, redirect: window.__deletionRedirect }));
    assert.deepEqual(mutation, { args: { bikeId: "visual-bike", confirmName: "Trek Domane SL 6" }, redirect: `/${locale}/bikes` });
    assert.deepEqual(errors, []);
    results.push({ locale, theme, width, screenshot, count: 3, exactNameGate: true, focusTrap: true, escapeAndFocusReturn: true, minimum44px: true, retryAfterError: true, mutation, errors });
    console.log(JSON.stringify(results.at(-1)));
    await context.close();
  }
} finally {
  await writeFile(audit, JSON.stringify({ fixture: "Actual DeleteBikeAction and shared dialog/input/button/toast; mocked authenticated Convex boundary; current globals.css compiled with Tailwind", results }, null, 2) + "\n");
  await browser.close();
  await new Promise((done) => server.close(done));
}
