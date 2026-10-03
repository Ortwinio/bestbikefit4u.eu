import assert from "node:assert/strict";
import { writeFile } from "node:fs/promises";
import { JSDOM } from "jsdom";
const paths = ["bike-fit", "saddle-height", "frame-size", "crank-length", "saddle-width", "gearing",
  "power-speed", "climb-planner", "ftp-wkg", "fuel-hydration", "tire-pressure"];
const base = process.argv.find(value => value.startsWith("--base="))?.slice(7) ?? "https://localhost:3197";
assert(["localhost", "127.0.0.1"].includes(new URL(base).hostname), "Only local builds");
const results = [];
for (const locale of ["nl", "en"]) for (const calculator of paths) {
  const path = calculator === "tire-pressure" ? (locale === "nl" ? "/bandenspanning-calculator" : "/tire-pressure-calculator") : `/calculators/${calculator}`;
  const url = new URL(`/${locale}${path}`, base);
  const response = await fetch(url, { signal: AbortSignal.timeout(30000) });
  const html = await response.text();
  const dom = new JSDOM(html);
  const document = dom.window.document;
  const sections = [...document.querySelectorAll("[data-calculator-answer]")];
  const section = sections[0];
  const schemas = [...document.querySelectorAll('script[type="application/ld+json"]')]
    .flatMap(node => { try { return JSON.parse(node.textContent); } catch { return []; } });
  const flatten = value => Array.isArray(value) ? value.flatMap(flatten)
    : value && typeof value === "object" ? [value, ...flatten(value["@graph"] ?? [])] : [];
  const faqs = schemas.flatMap(flatten).filter(schema => schema["@type"] === "FAQPage");
  const text = node => {
    const clone = node.cloneNode(true);
    clone.querySelectorAll("script,style,noscript").forEach(item => item.remove());
    return clone.textContent.replace(/\s+/g, " ").trim();
  };
  const main = document.querySelector("main") ?? document.body;
  const baseline = main.cloneNode(true);
  baseline.querySelectorAll("[data-calculator-answer]").forEach(item => item.remove());
  const currentText = text(main);
  const previousText = text(baseline);
  const answerText = section ? text(section) : "";
  const result = { locale, calculator, path, status: response.status, sections: sections.length,
    faqVisible: faqs.every(faq => (faq.mainEntity ?? []).every(question => {
      const clean = value => JSDOM.fragment(String(value ?? "")).textContent.replace(/\s+/g, " ").trim();
      return currentText.includes(clean(question.name)) && currentText.includes(clean(question.acceptedAnswer?.text));
    })),
    readableAnswerWords: answerText.split(/\s+/).filter(Boolean).length,
    readableAnswerCharacters: answerText.length,
    structuralComparison: { description: "Same raw DOM with answer section removed; not an independently captured historic page",
      current: { textCharacters: currentText.length, htmlCharacters: main.outerHTML.length,
        ratio: currentText.length / main.outerHTML.length },
      withoutAnswerSection: { textCharacters: previousText.length, htmlCharacters: baseline.outerHTML.length,
        ratio: previousText.length / baseline.outerHTML.length } },
    headings: section?.querySelectorAll("h2,h3").length ?? 0, inputResultRows: section?.querySelectorAll("dl > div").length ?? 0,
    mistakes: section?.querySelectorAll("li").length ?? 0, answerTextLength: section?.textContent.trim().length ?? 0,
    faqSchemas: faqs.length, faqQuestions: faqs.reduce((count, faq) => count + (faq.mainEntity?.length ?? 0), 0) };
  results.push(result); dom.window.close();
}
await writeFile("plans/seo-semrush/audit/S11-raw-html.json", JSON.stringify(results, null, 2) + "\n");
for (const result of results) {
  assert.equal(result.status, 200, JSON.stringify(result));
  assert.equal(result.sections, 1, JSON.stringify(result));
  assert(result.headings >= 5 && result.inputResultRows >= 2 && result.mistakes >= 1, JSON.stringify(result));
  assert(result.answerTextLength > 300 && result.faqSchemas === 1 && result.faqQuestions >= 1 && result.faqVisible, JSON.stringify(result));
}
console.log(`S11: ${results.length} raw HTML calculator routes passed`);
