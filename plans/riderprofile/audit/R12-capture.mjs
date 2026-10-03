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
import { createRoot } from "react-dom/client";
import * as handoff from '@/lib/handoff/store';
import {writeCookieConsent} from '@/lib/cookieConsent';
window.__retention={...handoff,writeCookieConsent};
import { SaddleHeightCalculatorForm } from "@/app/(public)/calculators/saddle-height/SaddleHeightCalculatorForm";
import { FrameSizeCalculatorForm } from "@/app/(public)/calculators/frame-size/FrameSizeCalculatorForm";
import { ConfiguratorHeaderSwitch } from "@/components/layout/ConfiguratorHeaderSwitch";
import { ThemeProvider } from "@/components/providers/ThemeProvider";
import { ToastProvider } from "@/components/ui/Toast";
import nl from "@/i18n/messages/nl";
import en from "@/i18n/messages/en";
const locale = location.pathname.startsWith("/en/") ? "en" : "nl";
const dictionary = locale === "nl" ? nl : en;
document.documentElement.lang = locale;
const form = location.pathname.includes("frame-size")
  ? <FrameSizeCalculatorForm locale={locale} /> : <SaddleHeightCalculatorForm isNl={locale === "nl"} />;
createRoot(document.getElementById("root")).render(<ThemeProvider><ToastProvider>
  <ConfiguratorHeaderSwitch locale={locale} loginLabel={dictionary.nav.login} languageLabels={dictionary.common}>
    {null}
  </ConfiguratorHeaderSwitch><main>{form}</main>
</ToastProvider></ThemeProvider>);
`;
const bundle = await build({
  absWorkingDir: root, stdin: { contents: entry, loader: "jsx", resolveDir: root }, bundle: true,
  write: false, outdir: "/tmp/r1-public-memory", format: "esm", platform: "browser", jsx: "automatic",
  logLevel: "error", define: { "process.env": "{}", "process.env.NODE_ENV": '"production"' },
  plugins: [{ name: "r1-fixture-boundaries", setup(builder) {
    builder.onResolve({ filter: /^(convex\/react|@convex-dev\/auth\/react|next\/navigation|@\/i18n\/request|@sentry\/nextjs|@\/components\/feedback\/FeedbackPanelProvider)$/ },
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
  + '<title>R12 real public calculator retention</title><link rel="stylesheet" href="/fixture.css"></head>'
  + '<body><div id="root"></div><script type="module" src="/fixture.js"></script></body></html>';
const server = createServer(async (request, response) => {
  try {
    const pathname = new URL(request.url, "http://localhost").pathname;
    if (pathname === "/fixture.js") { response.setHeader("content-type", "text/javascript"); response.end(script); return; }
    if (pathname === "/fixture.css") {
      response.setHeader("content-type", "text/css"); response.end(styles.css + moduleCss + fonts); return;
    }
    if (pathname === "/board") { response.setHeader("content-type", "text/html"); response.end("<!doctype html><title>RP1 board</title>"); return; }
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
  for(const locale of ["nl","en"]) for(const width of [1440,390]){
    const context=await browser.newContext({viewport:{width,height:1000},reducedMotion:"reduce"});
    await context.route("https://**/*",route=>route.abort());
    const page=await context.newPage();const errors=[];
    page.on("pageerror",error=>errors.push(error.message));
    const goto=async target=>target.goto(`${origin}/${locale}/calculators/saddle-height`,{waitUntil:"networkidle"});
    await goto(page);
    await page.getByRole("slider").first().waitFor();
    await page.getByRole("slider").first().press("ArrowRight");
    assert(await page.evaluate(()=>!!sessionStorage.getItem("bbf.handoff")));
    assert.equal(await page.evaluate(()=>localStorage.getItem("bbf.handoff")),null,"No consent stays session-only");
    await page.evaluate(()=>window.__retention.clearHandoff());
    await page.evaluate(()=>window.__retention.writeCookieConsent("essential"));
    await page.getByRole("slider").first().press("ArrowRight");
    assert(await page.evaluate(()=>!!sessionStorage.getItem("bbf.handoff")));
    assert.equal(await page.evaluate(()=>localStorage.getItem("bbf.handoff")),null);
    let next=await context.newPage();await goto(next);
    assert.equal(await next.evaluate(()=>window.__retention.readHandoff().entries.length),0,"Essential is session-only");
    await next.close();
    await page.evaluate(()=>window.__retention.writeCookieConsent("accepted"));
    await page.getByRole("slider").first().press("ArrowRight");
    assert(await page.evaluate(()=>!!localStorage.getItem("bbf.handoff")));
    await page.screenshot({path:resolve(renders,`R12-accepted-${locale}-${width}.png`),fullPage:true});
    // A fresh browser context receives cookies/localStorage, never sessionStorage.
    const persisted=await context.storageState();
    const returning=await browser.newContext({storageState:persisted,viewport:{width,height:1000}});
    await returning.route("https://**/*",route=>route.abort());
    next=await returning.newPage();await goto(next);
    assert((await next.evaluate(()=>window.__retention.readHandoff().entries.length))>0,"Accepted survives a new session");
    await next.screenshot({path:resolve(renders,`R12-returning-${locale}-${width}.png`),fullPage:true});
    await next.evaluate(()=>window.__retention.writeCookieConsent("essential"));
    assert.equal(await next.evaluate(()=>localStorage.getItem("bbf.handoff")),null,"Withdrawal removes retained data");
    for(const reason of ["confirm","cancel","logout"]){
      await next.evaluate(()=>{
        window.__retention.writeCookieConsent("accepted");
        window.__retention.writeHandoffEntry({field:"inseamCm",value:84,unit:"cm",calculator:"saddle-height",method:"measured",touchedAt:Date.now()});
        window.__retention.clearHandoff();
      });
      assert.equal(await next.evaluate(()=>sessionStorage.getItem("bbf.handoff")),null,`${reason} shared clear session`);
      assert.equal(await next.evaluate(()=>localStorage.getItem("bbf.handoff")),null,`${reason} shared clear retained`);
    }
    await next.evaluate(()=>{
      window.__retention.writeCookieConsent("accepted");
      localStorage.setItem("bbf.handoff",JSON.stringify({version:1,entries:[{
        field:"inseamCm",value:84,unit:"cm",calculator:"saddle-height",method:"measured",
        touchedAt:Date.now()-31*24*60*60*1000}]}));
    });
    assert.equal(await next.evaluate(()=>window.__retention.readHandoff().entries.length),0,"Expired entries are omitted");
    assert.equal(await next.evaluate(()=>localStorage.getItem("bbf.handoff")),null,"Expired record is deleted");
    assert.deepEqual(errors,[]);
    results.push({locale,width,noConsentSessionOnly:true,essentialSessionOnly:true,acceptedAcrossSessions:true,withdrawal:true,expiry:true,
      sharedClearReasons:["confirm","cancel","logout"],errors});
    await returning.close();await context.close();
  }
  await writeFile(resolve(root,"plans/riderprofile/audit/R12-browser.json"),JSON.stringify({
    fixture:"Real public saddle form and handoff/consent modules; no backend requests. Confirm/cancel/logout share clearHandoff; calls are checked separately by source review.",results},null,2)+"\n");
}finally{await browser.close();await new Promise(done=>server.close(done));}
