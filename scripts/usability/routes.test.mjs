import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";
import test from "node:test";
import { calculators, contentPages, checkoutPages, accountPages, journeys, localizedPagePath, pages, pressureSurfaces } from "./routes.mjs";

test("the two journeys cover every public calculator exactly once", () => {
  assert.equal(calculators.length, 11);
  assert.equal(new Set(calculators.map(page => page.calculator)).size, 11);
  assert.equal(journeys.posture.calculators.length, 5);
  assert.equal(journeys.ride.calculators.length, 6);
  const calculatorDirectory = new URL("../../src/app/(public)/calculators/", import.meta.url);
  const actual = readdirSync(calculatorDirectory, { withFileTypes: true }).filter(entry => entry.isDirectory()).map(entry => entry.name);
  assert.deepEqual(calculators.map(page => page.calculator).sort(), [...actual, "tire-pressure"].sort());
});

test("content inventory matches all thirteen public collapse boards", () => {
  const directory = new URL("../../plans/usability/canvas/project/", import.meta.url);
  const excluded = new Set(["Calculator.dc.html", "SaddleHeight.dc.html", "Pricing.dc.html", "Feedback.dc.html"]);
  const actual = readdirSync(directory).filter(name => name.endsWith(".dc.html") && !excluded.has(name)
    && readFileSync(new URL(name, directory), "utf8").includes("<details"));
  assert.equal(contentPages.length, 13);
  assert.deepEqual(contentPages.map(page => page.board).sort(), actual.sort());
});

test("locale paths retain canonical pressure and landing routes", () => {
  const pressure = calculators.find(page => page.id === "tire-pressure");
  assert.equal(localizedPagePath(pressure, "nl"), "/nl/bandenspanning-calculator");
  assert.equal(localizedPagePath(pressure, "en"), "/en/tire-pressure-calculator");
  assert.equal(localizedPagePath(pages[0], "nl"), "/nl");
  assert.equal(localizedPagePath(checkoutPages.at(-1), "en"), "/en/checkout?state=failure");
  assert.throws(() => localizedPagePath(pressure, "fr"));
});

test("fixture-only and unavailable states cannot silently become production coverage", () => {
  assert.equal(new Set(pages.map(page => page.id)).size, pages.length);
  assert.equal(contentPages.find(page => page.id === "blog-article").fixture, "blog");
  assert.ok(contentPages.find(page => page.id === "bike-setup").redirectedTo);
  for (const id of ["checkout-review", "checkout-success"]) {
    const page = checkoutPages.find(page => page.id === id);
    assert.equal(page.fixture, "checkout");
    assert.ok(page.limitation);
    assert.ok(page.path.includes(`state=${page.state}`));
  }
});
test("account cases distinguish compiled flag-off, free-enforced and paid states", () => {
  assert.equal(accountPages.length, 51);
  for (const page of accountPages) {
    assert.equal(new URL(localizedPagePath(page, "nl"), "http://127.0.0.1").searchParams.get("access"), page.accessScenario);
    assert.equal(page.fixture, page.accessScenario === "flag-off" ? "account" : "account-enforced");
    if (page.accessScenario !== "free-enforced") assert.deepEqual(page.boundaries, []);
  }
  assert.equal(pages.length * 4, 332);
});

test("pressure coverage names every importing canvas board without inventing report routes", () => {
  const directory = new URL("../../plans/usability/canvas/project/", import.meta.url);
  const actual = readdirSync(directory).filter(name => name.endsWith(".dc.html")
    && readFileSync(new URL(name, directory), "utf8").includes('dc-import name="Bandenspanning"'));
  assert.deepEqual(pressureSurfaces.map(surface => surface.board).sort(), actual.sort());
  for (const surface of pressureSurfaces) {
    if (surface.pageId) assert.equal(pages.find(page => page.id === surface.pageId)?.tyrePressure, true);
    else assert.ok(surface.manualRequired);
  }
});
