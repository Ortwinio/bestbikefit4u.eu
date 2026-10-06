import assert from "node:assert/strict";
import test from "node:test";
import { JSDOM } from "jsdom";
import { measureDocument } from "./measure.mjs";
import { checkRules } from "./rules.mjs";

function measure(html, serverHtml = html, options = {}) {
  const dom = new JSDOM(`<!doctype html><html lang="en"><head><style>* { opacity: 1 }</style></head><body>${html}</body></html>`, {
    url: "https://example.test/en/calculators/bike-fit", runScripts: "outside-only",
  });
  const { window } = dom;
  const viewport = options.viewport ?? { width: 390, height: 844 };
  Object.defineProperty(window, "innerWidth", { value: options.innerWidth ?? viewport.width });
  Object.defineProperty(window, "innerHeight", { value: options.innerHeight ?? viewport.height });
  Object.defineProperty(window.document.documentElement, "scrollWidth", { value: options.scrollWidth ?? viewport.width });
  Object.defineProperty(window.document.documentElement, "scrollHeight", { value: options.scrollHeight ?? viewport.height });
  window.HTMLElement.prototype.getBoundingClientRect = function () {
    const width = Number(this.getAttribute("data-width") ?? 44);
    const height = Number(this.getAttribute("data-height") ?? 44);
    return { x: 0, y: 0, top: 0, left: 0, right: width, bottom: height, width, height };
  };
  window.HTMLElement.prototype.getClientRects = function () {
    return this.closest("[hidden]") ? [] : [this.getBoundingClientRect()];
  };
  Object.defineProperty(window.document.body, "innerText", { get: () => window.document.body.textContent });
  try {
    const result = window.eval(`(${measureDocument.toString()})`)({ serverHtml, calculatorPaths: [], viewport });
    return JSON.parse(JSON.stringify(result));
  } finally {
    window.close();
  }
}

test("the controlled account navigation dialog is not an upgrade popup", () => {
  const html = '<header><button data-usability="menu-trigger" aria-controls="account-mobile-menu" aria-expanded="true">Menu</button></header>'
    + '<section id="account-mobile-menu" role="dialog" aria-modal="true"><nav><a href="/profile">Profiel</a></nav><footer>Jaarabonnement · Bekijk je account</footer></section>';
  assert.deepEqual(measure(html).upgradeOverlays, []);
});

test("an account menu ID alone cannot exempt an upgrade overlay", () => {
  const trigger = '<header><button data-usability="menu-trigger" aria-controls="account-mobile-menu" aria-expanded="true">Menu</button></header>';
  const dialog = '<section id="account-mobile-menu" role="dialog"><nav><a href="/profile">Profile</a></nav><p>Upgrade to premium</p></section>';
  for (const html of [dialog, trigger.replace('aria-controls="account-mobile-menu"', 'aria-controls="other-menu"') + dialog,
    trigger.replace('aria-expanded="true"', 'aria-expanded="false"') + dialog,
    trigger.replace('data-usability="menu-trigger"', '') + dialog,
    trigger + dialog.replace(/<nav>.*?<\/nav>/, ''),
    trigger + dialog.replace('<nav>', '<nav hidden>'),
    trigger + dialog.replace('role="dialog"', 'role="alertdialog"'),
  ]) assert.equal(measure(html).upgradeOverlays.length, 1);
});

test("genuine upgrade dialogs still fail beside or inside the account navigation", () => {
  const trigger = '<header><button data-usability="menu-trigger" aria-controls="account-mobile-menu" aria-expanded="true">Menu</button></header>';
  const upgrade = '<section role="dialog" aria-modal="true"><p>Upgrade to a paid plan</p></section>';
  const menu = `<section id="account-mobile-menu" role="dialog"><nav><a href="/profile">Profile</a></nav><p>Subscription active</p>${upgrade}</section>`;
  assert.deepEqual(measure(trigger + menu).upgradeOverlays, ['Upgrade to a paid plan']);
  assert.deepEqual(measure(trigger + menu + upgrade).upgradeOverlays, ['Upgrade to a paid plan', 'Upgrade to a paid plan']);
});

