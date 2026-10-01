import { mkdir, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { chromium } from "playwright";
import AxeBuilder from "@axe-core/playwright";
import { prepareProduction } from "../final-sweep/production.mjs";
import { prepareAccountFixtures } from "../final-sweep/account-fixture.mjs";
import { checkPage } from "../final-sweep/checks.mjs";

const outputDir = resolve("plans/redesign-canvas/code-renders/41c-autosave");
await mkdir(outputDir, { recursive: true });
const production = await prepareProduction({ outputDir, port: 4355 });
let accounts;
let browser;
const results = [];
try {
  accounts = await prepareAccountFixtures({
    root: production.snapshot,
    origin: production.origin,
    fetch: production.fetch,
    bikeRuntime: "tests/visual/bike-autosave/runtime.jsx",
  });
  browser = await chromium.launch({ headless: true });
  for (const route of ["bikes/visual-bike", "bikes/visual-bike/edit"]) {
    for (const width of [1440, 390]) {
      for (const theme of ["light", "dark"]) {
        for (const fixture of ["saving", "save-error"]) {
          const context = await browser.newContext({
            viewport: { width, height: 1000 },
            reducedMotion: "reduce",
          });
          await context.addInitScript((value) => localStorage.setItem("theme", value), theme);
          const page = await context.newPage();
          const errors = [];
          page.on("pageerror", (error) => {
            errors.push({ type: "pageerror", message: error.message });
            console.error("Browser error:", error.message);
          });
          const query = `?fixture=${fixture}`;
          await page.goto(`${accounts.origin}/nl/${route}${query}`, { waitUntil: "networkidle" });
          const field = page.getByRole("textbox", { name: "Fietsnaam", exact: true });
          await field.fill("Fiets gewijzigd").catch(async (error) => {
            console.error((await page.locator("body").innerText()).slice(-12000));
            throw error;
          });
          await field.blur();
          const status = page
            .getByRole("status")
            .filter({ hasText: fixture === "saving" ? "Opslaan…" : "Niet opgeslagen" });
          await status.first().waitFor();
          await status.first().scrollIntoViewIfNeeded();
          const stem = `${route.replaceAll("/", "-")}-nl-${width}-${theme}`;
          await page.screenshot({ path: resolve(outputDir, `${stem}-${fixture}.png`), fullPage: true });
          const axe = await new AxeBuilder({ page }).analyze();
          const checks = await checkPage(page, {
            locale: "nl",
            viewportWidth: width,
            publicPage: false,
            errors,
            axeResults: axe,
          });
          results.push({ route, width, theme, fixture, checks });
          if (fixture === "saving") {
            await page.getByRole("status").filter({ hasText: "Opgeslagen" }).first().waitFor();
            await page.screenshot({ path: resolve(outputDir, `${stem}-saved.png`), fullPage: true });
            await page.reload({ waitUntil: "networkidle" });
            if ((await field.inputValue()) !== "Fiets gewijzigd")
              throw new Error("Bike name did not survive reload");
            const wheel = page.getByRole("textbox", { name: "Naam wielset", exact: true });
            await wheel.fill("Wielen gewijzigd");
            await wheel.blur();
            await page.getByRole("status").filter({ hasText: "Opgeslagen" }).first().waitFor();
            await page.reload({ waitUntil: "networkidle" });
            if ((await wheel.inputValue()) !== "Wielen gewijzigd")
              throw new Error("Wheel name did not survive reload");
            const tire = page.getByRole("textbox", { name: "Naam bandenset", exact: true });
            await tire.fill("Banden gewijzigd");
            await tire.blur();
            await page.getByRole("status").filter({ hasText: "Opgeslagen" }).first().waitFor();
            await page.reload({ waitUntil: "networkidle" });
            if ((await tire.inputValue()) !== "Banden gewijzigd")
              throw new Error("Tire name did not survive reload");
          } else {
            if ((await field.inputValue()) !== "Fiets gewijzigd") throw new Error("Failed draft lost");
            await page.getByRole("button", { name: "Opnieuw proberen", exact: true }).click();
            await page.getByRole("status").filter({ hasText: "Opgeslagen" }).first().waitFor();
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
  await writeFile(
    resolve("plans/redesign-canvas/audit/41c-browser.json"),
    JSON.stringify(
      {
        sourceHash: production.sourceHash,
        buildId: production.buildId,
        results,
      },
      null,
      2,
    ),
  );
}
const failures = results.filter((row) => Object.values(row.checks).some((check) => check.status === "fail"));
console.log(JSON.stringify({ cases: results.length, failures: failures.length }));
if (failures.length) process.exitCode = 1;
