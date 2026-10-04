import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import sharp from "sharp";
import { batchBGuides } from "./index";
import { getRewriteFaqs } from "../../rewrite-types";
import { currentSiteUrl } from "@/lib/seo/siteUrl";

const plain = (value: string) => value.replace(/\[([^\]]+)\]\([^)]+\)/g, "$1").replace(/[*#`]/g, "");
const words = (value: string) => plain(value).match(/[\p{L}\p{N}]+(?:['’-][\p{L}\p{N}]+)*/gu)?.length ?? 0;
const locales = ["nl", "en"] as const;
const bounds = [[120, 200], [200, 350], [300, 500], [60, 120]] as const;
const links = (value: string) => [...value.matchAll(/\[([^\]]+)\]\((\/[^)]+)\)/g)]
  .map(([, label, href]) => ({ label, href }));

describe("44b batch B editorial content", () => {
  it("contains the twelve assigned guides with unique assets", () => {
    expect(batchBGuides).toHaveLength(12);
    expect(new Set(batchBGuides.map((guide) => guide.slug)).size).toBe(12);
    expect(new Set(batchBGuides.map((guide) => guide.illustration)).size).toBe(12);
  });

  for (const guide of batchBGuides) {
    for (const locale of locales) {
      it(`${guide.slug}/${locale} follows the editorial and SEO contract`, () => {
        const article = guide[locale];
        const sections = article.markdown.split(/^## /m).slice(1);
        expect(sections).toHaveLength(5);
        expect(words(article.quickAnswer)).toBeGreaterThanOrEqual(40);
        expect(words(article.quickAnswer)).toBeLessThanOrEqual(70);
        bounds.forEach(([minimum, maximum], index) => {
          const body = sections[index].slice(sections[index].indexOf("\n"));
          expect(words(body), `${index}: too short`).toBeGreaterThanOrEqual(minimum);
          expect(words(body), `${index}: too long`).toBeLessThanOrEqual(maximum);
        });
        const total = words(article.quickAnswer + article.markdown + article.cta);
        expect(total).toBeGreaterThanOrEqual(900);
        expect(total).toBeLessThanOrEqual(1500);
        expect(article.metaTitle.length).toBeLessThanOrEqual(60);
        expect(article.metaTitle).toMatch(/ \| BikeFitBoost$/);
        expect(article.metaDescription.length).toBeGreaterThanOrEqual(140);
        expect(article.metaDescription.length).toBeLessThanOrEqual(155);
        expect(article.title.toLowerCase()).toContain(article.keyword.toLowerCase());
        expect(article.quickAnswer.toLowerCase()).toContain(article.keyword.toLowerCase());
        expect(sections.some((section) => section.split("\n")[0].toLowerCase()
          .includes(article.keyword.toLowerCase()))).toBe(true);
        expect(article.markdown).toMatch(/^\d+\. /m);
        const faq = getRewriteFaqs(article.markdown);
        expect(faq.length).toBeGreaterThanOrEqual(3);
        expect(faq.length).toBeLessThanOrEqual(5);
        expect(faq.every(({ a }) => words(a) <= 60)).toBe(true);
        const faqWords = faq.reduce((sum, { q, a }) => sum + words(q + " " + a), 0);
        expect(faqWords).toBeGreaterThanOrEqual(150);
        expect(faqWords).toBeLessThanOrEqual(300);
        expect(article.markdown).not.toMatch(/gegarandeerd pijnvrij|revolutionair|!!/i);
        expect(article.markdown).toMatch(/arts|fitter|doctor|clinician/i);
        expect(article.markdown).toMatch(/zwelling|rust|nacht|swelling|rest|night/i);
        const paragraphs = article.markdown.split(/\n\s*\n/).filter((paragraph) => !paragraph.startsWith("#"));
        const sentences = paragraphs.flatMap((paragraph) => plain(paragraph).split(/[.!?]+/)
          .filter((sentence) => words(sentence)));
        expect(sentences.reduce((sum, sentence) => sum + words(sentence), 0) / sentences.length).toBeLessThan(18);
        const guideLinks = links(article.markdown).filter(({ href }) => href.startsWith(`/${locale}/guides/`));
        expect(new Set(guideLinks.map(({ href }) => href)).size).toBeGreaterThanOrEqual(3);
        expect(new Set(guideLinks.map(({ href }) => href)).size).toBeLessThanOrEqual(5);
        for (const link of guideLinks) {
          const target = batchBGuides.find((candidate) => link.href === `/${locale}/guides/${candidate.slug}`);
          expect(target, link.href).toBeDefined();
          expect(link.label).toBe(target?.[locale].title);
        }
        expect(links(article.markdown).some(({ href }) => href.startsWith(`/${locale}/calculators/`))).toBe(true);
        const inbound = batchBGuides.filter((candidate) => candidate.slug !== guide.slug
          && links(candidate[locale].markdown).some(({ href }) => href === `/${locale}/guides/${guide.slug}`));
        expect(inbound.length).toBeGreaterThanOrEqual(2);
      });
    }

    it(`${guide.slug} has matching review-only CMS content and a valid hero`, async () => {
      const record = JSON.parse(readFileSync(`plans/redesign-canvas/guides-import/${guide.slug}.json`, "utf8"));
      expect(record.status).toBe("in_review");
      expect(record.importStatus).toBe("44b");
      expect(record.path).toBe(`/guides/${guide.slug}`);
      expect(new Date(record.lastUpdatedAt).toISOString().slice(0, 10)).toBe(guide.updatedAt);
      for (const locale of locales) {
        expect(record.libraryBody[locale]).toBe(guide[locale].markdown);
        expect(record.pageBrief[locale]).toBe(guide[locale].quickAnswer);
        expect(record.h1[locale]).toBe(guide[locale].title);
        expect(record.featuredImageAlt[locale]).toBe(guide[locale].alt);
        expect(record.faqs[locale]).toEqual(getRewriteFaqs(guide[locale].markdown));
      }
      const bytes = readFileSync(`public/illustrations/guides/${guide.illustration}.webp`);
      expect(bytes.length).toBeLessThan(200000);
      const metadata = await sharp(bytes).metadata();
      expect(metadata).toMatchObject({ width: 1600, height: 1000, format: "webp" });
      const provenance = JSON.parse(readFileSync(
        "src/lib/guides/content/illustration-sources.json", "utf8",
      ))[guide.illustration];
      expect(provenance.textElements).toBe(0);
      expect(provenance.embeddedImages).toBe(0);
      expect(provenance.webpSha256).toBe(createHash("sha256").update(readFileSync(
        `public/illustrations/guides/${guide.illustration}.webp`,
      )).digest("hex"));
      expect(currentSiteUrl(record.ogImageUrl)).toBe(`https://bikefitboost.com/og/illustrations/guides/${guide.illustration}.jpg`);
    });
  }
});
