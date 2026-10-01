import { mkdir, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { chromium } from "playwright";
import AxeBuilder from "@axe-core/playwright";
import { prepareProduction } from "../final-sweep/production.mjs";
import { prepareAccountFixtures } from "../final-sweep/account-fixture.mjs";
import { checkPage } from "../final-sweep/checks.mjs";

const outputDir = resolve("plans/redesign-canvas/code-renders/41a-autosave");
await mkdir(outputDir, { recursive: true });
const production = await prepareProduction({ outputDir, port: 4341 });
let accounts;
let browser;
const results = [];
try {
  accounts = await prepareAccountFixtures({ root: production.snapshot, origin: production.origin, fetch: production.fetch });
  browser = await chromium.launch({ headless: true });
  for (const route of ["gearing", "saddle-selector", "settings"]) {
    for (const width of [1440, 390]) {
      for (const theme of ["light", "dark"]) {
        for (const fixture of ["saving", "save-error"]) {
          const context = await browser.newContext({ viewport: { width, height: 1000 }, reducedMotion: "reduce" });
          await context.addInitScript((value) => localStorage.setItem("theme", value), theme);
          const page = await context.newPage();
          const errors = [];
          page.on("pageerror", (error) => errors.push({ type: "pageerror", message: error.message }));
          const query = `?fixture=${fixture}${route === "gearing" ? "&bikeId=bike1" : ""}`;
          await page.goto(`${accounts.origin}/nl/${route}${query}`, { waitUntil: "networkidle" });
          const field = route === "settings"
            ? page.getByRole("textbox", { name: "Weergavenaam" })
            : page.getByRole("slider", { name: route === "gearing" ? "Rijdergewicht" : "Zitbeenbreedte" });
          if (route === "settings") await field.fill("Sanne gewijzigd");
          else { await field.focus(); await page.keyboard.press("ArrowRight"); }
          if (route === "settings") await field.blur();
          const status = page.getByRole("status").filter({ hasText: fixture === "saving" ? "Opslaan…" : "Niet opgeslagen" });
          await status.first().waitFor();
          await status.first().scrollIntoViewIfNeeded();
          const stem = `${route}-nl-${width}-${theme}`;
          await page.screenshot({ path: resolve(outputDir, `${stem}-${fixture}.png`), fullPage: true });
          const axe = await new AxeBuilder({ page }).analyze();
          const checks = await checkPage(page, {
            locale: "nl", viewportWidth: width, publicPage: false, errors, axeResults: axe,
          });
          results.push({ route, width, theme, fixture, checks });
          if (fixture === "saving") {
            await page.getByRole("status").filter({ hasText: "Opgeslagen" }).first().waitFor();
            await page.screenshot({ path: resolve(outputDir, `${stem}-saved.png`), fullPage: true });
            if (route !== "settings") {
              const value = await field.getAttribute("aria-valuenow");
              await page.reload({ waitUntil: "networkidle" });
              const restored = await field.getAttribute("aria-valuenow");
              if (value !== restored) throw new Error(`${route}: saved value did not survive reload`);
            }
          } else {
            await page.getByRole("button", { name: "Opnieuw proberen", exact: true }).click();
            await page.getByRole("status").filter({ hasText: "Niet opgeslagen" }).first().waitFor();
          }
          await context.close();
        }
      }
    }
  }
} finally {
  await browser?.close();
  await accounts?.close();
  await production.close();
  await writeFile(resolve("plans/redesign-canvas/audit/41a-browser.json"), JSON.stringify({
    sourceHash: production.sourceHash, buildId: production.buildId, results,
  }, null, 2));
}
const failures = results.filter((row) => Object.values(row.checks).some((check) => check.status === "fail"));
console.log(JSON.stringify({ cases: results.length, failures: failures.length }));
if (failures.length) process.exitCode = 1;
