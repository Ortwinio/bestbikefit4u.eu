import assert from "node:assert/strict";
import AxeBuilder from "@axe-core/playwright";

export function isExpectedOfflineError(text, resourceUrl, origin) {
  if (text.startsWith("Connecting to 'ws://127.0.0.1:9/api/") && text.includes("Content Security Policy")) return true;
  return text === "Failed to load resource: net::ERR_FAILED" && Boolean(resourceUrl)
    && new URL(resourceUrl).origin !== origin;
}

export async function newPublicContext(browser, { origin, locale, width, seedLegacy = false }) {
  const context = await browser.newContext({ viewport: { width, height: width === 390 ? 844 : 1000 },
    locale, reducedMotion: "reduce", ignoreHTTPSErrors: true, hasTouch: width === 390, isMobile: width === 390 });
  await context.addCookies([{ name: "bf_cookie_consent", value: "essential", url: origin }]);
  await context.addInitScript(({ seed }) => {
    localStorage.setItem("bf_cookie_consent", "essential");
    if (seed && !sessionStorage.getItem("reliability-legacy-seeded")) {
      localStorage.setItem("bbf.handoff", JSON.stringify({ version: 1, entries: [
        { field: "heightCm", value: 181, unit: "cm", calculator: "frame-size", method: "declared", touchedAt: Date.now() },
      ] }));
      sessionStorage.setItem("reliability-legacy-seeded", "1");
    }
  }, { seed: seedLegacy });
  await context.route("**/*", route => {
    const url = new URL(route.request().url());
    if (url.origin !== origin) return route.abort();
    if (["/_vercel/insights/script.js", "/_vercel/speed-insights/script.js"].includes(url.pathname)) {
      return route.fulfill({ status: 200, contentType: "application/javascript", body: "" });
    }
    return route.continue();
  });
  const page = await context.newPage();
  const errors = [];
  const offlineErrors = [];
  page.on("pageerror", error => errors.push(error.message));
  page.on("console", message => {
    if (message.type() !== "error") return;
    const text = message.text();
    if (isExpectedOfflineError(text, message.location().url, origin)) offlineErrors.push(text);
    else errors.push(text);
  });
  return { context, page, errors, offlineErrors };
}

export async function setSlider(page, name, value) {
  const slider = page.getByRole("slider", { name }).first();
  await slider.focus();
  await slider.press("Home");
  for (let count = 0; count < 250; count += 1) {
    const current = await slider.evaluate(node => Number(node.getAttribute("aria-valuenow") ?? node.value));
    if (current >= value) { assert.equal(current, value); return; }
    await slider.press("ArrowRight");
  }
  throw new Error(`Cannot set slider ${name} to ${value}`);
}

export async function readHandoff(page) {
  return page.evaluate(() => ({ persistent: localStorage.getItem("bbf.handoff"),
    entries: JSON.parse(sessionStorage.getItem("bbf.handoff") ?? "{}").entries ?? [] }));
}

export async function inspectPage(page) {
  await page.evaluate(() => document.fonts.ready);
  const axe = await new AxeBuilder({ page }).analyze();
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth > innerWidth);
  return { overflow, violations: axe.violations.map(({ id, impact, nodes }) => ({ id, impact,
    targets: nodes.map(node => ({ target: node.target, summary: node.failureSummary })) })) };
}

export const heightLabel = /^(?:lengte|height|body height|lichaamslengte)$|je lengte|your height/i;
export const inseamLabel = /binnenbeen|inseam/i;