test("welcome navigation measures only actual visible header logo and progress", () => {
  const result = measure('<header data-height="64"><a href="/en"><img alt="BikeFitBoost"></a><span>Step 1 of 2 · Your account is ready</span></header><main><p>Other progress</p></main>');
  assert.equal(result.welcomeLogo.width, 44);
  assert.equal(result.welcomeProgress.text, 'Step 1 of 2 · Your account is ready');
  assert.equal(checkRules({ id: 'welcome-paid', kind: 'account' }, { ...result, contrast: [] })
    .find(check => check.rule === 5).status, 'pass');
  const outside = measure('<header data-height="64"></header><main><a href="/en"><img alt="BikeFitBoost"></a><span>Step 1 of 2</span></main>');
  assert.equal(outside.welcomeLogo, null);
  assert.equal(outside.welcomeProgress, null);
});

test("mobile overflow cannot expand the viewport used for applicability and screen limits", () => {
  const html = '<header data-height="80"></header><button data-usability="menu-trigger">Menu</button><main><section data-usability="short-answer"><p>Short answer.</p></section><details><summary>Explanation</summary><p>Server content.</p></details></main>';
  const result = measure(html, html, { innerWidth: 980, innerHeight: 2121, scrollWidth: 980, scrollHeight: 7000 });
  assert.equal(result.width, 390);
  assert.equal(result.height, 844);
  assert.equal(result.overflow, true);
  assert.equal(result.pageScreens, 7000 / 844);
  assert.deepEqual(result.layoutViewport, { width: 980, height: 2121, scrollWidth: 980, scrollHeight: 7000 });
  const checks = checkRules({ kind: "calculator" }, { ...result, contrast: [] });
  assert.equal(checks.find(check => check.rule === 2).status, "fail");
  assert.equal(checks.find(check => check.rule === 5).status, "fail");
  assert.equal(checks.find(check => check.rule === 15).status, "fail");
});

test("requested mobile and desktop widths remain distinct without false overflow", () => {
  const mobile = measure("");
  assert.equal(mobile.width, 390);
  assert.equal(mobile.overflow, false);
  const desktop = measure("", "", { viewport: { width: 1440, height: 900 } });
  assert.equal(desktop.width, 1440);
  assert.equal(desktop.overflow, false);
  assert.equal(checkRules({ kind: "content" }, { ...desktop, contrast: [] }).find(check => check.rule === 5).status, "not-applicable");
  assert.equal(measure("", "", { viewport: { width: 1440, height: 900 }, scrollWidth: 1700 }).overflow, true);
});

test("visible undersized aria-hidden buttons remain tap-target failures", () => {
  const result = measure('<button aria-hidden="true" data-width="30" data-height="32">Icon</button><button hidden data-width="20">Hidden</button>');
  assert.equal(result.smallTargets.length, 1);
  assert.equal(result.smallTargets[0].width, 30);
  assert.equal(result.smallTargets[0].height, 32);
});

test("fully clipped one-pixel form helpers are invisible while visible and partly clipped controls still count", () => {
  const helper = 'tabindex="-1" aria-hidden="true" type="checkbox" data-width="1" data-height="1"';
  const result = measure(`
    <input ${helper} style="clip-path: inset(50%); overflow: hidden; width: 1px; height: 1px; position: fixed">
    <input ${helper} style="clip: rect(0px, 0px, 0px, 0px); overflow: hidden; width: 1px; height: 1px; position: absolute">
    <input ${helper} name="visible-helper" style="overflow: hidden; width: 1px; height: 1px; position: fixed">
    <input ${helper} name="partly-clipped" style="clip-path: inset(10%); overflow: hidden; width: 1px; height: 1px; position: fixed">
    <button aria-hidden="true" data-width="30" data-height="32">Visible icon</button>
    <button role="checkbox" aria-checked="false" data-width="44" data-height="44">Newsletter</button>
  `);
  assert.deepEqual(result.smallTargets.map(target => target.label), ["visible-helper", "partly-clipped", "Visible icon"]);
});

test("numeric body fields are detected without type or inputmode and code/name fields stay allowed", () => {
  const result = measure(`
    <input name="height" value="190">
    <input name="weight" inputmode="numeric" value="94">
    <input name="inseam" type="text" value="85,5 cm">
    <input name="crankLength" type="number" value="172.5">
    <input name="verificationCode" inputmode="numeric" value="123456" autocomplete="one-time-code">
    <input name="otp" inputmode="numeric" value="123456">
    <input name="bikeName" value="123">
    <input aria-label="Naam" value="190">
    <input name="websiteUrl" value="123">
    <input type="email" value="123@example.test">
    <input name="height-slider" type="range" value="190">
  `);
  assert.deepEqual(result.numericInputs.map(input => input.name), ["height", "weight", "inseam", "crankLength"]);
});

