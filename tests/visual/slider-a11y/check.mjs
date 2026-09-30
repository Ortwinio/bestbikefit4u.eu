import { chromium } from "playwright";
import AxeBuilder from "@axe-core/playwright";
import { writeFile } from "node:fs/promises";

const origin = process.env.SLIDER_TEST_ORIGIN ?? "http://127.0.0.1:4331";
const output = process.env.SLIDER_TEST_OUTPUT ?? "/private/tmp/bbf25c-slider-browser.json";
const browser = await chromium.launch({ headless: true });
const results = [];
try {
  for (const route of ["/nl", "/en", "/nl/calculators/bike-fit", "/en/tire-pressure-calculator"]) {
    for (const width of [1440, 390]) {
      const context = await browser.newContext({ viewport: { width, height: 1000 } });
      const page = await context.newPage();
      await page.route("https://**/*", (request) => request.abort());
      await page.goto(origin + route, { waitUntil: "load" });
      for (const name of ["Alleen essentieel", "Essential only"]) {
        const button = page.getByRole("button", { name, exact: true });
        if (await button.isVisible()) await button.click();
      }
      const sliders = await page.locator('input[type="range"]:not(:disabled)').evaluateAll((inputs) =>
        inputs.map((input) => {
          const thumb = input.closest('[data-slot="slider-thumb"]');
          const rect = input.getBoundingClientRect();
          const thumbRect = thumb.getBoundingClientRect();
          const visual = getComputedStyle(thumb, "::after");
          return {
            label: input.getAttribute("aria-label") ?? input.getAttribute("aria-labelledby"),
            width: rect.width,
            height: rect.height,
            hitWidth: thumbRect.width,
            hitHeight: thumbRect.height,
            visualWidth: parseFloat(visual.width),
            visualHeight: parseFloat(visual.height),
          };
        }),
      );
      const axe = await new AxeBuilder({ page }).withRules(["aria-allowed-attr"]).analyze();
      const first = page.locator('input[type="range"]:not(:disabled)').first();
      await first.focus();
      const before = Number(await first.inputValue());
      await page.keyboard.press("ArrowRight");
      const after = Number(await first.inputValue());
      const thumb = first.locator("xpath=..");
      await thumb.scrollIntoViewIfNeeded();
      const box = await thumb.boundingBox();
      // Start outside the visible 30px circle, inside the real 44px target, and drag.
      await page.mouse.move(box.x + 2, box.y + box.height / 2);
      await page.mouse.down();
      await page.mouse.move(box.x + 65, box.y + box.height / 2, { steps: 8 });
      await page.mouse.up();
      const dragged = Number(await first.inputValue());
      const row = {
        route,
        width,
        sliders,
        violations: axe.violations,
        keyboardChanged: after > before,
        outerHitAreaDrags: dragged > after,
      };
      row.pass =
        sliders.length > 0 &&
        sliders.every(
          (s) =>
            s.width >= 44 &&
            s.height >= 44 &&
            s.hitWidth >= 44 &&
            s.hitHeight >= 44 &&
            s.visualWidth === 30 &&
            s.visualHeight === 30,
        ) &&
        axe.violations.length === 0 &&
        row.keyboardChanged &&
        row.outerHitAreaDrags;
      results.push(row);
      console.log(JSON.stringify(row));
      await context.close();
    }
  }
} finally {
  await browser.close();
}
await writeFile(output, JSON.stringify(results, null, 2));
if (results.some((row) => !row.pass)) process.exitCode = 1;
