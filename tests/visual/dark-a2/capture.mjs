import { chromium } from "playwright";
import { writeFile, mkdir } from "node:fs/promises";
import { resolve } from "node:path";
import { prepareAccountFixtures } from "./fixture.mjs";

const origin = process.env.RENDER_BASE_URL || "http://localhost:3000";
const output = resolve("plans/redesign-canvas/code-renders");
const publicCases = [
  ["why", "/nl/why-bikefit-matters"],
  ["bike-fitting", "/en/bike-fitting"],
  ["bikefitting", "/nl/bikefitting"],
  ["setup", "/nl/fiets-afstellen"],
  ["methods", "/nl/science/bike-fit-methods"],
  ["engine", "/nl/science/calculation-engine"],
  ["stack-reach", "/nl/science/stack-and-reach"],
];
const bikeCases = [
  ["bikes", "/nl/bikes"],
  ["bikes-empty", "/nl/bikes?fixture=empty"],
  ["bikes-loading", "/nl/bikes?fixture=loading"],
  ["new", "/nl/bikes/new"],
  ["manual", "/nl/bikes/new/manual"],
  ["passport", "/nl/bikes/import/passport"],
  ["marktplaats", "/nl/bikes/import/marktplaats"],
  ["compare", "/nl/bikes/compare-fit"],
  ["detail", "/nl/bikes/visual-bike"],
  ["gallery", "/nl/bikes/visual-bike?fixture=gallery"],
  ["detail-missing", "/nl/bikes/visual-bike?fixture=empty"],
  ["detail-loading", "/nl/bikes/visual-bike?fixture=loading"],
  ["edit", "/nl/bikes/visual-bike/edit"],
];

function inspect() {
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = 1;
  const context = canvas.getContext("2d", { willReadFrequently: true });
  const color = (value) => {
    context.clearRect(0, 0, 1, 1);
    context.fillStyle = value;
    context.fillRect(0, 0, 1, 1);
    return [...context.getImageData(0, 0, 1, 1).data].map((channel) => channel / 255);
  };
  const blend = (front, back) => front.slice(0, 3)
    .map((channel, index) => channel * front[3] + back[index] * (1 - front[3])).concat(1);
  const background = (node) => {
    if (!node) return [1, 1, 1, 1];
    const fill = color(getComputedStyle(node).backgroundColor);
    return fill[3] === 1 ? fill : blend(fill, background(node.parentElement));
  };
  const luminance = (channels) => channels.slice(0, 3).map((channel) =>
    channel <= 0.04045 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4
  ).reduce((sum, channel, index) => sum + channel * [0.2126, 0.7152, 0.0722][index], 0);
  const failures = [];
  let checked = 0;
  for (const node of document.querySelectorAll("main *, aside *, nav *, footer *, [role=dialog] *")) {
    const text = [...node.childNodes].filter((child) => child.nodeType === 3)
      .map((child) => child.textContent.trim()).join(" ").trim();
    if (!text || node.closest("[disabled], [aria-disabled=true], [aria-hidden=true], .sr-only")) continue;
    const rect = node.getBoundingClientRect();
    const style = getComputedStyle(node);
    if (!rect.width || !rect.height || style.visibility === "hidden" || style.opacity === "0") continue;
    const back = background(node);
    const fore = blend(color(node.tagName === "text" ? style.fill : style.color), back);
    const first = luminance(fore), second = luminance(back);
    const ratio = (Math.max(first, second) + 0.05) / (Math.min(first, second) + 0.05);
    const large = parseFloat(style.fontSize) >= 24 ||
      (parseFloat(style.fontSize) >= 18.66 && Number(style.fontWeight) >= 700);
    checked += 1;
    if (ratio + 0.02 < (large ? 3 : 4.5)) failures.push({
      text: text.slice(0, 90), ratio: Number(ratio.toFixed(2)), className: node.getAttribute("class"),
      color: style.color, background: back,
    });
  }
  return {
    dark: document.documentElement.classList.contains("dark"),
    overflow: document.documentElement.scrollWidth > innerWidth,
    checked, failures,
    unknownQueries: window.__visualUnknownQueries || [],
    brokenImages: [...document.images].filter((image) => image.getClientRects().length &&
      (!image.complete || !image.naturalWidth)).map((image) => image.src),
  };
}

