import assert from "node:assert/strict";
import { access, readFile, readdir, stat } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { resolve } from "node:path";
import test from "node:test";

const root = fileURLToPath(new URL("../../", import.meta.url));
const read = (path) => readFile(resolve(root, path), "utf8");
const readJson = async (path) => JSON.parse(await read(path));

test("48 guide import fixtures retain bilingual identities", async () => {
  const directory = "plans/redesign-canvas/guides-import";
  const filenames = (await readdir(resolve(root, directory))).filter((name) => name.endsWith(".json"));
  assert.equal(filenames.length, 48);
  const slugs = new Set();
  for (const filename of filenames) {
    const document = await readJson(`${directory}/${filename}`);
    assert.equal(filename, `${document.slug}.json`);
    assert.equal(document.path, `/guides/${document.slug}`);
    for (const locale of ["nl", "en"]) {
      assert.ok(document.libraryBody[locale].length > 0, `${filename}: ${locale} body`);
      assert.ok(document.pageTitle[locale].length > 0, `${filename}: ${locale} title`);
    }
    slugs.add(document.slug);
  }
  assert.equal(slugs.size, 48);
});

test("six PDF comparison boards and route inventory remain readable", async () => {
  for (let number = 1; number <= 6; number += 1) {
    const html = await read(`plans/redesign-canvas/canvas/FitRapport${number}.dc.html`);
    assert.match(html, /<html[\s>]/i);
    assert.match(html, /<body[\s>]/i);
  }
  assert.match(await read("plans/redesign-canvas/audit/route-map.md"), /page\.tsx/);
});

test("image, guide and SEO audit inputs retain readable structures", async () => {
  const images = await readJson("plans/redesign-canvas/audit/47-optimized.json");
  assert.ok(Array.isArray(images) && images.length > 0);
  for (const image of images) {
    assert.equal(typeof image.original, "string");
    assert.equal(typeof image.output, "string");
  }
  const guides = await readJson("plans/redesign-canvas/audit/44a-guides-audit.json");
  assert.ok(Array.isArray(guides.rows) && guides.rows.length > 0);
  const links = await readJson("plans/seo-semrush/audit/S9-internal-links.json");
  for (const locale of ["nl", "en"]) {
    assert.ok(links.locales[locale].contextualSourcePages.length >= 5);
  }
});

test("tracked NL sweep report and cases remain available for reanalysis", async () => {
  const directory = "plans/redesign-canvas/final-sweep/40a-nl";
  const report = await readJson(`${directory}/report.json`);
  assert.ok(report.metadata && Array.isArray(report.cases));
  const cases = (await read(`${directory}/cases.jsonl`)).trim().split("\n").map(JSON.parse);
  assert.ok(cases.length > 0);
});

test("persistent output destinations have directory markers", async () => {
  const directories = [
    "plans/seo-crawl-fixes/audit", "plans/riderprofile-baseline", "plans/migratie/audit",
    "plans/rebrand/audit", "plans/seo-semrush/audit", "plans/redesign-canvas/guides-import",
    "plans/redesign-canvas/audit", "plans/redesign-canvas/final-sweep",
  ];
  for (const directory of directories) {
    assert.ok((await stat(resolve(root, directory))).isDirectory(), directory);
    assert.ok((await read(`${directory}/README.md`)).trim().length > 0, directory);
  }
});

test("ignored output destinations retain writers that recreate directories", async () => {
  const contracts = [
    ["plans/rebrand/renders", "scripts/generate-example-report.mjs", "await mkdir(output, { recursive: true })"],
    ["plans/rebrand/renders/emails", "scripts/render-email-previews.mjs", "await mkdir(output, { recursive: true })"],
    ["plans/seo-semrush/renders", "scripts/seo-semrush-check.mjs", "await mkdir(renders, { recursive: true })"],
    ["plans/redesign-canvas/code-renders", "tests/visual/pdf-report/render.mjs", "await mkdir(output, { recursive: true })"],
    ["plans/redesign-canvas/illustration-sources/originals", "scripts/images/optimize-public.mjs", 'await mkdir(dirname(`${archive}/${name}`), { recursive: true })'],
    ["plans/redesign-canvas/illustration-sources/guides", "scripts/images/archive-guide-source.py", "target.parent.mkdir(parents=True, exist_ok=True)"],
  ];
  const ignoredDirectories = (await read(".gitignore")).split("\n")
    .filter((line) => line.endsWith("/") && !line.startsWith("#"))
    .map((line) => line.replace(/^\//, ""));
  for (const [directory, writer, creation] of contracts) {
    assert.ok(ignoredDirectories.some((ignored) => `${directory}/`.startsWith(ignored)), directory);
    const source = await read(writer);
    assert.ok(source.includes(directory), `${writer}: output destination`);
    assert.ok(source.includes(creation), `${writer}: recursive directory creation`);
  }
});

test("baseline workflow and planned report destination remain documented", async () => {
  assert.match(await read("plans/riderprofile-baseline/README.md"), /18 October 2026/);
  await access(resolve(root, "plans/riderprofile-baseline/audit/R0-notes.md"));
  const runner = await read("scripts/riderprofile-baseline.mjs");
  assert.ok(runner.includes("analytics/baseline:riderProfileBaseline"));
  assert.ok(runner.includes('"plans/riderprofile-baseline"'));
  assert.ok(runner.includes("baseline-${fromLabel}-${toLabel}"));
  await access(resolve(root, "convex/analytics/baseline.ts"));
});

test("known ignored inputs are reported without requiring absent generated files", async (context) => {
  const optional = [
    "plans/seo-semrush/audit/S10-before/summary.json",
    "plans/seo-semrush/audit/S10-after/summary.json",
    "plans/redesign-canvas/illustration-sources/originals/bestbikefit4u-home.gif",
    ...["Guides", "GuideDetail", "BlogIndex", "BlogArticle", "About", "FAQ", "Contact", "CaseStudy"]
      .map((board) => `plans/redesign-canvas/drafts/_renders/${board}.png`),
  ];
  const images = await readJson("plans/redesign-canvas/audit/47-optimized.json");
  for (const image of images.filter((entry) => entry.output.endsWith(".webp") || [
    "guides/media/003--guides--bike-fitting-for-knee-pain-hero.png",
    "brand/report/bike-dimensions.png", "logo/bestbikefit4u-logo.png",
  ].includes(entry.output))) {
    optional.push(`plans/redesign-canvas/illustration-sources/originals/${image.original}`);
  }
  const missing = [];
  for (const path of new Set(optional)) {
    try {
      await access(resolve(root, path));
    } catch (error) {
      if (error.code !== "ENOENT") throw error;
      missing.push(path);
    }
  }
  context.diagnostic(`Pre-existing ignored/generated inputs absent (${missing.length}): ${missing.join(", ")}`);
});
