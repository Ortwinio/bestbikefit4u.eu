import { describe, expect, it } from "vitest";
import { batchCGuides } from "./index";
import { getRewriteFaqs } from "../../rewrite-types";

const words = (text: string) => (text.replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
  .match(/[\p{L}\p{N}]+(?:['’-][\p{L}\p{N}]+)*/gu) ?? []).length;
const ranges = [[120, 200], [200, 350], [300, 500], [60, 120]];

describe("Batch C editorial requirements", () => {
  it("contains the twelve assigned guide slugs without duplicate titles", () => {
    expect(batchCGuides).toHaveLength(12);
    expect(new Set(batchCGuides.map((guide) => guide.slug)).size).toBe(12);
    for (const locale of ["nl", "en"] as const) {
      expect(new Set(batchCGuides.map((guide) => guide[locale].metaTitle)).size).toBe(12);
      expect(new Set(batchCGuides.map((guide) => guide[locale].metaDescription)).size).toBe(12);
    }
  });

  for (const guide of batchCGuides) {
    it.each(["nl", "en"] as const)(`${guide.slug} meets the %s editorial limits`, (locale) => {
      const content = guide[locale];
      expect(content.metaTitle.length).toBeLessThanOrEqual(60);
      expect(content.metaTitle).toMatch(/ \| BestBikeFit4U$/);
      expect(content.metaDescription.length).toBeGreaterThanOrEqual(140);
      expect(content.metaDescription.length).toBeLessThanOrEqual(155);
      expect(content.title.toLowerCase()).toContain(content.keyword);
      expect(content.quickAnswer.toLowerCase()).toContain(content.keyword);
      expect(words(content.quickAnswer)).toBeGreaterThanOrEqual(40);
      expect(words(content.quickAnswer)).toBeLessThanOrEqual(70);
      const sections = content.markdown.split(/^## /m).slice(1);
      expect(sections).toHaveLength(5);
      expect(sections.some((section) => section.split("\n")[0].toLowerCase().includes(content.keyword))).toBe(true);
      for (const [index, [min, max]] of ranges.entries()) {
        const count = words(sections[index].slice(sections[index].indexOf("\n")));
        expect(count, `section ${index + 1}`).toBeGreaterThanOrEqual(min);
        expect(count, `section ${index + 1}`).toBeLessThanOrEqual(max);
      }
      const total = words(`${content.quickAnswer} ${content.markdown} ${content.cta}`);
      expect(total).toBeGreaterThanOrEqual(900);
      expect(total).toBeLessThanOrEqual(1500);
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
        const target = batchCGuides.find((candidate) => candidate.slug === slug);
        expect(target, `known target ${slug}`).toBeDefined();
        expect(label).toBe(target![locale].title);
      }
      const inbound = batchCGuides.filter((other) => other.slug !== guide.slug
        && other[locale].markdown.includes(`/${locale}/guides/${guide.slug})`));
      expect(inbound.length).toBeGreaterThanOrEqual(2);
      expect(content.markdown).not.toMatch(/^# /m);
    });
  }
});
