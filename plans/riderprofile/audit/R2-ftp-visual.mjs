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
const runtime = `import { getFunctionName } from 'convex/server';
export const locale = new URLSearchParams(location.search).get('locale') || 'nl';
export function useDashboardMessages() { return {locale}; }
export function useSearchParams() { return new URLSearchParams(); }
export function usePathname() { return '/' + locale + location.pathname; }
export function useQuery(ref) {
  const name = getFunctionName(ref);
  if(name === 'users/queries:getCurrentUser') return {_id:'rider'};
  if(name === 'profiles/queries:getMyProfile') return {ftpWatts:245,weightKg:75,ftpMeasuredAt:Date.UTC(2026,8,15)};
  if(name === 'bikes/queries:list' || name === 'gearing/queries:listGearingSessions') return [];
  return null;
}
export function useMutation() { return async () => {throw new Error('Unexpected initial write')}; }`;
const bundle = await build({
  absWorkingDir: root, bundle: true, write: false, format: "esm", platform: "browser", jsx: "automatic",
  stdin: { resolveDir: root, loader: "jsx", contents: `
    import {createRoot} from 'react-dom/client';
    import {AccountPerformanceCalculator} from '@/components/calculators/AccountPerformanceCalculator';
    import {GearingCalculatorForm} from '@/app/(dashboard)/gearing/GearingCalculatorForm';
    createRoot(document.getElementById('root')).render(<main>{location.pathname === '/gearing'
      ? <GearingCalculatorForm/> : <AccountPerformanceCalculator calculator="ftp-wkg"/>}</main>);` },
  define: { "process.env.NODE_ENV": '"production"' },
  plugins: [{name: "ftp-fixture", setup(builder) {
    builder.onResolve({filter: /^@\/components\/calculators\/(PersonalizeAdviceBlock|HandoffPrefillNotice)$/}, () => ({path:"public-only", namespace:"ftp-public"}));
    builder.onLoad({filter: /.*/, namespace:"ftp-public"}, () => ({contents:"export function PersonalizeAdviceBlock(){throw new Error('Public-only block mounted in account')} export function HandoffPrefillNotice(){throw new Error('Public-only notice mounted in account')}", loader:"js"}));
    builder.onResolve({filter: /^(convex\/react|next\/navigation|@\/i18n\/useDashboardMessages)$/}, () => ({path:"runtime", namespace:"ftp"}));
    builder.onLoad({filter: /.*/, namespace:"ftp"}, () => ({contents:runtime, loader:"jsx", resolveDir:root}));
    builder.onResolve({filter:/^next\/link$/}, () => ({path:resolve(root,"tests/visual/account-batch1/link.jsx")}));
  }}],
});
const globals = resolve(root, "src/app/globals.css");
const styles = await postcss([tailwind({base:root})]).process(await readFile(globals,"utf8"), {from:globals});
const server = createServer((request, response) => {
  if(request.url === '/fixture.js') { response.setHeader('Content-Type','text/javascript'); response.end(bundle.outputFiles[0].text); }
  else if(request.url === '/fixture.css') { response.setHeader('Content-Type','text/css'); response.end(styles.css); }
  else { response.setHeader('Content-Type','text/html'); response.end('<!doctype html><html><head><meta name="viewport" content="width=device-width,initial-scale=1"><link rel="stylesheet" href="/fixture.css"></head><body><div id="root"></div><script type="module" src="/fixture.js"></script></body></html>'); }
});
await new Promise(done => server.listen(0,'127.0.0.1',done));
const browser = await chromium.launch({headless:true});
try {
  for(const tool of ['gearing','ftp-wkg']) for(const locale of ['nl','en']) for(const width of [1440,390]) {
    const page = await browser.newPage({viewport:{width,height:1000}});
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    await page.goto(`http://127.0.0.1:${server.address().port}/${tool}?locale=${locale}`, {waitUntil:'networkidle'});
    await page.getByText(locale === 'nl' ? /FTP uit je riderprofiel/ : /FTP from your rider profile/).waitFor();
    assert.deepEqual(errors,[]);
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth),false);
    await page.screenshot({path:resolve(renders,`R2-ftp-${tool}-${locale}-${width}.png`),fullPage:true});
    await page.close();
  }
} finally { await browser.close(); await new Promise(done => server.close(done)); }
console.log('R2 FTP: 8 screenshots; no browser errors or horizontal overflow.');
