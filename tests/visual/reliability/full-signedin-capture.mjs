import assert from "node:assert/strict";
import { mkdir, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { resolve } from "node:path";
import { chromium } from "playwright";
import { publicCalculators } from "./full-routes.mjs";
import { inspectPage } from "./full-runtime.mjs";
import { prepareSignedinFixtures } from "./full-signedin-server.mjs";

const productionOrigin = process.argv[2];
const fixture = await prepareSignedinFixtures({ origin: productionOrigin });
const output = fileURLToPath(new URL("../../../plans/reliability/renders/", import.meta.url));
await mkdir(output, { recursive: true });
const browser = await chromium.launch();
const results = [];
try {
  for (const locale of ["nl", "en"]) for (const width of [1440, 390]) for (const calculator of publicCalculators) {
    const sourceHeading = locale === "nl"
      ? /^Uit je (profiel|vorige berekening|profiel en vorige berekening)$/
      : /^From your (profile|previous calculation|profile and previous calculation)$/;
    const context = await browser.newContext({ viewport: { width, height: width === 390 ? 844 : 1000 },
      locale, reducedMotion: "reduce", hasTouch: width === 390, isMobile: width === 390 });
    await context.route("**/*", route => new URL(route.request().url()).origin === fixture.origin ? route.continue() : route.abort());
    const page = await context.newPage();
    const errors = [];
    page.on("pageerror", error => errors.push(error.message));
    page.on("console", message => { if (message.type() === "error") errors.push(message.text()); });
    const record = { locale, width, calculator: calculator.key, errors };
    try {
      await page.goto(`${fixture.origin}/${locale}/calculators/${calculator.key}?calculator=${calculator.key}`, { waitUntil: "networkidle" });
      await page.waitForFunction(() => window.__profileFixture?.ready);
      await page.getByText(sourceHeading).first().waitFor();
      record.prefillSource = await page.getByText(sourceHeading).first().textContent();
      assert.equal(await page.evaluate(() => window.__profileFixture.saves.length), 0, "Rendering profile defaults must not write");
      record.initialMetrics = await inspectPage(page);
      record.initialScreenshot = `F3-signedin-${locale}-${calculator.key}-${width}.png`;
      await page.screenshot({ path: resolve(output, record.initialScreenshot), fullPage: true, animations: "disabled" });
      const slider = page.getByRole("slider").first();
      const before = await slider.evaluate(node => Number(node.getAttribute("aria-valuenow") ?? node.value));
      await slider.focus();
      await slider.press("ArrowRight");
      await page.waitForFunction(() => window.__profileFixture.saves.length > 0);
      const changed = await slider.evaluate(node => Number(node.getAttribute("aria-valuenow") ?? node.value));
      assert(changed > before, "Real input must change");
      const saved = await page.evaluate(key => key === "ftp-wkg"
        ? window.__profileFixture.saves.findLast(entry => entry.field === "ftpWatts")
        : window.__profileFixture.saves.at(-1), calculator.key);
      assert(saved, "Edited numeric field must be saved");
      assert.equal(saved.calculator, calculator.key, "Saved input must retain the current calculator scope");
      const storedValue = saved.field === "durationMinutes" ? changed * 60 : changed;
      assert.equal(saved.value, storedValue, "Input edit must reach the shared profile save callback in its storage unit");
      await page.evaluate(() => window.__profileFixture.remount());
      await page.getByText(sourceHeading).first().waitFor();
      await page.waitForFunction(expected => {
        const input = document.querySelector('[role="slider"], input[type="range"]');
        return input && Number(input.getAttribute("aria-valuenow") ?? input.value) === expected;
      }, changed);
      assert.equal(await page.evaluate(() => localStorage.getItem("bbf.handoff")), null);
      assert.equal(await page.evaluate(() => sessionStorage.getItem("bbf.handoff")), null);
      await page.evaluate(() => document.dispatchEvent(new MouseEvent("mouseout", { clientY: -1, relatedTarget: null, bubbles: true })));
      assert.equal(await page.locator('[data-slot="leave-data-notice"]').count(), 0);
      assert.equal(await page.getByRole("dialog", { name: /Bewaar je gegevens|Save your details/i }).count(), 0);
      record.saved = { field: saved.field, before, value: changed, method: saved.method, remountRetained: true };
      record.savedMetrics = await inspectPage(page);
      record.savedScreenshot = `F3-signedin-${locale}-${calculator.key}-${width}-saved.png`;
      await page.screenshot({ path: resolve(output, record.savedScreenshot), fullPage: true, animations: "disabled" });
    } catch (error) {
      record.error = String(error);
      await page.screenshot({ path: resolve(output, `F3-signedin-${locale}-${calculator.key}-${width}-failure.png`), fullPage: true }).catch(() => {});
    } finally { results.push(record); await context.close(); }
  }
} finally {
  await browser.close();
  await fixture.close();
  await writeFile(resolve(output, "F3-signedin.json"), JSON.stringify({
    scope: "Actual public calculator forms under authenticated CalculatorDataContext.Provider fixtures, production global CSS/fonts plus bundled CSS modules. Profile reads/saves are explicit in-memory callbacks retained across component remount; no backend/auth/signup persistence claim. Actual LeaveDataNotice receives isAuthenticated=true. No full page chrome, real network/backend mutations or mails.", results }, null, 2));
}
const failures = results.filter(record => record.error || record.errors.length
  || [record.initialMetrics, record.savedMetrics].some(metrics => metrics?.overflow
    || metrics?.violations.some(violation => ["serious", "critical"].includes(violation.impact))));
console.log(JSON.stringify({ scenarios: results.length, failures, output }, null, 2));
if (results.length !== 44 || failures.length) process.exitCode = 1;
