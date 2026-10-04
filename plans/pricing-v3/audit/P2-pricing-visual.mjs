import { build } from "esbuild";
import { readFile, mkdir, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { chromium } from "playwright";
import assert from "node:assert/strict";

const root = process.cwd();
const output = resolve(root, "plans/pricing-v3/renders/pricing");
const runtime = `import React from "react";
export const getRequestLocale = async () => window.pricingLocale;
export const TrackMarketingEventOnView = () => null;
export const TrackedCtaLink = ({href,children,className}) => <a href={href} className={className}>{children}</a>;
export const JsonLd = () => null;
export default function Link({href,children,...props}) { return <a href={href} {...props}>{children}</a>; }`;
const result = await build({
  absWorkingDir: root,
  stdin: { contents: 'import React from "react"; import {createRoot} from "react-dom/client"; import Page from "./src/app/(public)/pricing/page.tsx"; createRoot(document.getElementById("root")).render(await Page());', resolveDir: root, loader: "tsx" },
  bundle: true, write: false, outdir: "pricing-visual-memory", format: "esm", platform: "browser", jsx: "automatic",
  define: { "process.env.NODE_ENV": '"production"' },
  plugins: [{ name: "pricing-fixture", setup(builder) {
    builder.onResolve({ filter: /^(next\/link|@\/i18n\/request|@\/components\/analytics\/(MarketingEventTracker|TrackedCtaLink)|@\/components\/seo\/JsonLd)$/ }, () => ({ path: "pricing-runtime", namespace: "fixture" }));
    builder.onLoad({ filter: /.*/, namespace: "fixture" }, () => ({ contents: runtime, loader: "jsx", resolveDir: root }));
  } }],
});
const script = result.outputFiles.find((file) => file.path.endsWith(".js")).text;
const styles = result.outputFiles.find((file) => file.path.endsWith(".css")).text;
const globals = await readFile(resolve(root, "src/app/globals.css"), "utf8");
const tokens = [...globals.matchAll(/--bbf-[\w-]+:\s*[^;]+;/g)].map((match) => match[0]).join("\n");
const fonts = await Promise.all([
  ["PricingBody", "figtree-latin.woff2"], ["PricingDisplay", "bricolage-grotesque-latin.woff2"], ["PricingMono", "dm-mono-latin.woff2"],
].map(async ([family, file]) => `@font-face {font-family:${family};src:url(data:font/woff2;base64,${(await readFile(resolve(root, "public/brand/report/fonts", file))).toString("base64")}) format('woff2');font-weight:100 900;}`));
await mkdir(output, { recursive: true });
const browser = await chromium.launch({ headless: true });
const measurements = [];
try {
  for (const locale of ["nl", "en"]) {
    for (const width of [1440, 390]) {
      const page = await browser.newPage({ viewport: { width, height: 1000 }, deviceScaleFactor: 1 });
      await page.setContent(`<html lang="${locale}"><head><style>${fonts.join("\n")} :root {${tokens} --font-body:PricingBody;--font-display:PricingDisplay;--font-mono:PricingMono;--primary-soft:var(--bbf-petrol-zacht);} *{box-sizing:border-box} body,h1,h2,p,dl,dd{margin:0} ${styles}</style></head><body><div id="root"></div></body></html>`);
      await page.evaluate((value) => { window.pricingLocale = value; }, locale);
      await page.addScriptTag({ type: "module", content: script });
      await page.waitForSelector('[data-product="annual_personal"]');
      await page.evaluate(() => document.fonts.ready);
      const geometry = await page.evaluate(() => ({
        pageWidth: document.documentElement.scrollWidth,
        cards: [...document.querySelectorAll("[data-product]")].map((card) => {
          const rect = card.getBoundingClientRect();
          return { id: card.dataset.product, x: rect.x, y: rect.y, width: rect.width, height: rect.height };
        }),
        ctas: [...document.querySelectorAll("article a")].map((link) => ({ href: link.getAttribute("href"), height: link.getBoundingClientRect().height })),
      }));
      assert.equal(geometry.pageWidth, width, "No page-level horizontal overflow");
      const [annual, single, personal] = geometry.cards;
      if (width === 1440) {
        assert(single.x < annual.x && annual.x < personal.x, "Annual centered on desktop");
        assert(annual.height > single.height && annual.height > personal.height, "Annual tallest");
      } else {
        assert(annual.y < single.y && single.y < personal.y, "Annual first on mobile");
      }
      assert(geometry.ctas.every((cta) => cta.height >= 44), "CTA target size");
      await page.screenshot({ path: resolve(output, `${locale}-${width}.png`), fullPage: true });
      measurements.push({ locale, width, ...geometry });
      await page.close();
    }
  }
} finally {
  await browser.close();
}
await writeFile(resolve(output, "measurements.json"), JSON.stringify(measurements, null, 2));
console.log(JSON.stringify(measurements, null, 2));
