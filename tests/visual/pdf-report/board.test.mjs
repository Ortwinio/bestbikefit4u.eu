import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { chromium } from "playwright";
import { renderBoard } from "./board.mjs";

test("parser-based extraction renders all six PDF boards", async () => {
  const browser = await chromium.launch({ headless: true });
  try {
    const page = await browser.newPage();
    for (let number = 1; number <= 6; number += 1) {
      const html = await readFile(`plans/redesign-canvas/canvas/FitRapport${number}.dc.html`, "utf8");
      const result = await renderBoard(page, html);
      assert.equal(result.unresolved, false);
      assert.ok((await page.locator("body").innerText()).trim().length > 100);
    }
  } finally {
    await browser.close();
  }
});
