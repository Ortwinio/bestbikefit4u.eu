import assert from "node:assert/strict";
import { mkdir, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";
import { chromium } from "playwright";

export async function checkContact(page, { locale, width, output, phase = "after" }) {
  const name = locale === "nl"
    ? "Bekijk de meetgids voor lichaamsmaten"
    : "Read the body measurement guide";
  const link = page.getByRole("link", { name, exact: true });
  await link.waitFor();
  await page.evaluate(() => document.fonts.ready);
  await page.evaluate(() => new Promise((done) => requestAnimationFrame(() => requestAnimationFrame(done))));
  assert.equal(await link.getAttribute("href"), `/${locale}/measurement-guide`);
  const prefix = resolve(output, `contact-${locale}-${width}-${phase}`);
  await page.screenshot({ path: `${prefix}-full.png`, fullPage: true });
  await link.scrollIntoViewIfNeeded();
  await page.keyboard.press("Tab");
  await link.focus();
  const metrics = await link.evaluate((anchor) => {
    const bounds = anchor.getBoundingClientRect();
    const style = getComputedStyle(anchor);
    const card = anchor.closest("section").getBoundingClientRect();
    const neighbors = [...anchor.closest("section").querySelectorAll("a, button")]
      .filter((node) => node !== anchor)
      .map((node) => {
        const rect = node.getBoundingClientRect();
        return {
          name: node.textContent.trim(),
          gap: Math.max(rect.left - bounds.right, bounds.left - rect.right, rect.top - bounds.bottom, bounds.top - rect.bottom),
        };
      });
    const points = [
      [bounds.left + 2, bounds.top + 2],
      [bounds.right - 2, bounds.top + 2],
      [bounds.left + 2, bounds.bottom - 2],
      [bounds.right - 2, bounds.bottom - 2],
    ];
    return {
      tag: anchor.tagName, width: bounds.width, height: bounds.height,
      focused: document.activeElement === anchor,
      focusVisible: anchor.matches(":focus-visible"),
      outline: { style: style.outlineStyle, width: style.outlineWidth, color: style.outlineColor },
      insideCard: bounds.left >= card.left && bounds.right <= card.right && bounds.top >= card.top && bounds.bottom <= card.bottom,
      hitCorners: points.every(([horizontal, vertical]) => anchor.contains(document.elementFromPoint(horizontal, vertical))),
      overflow: document.documentElement.scrollWidth > innerWidth,
      neighbors,
      mailto: [...document.querySelectorAll('a[href^="mailto:"]')].map((node) => node.getAttribute("href")),
    };
  });
  await page.screenshot({ path: `${prefix}-focus.png` });
  await writeFile(`${prefix}.json`, JSON.stringify({ locale, width, phase, metrics }, null, 2) + "\n");
  assert.equal(metrics.tag, "A");
  if (phase === "after") {
    assert.ok(metrics.height >= 44 && metrics.width >= 44, JSON.stringify(metrics));
    assert.ok(metrics.hitCorners, "Anchor corners must be actual clickable pixels");
  }
  assert.ok(metrics.focused && metrics.focusVisible);
  assert.equal(metrics.outline.style, "solid");
  assert.ok(parseFloat(metrics.outline.width) >= 3);
  assert.ok(metrics.insideCard && !metrics.overflow);
  assert.ok(metrics.neighbors.every((neighbor) => neighbor.gap >= 8));
  assert.ok(metrics.mailto.filter((href) => href === "mailto:support@bestbikefit4u.eu").length >= 2);
  return { locale, width, phase, metrics };
}

async function main() {
  const origin = new URL(process.argv[2]);
  assert.ok(["127.0.0.1", "localhost", "[::1]"].includes(origin.hostname), "A parent-approved loopback preview URL is required");
  assert.ok(["http:", "https:"].includes(origin.protocol));
  const phase = process.argv[3] || "after";
  assert.ok(["before", "after"].includes(phase));
  const output = resolve("plans/rebrand/renders/RB2/contact");
  await mkdir(output, { recursive: true });
  const browser = await chromium.launch({ headless: true });
  const results = [];
  try {
    for (const locale of ["nl", "en"]) {
      for (const width of [1440, 390]) {
        const page = await browser.newPage({ viewport: { width, height: width === 390 ? 844 : 1000 }, ignoreHTTPSErrors: true });
        await page.route("**/*", (route) => {
          const target = new URL(route.request().url());
          return target.origin === origin.origin ? route.continue() : route.abort();
        });
        try {
          await page.goto(new URL(`/${locale}/contact`, origin).href, { waitUntil: "networkidle" });
          const consent = page.getByRole("button", { name: locale === "nl" ? "Alleen essentieel" : "Essential only", exact: true });
          if (await consent.isVisible()) await consent.click();
          results.push(await checkContact(page, { locale, width, output, phase }));
        } finally {
          await page.close();
        }
      }
    }
  } finally {
    await browser.close();
  }
  await writeFile(resolve(output, `${phase}-results.json`), JSON.stringify(results, null, 2) + "\n");
  console.log(JSON.stringify(results));
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) await main();
