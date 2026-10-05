import assert from "node:assert/strict";
import { JSDOM } from "jsdom";

export async function checkSaddleSeo(origin) {
  const results = [];
  for (const locale of ["nl", "en"]) {
    const pathname = `/${locale}/calculators/saddle-height`;
    const response = await fetch(`${origin}${pathname}`, { headers: { "User-Agent": "GPTBot" }, redirect: "error" });
    assert.equal(response.status, 200, pathname);
    const dom = new JSDOM(await response.text());
    const document = dom.window.document;
    const head = document.head;
    const canonical = `https://bikefitboost.com${pathname}`;
    assert.equal(document.documentElement.lang, locale);
    assert.match(head.querySelector("title")?.textContent ?? "", locale === "nl" ? /zadelhoogte/i : /saddle.height/i);
    for (const selector of ['meta[name="description"]', 'meta[property="og:description"]']) {
      const content = head.querySelector(selector)?.getAttribute("content") ?? "";
      assert(content.length > 30, `${pathname}: missing ${selector}`);
      assert.doesNotMatch(content, /veilige (?:startband|afstelmarge)|safe (?:baseline band|adjustment range)/i);
    }
    assert.equal(head.querySelector('link[rel="canonical"]')?.getAttribute("href"), canonical);
    for (const alternate of ["nl", "en"]) {
      assert.equal(head.querySelector(`link[rel="alternate"][hreflang="${alternate}"]`)?.getAttribute("href"),
        `https://bikefitboost.com/${alternate}/calculators/saddle-height`);
    }
    const schemas = [...document.querySelectorAll('script[type="application/ld+json"]')]
      .flatMap(script => JSON.parse(script.textContent));
    assert(schemas.some(schema => schema["@type"] === "FAQPage"), "Missing FAQ schema");
    assert(schemas.some(schema => schema["@type"] === "HowTo"), "Missing HowTo schema");
    const calculator = schemas.find(schema => schema["@type"] === "WebPage" && schema.url === canonical);
    assert(calculator, "Missing calculator schema");
    assert.equal(calculator.url, canonical);
    assert.equal(calculator.inLanguage, locale);
    const serializedSchemas = JSON.stringify(schemas);
    assert.doesNotMatch(serializedSchemas, /Kies je fietscategorie en rijdoel|Choose bike category and riding goal|Why does flexibility affect|Waarom beïnvloedt flexibiliteit/i);
    for (const script of document.querySelectorAll("script")) script.remove();
    assert.doesNotMatch(document.body.textContent, /veilige startband|veilige basiszone|safe baseline band/i);
    results.push({ locale, pathname, metadataInHead: true, canonical, alternates: true, schemaTypes: schemas.map(schema => schema["@type"]) });
    dom.window.close();
  }
  return results;
}
