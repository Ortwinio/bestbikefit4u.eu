import { mkdir, readFile, writeFile, symlink, stat } from "node:fs/promises";
import { createWriteStream } from "node:fs";
import { resolve } from "node:path";
import { spawn, execFile } from "node:child_process";
import { promisify } from "node:util";
import { createHash } from "node:crypto";
import { chromium } from "playwright";
import AxeBuilder from "@axe-core/playwright";
import { createPreviewCertificate, createPreviewFetch } from "../../../tests/visual/final-sweep/tls.mjs";

const root = process.cwd();
const audit = resolve(root, "plans/seo-semrush/audit");
const renders = resolve(root, "plans/seo-semrush/renders");
const baseline = "/private/tmp/bbf-semrush-S15-e93f8c1";
const mode = process.argv[2];
const run = promisify(execFile);
const routes = [
  { id: "home", en: "/en", nl: "/nl" },
  ...["bike-fit", "saddle-height", "frame-size", "crank-length", "saddle-width", "gearing", "power-speed", "climb-planner", "ftp-wkg", "fuel-hydration"].map(id => ({id,en:`/en/calculators/${id}`,nl:`/nl/calculators/${id}`})),
  {id:"tire-pressure",en:"/en/tire-pressure-calculator",nl:"/nl/bandenspanning-calculator"},
  {id:"guide",en:"/en/guides/saddle-height-guide",nl:"/nl/guides/saddle-height-guide"},
  {id:"contact",en:"/en/contact",nl:"/nl/contact"},
  {id:"faq",en:"/en/faq",nl:"/nl/faq"},
  {id:"author",en:"/en/authors/ortwin-verreck",nl:"/nl/authors/ortwin-verreck",newLocales:["en","nl"]},
  {id:"methods",en:"/en/methods",nl:"/nl/methods",newLocales:["en","nl"]},
  {id:"pressure-road",en:"/en/tire-pressure/road-bike",nl:"/nl/bandenspanning/racefiets",newLocales:["en"]},
  {id:"pressure-gravel",en:"/en/tire-pressure/gravel-bike",nl:"/nl/bandenspanning/gravelbike",newLocales:["en"]},
  {id:"pressure-mountain",en:"/en/tire-pressure/mountain-bike",nl:"/nl/bandenspanning/mountainbike",newLocales:["en","nl"]},
  {id:"bikefitting",en:"/en/bike-fitting",nl:"/nl/bikefitting"},
];

if(mode === "prepare-before") {
  if(await stat(baseline).catch(()=>null)) throw new Error("Baseline snapshot already exists; do not overwrite");
  await mkdir(baseline,{recursive:true});
  const archive="/private/tmp/bbf-semrush-S15-e93f8c1.tar";
  await run("git",["archive","--format=tar",`--output=${archive}`,"e93f8c1"],{cwd:root});
  await run("tar",["-xf",archive,"-C",baseline]);
  await symlink(resolve(root,"node_modules"),resolve(baseline,"node_modules"),"dir");
  const commit=(await run("git",["rev-parse","e93f8c1"],{cwd:root})).stdout.trim();
  await writeFile(resolve(audit,"S15-visual-baseline.json"),JSON.stringify({commit,snapshot:baseline,method:"git archive; no shared checkout/reset",routes},null,2)+"\n");
  console.log(`Prepared immutable baseline ${commit} at ${baseline}; no build started.`);
  process.exit(0);
}

