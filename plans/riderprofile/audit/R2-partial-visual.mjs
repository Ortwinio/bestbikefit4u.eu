import assert from "node:assert/strict";
import { createServer } from "node:http";
import { mkdir, readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { build } from "esbuild";
import postcss from "postcss";
import tailwind from "@tailwindcss/postcss";
import { chromium } from "playwright";

const root = process.cwd();
const renders = resolve(root, "plans/riderprofile/renders");
await mkdir(renders, { recursive: true });
const runtime = `import {getFunctionName} from 'convex/server';
import {getDashboardMessages} from '@/i18n/dashboardMessages';
export const locale = new URLSearchParams(location.search).get('locale') || 'nl';
export function useDashboardMessages(){return {locale,messages:getDashboardMessages(locale)}}
export function useSearchParams(){return new URLSearchParams()}
export function usePathname(){return '/' + locale + '/profile'}
export function useRouter(){return {push(){}}}
export function useQuery(ref){
  const name=getFunctionName(ref);
  if(name==='profiles/queries:getMyProfile')return {_id:'profile',inseamCm:83};
  if(name==='users/queries:getCurrentUser')return {_id:'user',name:'Rider'};
  return 0;
}
export function useMutation(){return async()=>{throw new Error('Unexpected fixture mutation')}}
export function useMarketingEventLogger(){return ()=>{}}
export function ProfilePhotoUpload(){return null}
export function captureException(){}`;
const bundle = await build({
  absWorkingDir: root, bundle: true, write: false, format: "esm", platform: "browser", jsx: "automatic",
  stdin: { resolveDir: root, loader: "jsx", contents: `import {createRoot} from 'react-dom/client';
    import Profile from '@/app/(dashboard)/profile/page';
    import {ToastProvider} from '@/components/ui/Toast';
    createRoot(document.getElementById('root')).render(<ToastProvider><main className="p-4"><Profile/></main></ToastProvider>);` },
  define: { "process.env.NODE_ENV": '"production"' },
  plugins: [{ name: "partial-profile-fixture", setup(builder) {
    builder.onResolve({ filter: /^(convex\/react|next\/navigation|@\/i18n\/useDashboardMessages|@\/components\/analytics\/MarketingEventTracker|@\/components\/profile\/ProfilePhotoUpload|@sentry\/nextjs)$/ }, () => ({ path: "runtime", namespace: "partial" }));
    builder.onLoad({ filter: /.*/, namespace: "partial" }, () => ({ contents: runtime, loader: "jsx", resolveDir: root }));
    builder.onResolve({ filter: /^next\/link$/ }, () => ({ path: resolve(root, "tests/visual/account-batch1/link.jsx") }));
    builder.onResolve({ filter: /^next\/image$/ }, () => ({ path: resolve(root, "tests/visual/account-batch1/image.jsx") }));
  } }],
});
const globals = resolve(root, "src/app/globals.css");
const styles = await postcss([tailwind({ base: root })]).process(await readFile(globals, "utf8"), { from: globals });
const server = createServer((request, response) => {
  if (request.url === "/fixture.js") { response.setHeader("Content-Type", "text/javascript"); response.end(bundle.outputFiles[0].text); }
  else if (request.url === "/fixture.css") { response.setHeader("Content-Type", "text/css"); response.end(styles.css); }
  else { response.setHeader("Content-Type", "text/html"); response.end('<!doctype html><html><head><meta name="viewport" content="width=device-width,initial-scale=1"><link rel="stylesheet" href="/fixture.css"></head><body><div id="root"></div><script type="module" src="/fixture.js"></script></body></html>'); }
});
await new Promise(done => server.listen(0, "127.0.0.1", done));
const browser = await chromium.launch({ headless: true });
try {
  for (const locale of ["nl", "en"]) for (const width of [1440, 390]) {
    const page = await browser.newPage({ viewport: { width, height: 1000 } });
    const errors = [];
    page.on("pageerror", error => errors.push(error.message));
    await page.goto(`http://127.0.0.1:${server.address().port}/?locale=${locale}`, { waitUntil: "networkidle" });
    const inseam = page.getByRole("slider", { name: locale === "nl" ? "Binnenbeenlengte" : "Inseam", exact: true });
    await inseam.waitFor();
    assert.equal(await inseam.getAttribute("aria-valuenow"), "83");
    assert.deepEqual(errors, []);
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false);
    await page.screenshot({ path: resolve(renders, `R2-partial-profile-${locale}-${width}.png`), fullPage: true });
    await page.close();
  }
} finally {
  await browser.close();
  await new Promise(done => server.close(done));
}
console.log("PASS: partial-profile NL/EN at 1440 and 390; saved inseam, no overflow or browser errors.");
