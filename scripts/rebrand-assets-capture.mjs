import { mkdir, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { chromium } from "playwright";
import { prepareAccountFixtures } from "../tests/visual/final-sweep/account-fixture.mjs";

const origin = process.env.RB_VISUAL_ORIGIN;
if (!origin || !["127.0.0.1", "localhost"].includes(new URL(origin).hostname)) {
  throw new Error("Set RB_VISUAL_ORIGIN to the existing local production server; this script never builds or contacts production.");
}
const output = resolve("plans/rebrand/renders");
await mkdir(output, { recursive: true });
const browser = await chromium.launch({ headless: true });
const assetContext = await browser.newContext({ ignoreHTTPSErrors: true });
const previewFetch = async (input) => {
  const response = await assetContext.request.get(String(input));
  return new Response(await response.body(), { status: response.status(), headers: response.headers() });
};
let accounts;
const results = [];
try {
  accounts = await prepareAccountFixtures({ root: process.cwd(), origin, fetch: previewFetch });
  for (const locale of ["nl", "en"]) {
    for (const width of [1440, 390]) {
      for (const route of ["home", "login", "guide", "dashboard", ...(process.env.RB_INCLUDE_CALCULATOR ? ["calculator"] : [])]) {
        const context = await browser.newContext({
          locale: locale === "nl" ? "nl-NL" : "en-GB", ignoreHTTPSErrors: true,
          viewport: { width, height: width === 390 ? 844 : 1000 }, reducedMotion: "reduce", colorScheme: "light",
        });
        const page = await context.newPage();
        page.setDefaultTimeout(15000);
        const row = { locale, width, route, mode: route === "dashboard" ? "read-only-account-fixture" : "production", errors: [] };
        page.on("pageerror", (error) => row.errors.push(error.message));
        const pathname = {
          home: "", login: "/login", guide: "/guides/saddle-height-guide", dashboard: "/dashboard",
          calculator: "/calculators/saddle-height",
        }[route];
        try {
          console.log(`Capturing ${locale} ${width} ${route}`);
          const response = await page.goto(`${route === "dashboard" ? accounts.origin : origin}/${locale}${pathname}`, { waitUntil: "load", timeout: 30000 });
          row.status = response.status();
          await page.evaluate(() => Promise.race([
            document.fonts.ready,
            new Promise((_, reject) => setTimeout(() => reject(new Error("Font readiness timed out")), 10000)),
          ]));
          await page.locator('img[alt="BikeFitBoost"]:visible').first().waitFor({ state: "visible" });
          const consent = page.getByRole("button", { name: locale === "nl" ? "Alleen essentieel" : "Essential only", exact: true });
          if (await consent.isVisible()) await consent.click();
          await page.locator('img[alt="BikeFitBoost"]:visible').evaluateAll((images) =>
            Promise.race([Promise.all(images.map((image) => image.decode().catch(() => {}))),
              new Promise((_, reject) => setTimeout(() => reject(new Error("Logo readiness timed out")), 10000))]));
          row.logos = await page.locator('img[alt="BikeFitBoost"]').evaluateAll((images) => images.map((image) => ({
            src: image.getAttribute("src"), width: image.getBoundingClientRect().width,
            height: image.getBoundingClientRect().height, loaded: image.complete && image.naturalWidth > 0,
          })));
          row.oldCopy = /bestbikefit4u/i.test(await page.locator("body").innerText()
            .then((value) => value.replace(/[\w.+-]+@(?:[\w.-]+\.)?bestbikefit4u\.eu/gi, "")));
          row.horizontalOverflow = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth + 1);
          const base = `RB-${locale}-${width}-${route}`;
          await page.screenshot({ path: resolve(output, `${base}.png`), fullPage: true, animations: "disabled" });
          if (route === "home") {
            for (const name of ["header", "footer"]) {
              const landmark = page.locator(name).first();
              await landmark.scrollIntoViewIfNeeded();
              await landmark.screenshot({ path: resolve(output, `${base}-${name}.png`), animations: "disabled" });
            }
          }
          if (route === "dashboard" && width === 390) {
            await page.getByRole("button", { name: locale === "nl" ? "Dashboardmenu openen" : "Open dashboard menu" }).click();
            await page.getByRole("dialog").waitFor({ state: "visible" });
            await page.screenshot({ path: resolve(output, `${base}-menu.png`), animations: "disabled" });
          }
        } catch (error) {
          row.errors.push(error.message);
        }
        results.push(row);
        await context.close();
      }
    }
  }
} finally {
  await accounts?.close();
  await assetContext.close();
  await browser.close();
}
const report = {
  origin, limitations: ["Dashboard uses actual components and compiled production styles with read-only mocked auth/Convex; not backend persistence.", "Screenshots cover initial states, plus the mobile dashboard menu."], results,
};
await writeFile(resolve("plans/rebrand/audit/B1-render-checks.json"), JSON.stringify(report, null, 2) + "\n");
console.log(JSON.stringify(report, null, 2));
if (results.some((row) => row.status !== 200 || row.errors.length || row.oldCopy || row.horizontalOverflow || row.logos?.some((logo) => !logo.loaded))) {
  process.exitCode = 1;
}
