/* @vitest-environment jsdom */

import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { LatestBlogSection } from "./LatestBlogSection";

const { fetchQuery } = vi.hoisted(() => ({ fetchQuery: vi.fn() }));

// Exercise the real server data adapter in jsdom while replacing only transport
// and the build-time server marker. This covers its actual failure fallback.
vi.mock("server-only", () => ({}));
vi.mock("convex/nextjs", () => ({ fetchQuery }));

const posts = [
  {
    slug: "saddle-position",
    title: { en: "Find your saddle position", nl: "Vind je zadelpositie" },
    excerpt: { en: "A useful starting point.", nl: "Een goed startpunt." },
    category: "bike-fit",
    featuredImageUrl: "/blog-saddle.jpg",
    featuredImageAlt: { en: "Saddle position", nl: "Zadelpositie" },
    publishedAt: Date.UTC(2026, 8, 15),
    updatedAt: Date.UTC(2026, 8, 15),
  },
  {
    slug: "reach-check",
    title: { en: "Check your reach", nl: "Controleer je reach" },
    category: "bike-fit",
    updatedAt: Date.UTC(2026, 8, 14),
  },
];

beforeEach(() => {
  fetchQuery.mockReset();
});

afterEach(() => {
  cleanup();
});

describe("LatestBlogSection server content", () => {
  it("omits the section when there are no published posts", async () => {
    fetchQuery.mockResolvedValueOnce({ page: [], isDone: true, continueCursor: "" });

    expect(await LatestBlogSection({ locale: "en" })).toBeNull();
    expect(fetchQuery).toHaveBeenCalledWith(expect.anything(), {
      numItems: 3,
      cursor: null,
      category: undefined,
    });
  });

  it("omits unavailable blog content when the backend request fails", async () => {
    fetchQuery.mockRejectedValueOnce(new Error("Blog backend unavailable"));

    expect(await LatestBlogSection({ locale: "en" })).toBeNull();
  });

  it.each(["en", "nl"] as const)(
    "renders asynchronously fetched %s posts with localized links and lazy images",
    async (locale) => {
      let resolveQuery!: (value: unknown) => void;
      fetchQuery.mockReturnValueOnce(new Promise((resolve) => { resolveQuery = resolve; }));

      const section = LatestBlogSection({ locale });
      resolveQuery({ page: posts, isDone: true, continueCursor: "" });
      render(await section);

      expect(screen.getAllByRole("article")).toHaveLength(2);
      for (const post of posts) {
        expect(screen.getByRole("link", { name: post.title[locale] }).getAttribute("href"))
          .toBe(`/${locale}/blog/${post.slug}`);
      }
      const image = screen.getByRole("img", { name: posts[0].featuredImageAlt![locale] });
      expect(image.getAttribute("loading")).toBe("lazy");
      expect(image.getAttribute("sizes")).toContain("400px");
      expect(document.querySelector('link[rel="preload"][as="image"]')).toBeNull();
      expect(screen.getByText(locale === "nl" ? "Bekijk alle artikelen" : "View all articles")
        .closest("a")?.getAttribute("href")).toBe(`/${locale}/blog`);
    }
  );
});
