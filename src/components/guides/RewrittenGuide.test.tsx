import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import { RewrittenGuide } from "./RewrittenGuide";
import { handNumbness } from "@/lib/guides/content/batch-c/hand-numbness";
import { getRewriteFaqs } from "@/lib/guides/rewrite-types";

vi.mock("@/components/seo/JsonLd", () => ({
  JsonLd: ({ schema }: { schema: object[] }) => (
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
  ),
}));

vi.mock("next/image", () => ({
  default: ({ priority: _priority, ...props }: { priority?: boolean }) => {
    void _priority;
    // The real Next image optimizer is exercised in the browser audit.
    // eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text
    return <img {...props} />;
  },
}));

describe("rewritten guide rendering", () => {
  it.each(["nl", "en"] as const)("keeps the article, metadata and image in %s", (locale) => {
    const guide = handNumbness[locale];
    const html = renderToStaticMarkup(<RewrittenGuide guide={handNumbness} locale={locale} />);
    expect(html.match(/<h1[ >]/g)).toHaveLength(1);
    expect(html).toContain(guide.title);
    expect(html).toContain(guide.alt);
    expect(html).toContain(`href="/${locale}/calculators/bike-fit"`);
    expect(html).toContain('<time dateTime="2026-10-01">');
    expect(html).toContain(locale === "nl" ? "Laatst bijgewerkt" : "Last updated");
    const schemaText = html.match(/<script[^>]+type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/)?.[1];
    expect(schemaText).toBeDefined();
    const schemas = JSON.parse(schemaText!);
    const article = schemas.find((schema: { "@type": string }) => schema["@type"] === "Article");
    expect(article.dateModified).toBe("2026-10-01");
    expect(article.inLanguage).toBe(locale);
    expect(article.author).toMatchObject({ "@type": "Person", name: "Ortwin Verreck",
      url: `https://bestbikefit4u.eu/${locale}/authors/ortwin-verreck`, sameAs: [] });
    expect(html).toContain(locale === "nl" ? "Auteur:" : "Author:");
    expect(html).toContain(`href="/${locale}/authors/ortwin-verreck"`);
    expect(article).not.toHaveProperty("reviewedBy");
    expect(article.image).toContain("/illustrations/guides/33-gevoelloze-handen.webp");
    const faq = schemas.find((schema: { "@type": string }) => schema["@type"] === "FAQPage");
    expect(faq.mainEntity).toHaveLength(4);
    for (const { q, a } of getRewriteFaqs(guide.markdown)) {
      expect(html).toContain(q);
      expect(faq.mainEntity).toContainEqual({
        "@type": "Question", name: q, acceptedAnswer: { "@type": "Answer", text: a },
      });
    }
  });

  it("preserves explicitly authored Dutch link labels instead of stale legacy titles", () => {
    const html = renderToStaticMarkup(<RewrittenGuide guide={handNumbness} locale="nl" />);
    expect(html).toMatch(/href="\/nl\/guides\/reach-and-stem-guide"[^>]*>Stuurpenlengte bepalen<\/a>/);
  });
});


it("shows an honest missing date instead of inventing a date for CMS text", () => {
  const html = renderToStaticMarkup(<RewrittenGuide guide={{ ...handNumbness, updatedAt: undefined }} locale="nl" />);
  expect(html).toContain("Bijwerkdatum niet beschikbaar.");
  expect(html).not.toContain("<time");
  expect(html).not.toContain('"dateModified"');
  expect(html).toContain("Ortwin Verreck");
});
