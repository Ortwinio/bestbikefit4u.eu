import { test } from "node:test";
import assert from "node:assert/strict";
import { mkdtemp, mkdir, writeFile, readFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { copyBuildInputs, fingerprint } from "./production.mjs";

test("source test fixtures are copied and fixture edits invalidate the production cache", async () => {
  const directory = await mkdtemp(join(tmpdir(), "qa-production-inputs-"));
  const root = join(directory, "repo");
  const snapshot = join(directory, "snapshot");
  try {
    await mkdir(join(root, "src"), { recursive: true });
    await mkdir(join(root, "tests/fixtures"), { recursive: true });
    await writeFile(join(root, "src/report.test.ts"), 'import "../tests/fixtures/reportPdf";\n');
    const fixture = join(root, "tests/fixtures/reportPdf.ts");
    await writeFile(fixture, "export const report = 1;\n");
    const original = await fingerprint(root, {});
    await copyBuildInputs(root, snapshot);
    assert.equal(await readFile(join(snapshot, "tests/fixtures/reportPdf.ts"), "utf8"),
      await readFile(fixture, "utf8"));
    assert.equal(await fingerprint(snapshot, {}), original);
    await writeFile(fixture, "export const report = 2;\n");
    assert.notEqual(await fingerprint(root, {}), original);
    await rm(fixture);
    assert.notEqual(await fingerprint(root, {}), original);
  } finally {
    await rm(directory, { recursive: true, force: true });
  }
});

test("script modules imported by source tests are copied and invalidate the cache", async () => {
  const directory = await mkdtemp(join(tmpdir(), "qa-production-scripts-"));
  const root = join(directory, "repo");
  const snapshot = join(directory, "snapshot");
  try {
    await mkdir(join(root, "scripts/lib"), { recursive: true });
    const paths = ["scripts/lib/html.mjs", "scripts/import-guide-rewrites.mjs"];
    for (const path of paths) await writeFile(join(root, path), "export const fixture = 1;\n");
    const original = await fingerprint(root, {});
    await copyBuildInputs(root, snapshot);
    for (const path of paths) assert.equal(await readFile(join(snapshot, path), "utf8"), "export const fixture = 1;\n");
    assert.equal(await fingerprint(snapshot, {}), original);
    for (const path of paths) {
      await writeFile(join(root, path), "export const fixture = 2;\n");
      assert.notEqual(await fingerprint(root, {}), original);
      await writeFile(join(root, path), "export const fixture = 1;\n");
    }
  } finally {
    await rm(directory, { recursive: true, force: true });
  }
});
