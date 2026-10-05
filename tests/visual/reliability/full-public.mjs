import assert from "node:assert/strict";
import { mkdir, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { resolve } from "node:path";
import { chromium } from "playwright";
import { calculatorPath, publicCalculators, reuseTargets } from "./full-routes.mjs";
import { heightLabel, inseamLabel, inspectPage, newPublicContext, readHandoff, setSlider } from "./full-runtime.mjs";

const origin = process.argv[2];
assert(["127.0.0.1", "localhost", "[::1]"].includes(new URL(origin).hostname), "Local server only");
const output = fileURLToPath(new URL("../../../plans/reliability/renders/", import.meta.url));
await mkdir(output, { recursive: true });
const results = [];
const browser = await chromium.launch();
const marker = /Uit je eerdere invoer|From your earlier input/i;
const dismissName = /Nee, bedankt|No, thanks/i;

async function capture(fixture, details) {
  const metrics = await inspectPage(fixture.page);
  const screenshot = `F3-${details.locale}-${details.width}-${details.state}.png`;
  await fixture.page.screenshot({ path: resolve(output, screenshot), fullPage: true, animations: "disabled" });
  const result = { ...details, screenshot, metrics, errors: [...fixture.errors], offlineErrors: [...fixture.offlineErrors] };
  results.push(result);
  return result;
}

async function scenario(locale, width, state, run, options = {}) {
  const fixture = await newPublicContext(browser, { origin, locale, width, ...options });
  try { await run(fixture); }
  catch (error) {
    results.push({ locale, width, state, error: String(error), errors: fixture.errors, offlineErrors: fixture.offlineErrors });
    await fixture.page.screenshot({ path: resolve(output, `F3-${locale}-${width}-${state}-failure.png`), fullPage: true }).catch(() => {});
  } finally { await fixture.context.close(); }
}

async function enterMeasurements(page, locale) {
  await page.goto(`${origin}/${locale}/calculators/saddle-height`, { waitUntil: "networkidle" });
  await setSlider(page, heightLabel, 190);
  const dismiss = page.getByRole("button", { name: dismissName });
  if (await dismiss.isVisible()) await dismiss.click();
  await setSlider(page, inseamLabel, 89);
  const stored = await readHandoff(page);
  assert.equal(stored.persistent, null);
  assert(stored.entries.some(entry => entry.field === "heightCm" && entry.value === 190));
  assert(stored.entries.some(entry => entry.field === "inseamCm" && entry.value === 89 && entry.method === "measured"));
}

async function triggerExit(page) {
  await page.evaluate(() => document.dispatchEvent(new MouseEvent("mouseout", { clientY: -1, relatedTarget: null, bubbles: true })));
}

try {
  for (const locale of ["nl", "en"]) for (const width of [1440, 390]) {
    for (const calculator of publicCalculators) {
      const state = `public-${calculator.key}`;
      await scenario(locale, width, state, async fixture => {
        const { page } = fixture;
        const response = await page.goto(`${origin}${calculatorPath(calculator, locale)}`, { waitUntil: "networkidle" });
        assert.equal(response.status(), 200);
        await page.getByRole("heading", { level: 1 }).first().waitFor();
        if (calculator.template) {
          const template = page.locator(`[data-reliability-calculator="${calculator.key}"]`);
          await template.waitFor();
          assert((await template.locator("[data-reliability-step]").count()) <= 2);
          assert.equal(await template.locator("[data-reliability-next-step]").count(), 1);
          assert.equal(await template.getByRole("slider", { name: /flexibility|lenigheid|core/i }).count(), 0);
        }
        const store = await readHandoff(page);
        assert.equal(store.persistent, null);
        assert.equal(store.entries.length, 0, "Default/example values must never be persisted");
        await capture(fixture, { locale, width, state });
      });
    }
    await scenario(locale, width, "cross-calculator", async fixture => {
      await enterMeasurements(fixture.page, locale);
      for (const key of reuseTargets) {
        const calculator = publicCalculators.find(item => item.key === key);
        await fixture.page.goto(`${origin}${calculatorPath(calculator, locale)}`, { waitUntil: "networkidle" });
        await fixture.page.getByText(marker, { exact: true }).first().waitFor();
        for (const [name, expected] of [[heightLabel, 190], [inseamLabel, 89]]) {
          const slider = fixture.page.getByRole("slider", { name }).first();
          assert.equal(await slider.evaluate(node => Number(node.getAttribute("aria-valuenow") ?? node.value)), expected,
            `${key} must reuse ${name}`);
        }
        assert.equal((await readHandoff(fixture.page)).persistent, null);
        await capture(fixture, { locale, width, state: `reuse-${key}` });
      }
    });
    await scenario(locale, width, "new-session-empty", async fixture => {
      await fixture.page.goto(`${origin}/${locale}/calculators/frame-size`, { waitUntil: "networkidle" });
      const stored = await readHandoff(fixture.page);
      assert.equal(stored.entries.length, 0);
      assert.equal(stored.persistent, null);
      assert.equal(await fixture.page.getByText(marker, { exact: true }).count(), 0);
      await capture(fixture, { locale, width, state: "new-session-empty" });
    });
    await scenario(locale, width, "legacy-storage-cleaned", async fixture => {
      await fixture.page.goto(`${origin}/${locale}/calculators/frame-size`, { waitUntil: "networkidle" });
      assert.equal((await readHandoff(fixture.page)).persistent, null, "Persistent legacy store must be removed");
      await capture(fixture, { locale, width, state: "legacy-storage-cleaned" });
    }, { seedLegacy: true });
    await scenario(locale, width, "leave-notice", async fixture => {
      const { page } = fixture;
      await page.goto(`${origin}/${locale}/calculators/saddle-height`, { waitUntil: "networkidle" });
      assert.equal(await page.getByRole("dialog").count(), 0, "No exit notice on load");
      assert.equal(await page.locator('[data-slot="leave-data-notice"]').count(), 0);
      await setSlider(page, heightLabel, 190);
      if (width === 1440) {
        assert.equal(await page.getByRole("dialog").count(), 0, "Typing does not trigger desktop exit intent");
        await triggerExit(page);
        const dialog = page.getByRole("dialog", { name: /Bewaar je gegevens|Save your details/i });
        await dialog.waitFor();
        await page.waitForFunction(() => document.querySelector('[role="dialog"]')?.contains(document.activeElement));
        for (let count = 0; count < 6; count += 1) {
          await page.keyboard.press("Tab");
          await page.waitForFunction(() => document.querySelector('[role="dialog"]')?.contains(document.activeElement));
        }
        await capture(fixture, { locale, width, state: "leave-notice" });
        await page.keyboard.press("Escape");
        await dialog.waitFor({ state: "hidden" });
        await triggerExit(page);
        assert.equal(await page.getByRole("dialog").count(), 0, "Exit intent only once per session");
      } else {
        const notice = page.locator('[data-slot="leave-data-notice"]');
        await notice.waitFor();
        await capture(fixture, { locale, width, state: "leave-notice" });
        await notice.getByRole("button", { name: dismissName }).click();
        await notice.waitFor({ state: "hidden" });
        await setSlider(page, heightLabel, 191);
        assert.equal(await page.locator('[data-slot="leave-data-notice"]').count(), 0, "Dismissal persists in this session");
      }
      await page.goto(`${origin}/${locale}/login`, { waitUntil: "networkidle" });
      await triggerExit(page);
      assert.equal(await page.getByRole("dialog").count(), 0);
      assert.equal(await page.locator('[data-slot="leave-data-notice"]').count(), 0);
    });
  }
} finally {
  await browser.close();
  await writeFile(resolve(output, "F3-public.json"), JSON.stringify({
    scope: "Real offline production public pages, session-only journeys and leave controls. External network blocked, Vercel script stubs, disabled loopback Convex diagnostics separately recorded. Signed-in persistence/signup/backend merging are NOT covered by this browser suite.", results }, null, 2));
}
const failures = results.filter(result => result.error || result.errors.length || result.metrics?.overflow
  || result.metrics?.violations.some(violation => ["serious", "critical"].includes(violation.impact)));
console.log(JSON.stringify({ scenarios: results.length, failures, output }, null, 2));
if (failures.length || results.length !== 68) process.exitCode = 1;
