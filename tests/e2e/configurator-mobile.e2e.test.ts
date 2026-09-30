import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { chromium, type Browser, type Page } from "playwright";

// Opt-in browser regression test against a running local frontend:
// CONFIGURATOR_TEST_ORIGIN=http://localhost:3000 npx vitest run tests/e2e/configurator-mobile.e2e.test.ts
const origin = process.env.CONFIGURATOR_TEST_ORIGIN;
const routes = [
  "/nl/calculators/saddle-height",
  "/nl/calculators/saddle-width",
  "/nl/calculators/bike-fit",
  "/nl/bandenspanning-calculator",
];

describe.skipIf(!origin)("configurator mobile result and feedback", () => {
  let browser: Browser;
  let page: Page;

  beforeAll(async () => {
    const url = new URL(origin!);
    expect(["localhost", "127.0.0.1"]).toContain(url.hostname);
    browser = await chromium.launch({ headless: true });
    page = await browser.newPage({ viewport: { width: 390, height: 844 } });
    await page.route("https://**/*", (route) => route.abort());
  });

  afterAll(async () => {
    await browser?.close();
  });

  it.each(routes)(
    "keeps the result unobstructed on %s",
    async (path) => {
      await page.goto(new URL(path, origin).toString(), { waitUntil: "load" });
      const consent = page.getByRole("button", { name: "Alleen essentieel", exact: true });
      if (await consent.isVisible()) await consent.click();
      const result = page.locator('[data-slot="configurator-sticky-result"]');
      const feedback = page.locator("[data-feedback-launcher]");
      await result.waitFor({ state: "visible" });
      await feedback.waitFor({ state: "attached" });
      for (const width of [390, 768]) {
        await page.setViewportSize({ width, height: 844 });
        await page.evaluate(() => new Promise(requestAnimationFrame));
        expect(await result.isVisible()).toBe(true);
        expect(await feedback.isVisible()).toBe(false);
        const bounds = await result.boundingBox();
        expect(bounds!.y + bounds!.height).toBeLessThanOrEqual(845);
        expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(width);
      }
      await page.setViewportSize({ width: 1440, height: 1000 });
      await page.evaluate(() => new Promise(requestAnimationFrame));
      expect(await result.isVisible()).toBe(false);
      expect(await feedback.isVisible()).toBe(true);
      await page.setViewportSize({ width: 390, height: 844 });
    },
    60_000,
  );

  it("keeps feedback available on mobile pages without a sticky result", async () => {
    await page.goto(new URL("/nl/pricing", origin).toString(), { waitUntil: "load" });
    await page.locator("[data-feedback-launcher]").waitFor({ state: "visible" });
    expect(await page.locator('[data-slot="configurator-sticky-result"]').count()).toBe(0);
  }, 60_000);
});
