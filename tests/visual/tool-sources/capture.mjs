import { mkdir, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { chromium } from "playwright";
import AxeBuilder from "@axe-core/playwright";
import { prepareProduction } from "../final-sweep/production.mjs";

const label = process.argv[2] || "30";
const outputDir = resolve("plans/redesign-canvas/code-renders");
await mkdir(outputDir, { recursive: true });
const production = await prepareProduction({ outputDir, port: 4351 });
let browser;
const results = [];
try {
  browser = await chromium.launch({ headless: true });
  for (const tool of ["fuel-hydration", "ftp-wkg"]) {
    for (const locale of ["nl", "en"]) {
      for (const theme of ["light", "dark"]) {
        for (const width of [1440, 390]) {
          const context = await browser.newContext({
            viewport: { width, height: width === 390 ? 844 : 1000 },
            locale: locale === "nl" ? "nl-NL" : "en-GB", colorScheme: theme,
            reducedMotion: "reduce", ignoreHTTPSErrors: true,
          });
          try {
            await context.addInitScript((value) => localStorage.setItem("theme", value), theme);
            const page = await context.newPage();
            const errors = [];
            page.on("pageerror", (error) => errors.push(error.message));
            const response = await page.goto(`${production.origin}/${locale}/calculators/${tool}`);
            await page.evaluate(() => document.fonts.ready);
            const consent = page.getByRole("button", { name: /^(Alleen essentieel|Essential only)$/ });
            if (await consent.isVisible()) await consent.click();
            await page.waitForTimeout(500);
            const dom = await page.evaluate(() => ({
              dark: document.documentElement.classList.contains("dark"),
              overflow: document.documentElement.scrollWidth > innerWidth + 1,
            }));
            const axe = await new AxeBuilder({ page }).analyze();
            const violations = axe.violations.filter((item) => ["serious", "critical"].includes(item.impact));
            const name = `${label}-${tool}-${locale}-${theme}-${width}`;
            await page.screenshot({ path: resolve(outputDir, `${name}.png`), fullPage: true });
            const result = page.locator(`#${tool}-result`);
            await result.screenshot({ path: resolve(outputDir, `${name}-result.png`) });
            results.push({ tool, locale, theme, width, status: response.status(), ...dom, errors,
              violations: violations.map(({ id, nodes }) => ({ id, targets: nodes.map((node) => node.target) })) });
            if (label === "30.1") {
              if (tool === "ftp-wkg") {
                await page.getByRole("button", { name: locale === "nl" ? "Vrouwen" : "Women", exact: true }).click();
                if (!(await result.textContent()).includes(locale === "nl" ? "Goed" : "Good")) {
                  throw new Error("Selected FTP rating missing from headline");
                }
              } else {
                const slider = page.getByRole("slider", {
                  name: locale === "nl" ? "Duur van je rit" : "Ride duration",
                });
                await slider.focus();
                await slider.press("Home");
              }
              await result.screenshot({ path: resolve(outputDir, `${name}-alternate-result.png`) });
              if (await page.evaluate(() => document.documentElement.scrollWidth > innerWidth + 1)) {
                throw new Error("Alternate headline state overflows");
              }
            }
            console.log(JSON.stringify(results.at(-1)));
          } finally { await context.close(); }
        }
      }
    }
  }
} finally {
  await browser?.close();
  await production.close();
  await writeFile(resolve(outputDir, `${label}-capture.json`), JSON.stringify({
    production: { sourceHash: production.sourceHash, buildId: production.buildId }, results,
  }, null, 2) + "\n");
}
if (results.length !== 16 || results.some((row) => row.status !== 200 || row.overflow || row.errors.length
  || row.violations.length || row.dark !== (row.theme === "dark"))) process.exitCode = 1;
