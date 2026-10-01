import { parseHtml } from "../../../../../scripts/lib/html.mjs";
import { createHash } from "node:crypto";
import { readFileSync, statSync } from "node:fs";
import { describe, expect, it } from "vitest";
import sharp from "sharp";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import ReactMarkdown from "react-markdown";
import { batchAGuides } from "./index";
import { getRewriteFaqs } from "../../rewrite-types";
import { guideRewriteTitlesA } from "@/i18n/marketing/guideRewriteTitlesA";
import { guideRewriteTitlesB } from "@/i18n/marketing/guideRewriteTitlesB";

const words = (text: string) => (text.replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
  .match(/[\p{L}\p{N}]+(?:['’-][\p{L}\p{N}]+)*/gu) ?? []).length;
const ranges = [[120, 200], [200, 350], [300, 500], [60, 120]];
const linkedTitles = { ...guideRewriteTitlesA, ...guideRewriteTitlesB };

describe("Batch A bilingual editorial content", () => {
  it("contains exactly the twelve assigned guides and unique metadata", () => {
    expect(batchAGuides.map((guide) => guide.slug).sort()).toEqual(Object.keys(guideRewriteTitlesA).sort());
    for (const locale of ["nl", "en"] as const) {
      expect(new Set(batchAGuides.map((guide) => guide[locale].metaTitle)).size).toBe(12);
      expect(new Set(batchAGuides.map((guide) => guide[locale].metaDescription)).size).toBe(12);
    }
  });

  for (const guide of batchAGuides) {
    it.each(["nl", "en"] as const)(`${guide.slug} meets the %s writing guide`, (locale) => {
      const content = guide[locale];
      expect(content.title).toBe(guideRewriteTitlesA[guide.slug][locale]);
      expect(content.metaTitle.length).toBeLessThanOrEqual(60);
      expect(content.metaTitle).toMatch(/ \| BestBikeFit4U$/);
      expect(content.metaTitle.toLowerCase().startsWith(content.keyword)).toBe(true);
      expect(content.metaDescription.length).toBeGreaterThanOrEqual(140);
      expect(content.metaDescription.length).toBeLessThanOrEqual(155);
      expect(content.title.toLowerCase()).toContain(content.keyword);
      expect(content.quickAnswer.toLowerCase()).toContain(content.keyword);
      expect(words(content.quickAnswer)).toBeGreaterThanOrEqual(40);
      expect(words(content.quickAnswer)).toBeLessThanOrEqual(70);
      const sections = content.markdown.split(/^## /m).slice(1);
      expect(sections).toHaveLength(5);
      expect(sections.some((section) => section.split("\n")[0].toLowerCase().includes(content.keyword))).toBe(true);
      for (const [index, [minimum, maximum]] of ranges.entries()) {
        const count = words(sections[index].slice(sections[index].indexOf("\n")));
        expect(count, `section ${index + 1}`).toBeGreaterThanOrEqual(minimum);
        expect(count, `section ${index + 1}`).toBeLessThanOrEqual(maximum);
      }
      expect(sections[2]).toMatch(/^1\. /m);
      expect([...sections[2].matchAll(/^\d+\. \*\*[^*\n]+\*\*/gm)]).toHaveLength(6);
      const html = renderToStaticMarkup(createElement(ReactMarkdown, null, content.markdown));
      const dom = parseHtml(html);
      const paragraphs: string[] = [...dom.window.document.querySelectorAll("p")].map((node) => node.textContent ?? "");
      dom.window.close();
      const sentences = paragraphs.flatMap((paragraph) => paragraph.split(/[.!?]+/).filter((text) => words(text)));
      for (const paragraph of paragraphs) {
        expect(paragraph.split(/[.!?]+/).filter((text) => words(text)).length, paragraph).toBeLessThanOrEqual(4);
      }
      expect(sentences.reduce((sum, sentence) => sum + words(sentence), 0) / sentences.length).toBeLessThan(18);
      expect(words(`${content.quickAnswer} ${content.markdown} ${content.cta}`)).toBeGreaterThanOrEqual(900);
      expect(words(`${content.quickAnswer} ${content.markdown} ${content.cta}`)).toBeLessThanOrEqual(1500);
      const faqs = getRewriteFaqs(content.markdown);
      expect(faqs.length).toBeGreaterThanOrEqual(3);
      expect(faqs.length).toBeLessThanOrEqual(5);
      for (const faq of faqs) expect(words(faq.a)).toBeLessThanOrEqual(60);
      const faqWords = faqs.reduce((sum, faq) => sum + words(`${faq.q} ${faq.a}`), 0);
      expect(faqWords).toBeGreaterThanOrEqual(150);
      expect(faqWords).toBeLessThanOrEqual(300);
      const links = [...content.markdown.matchAll(/\[([^\]]+)\]\(\/(nl|en)\/guides\/([^/)]+)\)/g)];
      expect(links.length).toBeGreaterThanOrEqual(3);
      expect(links.length).toBeLessThanOrEqual(5);
      for (const [, label, linkLocale, slug] of links) {
        expect(linkLocale).toBe(locale);
        expect(label).toBe(linkedTitles[slug]?.[locale]);
      }
      expect(content.markdown).toMatch(new RegExp(`\\]\\(/${locale}/calculators/`));
      const inbound = batchAGuides.filter((other) => other.slug !== guide.slug
        && other[locale].markdown.includes(`/${locale}/guides/${guide.slug})`));
      expect(inbound.length).toBeGreaterThanOrEqual(2);
      expect(content.markdown).not.toMatch(/^# /m);
      const record = JSON.parse(readFileSync(`plans/redesign-canvas/guides-import/${guide.slug}.json`, "utf8"));
      expect(record.libraryBody[locale]).toBe(content.markdown);
      expect(record.h1[locale]).toBe(content.title);
      expect(record.metaTitle[locale]).toBe(content.metaTitle);
      expect(record.metaDescription[locale]).toBe(content.metaDescription);
      expect(record.featuredImageAlt[locale]).toBe(content.alt);
      expect(record.faqs[locale]).toEqual(faqs);
      expect(record.status).toBe("in_review");
      expect(record.importStatus).toBe("44b");
      expect(record.lastUpdatedAt).toBe(Date.parse(`${guide.updatedAt}T00:00:00Z`));
    });

    it(`${guide.slug} has a new print-free 16:10 hero below 200 kB`, async () => {
      const path = `public/illustrations/guides/${guide.illustration}.webp`;
      expect(statSync(path).size).toBeLessThan(200000);
      const metadata = await sharp(path).metadata();
      expect(metadata.width).toBe(1600);
      expect(metadata.height).toBe(1000);
      const provenance = JSON.parse(readFileSync(
        "src/lib/guides/content/illustration-sources.json", "utf8",
      ))[guide.illustration];
      expect(provenance.textElements).toBe(0);
      expect(provenance.embeddedImages).toBe(0);
      expect(provenance.webpSha256).toBe(createHash("sha256").update(readFileSync(
        `public/illustrations/guides/${guide.illustration}.webp`,
      )).digest("hex"));
    });
  }
});
