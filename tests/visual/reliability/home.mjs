import assert from "node:assert/strict";
import { calculatePublicSaddleHeight } from "../../../shared/reliability/saddleHeight.ts";

export const homeCases = ["home-default", "home-height", "home-landing", "home-firstvisit"];

export function expectedHomeResult(heightCm) {
  const { result } = calculatePublicSaddleHeight({ heightCm });
  assert(result, "Homepage example must produce an estimate");
  return result;
}

export async function prepareHomeScenario({ page, origin, locale, state, setMeasurement }) {
  await page.goto(`${origin}/${locale}`, { waitUntil: "networkidle" });
  const slider = page.getByRole("slider", { name: /je lengte|your height|body height|^lengte$|^height$/i }).first();
  await slider.waitFor();
  assert.equal(Number(await slider.getAttribute("aria-valuenow")), 175);
  const defaultHeight = ["home-default", "home-firstvisit"].includes(state);
  if (!defaultHeight) await setMeasurement(page, "height", 190);
  await page.evaluate(() => document.fonts.ready);
  const heightCm = defaultHeight ? 175 : 190;
  const result = expectedHomeResult(heightCm);
  const range = page.getByRole("img", { name: /Zadelhoogte.*bereik|Saddle height.*range/i }).first();
  const label = await range.getAttribute("aria-label");
  assert.match(label, new RegExp(`${result.adviceMm}.*${result.lowerMm}.*${result.upperMm}`));
  assert.match(await page.locator("main").innerText(), new RegExp(`±\\s*${result.halfWidthMm}\\s*mm`));
  const cta = page.getByRole("link", { name: /Verfijn je zadelhoogte|Refine your saddle height/i });
  assert.match(await cta.getAttribute("href"), new RegExp(`^/${locale}/calculators/saddle-height(?:[?#]|$)`));
  await page.evaluate(() => window.scrollTo(0, 0));
  const firstScreen = await Promise.all([slider, range, cta].map(locator => locator.evaluate(node => {
    const bounds = node.getBoundingClientRect();
    return { top: bounds.top, bottom: bounds.bottom, height: bounds.height, viewport: innerHeight };
  })));
  assert(firstScreen.every(bounds => bounds.top >= 0 && bounds.height > 0 && bounds.bottom <= bounds.viewport),
    `Homepage widget must be above fold: ${JSON.stringify(firstScreen)}`);
  const layoutShifts = await page.evaluate(() => window.__reliabilityLayoutShifts ?? []);
  let firstVisit;
  if (state === "home-firstvisit") {
    const consent = page.getByRole("heading", { name: /Cookievoorkeuren|Cookie preferences/i });
    await consent.waitFor();
    const banner = await consent.evaluate(node => {
      const bounds = node.parentElement.getBoundingClientRect();
      return { top: bounds.top, left: bounds.left, right: bounds.right, bottom: bounds.bottom };
    });
    const hero = cta.locator("xpath=ancestor::section[1]");
    const targets = await hero.locator("h1, a").evaluateAll(nodes => nodes.map(node => {
      const bounds = node.getBoundingClientRect();
      return { text: node.textContent, top: bounds.top, left: bounds.left, right: bounds.right,
        bottom: bounds.bottom, height: bounds.height, viewport: innerHeight };
    }));
    firstVisit = { banner, targets };
    assert(targets.length >= 4, "Expected hero headline and three primary/secondary/refinement CTAs");
    for (const target of targets) {
      assert(target.height > 0 && target.top >= 0 && target.bottom <= target.viewport,
        `First-visit target outside viewport: ${JSON.stringify(target)}`);
      const overlaps = target.left < banner.right && target.right > banner.left
        && target.top < banner.bottom && target.bottom > banner.top;
      assert(!overlaps, `Cookie banner overlaps hero target: ${JSON.stringify({ target, banner })}`);
    }
  }
  if (state === "home-landing") {
    await cta.click();
    await page.waitForURL(url => url.pathname === `/${locale}/calculators/saddle-height`);
    await page.locator('[data-advice-mode="full"]').waitFor();
    const incomingHeight = page.getByRole("slider", { name: /je lengte|your height|body height|^lengte$|^height$/i }).first();
    assert.equal(Number(await incomingHeight.getAttribute("aria-valuenow")), 190);
    const inseam = page.getByRole("slider", { name: /binnenbeen|inseam/i }).first();
    await page.waitForFunction(() => document.activeElement?.matches('[role="slider"], input[type="range"]'));
    assert(await inseam.evaluate(node => node === document.activeElement), "Inseam slider must receive focus after the real CTA click");
  }
  return { heightCm, expected: result, firstScreen, firstVisit, layoutShifts,
    layoutShiftTotal: layoutShifts.reduce((total, entry) => total + entry.value, 0) };
}
