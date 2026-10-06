import assert from "node:assert/strict";
import { mkdtemp, mkdir, writeFile, rm, utimes } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";
import { applicationFingerprint, sourceFingerprint, findSourcesNewerThanBuild, verifyManualApproval,
  startBuildProvenance, finishBuildProvenance, verifyBuildProvenance } from "./provenance.mjs";

async function fixture(context) {
  const root = await mkdtemp(join(tmpdir(), "usability-provenance-"));
  context.after(() => rm(root, { recursive: true, force: true }));
  const put = async (name, contents = "source") => {
    const path = join(root, name);
    await mkdir(join(path, ".."), { recursive: true });
    await writeFile(path, contents);
    return path;
  };
  return { root, put };
}

test("fingerprint is stable across root, creation order and timestamps", async context => {
  const first = await fixture(context);
  const second = await fixture(context);
  await first.put("src/a.ts", "one"); await first.put("shared/b.ts", "two");
  await second.put("shared/b.ts", "two"); await second.put("src/a.ts", "one");
  assert.equal(await sourceFingerprint(first.root), await sourceFingerprint(second.root));
});

test("application, fixture, visual and runner source changes invalidate fingerprints", async context => {
  const { root, put } = await fixture(context);
  let previous = await sourceFingerprint(root);
  for (const path of ["src/app.tsx", "shared/model.ts", "convex/query.ts", "scripts/usability/fixtures.mjs", "tests/visual/mock.jsx", "scripts/usability-check.mjs"]) {
    await put(path);
    const current = await sourceFingerprint(root);
    assert.notEqual(current, previous, path);
    previous = current;
  }
  await put("src/app.tsx", "changed behavior");
  assert.notEqual(await sourceFingerprint(root), previous);
});

test("renders, logs, modules and generated build artifacts do not change fingerprint", async context => {
  const { root, put } = await fixture(context);
  await put("src/app.tsx");
  const before = await sourceFingerprint(root);
  for (const path of ["tests/visual/output.log", "tests/visual/report.json", "tests/visual/renders/report.json", "src/node_modules/pkg/index.js", "src/.next/build.js", "convex/_generated/api.js", "plans/usability/renders/report.json"]) await put(path);
  assert.equal(await sourceFingerprint(root), before);
});

test("stale build detection concerns app sources, not newer harnesses", async context => {
  const { root, put } = await fixture(context);
  const build = await put(".next/BUILD_ID", "build");
  const app = await put("src/app.tsx");
  await utimes(build, 100, 100);
  await utimes(app, 90, 90);
  await put("scripts/usability/fixtures.mjs");
  await put("tests/visual/fixture.jsx");
  assert.deepEqual(await findSourcesNewerThanBuild(root), []);
  await utimes(app, 110, 110);
  assert.deepEqual(await findSourcesNewerThanBuild(root), ["src/app.tsx"]);
});

test("config, locks, public assets and application data bind build and review fingerprints", async context => {
  const { root, put } = await fixture(context);
  let application = await applicationFingerprint(root);
  let source = await sourceFingerprint(root);
  const build = await put(".next/BUILD_ID", "build");
  await utimes(build, 100, 100);
  const inputs = ["next.config.ts", "postcss.config.mjs", "tailwind.config.js", "tsconfig.json", "package.json",
    "package-lock.json", "pnpm-lock.yaml", "yarn.lock", "vercel.json", "instrumentation-client.ts", ".nvmrc",
    "public/logo.svg", "public/fonts/site.woff2", "public/download.bin", "public/dist/player.min.js", "src/image.png", "src/lib/content.json",
    "shared/pricing.json", "convex/tsconfig.json", "data/geometry.csv", "docs/bestbikefit4u_guides_cms_backlog_v1_nl.csv"];
  for (const path of inputs) {
    await put(path);
    const nextApplication = await applicationFingerprint(root);
    const nextSource = await sourceFingerprint(root);
    assert.notEqual(nextApplication, application, path);
    assert.notEqual(nextSource, source, path);
    application = nextApplication;
    source = nextSource;
  }
  assert.deepEqual((await findSourcesNewerThanBuild(root)).sort(), inputs.sort());
});

