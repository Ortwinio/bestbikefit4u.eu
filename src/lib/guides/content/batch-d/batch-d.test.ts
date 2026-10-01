import { createHash } from "node:crypto";
import { readFileSync, statSync } from "node:fs";
import sharp from "sharp";
import { describe, expect, it } from "vitest";
import { batchDGuides } from "./index";
import { getRewriteFaqs } from "../../rewrite-types";

const words = (text: string) => (text.replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
  .match(/[\p{L}\p{N}]+(?:['’-][\p{L}\p{N}]+)*/gu) ?? []).length;
const ranges = [[120, 200], [200, 350], [300, 500], [60, 120]];

describe("Batch D editorial requirements", () => {
  it("contains the twelve assigned guide slugs without duplicate titles", () => {
    expect(batchDGuides).toHaveLength(12);
    expect(new Set(batchDGuides.map((guide) => guide.slug)).size).toBe(12);
    for (const locale of ["nl", "en"] as const) {
      expect(new Set(batchDGuides.map((guide) => guide[locale].metaTitle)).size).toBe(12);
      expect(new Set(batchDGuides.map((guide) => guide[locale].metaDescription)).size).toBe(12);
    }
  });

  for (const guide of batchDGuides) {
    it.each(["nl", "en"] as const)(`${guide.slug} meets the %s editorial limits`, (locale) => {
      const content = guide[locale];
      expect(content.metaTitle.length).toBeLessThanOrEqual(60);
      expect(content.metaTitle).toMatch(/ \| BestBikeFit4U$/);
      expect(content.metaDescription.length).toBeGreaterThanOrEqual(140);
      expect(content.metaDescription.length).toBeLessThanOrEqual(155);
      expect(content.title.toLowerCase()).toContain(content.keyword);
      expect(content.quickAnswer.toLowerCase()).toContain(content.keyword);
      expect(content.quickAnswer.split(/[.!?]+/).filter((text) => words(text)).length).toBeLessThanOrEqual(3);
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
        const target = batchDGuides.find((candidate) => candidate.slug === slug);
        expect(target, `known target ${slug}`).toBeDefined();
        expect(label).toBe(target![locale].title);
      }
      const inbound = batchDGuides.filter((other) => other.slug !== guide.slug
        && other[locale].markdown.includes(`/${locale}/guides/${guide.slug})`));
      expect(inbound.length).toBeGreaterThanOrEqual(2);
      expect(content.markdown).not.toMatch(/^# /m);
    });
  }
});


describe("Batch D review artifacts", () => {
  for (const guide of batchDGuides) {
    it(`${guide.slug} has matching CMS copy and a correctly sized hero`, async () => {
      const document = JSON.parse(readFileSync(
        `plans/redesign-canvas/guides-import/${guide.slug}.json`, "utf8",
      ));
      expect(document.status).toBe("in_review");
      expect(document.importStatus).toBe("44b");
      expect(document.slug).toBe(guide.slug);
      for (const locale of ["nl", "en"] as const) {
        expect(document.libraryBody[locale]).toBe(guide[locale].markdown);
        expect(document.pageBrief[locale]).toBe(guide[locale].quickAnswer);
        expect(document.h1[locale]).toBe(guide[locale].title);
        expect(document.featuredImageAlt[locale]).toBe(guide[locale].alt);
        expect(document.metaTitle[locale]).toBe(guide[locale].metaTitle);
        expect(document.metaDescription[locale]).toBe(guide[locale].metaDescription);
        expect(document.faqs[locale]).toEqual(getRewriteFaqs(guide[locale].markdown));
        expect(document.body[locale].at(-1).items).toEqual([guide[locale].cta]);
      }
      const path = `public/illustrations/guides/${guide.illustration}.webp`;
      expect(statSync(path).size).toBeLessThan(200000);
      const image = await sharp(path).metadata();
      expect([image.width, image.height, image.format]).toEqual([1600, 1000, "webp"]);
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

  it("preserves the approved Dutch sodium units and explicit FTP table choice", () => {
    const sodium = batchDGuides.find((guide) => guide.slug === "sodium-and-electrolytes-guide")!;
    expect(sodium.nl.quickAnswer).toContain("20–30 mmol natrium per liter");
    expect(sodium.nl.quickAnswer).toContain("460–690 mg per liter");
    expect(sodium.nl.markdown).not.toMatch(/300.?600/);
    const wkg = batchDGuides.find((guide) => guide.slug === "wkg-and-power-zones-guide")!;
    expect(wkg.nl.markdown).toContain("Je kiest zelf de mannen- of vrouwentabel");
    expect(wkg.nl.markdown).toContain("De tool leidt die keuze niet af");
  });
});
