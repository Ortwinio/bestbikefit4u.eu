import assert from "node:assert/strict";
import { createServer } from "node:http";
import { readFile, mkdir, writeFile } from "node:fs/promises";
import { resolve, extname } from "node:path";
import { build } from "esbuild";
import postcss from "postcss";
import tailwind from "@tailwindcss/postcss";
import { chromium } from "playwright";
import { renderBoard } from "../../../tests/visual/pdf-report/board.mjs";
import { sendFixtureError } from "../../../tests/visual/lib/http-errors.mjs";

// Real public forms/layout/styles; only Next routing/images and backend hooks use the existing offline fixture.
const root = process.cwd();
const renders = resolve(root, "plans/riderprofile/renders");
await mkdir(renders, { recursive: true });
const entry = `
import { createRoot } from "react-dom/client";
import { SaddleHeightCalculatorForm } from "@/app/(public)/calculators/saddle-height/SaddleHeightCalculatorForm";
import { FrameSizeCalculatorForm } from "@/app/(public)/calculators/frame-size/FrameSizeCalculatorForm";
import { ConfiguratorHeaderSwitch } from "@/components/layout/ConfiguratorHeaderSwitch";
import { ThemeProvider } from "@/components/providers/ThemeProvider";
import { ToastProvider } from "@/components/ui/Toast";
import nl from "@/i18n/messages/nl";
import en from "@/i18n/messages/en";
const locale = location.pathname.startsWith("/en/") ? "en" : "nl";
const dictionary = locale === "nl" ? nl : en;
document.documentElement.lang = locale;
const form = location.pathname.includes("frame-size")
  ? <FrameSizeCalculatorForm locale={locale} /> : <SaddleHeightCalculatorForm isNl={locale === "nl"} />;
createRoot(document.getElementById("root")).render(<ThemeProvider><ToastProvider>
  <ConfiguratorHeaderSwitch locale={locale} loginLabel={dictionary.nav.login} languageLabels={dictionary.common}>
    {null}
  </ConfiguratorHeaderSwitch><main>{form}</main>
</ToastProvider></ThemeProvider>);
`;
const bundle = await build({
  absWorkingDir: root, stdin: { contents: entry, loader: "jsx", resolveDir: root }, bundle: true,
  write: false, outdir: "/tmp/r1-public-memory", format: "esm", platform: "browser", jsx: "automatic",
  logLevel: "error", define: { "process.env": "{}", "process.env.NODE_ENV": '"production"' },
  plugins: [{ name: "r1-fixture-boundaries", setup(builder) {
    builder.onResolve({ filter: /^(convex\/react|@convex-dev\/auth\/react|next\/navigation|@\/i18n\/request|@sentry\/nextjs|@\/components\/feedback\/FeedbackPanelProvider)$/ },
      () => ({ path: resolve(root, "tests/visual/account-batch4/runtime.jsx") }));
    builder.onResolve({ filter: /^next\/link$/ },
      () => ({ path: resolve(root, "tests/visual/account-batch1/link.jsx") }));
    builder.onResolve({ filter: /^next\/image$/ },
      () => ({ path: resolve(root, "tests/visual/account-batch1/image.jsx") }));
  } }],
});
const script = bundle.outputFiles.find((file) => file.path.endsWith(".js")).contents;
const moduleCss = bundle.outputFiles.filter((file) => file.path.endsWith(".css")).map((file) => file.text).join("\n");
const globals = resolve(root, "src/app/globals.css");
const styles = await postcss([tailwind({ base: root })]).process(await readFile(globals, "utf8"), { from: globals });
const fonts = `
@font-face{font-family:Figtree;src:url('/brand/report/fonts/figtree-latin.woff2')}
@font-face{font-family:'Bricolage Grotesque';src:url('/brand/report/fonts/bricolage-grotesque-latin.woff2')}
@font-face{font-family:'DM Mono';src:url('/brand/report/fonts/dm-mono-latin.woff2')}
html{--font-body:Figtree;--font-display:'Bricolage Grotesque';--font-data:'DM Mono'}
body{font-family:Figtree,sans-serif}`;
const html = '<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">'
  + '<title>R1 actual public calculator</title><link rel="stylesheet" href="/fixture.css"></head>'
  + '<body><div id="root"></div><script type="module" src="/fixture.js"></script></body></html>';
