import assert from "node:assert/strict";
import { createServer } from "node:http";
import { readFile, mkdir, writeFile } from "node:fs/promises";
import { resolve, extname } from "node:path";
import { build } from "esbuild";
import postcss from "postcss";
import tailwind from "@tailwindcss/postcss";
import { chromium } from "playwright";
import { sendFixtureError } from "../../../tests/visual/lib/http-errors.mjs";

// Real public forms/layout/styles; only Next routing/images and backend hooks use the existing offline fixture.
const root = process.cwd();
const renders = resolve(root, "plans/riderprofile/renders");
await mkdir(renders, { recursive: true });
const entry = `
import {createRoot} from 'react-dom/client';
import {BikeForm} from '@/components/bikes/BikeForm';
import {CreateBikeForm} from '@/components/features/bikes/CreateBikeForm';
import {BikeGarageRow} from '@/components/bikes/BikeGarageOverview';
import {ThemeProvider} from '@/components/providers/ThemeProvider';
import {ToastProvider} from '@/components/ui/Toast';
import {getDashboardMessages} from '@/i18n/dashboardMessages';
import {scoreBike} from './shared/profileScore';
const locale=location.pathname.startsWith('/en/')?'en':'nl';
const bike={_id:'bike1',name:'Review bike',bikeType:'road',currentSetup:{saddleHeightMm:740},
 advisedPressureSummary:null,pressureStateSummary:{isStale:false,hasCurrentPressure:false}};
const form=location.pathname.endsWith('/create')?<CreateBikeForm/>:location.pathname.endsWith('/garage')?
 <BikeGarageRow bike={{...bike,profileScore:scoreBike({bike},Date.now())}} latestFit={null} locale={locale} messages={getDashboardMessages(locale)}/>:
 <BikeForm title={locale==='nl'?'Mijn fiets':'My bike'} description='' submitLabel='' initialData={bike}
 onAutosave={async payload=>{window.__formWrites.push(payload)}}/>;
createRoot(document.getElementById('root')).render(<ThemeProvider><ToastProvider><main className="mx-auto max-w-[1440px] p-4 sm:p-8">{form}</main></ToastProvider></ThemeProvider>);
`;
const runtime = `
import {getFunctionName} from 'convex/server';
export * from '${resolve(root, "tests/visual/account-batch4/runtime.jsx")}';
window.__formWrites=[];
export function useQuery(ref,args){if(args==='skip')return undefined;const name=getFunctionName(ref);
 if(name==='geometry/queries:listBrandsForRider')return [{brandId:'brand1',name:'Fixture Brand',hasUsableModels:true}];
 if(name.includes('list'))return [];return null;}
export function useMutation(ref){return async args=>{window.__formWrites.push({name:getFunctionName(ref),args});return 'fixture';};}
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
  + '<title>R10 actual bike forms</title><link rel="stylesheet" href="/fixture.css"></head>'
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
  for(const locale of ["nl","en"]) for(const width of [1440,390]) for(const route of ["create","edit","garage"]){
    const context=await browser.newContext({viewport:{width,height:1000},reducedMotion:"reduce"});
    await context.route("https://**/*",route=>route.abort());
    const page=await context.newPage();const errors=[];
    page.on("pageerror",error=>errors.push(error.message));
    await page.goto(`${origin}/${locale}/${route}`,{waitUntil:"networkidle"});
    await page.evaluate(()=>document.fonts.ready);
    await page.waitForTimeout(900);
    assert.equal(await page.evaluate(()=>window.__formWrites.length),0,"Hydration must not write");
    if(route!=="garage"){
      await page.getByRole("button",{name:locale==="nl"?"Zoek je fiets op":"Look up your bike",exact:true}).click();
      assert(await page.locator("#bike-geometry-library").isVisible());
      assert(await page.locator("#bike-geometry-library button").count()>0,"Real geometry selector must render");
      if(route==="edit")await page.getByRole("radio",{name:locale==="nl"?"Meetwaarden":"Measurements",exact:true}).click();
      else await page.locator("summary").click();
      const model=page.getByRole("textbox",{name:locale==="nl"?"Zadelmodel":"Saddle model",exact:true});
      assert.equal(await model.inputValue(),"");
      await page.screenshot({path:resolve(renders,`R10-${route}-${locale}-${width}-empty.png`),fullPage:true});
      await model.fill("Review saddle");await model.blur();
      if(route==="edit"){
        await page.waitForTimeout(950);
        let writes=await page.evaluate(()=>window.__formWrites);
        assert(writes.some(write=>write.saddleModel==="Review saddle"));
        await model.fill("");await model.blur();await page.waitForTimeout(950);
        writes=await page.evaluate(()=>window.__formWrites);
        assert(writes.at(-1).clearFields.includes("saddleModel"));
      }else{
        assert.equal(await page.evaluate(()=>window.__formWrites.length),0,"Create only writes on explicit submit");
      }
    } else assert.equal(await page.getByRole("meter").count(),2);
    await page.screenshot({path:resolve(renders,`R10-${route}-${locale}-${width}.png`),fullPage:true});
    assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),`${route} overflow`);
    assert.deepEqual(errors,[]);
    results.push({locale,width,route,errors,writes:await page.evaluate(()=>window.__formWrites)});
    await context.close();
  }
  await writeFile(resolve(root,"plans/riderprofile/audit/R10-forms-browser.json"),JSON.stringify(results,null,2)+"\n");
}finally{await browser.close();await new Promise(done=>server.close(done));}
