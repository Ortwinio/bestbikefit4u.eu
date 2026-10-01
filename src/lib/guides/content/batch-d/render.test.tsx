// @vitest-environment jsdom
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import { RewrittenGuide } from "@/components/guides/RewrittenGuide";
import { batchDGuides } from "./index";

vi.mock("@/components/seo/JsonLd", () => ({
  JsonLd: () => null,
}));

const count = (text: string) => (text.match(/[\p{L}\p{N}]+(?:['’-][\p{L}\p{N}]+)*/gu) ?? []).length;

describe("Batch D rendered article copy", () => {
  for (const guide of batchDGuides) {
    it.each(["nl", "en"] as const)(`${guide.slug} renders readable %s paragraphs`, (locale) => {
      const html = renderToStaticMarkup(<RewrittenGuide guide={guide} locale={locale} />);
      const doc = new DOMParser().parseFromString(html, "text/html");
      const article = doc.querySelector("#guide-content")!;
      expect(article.querySelectorAll("h2")).toHaveLength(5);
      expect(article.querySelectorAll("ol li")).toHaveLength(6);
      const paragraphs = [...article.querySelectorAll("p")].map((p) => p.textContent ?? "");
      for (const paragraph of paragraphs) {
        const sentences = paragraph.split(/[.!?]+/).filter((text) => count(text));
        expect(sentences.length, paragraph).toBeLessThanOrEqual(4);
      }
      const sentences = paragraphs.flatMap((p) => p.split(/[.!?]+/).filter((text) => count(text)));
      expect(sentences.reduce((sum, sentence) => sum + count(sentence), 0) / sentences.length).toBeLessThan(18);
    });
  }
});
