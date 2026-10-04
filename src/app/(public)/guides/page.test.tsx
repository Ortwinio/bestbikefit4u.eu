/* @vitest-environment jsdom */

import React from "react";
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import GuidesHubPage, { generateMetadata } from "./page";
import { getGuideBacklog, getGuideChildren } from "@/lib/guides/backlog";
import { getGuidesMessages } from "@/i18n/marketing/guides";

let locale: "nl" | "en" = "en";
const blogPosts = vi.hoisted(() => vi.fn(() => Promise.resolve([] as Array<{
  slug: string; title: { en: string; nl: string }; excerpt: { en: string; nl: string }; relatedGuidePaths: string[];
}>)));

vi.mock("@/i18n/request", () => ({ getRequestLocale: () => Promise.resolve(locale) }));
vi.mock("@/lib/guides/content", () => ({
  buildHubIntro: () => ["Library context from the backlog."],
  resolveGuidePrimaryCta: (_target: string, activeLocale: string) => ({ href: `/${activeLocale}/login`, label: "Start Free Fit" }),
}));
vi.mock("../blog/data", () => ({
  listAllPublishedBlogPosts: blogPosts,
  localizeBlogText: (value: Record<string, string>, activeLocale: string) => value[activeLocale],
}));
vi.mock("next/link", () => ({
  default: ({ children, ...props }: React.ComponentProps<"a">) => <a {...props}>{children}</a>,
}));
vi.mock("next/image", () => ({
  default: ({ alt, ...props }: React.ComponentProps<"img">) => React.createElement("img", { alt, ...props }),
}));
vi.mock("@/components/prototyper-ui/ui/button", () => ({
  Button: ({ children, render: element }: { children: React.ReactNode; render: React.ReactElement }) => React.cloneElement(element, {}, children),
}));
vi.mock("@/components/analytics/TrackedCtaLink", () => ({
  TrackedCtaLink: ({ children, href, section, pagePath, locale: activeLocale, ctaLabel }: {
    children: React.ReactNode; href: string; section: string; pagePath: string; locale: string; ctaLabel: string;
  }) => <a href={href} data-section={section} data-page-path={pagePath} data-locale={activeLocale} data-cta-label={ctaLabel}>{children}</a>,
}));

afterEach(() => {
  cleanup();
  blogPosts.mockResolvedValue([]);
});

describe("guides library presentation", () => {
  it.each(["nl", "en"] as const)("keeps the backlog heading, hub destinations and tracked CTA in %s", async (activeLocale) => {
    locale = activeLocale;
    const entry = getGuideBacklog(locale).find((item) => item.slug === "guides")!;
    const hubs = getGuideBacklog(locale).filter((item) => item.path.startsWith("/guides/") && getGuideChildren(item.slug, locale).length > 0);
    const copy = getGuidesMessages(locale);
    const { container } = render(await GuidesHubPage());
    expect(screen.getAllByRole("heading", { level: 1 })).toHaveLength(1);
    expect(screen.getByRole("heading", { level: 1 }).textContent).toBe(entry.h1);
    expect(screen.getByText(entry.pageBrief)).toBeTruthy();
    expect(screen.getByAltText(copy.image).getAttribute("src")).toBe("/illustrations/06-meetset.webp");
    for (const hub of hubs) {
      expect(screen.getByRole("heading", { name: hub.pageTitle }).closest("a")?.getAttribute("href")).toBe(`/${locale}${hub.path}`);
    }
    for (const tool of copy.tools) {
      expect(screen.getByRole("heading", { name: tool.title }).closest("a")?.getAttribute("href")).toBe(`/${locale}${tool.href}`);
    }
    const action = screen.getByRole("link", { name: "Start Free Fit" });
    expect(action.getAttribute("href")).toBe(`/${locale}/login`);
    expect(action.getAttribute("data-section")).toBe("guides_home_cta");
    expect(action.getAttribute("data-page-path")).toBe(`/${locale}/guides`);
    expect(action.getAttribute("data-locale")).toBe(locale);
    expect(container.querySelector(screen.getByRole("link", { name: copy.explore }).getAttribute("href")!)).toBeTruthy();
    expect(screen.queryByRole("heading", { name: copy.relatedBlog })).toBeNull();
    const metadata = await generateMetadata();
    expect(metadata.title).toBe(entry.metaTitle);
    expect(metadata.description).toBe(entry.pageBrief);
    expect(metadata.alternates?.canonical).toBe(`https://bikefitboost.com/${locale}/guides`);
  });

  it("keeps localized related-blog filtering and the four-post limit", async () => {
    locale = "nl";
    blogPosts.mockResolvedValue([
      { slug: "unrelated", title: { en: "Unrelated", nl: "Niet gerelateerd" }, excerpt: { en: "Other", nl: "Anders" }, relatedGuidePaths: ["/pain"] },
      ...Array.from({ length: 5 }, (_, index) => ({
        slug: `article-${index}`,
        title: { en: `Article ${index}`, nl: `Artikel ${index}` },
        excerpt: { en: "Related", nl: "Gerelateerd" },
        relatedGuidePaths: [index % 2 ? "/en/guides/ride-types" : "/nl/guides"],
      })),
    ]);
    render(await GuidesHubPage());
    expect(screen.getByRole("heading", { name: "Gerelateerde blogartikelen" })).toBeTruthy();
    for (let index = 0; index < 4; index++) {
      expect(screen.getByRole("link", { name: new RegExp(`Artikel ${index}`) }).getAttribute("href")).toBe(`/nl/blog/article-${index}`);
    }
    expect(screen.queryByText("Artikel 4")).toBeNull();
    expect(screen.queryByText("Niet gerelateerd")).toBeNull();
  });
});