await mkdir(output, { recursive: true });
const fixtures = await prepareAccountFixtures({ origin });
const browser = await chromium.launch({ headless: true });
const results = [];
try {
  for (const theme of ["light", "dark"]) {
    for (const width of [1440, 390]) {
      const context = await browser.newContext({
        viewport: { width, height: 1000 }, colorScheme: theme, reducedMotion: "reduce",
      });
      await context.addInitScript((value) => localStorage.setItem("theme", value), theme);
      for (const [name, route] of [...publicCases, ...bikeCases]) {
        if (process.env.CASE_FILTER && !name.includes(process.env.CASE_FILTER)) continue;
        const account = bikeCases.some(([key]) => key === name);
        const page = await context.newPage();
        const errors = [];
        page.on("pageerror", (error) => errors.push(error.message));
        await page.route("https://**/*", (request) => request.abort());
        try {
          const response = await page.goto((account ? fixtures.origin : origin) + route,
            { waitUntil: "load", timeout: 120000 });
          if (account) {
            await page.waitForFunction(() => window.__visualReady);
            await page.locator("main").waitFor();
          }
          await page.waitForFunction((value) => document.documentElement.classList.contains("dark") ===
            (value === "dark"), theme);
          await page.evaluate(() => document.fonts.ready);
          await page.waitForTimeout(500);
          const consent = page.getByRole("button", { name: /Alleen essentieel|Essential only/ });
          if (await consent.isVisible()) await consent.click();
          await page.evaluate(async () => {
            for (const image of document.images) image.loading = "eager";
            await Promise.all([...document.images].map((image) => image.decode().catch(() => {})));
          });
          const capture = async (suffix = "") => {
            const file = `24-dark-${name}${suffix}-${theme}-${width}.png`;
            await page.screenshot({ path: resolve(output, file), fullPage: suffix !== "-lightbox",
              style: "nextjs-portal { visibility: hidden; }" });
            const result = { name, route, theme, width, file, accountFixture: account,
              status: response.status(), errors: [...errors], ...await page.evaluate(inspect) };
            results.push(result);
            console.log(JSON.stringify(result));
          };
          await capture();
          if (name === "gallery") {
            await page.getByRole("button", { name: /Open.*galerij|Open.*foto|Open.*photo|Open.*gallery/i }).click();
            await page.getByRole("dialog").waitFor();
            await page.evaluate(async () => {
              await Promise.all([...document.images].map((image) => image.decode().catch(() => {})));
            });
            await capture("-lightbox");
          }
          if (name === "edit") {
            const radios = page.getByRole("radio");
            for (const index of [1, 2, 3]) {
              if (await radios.nth(index).isVisible()) {
                await radios.nth(index).click();
                await capture(`-tab-${index}`);
              }
            }
          }
          if (!account && await page.locator("main details summary").count()) {
            const summary = page.locator("main details summary").first();
            if (!(await summary.evaluate((node) => node.parentElement.open))) await summary.click();
            await capture("-faq");
          }
        } catch (error) {
          results.push({ name, route, theme, width, error: error.message, errors });
          console.error(name, theme, width, error.message);
        } finally {
          await page.close();
        }
      }
      await context.close();
    }
  }
} finally {
  await browser.close();
  await fixtures.close();
}
await writeFile(resolve(output, "24-dark-results.json"), JSON.stringify({
  limitations: fixtures.limitations, results,
}, null, 2) + "\n");
if (results.some((result) => result.error || result.errors.length || result.status !== 200 ||
  result.overflow || result.failures.length || result.unknownQueries.length || result.brokenImages.length ||
  result.dark !== (result.theme === "dark"))) process.exitCode = 1;
