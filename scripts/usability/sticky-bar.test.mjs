import assert from "node:assert/strict";
import test from "node:test";
import { JSDOM } from "jsdom";
import { measureStickyBar } from "./sticky-bar.mjs";

function measure({ visible = true, menu = false, occluded = false, reserved = 120, footerTop = 600,
  targetWidth = 44, targetHeight = 44 } = {}) {
  const dom = new JSDOM(`<body style="padding-bottom:${reserved}px">
    <header data-usability="site-header" data-top="0" data-height="64">
      <button data-usability="menu-trigger" aria-expanded="${menu}" aria-controls="menu">Menu</button>
    </header>
    <section id="menu" data-top="0" data-height="844"><a href="/en" data-top="740">Navigation</a></section>
    <footer data-top="${footerTop}" data-height="100"><a href="/privacy" data-top="${footerTop + 40}">Privacy</a></footer>
    <aside aria-label="Offer" data-visible="${visible}" data-top="${visible ? 724 : 1000}" data-height="120">
      <a href="/pricing" data-top="760" data-width="${targetWidth}" data-height="${targetHeight}">Price</a>
      <a href="/login" style="display:none">Hidden mobile CTA</a>
      <button aria-label="Close" data-top="730">×</button>
    </aside></body>`, { url: "https://example.test/en", runScripts: "outside-only" });
  const { window } = dom;
  Object.defineProperty(window, "innerHeight", { value: 844 });
  window.HTMLElement.prototype.getBoundingClientRect = function () {
    const top = Number(this.dataset.top ?? 0), width = Number(this.dataset.width ?? 44);
    const height = Number(this.dataset.height ?? 44);
    return { top, bottom: top + height, left: 0, right: width, width, height };
  };
  window.document.elementFromPoint = () => occluded
    ? window.document.querySelector("aside button") : window.document.querySelector("#menu a");
  try {
    window.sessionStorage.setItem("bbf.homeConversionBarDismissed", "1");
    return JSON.parse(JSON.stringify(window.eval(`(${measureStickyBar.toString()})`)()));
  } finally { window.close(); }
}

test("visible bar records full reservation and only displayed targets", () => {
  const result = measure();
  assert.equal(result.visible, true);
  assert.equal(result.rect.height, 120);
  assert.equal(result.bodyPaddingBottom, 120);
  assert.equal(result.targets.length, 2);
  assert.equal(result.headerOverlap, false);
  assert.equal(result.footerOverlap, false);
});

test("cookie-undecided and dismissed hidden bar cannot occlude controls", () => {
  const result = measure({ visible: false, menu: true, occluded: true });
  assert.equal(result.visible, false);
  assert.deepEqual(result.targets, []);
  assert.deepEqual(result.occludedMenuControls, []);
  assert.equal(result.dismissedInSession, "1");
});

test("actual hit testing detects visible menu control occlusion", () => {
  assert.equal(measure({ menu: true, occluded: true }).occludedMenuControls[0].text, "Navigation");
  assert.deepEqual(measure({ menu: true, occluded: false }).occludedMenuControls, []);
  assert.deepEqual(measure({ menu: false, occluded: true }).occludedMenuControls, []);
});

test("footer intersection and covered footer actions are separate evidence", () => {
  const result = measure({ footerTop: 720, occluded: true, reserved: 0 });
  assert.equal(result.footerOverlap, true);
  assert.equal(result.occludedFooterControls[0].text, "Privacy");
  assert.equal(result.bodyPaddingBottom, 0);
});

test("undersized visible CTA is preserved for rule15 rather than waived", () => {
  const result = measure({ targetWidth: 30, targetHeight: 38 });
  assert.equal(result.targets[0].width, 30);
  assert.equal(result.targets[0].height, 38);
});
