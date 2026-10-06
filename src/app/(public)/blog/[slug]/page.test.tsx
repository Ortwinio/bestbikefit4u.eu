/* @vitest-environment jsdom */
import { renderToStaticMarkup } from "react-dom/server";
import type { ReactNode } from "react";
import { describe, expect, it, vi } from "vitest";
import BlogArticlePage from "./page";

let locale: "nl" | "en" = "en";
const body = "## Measuring\n\nMeasure three times and keep the original measurement.\n\n## Safety\n\nStop riding with sharp pain and seek medical assessment.";
vi.mock("@/i18n/request", () => ({ getRequestLocale: async () => locale }));
vi.mock("./data", () => ({
  getPublishedPostData: async () => ({
    title: "Fixture article", excerpt: "A practical answer. A clear next step. Further background.",
    body, category: "guides", updatedAt: 1791244800000, metaDescription: "Fixture description",
  }),
  localizeBlogText: (value: string | undefined, _locale: string, fallback = "") => value ?? fallback,
  getBlogCategoryLabel: () => "Guides",
  formatBlogDate: () => "",
}));
vi.mock("../data", () => ({ listAllPublishedBlogPosts: async () => [] }));
vi.mock("@/lib/guides/backlog", () => ({ getGuideBacklog: () => [] }));
vi.mock("@/lib/guides/content", () => ({ getGuideLinkLabel: (path: string) => path }));
vi.mock("@/components/seo/JsonLd", () => ({
  JsonLd: ({ schema }: { schema: object[] }) => <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />,
}));
vi.mock("@/components/blog/BlogPresentation", () => ({
  BlogShell: ({ children }: { children: ReactNode }) => <main>{children}</main>,
  BlogCta: () => <a href="/calculators/bike-fit">Next step</a>,
}));

describe("blog article initial server HTML", () => {
  it.each(["nl", "en"] as const)("renders closed article text, schema and open safety without hydration in %s", async language => {
    locale = language;
    const root = document.createElement("div");
    root.innerHTML = renderToStaticMarkup(await BlogArticlePage({ params: Promise.resolve({ slug: "visual-article-1" }) }));
    expect(root.querySelector("details[open]")).toBeNull();
    const explanations = Array.from(root.querySelectorAll("details:not([open])"));
    expect(explanations.some(section => section.textContent?.includes("Measure three times and keep the original measurement."))).toBe(true);
    expect(root.querySelector('[data-usability="short-answer"]')?.textContent).toBe("A practical answer. A clear next step. ");
    const safety = root.querySelector('[data-usability="safety"]');
    expect(safety?.textContent).toContain("Stop riding with sharp pain and seek medical assessment.");
    expect(safety?.closest("details")).toBeNull();
    expect(root.querySelector('a[href="/calculators/bike-fit"]')?.closest("details")).toBeNull();
    const schemas = Array.from(root.querySelectorAll('script[type="application/ld+json"]')).flatMap(script => JSON.parse(script.textContent!));
    expect(schemas.some(schema => schema["@type"] === "BlogPosting")).toBe(true);
    expect(schemas.some(schema => schema["@type"] === "BreadcrumbList")).toBe(true);
  });
});
