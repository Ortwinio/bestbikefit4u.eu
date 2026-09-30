import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { chromium, type Browser, type Page } from "playwright";

// Opt-in real-browser computed-color regression against the running local frontend.
const origin = process.env.CONFIGURATOR_TEST_ORIGIN;
describe.skipIf(!origin)("calculator local surface contrast", () => {
  let browser: Browser;
  let page: Page;
  beforeAll(async () => {
    expect(["localhost", "127.0.0.1"]).toContain(new URL(origin!).hostname);
    browser = await chromium.launch({ headless: true });
    page = await browser.newPage();
    await page.route("https://**/*", (route) => route.abort());
  });
  afterAll(async () => {
    await browser?.close();
  });

  for (const width of [390, 1440]) {
    for (const dark of [false, true]) {
      it(`shows keyboard focus on shared controls at ${width}px (${dark ? "dark" : "light"})`, async () => {
        await page.setViewportSize({ width, height: 1000 });
        await page.goto(new URL("/nl/design-system", origin).href, { waitUntil: "load" });
        await page.getByRole("slider", { name: "Binnenbeenlengte" }).waitFor();
        const consent = page.getByRole("button", { name: "Alleen essentieel", exact: true });
        if (await consent.isVisible()) await consent.click();
        await page.evaluate((enabled) => {
          document.documentElement.classList.toggle("dark", enabled);
          document.body.tabIndex = -1;
          document.body.focus();
        }, dark);
        const found = new Set<string>();
        for (let tab = 0; tab < 160 && found.size < 3; tab++) {
          await page.keyboard.press("Tab");
          const kind = await page.evaluate(() => {
            const active = document.activeElement;
            if (!active?.closest("main")) return null;
            if (active.matches("input") && active.closest('[data-slot="slider-thumb"]')) return "slider";
            if (active.matches('input:not([type="hidden"]):not([type="radio"]):not([type="checkbox"])')) {
              return "input";
            }
            if (active.matches('button[data-slot="button"]')) return "button";
            return null;
          });
          if (!kind || found.has(kind)) continue;
          const focused = await page.locator(":focus").elementHandle();
          expect(focused, `${kind} reached by Tab`).not.toBeNull();
          await page.waitForTimeout(180);
          const readRing = (element: HTMLElement | SVGElement) => {
            const target = element.closest('[data-slot="slider-thumb"]') ?? element;
            const style = getComputedStyle(target);
            return {
              shadow: style.boxShadow,
              outline: style.outlineStyle,
              width: Number.parseFloat(style.outlineWidth),
              visible: target.getBoundingClientRect().width > 0 && target.getBoundingClientRect().height > 0,
            };
          };
          const ring = await focused!.evaluate(readRing);
          expect(ring.visible, `${kind} focus target visible`).toBe(true);
          const visibleShadow = ring.shadow !== "none" && /[1-9][\d.]*px/.test(ring.shadow);
          expect(visibleShadow || (ring.outline !== "none" && ring.width > 0), `${kind} visible ring`).toBe(true);
          await page.keyboard.press("Tab");
          await page.waitForTimeout(180);
          const blurred = await focused!.evaluate(readRing);
          expect([ring.shadow, ring.outline, ring.width], `${kind} ring responds to keyboard focus`).not.toEqual([
            blurred.shadow,
            blurred.outline,
            blurred.width,
          ]);
          found.add(kind);
          await focused!.dispose();
        }
        expect([...found].sort()).toEqual(["button", "input", "slider"]);
      }, 60_000);
      it.each(["frame-size", "power-speed", "fuel-hydration", "gearing"])(
        `%s retains readable panels and diagrams at ${width}px (${dark ? "dark" : "light"})`,
        async (tool) => {
          await page.setViewportSize({ width, height: 1000 });
          await page.goto(new URL(`/en/calculators/${tool}`, origin).href, { waitUntil: "load" });
          await page.evaluate((enabled) => document.documentElement.classList.toggle("dark", enabled), dark);
          await page.evaluate(() => new Promise(requestAnimationFrame));
          const results = await page.evaluate((route) => {
            const canvas = document.createElement("canvas");
            canvas.width = canvas.height = 1;
            const context = canvas.getContext("2d")!;
            const luminance = (color: string) => {
              context.clearRect(0, 0, 1, 1);
              context.fillStyle = color;
              context.fillRect(0, 0, 1, 1);
              const rgb = [...context.getImageData(0, 0, 1, 1).data].slice(0, 3).map((v) => {
                const channel = v / 255;
                return channel <= 0.04045 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4;
              });
              return rgb[0] * 0.2126 + rgb[1] * 0.7152 + rgb[2] * 0.0722;
            };
            const contrast = (element: Element, foreground: string) => {
              let ancestor: Element | null = element;
              let background = "";
              while (ancestor) {
                background = getComputedStyle(ancestor).backgroundColor;
                if (background !== "rgba(0, 0, 0, 0)" && background !== "transparent") break;
                ancestor = ancestor.parentElement;
              }
              const a = luminance(foreground);
              const b = luminance(background);
              return (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);
            };
            const checks: { name: string; ratio: number; minimum: number }[] = [];
            const add = (
              name: string,
              element: Element,
              property: "stroke" | "fill" | "color",
              minimum: number,
            ) => {
              checks.push({ name, ratio: contrast(element, getComputedStyle(element)[property]), minimum });
            };
            if (route === "frame-size") {
              const paths = document.querySelectorAll("svg[aria-label] path");
              add("ratio progress", paths[1], "stroke", 3);
              add("ratio marker", paths[2], "stroke", 3);
            }
            if (route === "power-speed") {
              const bars = document.querySelectorAll('svg[viewBox="0 0 100 8"] rect');
              add("air resistance", bars[0], "fill", 3);
              add("rolling resistance", bars[1], "fill", 3);
            }
            if (route === "fuel-hydration") {
              const heading = [...document.querySelectorAll("h2")].find((h) =>
                h.parentElement?.className.includes("bbf-wit"),
              )!;
              add("fuel guidance heading", heading, "color", 4.5);
            }
            const cta = document.querySelector('[data-slot="configurator-sticky-result"] a');
            if (cta) add("mobile result action", cta, "color", 4.5);
            return { checks, scrollWidth: document.documentElement.scrollWidth };
          }, tool);
          expect(results.scrollWidth).toBe(width);
          for (const check of results.checks)
            expect(check.ratio, check.name).toBeGreaterThanOrEqual(check.minimum);
        },
        60_000,
      );
    }
  }
});
