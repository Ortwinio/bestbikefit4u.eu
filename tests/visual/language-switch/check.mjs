import assert from "node:assert/strict";
import { mkdir, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { chromium } from "playwright";
import AxeBuilder from "@axe-core/playwright";
import { prepareProduction } from "../final-sweep/production.mjs";

const outputDir = resolve("plans/redesign-canvas/code-renders/25a2-themes");
await mkdir(outputDir, { recursive: true });
const production = await prepareProduction({ outputDir, port: 4337 });
const browser = await chromium.launch({ headless: true });
const results = [];
try {
  for (const theme of ["light", "dark"]) {
    for (const locale of ["nl", "en"]) {
      for (const width of [390, 1440]) {
        for (const route of ["/calculators/bike-fit", "/bandenspanning/racefiets", "/tire-pressure-calculator"]) {
          const context = await browser.newContext({
            viewport: { width, height: 1000 }, colorScheme: theme, reducedMotion: "reduce",
          });
          await context.addInitScript((preference) => localStorage.setItem("theme", preference), theme);
          const page = await context.newPage();
          await page.goto(`${production.origin}/${locale}${route}`, { waitUntil: "load" });
          await page.waitForFunction((dark) => document.documentElement.classList.contains("dark") === dark,
            theme === "dark");
          const selector = 'header a[aria-current="page"].text-primary-foreground';
          const selected = page.locator(selector);
          await selected.waitFor();
          assert.equal(await selected.count(), 1);
          assert.equal((await selected.textContent()).trim(), locale.toUpperCase());
          const colors = await selected.evaluate((anchor) => {
            const style = getComputedStyle(anchor);
            const bounds = anchor.getBoundingClientRect();
            return { foreground: style.color, background: style.backgroundColor,
              hitWidth: bounds.width, hitHeight: bounds.height };
          });
          assert.ok(colors.hitWidth >= 44 && colors.hitHeight >= 44);
          const axe = await new AxeBuilder({ page }).include(selector).withRules(["color-contrast"]).analyze();
          results.push({ theme, locale, width, route, ...colors, violations: axe.violations,
            incomplete: axe.incomplete, passed: axe.passes.some((check) => check.id === "color-contrast") });
          assert.equal(axe.violations.length, 0);
          assert.equal(axe.incomplete.length, 0);
          assert.ok(results.at(-1).passed);
          await context.close();
        }
      }
    }
  }
} finally {
  await writeFile(resolve("plans/redesign-canvas/audit/25-a2-themes.json"),
    JSON.stringify({ sourceHash: production.sourceHash, results }, null, 2) + "\n");
  await browser.close();
  await production.close();
}
console.log(`Selected language contrast: ${results.length} light/dark cases pass.`);
