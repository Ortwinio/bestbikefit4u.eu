import { build } from "esbuild";
import postcss from "postcss";
import tailwindcss from "@tailwindcss/postcss";
import { chromium } from "playwright";
import { createServer } from "node:http";
import { readFile, mkdir, writeFile } from "node:fs/promises";
import { resolve, extname } from "node:path";

const root = process.cwd();
const output = resolve(root, "plans/riderprofile/renders");
const runtime = `
import { getFunctionName } from 'convex/server';
export const locale = location.pathname.startsWith('/nl/') ? 'nl' : 'en';
const conflict = new URLSearchParams(location.search).get('state') === 'conflict';
const context = { profile: conflict ? { inseamCm: 84 } : null, observations: [] };
export function useConvexAuth() { return { isAuthenticated: true, isLoading: false }; }
export function useQuery(reference, args) { if (args === 'skip') return undefined; if (getFunctionName(reference) !== 'profiles/queries:getHandoffContext') throw new Error('Unexpected query'); return context; }
export function useMutation() { return async args => { window.__importArgs = args; return { status: 'imported', importedFields: args.records.map(record => record.field), conflicts: [], profileId: null, bikeId: null }; }; }
export function useRouter() { return { replace: path => { window.__redirect = path; } }; }
export function usePathname() { return location.pathname; }
export function useTheme() { return { theme: 'light', resolvedTheme: 'light' }; }
`;
const entry = `
import React from 'react';
import { createRoot } from 'react-dom/client';
import WelcomeClient from './src/app/welcome/WelcomeClient';
import { writeHandoffEntry } from './src/lib/handoff/store';
const state = new URLSearchParams(location.search).get('state');
const touchedAt = Date.now() - 60000;
if (state !== 'empty') for (const [field,value,unit,calculator,method] of [
  ['inseamCm',83,'cm','saddle-height','measured'], ['heightCm',179,'cm','bike-fit','measured'],
  ['ridingGoal','balanced','none','saddle-height','declared'],
  ['bikeCategory','road','none','saddle-height','declared'], ['currentSaddleHeightMm',740,'mm','saddle-height','bike']
]) writeHandoffEntry({field,value,unit,calculator,method,touchedAt});
createRoot(document.getElementById('root')).render(<WelcomeClient />);
`;
const bundle = await build({
  absWorkingDir: root, stdin: { contents: entry, resolveDir: root, loader: "jsx" },
  bundle: true, write: false, outdir: "/tmp/r2-welcome-memory", platform: "browser", format: "esm", jsx: "automatic",
  define: { "process.env.NODE_ENV": '"development"', "process.env": "{}" }, logLevel: "error",
  plugins: [{ name: "welcome-fixture", setup(builder) {
    builder.onResolve({ filter: /^(convex\/react|next\/navigation|@\/components\/providers\/ThemeProvider)$/ }, () => ({ path: "runtime", namespace: "fixture" }));
    builder.onResolve({ filter: /^next\/(link|image)$/ }, args => ({ path: args.path, namespace: "fixture" }));
    builder.onLoad({ filter: /.*/, namespace: "fixture" }, args => ({ contents: args.path === "runtime" ? runtime : args.path === "next/link"
      ? "import React from 'react'; export default function Link({href,children,...props}) { return <a href={href} {...props}>{children}</a>; }"
      : "import React from 'react'; export default function Image({priority,fill,unoptimized,...props}) { return <img {...props}/>; }", loader: "jsx", resolveDir: root }));
  } }],
});
const script = bundle.outputFiles.find(file => file.path.endsWith(".js")).contents;
const moduleCss = bundle.outputFiles.filter(file => file.path.endsWith(".css")).map(file => file.text).join("\n");
const globalsPath = resolve(root, "src/app/globals.css");
const globals = await postcss([tailwindcss({ base: root, optimize: false })]).process(await readFile(globalsPath, "utf8"), { from: globalsPath });
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
      response.setHeader("content-type", extname(file) === ".svg" ? "image/svg+xml" : extname(file) === ".woff2" ? "font/woff2" : "application/octet-stream");
      response.end(await readFile(file)); return;
    }
    response.setHeader("content-type", "text/html");
    response.end(`<!doctype html><html lang="${url.pathname.startsWith("/nl/") ? "nl" : "en"}"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><link rel="stylesheet" href="/fixture.css"><title>Welcome fixture</title></head><body><div id="root"></div><script type="module" src="/fixture.js"></script></body></html>`);
  } catch { response.statusCode = 404; response.end(); }
});
await new Promise(done => server.listen(0, "127.0.0.1", done));
const origin = `http://127.0.0.1:${server.address().port}`;
await mkdir(output, { recursive: true });
const browser = await chromium.launch({ headless: true });
const results = [];
try {
  for (const locale of ["nl", "en"]) for (const width of [1440, 390]) for (const state of ["new", "conflict", "empty"]) {
    const context = await browser.newContext({ viewport: { width, height: width === 390 ? 844 : 1000 }, reducedMotion: "reduce", locale: locale === "nl" ? "nl-NL" : "en-GB" });
    await context.route("**/*", route => new URL(route.request().url()).origin === origin ? route.continue() : route.abort());
    const page = await context.newPage();
    const errors = [];
    page.on("pageerror", error => errors.push(error.message));
    await page.goto(`${origin}/${locale}/welcome?state=${state}`);
    await page.getByRole("heading", { level: 1 }).waitFor();
    if (state !== "empty") {
      await page.getByRole("button", { name: "Later", exact: true }).click();
      await page.getByRole("textbox", { name: locale === "nl" ? "Naam van je fiets" : "Your bike’s name" }).fill(locale === "nl" ? "Weekendfiets" : "Weekend bike");
      await page.getByRole("combobox", { name: locale === "nl" ? "Meetpunt zadelhoogte" : "Saddle height measurement point", exact: true }).click();
      await page.getByRole("option", { name: locale === "nl" ? "Midden trapas tot bovenkant zadel" : "Bottom bracket centre to saddle top" }).click();
    }
    await page.evaluate(() => document.fonts.ready);
    await page.evaluate(() => window.scrollTo(0, 0));
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth > innerWidth);
    const meters = await page.getByRole("meter").count();
    const file = `R2-welcome-${locale}-${state}-${width}.png`;
    await page.screenshot({ path: resolve(output, file), fullPage: true });
    if (state === "new") {
      await page.getByRole("button", { name: locale === "nl" ? "Pas aan: Standaard rijdoel" : "Adjust: Default riding goal" }).click();
      await page.getByRole("combobox", { name: locale === "nl" ? "Standaard rijdoel" : "Default riding goal" }).click();
      await page.getByRole("option", { name: "Comfort", exact: true }).click();
      await page.getByRole("button", { name: locale === "nl" ? "Bewaar en ga naar mijn dashboard" : "Save and go to my dashboard" }).click();
      await page.waitForFunction(() => window.__redirect);
      const importedGoal = await page.evaluate(() => window.__importArgs.records.find(record => record.field === "ridingGoal")?.value);
      if (importedGoal !== "comfort") errors.push("Enum adjustment was not submitted");
    }
    results.push({ locale, width, state, file, overflow, meters, errors });
    await context.close();
  }
} finally { await browser.close(); await new Promise(done => server.close(done)); }
await writeFile(resolve(output, "R2-welcome-results.json"), JSON.stringify(results, null, 2));
console.log(JSON.stringify(results, null, 2));
if (results.some(result => result.overflow || result.errors.length || result.meters !== (result.state === "empty" ? 2 : 4))) process.exitCode = 1;
