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
const dashboardMounted = (await readFile(resolve(root,"src/app/(dashboard)/dashboard/page.tsx"),"utf8")).includes("<DashboardProfileStrength");
assert.equal(dashboardMounted,true,"Dashboard must mount the real R6 hero");
const runtime = `
export * from './tests/visual/account-batch1/runtime.jsx';
import {useQuery as baseQuery} from './tests/visual/account-batch1/runtime.jsx';
import {getFunctionName} from 'convex/server';
const state=new URLSearchParams(location.search).get('fixture');
const profile={_id:'visual-profile',userId:'visual-user',heightCm:178,inseamCm:83,weightKg:74,torsoLengthCm:59,shoulderWidthCm:40,femurLengthCm:43,flexibilityScore:'average',coreStabilityScore:3,positionPriority:'balanced',experienceLevel:'intermediate',weeklyHours:'3-6',typicalRideLength:'medium',hasPain:'no'};
const observations=Object.entries(profile).filter(([field])=>!['_id','userId'].includes(field)).map(([field,value])=>({field,value,kind:field==='torsoLengthCm'?'derived':typeof value==='number'?'measured':'declared',method:field==='torsoLengthCm'?'legacy_height_formula':typeof value==='number'?'single_measurement':'self_report',source:'profile_edit',recordedAt:Date.now(),status:'current'}));
const prompts={cardId:'fixture-hidden',shownAt:Date.now(),hiddenUntil:Date.now()+86400000,questions:[]};
export function useQuery(reference,args) {
 if(args==='skip') return undefined;
 const name=getFunctionName(reference);
 if(name==='profiles/queries:nextPrompts') return prompts;
 if(name==='profiles/queries:getMyProfile') return state==='loading'?undefined:state==='empty'?null:profile;
 if(['profiles/queries:getMyProvenance','profiles/queries:getHandoffContext'].includes(name)) return state==='loading'?undefined:{profile:state==='empty'?null:profile,observations:state==='empty'?[]:observations};
 return baseQuery(reference,args);
}
export function useTheme(){return {theme:document.documentElement.classList.contains('dark')?'dark':'light',resolvedTheme:document.documentElement.classList.contains('dark')?'dark':'light'};}
`;
const entry = `
import React from 'react';
import {createRoot} from 'react-dom/client';
import DashboardPage from './src/app/(dashboard)/dashboard/page';
import DashboardLayout from './src/app/(dashboard)/DashboardLayoutClient';
import {ToastProvider} from './src/components/ui';
import {AdviceReliability} from './src/components/profile/AdviceReliability';
import {scoreAdviceReliability} from './shared/profileScore';
const locale=location.pathname.startsWith('/nl/')?'nl':'en';
const empty=new URLSearchParams(location.search).get('fixture')==='empty';
const now=Date.now();
const adviceScore=scoreAdviceReliability({profile:empty?{}:{inseamCm:81},observations:empty?[]:[{field:'inseamCm',value:81,kind:'measured',recordedAt:now}],riderFields:['inseamCm','flexibilityScore'],bikeFields:[]},now);
createRoot(document.getElementById('root')).render(<ToastProvider><DashboardLayout>{location.pathname.endsWith('/advice-fixture')?<div className="max-w-2xl space-y-6"><h1 className="font-display text-3xl">{locale==='nl'?'Voorbeeld van adviesbetrouwbaarheid':'Advice reliability example'}</h1><AdviceReliability locale={locale} score={adviceScore}/></div>:<DashboardPage/>}</DashboardLayout></ToastProvider>);
`;
const bundle = await build({
  absWorkingDir: root, stdin: { contents: entry, resolveDir: root, loader: "jsx" },
  bundle: true, write: false, outdir: "/tmp/r6-memory", platform: "browser", format: "esm", jsx: "automatic",
  define: { "process.env.NODE_ENV": '"development"', "process.env": "{}" }, logLevel: "error",
  plugins: [{ name: "r6-fixture", setup(builder) {
    builder.onResolve({ filter: /^(convex\/react|@convex-dev\/auth\/react|@sentry\/nextjs|next\/navigation|@\/i18n\/request|@\/components\/providers\/ThemeProvider)$/ }, () => ({ path: "runtime", namespace: "fixture" }));
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
    response.end(`<!doctype html><html lang="${url.pathname.startsWith("/nl/") ? "nl" : "en"}" class="${url.searchParams.get("theme") === "dark" ? "dark" : ""}"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><link rel="stylesheet" href="/fixture.css"><title>R6 real-component fixture</title></head><body><div id="root"></div><script type="module" src="/fixture.js"></script></body></html>`);
  } catch { response.statusCode = 404; response.end(); }
});
await new Promise(done => server.listen(0, "127.0.0.1", done));
const origin = `http://127.0.0.1:${server.address().port}`;
await mkdir(output, { recursive: true });
const browser = await chromium.launch({ headless: true });
const results = [];
try {
  for (const locale of ["nl", "en"]) for (const width of [1440, 390]) for (const theme of ["light", "dark"]) for (const route of ["dashboard", "advice-fixture"]) for (const state of route === "dashboard" ? ["filled", "empty", "loading"] : ["filled", "empty"]) {
    const page = await browser.newPage({ viewport: { width, height: width === 390 ? 844 : 1000 }, reducedMotion: "reduce", locale: locale === "nl" ? "nl-NL" : "en-GB" });
    const errors = [];
    page.on("pageerror", error => errors.push(error.message));
    page.on("console", message => { if (message.type() === "error") errors.push(message.text()); });
    await page.goto(`${origin}/${locale}/${route}?fixture=${state}&theme=${theme}`);
    await page.locator("#root > div").first().waitFor();
    await page.evaluate(() => document.fonts.ready);
    await page.waitForTimeout(150);
    const meters = await page.getByRole("meter").filter({visible:true}).evaluateAll(elements=>elements.filter(element=>element.hasAttribute("aria-valuetext")).map(element=>({label:element.getAttribute("aria-label"),value:element.getAttribute("aria-valuenow"),text:element.getAttribute("aria-valuetext")})));
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth > innerWidth);
    const file = `R6-${route}-${locale}-${state}-${width}-${theme}.png`;
    await page.screenshot({ path: resolve(output, file), fullPage: true });
    if(route === "dashboard" && state === "filled") await page.screenshot({path:resolve(output,file.replace(".png","-viewport.png"))});
    assert.equal(overflow, false, file);
    assert.deepEqual(errors, [], file);
    if(state!=="loading") {
      assert.ok(meters.length >= (route === "dashboard" ? 4 : 3), `${file}: sidebar/mobile and content meters present`);
      assert.ok(meters.every(meter=>meter.label && meter.text && Number(meter.value)>=0), file);
      if(state==="empty") assert.ok(meters.every(meter=>Number(meter.value)===0), file);
      const profileLinks = await page.getByRole("meter").evaluateAll(elements=>elements.filter(element=>element.getBoundingClientRect().width>0).map(element=>element.closest("a")?.getAttribute("href")).filter(Boolean));
      assert.ok(profileLinks.length>=2 && profileLinks.every(href=>href===`/${locale}/profile`), `${file}: shell rings link to localized profile`);
    }
    results.push({locale,width,theme,route,state,file,overflow,errors,meters,dashboardMounted});
    await page.close();
  }
} finally { await browser.close(); await new Promise(done => server.close(done)); }
await writeFile(resolve(root,"plans/riderprofile/audit/R6-render-results.json"), JSON.stringify(results,null,2)+"\n");
console.log(`${results.length} R6 render cases passed`);
