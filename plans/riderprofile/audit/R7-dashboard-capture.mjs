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
import {useSyncExternalStore} from 'react';
export * from './tests/visual/account-batch1/runtime.jsx';
import { useQuery as baseQuery } from './tests/visual/account-batch1/runtime.jsx';
import { getFunctionName } from 'convex/server';
export const profile = { _id:'fixture-profile', userId:'fixture-user', heightCm:178, inseamCm:83, weightKg:74, torsoLengthCm:59, shoulderWidthCm:40, femurLengthCm:43, flexibilityScore:'average', coreStabilityScore:3, positionPriority:'balanced', experienceLevel:'intermediate', weeklyHours:'3-6', typicalRideLength:'medium', hasPain:'yes', painAreas:['lower_back'], hipCircumferenceCm:90 };
const observations = Object.entries(profile).filter(([field]) => !['_id','userId'].includes(field)).map(([field,value]) => {
 const derivedFtp=field==='ftpWatts' && profile.ftpMethod==='twentyMinute';
 const derived=derivedFtp || ['armLengthCm','torsoLengthCm'].includes(field);
 const estimated=['flexibilityScore','coreStabilityScore'].includes(field);
 const declared=typeof value!=='number';
 return {field,value,unit:field.endsWith('Cm')?'cm':field==='weightKg'?'kg':field==='ftpWatts'?'W':'none',kind:derived?'derived':estimated?'estimated':declared?'declared':'measured',method:derivedFtp?'twentyMinute':derived?'legacy_height_formula':estimated?'self_assessment':declared?'self_report':'single_measurement',source:derived?'legacy_migration':'profile_edit',recordedAt:Date.UTC(2026,8,28),status:'current'};
});
let revision=0;
const listeners=new Set();
const subscribe=listener=>{listeners.add(listener);return()=>listeners.delete(listener);};
const snapshot=()=>revision;
const publish=()=>{revision++;listeners.forEach(listener=>listener());};
const questions=[
 {key:'rider:armLengthCm',field:'armLengthCm',value:null,unit:'cm',kind:'measured',range:[30,90],effects:['bike-fit','frame-size'],gain:6.8,completenessGain:8,effort:'measure',stale:false,status:'pending'},
 {key:'rider:ftpWatts',field:'ftpWatts',value:null,unit:'W',kind:'measured',range:[30,700],effects:['gearing','climb-planner','fuel-hydration'],gain:4.25,completenessGain:5,effort:'quick',stale:false,status:'pending'}
];
let promptView={cardId:null,shownAt:null,hiddenUntil:null,questions:[]};
export function useQuery(reference,args) {
 useSyncExternalStore(subscribe,snapshot,snapshot);
 if(args==='skip') return undefined;
 const name=getFunctionName(reference);
 if(name==='profiles/queries:nextPrompts') return promptView;
 if(name==='profiles/queries:getMyProfile') return profile;
 if(['profiles/queries:getMyProvenance','profiles/queries:getHandoffContext'].includes(name)) return {profile,observations};
 if(name==='users/queries:getCurrentUser') return {_id:'fixture-user',name:'',displayName:'',email:'fixture@example.invalid',tier:'free',theme:'light'};
 return baseQuery(reference,args);
}
export function useMutation(reference) { return async args => {
 const name=getFunctionName(reference);
 if(name==='profiles/mutations:openPromptCard'){
  if(!promptView.cardId) promptView={cardId:'fixture-card',shownAt:Date.now(),hiddenUntil:null,questions};
  publish(); return promptView;
 }
 if(name==='profiles/mutations:dismissPromptCard'){
  promptView={...promptView,hiddenUntil:Date.now()+7*86400000,questions:[]}; publish();return null;
 }
 if(name==='profiles/mutations:answerProfilePrompt'){
  const question=promptView.questions.find(question=>question.key===args.key);
  profile[question.field]=args.value;
  if(question.field==='ftpWatts') profile.ftpMethod=args.method==='ftp_test'?'twentyMinute':args.method;
  observations.push({field:question.field,value:args.value,unit:question.unit,kind:args.method==='ftp_test'?'derived':args.method==='self_report'?'declared':'measured',method:args.method,source:'profile_edit',status:'current',recordedAt:Date.now()});
  promptView={...promptView,questions:promptView.questions.map(item=>item.key===args.key?{...item,value:args.value,status:'answered'}:item)};
  publish();return {status:'saved',field:question.field};
 }
 return null;
}; }
export function useTheme() { return {theme:'light',resolvedTheme:'light'}; }
`;
const entry = `
import React from 'react';
import {createRoot} from 'react-dom/client';
import DashboardPage from './src/app/(dashboard)/dashboard/page';
import DashboardLayout from './src/app/(dashboard)/DashboardLayoutClient';
import {ToastProvider} from './src/components/ui';
createRoot(document.getElementById('root')).render(<ToastProvider><DashboardLayout><DashboardPage/></DashboardLayout></ToastProvider>);
`;
const bundle = await build({
  absWorkingDir: root, stdin: { contents: entry, resolveDir: root, loader: "jsx" },
  bundle: true, write: false, outdir: "/tmp/r7-dashboard-memory", platform: "browser", format: "esm", jsx: "automatic",
  define: { "process.env.NODE_ENV": '"development"', "process.env": "{}" }, logLevel: "error",
  plugins: [{ name: "dashboard-fixture", setup(builder) {
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
    response.end(`<!doctype html><html lang="${url.pathname.startsWith("/nl/") ? "nl" : "en"}"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><link rel="stylesheet" href="/fixture.css"><title>Dashboard prompts fixture</title></head><body><div id="root"></div><script type="module" src="/fixture.js"></script></body></html>`);
  } catch { response.statusCode = 404; response.end(); }
});
await new Promise(done => server.listen(0, "127.0.0.1", done));
const origin = `http://127.0.0.1:${server.address().port}`;
await mkdir(output, { recursive: true });
const browser = await chromium.launch({ headless: true });
const results = [];
try {
  for (const locale of ["nl", "en"]) for (const width of [1440, 390]) for (const state of ["open", "answered", "hidden", "unknown-ftp", "answered-dark"]) {
    const context = await browser.newContext({ viewport: { width, height: width === 390 ? 844 : 1000 }, reducedMotion: "reduce", locale: locale === "nl" ? "nl-NL" : "en-GB" });
    await context.route("**/*", route => new URL(route.request().url()).origin === origin ? route.continue() : route.abort());
    const page = await context.newPage();
    const errors = [];
    page.on("pageerror", error => errors.push(error.message));
    await page.goto(`${origin}/${locale}/dashboard?state=${state}`);
    if (state === "answered-dark") await page.evaluate(() => document.documentElement.classList.add("dark"));
    const card = page.getByRole("region", {name:locale==="nl"?"Maak je profiel vandaag iets sterker":"Make your profile a little stronger today"});
    await card.getByRole("spinbutton").first().waitFor();
    if(state === "answered" || state === "answered-dark") {
      for(const [label,value,method] of [
        [locale==="nl"?"Armlengte":"Arm length","61",locale==="nl"?"Ik heb dit gemeten":"I measured this"],
        ["FTP","235",locale==="nl"?"FTP-resultaat van een 20-minutentest (berekend)":"FTP result from a twenty-minute test (calculated)"]
      ]) {
        const question=card.getByRole("article",{name:label,exact:true});
        await question.getByRole("spinbutton").fill(value);
        await question.getByRole("combobox").click();
        await page.getByRole("option",{name:method,exact:true}).click();
        await question.getByRole("button",{name:locale==="nl"?"Bewaar gegeven":"Save detail",exact:true}).click();
        await question.getByRole("status").waitFor();
      }
    }
    if(state==="hidden"){
      await card.getByRole("button",{name:locale==="nl"?"Niet nu":"Not now"}).click();
      await card.locator("time").waitFor();
    }
    if(state==="unknown-ftp"){
      await card.getByRole("article",{name:"FTP",exact:true}).getByRole("combobox").click();
      await page.getByRole("option",{name:locale==="nl"?"Weet ik niet":"I don’t know",exact:true}).click();
      await card.getByRole("link",{name:locale==="nl"?"Open de FTP-calculator":"Open the FTP calculator"}).waitFor();
    }
    await page.evaluate(() => document.fonts.ready);
    await page.evaluate(() => window.scrollTo(0, 0));
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth > innerWidth);
    const questions = await card.getByRole("article").count();
    const file = `R7-dashboard-${locale}-${state}-${width}.png`;
    await page.screenshot({ path: resolve(output, file), fullPage: true });
    results.push({ locale, width, state, file, overflow, questions, errors });
    await context.close();
  }
} finally { await browser.close(); await new Promise(done => server.close(done)); }
await writeFile(resolve(output, "R7-dashboard-results.json"), JSON.stringify(results, null, 2));
console.log(JSON.stringify(results, null, 2));
if (results.some(result => result.overflow || result.errors.length || result.questions !== (result.state === "hidden" ? 0 : 2))) process.exitCode = 1;
