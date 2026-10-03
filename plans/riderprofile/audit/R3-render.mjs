import { build } from "esbuild";
import postcss from "postcss";
import tailwindcss from "@tailwindcss/postcss";
import { chromium } from "playwright";
import { createServer } from "node:http";
import { readFile, mkdir, writeFile } from "node:fs/promises";
import { resolve, extname } from "node:path";
import assert from "node:assert/strict";

const root = process.cwd();
const output = resolve(root, "plans/riderprofile/renders");
const entry = `
import React, {useState} from 'react';
import {createRoot} from 'react-dom/client';
import {ProfileStrengthRings} from './src/components/profile/ProfileStrengthRings';
import {ProfileScoreExplainer} from './src/components/profile/ProfileScoreExplainer';
const locale = location.pathname.startsWith('/nl/') ? 'nl' : 'en';
function Gallery() {
 const [raised, setRaised] = useState(false);
 return <main className="mx-auto max-w-4xl space-y-8 p-4 sm:p-8">
  <h1 className="font-display text-3xl font-bold">Profile rings · visual fixture</h1>
  <div className="grid gap-8 sm:grid-cols-2">
   <ProfileStrengthRings locale={locale} score={{completeness: raised ? 41 : 33, reliability: raised ? 32 : 27}}
    nextStep={{label: locale === 'nl' ? 'Meet je armlengte' : 'Measure your arm length', gain: 8}} />
   <div style={{maxWidth:256}}><ProfileStrengthRings locale={locale} size="sm" score={{completeness:68,reliability:57}} /></div>
   <ProfileStrengthRings locale={locale} score={{completeness:0,reliability:0}} />
   <ProfileStrengthRings locale={locale} score={{completeness:100,reliability:100}} />
  </div><button className="min-h-11 rounded-xl border border-border px-6" onClick={()=>setRaised(true)}>Raise score</button>
 </main>;
}
createRoot(document.getElementById('root')).render(location.pathname.endsWith('/rings') ? <Gallery/> : <main><ProfileScoreExplainer locale={locale}/></main>);
`;
const bundle = await build({
  absWorkingDir: root, stdin: { contents: entry, resolveDir: root, loader: "jsx" },
  bundle: true, write: false, outdir: "/tmp/r3-memory", platform: "browser", format: "esm", jsx: "automatic",
  define: { "process.env.NODE_ENV": '"development"' }, logLevel: "error",
  plugins: [{ name: "r3-fixture", setup(builder) {
    builder.onResolve({ filter: /^next\/link$/ }, () => ({ path: "link", namespace: "fixture" }));
    builder.onLoad({ filter: /.*/, namespace: "fixture" }, () => ({
      contents: "import React from 'react'; export default function Link({href,children,...props}) { return <a href={href} {...props}>{children}</a>; }",
      loader: "jsx", resolveDir: root,
    }));
  } }],
});
const script = bundle.outputFiles.find(file => file.path.endsWith(".js")).contents;
const moduleCss = bundle.outputFiles.filter(file => file.path.endsWith(".css")).map(file => file.text).join("\n");
const globalsPath = resolve(root, "src/app/globals.css");
const globals = await postcss([tailwindcss({ base: root, optimize: false })])
  .process(await readFile(globalsPath, "utf8"), { from: globalsPath });
const fonts = `
@font-face{font-family:Figtree;src:url('/brand/report/fonts/figtree-latin.woff2')}
@font-face{font-family:'Bricolage Grotesque';src:url('/brand/report/fonts/bricolage-grotesque-latin.woff2')}
@font-face{font-family:'DM Mono';src:url('/brand/report/fonts/dm-mono-latin.woff2')}
:root{--font-body:Figtree;--font-display:'Bricolage Grotesque';--font-mono:'DM Mono'}
`;
const server = createServer(async (request, response) => {
  try {
    const url = new URL(request.url, "http://localhost");
    if (url.pathname === "/fixture.js") { response.setHeader("content-type", "text/javascript"); response.end(script); return; }
    if (url.pathname === "/fixture.css") { response.setHeader("content-type", "text/css"); response.end(globals.css + fonts + moduleCss); return; }
    if (extname(url.pathname)) {
      const file = resolve(root, "public", `.${decodeURIComponent(url.pathname)}`);
      if (!file.startsWith(resolve(root, "public") + "/")) throw new Error("Invalid asset");
      response.setHeader("content-type", "font/woff2"); response.end(await readFile(file)); return;
    }
    const locale = url.pathname.startsWith("/nl/") ? "nl" : "en";
    response.setHeader("content-type", "text/html");
    response.end(`<!doctype html><html lang="${locale}" class="${url.searchParams.get("theme") === "dark" ? "dark" : ""}"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>R3 isolated render</title><link rel="stylesheet" href="/fixture.css"></head><body><div id="root"></div><script type="module" src="/fixture.js"></script></body></html>`);
  } catch (error) { response.statusCode = 500; response.end(String(error)); }
});
await new Promise(done => server.listen(0, "127.0.0.1", done));
await mkdir(output, { recursive: true });
const browser = await chromium.launch({ headless: true });
const results = [];
try {
  for (const locale of ["nl", "en"]) for (const width of [1440, 390]) for (const theme of ["light", "dark"]) {
    for (const route of ["rings", "score"]) {
      const page = await browser.newPage({ viewport: { width, height: 1000 }, reducedMotion: "reduce" });
      const errors = [];
      page.on("pageerror", error => errors.push(error.message));
      page.on("console", message => { if (message.type() === "error") errors.push(message.text()); });
      await page.goto(`http://127.0.0.1:${server.address().port}/${locale}/${route}?theme=${theme}`);
      await page.getByRole("meter").first().waitFor();
      await page.evaluate(() => document.fonts.ready);
      assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false);
      assert.equal(await page.locator('circle[pathLength="100"]').first().evaluate(element => getComputedStyle(element).transitionDuration), "0s");
      await page.screenshot({ path: resolve(output, `R3-${route}-${locale}-${width}-${theme}.png`), fullPage: true });
      if (route === "rings") {
        await page.getByRole("button", { name: "Raise score" }).click();
        assert.equal(await page.getByRole("meter").first().getAttribute("aria-valuenow"), "41");
        await page.emulateMedia({ reducedMotion: "no-preference" });
        assert.equal(await page.locator('circle[pathLength="100"]').first().evaluate(element => getComputedStyle(element).transitionDuration), "0.45s");
      }
      assert.deepEqual(errors, []);
      results.push({ locale, width, theme, route, errors, overflow: false, reducedMotion: "pass" });
      await page.close();
    }
  }
  await writeFile(resolve(root, "plans/riderprofile/audit/R3-render-results.json"), JSON.stringify(results, null, 2) + "\n");
  console.log(`${results.length} render cases passed`);
} finally { await browser.close(); await new Promise(done => server.close(done)); }
