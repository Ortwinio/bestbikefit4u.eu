import { mkdir, readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { chromium } from "playwright";
import sharp from "sharp";
import { prepareProduction } from "../final-sweep/production.mjs";

const outputDir = resolve("plans/redesign-canvas/code-renders/47");
await mkdir(outputDir, { recursive: true });
const browser = await chromium.launch({ headless: true });
let production;
try {
  const page = await browser.newPage({ viewport: { width: 1200, height: 900 } });
  const records = JSON.parse(await readFile("plans/redesign-canvas/audit/47-optimized.json", "utf8"));
  const selected = records.filter((row) => row.output.endsWith(".webp") ||
    ["guides/media/003--guides--bike-fitting-for-knee-pain-hero.png", "brand/report/bike-dimensions.png",
      "logo/bestbikefit4u-logo.png"].includes(row.output));
  for (const row of selected) {
    const before = await readFile(`plans/redesign-canvas/illustration-sources/originals/${row.original}`);
    const after = await readFile(`public/${row.output}`);
    await page.setContent(`<body style="margin:24px;background:#f5f8f3;font:18px sans-serif">
      <h1>${row.original}</h1><div style="display:flex;gap:24px">
      ${[[before, "image/png", "Before"], [after, row.output.endsWith(".webp") ? "image/webp" : "image/png", "After"]]
        .map(([bytes, type, label]) => `<div style="width:550px"><h2>${label}</h2>
        <img style="width:100%;height:auto" src="data:${type};base64,${bytes.toString("base64")}"></div>`).join("")}
      </div></body>`);
    await page.locator("img").evaluateAll((images) => Promise.all(images.map((image) => image.decode())));
    await page.screenshot({ path: `${outputDir}/${row.output.replaceAll("/", "-")}-comparison.png`, fullPage: true });
  }
  await page.close();
  production = await prepareProduction({ outputDir, port: 4374 });
  const cases = [];
  for (const route of ["/nl", "/nl/guides/crank-length-guide", "/nl/calculators/saddle-height"]) {
    const context = await browser.newContext({ ignoreHTTPSErrors: true, viewport: { width: 1440, height: 1000 } });
    const page = await context.newPage();
    const response = await page.goto(`${production.origin}${route}`, { waitUntil: "networkidle" });
    const meta = await page.evaluate(() => ({
      og: document.querySelector('meta[property="og:image"]')?.content,
      width: document.querySelector('meta[property="og:image:width"]')?.content,
      height: document.querySelector('meta[property="og:image:height"]')?.content,
      alt: document.querySelector('meta[property="og:image:alt"]')?.content,
      twitter: document.querySelector('meta[name="twitter:image"]')?.content,
      imagePreloads: [...document.querySelectorAll('link[rel="preload"][as="image"]')]
        .map((link) => ({ href: link.getAttribute("href"), sizes: link.getAttribute("imagesizes") })),
      images: [...document.images].filter((img) => img.getBoundingClientRect().top < innerHeight)
        .map((img) => ({ src: img.getAttribute("src"), currentSrc: img.currentSrc, sizes: img.sizes, priority: img.fetchPriority,
          loading: img.loading, width: img.getBoundingClientRect().width })),
    }));
    const imagePath = new URL(meta.og).pathname;
    const bytes = await readFile(`public${imagePath}`);
    const dimensions = await sharp(bytes).metadata();
    if (response.status() !== 200 || bytes.length > 200000 || dimensions.width !== 1200
      || dimensions.height !== 630 || meta.width !== "1200" || meta.height !== "630"
      || !meta.alt || new URL(meta.twitter).pathname !== imagePath) {
      throw new Error(`Invalid social image for ${route}`);
    }
    cases.push({ route, status: response.status(), ...meta, imageBytes: bytes.length });
    await page.screenshot({ path: `${outputDir}/${route.replaceAll("/", "-")}.png`, fullPage: true });
    await context.close();
  }
  await writeFile("plans/redesign-canvas/audit/47-browser.json", JSON.stringify({
    sourceHash: production.sourceHash, buildId: production.buildId, comparisons: selected.length, cases,
  }, null, 2)+"\n");
  console.log(JSON.stringify({ comparisons: selected.length, cases: cases.length }));
} finally {
  await browser.close();
  await production?.close();
}
