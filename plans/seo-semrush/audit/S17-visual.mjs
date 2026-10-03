import { mkdir, readFile, writeFile } from "node:fs/promises";
import { createWriteStream } from "node:fs";
import { resolve } from "node:path";
import { spawn } from "node:child_process";
import { createHash } from "node:crypto";
import { chromium } from "playwright";
import AxeBuilder from "@axe-core/playwright";
import { createPreviewCertificate, createPreviewFetch } from "../../../tests/visual/final-sweep/tls.mjs";

const root = process.cwd();
const audit = resolve(root, "plans/seo-semrush/audit");
const renders = resolve(root, "plans/seo-semrush/renders");
const mode = process.argv[2];
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

if(mode !== "after") throw new Error("S17 supports only after; never rebuild baseline");
const source=root;
const buildId=(await readFile(resolve(source,".next/BUILD_ID"),"utf8")).trim();
if(buildId !== "F-yLf373Lqu2IKKHBS4al") throw new Error(`Unexpected build ${buildId}`);
await mkdir(renders,{recursive:true});
const certificate=await createPreviewCertificate();
const port=4497;
const origin=`https://127.0.0.1:${port}`;
const fetchLocal=createPreviewFetch(origin,certificate.cert);
const serverLog=createWriteStream(resolve(audit,`S17-visual-${mode}-server.log`));
const server=spawn(process.execPath,[resolve(audit,"S17-visual-server.mjs"),source,String(port),certificate.keyPath,certificate.certPath],{
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
    if(process.env.S17_FILTER && !process.env.S17_FILTER.split(",").includes(entry.id))continue;
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
      const name=`S17-${mode}-${entry.id}-${locale}-${width}`;
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
      record.integration=await page.evaluate(()=>({
        personalize:[...document.querySelectorAll('[data-slot="personalize-advice"]')].map(element=>({text:element.textContent,links:[...element.querySelectorAll("a")].map(link=>link.getAttribute("href"))})),
        answers:[...document.querySelectorAll("[data-calculator-answer]")].map(element=>({id:element.getAttribute("data-calculator-answer"),text:element.textContent})),
      }));
      const axe=await new AxeBuilder({page}).analyze();
      record.axe={version:axe.testEngine.version,violations:axe.violations.map(({id,impact,description,helpUrl,nodes})=>({id,impact,description,helpUrl,nodes:nodes.map(({target,failureSummary})=>({target,failureSummary}))})),incomplete:axe.incomplete.map(({id,impact})=>({id,impact}))};
      if(entry.id==="home"||entry.id==="bikefitting"){
        await page.locator("footer").screenshot({path:resolve(renders,name+"-footer.png"),animations:"disabled"});
      }
    }catch(error){record.failure=String(error);}
    results.push(record);
    await context.close();
    await writeFile(resolve(audit,`S17-visual-${mode}.json`),JSON.stringify({mode,source,buildId,capturedAt:new Date().toISOString(),results,skipped},null,2)+"\n");
    console.log(JSON.stringify({id:record.id,locale,width,status:record.status,failure:record.failure,overflow:record.metrics?.scrollWidth>width,errors:errors.length,axe:record.axe?.violations.map(item=>item.id)}));
  }
}finally{
  await browser?.close();
  if(server.exitCode===null){server.kill("SIGTERM");await new Promise(done=>server.once("exit",done));}
  serverLog.end();await certificate.close();
}
const fingerprint=createHash("sha256").update(JSON.stringify(results.map(record=>({id:record.id,path:record.path,metrics:record.metrics})))).digest("hex");
console.log(JSON.stringify({mode,cases:results.length,skipped:skipped.length,buildId,metricsSha256:fingerprint}));
