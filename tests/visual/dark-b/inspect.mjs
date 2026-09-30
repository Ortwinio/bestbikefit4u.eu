import { writeFile } from "node:fs/promises";
import { resolve } from "node:path";

export async function inspectTheme(page, output, name) {
  if (!process.env.VISUAL_PREFIX?.startsWith("b-dark-")) return;
  const metrics = await page.evaluate(() => {
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
    const lowContrast = [];
    for (const node of document.querySelectorAll("main *,aside *,nav *")) {
      if (![...node.childNodes].some((child) => child.nodeType === 3 && child.textContent.trim())) continue;
      const rect = node.getBoundingClientRect();
      const style = getComputedStyle(node);
      if (!rect.width || !rect.height || node.closest("[disabled],[aria-disabled=true]") || style.opacity === "0") continue;
      const back = background(node);
      const fore = blend(color(style.color), back);
      const first = luminance(fore);
      const second = luminance(back);
      const ratio = (Math.max(first, second) + 0.05) / (Math.min(first, second) + 0.05);
      const large = parseFloat(style.fontSize) >= 24 ||
        (parseFloat(style.fontSize) >= 18.66 && Number(style.fontWeight) >= 700);
      if (ratio + 0.02 < (large ? 3 : 4.5)) lowContrast.push({
        tag: node.tagName, text: node.textContent.trim().slice(0, 90), ratio: Number(ratio.toFixed(2)),
        color: style.color, background: back, className: node.getAttribute("class"),
      });
    }
    const svgStrokes = [...document.querySelectorAll("main svg path,main svg circle")].slice(0, 50).map((node) => ({
      stroke: getComputedStyle(node).stroke,
      width: getComputedStyle(node).strokeWidth,
    }));
    return { dark: document.documentElement.classList.contains("dark"), lowContrast, svgStrokes };
  });
  const controls = page.locator("main a:visible,main button:visible,main input:visible,main summary:visible");
  const count = await controls.count();
  metrics.focus = [];
  await page.keyboard.press("Tab");
  for (const index of [...new Set([0, 1, count - 2, count - 1])].filter((index) => index >= 0 && index < count)) {
    const control = controls.nth(index);
    if (!(await control.isEnabled())) continue;
    await control.focus();
    metrics.focus.push(await control.evaluate((node) => {
      const style = getComputedStyle(node);
      return {
        label: (node.textContent || node.getAttribute("aria-label") || node.tagName).trim().slice(0, 80),
        visible: node.matches(":focus-visible"),
        outline: style.outline,
        shadow: style.boxShadow,
        border: style.borderColor,
      };
    }));
  }
  await page.evaluate(() => {
    document.activeElement?.blur();
    window.scrollTo({ left: 0, top: 0, behavior: "instant" });
  });
  await page.waitForTimeout(100);
  await writeFile(resolve(output, name + "-theme.json"), JSON.stringify(metrics, null, 2) + "\n");
  if (metrics.lowContrast.length) throw new Error("Low text contrast: " + name);
}
