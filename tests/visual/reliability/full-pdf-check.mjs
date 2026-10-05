import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";

const output = new URL("../../../plans/reliability/renders/pdf/", import.meta.url);
const browserChecks = JSON.parse(await readFile(new URL("26-browser.json", output), "utf8"));
const pdfChecks = JSON.parse(await readFile(new URL("26-pdf.json", output), "utf8"));
assert.equal(browserChecks.length, 10);
assert.equal(pdfChecks.length, 4);
for (const check of browserChecks) {
  assert.equal(check.sheets, 6);
  assert.ok(check.measurements.every((page) => !page.overflow));
}
for (const check of pdfChecks) {
  assert.equal(check.passed, true, JSON.stringify(check.errors));
  assert.equal(check.pageCount, 6);
  const prefix = check.fixture === "full" ? "26-full" : "26";
  const html = await readFile(new URL(`${prefix}-report-${check.locale}.html`, output), "utf8");
  const title = check.locale === "nl" ? "Hoe nauwkeurig is dit advies?" : "How accurate is this advice?";
  assert.ok(html.includes(title));
  assert.ok(html.includes(check.locale === "nl" ? "95%-bereik" : "95% range"));
  assert.ok(html.includes('class="pdf-summary-accuracy"'));
  assert.ok(html.includes('class="pdf-fit-range"'));
  assert.doesNotMatch(html, /class="[^"]*(?:pdf-fit-safety|safety-band|test-band)/);
}
console.log(`PASS: 10 six-page layouts and four bilingual PDFs, accuracy blocks and 95% ranges: ${fileURLToPath(output)}`);
