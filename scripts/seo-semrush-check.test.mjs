import { test } from "node:test";
import assert from "node:assert/strict";
import { inspectHtml, calculatorSchemaFailures } from "./seo-semrush-check.mjs";

test("parses only head metadata, visible dates and real table body rows", () => {
  const result = inspectHtml(`<html><head><title>Title</title><meta name="description" content="Description">
    <link rel="canonical" href="https://example.com/nl/methods"></head><body><main>
    <time datetime="2026-10-01">1 oktober</time><a href="/nl/authors/ortwin-verreck">Ortwin Verreck</a>
    <table data-pressure-setup="tubeless"><thead><tr><th>Weight</th></tr></thead>
    <tbody><tr><td>55 kg</td><td>3,5 bar</td></tr></tbody></table>
    <script>reviewed by fake script text</script><p>Visible answer</p></main></body></html>`);
  assert.equal(result.titleCount, 1);
  assert.equal(result.descriptionCount, 1);
  assert.deepEqual(result.dates, ["2026-10-01"]);
  assert.deepEqual(result.authorLinks, ["/nl/authors/ortwin-verreck"]);
  assert.equal(result.tables[0].rows, 1);
  assert.equal(result.tables[0].cells[0][0], "55 kg");
  assert(!result.text.includes("fake script"));
});
test("finds nested person and organization schemas and ignores invalid JSON safely", () => {
  const result = inspectHtml(`<script type="application/ld+json">not JSON</script>
    <script type="application/ld+json">{"@graph":[{"@type":"Article","author":{"@type":"Person",
    "name":"Ortwin Verreck","sameAs":[]}}, {"@type":"Organization","sameAs":[]}]}</script>`);
  assert.deepEqual(result.schemas.filter(schema => ["Person", "Organization"].includes(schema["@type"]))
    .map(schema => schema["@type"]), ["Person", "Organization"]);
  assert.equal(result.titleCount, 0);
});


test("calculator checks preserve page, breadcrumb and FAQ schema without application markup", () => {
  const schemas = ["WebPage", "BreadcrumbList", "FAQPage"].map(type => ({ "@type": type }));
  assert.deepEqual(calculatorSchemaFailures(schemas), []);
  for (const type of ["WebApplication", "SoftwareApplication"]) {
    assert(calculatorSchemaFailures([...schemas, { "@type": ["Thing", type] }]).includes(`forbidden ${type}`));
  }
  for (const type of ["WebPage", "BreadcrumbList", "FAQPage"]) {
    assert(calculatorSchemaFailures(schemas.filter(schema => schema["@type"] !== type)).includes(`missing ${type}`));
  }
  const parsed = inspectHtml(`<script type="application/ld+json">{"@graph":[
    {"@type":"WebPage","mainEntity":{"@type":"SoftwareApplication","aggregateRating":{}}}
  ]}</script>`);
  assert(calculatorSchemaFailures(parsed.schemas).includes("forbidden SoftwareApplication"));
  assert(calculatorSchemaFailures(parsed.schemas).includes("forbidden aggregateRating"));
});
