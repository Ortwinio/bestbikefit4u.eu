import { chromium } from "playwright";
import { copyFile, mkdir, writeFile } from "node:fs/promises";
import { resolve } from "node:path";

const origin = process.env.VISUAL_DEV_ORIGIN || "http://localhost:3000";
const output = resolve("plans/redesign-canvas/code-renders");
await mkdir(output, { recursive: true });
const browser = await chromium.launch({ headless: true });
const results = [];
const cases = [
  { route: "about", state: "page" },
  { route: "faq", state: "page" },
  { route: "faq", state: "expanded" },
  { route: "contact", state: "page" },
  { route: "case-study", state: "page" },
  { route: "case-study", state: "filled" },
];

try {
  for (const locale of ["nl", "en"]) {
    for (const entry of cases) {
      for (const width of [1440, 390]) {
        const name = `19-5a-${locale}-${entry.route}-${entry.state}-${width}`;
        const page = await browser.newPage({
          viewport: { width, height: width === 390 ? 844 : 1000 }, colorScheme: "light",
        });
        const errors = [];
        page.on("pageerror", (error) => errors.push(error.message));
        await page.route("https://**/*", (route) => route.abort());
        try {
          const query = entry.route === "case-study" ? "?pain=knee-pain-cycling" : "";
          const response = await page.goto(`${origin}/${locale}/${entry.route}${query}`, {
            waitUntil: "load", timeout: 90000,
          });
          await page.locator("h1").waitFor();
          await page.evaluate(() => document.fonts.ready);
          await page.waitForTimeout(700);
          const consent = page.getByRole("button", {
            name: locale === "nl" ? "Alleen essentieel" : "Essential only", exact: true,
          });
          if (await consent.isVisible()) {
            await consent.click();
            await consent.waitFor({ state: "hidden" });
          }
          if (entry.state === "expanded") {
            for (const summary of await page.locator("main details summary").all()) {
              if (await summary.evaluate((node) => node.parentElement.open)) await summary.click();
            }
            await page.locator("main details summary").first().click();
          }
          if (entry.state === "filled") {
            await page.locator("#case-study-name").fill("Visual test rider");
            await page.locator("#case-study-email").fill("visual@example.invalid");
            await page.locator("#case-study-goal").fill("Longer rides");
            await page.locator("#case-study-summary").fill("Discomfort during longer rides.");
            await page.locator('main input[type="checkbox"]').check();
          }
          await page.evaluate(async () => {
            for (const picture of document.images) picture.loading = "eager";
            await Promise.all([...document.images].map((picture) => picture.decode().catch(() => {})));
          });
          const screenshotOptions = { style: "nextjs-portal { visibility: hidden; }" };
          await page.screenshot({ ...screenshotOptions, path: resolve(output, name + ".png"), fullPage: true });
          if (width === 390) {
            await page.screenshot({ ...screenshotOptions, path: resolve(output, name + "-viewport.png") });
          }
          const metrics = await page.evaluate(() => ({
            overflow: document.documentElement.scrollWidth > innerWidth,
            h1: [...document.querySelectorAll("h1")].map((node) => node.textContent),
            canonical: document.querySelector('link[rel="canonical"]')?.href,
            schemas: [...document.querySelectorAll('script[type="application/ld+json"]')]
              .map((node) => JSON.parse(node.textContent)),
            brokenImages: [...document.images].filter((picture) => !picture.complete || !picture.naturalWidth)
              .map((picture) => picture.src),
            forms: document.querySelectorAll("main form").length,
            mailto: [...document.querySelectorAll('main a[href^="mailto:"]')].map((link) => link.href),
            expanded: document.querySelectorAll("main details[open]").length,
          }));
          const canonical = `https://bikefitboost.com/${locale}/${entry.route}`;
          if (metrics.canonical !== canonical) throw new Error("Canonical changed");
          if (entry.route === "contact" && (metrics.forms || !metrics.mailto.length)) {
            throw new Error("Contact must retain mailto, no form");
          }
          if (entry.state === "expanded" && !metrics.expanded) throw new Error("FAQ did not expand");
          if (response.status() !== 200 || metrics.overflow || metrics.h1.length !== 1) {
            throw new Error("Layout/status failure");
          }
          if (errors.length || metrics.brokenImages.length) throw new Error("Runtime/image failure");
          results.push({ name, ...metrics, errors });
        } catch (error) {
          results.push({ name, error: String(error), errors });
        } finally {
          await page.close();
        }
        console.log(JSON.stringify(results.at(-1)));
      }
    }
  }
  for (const board of ["About", "FAQ", "Contact", "CaseStudy"]) {
    await copyFile(
      resolve(`plans/redesign-canvas/drafts/_renders/${board}.png`),
      resolve(output, `19-5a-${board}-board.png`),
    );
  }
} finally {
  await browser.close();
}
await writeFile(resolve(output, "19-5a-results.json"), JSON.stringify(results, null, 2) + "\n");
const failed = results.filter((result) => result.error);
console.log(JSON.stringify({ cases: results.length, failed: failed.map((result) => result.name) }));
if (failed.length) process.exitCode = 1;
