import assert from "node:assert/strict";
import test from "node:test";
import { resolve } from "node:path";
import vm from "node:vm";
import { build } from "esbuild";
import { guideBacklogFixture } from "./guide-backlog-fixture.mjs";

test("browser fixture retains both real guide CSV locales without filesystem shims", async () => {
  const root = process.cwd();
  const bundle = await build({ entryPoints: [resolve(root, "src/lib/guides/backlog.ts")],
    absWorkingDir: root, bundle: true, write: false, format: "cjs", platform: "browser",
    plugins: [guideBacklogFixture(root)] });
  const context = { module: { exports: {} } };
  vm.runInNewContext(bundle.outputFiles[0].text, context);
  const { getGuideBacklog } = context.module.exports;
  const nl = getGuideBacklog("nl");
  const en = getGuideBacklog("en");
  assert.ok(nl.length > 20, "must preserve the full CSV, not a synthetic guide record");
  assert.equal(nl.length, en.length);
  assert.deepEqual(Array.from(nl, (entry) => entry.slug), Array.from(en, (entry) => entry.slug));
  const dutch = nl.find((entry) => entry.slug === "saddle-height-guide");
  const english = en.find((entry) => entry.slug === "saddle-height-guide");
  assert.match(dutch.pageTitle, /zadelhoogte/i);
  assert.match(english.pageTitle, /saddle height/i);
  assert.notEqual(dutch.pageTitle, english.pageTitle);
});
