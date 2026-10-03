import { readFile, writeFile } from "node:fs/promises";
import assert from "node:assert/strict";
import { chromium } from "playwright";
import ts from "typescript";

const source = await readFile(new URL("../../../src/lib/analytics/calculatorBaseline.ts", import.meta.url), "utf8")
;
const javascript = ts.transpileModule(source, {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
}).outputText;
const browser = await chromium.launch({ headless: true });
const page = await browser.newPage();
const results = [];
try {
  await page.setContent(`<main><div data-slot="configurator-inputs">
    <div data-slot="slider"><div data-slot="slider-control" style="width:300px;height:44px;background:#ddd">
      <span data-slot="slider-track">Track</span><div role="slider" tabindex="0" aria-valuenow="80"
      aria-valuemin="50" aria-valuemax="100">Slider</div></div></div>
    <button role="radio" aria-checked="false">Measured</button><input aria-label="Weight" type="number" value="80">
    </div><div data-slot="configurator-results"><section data-slot="result-hero">Result</section></div></main>`);
  await page.addScriptTag({ content: `var exports = {}; ${javascript}; window.baseline = exports;` });
  await page.evaluate(() => {
    window.calls = [];
    window.trusted = [];
    const slider = document.querySelector('[role="slider"]');
    slider.addEventListener("keydown", (event) => {
      window.trusted.push(event.isTrusted);
      if (event.key === "ArrowRight") slider.setAttribute("aria-valuenow", String(Number(slider.getAttribute("aria-valuenow")) + 1));
    });
    document.querySelector('[data-slot="slider-control"]').addEventListener("pointerdown", (event) => {
      window.trusted.push(event.isTrusted);
      slider.setAttribute("aria-valuenow", "95");
    });
    document.querySelector('[role="radio"]').addEventListener("click", (event) => {
      window.trusted.push(event.isTrusted);
      event.currentTarget.setAttribute("aria-checked", "true");
    });
    document.querySelector("input").addEventListener("input", (event) => window.trusted.push(event.isTrusted));
    window.reset = () => {
      window.stop?.(); window.calls = []; window.trusted = [];
      window.stop = window.baseline.observeCalculatorEdits(() => window.calls.push({ event: "result" }));
    };
    window.reset();
  });
  const settle = () => page.evaluate(() => new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve))));
  await settle();
  assert.equal(await page.evaluate(() => window.calls.length), 0);
  results.push({ check: "untouched defaults", passed: true });
  await page.evaluate(() => {
    document.querySelector('[role="slider"]').setAttribute("aria-valuenow", "82");
    document.querySelector("input").value = "90";
    document.querySelector("input").dispatchEvent(new Event("input", { bubbles: true }));
  });
  await settle();
  assert.equal(await page.evaluate(() => window.calls.length), 0);
  results.push({ check: "hydration and programmatic prefill ignored", passed: true });
  for (const [label, interact] of [
    ["trusted slider keyboard", () => page.getByRole("slider").press("ArrowRight")],
    ["trusted slider track pointer", () => page.locator('[data-slot="slider-track"]').click()],
    ["trusted segmented radio", () => page.getByRole("radio").click()],
    ["trusted native number input", () => page.getByLabel("Weight").fill("88")],
  ]) {
    await page.evaluate(() => window.reset());
    await interact(); await settle();
    const state = await page.evaluate(() => ({ calls: window.calls, trusted: window.trusted }));
    assert.ok(state.calls.length >= 1, `${label} must report a changed input and rendered result`);
    assert.ok(state.trusted.includes(true), `${label} must originate from a browser trusted event`);
    assert.ok(state.calls.every((call) => JSON.stringify(call) === '{"event":"result"}'));
    results.push({ check: label, passed: true, trusted: true });
  }
  await page.evaluate(() => {
    window.reset(); document.querySelector('[data-slot="result-hero"]').remove();
  });
  await page.getByLabel("Weight").fill("89"); await settle();
  assert.equal(await page.evaluate(() => window.calls.length), 0);
  results.push({ check: "invalid or missing result does not count", passed: true });
  await writeFile(new URL("verify-events.json", import.meta.url), `${JSON.stringify({ passed: true, results }, null, 2)}\n`);
  console.log(`${results.length} browser gesture checks passed`);
} finally { await browser.close(); }
