import assert from "node:assert/strict";
import { mkdir, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { resolve } from "node:path";
import { chromium } from "playwright";
import AxeBuilder from "@axe-core/playwright";
import { checkSaddleSeo } from "./seo.mjs";
import { homeCases, prepareHomeScenario } from "./home.mjs";

const root = fileURLToPath(new URL("../../../", import.meta.url));
const output = resolve(root, "plans/reliability/renders");
const origin = process.argv[2] ?? "http://127.0.0.1:3000";
const includeHome = process.argv.includes("--home");
const prefix = includeHome ? "Q5" : "Q3";
assert(["127.0.0.1", "localhost", "[::1]"].includes(new URL(origin).hostname), "Local server only");
await mkdir(output, { recursive: true });
const results = [];
const seo = await checkSaddleSeo(origin);
const browser = await chromium.launch({ headless: true });
const cases = ["quick-height", "quick-inseam", "full-height", "full-ok", "full-check", "full-confirmed", "full-large", "full-override", "handoff"];
if (includeHome) cases.push(...homeCases);

async function setMeasurement(page, kind, value) {
  const label = kind === "height" ? /(?:je lengte|your height|body height|^lengte$|^height$)/i : /(?:binnenbeen|inseam)/i;
  const candidates = page.locator(`input[data-testid="saddle-${kind}-input"], input[id="saddle-${kind}"]`);
  const numeric = candidates.or(page.getByRole("spinbutton", { name: label }));
  if (await numeric.count()) {
    await numeric.first().fill(String(value));
    await numeric.first().press("Tab");
    return;
  }
  const slider = page.getByRole("slider", { name: label }).first();
  await slider.focus();
  await slider.press("Home");
  for (let index = 0; index < 250; index += 1) {
    const current = Number(await slider.getAttribute("aria-valuenow"));
    if (current >= value) { assert.equal(current, value); return; }
    await slider.press("ArrowRight");
  }
  throw new Error(`Cannot set ${kind} to ${value}`);
}

try {
  for (const locale of ["nl", "en"]) for (const width of [1440, 390]) for (const state of cases) {
    const context = await browser.newContext({ viewport: { width, height: width === 390 ? 844 : 1000 }, locale, reducedMotion: "reduce", ignoreHTTPSErrors: true });
    if (state !== "home-firstvisit") {
      await context.addCookies([{ name: "bf_cookie_consent", value: "essential", url: origin }]);
      await context.addInitScript(() => localStorage.setItem("bf_cookie_consent", "essential"));
    }
    await context.addInitScript(() => {
      window.__reliabilityLayoutShifts = [];
      if (!PerformanceObserver.supportedEntryTypes.includes("layout-shift")) return;
      new PerformanceObserver(list => {
        for (const entry of list.getEntries()) {
          if (entry.hadRecentInput) continue;
          window.__reliabilityLayoutShifts.push({ value: entry.value, startTime: entry.startTime,
            sources: (entry.sources ?? []).map(source => ({ tag: source.node?.tagName,
              id: source.node?.id, className: source.node?.getAttribute?.("class"),
              previousRect: source.previousRect, currentRect: source.currentRect })) });
        }
      }).observe({ type: "layout-shift", buffered: true });
    });
    const page = await context.newPage();
    const errors = [];
    const offlineErrors = [];
    await context.route("**/*", route => {
      const url = new URL(route.request().url());
      if (url.origin !== new URL(origin).origin) return route.abort();
      if (["/_vercel/insights/script.js", "/_vercel/speed-insights/script.js"].includes(url.pathname)) {
        return route.fulfill({ status: 200, contentType: "application/javascript", body: "" });
      }
      return route.continue();
    });
    page.on("pageerror", error => errors.push(error.message));
    page.on("console", message => {
      if (message.type() !== "error") return;
      const text = message.text();
      if (text.startsWith("Connecting to 'ws://127.0.0.1:9/api/") && text.includes("Content Security Policy")) {
        offlineErrors.push(text);
        return;
      }
      const resourceUrl = message.location().url;
      if (text === "Failed to load resource: net::ERR_FAILED" && resourceUrl
        && new URL(resourceUrl).origin !== new URL(origin).origin) return;
      errors.push(text);
    });
    try {
      const home = state.startsWith("home-");
      let homeEvidence;
      if (home) {
        homeEvidence = await prepareHomeScenario({ page, origin, locale, state, setMeasurement });
      } else {
      await page.goto(`${origin}/${locale}/calculators/saddle-height`, { waitUntil: "networkidle" });
      const quick = state.startsWith("quick");
      await page.getByRole("button", { name: quick ? /quick fix/i : /volledig advies|full advice/i }).first().click();
      await setMeasurement(page, "height", 190);
      if (!["quick-height", "full-height"].includes(state)) {
        if (quick) await page.getByText(/Heb je nog 2 minuten|Have.*2.*minutes|Got.*2.*minutes/i).first().click();
        await setMeasurement(page, "inseam", ["full-check", "full-confirmed"].includes(state) ? 95 : ["full-large", "full-override"].includes(state) ? 103 : 89);
      }
      if (state === "full-confirmed") await page.getByRole("button", { name: /Klopt, ga verder|Correct, continue|That.*right.*continue/i }).click();
      if (state === "full-override") await page.getByRole("button", { name: /Toch gebruiken|Use anyway/i }).click();
      assert.equal(await page.getByRole("slider").count(), state === "quick-height" ? 1 : 2,
        "Only height and optional inseam may be interactive inputs");
      if (state === "full-check") await page.getByRole("button", { name: /Klopt, ga verder|Correct, continue/i }).waitFor();
      if (state === "full-large") await page.getByRole("button", { name: /Toch gebruiken|Use anyway/i }).waitFor();
      }
      await page.evaluate(() => document.fonts.ready);
      const range = page.getByRole("img", { name: /Zadelhoogte.*bereik|Saddle height.*range/i }).first();
      await range.waitFor();
      const label = await range.getAttribute("aria-label");
      if (["quick-height", "full-height", "full-large"].includes(state)) assert.match(label, /789.*740.*840/);
      if (["quick-inseam", "full-ok", "handoff"].includes(state)) assert.match(label, /786.*765.*810/);
      if (state === "full-override") {
        const dashed = await range.evaluate(node => [...node.querySelectorAll("*")].some(child => getComputedStyle(child).borderTopStyle === "dashed"));
        assert(dashed, "Override must retain dashed uncertainty zone");
      }
      if (state === "handoff") {
        const handoffLink = page.locator('a[href*="src=saddle-height"][href*="handoff=1"]');
        assert.equal(await handoffLink.getAttribute("href"), `/${locale}/login?src=saddle-height&handoff=1`);
        const entries = await page.evaluate(() => JSON.parse(sessionStorage.getItem("bbf.handoff") ?? "{}").entries ?? []);
        assert(entries.some(entry => entry.field === "heightCm" && entry.value === 190));
        assert(entries.some(entry => entry.field === "inseamCm" && entry.value === 89 && entry.method === "measured"));
      }
      await page.evaluate(() => window.scrollTo(0, 0));
      const metrics = await page.evaluate(() => ({ overflow: document.documentElement.scrollWidth > innerWidth,
        layoutShifts: window.__reliabilityLayoutShifts ?? [],
        layoutShiftTotal: (window.__reliabilityLayoutShifts ?? []).reduce((total, entry) => total + entry.value, 0) }));
      const rangeBottom = await range.evaluate(node => node.getBoundingClientRect().bottom);
      let firstScreen;
      if (state === "quick-height" && width === 390) {
        const practicalTop = await page.locator("#quick-fix-practical-title").evaluate(node => node.parentElement.getBoundingClientRect().top);
        const optionalBottom = await page.getByRole("button", { name: /Heb je nog 2 minuten|Got 2 more minutes/i }).evaluate(node => node.getBoundingClientRect().bottom);
        firstScreen = { practicalTop, optionalBottom, rangeBottom };
        assert(rangeBottom <= 844 && practicalTop <= 844 && optionalBottom <= 844,
          `Quick flow extends beyond first screen: ${JSON.stringify(firstScreen)}`);
      }
      if (!home && !state.startsWith("quick") && width === 1440) {
        const heightInput = page.getByRole("slider", { name: /je lengte|your height|body height|^lengte$|^height$/i }).first();
        const inputBounds = await heightInput.boundingBox();
        const resultBounds = await range.boundingBox();
        assert(inputBounds && resultBounds && inputBounds.x + inputBounds.width <= resultBounds.x,
          "Desktop must retain Main board input-left/result-right layout");
      }
      const axe = await new AxeBuilder({ page }).analyze();
      const violations = axe.violations.map(({ id, impact, nodes }) => ({ id, impact, targets: nodes.map(node => node.target) }));
      const screenshot = `${prefix}-${locale}-${state}-${width}.png`;
      await page.screenshot({ path: resolve(output, screenshot), fullPage: true, animations: "disabled" });
      if (state === "quick-height" || state === "full-ok" || home) {
        await page.screenshot({ path: resolve(output, `${prefix}-${locale}-${state}-${width}-viewport.png`), animations: "disabled" });
      }
      results.push({ locale, width, state, label, screenshot, rangeBottom, firstScreen, homeEvidence, metrics, errors, offlineErrors, violations });
    } catch (error) {
      results.push({ locale, width, state, error: String(error), errors });
      await page.screenshot({ path: resolve(output, `${prefix}-${locale}-${state}-${width}-failure.png`), fullPage: true }).catch(() => {});
    } finally { await context.close(); }
  }
} finally {
  await browser.close();
  await writeFile(resolve(output, `${prefix}-visual.json`), JSON.stringify({ origin, scope: "Real local production pages; necessary-only cookie consent preloaded; external requests blocked; two local Vercel analytics scripts stubbed empty; browser ERR_FAILED from blocked resources excluded; exact loopback:9 Convex CSP errors recorded separately; no authentication or persistence performed.", seo, results }, null, 2));
}
const failures = results.filter(result => result.error || result.errors.length || result.metrics?.overflow || result.violations?.some(item => ["serious", "critical"].includes(item.impact)));
console.log(JSON.stringify({ captures: results.length, failures, output }, null, 2));
if (failures.length || results.length !== cases.length * 4) process.exitCode = 1;