test("tests, harness and audit edits do not require rebuilding the application", async context => {
  const { root, put } = await fixture(context);
  const build = await put(".next/BUILD_ID", "build");
  await utimes(build, 100, 100);
  const before = await applicationFingerprint(root);
  for (const path of ["src/app.test.tsx", "src/__tests__/data.json", "next.config.test.ts",
    "scripts/usability/provenance.mjs", "tests/visual/fixture.jsx", "plans/usability/audit/review.md"]) await put(path);
  assert.equal(await applicationFingerprint(root), before);
  assert.deepEqual(await findSourcesNewerThanBuild(root), []);
});

test("build-start hash catches edits during compilation even with old source timestamps", async context => {
  const { root, put } = await fixture(context);
  const app = await put("src/app.tsx", "before");
  const start = await startBuildProvenance(root);
  start.startedAt = "2020-01-01T00:00:00.000Z";
  await put("src/app.tsx", "changed during compilation");
  await utimes(app, 100, 100);
  await put(".next/BUILD_ID", "build-1");
  assert.deepEqual(await findSourcesNewerThanBuild(root), []);
  await assert.rejects(finishBuildProvenance(root, start), /changed during build/);
});

test("completed provenance verifies content and build ID, unaffected by review changes", async context => {
  const { root, put } = await fixture(context);
  await put("src/app.tsx", "source");
  const start = await startBuildProvenance(root);
  start.startedAt = "2020-01-01T00:00:00.000Z";
  await put(".next/BUILD_ID", "build-1");
  const stamp = await finishBuildProvenance(root, start);
  assert.equal(stamp.buildId, "build-1");
  assert.deepEqual(await verifyBuildProvenance(root, stamp), { valid: true, reason: null });
  await put("scripts/usability/rules.test.mjs", "new test");
  await put("plans/usability/audit/review.md", "review");
  assert.equal((await verifyBuildProvenance(root, stamp)).valid, true);
  await put(".next/BUILD_ID", "build-2");
  assert.match((await verifyBuildProvenance(root, stamp)).reason, /Build ID/);
  await put(".next/BUILD_ID", "build-1");
  await put("src/app.tsx", "changed");
  assert.match((await verifyBuildProvenance(root, stamp)).reason, /Application inputs/);
});

test("missing, malformed and predating build provenance fails closed", async context => {
  const { root, put } = await fixture(context);
  assert.equal((await verifyBuildProvenance(root, null)).valid, false);
  await assert.rejects(finishBuildProvenance(root, {}), /Invalid build-start/);
  const start = await startBuildProvenance(root);
  const build = await put(".next/BUILD_ID", "old-build");
  await utimes(build, 100, 100);
  await assert.rejects(finishBuildProvenance(root, start), /predates/);
  const malformed = { ...start, buildId: "old-build", completedAt: "1970-01-01T00:00:00.000Z" };
  assert.equal((await verifyBuildProvenance(root, malformed)).valid, false);
});

const provenance = { buildId: "build-1", sourceHash: "a".repeat(64), evidenceHash: "b".repeat(64) };
const record = { id: "saddle-height", locale: "nl", width: 390, screenshotHash: "c".repeat(64) };
const required = { rule: 13 };
const approval = () => ({ buildId: provenance.buildId, sourceHash: provenance.sourceHash, checks: [{ ...record, rule: 13,
  status: "pass", reviewer: "Reviewer", note: "Quick and full states reviewed.", evidenceHash: provenance.evidenceHash }] });

test("manual approval requires exact source, screenshot and state-evidence binding", () => {
  const review = approval();
  assert.equal(verifyManualApproval(review, record, required, provenance), review.checks[0]);
  for (const key of ["buildId", "sourceHash", "evidenceHash"]) {
    assert.equal(verifyManualApproval(review, record, required, { ...provenance, [key]: "different" }), null, key);
  }
  for (const [key, value] of Object.entries({ id: "saddle", locale: "en", width: "390", rule: "13", screenshotHash: "d".repeat(64), evidenceHash: "e".repeat(64), reviewer: "  ", note: "\n", status: "manual" })) {
    const invalid = approval(); invalid.checks[0][key] = value;
    assert.equal(verifyManualApproval(invalid, record, required, provenance), null, key);
  }
});

test("legacy screenshot-only approval and ambiguous duplicate entries remain pending", () => {
  const legacy = approval(); delete legacy.checks[0].evidenceHash;
  assert.equal(verifyManualApproval(legacy, record, required, provenance), null);
  const duplicate = approval(); duplicate.checks.push({ ...duplicate.checks[0], status: "fail" });
  assert.equal(verifyManualApproval(duplicate, record, required, provenance), null);
});
