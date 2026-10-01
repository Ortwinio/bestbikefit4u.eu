import { mkdir, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { chromium } from "playwright";
import AxeBuilder from "@axe-core/playwright";
import { prepareProduction } from "../final-sweep/production.mjs";
import { prepareAccountFixtures } from "../final-sweep/account-fixture.mjs";
import { checkPage } from "../final-sweep/checks.mjs";

const development = process.env.PROFILE_VISUAL_DEV === "1";
const outputDir = resolve(`plans/redesign-canvas/code-renders/41b-profile-autosave${development ? "-dev" : ""}`);
await mkdir(outputDir, { recursive: true });
const production = development ? {
  snapshot: process.cwd(), origin: "http://localhost:3000", fetch: globalThis.fetch,
  sourceHash: "development-preview", buildId: null, close: async () => {},
} : await prepareProduction({ outputDir, port: 4344 });
let accounts;
let browser;
const results = [];
try {
  accounts = await prepareAccountFixtures({ root: production.snapshot, origin: production.origin, fetch: production.fetch });
  browser = await chromium.launch({ headless: true });
  for (const route of ["profile"]) {
    for (const width of [1440, 390]) {
      for (const theme of ["light", "dark"]) {
        for (const fixture of ["saving", "save-error"]) {
          const context = await browser.newContext({ viewport: { width, height: 1000 }, reducedMotion: "reduce" });
          await context.route("**/__account-fixture/profile.css", async (route) => {
            const response = await route.fetch();
            const css = (await response.text()).replace(/url\((["']?)(?:\.\.\/)?media\//g,
              "url($1/_next/static/media/");
            await route.fulfill({ response, body: css });
          });
          if (development) await context.route("**/_next/static/**", async (route) => {
            const path = new URL(route.request().url()).pathname;
            const response = await production.fetch(new URL(path, production.origin));
            await route.fulfill({ status: response.status,
              contentType: response.headers.get("content-type") ?? "application/octet-stream",
              body: Buffer.from(await response.arrayBuffer()) });
          });
          await context.addInitScript((value) => localStorage.setItem("theme", value), theme);
          const page = await context.newPage();
          const errors = [];
          page.on("pageerror", (error) => errors.push({ type: "pageerror", message: error.message }));
          const query = `?fixture=${fixture}`;
          await page.goto(`${accounts.origin}/nl/${route}${query}`, { waitUntil: "networkidle" });
          await page.evaluate(async () => {
            await document.fonts.ready;
            for (const family of ["DM Mono", "Figtree", "Bricolage Grotesque"]) {
              const fonts = await document.fonts.load(`500 16px "${family}"`);
              if (!fonts.length || fonts.some((font) => font.status !== "loaded")) {
                throw new Error(`Font unavailable: ${family}`);
              }
            }
          });
          const field = page.getByRole("slider", { name: "Lengte", exact: true });
          await field.focus();
          await page.keyboard.press("ArrowRight");
          const status = page.getByRole("status").filter({ hasText: fixture === "saving" ? "Opslaan…" : "Niet opgeslagen" });
          await status.first().waitFor();
          await page.evaluate(() => window.scrollTo(0, 0));
          const stem = `${route}-nl-${width}-${theme}`;
          await page.screenshot({ path: resolve(outputDir, `${stem}-${fixture}.png`), fullPage: true });
          if (fixture === "saving") {
            await page.getByRole("status").filter({ hasText: "Opgeslagen" }).first().waitFor();
            await page.screenshot({ path: resolve(outputDir, `${stem}-saved.png`), fullPage: true });
          } else {
            await page.getByRole("button", { name: "Opnieuw proberen", exact: true }).click();
            await page.getByRole("status").filter({ hasText: "Niet opgeslagen" }).first().waitFor();
          }
          const axe = await new AxeBuilder({ page }).analyze();
          const checks = await checkPage(page, {
            locale: "nl", viewportWidth: width, publicPage: false, errors, axeResults: axe,
          });
          results.push({ route, width, theme, fixture, checks });
          await context.close();
        }
      }
    }
  }
} finally {
  await browser?.close();
  await accounts?.close();
  await production.close();
  await writeFile(resolve(`plans/redesign-canvas/audit/41b-browser${development ? "-dev" : ""}.json`), JSON.stringify({
    sourceHash: production.sourceHash, buildId: production.buildId, results,
  }, null, 2));
}
const failures = results.filter((row) => Object.values(row.checks).some((check) => check.status === "fail"));
console.log(JSON.stringify({ cases: results.length, failures: failures.length }));
if (failures.length) process.exitCode = 1;
