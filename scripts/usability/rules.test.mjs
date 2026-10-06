import assert from "node:assert/strict";
import { test } from "node:test";
import { checkRules, manualRequirements, summarize } from "./rules.mjs";

const baseline = () => ({ width: 390, height: 844, pageScreens: 5,
  account: { top: 900, links: 1, text: "Save my measurement" }, result: { bottom: 800 }, next: { links: 1 },
  collapsed: [{ inServerHtml: true }], shortAnswerPresent: true, shortAnswerSentences: 2, progress: { text: "My position · 1 of 5" },
  reuse: { known: true, prefill: true, valueMatches: true }, nextMatches: true, reasonSuppressedOnRevisit: true,
  routeStarts: ["posture", "ride"], missingCalculators: [],
  header: { height: 64 }, menu: { width: 44, height: 44 }, cookieCoversHeader: false, boundaries: [], presentations: [],
  example: { initial: true, inputChanged: true, afterEdit: false, afterReuse: false }, numericInputs: [], measurementKinds: [true],
  tyreComponents: [{ name: "shared", front: true, rear: true }], upgradeOverlays: [], urgency: [],
  safety: [{ visible: true }], forbidden: [], smallTargets: [], contrast: [], overflow: false });
const page = { kind: "calculator", safety: true, measurementKind: true, tyrePressure: true };
const rule = (number, metrics) => checkRules(page, metrics).find(check => check.rule === number);

test("every page reports all fifteen rules without automatic manual approval", () => {
  assert.equal(checkRules(page, baseline()).length, 15);
  assert(checkRules(page, baseline()).every(check => ["pass", "not-applicable"].includes(check.status)));
  assert(manualRequirements(page).some(check => check.rule === 14));
});
test("account position uses the result, not the page top, and requires a real CTA", () => {
  assert.equal(rule(1, baseline()).status, "pass");
  assert.equal(rule(1, { ...baseline(), account: { top: 1800, links: 1, text: "Save" } }).status, "fail");
  assert.equal(rule(1, { ...baseline(), account: { top: 900, links: 0, text: "Save" } }).status, "fail");
});
test("closed content must be server-rendered and mobile length must remain within seven screens", () => {
  assert.equal(rule(2, { ...baseline(), collapsed: [{ inServerHtml: false }] }).status, "fail");
  assert.equal(rule(2, { ...baseline(), pageScreens: 7.1 }).status, "fail");
  assert.equal(rule(2, { ...baseline(), shortAnswerPresent: false }).status, "fail");
});
test("numeric mobile acceptance limits do not forbid desktop result columns or longer content pages", () => {
  assert.equal(rule(1, { ...baseline(), width: 1440, account: { top: 600, links: 1, text: "Save" } }).status, "pass");
  assert.equal(rule(1, { ...baseline(), account: { top: 600, links: 1, text: "Save" } }).status, "fail");
  assert.equal(checkRules({ kind: "content" }, { ...baseline(), pageScreens: 8 })
    .find(check => check.rule === 2).status, "pass");
});
test("a prefill label without matching input values does not prove reuse", () => {
  assert.equal(rule(3, { ...baseline(), reuse: { known: true, prefill: true, valueMatches: false } }).status, "fail");
});
test("Quick fix safety must be exercised, not inferred from the default calculator", () => {
  const quick = { ...page, safetyStates: [{ id: "full" }, { id: "quick" }] };
  assert.equal(checkRules(quick, baseline()).find(check => check.rule === 13).status, "fail");
});
test("unknown interaction state is not mistaken for a passing example check", () => {
  assert.equal(rule(8, { ...baseline(), example: { initial: true } }).status, "fail");
});
test("header overlap, undersized targets, number fields and contrast failures are hard failures", () => {
  assert.equal(rule(5, { ...baseline(), cookieCoversHeader: true }).status, "fail");
  assert.equal(rule(9, { ...baseline(), numericInputs: ["inseam"] }).status, "fail");
  assert.equal(rule(15, { ...baseline(), smallTargets: [{ width: 40 }] }).status, "fail");
  assert.equal(rule(15, { ...baseline(), contrast: ["text"] }).status, "fail");
});
test("pending judgement prevents a green rule aggregate and failures outrank judgement", () => {
  const records = [{ id: "home", checks: [{ rule: 14, status: "pass" }, { rule: 14, status: "manual" }] }];
  assert.equal(summarize(records)[13].status, "manual");
  records[0].checks.push({ rule: 14, status: "fail" });
  assert.equal(summarize(records)[13].status, "fail");
});
test("dedicated checkout canvas requires its back control, without exempting marketing menus", () => {
  const metrics = { ...baseline(), menu: null, checkoutBack: { width: 44, height: 44 } };
  assert.equal(checkRules({ kind: "checkout" }, metrics).find(check => check.rule === 5).status, "pass");
  assert.equal(checkRules({ kind: "checkout" }, { ...metrics, checkoutBack: null }).find(check => check.rule === 5).status, "fail");
  assert.equal(checkRules({ kind: "checkout" }, { ...metrics, checkoutBack: { width: 40, height: 44 } })
    .find(check => check.rule === 5).status, "fail");
  assert.equal(checkRules({ kind: "home" }, metrics).find(check => check.rule === 5).status, "fail");
});

const welcomeMetrics = () => ({ ...baseline(), menu: null,
  header: { top: 0, bottom: 64, height: 64 },
  welcomeLogo: { top: 10, bottom: 54, width: 140, height: 44 },
  welcomeProgress: { top: 20, bottom: 44, width: 140, height: 24, text: "Stap 1 van 2 · je account staat klaar" },
});
const welcomeRule = metrics => checkRules({ id: "welcome", kind: "account" }, metrics).find(check => check.rule === 5);

test("RP3 welcome uses its real logo and progress rather than a menu", () => {
  const metrics = welcomeMetrics();
  assert.equal(welcomeRule(metrics).status, "pass");
  assert.equal(welcomeRule(metrics).evidence.headerPattern, "canvas-welcome-logo-progress");
  assert.equal(welcomeRule({ ...metrics, welcomeProgress: { ...metrics.welcomeProgress, text: "Step 1 of 2 · your account is ready" } }).status, "pass");
  assert(manualRequirements({ id: "welcome", kind: "account" }).some(check => check.rule === 5));
  for (const descriptor of [{ id: "dashboard", kind: "account" }, { id: "welcome", kind: "home" }, { kind: "checkout" }]) {
    assert.equal(checkRules(descriptor, metrics).find(check => check.rule === 5).status, "fail");
  }
});

test("welcome does not waive header size, real progress, logo target or single-row containment", () => {
  const metrics = welcomeMetrics();
  for (const change of [
    { welcomeLogo: null }, { welcomeProgress: null }, { header: { top: 0, bottom: 80, height: 80 } },
    { welcomeLogo: { ...metrics.welcomeLogo, width: 40 } },
    { welcomeProgress: { ...metrics.welcomeProgress, text: "Welcome" } },
    { welcomeProgress: { ...metrics.welcomeProgress, width: 0 } },
    { welcomeProgress: { ...metrics.welcomeProgress, top: 70, bottom: 94 } },
    { welcomeProgress: { ...metrics.welcomeProgress, top: 54, bottom: 64, height: 10 } },
    { cookieCoversHeader: true },
  ]) assert.equal(welcomeRule({ ...metrics, ...change }).status, "fail");
  assert.equal(welcomeRule({ ...metrics, width: 1440, header: { height: 80 }, welcomeLogo: null }).status, "not-applicable");
});
