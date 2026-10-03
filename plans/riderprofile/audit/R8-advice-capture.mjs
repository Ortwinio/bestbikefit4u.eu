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
assert.equal(root, "/Users/ortwinverreck/Developer/bestbikefit4u-rider");
const output = resolve(root, "plans/riderprofile/renders");
const progressRun = process.env.R16_RENDER === "1";
await mkdir(output, { recursive: true });
await readFile(resolve(root, "src/components/profile/AdviceGroupsView.tsx"));
const runtime = `
import {useSyncExternalStore} from 'react';
export * from './tests/visual/account-batch1/runtime.jsx';
import {useQuery as baseQuery} from './tests/visual/account-batch1/runtime.jsx';
import {getFunctionName} from 'convex/server';
import {ADVICE_GROUPS,type AdviceGroup,type AdviceItem} from './shared/advice/types';
import type {RecalculationResult} from './src/app/(dashboard)/profile/advice/AdvicePageClient';
const params=new URLSearchParams(location.search);
const state=params.get('state');
const date=Date.UTC(2026,9,1,12);
const bikeId='fixture-road';
const bikes=[{_id:bikeId,name:'Fixture Endurance'},{_id:'fixture-gravel',name:'Fixture Gravel'}];
function item(key:string,value:number|string|null,unit:string|null,extra:Partial<AdviceItem>={}):AdviceItem {
 return {id:'fixture-'+key,recordId:'fixture-record-'+key,key,bikeId,value,unit,range:null,current:null,difference:null,
 source:key.startsWith('pressure')?'pressureCalculations':key==='saddleWidthMm'?'saddleWidthSessions':key==='ftp-wkg'||key==='frameSize'?'calculatorStates':'recommendations',adviceRevision:0,eligibleRideFeedback:[],
 reliability:{value:82,reason:'engine_confidence'},status:'new',date,
 staleness:{stale:false,status:'current',reasons:[]},sourceLink:'/fit/fixture-session/results',changeOrder:2,...extra};
}
const entries:Record<string,AdviceItem[]>={
 seating:[item('saddleHeightMm',754,'mm',{range:{min:731,max:774},current:760,difference:-6})],
 contact:[item('saddleWidthMm',143,'mm',{range:{min:138,max:148},current:143,difference:0,sourceLink:'/saddle-selector'})],
 cockpit:[item('handlebarDropMm',98,'mm',{current:90,difference:8,reliability:{value:null,reason:'unknown'},staleness:{stale:false,status:'unknown',reasons:[{reason:'legacy_provenance'}]}})],
 drivetrain:[item('crankLengthMm',172.5,'mm',{current:175,difference:-2.5})],
 tires:['pressureFrontBar','pressureRearBar'].map((key,index)=>item(key,index?5.3:5,'bar',{current:index?5.4:5.1,difference:-0.1,status:'stale',sourceLink:'/pressure-calculator',staleness:{stale:true,status:'stale',reasons:[{field:'weightKg',reason:'value_changed',bikeId}]}})),
 performance:[item('ftp-wkg',null,null,{bikeId:null,status:'needs_calculation',reliability:{value:null,reason:'saved_inputs_only'},staleness:{stale:false,status:'unknown',reasons:[{field:'ftpWatts',reason:'missing_input'}]},sourceLink:'/tools/ftp-wkg'})],
 frame:[item('frameSize','56-57 cm','',{bikeId:null,sourceLink:'/tools/frame-size'})],
};
let groups:AdviceGroup[]=ADVICE_GROUPS.map(key=>({key,titleKey:key,items:state==='empty'?[]:entries[key],
 improvements:state==='empty'?[]:[{key:'arm',field:'armLengthCm',gain:6.8,sourceLink:'/profile/improve/body-measurements'}]}));
let revision=0;
const listeners=new Set<()=>void>();
const subscribe=(listener:()=>void)=>{listeners.add(listener);return()=>listeners.delete(listener);};
const publish=()=>{revision++;listeners.forEach(listener=>listener());};
const mutations:Array<{name:string,args:unknown}>=[];
const controls={mutations,release:()=>{},getGroups:()=>groups};
Object.assign(window,{__R8:controls});
export function useQuery(reference:Parameters<typeof getFunctionName>[0],args:unknown){
 useSyncExternalStore(subscribe,()=>revision,()=>revision);
 if(args==='skip')return undefined;
 const name=getFunctionName(reference);
 if(name==='advice/queries:listAdviceGroups')return groups;
 if(name==='bikes/queries:listSummariesByUser')return bikes;
 if(name==='profiles/queries:getMyProvenance')return {profile:{heightCm:178,inseamCm:83,weightKg:74},observations:[]};
 return baseQuery(reference,args);
}
export function useMutation(reference:Parameters<typeof getFunctionName>[0]){return async(args:unknown)=>{
 const name=getFunctionName(reference);mutations.push({name,args});
 if(name==='profiles/mutations:recordPromptInterest'||name==='users/mutations:setLocale')return null;
 if(name==='advice/progress:markPerformed'||name==='advice/progress:submitFeedback'){
  const input=args as {recordId:string;key:string;expectedRevision:number;performedAt:number;note?:string;result:'better'|'same'|'worse';rideFeedbackId?:string};
  const current=groups.flatMap(group=>group.items).find(entry=>entry.recordId===input.recordId&&entry.key===input.key);
  if(!current||current.adviceRevision!==input.expectedRevision)throw new Error('ADVICE_CHANGED');
  const mark=name==='advice/progress:markPerformed';
  if((mark&&state==='performed-error')||(!mark&&state==='feedback-error'))throw new Error('Simulated fixture save failure');
  if(mark&&state==='performed-pending')await new Promise<void>(done=>{controls.release=done;});
  const progress=mark?{key:input.key,performedAt:input.performedAt,note:input.note}:
   {...current.progress!,feedback:{result:input.result,note:input.note,recordedAt:Date.UTC(2026,9,3),rideFeedbackId:input.rideFeedbackId}};
  groups=groups.map(group=>({...group,items:group.items.map(entry=>entry.id!==current.id?entry:{...entry,progress,
   eligibleRideFeedback:[{id:'fixture-ride',date:Date.UTC(2026,9,3),note:'Fixture ride note'}],
   status:entry.staleness.stale?'stale':mark?'waiting_feedback':'performed'})}));
  publish();return {status:mark?'waiting_feedback':'performed'};
 }
 if(name!=='advice/mutations:recalculateAll')throw new Error('Unexpected fixture mutation '+name);
 if(state==='error')throw new Error('Local simulated recalculation failure');
 if(state==='pending')await new Promise<void>(done=>{controls.release=done;});
 if(state==='mixedpending'||state==='pending')return {items:[
 {source:'fit',id:'fixture-session',status:'pending',replacementId:'fixture-new-session'},
 {source:'pressure',id:'fixture-pressure',status:'failed',reason:'CALCULATION_FAILED'},
 {source:'calculator',id:'fixture-ftp',status:'skipped',reason:'MISSING_CURRENT_INPUTS'}]} satisfies RecalculationResult;
 groups=groups.map(group=>({...group,items:group.items.map(entry=>({...entry,
 value:entry.key==='pressureFrontBar'?4.9:entry.key==='pressureRearBar'?5.2:entry.key==='ftp-wkg'?3.2:entry.value,
 key:entry.key==='ftp-wkg'?'wattsPerKg':entry.key,unit:entry.key==='ftp-wkg'?'W/kg':entry.unit,
 difference:entry.key.startsWith('pressure')?-0.2:entry.difference,
 reliability:entry.key==='ftp-wkg'?{value:null,reason:'unknown'}:entry.reliability,
 status:'new',progress:undefined,adviceRevision:entry.adviceRevision+1,staleness:{stale:false,status:'current',reasons:[]}}))}));
 publish();return {items:[{source:'pressure',id:'fixture-pressure',status:'updated'}]} satisfies RecalculationResult;
};}
export function useTheme(){const theme=params.get('theme')==='dark'?'dark':'light';return {theme,resolvedTheme:theme,setTheme(){}};}
`;
const bundle = await build({
  absWorkingDir: root, bundle: true, write: false, outdir: "/tmp/r8-advice-memory", format: "esm", platform: "browser", jsx: "automatic",
  stdin: { resolveDir: root, loader: "jsx", contents: `
    import {createRoot} from 'react-dom/client';
import DashboardLayout from './src/app/(dashboard)/DashboardLayoutClient';
    import {AdvicePageClient} from './src/app/(dashboard)/profile/advice/AdvicePageClient';
    import {ToastProvider} from './src/components/ui';
    const locale=location.pathname.split('/')[1];
    createRoot(document.getElementById('root')).render(<ToastProvider><DashboardLayout><AdvicePageClient locale={locale}/></DashboardLayout></ToastProvider>);` },
  define: { "process.env.NODE_ENV": '"production"', "process.env": "{}" },
  plugins: [{ name: "r8-advice-fixture", setup(builder) {
    builder.onResolve({ filter: /^(convex\/react|@convex-dev\/auth\/react|@sentry\/nextjs|next\/navigation|@\/i18n\/request|@\/components\/providers\/ThemeProvider)$/ },
      () => ({ path: "runtime", namespace: "fixture" }));
    builder.onLoad({ filter: /.*/, namespace: "fixture" }, () => ({ contents: runtime, loader: "ts", resolveDir: root }));
    for (const name of ["link", "image"]) builder.onResolve({ filter: new RegExp('^next/'+name+'$') },
      () => ({ path: resolve(root, 'tests/visual/account-batch1/'+name+'.jsx') }));
  } }],
});
const globals = resolve(root, "src/app/globals.css");
const compiled = await postcss([tailwind({ base: root })]).process(await readFile(globals, "utf8"), { from: globals });
const fonts = `@font-face{font-family:Figtree;src:url('/brand/report/fonts/figtree-latin.woff2')}
@font-face{font-family:Bricolage;src:url('/brand/report/fonts/bricolage-grotesque-latin.woff2')}
@font-face{font-family:DMMono;src:url('/brand/report/fonts/dm-mono-latin.woff2')}
:root{--font-body:Figtree;--font-display:Bricolage;--font-mono:DMMono}body{font-family:Figtree,sans-serif}`;
const script = bundle.outputFiles.find(file => file.path.endsWith(".js")).text;
const moduleCss = bundle.outputFiles.filter(file => file.path.endsWith(".css")).map(file => file.text).join("\n");
const server = createServer(async (request, response) => {
  const url = new URL(request.url, "http://localhost");
  if (url.pathname === "/fixture.js") { response.setHeader("Content-Type", "text/javascript"); response.end(script); }
  else if (url.pathname === "/fixture.css") { response.setHeader("Content-Type", "text/css"); response.end(compiled.css + moduleCss + fonts); }
  else if (/^\/(nl|en)\/profile\/advice$/.test(url.pathname)) {
    response.setHeader("Content-Type", "text/html");
    response.end(`<!doctype html><html lang="${url.pathname.split('/')[1]}" class="${url.searchParams.get('theme') === 'dark' ? 'dark' : ''}"><head><title>${url.pathname.startsWith('/nl') ? 'Mijn advies' : 'My advice'} — BestBikeFit4U</title><meta name="viewport" content="width=device-width,initial-scale=1"><link rel="stylesheet" href="/fixture.css"></head><body class="antialiased"><div id="root"></div><script type="module" src="/fixture.js"></script></body></html>`);
  } else {
    const target = resolve(root, "public", `.${url.pathname}`);
    if (!target.startsWith(resolve(root, "public") + "/")) { response.writeHead(404); response.end(); return; }
    try {
      const types = { ".svg": "image/svg+xml", ".woff2": "font/woff2", ".png": "image/png", ".webp": "image/webp", ".ico": "image/x-icon" };
      response.setHeader("Content-Type", types[extname(target)] || "application/octet-stream");
      response.end(await readFile(target));
    } catch { response.writeHead(404); response.end(); }
  }
});
await new Promise(done => server.listen(0, "127.0.0.1", done));
const origin = `http://127.0.0.1:${server.address().port}`;
let browser;
const results = [];
try {
  browser = await chromium.launch({ headless: true });
  const states = progressRun ? ["performed-form", "performed-pending", "waiting", "feedback-form", "better", "same", "worse", "linked", "performed-error", "feedback-error", "recalc-reset", "stale-progress"]
    : ["stale", "after-recalc", "pending", "mixedpending", "error", "empty", "filter", "stale-dark"];
  for (const locale of ["nl", "en"]) for (const width of [1440, 390]) for (const state of states) {
    const context = await browser.newContext({ viewport: { width, height: 1000 }, serviceWorkers: "block", reducedMotion: "reduce" });
    const blocked = [];
    await context.route("**/*", route => {
      if (new URL(route.request().url()).origin === origin) return route.continue();
      blocked.push(route.request().url());return route.abort();
    });
    await context.routeWebSocket(/.*/, socket => { blocked.push(socket.url()); socket.close(); });
    const page = await context.newPage();
    const errors = [];
    page.on("pageerror", error => errors.push(error.message));
    page.on("console", message => { if (message.type() === "error") errors.push(message.text()); });
    await page.goto(`${origin}/${locale}/profile/advice?state=${state}&theme=${state.endsWith('dark') ? 'dark' : 'light'}`);
    await page.getByRole("heading", { name: locale === "nl" ? "Mijn adviezen" : "My advice", exact: true }).waitFor();
    const articles = page.locator("#main-content article");
    const before = await articles.allTextContents();
    assert.equal(before.length, state === "empty" ? 0 : 8);
    const recalc = page.getByRole("button", { name: locale === "nl" ? "Herbereken alle adviezen" : "Recalculate all advice", exact: true });
    if (progressRun) {
      const target = state === "stale-progress" ? articles.nth(4) : articles.first();
      await target.getByRole("button", { name: locale === "nl" ? "Markeer als uitgevoerd" : "Mark as performed", exact: true }).click();
      await target.getByLabel(locale === "nl" ? "Datum van de aanpassing" : "Adjustment date", { exact: true }).fill("2026-10-02");
      await target.getByLabel(locale === "nl" ? "Notitie (optioneel)" : "Note (optional)", { exact: true }).fill(locale === "nl" ? "Zadel rustig aangepast." : "Adjusted the saddle carefully.");
      if (state !== "performed-form") {
        await target.getByRole("button", { name: locale === "nl" ? "Aanpassing bewaren" : "Save adjustment", exact: true }).click();
        if (state === "performed-error") await target.getByRole("alert").waitFor();
        else if (state === "performed-pending") await target.getByRole("button", { name: locale === "nl" ? "Bewaren…" : "Saving…", exact: true }).waitFor();
        else {
          await target.getByRole("button", { name: locale === "nl" ? "Geef ritfeedback" : "Give ride feedback", exact: true }).waitFor();
          const stored = await page.evaluate(() => window.__R8.getGroups().flatMap(group => group.items).find(item => item.progress)?.progress);
          assert.equal(stored.performedAt, Date.UTC(2026, 9, 2));
          assert.ok(stored.note);
          if (["feedback-form", "better", "same", "worse", "linked", "feedback-error", "recalc-reset"].includes(state)) {
            await target.getByRole("button", { name: locale === "nl" ? "Geef ritfeedback" : "Give ride feedback", exact: true }).click();
            assert.equal(await target.getByRole("radio", { checked: true }).count(), 0);
            if (state !== "feedback-form") {
              const choice = state === "same" ? (locale === "nl" ? "Hetzelfde" : "The same") : state === "worse" ? (locale === "nl" ? "Slechter" : "Worse") : (locale === "nl" ? "Beter" : "Better");
              await target.getByRole("radio", { name: choice, exact: true }).check();
              await target.getByLabel(locale === "nl" ? "Notitie (optioneel)" : "Note (optional)", { exact: true }).fill(locale === "nl" ? "Getest op mijn vaste route." : "Tested on my usual route.");
              if (state === "linked") {
                await target.getByRole("combobox").click();
                await page.getByRole("option", { name: locale === "nl" ? "3-10-2026" : "03/10/2026", exact: true }).click();
              }
              await target.getByRole("button", { name: locale === "nl" ? "Ritfeedback bewaren" : "Save ride feedback", exact: true }).click();
              if (state === "feedback-error") await target.getByRole("alert").waitFor();
              else await target.getByText(locale === "nl" ? "Uitgevoerd" : "Performed", { exact: true }).first().waitFor();
            }
          }
          if (state === "recalc-reset") {
            await recalc.click();
            await target.getByRole("button", { name: locale === "nl" ? "Markeer als uitgevoerd" : "Mark as performed", exact: true }).waitFor();
            const current = await page.evaluate(() => window.__R8.getGroups()[0].items[0]);
            assert.equal(current.progress, undefined);
            assert.equal(current.adviceRevision, 1);
            assert.equal(current.status, "new");
          }
        }
      }
    }
    if (["after-recalc", "pending", "mixedpending", "error"].includes(state)) {
      await recalc.click();
      if (state === "pending") {
        await page.getByRole("button", { name: locale === "nl" ? "Adviezen herberekenen…" : "Recalculating advice…", exact: true }).waitFor();
      } else if (state === "error") await page.getByRole("alert").waitFor();
      else await page.getByRole("heading", { name: locale === "nl" ? "Resultaat van herberekenen" : "Recalculation result" }).waitFor();
      if (state !== "after-recalc") assert.deepEqual(await articles.allTextContents(), before, "Existing advice must survive failed/pending recalculation");
      else assert.ok((await articles.allTextContents()).some(text => text.includes(locale === "nl" ? "4,9" : "4.9")));
      assert.deepEqual(await page.evaluate(() => window.__R8.mutations), [{ name: "advice/mutations:recalculateAll", args: {} }]);
    }
    if (state === "filter") {
      await page.getByRole("button", { name: "Fixture Endurance", exact: true }).click();
      assert.equal(await articles.count(), 6);
      await page.getByRole("button", { name: locale === "nl" ? "Rijder" : "Rider", exact: true }).click();
      assert.equal(await articles.count(), 2);
    }
    if (progressRun) {
      const current = await page.evaluate(() => window.__R8.getGroups().flatMap(group => group.items));
      const target = state === "stale-progress" ? current[4] : current[0];
      if (["performed-form", "performed-pending", "performed-error"].includes(state)) assert.equal(target.progress, undefined);
      if (state === "feedback-error") { assert.equal(target.status, "waiting_feedback"); assert.equal(target.progress.feedback, undefined); }
      if (state === "stale-progress") { assert.equal(target.status, "stale"); assert.ok(target.progress); }
      if (["better", "same", "worse"].includes(state)) assert.equal(target.progress.feedback.result, state);
      if (state === "linked") assert.equal(target.progress.feedback.rideFeedbackId, "fixture-ride");
    }
    const groupCount = await page.locator('#main-content section[aria-label]').filter({ has: page.locator('header h2') }).count();
    assert.equal(groupCount, 7, "Seven stable advice groups");
    await page.evaluate(async () => { await document.fonts.ready; await Promise.all([...document.images].map(image => image.decode().catch(() => {}))); window.scrollTo(0, 0); });
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth > innerWidth);
    const file = `${progressRun ? "R16" : "R8"}-advice-${state}-${locale}-${width}.png`;
    const accessibility = progressRun ? await new AxeBuilder({ page }).analyze() : undefined;
    await page.screenshot({ path: resolve(output, file), fullPage: true, animations: "disabled" });
    if (progressRun) {
      await page.evaluate(() => {
        for (const element of document.querySelectorAll("body *")) {
          if (["fixed", "sticky"].includes(getComputedStyle(element).position)) {
            element.setAttribute("data-render-fixed-shell", "");
          }
        }
      });
      await (state === "stale-progress" ? articles.nth(4) : articles.first()).screenshot({
        path: resolve(output, file.replace(".png", "-detail.png")), animations: "disabled",
        style: "[data-render-fixed-shell] { visibility: hidden !important; }",
      });
    }
    results.push({ file, locale, width, state, groups: groupCount, overflow, errors, blocked,
      ...(accessibility ? { accessibility: { violations: accessibility.violations, incomplete: accessibility.incomplete } } : {}),
    });
    if (progressRun && width === 1440 && state === "performed-form") {
      const sidebarAccess = [];
      for (const link of await page.locator("aside a").all()) {
        await link.focus();
        await link.scrollIntoViewIfNeeded();
        const check = await link.evaluate(element => {
          const rect = element.getBoundingClientRect();
          const center = document.elementFromPoint(rect.x + rect.width / 2, rect.y + rect.height / 2);
          const text = element.querySelector("span.leading-none") ?? element;
          return {
            text: element.textContent.trim(), href: element.getAttribute("href"),
            focused: document.activeElement === element,
            reachable: center !== null && element.contains(center),
            foreground: getComputedStyle(text).color,
            background: getComputedStyle(element).backgroundColor,
            asideBackground: getComputedStyle(element.closest("aside")).backgroundColor,
          };
        });
        sidebarAccess.push(check);
      }
      results.at(-1).sidebarAccess = sidebarAccess;
      assert.ok(sidebarAccess.every(check => check.focused && check.reachable), JSON.stringify(sidebarAccess));
    }
    if (state === "pending") {
      await page.evaluate(() => window.__R8.release());
      await page.getByRole("heading", { name: locale === "nl" ? "Resultaat van herberekenen" : "Recalculation result" }).waitFor();
      assert.deepEqual(await articles.allTextContents(), before);
    }
    await context.close();
  }
  await writeFile(resolve(output, progressRun ? "R16-advice-results.json" : "R8-advice-results.json"), JSON.stringify(results, null, 2));
  assert.ok(results.every(result => !result.overflow && !result.errors.length && !result.blocked.length), JSON.stringify(results.filter(result => result.overflow || result.errors.length || result.blocked.length)));
  console.log(`${results.length} ${progressRun ? "R16" : "R8"} cases passed; seven groups, preserved pending/failed data, no overflow/runtime/external requests.`);
} finally { await browser?.close(); await new Promise(done => server.close(done)); }
