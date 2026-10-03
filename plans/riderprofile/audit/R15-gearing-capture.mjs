import assert from "node:assert/strict";
import { createServer } from "node:http";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { resolve, extname } from "node:path";
import { build } from "esbuild";
import postcss from "postcss";
import tailwind from "@tailwindcss/postcss";
import { chromium } from "playwright";

const root = process.cwd();
const renders = resolve(root, "plans/riderprofile/renders");
await mkdir(renders, { recursive: true });
const runtime = `import {getFunctionName} from 'convex/server';
const params=new URLSearchParams(location.search);
const locale=params.get('locale')||'nl';
const profile={sex:'female',weightKg:60};
window.__writes=[];
export const useDashboardMessages=()=>({locale});
export const useSearchParams=()=>new URLSearchParams();
export const usePathname=()=>'/'+locale+'/gearing';
export function useQuery(ref){
 const name=getFunctionName(ref);
 if(name==='users/queries:getCurrentUser')return {_id:'fixture-user'};
 if(name==='bikes/queries:list'||name==='gearing/queries:listGearingSessions')return [];
 if(name==='calculatorChain/queries:getContext')return {profile,bikes:[],observations:[],bikeObservations:[],advice:[],activeTireSetup:null};
 return null;
}
export const useMutation=ref=>async args=>{window.__writes.push({name:getFunctionName(ref),args});return {status:'saved',fields:[]};};`;
const bundle = await build({absWorkingDir:root,bundle:true,write:false,outdir:"/private/tmp/R15-gearing-bundle",format:"esm",platform:"browser",jsx:"automatic",
  stdin:{resolveDir:root,loader:"jsx",contents:`import {createRoot} from 'react-dom/client';import {GearingCalculatorForm} from '@/app/(dashboard)/gearing/GearingCalculatorForm';createRoot(document.getElementById('root')).render(<main><GearingCalculatorForm/></main>);`},
  define:{"process.env.NODE_ENV":'"production"',"process.env":"{}"},
  plugins:[{name:"offline-gearing",setup(builder){
    builder.onResolve({filter:/^(convex\/react|next\/navigation|@\/i18n\/useDashboardMessages)$/},()=>({path:"runtime",namespace:"fixture"}));
    builder.onLoad({filter:/.*/,namespace:"fixture"},()=>({contents:runtime,loader:"jsx",resolveDir:root}));
    builder.onResolve({filter:/^next\/link$/},()=>({path:resolve(root,"tests/visual/account-batch1/link.jsx")}));
    builder.onResolve({filter:/^next\/image$/},()=>({path:resolve(root,"tests/visual/account-batch1/image.jsx")}));
  }}],
});
const script=bundle.outputFiles.find(file=>file.path.endsWith(".js")).contents;
const moduleCss=bundle.outputFiles.filter(file=>file.path.endsWith(".css")).map(file=>file.text).join("\n");
const globals=resolve(root,"src/app/globals.css");
const styles=await postcss([tailwind({base:root})]).process(await readFile(globals,"utf8"),{from:globals});
const fonts=`@font-face{font-family:Figtree;src:url('/brand/report/fonts/figtree-latin.woff2');font-weight:100 900}@font-face{font-family:Display;src:url('/brand/report/fonts/bricolage-grotesque-latin.woff2');font-weight:100 900}@font-face{font-family:Mono;src:url('/brand/report/fonts/dm-mono-latin.woff2');font-weight:500}:root{--font-body:Figtree;--font-display:Display;--font-mono:Mono}body{font-family:Figtree,sans-serif}`;
const server=createServer(async(request,response)=>{
  try{
    const pathname=new URL(request.url,"http://localhost").pathname;
    if(pathname==="/fixture.js"){response.setHeader("content-type","text/javascript");response.end(script);return;}
    if(pathname==="/fixture.css"){response.setHeader("content-type","text/css");response.end(styles.css+moduleCss+fonts);return;}
    if(extname(pathname)){
      const asset=resolve(root,"public","."+pathname);
      assert.ok(asset.startsWith(resolve(root,"public")+"/"));
      response.setHeader("content-type",({".woff2":"font/woff2",".svg":"image/svg+xml",".webp":"image/webp",".png":"image/png"})[extname(asset)]||"application/octet-stream");
      response.end(await readFile(asset));return;
    }
    response.setHeader("content-type","text/html");response.end('<!doctype html><html><head><meta name="viewport" content="width=device-width,initial-scale=1"><link rel="stylesheet" href="/fixture.css"></head><body><div id="root"></div><script type="module" src="/fixture.js"></script></body></html>');
  }catch(error){response.statusCode=500;response.end(String(error));}
});
await new Promise(done=>server.listen(0,"127.0.0.1",done));
const origin=`http://127.0.0.1:${server.address().port}`;
let browser;
const results=[];
try{
  browser=await chromium.launch({headless:true});
  for(const locale of ["nl","en"])for(const width of [1440,390]){
    const page=await browser.newPage({viewport:{width,height:1000},colorScheme:"light",reducedMotion:"reduce"});
    const errors=[];
    const externalRequests=[];
    page.on("pageerror",error=>errors.push(error.message));
    await page.route("**/*",route=>{
      if(new URL(route.request().url()).origin===origin)return route.continue();
      externalRequests.push(route.request().url());return route.abort();
    });
    await page.goto(`${origin}/gearing?locale=${locale}`,{waitUntil:"networkidle"});
    await page.locator("h1").waitFor();
    await page.locator("details").first().evaluate(element=>{element.open=true;});
    await page.evaluate(()=>document.fonts.ready);
    assert.equal(await page.getByRole("spinbutton").inputValue(),"114");
    assert.equal(await page.evaluate(()=>window.__writes.length),0);
    const overflow=await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth);
    await page.screenshot({path:resolve(renders,`R15-gearing-${locale}-${width}-pending.png`),fullPage:true});
    await page.getByRole("button",{name:locale==="nl"?"Gebruik dit als mijn FTP":"Use this as my FTP",exact:true}).click();
    await page.getByRole("button",{name:locale==="nl"?"Alleen voor deze berekening":"Only for this calculation",exact:true}).waitFor();
    assert.equal(await page.evaluate(()=>window.__writes.length),0);
    await page.screenshot({path:resolve(renders,`R15-gearing-${locale}-${width}-confirmed.png`),fullPage:true});
    const confirmedOverflow=await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth);
    results.push({locale,width,overflow,confirmedOverflow,errors,externalRequests,writesBeforeProfileChoice:await page.evaluate(()=>window.__writes.length)});
    assert.deepEqual(errors,[]);assert.deepEqual(externalRequests,[]);assert.equal(overflow,false);assert.equal(confirmedOverflow,false);
    await page.close();
  }
}finally{await browser?.close();await new Promise(done=>server.close(done));}
await writeFile(resolve(root,"plans/riderprofile/audit/R15-gearing-browser.json"),JSON.stringify(results,null,2)+"\n");
console.log("R15 gearing: 8 NL/EN desktop/mobile screenshots; no overflow, runtime errors, external requests or writes before profile choice.");
