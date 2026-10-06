import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { JSDOM } from "jsdom";
import { executeBoard, resolveImportProps, importScopes } from "./board-reference.mjs";

for (const filename of ["Main.dc.html", "m/Home.dc.html"]) {
  test(`${filename} executes default and real height handler`, async () => {
    const html = await readFile(new URL(`../../plans/usability/canvas/project/${filename}`, import.meta.url), "utf8");
    const result = executeBoard(html, { interactions: [{ name: "setHeight", event: { target: { value: "190" } } }] });
    assert.equal(result.snapshots[0].values.height, 175);
    assert.equal(result.snapshots[0].values.isExample, true);
    assert.equal(result.snapshots[0].values.sh, 726);
    assert.equal(result.snapshots[0].values.half, 45);
    assert.equal(result.values.height, 190);
    assert.equal(result.values.isExample, false);
    assert.equal(result.values.sh, 789);
    assert.equal(result.values.half, 49);
  });
}

test("board props apply defaults and imported bindings", () => {
  const html = `<script data-dc-script data-props='{"low":{"default":10},"high":{"default":20}}'>class Component extends DCLogic { renderVals() { return this.props; } }</script>`;
  const element = new JSDOM('<dc-import name="Range" low="{{lower}}" high-label="{{String(upper)}}" hint-size="100%,56px"></dc-import>').window.document.querySelector("dc-import");
  const props = resolveImportProps(element, { lower: 15, upper: 25 });
  assert.deepEqual(props, { low: 15, highLabel: "25" });
  assert.deepEqual(executeBoard(html, { props }).values, { low: 15, high: 20, highLabel: "25" });
});

test("unsupported browser globals fail explicitly; static boards are labelled", () => {
  assert.equal(executeBoard("<main>Static</main>").status, "static");
  assert.throws(() => executeBoard('<script data-dc-script>class Component extends DCLogic { renderVals() { return window.location; } }</script>'), /window is not defined/);
});

test("import scope respects nested loop values and inactive conditions", () => {
  const element = new JSDOM('<sc-for list="{{groups}}" as="group"><sc-for list="{{group.items}}" as="item"><sc-if value="{{item.visible}}"><dc-import name="Range" low="{{item.low}}"></dc-import></sc-if></sc-for></sc-for>').window.document.querySelector("dc-import");
  const scopes = importScopes(element, { groups: [{ items: [{ visible: true, low: 10 }, { visible: false, low: 20 }] }] });
  assert.equal(scopes.length, 1);
  assert.deepEqual(resolveImportProps(element, scopes[0]), { low: 10 });
});
