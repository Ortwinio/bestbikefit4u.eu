import { mkdir, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { chromium } from "playwright";
import AxeBuilder from "@axe-core/playwright";
import nextEnv from "@next/env";
import { prepareProduction } from "../final-sweep/production.mjs";
import { prepareAccountFixtures } from "../final-sweep/account-fixture.mjs";
import { checkPage } from "../final-sweep/checks.mjs";

const outputDir = resolve("plans/redesign-canvas/code-renders/43d-bike-fit");
await mkdir(outputDir, { recursive: true });
nextEnv.loadEnvConfig(process.cwd());
const root = process.argv.find((arg) => arg.startsWith("--root="))?.slice(7) ?? process.cwd();
const production = await prepareProduction({ root, outputDir, port: 4353 });
let accounts;
let browser;
const results = [];
try {
  accounts = await prepareAccountFixtures({ root: production.snapshot, origin: production.origin, fetch: production.fetch });
  browser = await chromium.launch({ headless: true });
  for (const tool of ["bike-fit"]) {
    for (const width of [1440, 390]) {
      for (const theme of ["light", "dark"]) {
        const context = await browser.newContext({
          viewport: { width, height: 1000 }, reducedMotion: "reduce", ignoreHTTPSErrors: true,
        });
        await context.route("**/__account-fixture/*.css", async (route) => {
          const response = await route.fetch();
          const css = (await response.text()).replace(/url\((["']?)(?:\.\.\/)?media\//g,
            "url($1/_next/static/media/");
          await route.fulfill({ response, body: css });
        });
        await context.addInitScript((value) => localStorage.setItem("theme", value), theme);
        for (const account of [false, true]) {
          const page = await context.newPage();
          const errors = [];
          page.on("pageerror", (error) => errors.push({ type: "pageerror", message: error.message }));
          const route = `/nl/${account ? "tools" : "calculators"}/${tool}`;
          await page.goto(`${account ? accounts.origin : production.origin}${route}`, { waitUntil: "networkidle" });
          await page.getByRole("slider").first().waitFor();
          await page.evaluate(async () => {
            await document.fonts.ready;
            for (const family of ["DM Mono", "Figtree", "Bricolage Grotesque"]) {
              if (!(await document.fonts.load(`500 16px "${family}"`)).length) throw new Error(`Missing font: ${family}`);
            }
          });
          await page.evaluate(async () => {
            for (const image of document.images) image.loading = "eager";
            await Promise.race([
              Promise.all([...document.images].map((image) => image.decode().catch(() => {}))),
              new Promise((done) => setTimeout(done, 6000)),
            ]);
            scrollTo(0, 0);
          });
          const stem = `${tool}-${account ? "account" : "public"}-nl-${width}-${theme}`;
          await page.screenshot({ path: resolve(outputDir, `${stem}.png`), fullPage: true });
          const checks = await checkPage(page, {
            locale: "nl", viewportWidth: width, publicPage: !account, errors,
            axeResults: await new AxeBuilder({ page }).analyze(),
          });
          if (account && width === 390) {
            const sticky = await page.locator("[data-slot=configurator-sticky-result]").boundingBox();
            const tabs = await page.getByRole("navigation", { name: "Accountnavigatie" }).boundingBox();
            if (sticky && tabs && sticky.y + sticky.height > tabs.y + 1) {
              throw new Error(`${tool}: result bar overlaps account navigation`);
            }
            await page.getByRole("button", { name: "Meer", exact: true }).click();
            const dialog = page.getByRole("dialog");
            const calculators = dialog.getByRole("region", { name: "Calculators", exact: true });
            if (await calculators.getByRole("link").count() !== 11) throw new Error("Missing mobile calculator link");
            await page.screenshot({ path: resolve(outputDir, `menu-nl-${width}-${theme}.png`) });
            await page.keyboard.press("Escape");
            await dialog.waitFor({ state: "hidden" });
          }
          if (account) {
            const field = page.getByRole("slider", { name: "Binnenbeenlengte", exact: false }).first();
            await field.focus();
            await page.keyboard.press("ArrowRight");
            await page.getByRole("status").filter({ hasText: "Opgeslagen" }).waitFor();
            const changed = await field.getAttribute("aria-valuenow");
            // A fresh page mounts a fresh authenticated fixture client against the persisted store.
            const revisit = await context.newPage();
            await revisit.goto(`${accounts.origin}${route}`, { waitUntil: "networkidle" });
            const restored = await revisit.getByRole("slider", { name: "Binnenbeenlengte", exact: false })
              .first().getAttribute("aria-valuenow");
            if (restored !== changed) throw new Error(`${tool}: saved value missing on new visit`);
            await revisit.close();
            await page.getByRole("button", { name: "Start fit met deze waarden", exact: true }).click();
            await page.waitForURL("**/nl/fit?calculator=bike-fit");
            await page.getByRole("heading", { name: "Waarden uit je bikefit calculator" }).waitFor();
            if (!await page.getByText(`${Number(changed).toLocaleString("nl")} cm`, { exact: true }).count()) {
              throw new Error("Changed calculator measurement is missing from fit handoff");
            }
            await page.screenshot({ path: resolve(outputDir, `handoff-nl-${width}-${theme}.png`), fullPage: true });
            const handoffChecks = await checkPage(page, {
              locale: "nl", viewportWidth: width, publicPage: false, errors,
              axeResults: await new AxeBuilder({ page }).analyze(),
            });
            results.push({ tool: "fit-handoff", account: true, width, theme, checks: handoffChecks });
            await page.getByRole("button", { name: "Endurance racefiets", exact: true }).click();
            const continued = page.getByRole("button", { name: "Ga door naar vragen", exact: true });
            if (await continued.isDisabled()) throw new Error("Matching bike cannot start calculator fit");
            await continued.click();
            await page.waitForURL("**/questionnaire");
            await page.goto(`${accounts.origin}/nl/dashboard`, { waitUntil: "networkidle" });
            const quickLinks = page.locator("main").getByRole("navigation", { name: "Calculators", exact: true });
            if (await quickLinks.getByRole("link").count() !== 11) throw new Error("Missing dashboard quick link");
            await page.screenshot({ path: resolve(outputDir, `dashboard-nl-${width}-${theme}.png`), fullPage: true });
            results.push({ tool: "dashboard", account: true, width, theme, checks: await checkPage(page, {
              locale: "nl", viewportWidth: width, publicPage: false, errors,
              axeResults: await new AxeBuilder({ page }).analyze(),
            }) });
          }
          results.push({ tool, account, width, theme, checks });
          await page.close();
        }
        await context.close();
      }
    }
  }
} finally {
  await browser?.close();
  await accounts?.close();
  await production.close();
  await writeFile(resolve("plans/redesign-canvas/audit/43d-browser.json"), JSON.stringify({
    sourceRoot: root, sourceHash: production.sourceHash, buildId: production.buildId, results,
  }, null, 2));
}
const failures = results.filter((row) => Object.values(row.checks).some((check) => check.status === "fail"));
console.log(JSON.stringify({ cases: results.length, failures: failures.length }));
if (failures.length) process.exitCode = 1;