if(mode === "build-before") {
  const log=createWriteStream(resolve(audit,"S15-visual-before-build.log"));
  const child=spawn(process.execPath,[resolve(root,"node_modules/next/dist/bin/next"),"build","--webpack"],{
    cwd:baseline,env:{...process.env,NEXT_PUBLIC_CONVEX_URL:"http://127.0.0.1:9",NEXT_PUBLIC_CONVEX_SITE_URL:"http://127.0.0.1:9",
      NEXT_TELEMETRY_DISABLED:"1",NEXT_FONT_GOOGLE_MOCKED_RESPONSES:resolve(audit,"S15-visual-fonts.cjs"),
      SENTRY_AUTH_TOKEN:"",STRIPE_BILLING_ENABLED:"false",NEXT_PUBLIC_STRIPE_BILLING_ENABLED:"false"},stdio:["ignore","pipe","pipe"],
  });
  child.stdout.pipe(log);child.stderr.pipe(log);
  const code=await new Promise((done,reject)=>{child.once("error",reject);child.once("exit",done);});
  log.end();console.log(`Isolated baseline build exited ${code}; see S15-visual-before-build.log`);process.exit(code ?? 1);
}

if(!["before","after"].includes(mode))throw new Error("Expected prepare-before, build-before, before or after");
const source=mode==="before"?baseline:root;
const buildId=(await readFile(resolve(source,".next/BUILD_ID"),"utf8")).trim();
await mkdir(renders,{recursive:true});
const certificate=await createPreviewCertificate();
const port=mode==="before"?4487:4488;
const origin=`https://127.0.0.1:${port}`;
const fetchLocal=createPreviewFetch(origin,certificate.cert);
const serverLog=createWriteStream(resolve(audit,`S15-visual-${mode}-server.log`));
const server=spawn(process.execPath,[resolve(audit,"S15-visual-server.mjs"),source,String(port),certificate.keyPath,certificate.certPath],{
  cwd:source,env:{...process.env,NEXT_PUBLIC_CONVEX_URL:"http://127.0.0.1:9",NEXT_PUBLIC_CONVEX_SITE_URL:"http://127.0.0.1:9",NEXT_TELEMETRY_DISABLED:"1"},stdio:["ignore","pipe","pipe"],
});
server.stdout.pipe(serverLog);server.stderr.pipe(serverLog);
let browser;
const results=[];
const skipped=[];
try{
  let ready=false;
  for(let attempt=0;attempt<60;attempt++){
    if(server.exitCode!==null)throw new Error("Local preview exited; inspect server log");
    ready=await fetchLocal(`${origin}/illustrations/06-meetset.webp`,{signal:AbortSignal.timeout(1000)}).then(response=>response.ok,()=>false);
    if(ready)break;
    await new Promise(done=>setTimeout(done,500));
  }
  if(!ready)throw new Error("Local preview did not become ready");
  browser=await chromium.launch({headless:true});
  for(const entry of routes)for(const locale of ["nl","en"])for(const width of [1440,390]){
    if(mode==="before" && entry.newLocales?.includes(locale)){
      skipped.push({id:entry.id,locale,width,reason:"New canonical page has no equivalent at e93f8c1; no invented before image"});continue;
    }
    if(process.env.S15_FILTER && !process.env.S15_FILTER.split(",").includes(entry.id))continue;
    const context=await browser.newContext({viewport:{width,height:width===390?844:1000},locale:locale==="nl"?"nl-NL":"en-GB",ignoreHTTPSErrors:true,colorScheme:"light",reducedMotion:"reduce"});
    const page=await context.newPage();
    const errors=[];
    const consoleErrors=[];
    const blockedRequests=[];
    const failedAssets=[];
    page.on("pageerror",error=>errors.push(error.message));
    page.on("console",message=>{if(message.type()==="error")consoleErrors.push(message.text());});
    page.on("response",response=>{if(response.status()>=400)failedAssets.push({url:response.url(),status:response.status()});});
    await page.route("**/*",route=>{
      if(new URL(route.request().url()).origin===origin)return route.continue();
      blockedRequests.push(route.request().url());return route.abort();
    });
    await page.routeWebSocket(/.*/,socket=>socket.close());
    const record={id:entry.id,path:entry[locale],locale,width,errors,consoleErrors,blockedRequests,failedAssets};
    try{
      const response=await page.goto(origin+entry[locale],{waitUntil:"load",timeout:60000});
      record.status=response.status();record.finalPath=new URL(page.url()).pathname;
      await page.locator("h1").waitFor({timeout:15000});
      await page.evaluate(()=>document.fonts.ready);
      const consent=page.getByRole("button",{name:/^(Alleen essentieel|Essential only|Alleen noodzakelijk|Necessary only)$/i}).first();
      if(await consent.isVisible())await consent.click();
      await page.evaluate(async()=>{
        for(const picture of document.images)picture.loading="eager";
        await Promise.all([...document.images].map(picture=>picture.decode().catch(()=>{})));
        scrollTo(0,0);
      });
      await page.waitForTimeout(300);
      const name=`S15-${mode}-${entry.id}-${locale}-${width}`;
      await page.screenshot({path:resolve(renders,name+".png"),fullPage:true,animations:"disabled"});
      record.screenshot=name+".png";
      record.metrics=await page.evaluate(()=>({
        width:innerWidth,scrollWidth:Math.max(document.documentElement.scrollWidth,document.body.scrollWidth),height:document.documentElement.scrollHeight,
        lang:document.documentElement.lang,h1:[...document.querySelectorAll("h1")].map(element=>element.textContent),
        fonts:[...document.fonts].map(font=>({family:font.family,status:font.status})),
        brokenImages:[...document.images].filter(picture=>!picture.complete||!picture.naturalWidth).map(picture=>picture.currentSrc),
        sections:[...document.querySelectorAll("main > *, main section")].map(element=>{const rect=element.getBoundingClientRect();return{tag:element.tagName,className:element.className,x:rect.x,y:rect.y,width:rect.width,height:rect.height};}),
        footer:document.querySelector("footer")?{text:document.querySelector("footer").innerText,height:document.querySelector("footer").getBoundingClientRect().height,links:[...document.querySelectorAll("footer a")].map(link=>({href:link.getAttribute("href"),text:link.textContent}))}:null,
        overflowElements:[...document.querySelectorAll("body *")].filter(element=>{const rect=element.getBoundingClientRect();return rect.width>0&&rect.height>0&&(rect.right>innerWidth+1||rect.left < -1);}).slice(0,20).map(element=>({tag:element.tagName,className:element.className,text:element.textContent.slice(0,90)})),
      }));
      const axe=await new AxeBuilder({page}).analyze();
      record.axe={version:axe.testEngine.version,violations:axe.violations.map(({id,impact,description,helpUrl,nodes})=>({id,impact,description,helpUrl,nodes:nodes.map(({target,failureSummary})=>({target,failureSummary}))})),incomplete:axe.incomplete.map(({id,impact})=>({id,impact}))};
      if(entry.id==="home"||entry.id==="bikefitting"){
        await page.locator("footer").screenshot({path:resolve(renders,name+"-footer.png"),animations:"disabled"});
      }
    }catch(error){record.failure=String(error);}
    results.push(record);
    await context.close();
    await writeFile(resolve(audit,`S15-visual-${mode}.json`),JSON.stringify({mode,source,buildId,capturedAt:new Date().toISOString(),results,skipped},null,2)+"\n");
    console.log(JSON.stringify({id:record.id,locale,width,status:record.status,failure:record.failure,overflow:record.metrics?.scrollWidth>width,errors:errors.length,axe:record.axe?.violations.map(item=>item.id)}));
  }
}finally{
  await browser?.close();
  if(server.exitCode===null){server.kill("SIGTERM");await new Promise(done=>server.once("exit",done));}
  serverLog.end();await certificate.close();
}
const fingerprint=createHash("sha256").update(JSON.stringify(results.map(record=>({id:record.id,path:record.path,metrics:record.metrics})))).digest("hex");
console.log(JSON.stringify({mode,cases:results.length,skipped:skipped.length,buildId,metricsSha256:fingerprint}));
