import assert from "node:assert/strict";
import { mkdir, writeFile } from "node:fs/promises";

const origin = process.env.METADATA_ORIGIN ?? "http://localhost:3000";
const results = [];
for (const locale of ["nl", "en"]) {
  const response = await fetch(`${origin}/${locale}/app`, { headers: { "User-Agent": "Twitterbot" } });
  assert.equal(response.status, 200);
  const html = await response.text();
  const description = locale === "nl"
    ? "Zet BestBikeFit4U op je beginscherm. Open snel je dashboard en fietsafstelling."
    : "Precision bike fitting for comfort, alignment, and performance.";
  const siteDescription = locale === "nl"
    ? "Nauwkeurige fietsafstelling voor comfort, een goede houding en prestaties."
    : description;
  assert(html.includes(`<html lang="${locale}"`));
  assert(html.includes(`<title>${locale === "nl" ? "BestBikeFit4U op je beginscherm" : "BestBikeFit4U"}</title>`));
  assert(html.includes(`name="description" content="${description}"`));
  assert(html.includes(`property="og:description" content="${description}"`));
  assert(html.includes(`name="twitter:description" content="${description}"`));
  const manifestLinks = [...html.matchAll(/<link\b[^>]*rel="manifest"[^>]*>/g)];
  assert.equal(manifestLinks.length, 1);
  assert(manifestLinks[0][0].includes(`href="/manifest.webmanifest?locale=${locale}"`));
  const schemas = [...html.matchAll(/<script\b[^>]*type="application\/ld\+json"[^>]*>(.*?)<\/script>/gs)]
    .flatMap((match) => JSON.parse(match[1]));
  assert(schemas.some((schema) => schema["@type"] === "WebSite"
    && schema.inLanguage === locale && schema.description === siteDescription));
  const manifestResponse = await fetch(`${origin}/manifest.webmanifest?locale=${locale}`);
  assert.equal(manifestResponse.status, 200);
  assert.match(manifestResponse.headers.get("content-type"), /application\/manifest\+json/);
  const manifest = await manifestResponse.json();
  assert.equal(manifest.lang, locale);
  assert.equal(manifest.start_url, `/${locale}`);
  assert.equal(manifest.description, siteDescription);
  assert.equal(manifest.id, "/");
  results.push({ locale, pageStatus: response.status, manifestStatus: manifestResponse.status,
    titleDescriptionSocial: true, schemaDescription: true, singleLocalizedManifest: true, manifest });
}
await mkdir("plans/redesign-canvas/audit", { recursive: true });
await writeFile("plans/redesign-canvas/audit/40f-runtime.json", JSON.stringify({ origin, results }, null, 2) + "\n");
console.log(`${results.length} locale metadata/manifest checks passed`);
