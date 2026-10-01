import { mkdir, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { chromium } from "playwright";
import AxeBuilder from "@axe-core/playwright";
import nextEnv from "@next/env";
import { prepareProduction } from "../final-sweep/production.mjs";
import { prepareAccountFixtures } from "../final-sweep/account-fixture.mjs";
import { checkPage } from "../final-sweep/checks.mjs";

const outputDir = resolve("plans/redesign-canvas/code-renders/43a-calculators");
await mkdir(outputDir, { recursive: true });
nextEnv.loadEnvConfig(process.cwd());
const root = process.argv.find((arg) => arg.startsWith("--root="))?.slice(7) ?? process.cwd();
const production = await prepareProduction({ root, outputDir, port: 4343 });
let accounts;
let browser;
const results = [];
try {
  accounts = await prepareAccountFixtures({ root: production.snapshot, origin: production.origin, fetch: production.fetch });
  browser = await chromium.launch({ headless: true });
  for (const tool of ["saddle-height", "frame-size", "crank-length"]) {
    for (const width of [1440, 390]) {
      for (const theme of ["light", "dark"]) {
        const context = await browser.newContext({
          viewport: { width, height: 1000 }, reducedMotion: "reduce", ignoreHTTPSErrors: true,
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
  await writeFile(resolve("plans/redesign-canvas/audit/43a-browser.json"), JSON.stringify({
    sourceRoot: root, sourceHash: production.sourceHash, buildId: production.buildId, results,
  }, null, 2));
}
const failures = results.filter((row) => Object.values(row.checks).some((check) => check.status === "fail"));
console.log(JSON.stringify({ cases: results.length, failures: failures.length }));
if (failures.length) process.exitCode = 1;
