import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import AxeBuilder from "@axe-core/playwright";
import { measureDocument } from "./measure.mjs";

export const stickyBarSelector = 'aside[data-visible][aria-label]';

export function measureStickyBar() {
  const bar = document.querySelector('aside[data-visible][aria-label]');
  const box = node => {
    if (!node) return null;
    const rect = node.getBoundingClientRect();
    return { top: rect.top, bottom: rect.bottom, left: rect.left, right: rect.right,
      width: rect.width, height: rect.height };
  };
  const intersects = (first, second) => Boolean(first && second && first.left < second.right
    && first.right > second.left && first.top < second.bottom && first.bottom > second.top);
  const rendered = node => {
    const style = getComputedStyle(node);
    const rect = node.getBoundingClientRect();
    return style.display !== "none" && style.visibility !== "hidden" && Number(style.opacity || 1) > 0
      && rect.width > 0 && rect.height > 0;
  };
  const rect = box(bar);
  const visible = Boolean(bar && bar.dataset.visible === "true" && rendered(bar)
    && rect.top < innerHeight && rect.bottom > 0);
  const covered = nodes => [...nodes].filter(rendered).flatMap(node => {
    const target = box(node);
    if (!visible || !intersects(rect, target)) return [];
    const left = Math.max(0, target.left), right = Math.min(innerWidth, target.right);
    const top = Math.max(0, target.top), bottom = Math.min(innerHeight, target.bottom);
    if (right <= left || bottom <= top) return [];
    const points = [[(left + right) / 2, (top + bottom) / 2],
      [Math.max(left, rect.left) + 1, Math.max(top, rect.top) + 1]];
    const occluded = points.some(([horizontal, vertical]) => horizontal < right && vertical < bottom
      && bar.contains(document.elementFromPoint(horizontal, vertical)));
    return occluded ? [{ text: node.getAttribute("aria-label") || node.textContent.trim(), rect: target }] : [];
  });
  const header = document.querySelector('[data-usability="site-header"]') ?? document.querySelector("header");
  const footer = document.querySelector("body > footer") ?? [...document.querySelectorAll("footer")].at(-1);
  const trigger = document.querySelector('[data-usability="menu-trigger"][aria-expanded="true"]');
  const menu = trigger && document.getElementById(trigger.getAttribute("aria-controls"));
  let dismissedInSession = null;
  try { dismissedInSession = sessionStorage.getItem("bbf.homeConversionBarDismissed"); } catch {}
  return { present: Boolean(bar), visible, rect, bodyPaddingBottom: parseFloat(getComputedStyle(document.body).paddingBottom) || 0,
    scrollY, viewportHeight: innerHeight, headerOverlap: visible && intersects(rect, box(header)),
    footerOverlap: visible && intersects(rect, box(footer)), footerRect: box(footer),
    occludedFooterControls: covered(footer?.querySelectorAll('a[href],button,input,select,textarea') ?? []),
    occludedMenuControls: covered(menu?.querySelectorAll('a[href],button,input,select,textarea') ?? []),
    targets: visible ? [...bar.querySelectorAll('a[href],button')].filter(rendered).map(node => ({
      text: node.getAttribute("aria-label") || node.textContent.trim(), width: box(node).width, height: box(node).height,
    })) : [], dismissedInSession };
}

export async function captureStickyBarState(page, record, output, state, serverHtml = "") {
  const metrics = await page.evaluate(measureDocument, { serverHtml, calculatorPaths: [],
    viewport: { width: record.width, height: record.height } });
  const stickyBar = await page.evaluate(measureStickyBar);
  const axe = await new AxeBuilder({ page }).analyze();
  const filename = `${record.id}-${record.locale}-${record.width}-${state}.png`;
  await page.screenshot({ path: resolve(output, filename), fullPage: false, animations: "disabled" });
  record.stateScreenshots ??= [];
  record.stateScreenshots.push({ state, filename,
    hash: createHash("sha256").update(await readFile(resolve(output, filename))).digest("hex") });
  record.interactionChecks ??= [];
  record.interactionChecks.push({ state, numericInputs: metrics.numericInputs, smallTargets: metrics.smallTargets,
    violations: axe.violations, overflow: metrics.overflow, forbidden: metrics.forbidden,
    upgradeOverlays: metrics.upgradeOverlays, urgency: metrics.urgency, stickyBar,
    cookieCoversHeader: metrics.cookieCoversHeader });
  return stickyBar;
}

export async function prepareStickyBar(page, record, output, serverHtml) {
  const cookieUndecided = await captureStickyBarState(page, record, output, "cookie-undecided", serverHtml);
  await page.getByRole("button", { name: record.locale === "nl" ? "Alleen essentieel" : "Essential only", exact: true }).click();
  await page.locator(`${stickyBarSelector}[data-visible="true"]`).waitFor();
  await page.waitForTimeout(100);
  return { ownerException: { rule: 12, reference: "U1-BAR", scope: "Owner-authorized homepage bar only; no other rule waived" },
    cookieUndecided, initial: await page.evaluate(measureStickyBar) };
}

export async function inspectStickyBarLifecycle(page, record, output, url, metrics) {
  await page.goto(url, { waitUntil: "networkidle" });
  await page.evaluate(() => document.fonts.ready);
  await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight));
  await page.waitForTimeout(100);
  metrics.stickyBar.footer = await captureStickyBarState(page, record, output, "sticky-footer");
  await page.locator(stickyBarSelector).getByRole("button").click();
  await page.waitForTimeout(100);
  metrics.stickyBar.dismissed = await captureStickyBarState(page, record, output, "sticky-dismissed");
  await page.goto(url, { waitUntil: "networkidle" });
  await page.evaluate(() => document.fonts.ready);
  metrics.stickyBar.revisit = await captureStickyBarState(page, record, output, "sticky-revisit");
  await page.evaluate(() => {
    sessionStorage.removeItem("bbf.homeConversionBarDismissed");
    window.dispatchEvent(new Event("bbf-home-conversion-bar-dismissed"));
  });
  await page.waitForTimeout(100);
  const originalSetter = await page.evaluateHandle(() => Storage.prototype.setItem);
  try {
    await page.evaluate(() => {
      const original = Storage.prototype.setItem;
      Storage.prototype.setItem = function (key, value) {
        if (key === "bbf.homeConversionBarDismissed") throw new DOMException("Storage denied for dismissal probe", "QuotaExceededError");
        return original.call(this, key, value);
      };
    });
    await page.locator(stickyBarSelector).getByRole("button").click();
    await page.waitForTimeout(100);
    metrics.stickyBar.storageDenied = await captureStickyBarState(page, record, output, "sticky-storage-denied");
  } finally {
    await page.evaluate(original => { Storage.prototype.setItem = original; }, originalSetter);
    await originalSetter.dispose();
  }
}