const server = createServer(async (request, response) => {
  try {
    const pathname = new URL(request.url, "http://localhost").pathname;
    if (pathname === "/fixture.js") { response.setHeader("content-type", "text/javascript"); response.end(script); return; }
    if (pathname === "/fixture.css") {
      response.setHeader("content-type", "text/css"); response.end(styles.css + moduleCss + fonts); return;
    }
    if (pathname === "/board") { response.setHeader("content-type", "text/html"); response.end("<!doctype html><title>RP1 board</title>"); return; }
    if (extname(pathname)) {
      const base = pathname.startsWith("/renders/") ? renders : resolve(root, "public");
      const relative = pathname.startsWith("/renders/") ? pathname.slice(9) : `.${pathname}`;
      const file = resolve(base, decodeURIComponent(relative));
      if (!file.startsWith(base + "/")) { response.statusCode = 403; response.end("Forbidden"); return; }
      response.setHeader("content-type", ({ ".woff2": "font/woff2", ".svg": "image/svg+xml", ".png": "image/png" })[extname(file)]
        ?? "application/octet-stream");
      response.end(await readFile(file)); return;
    }
    response.setHeader("content-type", "text/html"); response.end(html);
  } catch (error) { sendFixtureError(response, error); }
});
await new Promise((done) => server.listen(0, "127.0.0.1", done));
const origin = `http://127.0.0.1:${server.address().port}`;
const browser = await chromium.launch({ headless: true });
const results = [];
try {
  const board = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
  await board.route("https://**/*", (route) => route.abort());
  await board.goto(`${origin}/board`);
  await renderBoard(board, await readFile(resolve(root, "plans/riderprofile/boards/RP1PublicSaddle.dc.html"), "utf8"));
  await board.addStyleTag({ content: fonts + ".review-strip{display:none!important}" });
  await board.evaluate(() => document.fonts.ready);
  await board.screenshot({ path: resolve(renders, "R1-board-1440.png"), fullPage: true });
  await board.close();
  for (const locale of ["nl", "en"]) for (const width of [1440, 390]) {
    const context = await browser.newContext({ viewport: { width, height: 1000 }, reducedMotion: "reduce" });
    await context.route("https://**/*", (route) => route.abort());
    await context.addInitScript(() => localStorage.setItem("theme", "light"));
    const page = await context.newPage();
    const errors = [];
    page.on("pageerror", (error) => errors.push(error.message));
    await page.goto(`${origin}/${locale}/calculators/saddle-height`, { waitUntil: "networkidle" });
    await page.getByRole("slider").first().waitFor();
    await page.evaluate(() => document.fonts.ready);
    assert.equal(await page.evaluate(() => sessionStorage.getItem("bbf.handoff")), null, "Defaults must not enter handoff");
    const initial = `R1-saddle-${locale}-${width}-initial.png`;
    await page.screenshot({ path: resolve(renders, initial), fullPage: true });
    await page.getByRole("slider").first().press("ArrowRight");
    await page.getByRole("button", { name: locale === "nl" ? "Ik heb dit gemeten" : "I measured this", exact: false }).click();
    await page.getByRole("radio", { name: "Comfort", exact: true }).click();
    await page.getByRole("button", { name: locale === "nl" ? "Vergelijk mijn huidige hoogte" : "Compare my current height" }).click();
    await page.getByRole("slider", { name: locale === "nl" ? "Huidige zadelhoogte" : "Current saddle height" }).press("ArrowRight");
    const stored = await page.evaluate(() => JSON.parse(sessionStorage.getItem("bbf.handoff")));
    assert.deepEqual(stored.entries.map((entry) => entry.field).sort(), ["currentSaddleHeightMm", "inseamCm", "ridingGoal"]);
    const cta = page.locator(`a[href="/${locale}/login?src=saddle-height&handoff=1"]`);
    assert.equal(await cta.count(), 1);
    const filled = `R1-saddle-${locale}-${width}-filled.png`;
    await page.screenshot({ path: resolve(renders, filled), fullPage: true });
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth > innerWidth);
    assert.equal(overflow, false, "Public form must fit the viewport");
    assert.deepEqual(errors, []);
    results.push({ locale, width, initial, filled, overflow, pageErrors: errors, carriedFields: stored.entries.map((entry) => entry.field) });
    // Navigate in this same browser session: the prior inseam prefill must not rewrite provenance.
    await page.goto(`${origin}/${locale}/calculators/frame-size`, { waitUntil: "networkidle" });
    const after = await page.evaluate(() => JSON.parse(sessionStorage.getItem("bbf.handoff")));
    assert.deepEqual(after, stored);
    assert.equal(await page.getByRole("slider", { name: locale === "nl" ? "Binnenbeenlengte" : "Inseam", exact: false })
      .getAttribute("aria-valuenow"), String(stored.entries.find((entry) => entry.field === "inseamCm").value));
    const comparison = await context.newPage();
    await comparison.setViewportSize({ width: width * 2, height: 1000 });
    await comparison.setContent(`<style>body{margin:0;font-family:sans-serif}.pair{display:grid;grid-template-columns:1fr 1fr;gap:0}img{width:100%;display:block}h2{font-size:18px;padding:12px}</style>
      <div class="pair"><div><h2>RP1 board · desktop reference</h2><img src="${origin}/renders/R1-board-1440.png"></div>
      <div><h2>Actual form · ${locale} · ${width}px</h2><img src="${origin}/renders/${initial}"></div></div>`, { waitUntil: "networkidle" });
    await comparison.evaluate(async () => {
      await Promise.all([...document.images].map((image) => image.decode()));
      if ([...document.images].some((image) => image.naturalWidth === 0)) throw new Error("Comparison image missing");
    });
    await comparison.screenshot({ path: resolve(renders, `R1-compare-${locale}-${width}.png`), fullPage: true });
    await context.close();
  }
} finally {
  await browser.close(); await new Promise((done) => server.close(done));
  await writeFile(resolve(root, "plans/riderprofile/audit/R1-browser.json"), JSON.stringify({
    fixture: "Actual React public forms, current Tailwind CSS and local fonts; no backend network or database writes.",
    board: "RP1PublicSaddle.dc.html, review-only Ontwerpstaat strip hidden; fixed desktop board scaled in mobile comparison.",
    results,
  }, null, 2) + "\n");
}
console.log(`R1: ${results.length} public saddle captures and same-session handoffs passed`);
