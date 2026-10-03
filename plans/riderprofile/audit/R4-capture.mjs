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
import { AccountFitCalculator } from "@/components/calculators/AccountFitCalculator";
import { ThemeProvider } from "@/components/providers/ThemeProvider";
import { ToastProvider } from "@/components/ui/Toast";
createRoot(document.getElementById("root")).render(<ThemeProvider><ToastProvider>
<main><AccountFitCalculator calculator="saddle-height" /></main></ToastProvider></ThemeProvider>);
`;
const runtime = `
import { useSyncExternalStore } from 'react';
import { getFunctionName } from 'convex/server';
export * from '${resolve(root, "tests/visual/account-batch4/runtime.jsx")}';
const profile = {heightCm:180,inseamCm:84,weightKg:75,flexibilityScore:'good',coreStabilityScore:3};
const bike={_id:'bike1',name:'Voorbeeldfiets',bikeType:'road',primaryGoal:'comfort',currentSetup:{crankLengthMm:172.5}};
let version=0; const listeners=new Set();
window.__chainWrites=[];
export function useQuery(ref,args){useSyncExternalStore(fn=>{listeners.add(fn);return()=>listeners.delete(fn)},()=>version);
 if(args==='skip')return undefined; const name=getFunctionName(ref);
 if(name==='users/queries:getCurrentUser')return {_id:'visual-user'};
 if(name==='bikes/queries:list')return [bike];
 if(name==='calculatorStates/queries:get')return null;
 if(name==='calculatorChain/queries:getContext')return {profile,bikes:[bike],observations:[{field:'inseamCm',value:profile.inseamCm,kind:'measured',recordedAt:1791021600000}],bikeObservations:[],advice:[],recentCalculators:[]};
 return null;
}
export function useMutation(ref){return async args=>{const name=getFunctionName(ref);window.__chainWrites.push({name,args});
 if(name==='calculatorChain/mutations:applyChanges'){for(const change of args.changes){if(change.source==='profile')profile[change.field]=change.value;}version++;listeners.forEach(fn=>fn());return {status:'saved',fields:args.changes.map(x=>x.field)};}return 'fixture';};}
`;
const bundle = await build({
  absWorkingDir: root, stdin: { contents: entry, loader: "jsx", resolveDir: root }, bundle: true,
  write: false, outdir: "/tmp/r1-public-memory", format: "esm", platform: "browser", jsx: "automatic",
  logLevel: "error", define: { "process.env": "{}", "process.env.NODE_ENV": '"production"' },
  plugins: [{ name: "r1-fixture-boundaries", setup(builder) {
    builder.onResolve({ filter: /^convex\/react$/ }, () => ({ path: "r4-runtime", namespace: "fixture" }));
    builder.onLoad({ filter: /.*/, namespace: "fixture" }, () => ({ contents: runtime, loader: "jsx", resolveDir: root }));
    builder.onResolve({ filter: /^(@convex-dev\/auth\/react|next\/navigation|@\/i18n\/request|@sentry\/nextjs|@\/components\/feedback\/FeedbackPanelProvider)$/ },
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
  + '<title>R4 actual account calculator</title><link rel="stylesheet" href="/fixture.css"></head>'
  + '<body><div id="root"></div><script type="module" src="/fixture.js"></script></body></html>';
const server = createServer(async (request, response) => {
  try {
    const pathname = new URL(request.url, "http://localhost").pathname;
    if (pathname === "/fixture.js") { response.setHeader("content-type", "text/javascript"); response.end(script); return; }
    if (pathname === "/fixture.css") {
      response.setHeader("content-type", "text/css"); response.end(styles.css + moduleCss + fonts); return;
    }
    if (pathname === "/board") { response.setHeader("content-type", "text/html"); response.end("<!doctype html><title>RP6 board</title>"); return; }
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
  await renderBoard(board, await readFile(resolve(root, "plans/riderprofile/boards/RP6SaddleAccount.dc.html"), "utf8"));
  await board.addStyleTag({ content: fonts + ".review-strip{display:none!important}" });
  await board.evaluate(() => document.fonts.ready);
  await board.screenshot({ path: resolve(renders, "R4-board-1440.png"), fullPage: true });
  await board.close();
  for (const locale of ["nl", "en"]) for (const width of [1440, 390]) {
    const context = await browser.newContext({ viewport: { width, height: 1000 }, reducedMotion: "reduce" });
    await context.route("https://**/*", (route) => route.abort());
    const page = await context.newPage();
    const errors=[];page.on("pageerror",error=>errors.push(error.message));
    await page.goto(`${origin}/${locale}/tools/saddle-height?bikeId=bike1`, {waitUntil:"networkidle"});
    await page.getByRole("slider").first().waitFor({state:"attached"});
    await page.evaluate(()=>document.fonts.ready);
    const capture=async state=>page.screenshot({path:resolve(renders,`R4-saddle-${locale}-${width}-${state}.png`),fullPage:true});
    await capture("baseline");
    const summary=page.locator("summary").first();
    if(!(await page.locator("details").first().evaluate(el=>el.open)))await summary.click();
    await page.getByRole("slider").first().press("ArrowRight");
    await page.getByRole("button",{name:locale==="nl"?"Alleen voor deze berekening":"Only for this calculation",exact:true}).waitFor();
    await capture("pending");
    assert.equal(await page.evaluate(()=>window.__chainWrites.length),0);
    await page.getByRole("button",{name:locale==="nl"?"Alleen voor deze berekening":"Only for this calculation",exact:true}).click();
    await capture("trial");
    assert.equal(await page.evaluate(()=>window.__chainWrites.length),0);
    await page.getByRole("slider").first().press("ArrowRight");
    await page.getByRole("button",{name:locale==="nl"?"Opslaan in profiel en fiets":"Save to profile and bike",exact:true}).click();
    await page.waitForTimeout(100);
    await capture("saved");
    const writes=await page.evaluate(()=>window.__chainWrites);
    assert(writes.some(write=>write.name==="calculatorChain/mutations:applyChanges"));
    assert.deepEqual(errors,[]);
    assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
    const comparison=await context.newPage();
    await comparison.setViewportSize({width:width*2,height:1000});
    await comparison.setContent(`<style>body{margin:0;font-family:sans-serif}.pair{display:grid;grid-template-columns:1fr 1fr}img{width:100%;display:block}h2{font-size:18px;padding:12px}</style>
      <div class="pair"><div><h2>RP6 board · desktop reference</h2><img src="${origin}/renders/R4-board-1440.png"></div>
      <div><h2>Actual account calculator · ${locale} · ${width}px</h2><img src="${origin}/renders/R4-saddle-${locale}-${width}-baseline.png"></div></div>`,{waitUntil:"networkidle"});
    await comparison.evaluate(async()=>{await Promise.all([...document.images].map(image=>image.decode()));
      if([...document.images].some(image=>!image.naturalWidth))throw new Error("Comparison image missing");});
    await comparison.screenshot({path:resolve(renders,`R4-compare-${locale}-${width}.png`),fullPage:true});
    results.push({locale,width,errors,writes});await context.close();
  }
  await writeFile(resolve(root,"plans/riderprofile/audit/R4-browser.json"),JSON.stringify(results,null,2)+"\n");
} finally {await browser.close();await new Promise(done=>server.close(done));}
