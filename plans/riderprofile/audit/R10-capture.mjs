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

// Real RP8 profile component, score engine, fonts and tokens; only backend and routing are deterministic fixtures.
const root = process.cwd();
const renders = resolve(root, "plans/riderprofile/renders");
await mkdir(renders, { recursive: true });
const entry = `
import { createRoot } from "react-dom/client";
import { BikeProfilePanel } from "@/components/bikes/BikeProfilePanel";
import { ThemeProvider } from "@/components/providers/ThemeProvider";
import { ToastProvider } from "@/components/ui/Toast";
import { useQuery } from "convex/react";
import { api } from "./convex/_generated/api";
function Fixture() {
 const detail=useQuery(api.bikes.queries.getDetail,{bikeId:'bike1'});
 const locale=location.pathname.startsWith('/en/')?'en':'nl';
 return <main className="mx-auto max-w-[1440px] space-y-6 px-4 py-8 sm:px-12">
 <header><h1 className="font-display text-4xl font-bold">{detail.bike.name}</h1></header>
 <BikeProfilePanel bikeId="bike1" locale={locale} detail={detail}/></main>;
}
createRoot(document.getElementById("root")).render(<ThemeProvider><ToastProvider><Fixture/></ToastProvider></ThemeProvider>);
`;
const runtime = `
import { useSyncExternalStore } from 'react';
import { getFunctionName } from 'convex/server';
import { scoreBike } from './shared/profileScore';
export * from '${resolve(root, "tests/visual/account-batch4/runtime.jsx")}';
const profile={heightCm:174,inseamCm:81,sitBoneWidthMm:128,positionPriority:'balanced'};
const bike={_id:'bike1',name:'Canyon Endurace',brand:'Canyon',model:'Endurace',year:2022,bikeType:'road',
 primaryGoal:'balanced',currentSetup:{saddleHeightMm:728,stemLengthMm:100,stemAngle:-6,
 handlebarWidthMm:400,crankLengthMm:170},currentGeometry:{stackMm:581,reachMm:383,
 seatTubeAngle:73,headTubeAngle:72,frameSize:'M'},gearing:{chainrings:[50,34],cassetteTeeth:[11,13,15,17,19,21,24,27,30]}};
const tire={widthFrontMm:28,widthRearMm:28,tubeType:'tubeless'};
const observedFields=['currentSetup.saddleHeightMm','currentSetup.stemLengthMm','currentSetup.stemAngle',
 'currentSetup.handlebarWidthMm','currentSetup.crankLengthMm','currentGeometry.stackMm','currentGeometry.reachMm',
 'currentGeometry.seatTubeAngle','currentGeometry.headTubeAngle','currentGeometry.frameSize',
 'brand','model','year','bikeType','primaryGoal','gearing.chainrings','gearing.cassetteTeeth'];
let observations=observedFields.map(field=>({field,value:field.split('.').reduce((node,key)=>node?.[key],bike),
 kind:field==='currentSetup.saddleHeightMm'?'measured':'declared',bikeId:'bike1',
 source:field.startsWith('currentGeometry.')?'geometry_database':'profile_edit',recordedAt:1790596800000,
 ...(field==='currentSetup.saddleHeightMm'?{measurePoint:'bb_center_to_saddle_top'}:{})}));
function detail(){return {bike,riderProfile:profile,profile,profileScore:scoreBike({bike:{...bike,tires:tire},observations},Date.now()),
 bikeObservations:observations,activeTireSetup:tire,adjustmentRoom:{status:'unknown',reason:'seatpost_extension_unknown'},
 latestRecommendation:{createdAt:1791021600000,calculatedFit:{saddleHeightMm:715,saddleSetbackMm:55,
 handlebarReachMm:505,handlebarDropMm:60,stemLengthMm:90,handlebarWidthMm:420,crankLengthMm:170}}};}
let version=0;const listeners=new Set();window.__bikeWrites=[];
export function useQuery(ref,args){useSyncExternalStore(fn=>{listeners.add(fn);return()=>listeners.delete(fn)},()=>version);
 if(args==='skip')return undefined;const name=getFunctionName(ref);
 if(name==='bikes/queries:getDetail')return detail();if(name==='users/queries:getCurrentUser')return {_id:'visual-user'};
 return null;}
export function useMutation(ref){return async args=>{const name=getFunctionName(ref);window.__bikeWrites.push({name,args});
 if(name==='bikes/profile:updateFields'){
 for(const change of args.changes){const [group,key]=change.field.split('.');
 if(key)bike[group]={...bike[group],[key]:change.value};else bike[group]=change.value;
 observations=observations.filter(item=>item.field!==change.field);
 observations.push({...change,recordedAt:change.measuredAt??Date.now(),source:'profile_edit',bikeId:'bike1'});}
 version++;listeners.forEach(fn=>fn());return {status:'saved',fields:args.changes.map(x=>x.field)};}
 return null;};}
`;
const bundle = await build({
  absWorkingDir: root, stdin: { contents: entry, loader: "jsx", resolveDir: root }, bundle: true,
  write: false, outdir: "/tmp/r10-bike-memory", format: "esm", platform: "browser", jsx: "automatic",
  logLevel: "error", define: { "process.env": "{}", "process.env.NODE_ENV": '"production"' },
  plugins: [{ name: "r10-fixture-boundaries", setup(builder) {
    builder.onResolve({ filter: /^convex\/react$/ }, () => ({ path: "r10-runtime", namespace: "fixture" }));
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
  + '<title>R10 actual bike profile</title><link rel="stylesheet" href="/fixture.css"></head>'
  + '<body><div id="root"></div><script type="module" src="/fixture.js"></script></body></html>';
const server = createServer(async (request, response) => {
  try {
    const pathname = new URL(request.url, "http://localhost").pathname;
    if (pathname === "/fixture.js") { response.setHeader("content-type", "text/javascript"); response.end(script); return; }
    if (pathname === "/fixture.css") {
      response.setHeader("content-type", "text/css"); response.end(styles.css + moduleCss + fonts); return;
    }
    if (pathname === "/board") { response.setHeader("content-type", "text/html"); response.end("<!doctype html><title>RP8 board</title>"); return; }
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
  await renderBoard(board, await readFile(resolve(root, "plans/riderprofile/boards/RP8Bike.dc.html"), "utf8"));
  await board.addStyleTag({ content: fonts + ".review-strip{display:none!important}" });
  await board.evaluate(() => document.fonts.ready);
  await board.screenshot({ path: resolve(renders, "R10-board-1440.png"), fullPage: true });
  await board.close();
  for (const locale of ["nl", "en"]) for (const width of [1440, 390]) {
    const context = await browser.newContext({ viewport: { width, height: 1000 }, reducedMotion: "reduce" });
    await context.route("https://**/*", (route) => route.abort());
    const page = await context.newPage();
    const errors=[];page.on("pageerror",error=>errors.push(error.message));
    await page.goto(`${origin}/${locale}/bikes/bike1`, {waitUntil:"networkidle"});
    await page.getByRole("meter").first().waitFor();
    await page.evaluate(()=>document.fonts.ready);
    const capture=async state=>page.screenshot({path:resolve(renders,`R10-bike-${locale}-${width}-${state}.png`),fullPage:true});
    await capture("baseline");
    assert.equal(await page.evaluate(()=>window.__bikeWrites.length),0);
    const before = Number(await page.getByRole("meter", {
      name: locale === "nl" ? "Fietsprofiel: Volledig" : "Bike profile: Complete", exact: true,
    }).getAttribute("aria-valuenow"));
    await page.getByRole("button", {name: locale === "nl" ? "Meet nu: Zadelterugstand" : "Measure now: Saddle setback"}).click();
    await page.getByRole("spinbutton").fill("60");
    await capture("editing");
    assert.equal(await page.evaluate(()=>window.__bikeWrites.length),0);
    await page.getByRole("combobox", {name: locale === "nl" ? "Hoe bepaald?" : "How was it determined?",exact:true})
      .click();
    await page.getByRole("option", {name:locale === "nl" ? "Gemeten" : "Measured",exact:true}).click();
    await page.locator('input[type="date"]').fill("2026-09-28");
    await page.getByRole("combobox", {name: locale === "nl" ? "Meetpunt" : "Reference point",exact:true})
      .click();
    await page.getByRole("option").last().click();
    await page.getByRole("button", {name:locale === "nl" ? "Bewaar bij deze fiets" : "Save to this bike",exact:true}).click();
    await page.getByRole("status").filter({hasText:locale === "nl" ? "Opgeslagen bij deze fiets" : "Saved to this bike"}).waitFor();
    await capture("saved");
    const after = Number(await page.getByRole("meter", {
      name: locale === "nl" ? "Fietsprofiel: Volledig" : "Bike profile: Complete",exact:true,
    }).getAttribute("aria-valuenow"));
    assert(after > before,"A real saved measurement must increase completeness");
    const writes=await page.evaluate(()=>window.__bikeWrites);
    assert.equal(writes.length,1);
    assert.equal(writes[0].args.changes[0].expectedCurrentValue,null);
    assert.equal(writes[0].args.changes[0].kind,"measured");
    assert.deepEqual(errors,[]);
    assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
    const comparison=await context.newPage();
    await comparison.setViewportSize({width:width*2,height:1000});
    await comparison.setContent(`<style>body{margin:0;font-family:sans-serif}.pair{display:grid;grid-template-columns:1fr 1fr}img{width:100%;display:block}h2{font-size:18px;padding:12px}</style>
      <div class="pair"><div><h2>RP8 board · desktop reference</h2><img src="${origin}/renders/R10-board-1440.png"></div>
      <div><h2>Actual bike profile · ${locale} · ${width}px</h2><img src="${origin}/renders/R10-bike-${locale}-${width}-baseline.png"></div></div>`,{waitUntil:"networkidle"});
    await comparison.evaluate(async()=>{await Promise.all([...document.images].map(image=>image.decode()));
      if([...document.images].some(image=>!image.naturalWidth))throw new Error("Comparison image missing");});
    await comparison.screenshot({path:resolve(renders,`R10-compare-${locale}-${width}.png`),fullPage:true});
    results.push({locale,width,errors,writes});await context.close();
  }
  await writeFile(resolve(root,"plans/riderprofile/audit/R10-browser.json"),JSON.stringify(results,null,2)+"\n");
} finally {await browser.close();await new Promise(done=>server.close(done));}
