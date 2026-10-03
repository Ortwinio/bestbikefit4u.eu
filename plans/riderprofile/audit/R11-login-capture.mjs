import assert from "node:assert/strict";
import { createServer } from "node:http";
import { readFile, mkdir, writeFile } from "node:fs/promises";
import { resolve, extname } from "node:path";
import { build } from "esbuild";
import postcss from "postcss";
import tailwind from "@tailwindcss/postcss";
import { chromium } from "playwright";

const root = process.cwd();
assert.equal(root, "/Users/ortwinverreck/Developer/bestbikefit4u-rider");
const output = resolve(root, "plans/riderprofile/renders");
await mkdir(output, { recursive: true });
const runtime = `
import {useSyncExternalStore} from 'react';
import {getFunctionName} from 'convex/server';
const locale = location.pathname.split('/')[1];
const key = 'R11-fixture-runtime';
const record = JSON.parse(sessionStorage.getItem(key) || '{"signIns":[],"mutations":[],"events":[],"navigations":[],"authenticated":false}');
const listeners = new Set();
const persist = () => sessionStorage.setItem(key, JSON.stringify(record));
const notify = () => {persist(); listeners.forEach(listener => listener());};
const user = {email:'current-rider@example.test'};
const subscribe = listener => {listeners.add(listener); return () => listeners.delete(listener);};
const router = {push(path){record.navigations.push(path);persist();},replace(path){record.navigations.push(path);persist();}};
const log = event => {record.events.push(event);persist();};
const save = async args => {
  if (!record.authenticated) throw new Error('Fixture rejected unauthenticated mutation');
  record.mutations.push(args);persist();
  if (window.__R11.failNext) {window.__R11.failNext=false; throw new Error('Local simulated save failure');}
  if (args.expectedEmail !== user.email) throw new Error('Fixture rejected email mismatch');
  return {newsletter:true,granted:true};
};
const signIn = async (provider,args) => {
  record.signIns.push({provider,args});persist();
  if (provider === 'google') {
    record.authenticated=true;persist();
    return {redirect:new URL('/'+locale+'/login?view=google-return',location.origin)};
  }
  if (provider !== 'resend') throw new Error('Unexpected fixture auth provider');
  if (args.code) {
    if(args.code !== 'TEST123') throw new Error('Invalid local code');
    setTimeout(() => {record.authenticated=true;notify();},0);
    return {signingIn:true};
  }
  return {signingIn:false};
};
window.__R11={record,failNext:false};
export function usePathname(){return '/'+locale+'/login';}
export function useSearchParams(){return new URLSearchParams();}
export function useRouter(){return router;}
export function useConvexAuth(){const authenticated=useSyncExternalStore(subscribe,()=>record.authenticated);return {isAuthenticated:authenticated,isLoading:false};}
export function useQuery(reference){if(getFunctionName(reference)!=='users/queries:getCurrentUser')throw new Error('Unexpected fixture query');return record.authenticated?user:null;}
export function useMutation(reference){if(getFunctionName(reference)!=='emails/preferences:setNewsletter')throw new Error('Unexpected fixture mutation');return save;}
export function useAuthActions(){return {signIn};}
export function useMarketingEventLogger(){return log;}
export function useTheme(){return {theme:'light',resolvedTheme:'light',setTheme(){}};}
`;
const bundle = await build({
  absWorkingDir: root, bundle: true, write: false, outdir: "/tmp/r11-login-memory", format: "esm",
  platform: "browser", jsx: "automatic",
  stdin: { resolveDir: root, loader: "jsx", contents: `
    import {createRoot} from 'react-dom/client';
    import LoginPage from '@/app/(auth)/login/page';
    createRoot(document.getElementById('root')).render(<LoginPage/>);` },
  define: { "process.env.NODE_ENV": '"production"', "process.env.NEXT_PUBLIC_GOOGLE_AUTH_ENABLED": '"true"',
    "process.env.NEXT_PUBLIC_ENABLE_LOCALHOST_DEV_LOGIN": '"false"', "process.env": "{}" },
  plugins: [{ name: "r11-login-fixture", setup(builder) {
    builder.onResolve({ filter: /^(convex\/react|@convex-dev\/auth\/react|next\/navigation|@\/components\/analytics\/MarketingEventTracker|@\/components\/providers\/ThemeProvider)$/ },
      () => ({ path: "runtime", namespace: "fixture" }));
    builder.onLoad({ filter: /.*/, namespace: "fixture" }, () => ({ contents: runtime, loader: "js", resolveDir: root }));
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
  else if (/^\/(nl|en)\/login$/.test(pathname)) {
    response.setHeader("Content-Type", "text/html");
    response.end(`<!doctype html><html lang="${pathname.split('/')[1]}"><head><meta name="viewport" content="width=device-width,initial-scale=1"><link rel="stylesheet" href="/fixture.css"></head><body class="antialiased"><div id="root"></div><script type="module" src="/fixture.js"></script></body></html>`);
  } else {
    const target = resolve(root, "public", `.${pathname}`);
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
  for (const locale of ["nl", "en"]) for (const width of [1440, 390]) {
    const context = await browser.newContext({ viewport: { width, height: 1000 }, serviceWorkers: "block" });
    const blocked = [];
    await context.route("**/*", route => {
      if (new URL(route.request().url()).origin === origin) return route.continue();
      blocked.push(route.request().url());
      return route.abort();
    });
    await context.routeWebSocket(/.*/, socket => { blocked.push(socket.url()); socket.close(); });
    let page = await context.newPage();
    const errors = [];
    const record = () => page.evaluate(() => window.__R11.record);
    const snapshot = async state => {
      await page.evaluate(async () => {
        await document.fonts.ready;
        await Promise.all([...document.images].map(image => image.decode().catch(() => {})));
      });
      assert.deepEqual(await page.evaluate(() => [...document.images].filter(image => !image.complete || !image.naturalWidth).map(image => image.src)), []);
      assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false, state);
      assert.deepEqual(errors, [], state);
      assert.deepEqual(blocked, [], "Unexpected external request");
      const file = `R11-login-${state}-${locale}-${width}.png`;
      if (state === "checked" || state === "codechecked") assert.equal(await page.getByRole("checkbox").isChecked(), true);
      await page.screenshot({ path: resolve(output, file), fullPage: true, animations: "disabled" });
      results.push({ file, locale, width, state, overflow: false, runtimeErrors: [], externalRequests: [] });
    };
    const reset = async () => {
      await page.close();
      page = await context.newPage();
      page.on("pageerror", error => errors.push(error.message));
      page.on("console", message => { if (message.type() === "error") errors.push(message.text()); });
      await page.goto(`${origin}/${locale}/login`);
      await page.getByRole("checkbox").waitFor();
      assert.equal(await page.getByRole("checkbox").isChecked(), false);
    };
    const requestCode = async () => {
      await page.locator('input[type="email"]').fill("current-rider@example.test");
      await page.locator('input[type="email"]').press("Enter");
      await page.locator('input[autocomplete="one-time-code"]').waitFor();
      assert.equal((await record()).mutations.length, 0);
    };
    const verifyCode = async () => {
      await page.locator('input[autocomplete="one-time-code"]').fill("TEST123");
      await page.locator('input[autocomplete="one-time-code"]').press("Enter");
      await page.waitForFunction(() => window.__R11.record.navigations.length > 0);
    };
    await reset();
    await snapshot("unchecked");
    await requestCode();
    await verifyCode();
    assert.equal((await record()).mutations.length, 0);
    await reset();
    await page.getByRole("checkbox").check();
    assert.equal((await record()).mutations.length, 0);
    await snapshot("checked");
    await requestCode();
    await snapshot("codechecked");
    await verifyCode();
    const emailProof = await record();
    assert.equal(emailProof.mutations.length, 1);
    assert.equal(emailProof.mutations[0].expectedEmail, "current-rider@example.test");
    assert.equal(emailProof.mutations[0].consent.locale, locale);
    await reset();
    await page.getByRole("checkbox").check();
    await page.getByRole("button", { name: locale === "nl" ? "Doorgaan met Google" : "Continue with Google", exact: true }).click();
    await page.getByRole("heading", { name: locale === "nl" ? "Bevestig je nieuwsbriefkeuze" : "Confirm your newsletter choice" }).waitFor();
    assert.equal((await record()).mutations.length, 0);
    await page.getByText("current-rider@example.test", { exact: true }).waitFor();
    await snapshot("googleconfirmation");
    await page.evaluate(() => { window.__R11.failNext = true; });
    await page.getByRole("button", { name: locale === "nl" ? "Ja, stuur mij de nieuwsbrief" : "Yes, send me the newsletter", exact: true }).click();
    await page.getByRole("alert").waitFor();
    assert.equal((await record()).events.filter(event => event.eventType === "newsletter_opt_in").length, 0);
    await snapshot("failure");
    await page.getByRole("button", { name: locale === "nl" ? "Probeer opnieuw" : "Try again", exact: true }).click();
    await page.waitForFunction(() => window.__R11.record.navigations.length > 0);
    const googleProof = await record();
    assert.equal(googleProof.mutations.length, 2);
    assert.deepEqual(googleProof.mutations[0], googleProof.mutations[1]);
    assert.equal(googleProof.mutations[1].expectedEmail, "current-rider@example.test");
    assert.equal(googleProof.events.filter(event => event.eventType === "newsletter_opt_in").length, 1);
    for (const proof of [emailProof, googleProof]) {
      for (const url of [...proof.signIns.map(call => call.args.redirectTo), ...proof.navigations, page.url()]) {
        const parsed = new URL(url, origin);
        assert.ok([...parsed.searchParams.keys()].every(key => key === "view"));
        assert.ok(!url.includes("@") && !url.includes("newsletter") && !url.includes("TEST123"));
      }
      for (const event of proof.events) assert.ok(Object.keys(event).every(key => ["eventType", "locale", "pagePath", "section", "sourceTag"].includes(key)));
    }
    assert.deepEqual(errors, []);
    assert.deepEqual(blocked, []);
    await context.close();
  }
  await writeFile(resolve(output, "R11-login-results.json"), JSON.stringify({ captures: results, checks: ["default unchecked", "unchecked verification never subscribes", "email consent follows local verification", "Google requires explicit confirmation", "retry preserves requestId", "no consent in URLs", "value-free analytics", "external HTTP/WebSocket blocked"] }, null, 2));
  console.log(`${results.length} R11 renders; consent flows, runtime and overflow checks passed.`);
} finally {
  await browser?.close();
  await new Promise(done => server.close(done));
}
