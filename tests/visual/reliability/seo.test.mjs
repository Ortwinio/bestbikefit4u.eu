import assert from "node:assert/strict";
import { test } from "node:test";
import { checkSaddleSeo } from "./seo.mjs";

function html(locale) {
  const canonical = `https://bikefitboost.com/${locale}/calculators/saddle-height`;
  const schemas = [{ "@type": "FAQPage" }, { "@type": "HowTo" }, { "@type": "WebPage", url: canonical, inLanguage: locale }];
  return `<html lang="${locale}"><head><title>${locale === "nl" ? "Zadelhoogte" : "Saddle height"} calculator</title>
    <meta name="description" content="Calculate saddle height from your body measurements.">
    <meta property="og:description" content="Calculate saddle height from your body measurements.">
    <link rel="canonical" href="${canonical}">
    <link rel="alternate" hreflang="nl" href="https://bikefitboost.com/nl/calculators/saddle-height">
    <link rel="alternate" hreflang="en" href="https://bikefitboost.com/en/calculators/saddle-height">
    </head><body><script type="application/ld+json">${JSON.stringify(schemas)}</script>Two measurements.</body></html>`;
}

test("checks both locales and rejects stale or missing metadata", async context => {
  let transform = source => source;
  context.mock.method(globalThis, "fetch", async url => new Response(transform(html(new URL(url).pathname.split("/")[1]))));
  assert.equal((await checkSaddleSeo("http://localhost:3000")).length, 2);
  for (const replacement of [
    source => source.replace("Two measurements.", "Safe baseline band"),
    source => source.replace('rel="canonical"', 'rel="wrong"'),
    source => source.replace('hreflang="en"', 'hreflang="fr"'),
    source => source.replace('name="description"', 'name="wrong"'),
    source => source.replace('"HowTo"', '"Other"'),
  ]) {
    transform = replacement;
    await assert.rejects(checkSaddleSeo("http://localhost:3000"));
  }
});
