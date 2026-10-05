import { mkdir, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { resolve } from "node:path";
import { chromium, request } from "playwright";
import AxeBuilder from "@axe-core/playwright";
import { prepareReliabilityFixtures } from "./full-fixture-server.mjs";

export const accountScenarios = [
  "saddle-one", "saddle-three", "saddle-spread", "knee-20", "knee-31", "knee-40",
  "knee-empty", "knee-locked", "knee-missing", "dashboard-measured", "dashboard-warning", "dashboard-missing",
];

export async function runReliabilityFixtureSweep(origin) {
  const root = fileURLToPath(new URL("../../../", import.meta.url));
  const output = resolve(root, "plans/reliability/renders");
  await mkdir(output, { recursive: true });
  const api = await request.newContext({ ignoreHTTPSErrors: true });
  const browser = await chromium.launch({ headless: true });
  let fixture;
  const results = [];
  try {
    fixture = await prepareReliabilityFixtures({ origin, fetch: async url => {
      const response = await api.get(String(url));
      return { ok: response.ok(), status: response.status(), text: () => response.text() };
    } });
    for (const locale of ["nl", "en"]) for (const width of [1440, 390]) {
      for (const theme of ["light", "dark"]) for (const scenario of accountScenarios) {
        const errors = [];
        const context = await browser.newContext({ viewport: { width, height: width === 390 ? 844 : 1000 },
          locale, reducedMotion: "reduce", colorScheme: theme });
        const page = await context.newPage();
        page.on("pageerror", error => errors.push(error.message));
        page.on("console", message => { if (message.type() === "error") errors.push(message.text()); });
        await page.route("**/*", route => new URL(route.request().url()).origin === fixture.origin
          ? route.continue() : route.abort());
        const result = { locale, width, theme, scenario, errors };
        try {
          await page.goto(`${fixture.origin}/?${new URLSearchParams({ locale, theme, scenario })}`);
          await page.locator("h1").waitFor();
          await page.evaluate(() => document.fonts.ready);
          result.overflow = await page.evaluate(() => document.documentElement.scrollWidth > innerWidth + 1);
          const axe = await new AxeBuilder({ page }).analyze();
          result.violations = axe.violations.map(({ id, impact, nodes }) => ({ id, impact, nodes: nodes.map(node => node.target) }));
          result.serious = result.violations.filter(item => ["serious", "critical"].includes(item.impact));
          await page.screenshot({ path: resolve(output, `F3-account-${locale}-${width}-${theme}-${scenario}.png`), fullPage: true });
          result.pass = !result.overflow && !result.serious.length && !errors.length;
        } catch (error) { errors.push(String(error)); result.pass = false; }
        results.push(result);
        console.log(`${result.pass ? "PASS" : "FAIL"} ${locale} ${width} ${theme} ${scenario}`);
        await context.close();
      }
    }
  } finally {
    await browser.close();
    await api.dispose();
    await fixture?.close();
    await writeFile(resolve(output, "F3-account-fixtures.json"), JSON.stringify({
      mode: "Real presentation components with explicit offline data; no production authentication or mutations",
      results,
    }, null, 2));
  }
  return results;
}

if (process.argv[1] && fileURLToPath(import.meta.url) === resolve(process.argv[1])) {
  const results = await runReliabilityFixtureSweep(process.argv[2]);
  if (!results.length || results.some(result => !result.pass)) process.exitCode = 1;
}