test("unchecked radios cannot pass merely because their values are nonempty", () => {
  const radios = checked => `<fieldset>
    <input data-usability="measurement-kind" type="radio" name="kind" value="measured" ${checked}>
    <input data-usability="measurement-kind" type="radio" name="kind" value="estimated">
  </fieldset>`;
  assert.deepEqual(measure(radios("")).measurementKinds, [false, false]);
  assert.deepEqual(measure(radios("checked")).measurementKinds, [true, true]);
  assert.deepEqual(measure('<fieldset data-usability="measurement-kind"><input type="radio" name="kind" value="" checked></fieldset>').measurementKinds, [false]);
});

test("every radio group within a marker needs exactly one selection", () => {
  const html = `<section data-usability="measurement-kind">
    <input type="radio" name="height-kind" value="measured" checked>
    <input type="radio" name="weight-kind" value="estimated">
  </section>`;
  assert.deepEqual(measure(html).measurementKinds, [false]);
  assert.deepEqual(measure(html.replace('value="estimated"', 'value="estimated" checked')).measurementKinds, [true]);
});

test("custom radio groups reject zero, multiple and empty selections", () => {
  const group = (first, second, value = "measured") => `<div data-usability="measurement-kind" role="radiogroup">
    <button role="radio" aria-checked="${first}" value="${value}">Measured</button>
    <button role="radio" aria-checked="${second}" value="estimated">Estimated</button>
  </div>`;
  assert.deepEqual(measure(group(false, false)).measurementKinds, [false]);
  assert.deepEqual(measure(group(true, true)).measurementKinds, [false]);
  assert.deepEqual(measure(group(true, false, "")).measurementKinds, [false]);
  assert.deepEqual(measure(group(true, false)).measurementKinds, [true]);
  assert.deepEqual(measure('<div role="radiogroup"><button data-usability="measurement-kind" role="radio" aria-checked="true">Measured</button><button data-usability="measurement-kind" role="radio" aria-checked="false">Estimated</button></div>').measurementKinds, [true, true]);
});

test("select placeholders are invalid and actual preselected methods are valid", () => {
  assert.deepEqual(measure('<select data-usability="measurement-kind"><option value="">Choose</option><option value="measured">Measured</option></select>').measurementKinds, [false]);
  assert.deepEqual(measure('<select data-usability="measurement-kind"><option value="measured" selected>Measured</option></select>').measurementKinds, [true]);
  assert.deepEqual(measure('<select data-usability="measurement-kind"><option value="placeholder" disabled selected>Choose</option></select>').measurementKinds, [false]);
});
test("Base UI selected combobox requires an actual backing value, never placeholder text", () => {
  const control = value => `<div data-usability="measurement-kind"><div data-slot="field"><button role="combobox">Measured</button><input type="hidden" value="${value}"></div></div>`;
  assert.deepEqual(measure(control("single_measurement")).measurementKinds, [true]);
  assert.deepEqual(measure(control("")).measurementKinds, [false]);
  assert.deepEqual(measure(control("single_measurement").replace('role="combobox"', 'role="combobox" data-placeholder')).measurementKinds, [false]);
});
test("browser computed overflow clip does not make a fully clipped backing input visible", () => {
  const result = measure('<input aria-hidden="true" style="position:fixed;width:1px;height:1px;overflow:clip;clip-path:inset(50%)">');
  assert.deepEqual(result.smallTargets, []);
});

test("short answers must have visible paragraph content and count actual sentences", () => {
  assert.equal(measure('<section data-usability="short-answer"><h2>Short answer</h2></section>').shortAnswerPresent, false);
  assert.equal(measure('<section data-usability="short-answer" hidden><p>Hidden answer.</p></section>').shortAnswerPresent, false);
  assert.equal(measure('<section data-usability="short-answer"><p hidden>Hidden paragraph.</p></section>').shortAnswerPresent, false);
  const result = measure('<section data-usability="short-answer"><h2>Short answer</h2><p>First sentence. Second sentence.</p></section>');
  assert.equal(result.shortAnswerPresent, true);
  assert.equal(result.shortAnswerSentences, 2);
});

test("collapsed content must exist in server body text, not only scripts or client markup", () => {
  const html = '<main><details><summary>How it works</summary><p>Measure your inseam carefully.</p></details></main>';
  assert.equal(measure(html).collapsed[0].inServerHtml, true);
  assert.equal(measure(html, '<main><details><summary>How it works</summary></details></main>').collapsed[0].inServerHtml, false);
  assert.equal(measure(html, '<main><script>"Measure your inseam carefully."</script></main>').collapsed[0].inServerHtml, false);
});
