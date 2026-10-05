import assert from "node:assert/strict";
import { mkdir, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { resolve } from "node:path";
import { chromium } from "playwright";
import { inspectPage } from "./full-runtime.mjs";
import { prepareSignedinFixtures } from "./full-signedin-server.mjs";

const fixture = await prepareSignedinFixtures({ origin: process.argv[2], signup: true });
const output = fileURLToPath(new URL("../../../plans/reliability/renders/", import.meta.url));
await mkdir(output, { recursive: true });
const browser = await chromium.launch();
const results = [];
try {
  for (const locale of ["nl", "en"]) for (const width of [1440, 390]) {
    const context = await browser.newContext({ viewport: { width, height: width === 390 ? 844 : 1000 }, locale, reducedMotion: "reduce" });
    await context.route("**/*", route => new URL(route.request().url()).origin === fixture.origin ? route.continue() : route.abort());
    const page = await context.newPage();
    const errors = [];
    page.on("pageerror", error => errors.push(error.message));
    page.on("console", message => { if (message.type() === "error") errors.push(message.text()); });
    const record = { locale, width, errors };
    try {
      await page.goto(`${fixture.origin}/${locale}/welcome`, { waitUntil: "networkidle" });
      await page.getByRole("heading", { level: 1 }).waitFor();
      await page.getByText("190 cm", { exact: true }).waitFor();
      await page.getByText("89 cm", { exact: true }).waitFor();
      assert.deepEqual(await page.evaluate(() => window.__signupFixture.calls), []);
      record.metrics = await inspectPage(page);
      await page.screenshot({ path: resolve(output, `F3-signup-${locale}-${width}-review.png`), fullPage: true });
      await page.getByRole("button", { name: locale === "nl" ? "Bewaar en ga naar mijn dashboard" : "Save and go to my dashboard", exact: true }).click();
      await page.waitForFunction(expected => window.__signupFixture.destination === expected, `/${locale}/dashboard`);
      const state = await page.evaluate(() => ({ ...window.__signupFixture,
        session: sessionStorage.getItem("bbf.handoff"), persistent: localStorage.getItem("bbf.handoff") }));
      assert.equal(state.calls.length, 1);
      assert.equal(state.calls[0].name, "profiles/mutations:importHandoff");
      assert.deepEqual(state.calls[0].args.records.map(({ field, value, method }) => ({ field, value, method })), [
        { field: "heightCm", value: 190, method: "declared" }, { field: "inseamCm", value: 89, method: "measured" },
      ]);
      assert.equal(state.profile.heightCm, 190);
      assert.equal(state.profile.inseamCm, 89);
      assert.equal(state.session, null);
      assert.equal(state.persistent, null);
      record.confirmed = state;
      await page.screenshot({ path: resolve(output, `F3-signup-${locale}-${width}-confirmed.png`), fullPage: true });
    } catch (error) { record.error = String(error); }
    finally { results.push(record); await context.close(); }
  }
} finally {
  await browser.close();
  await fixture.close();
  await writeFile(resolve(output, "F3-signup.json"), JSON.stringify({
    scope: "Actual WelcomeClient with seeded saddle-height session values and explicit already-authenticated query/mutation fixtures. Confirms review→import arguments→in-memory profile→session clearing→dashboard navigation. Does not authenticate, send mail or prove real backend persistence; backend handoff integration tests remain authoritative.", results }, null, 2));
}
const failures = results.filter(record => record.error || record.errors.length || record.metrics?.overflow
  || record.metrics?.violations.some(violation => ["serious", "critical"].includes(violation.impact)));
console.log(JSON.stringify({ scenarios: results.length, failures }, null, 2));
if (results.length !== 4 || failures.length) process.exitCode = 1;
