import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright";
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../../..");

const routes = [
  "saddle-height",
  "frame-size",
  "crank-length",
  "saddle-width",
  "bike-fit",
  "gearing",
  "power-speed",
  "climb-planner",
  "ftp-wkg",
  "fuel-hydration",
].map((s) => ["/nl/calculators/" + s, s]);
routes.push(
  ["/en/tire-pressure-calculator", "tire-pressure"],
  ["/nl/bandenspanning-calculator", "bandenspanning"],
  ["/nl/design-system", "design-system"],
);
(async () => {
  const browser = await chromium.launch({ headless: true });
  const results = [];
  for (const [route, name] of routes.filter(
    ([route]) => !process.env.VISUAL_FILTER || route.includes(process.env.VISUAL_FILTER),
  ))
    for (const theme of ["light", "dark"])
      for (const width of [1440, 390]) {
        const ctx = await browser.newContext({
          viewport: { width, height: 1000 },
          colorScheme: theme,
          reducedMotion: "reduce",
        });
        await ctx.addInitScript((t) => localStorage.setItem("theme", t), theme);
        await ctx.route("https://**/*", (r) => r.abort());
        const page = await ctx.newPage();
        const errors = [];
        page.on("pageerror", (e) => errors.push(e.message));
        const row = { route, name, theme, width, errors };
        try {
          const res = await page.goto("http://localhost:3000" + route, { waitUntil: "load", timeout: 90000 });
          await page.evaluate(() => document.fonts.ready);
          await page.waitForTimeout(300);
          for (const label of ["Alleen essentieel", "Essential only"]) {
            const b = page.getByRole("button", { name: label, exact: true });
            if (await b.isVisible()) await b.click();
          }
          await page.addStyleTag({ content: "nextjs-portal {display:none!important}" });
          row.status = res.status();
          row.dom = await page.evaluate(() => ({
            dark: document.documentElement.classList.contains("dark"),
            width: document.documentElement.scrollWidth,
            h1: document.querySelector("h1")?.textContent,
          }));
          row.contrast = await page.evaluate(() => {
            const canvas = document.createElement("canvas");
            canvas.width = canvas.height = 1;
            const ctx = canvas.getContext("2d");
            const rgba = (color) => {
              ctx.clearRect(0, 0, 1, 1);
              ctx.fillStyle = color;
              ctx.fillRect(0, 0, 1, 1);
              return Array.from(ctx.getImageData(0, 0, 1, 1).data).map((x, i) => (i === 3 ? x / 255 : x));
            };
            const lum = (rgb) => {
              const c = rgb
                .slice(0, 3)
                .map((x) => x / 255)
                .map((x) => (x <= 0.04045 ? x / 12.92 : ((x + 0.055) / 1.055) ** 2.4));
              return c[0] * 0.2126 + c[1] * 0.7152 + c[2] * 0.0722;
            };
            const blend = (a, b) =>
              a
                .slice(0, 3)
                .map((x, i) => x * a[3] + b[i] * (1 - a[3]))
                .concat(1);
            const suspects = [];
            let checked = 0;
            for (const e of document.querySelectorAll("main *")) {
              if (
                !(e instanceof HTMLElement) ||
                !e.getClientRects().length ||
                e.closest('[disabled],[aria-disabled="true"]')
              )
                continue;
              const text = Array.from(e.childNodes)
                .filter((n) => n.nodeType === 3)
                .map((n) => n.textContent.trim())
                .join(" ");
              if (!text || !e.getBoundingClientRect().width || e.classList.contains("sr-only")) continue;
              const chain = [];
              let a = e;
              let skip = false;
              while (a) {
                const st = getComputedStyle(a);
                if (+st.opacity < 1 || st.visibility !== "visible") skip = true;
                chain.push(rgba(st.backgroundColor));
                a = a.parentElement;
              }
              if (skip) continue;
              const bg = chain.reverse().reduce((b, c) => blend(c, b), [255, 255, 255, 1]);
              const st = getComputedStyle(e);
              const fg = blend(rgba(st.color), bg);
              const ratio = (Math.max(lum(fg), lum(bg)) + 0.05) / (Math.min(lum(fg), lum(bg)) + 0.05);
              const large =
                parseFloat(st.fontSize) >= 24 || (+st.fontWeight >= 700 && parseFloat(st.fontSize) >= 18.66);
              checked++;
              if (ratio < (large ? 3 : 4.5) - 0.02)
                suspects.push({ text: text.slice(0, 100), ratio, class: e.className });
            }
            return { checked, suspects };
          });
          row.ok =
            row.status === 200 &&
            row.dom.dark === (theme === "dark") &&
            row.dom.width <= width &&
            !errors.length;
          await page.screenshot({
            path:
              root +
              "/plans/redesign-canvas/code-renders/20-dark-" +
              name +
              "-" +
              theme +
              "-" +
              width +
              ".png",
            fullPage: true,
          });
          const input = page.locator("main input:not([disabled]),main button:not([disabled])").first();
          if (await input.count()) {
            await page.keyboard.press("Tab");
            await input.focus();
            row.focus = await input.evaluate((e) => ({
              outline: getComputedStyle(e).outline,
              shadow: getComputedStyle(e).boxShadow,
            }));
          }
        } catch (e) {
          row.error = String(e);
          row.ok = false;
        }
        results.push(row);
        console.log(JSON.stringify(row));
        await ctx.close();
      }
  await browser.close();
  const auditPath = root + "/plans/redesign-canvas/audit/22-public-browser.json";
  if (process.env.VISUAL_FILTER && fs.existsSync(auditPath)) {
    const previous = JSON.parse(fs.readFileSync(auditPath, "utf8")).results;
    results.push(
      ...previous.filter(
        (old) =>
          !results.some(
            (row) => row.route === old.route && row.theme === old.theme && row.width === old.width,
          ),
      ),
    );
  }
  fs.writeFileSync(
    auditPath,
    JSON.stringify({ cases: results.length, failures: results.filter((r) => !r.ok), results }, null, 2),
  );
  if (results.some((r) => !r.ok)) process.exitCode = 1;
})();
