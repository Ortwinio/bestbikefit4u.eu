import { chromium } from "playwright";
import { inspectTheme } from "./inspect.mjs";
process.env.VISUAL_PREFIX = "b-dark-";
import { mkdir, writeFile } from "node:fs/promises";
import { resolve } from "node:path";

const output = resolve("plans/redesign-canvas/code-renders");
const origin = process.env.VISUAL_DEV_ORIGIN || "http://localhost:3000";
await mkdir(output, { recursive: true });
const browser = await chromium.launch({ headless: true });
const results = [];
try {
  for (const theme of ["light", "dark"]) {
    for (const route of ["about", "faq", "contact", "case-study"]) {
      for (const width of [1440, 390]) {
        const page = await browser.newPage({ viewport: { width, height: 1000 }, colorScheme: theme });
        const errors = [];
        page.on("pageerror", (error) => errors.push(error.message));
        await page.addInitScript((value) => localStorage.setItem("theme", value), theme);
        await page.route("https://**/*", (request) => request.abort());
        const response = await page.goto(`${origin}/nl/${route}`, { waitUntil: "load", timeout: 90000 });
        await page.waitForFunction(
          (value) => document.documentElement.classList.contains("dark") === (value === "dark"), theme,
        );
        await page.evaluate(() => document.fonts.ready);
        await page.waitForTimeout(500);
        const consent = page.getByRole("button", { name: "Alleen essentieel", exact: true });
        if (await consent.isVisible()) {
          await consent.click();
          await consent.waitFor({ state: "hidden" });
        }
        await page.evaluate(async () => {
          for (const picture of document.images) picture.loading = "eager";
          await Promise.all([...document.images].map((picture) => picture.decode().catch(() => {})));
        });
        const name = `b-dark-${theme}-${route.replaceAll("/", "-")}-${width}`;
        await inspectTheme(page, output, name);
        await page.screenshot({
          path: resolve(output, name + ".png"), fullPage: true,
          style: "nextjs-portal { visibility: hidden; }",
        });
        if (width === 390) await page.screenshot({
          path: resolve(output, name + "-viewport.png"), style: "nextjs-portal { visibility: hidden; }",
        });
        const metrics = await page.evaluate(() => {
          const main = document.querySelector("main");
          const surface = getComputedStyle(main.firstElementChild);
          const heading = getComputedStyle(main.querySelector("h1"));
          return {
            overflow: document.documentElement.scrollWidth > innerWidth,
            surface: surface.backgroundColor,
            text: surface.color,
            heading: heading.color,
            backgroundToken: surface.getPropertyValue("--color-background"),
            cardToken: surface.getPropertyValue("--color-card"),
          };
        });
        const result = { name, status: response.status(), ...metrics, errors };
        results.push(result);
        console.log(JSON.stringify(result));
        await page.close();
        if (response.status() !== 200 || metrics.overflow || errors.length || !metrics.backgroundToken.trim()) {
          throw new Error("Theme validation failed: " + name);
        }
      }
    }
  }
} finally {
  await browser.close();
}
await writeFile(resolve(output, "b-dark-public-results.json"), JSON.stringify(results, null, 2) + "\n");
