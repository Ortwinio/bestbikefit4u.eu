import { createServer } from "node:http";
import { readFile, mkdir } from "node:fs/promises";
import { resolve, extname } from "node:path";
import { build } from "esbuild";
import postcss from "postcss";
import tailwind from "@tailwindcss/postcss";
import { chromium } from "playwright";

const root = process.cwd();
const output = resolve(root, "plans/riderprofile/renders");
await mkdir(output, { recursive: true });
const runtime = `
const locale = new URLSearchParams(location.search).get('locale') || 'nl';
export function usePathname(){return '/' + locale + '/login'}
export function useSearchParams(){return new URLSearchParams('handoff=1&src=saddle-height')}
export function useRouter(){return {push(){},replace(){}}}
export function useConvexAuth(){return {isAuthenticated:false,isLoading:false}}
export function useMutation(){return async()=>null}
export function useQuery(){return undefined}
export function useAuthActions(){return {signIn:async()=>({signingIn:false})}}
export function useMarketingEventLogger(){return ()=>{}}
export function useTheme(){return {resolvedTheme:'light'}}
`;
const bundle = await build({
  absWorkingDir: root, bundle: true, write: false, outdir: "/tmp/r2-login-memory", format: "esm",
  platform: "browser", jsx: "automatic",
  stdin: { resolveDir: root, loader: "jsx", contents: `
    import {createRoot} from 'react-dom/client';
    import LoginPage from '@/app/(auth)/login/page';
    createRoot(document.getElementById('root')).render(<LoginPage/>);` },
  define: { "process.env.NODE_ENV": '"production"', "process.env.NEXT_PUBLIC_GOOGLE_AUTH_ENABLED": '"true"',
    "process.env.NEXT_PUBLIC_ENABLE_LOCALHOST_DEV_LOGIN": '"false"', "process.env": "{}" },
  plugins: [{ name: "login-fixture", setup(builder) {
    builder.onResolve({ filter: /^(convex\/react|@convex-dev\/auth\/react|next\/navigation|@\/components\/analytics\/MarketingEventTracker|@\/components\/providers\/ThemeProvider)$/ },
      () => ({ path: "runtime", namespace: "fixture" }));
    builder.onLoad({ filter: /.*/, namespace: "fixture" }, () => ({ contents: runtime, loader: "js" }));
    for (const name of ["link", "image"]) builder.onResolve({ filter: new RegExp(`^next/${name}$`) },
      () => ({ path: resolve(root, `tests/visual/account-batch1/${name}.jsx`) }));
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
  const pathname = new URL(request.url, "http://localhost").pathname;
  if (pathname === "/fixture.js") { response.setHeader("Content-Type", "text/javascript"); response.end(script); }
  else if (pathname === "/fixture.css") { response.setHeader("Content-Type", "text/css"); response.end(compiled.css + moduleCss + fonts); }
  else if (pathname.startsWith("/brand/")) {
    const target = resolve(root, "public", `.${pathname}`);
    if (!target.startsWith(resolve(root, "public") + "/")) { response.writeHead(404); response.end(); return; }
    try {
      response.setHeader("Content-Type", extname(target) === ".svg" ? "image/svg+xml" :
        extname(target) === ".woff2" ? "font/woff2" : "image/png");
      response.end(await readFile(target));
    } catch { response.writeHead(404); response.end(); }
  } else {
    response.setHeader("Content-Type", "text/html");
    response.end('<!doctype html><html><head><meta name="viewport" content="width=device-width,initial-scale=1"><link rel="stylesheet" href="/fixture.css"></head><body><div id="root"></div><script type="module" src="/fixture.js"></script></body></html>');
  }
});
await new Promise(done => server.listen(0, "127.0.0.1", done));
const browser = await chromium.launch({ headless: true });
try {
  for (const locale of ["nl", "en"]) for (const width of [1440, 390]) for (const state of ["email", "code", "empty"]) {
    const page = await browser.newPage({ viewport: { width, height: 1000 } });
    const errors = [];
    page.on("pageerror", error => errors.push(error.message));
    await page.addInitScript(({ state }) => {
      if (state === "empty") return;
      sessionStorage.setItem("bbf.handoff", JSON.stringify({ version: 1, entries: [
        { field: "inseamCm", value: 81, unit: "cm", method: "measured" },
        { field: "heightCm", value: 174, unit: "cm", method: "measured" },
        { field: "ridingGoal", value: "balanced", unit: "none", method: "declared" },
        { field: "bikeCategory", value: "road", unit: "none", method: "bike" },
        { field: "currentSaddleHeightMm", value: 728, unit: "mm", method: "bike" },
      ].map(entry => ({ ...entry, calculator: "saddle-height", touchedAt: Date.now() })) }));
    }, { state });
    await page.goto(`http://127.0.0.1:${server.address().port}/login?locale=${locale}`);
    await page.getByRole("heading", { level: 1 }).waitFor();
    if (state === "code") {
      await page.locator('input[type="email"]').fill("fixture@example.test");
      await page.locator('input[type="email"]').press("Enter");
      await page.locator('input[autocomplete="one-time-code"]').waitFor();
    }
    await page.evaluate(() => document.fonts.ready);
    await page.screenshot({ path: resolve(output, `R2-login-${state}-${locale}-${width}.png`), fullPage: true });
    if (errors.length) throw new Error(errors.join("\n"));
    if (await page.evaluate(() => document.documentElement.scrollWidth > innerWidth)) throw new Error("Horizontal overflow");
    await page.close();
  }
  console.log("12 login renders captured; no page errors or horizontal overflow.");
} finally { await browser.close(); await new Promise(done => server.close(done)); }
