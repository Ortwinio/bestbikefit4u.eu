import { build } from "esbuild";
import { sendFixtureError } from "../../../tests/visual/lib/http-errors.mjs";
import postcss from "postcss";
import tailwind from "@tailwindcss/postcss";
import { chromium } from "playwright";
import { createServer } from "node:http";
import { readFile, writeFile, mkdir } from "node:fs/promises";
import { resolve, extname } from "node:path";
import { createHash } from "node:crypto";

const root = process.cwd();
const phase = process.argv[2] || "before";
if (!["before", "after"].includes(phase)) throw new Error("Expected before or after");
const audit = resolve(root, "plans/seo-semrush/audit");
const output = resolve(root, "plans/seo-semrush/renders");
const source = phase === "before" ? "/private/tmp/bbf-semrush-S5-before-source" : root;
await mkdir(output, { recursive: true });
const runtime = `
export const locale = location.pathname.startsWith('/en') ? 'en' : 'nl';
export const getRequestLocale = async () => locale;
export const usePathname = () => location.pathname;
export const useSearchParams = () => new URLSearchParams(location.search);
export const useRouter = () => ({push() {}, replace() {}, prefetch() {}});
export const useConvexAuth = () => ({isLoading:false,isAuthenticated:false});
export const useAuthActions = () => ({signOut:async()=>{}});
export const useMutation = () => async () => {};
export const useQuery = () => null;
export const captureException = () => {};
export const LatestBlogSection = () => null;
`;
const entry = `
import {createRoot} from 'react-dom/client';
import Home from '@/app/(public)/page';
import {Header} from '@/components/layout/Header';
import {Footer} from '@/components/layout/Footer';
import {ThemeProvider} from '@/components/providers/ThemeProvider';
import {getDictionary} from '@/i18n/getDictionary';
const locale = location.pathname.startsWith('/en') ? 'en' : 'nl';
const dictionary = await getDictionary(locale);
const content = await Home();
createRoot(document.getElementById('root')).render(<ThemeProvider><div className="flex min-h-screen flex-col"><Header locale={locale} labels={{common:dictionary.common,nav:dictionary.nav,dashboardNav:dictionary.dashboard.nav,dashboardSignOut:dictionary.dashboard.common.signOut}}/><main id="main-content" className="flex-1">{content}</main><Footer locale={locale} labels={{howItWorks:dictionary.nav.howItWorks,pricing:dictionary.nav.pricing,footer:dictionary.nav.footer}}/></div></ThemeProvider>);
`;
const bundle = await build({
  absWorkingDir: source, stdin: { contents: entry, loader: "jsx", resolveDir: source },
  bundle: true, write: false, outdir: resolve(audit, "S5-bundle"), format: "esm", platform: "browser",
  jsx: "automatic", nodePaths: [resolve(root, "node_modules")],
  define: { "process.env.NODE_ENV": '"development"', "process.env": "{}" },
  plugins: [{ name: "S5-offline", setup(builder) {
    builder.onResolve({filter:/^server-only$/}, () => ({path:"runtime",namespace:"s5"}));
    builder.onResolve({filter:/convex\/_generated\/api$/}, () => ({path:resolve(root,"convex/_generated/api.js")}));
    builder.onResolve({filter:/^(next\/navigation|convex\/react|@convex-dev\/auth\/react|@sentry\/nextjs|@\/i18n\/request|@\/components\/home\/LatestBlogSection)$/}, () => ({path:"runtime",namespace:"s5"}));
    builder.onLoad({filter:/.*/,namespace:"s5"}, () => ({contents:runtime,loader:"jsx"}));
    builder.onResolve({filter:/^next\/(link|image)$/}, ({path}) => ({path:resolve(root,"tests/visual/account-batch1",path.endsWith("link") ? "link.jsx" : "image.jsx")}));
    builder.onResolve({filter:/^@\//}, ({path,kind}) => builder.resolve(resolve(source,"src",path.slice(2)),{kind,resolveDir:source}));
  }}],
});
const script = bundle.outputFiles.find(file=>file.path.endsWith(".js")).contents;
const modules = bundle.outputFiles.filter(file=>file.path.endsWith(".css")).map(file=>file.text).join("\n");
const globalCss = await readFile(resolve(source,"src/app/globals.css"),"utf8");
const compiled = await postcss([tailwind({base:source})]).process(globalCss,{from:resolve(source,"src/app/globals.css")});
const fonts = `@font-face{font-family:S5Figtree;src:url('/brand/report/fonts/figtree-latin.woff2');font-weight:100 900}@font-face{font-family:S5Display;src:url('/brand/report/fonts/bricolage-grotesque-latin.woff2');font-weight:100 900}@font-face{font-family:S5Mono;src:url('/brand/report/fonts/dm-mono-latin.woff2');font-weight:500}:root{--font-body:S5Figtree;--font-display:S5Display;--font-mono:S5Mono}`;
const css = compiled.css + "\n" + modules + "\n" + fonts;
const hash = value => createHash("sha256").update(value).digest("hex");
const sourceHashes = {};
for (const file of ["src/app/(public)/page.tsx", "src/components/home/MarketingHome.module.css", "src/components/home/homeRedesignContent.ts", "src/i18n/marketing/home.ts", "src/i18n/marketing/homeTrust.ts", "src/app/globals.css"]) {
  try { sourceHashes[file] = hash(await readFile(resolve(source,file))); }
  catch (error) { if (error.code !== "ENOENT") throw error; }
}
await writeFile(resolve("/private/tmp",`S5-${phase}-bundle.js`),script);
await writeFile(resolve("/private/tmp",`S5-${phase}-styles.css`),css);
const server = createServer(async(request,response)=>{
  try {
    const pathname = new URL(request.url,"http://localhost").pathname;
    if(pathname === "/fixture.js") {response.setHeader("content-type","text/javascript");response.end(script);return;}
    if(pathname === "/fixture.css") {response.setHeader("content-type","text/css");response.end(css);return;}
    if(extname(pathname)) {
      const asset = resolve(source,"public","."+decodeURIComponent(pathname));
      if(!asset.startsWith(resolve(source,"public")+"/")) throw new Error("Invalid asset");
      response.setHeader("content-type",({".svg":"image/svg+xml",".webp":"image/webp",".png":"image/png",".woff2":"font/woff2"})[extname(asset)] || "application/octet-stream");
      response.end(await readFile(asset));return;
    }
    response.setHeader("content-type","text/html");
    response.end(`<!doctype html><html lang="${pathname.startsWith("/en")?"en":"nl"}"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><link rel="stylesheet" href="/fixture.css"></head><body class="relative bg-background font-sans text-foreground antialiased"><div id="root"></div><script type="module" src="/fixture.js"></script></body></html>`);
  } catch(error) { sendFixtureError(response, error); }
});
await new Promise(done=>server.listen(0,"127.0.0.1",done));
const origin = `http://127.0.0.1:${server.address().port}`;
let browser;
const cases = [];
try {
  browser = await chromium.launch({headless:true});
  for(const locale of ["nl","en"]) for(const width of [1440,390]) {
    const page = await browser.newPage({viewport:{width,height:width===390?844:1000},colorScheme:"light",reducedMotion:"reduce"});
    const errors = [];
    const externalRequests = [];
    page.on("pageerror",error=>{errors.push(error.message);console.error(error.message);});
    await page.route("**/*",route=>{
      if(new URL(route.request().url()).origin===origin) return route.continue();
      externalRequests.push(route.request().url());return route.abort();
    });
    await page.goto(`${origin}/${locale}`,{waitUntil:"networkidle"});
    await page.locator("h1").waitFor();
    await page.evaluate(async()=>{
      await document.fonts.ready;
      for(const image of document.images) image.loading="eager";
      await Promise.all([...document.images].map(image=>image.decode().catch(()=>{})));
    });
    const file = `S5-${phase}-${locale}-${width}.png`;
    await page.screenshot({path:resolve(output,file),fullPage:true,animations:"disabled"});
    const metrics = await page.evaluate(()=>({
      overflow:document.documentElement.scrollWidth>innerWidth,
      scrollWidth:document.documentElement.scrollWidth,
      height:document.documentElement.scrollHeight,
      h1:document.querySelector("h1").textContent,
      font:getComputedStyle(document.body).fontFamily,
      fonts:[...document.fonts].map(font=>({family:font.family,status:font.status})),
      brokenImages:[...document.images].filter(image=>!image.complete||!image.naturalWidth).map(image=>image.getAttribute("src")),
      sections:[...document.querySelectorAll("main section")].map(element=>{
        const rect=element.getBoundingClientRect();return {className:element.className,x:rect.x,y:rect.y,width:rect.width,height:rect.height};
      }),
      grids:[...document.querySelectorAll("main *")].filter(element=>getComputedStyle(element).display==="grid").map(element=>({className:element.className,columns:getComputedStyle(element).gridTemplateColumns,count:element.children.length})),
      text:document.querySelector("main").innerText,
    }));
    cases.push({locale,width,file,errors,externalRequests,...metrics});
    await page.close();
  }
} finally {await browser?.close();await new Promise(done=>server.close(done));}
const report = {phase,capturedAt:new Date().toISOString(),source,sourceHashes,bundleSha256:hash(script),cssSha256:hash(css),limitations:["Offline real-source React fixture, not Next SSR/hydration.","Synthetic signed-out auth, mutations disabled, empty CMS blog, no production data.","Repository font files; real global Tailwind and CSS modules. Cookie consent dismissed state."],cases};
await writeFile(resolve(audit,`S5-${phase}-capture.json`),JSON.stringify(report,null,2)+"\n");
if (phase === "after") {
  const baseline = JSON.parse(await readFile(resolve(audit,"S5-before-capture.json"),"utf8"));
  const comparisons = cases.map(current => {
    const before = baseline.cases.find(row=>row.locale===current.locale && row.width===current.width);
    return {locale:current.locale,width:current.width,beforeHeight:before.height,afterHeight:current.height,heightDelta:current.height-before.height,
      sectionCountUnchanged:before.sections.length===current.sections.length,
      sectionWidthsUnchanged:before.sections.every((section,index)=>section.width===current.sections[index]?.width && section.x===current.sections[index]?.x),
      gridsUnchanged:JSON.stringify(before.grids)===JSON.stringify(current.grids),
      sectionDeltas:current.sections.map((section,index)=>({className:section.className,yDelta:section.y-before.sections[index].y,heightDelta:section.height-before.sections[index].height})),
      overflow:current.overflow,errors:current.errors,brokenImages:current.brokenImages,externalRequests:current.externalRequests};
  });
  await writeFile(resolve(audit,"S5-visual-comparison.json"),JSON.stringify(comparisons,null,2)+"\n");
}
console.log(JSON.stringify({phase,cases:cases.map(({locale,width,overflow,errors,brokenImages,height})=>({locale,width,overflow,errors,brokenImages,height}))},null,2));
if(cases.some(row=>row.overflow||row.errors.length||row.brokenImages.length)) process.exitCode=1;
