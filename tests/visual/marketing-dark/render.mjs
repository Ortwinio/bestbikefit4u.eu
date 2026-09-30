import { chromium } from "playwright";
import fs from "node:fs";
import path from "node:path";

const output = path.resolve("plans/redesign-canvas/code-renders");
const base = process.env.RENDER_BASE_URL || "http://localhost:3000";
const routes = [
  ["home", "/nl"],
  ["pricing", "/nl/pricing"],
  ["how-it-works", "/nl/how-it-works"],
  ["measurement-guide", "/nl/measurement-guide"],
  ["fit-pass", "/nl/fit-pass"],
  ["pain", "/nl/pain"],
  ...["knee-pain", "lower-back-pain", "neck-pain", "hand-numbness", "saddle-discomfort"]
    .map((slug) => [slug, `/nl/pain/${slug}-cycling`]),
];

function inspect() {
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = 1;
  const context = canvas.getContext("2d", { willReadFrequently: true });
  const rgba = (color) => {
    context.clearRect(0, 0, 1, 1);
    context.fillStyle = color;
    context.fillRect(0, 0, 1, 1);
    return [...context.getImageData(0, 0, 1, 1).data];
  };
  const luminance = (channels) => {
    const linear = channels.slice(0, 3).map((value) => {
      const normalized = value / 255;
      return normalized <= 0.04045 ? normalized / 12.92 : ((normalized + 0.055) / 1.055) ** 2.4;
    });
    return linear[0] * 0.2126 + linear[1] * 0.7152 + linear[2] * 0.0722;
  };
  const failures = [];
  let checked = 0;
  for (const element of document.querySelectorAll("header *, main *, footer *, [role='dialog'] *")) {
    const text = [...element.childNodes].filter((node) => node.nodeType === Node.TEXT_NODE)
      .map((node) => node.textContent.trim()).join(" ").trim();
    if (!text || !element.getClientRects().length || element.closest("[aria-hidden='true'], [disabled]")) continue;
    const style = getComputedStyle(element);
    if (style.visibility === "hidden" || Number(style.opacity) === 0) continue;
    let ancestor = element;
    let background;
    while (ancestor) {
      const candidate = rgba(getComputedStyle(ancestor).backgroundColor);
      if (candidate[3] === 255) { background = candidate; break; }
      ancestor = ancestor.parentElement;
    }
    if (!background) continue;
    const foreground = rgba(style.color);
    const levels = [luminance(foreground), luminance(background)].sort((first, second) => second - first);
    const ratio = (levels[0] + 0.05) / (levels[1] + 0.05);
    const large = parseFloat(style.fontSize) >= 24 ||
      (parseFloat(style.fontSize) >= 18.66 && Number(style.fontWeight) >= 700);
    checked += 1;
    if (ratio < (large ? 3 : 4.5)) failures.push({
      text: text.slice(0, 100), ratio: Number(ratio.toFixed(2)),
      className: element.getAttribute("class"), color: style.color, background,
    });
  }
  return {
    dark: document.documentElement.classList.contains("dark"),
    overflow: document.documentElement.scrollWidth > innerWidth,
    header: getComputedStyle(document.querySelector("header")).backgroundColor,
    logo: [...document.querySelectorAll("header img")]
      .find((image) => image.getClientRects().length)?.getAttribute("src"),
    menuLogo: [...document.querySelectorAll("[role='dialog'] img")]
      .find((image) => image.getClientRects().length)?.getAttribute("src"),
    brokenImages: [...document.images].filter((image) => image.getClientRects().length &&
      (!image.complete || !image.naturalWidth))
      .map((image) => image.src),
    checked, failures,
  };
}

(async () => {
  const browser = await chromium.launch({ headless: true });
  const results = [];
  try {
    for (const theme of ["light", "dark"]) {
      for (const width of [1440, 390]) {
        const context = await browser.newContext({ viewport: { width, height: 1000 }, colorScheme: theme });
        await context.addInitScript((value) => localStorage.setItem("theme", value), theme);
        const page = await context.newPage();
        await page.route("https://**/*", (route) => route.abort());
        for (const [name, route] of routes) {
          const response = await page.goto(base + route, { waitUntil: "load", timeout: 120000 });
          await page.evaluate(() => document.fonts.ready);
          const consent = page.getByRole("button", { name: "Alleen essentieel", exact: true });
          if (name === "home") await consent.waitFor({ state: "visible", timeout: 3000 }).catch(() => {});
          if (await consent.isVisible()) await consent.click();
          await page.evaluate(async () => {
            for (const image of document.images) image.loading = "eager";
            await Promise.all([...document.images].map((image) => image.decode().catch(() => {})));
          });
          const file = `19-dark-${name}-${theme}-${width}.png`;
          await page.screenshot({ path: path.join(output, file), fullPage: true });
          const result = { name, route, theme, width, file, status: response.status(), ...await page.evaluate(inspect) };
          results.push(result);
          console.log(JSON.stringify(result));
          const disclosure = page.locator("main details summary").first();
          if (await disclosure.count()) {
            const wasOpen = await disclosure.evaluate((element) => element.parentElement.open);
            if (!wasOpen) await disclosure.click();
            results.push({ name, theme, width, state: "disclosure-open", ...await page.evaluate(inspect) });
            if (!wasOpen) await disclosure.click();
          }
          const secondary = page.locator("main a[class*='secondary']").last();
          if (await secondary.count()) {
            await secondary.hover();
            results.push({ name, theme, width, state: "secondary-hover", ...await page.evaluate(inspect) });
            await page.mouse.move(0, 0);
          }
          if (width === 390 && name === "how-it-works") {
            await page.getByRole("button", { name: "Open navigatiemenu", exact: true }).click();
            await page.getByRole("dialog").waitFor();
            await page.screenshot({ path: path.join(output, `19-dark-menu-${theme}-${width}.png`) });
            results.push({ name: "menu", theme, width, ...await page.evaluate(inspect) });
            await page.getByRole("button", { name: "Sluit navigatiemenu", exact: true }).click();
          }
        }
        await context.close();
      }
    }
  } finally {
    await browser.close();
  }
  fs.writeFileSync(path.join(output, "19-dark-results.json"), JSON.stringify(results, null, 2) + "\n");
  if (results.some((result) => result.overflow || result.failures.length || result.brokenImages.length ||
    result.dark !== (result.theme === "dark") || (result.status && result.status !== 200) ||
    result.logo !== `/brand/logo/logo-horizontaal${result.theme === "dark" ? "-negatief" : ""}.svg` ||
    (result.menuLogo && result.menuLogo !== result.logo))) {
    process.exitCode = 1;
  }
})().catch((error) => { console.error(error); process.exitCode = 1; });
