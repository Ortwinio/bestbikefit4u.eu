import assert from "node:assert/strict";
import { mkdir, readFile, readdir, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { resolve } from "node:path";
import { chromium } from "playwright";
import { calculatorPath, publicCalculators } from "./full-routes.mjs";
import { inspectPage, newPublicContext, readHandoff } from "./full-runtime.mjs";
import { prepareReliabilityFixtures } from "./full-fixture-server.mjs";
import { accountScenarios } from "./full-fixture-sweep.mjs";

const origin = process.argv[2];
assert(["127.0.0.1", "localhost", "[::1]"].includes(new URL(origin).hostname));
const output = fileURLToPath(new URL("../../../plans/reliability/renders/", import.meta.url));
await mkdir(output, { recursive: true });
const browser = await chromium.launch();
const results = [];
const mediaDirectory = fileURLToPath(new URL("../../../.next/static/media/", import.meta.url));
const media = new Map(await Promise.all((await readdir(mediaDirectory)).map(async name =>
  [name, await readFile(resolve(mediaDirectory, name))])));
let account;
async function capture(url, locale, width, state, theme = "light", accountMode = false) {
  const fixture = await newPublicContext(browser, { origin: accountMode ? account.origin : origin, locale, width });
  try {
    const { page } = fixture;
    await page.route("**/_next/static/media/**", route => {
      const name = new URL(route.request().url()).pathname.split("/").at(-1);
      const body = media.get(name);
      return body ? route.fulfill({ status: 200, body,
        contentType: name.endsWith(".woff2") ? "font/woff2" : "application/octet-stream" }) : route.fallback();
    });
    const response = await page.goto(url, { waitUntil: "networkidle", timeout: 120000 });
    assert.equal(response.status(), 200);
    await page.locator("h1").first().waitFor();
    if (!accountMode) assert.equal((await readHandoff(page)).entries.length, 0);
    const metrics = await inspectPage(page);
    const screenshot = `F2-${locale}-${width}-${theme}-${state}.png`;
    await page.screenshot({ path: resolve(output, screenshot), fullPage: true, animations: "disabled" });
    const serious = metrics.violations.filter(item => ["serious", "critical"].includes(item.impact));
    const pass = !metrics.overflow && !serious.length && !fixture.errors.length;
    results.push({ locale, width, state, theme, metrics, errors: fixture.errors, offlineErrors: fixture.offlineErrors,
      screenshot, pass });
    console.log(`${pass ? "PASS" : "FAIL"} ${locale} ${width} ${theme} ${state}`);
  } catch (error) {
    results.push({ locale, width, state, theme, error: String(error), errors: fixture.errors, pass: false });
    console.log(`FAIL ${locale} ${width} ${theme} ${state}: ${error}`);
  } finally { await fixture.context.close(); }
}
try {
  if (!process.argv.includes("--account-only")) {
    for (const locale of ["nl", "en"]) for (const width of [1440, 390]) for (const calculator of publicCalculators) {
      await capture(`${origin}${calculatorPath(calculator, locale)}`, locale, width, calculator.key);
    }
  }
  account = await prepareReliabilityFixtures({ origin });
  for (const locale of ["nl", "en"]) for (const width of [1440, 390]) {
    for (const theme of ["light", "dark"]) for (const scenario of accountScenarios) {
      await capture(`${account.origin}/?${new URLSearchParams({ locale, theme, scenario })}`,
        locale, width, scenario, theme, true);
    }
  }
} finally {
  await browser.close();
  await account?.close();
  await writeFile(resolve(output, process.argv.includes("--account-only") ? "F2-account-review.json" : "F2-ui-review.json"), JSON.stringify({
    mode: "Existing local candidate build and current offline presentation fixtures; not the final F3 production-build gate",
    results,
  }, null, 2));
}
if (!results.length || results.some(result => !result.pass)) process.exitCode = 1;
