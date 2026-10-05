import assert from "node:assert/strict";
import { mkdir, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { resolve } from "node:path";
import { chromium } from "playwright";

const origin = process.argv[2];
assert(["127.0.0.1", "localhost", "[::1]"].includes(new URL(origin).hostname), "Local server only");
const output = fileURLToPath(new URL("../../../plans/reliability/renders/", import.meta.url));
await mkdir(output, { recursive: true });
const browser = await chromium.launch();
const results = [];
try {
  for (const locale of ["nl", "en"]) for (const width of [1440, 390]) {
    const context = await browser.newContext({ viewport: { width, height: width === 390 ? 844 : 1000 }, ignoreHTTPSErrors: true });
    await context.route("**/*", route => new URL(route.request().url()).origin === origin ? route.continue() : route.abort());
    const page = await context.newPage();
    await page.goto(`${origin}/${locale}`, { waitUntil: "networkidle" });
    await page.evaluate(() => document.fonts.ready);
    const heading = page.getByRole("heading", { level: 1 });
    const sourceHeadline = await heading.innerText();
    await heading.evaluate(node => { node.textContent = "A good bikefit boosts your ride"; });
    const consent = page.getByRole("heading", { name: /Cookievoorkeuren|Cookie preferences/i });
    await consent.waitFor();
    const banner = await consent.evaluate(node => {
      const bounds = node.parentElement.getBoundingClientRect();
      return { top: bounds.top, left: bounds.left, right: bounds.right, bottom: bounds.bottom };
    });
    const targets = await heading.locator("xpath=ancestor::section[1]").locator("h1,a").evaluateAll(nodes => nodes.map(node => {
      const bounds = node.getBoundingClientRect();
      return { tag: node.tagName, text: node.textContent, top: bounds.top, left: bounds.left, right: bounds.right,
        bottom: bounds.bottom, height: bounds.height, viewport: innerHeight,
        lines: node.tagName === "H1" ? bounds.height / parseFloat(getComputedStyle(node).lineHeight) : undefined };
    }));
    const checks = targets.map(target => ({ ...target,
      aboveFold: target.top >= 0 && target.bottom <= target.viewport,
      overlapped: target.left < banner.right && target.right > banner.left && target.top < banner.bottom && target.bottom > banner.top }));
    const screenshot = `Q5-headline-DOM-fixture-${locale}-${width}.png`;
    await page.screenshot({ path: resolve(output, screenshot), animations: "disabled" });
    results.push({ locale, width, sourceHeadline, fixtureHeadline: "A good bikefit boosts your ride", banner, checks, screenshot });
    await context.close();
  }
} finally { await browser.close(); }
await writeFile(resolve(output, "Q5-headline-DOM-fixture.json"), JSON.stringify({
  scope: "Supplementary DOM text-only headline fixture on real production CSS; NOT the currently shipped headline and NOT source edits.", results }, null, 2));
console.log(JSON.stringify({ fixtures: results.length, results }, null, 2));
