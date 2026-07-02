import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { BlogBodyMarkdown } from "@/components/content/BlogBodyMarkdown";
import { BlogTableOfContents } from "@/components/content/BlogTableOfContents";
import { Button } from "@/components/prototyper-ui/ui/button";
import {
  PublicBreadcrumbs,
  PublicCtaBand,
  PublicPageShell,
  PublicSection,
} from "@/components/public";
import { JsonLd } from "@/components/seo/JsonLd";
import { RelatedLinksSection } from "@/components/seo/RelatedLinksSection";
import { BRAND } from "@/config/brand";
import { getGuideBacklog } from "@/lib/guides/backlog";
import { buildLocaleAlternates } from "@/i18n/metadata";
import { withLocalePrefix } from "@/i18n/navigation";
import { getRequestLocale } from "@/i18n/request";
import {
  buildBlogPostingSchema,
  buildBreadcrumbListSchema,
} from "@/lib/seo/jsonLd";
import {
  formatBlogDate,
  getBlogCategoryLabel,
  getPublishedPostData,
  listPublishedBlogSlugs,
  localizeBlogText,
} from "./data";
import { listAllPublishedBlogPosts } from "../data";

export const revalidate = 900;

type BlogArticleProps = {
  params: Promise<{ slug: string }>;
};

function estimateReadingTime(content: string) {
  const wordCount = content.trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.ceil(wordCount / 200));
}

function normalizeGuidePath(path: string) {
  return path.replace(/^\/(en|nl)(?=\/|$)/, "") || "/";
}

function getGuideLink(path: string, locale: "en" | "nl") {
  const normalizedPath = normalizeGuidePath(path);
  const guide = getGuideBacklog(locale).find((entry) => entry.path === normalizedPath);

  return {
    href: normalizedPath,
    label: guide?.pageTitle ?? normalizedPath.replace(/^\/guides\//, "").replace(/-/g, " "),
    description: guide?.pageBrief,
  };
}

export async function generateStaticParams() {
  const slugs = await listPublishedBlogSlugs();
  return slugs.map(({ slug }) => ({ slug }));
}

export async function generateMetadata({ params }: BlogArticleProps): Promise<Metadata> {
  const locale = await getRequestLocale();
  const { slug } = await params;
  const post = await getPublishedPostData(slug);

  if (!post) {
    return {
      title: locale === "nl" ? "Pagina niet gevonden" : "Page not found",
      robots: { index: false, follow: false },
    };
  }

  const title = localizeBlogText(post.metaTitle, locale, localizeBlogText(post.title, locale, slug));
  const description = localizeBlogText(post.metaDescription, locale);
  const alternates = buildLocaleAlternates(`/blog/${slug}`, locale);
  const canonical = post.canonicalUrl ?? alternates.canonical;
  const ogImage = post.ogImageUrl ?? post.featuredImageUrl;

  return {
    title,
    description,
    alternates: {
      ...alternates,
      canonical,
    },
    openGraph: {
      type: "article",
      title: localizeBlogText(post.ogTitle, locale, title),
      description: localizeBlogText(post.ogDescription, locale, description),
      url: canonical,
      images: ogImage
        ? [
            {
              url: ogImage,
              alt: localizeBlogText(post.ogImageAlt ?? post.featuredImageAlt, locale, title),
            },
          ]
        : undefined,
      publishedTime: post.publishedAt
        ? new Date(post.publishedAt).toISOString()
        : undefined,
      modifiedTime: new Date(post.updatedAt).toISOString(),
      authors: post.authorName ? [post.authorName] : undefined,
    },
    robots: post.robotsIndex === false ? { index: false, follow: false } : undefined,
  };
}

export default async function BlogArticlePage({ params }: BlogArticleProps) {
  const locale = await getRequestLocale();
  const isNl = locale === "nl";
  const { slug } = await params;
  const post = await getPublishedPostData(slug);

  if (!post) {
    notFound();
  }

  const title = localizeBlogText(post.title, locale, slug);
  const h1 = localizeBlogText(post.h1, locale, title);
  const body = localizeBlogText(post.body, locale);
  const description = localizeBlogText(post.metaDescription, locale);
  const categoryLabel = getBlogCategoryLabel(post.category, locale);
  const pagePath = withLocalePrefix(`/blog/${slug}`, locale);
  const pageUrl = new URL(pagePath, BRAND.siteUrl).toString();
  const blogUrl = new URL(withLocalePrefix("/blog", locale), BRAND.siteUrl).toString();
  const homeUrl = new URL(withLocalePrefix("/", locale), BRAND.siteUrl).toString();
  const publishedDate = formatBlogDate(post.publishedAt, locale);
  const readingTime = estimateReadingTime(body);
  const imageUrl = post.featuredImageUrl;
  const imageAlt = localizeBlogText(post.featuredImageAlt, locale, title);
  const relatedPostSlugs = new Set(post.relatedPostSlugs ?? []);
  const allPosts = relatedPostSlugs.size > 0 ? await listAllPublishedBlogPosts() : [];
  const relatedPosts = allPosts
    .filter((candidate) => relatedPostSlugs.has(candidate.slug) && candidate.slug !== slug)
    .map((candidate) => ({
      href: `/blog/${candidate.slug}`,
      label: localizeBlogText(candidate.title, locale, candidate.slug),
      description: localizeBlogText(candidate.excerpt, locale),
    }));
  const relatedGuides = (post.relatedGuidePaths ?? []).map((path) => getGuideLink(path, locale));

  return (
    <PublicPageShell>
      <JsonLd
        schema={[
          buildBlogPostingSchema({
            headline: h1,
            description,
            url: pageUrl,
            inLanguage: locale,
            image: post.ogImageUrl ?? imageUrl,
            datePublished: post.publishedAt
              ? new Date(post.publishedAt).toISOString()
              : undefined,
            dateModified: new Date(post.updatedAt).toISOString(),
            authorName: post.authorName,
          }),
          buildBreadcrumbListSchema([
            { name: "Home", item: homeUrl },
            { name: "Blog", item: blogUrl },
            {
              name: categoryLabel,
              item: `${blogUrl}?category=${encodeURIComponent(post.category)}`,
            },
            { name: h1, item: pageUrl },
          ]),
        ]}
      />

      <PublicBreadcrumbs
        items={[
          { label: "Home", href: withLocalePrefix("/", locale) },
          { label: "Blog", href: withLocalePrefix("/blog", locale) },
          {
            label: categoryLabel,
            href: `${withLocalePrefix("/blog", locale)}?category=${encodeURIComponent(post.category)}`,
          },
          { label: h1 },
        ]}
      />

      <article className="mt-6">
        <header className="mx-auto max-w-4xl">
          <p className="text-sm font-semibold uppercase tracking-[0.22em] text-primary">
            {categoryLabel}
          </p>
          <h1 className="mt-4 text-balance text-4xl font-bold tracking-tight text-foreground md:text-5xl">
            {h1}
          </h1>
          <p className="mt-5 text-base leading-7 text-muted-foreground">
            {publishedDate ? `${publishedDate} · ` : null}
            {readingTime} {isNl ? "min lezen" : "min read"}
            {post.authorName ? ` · ${isNl ? "door" : "by"} ${post.authorName}` : null}
          </p>
          {localizeBlogText(post.excerpt, locale) ? (
            <p className="mt-5 text-lg leading-8 text-muted-foreground">
              {localizeBlogText(post.excerpt, locale)}
            </p>
          ) : null}
        </header>

        {imageUrl ? (
          <div className="mt-8 overflow-hidden rounded-[var(--radius-xl)] border border-border/70">
            <Image
              src={imageUrl}
              alt={imageAlt}
              width={1200}
              height={630}
              priority
              className="aspect-[1200/630] w-full object-cover"
            />
          </div>
        ) : null}

        <div className="mt-10 grid gap-8 lg:grid-cols-[minmax(0,1fr)_280px]">
          <PublicSection as="div" contentClassName="px-5 py-6 sm:px-7 sm:py-8">
            <BlogBodyMarkdown content={body} />
          </PublicSection>
          {post.tableOfContents ? (
            <aside className="lg:sticky lg:top-24 lg:self-start">
              <BlogTableOfContents
                content={body}
                title={isNl ? "In dit artikel" : "In this article"}
              />
            </aside>
          ) : null}
        </div>

        <RelatedLinksSection
          title={isNl ? "Gerelateerde artikelen" : "Related articles"}
          links={relatedPosts}
          locale={locale}
        />

        <RelatedLinksSection
          title={isNl ? "Gerelateerde gidsen" : "Related guides"}
          links={relatedGuides}
          locale={locale}
        />
      </article>

      <PublicCtaBand
        className="mt-10"
        eyebrow={isNl ? "Volgende stap" : "Next step"}
        title={isNl ? "Maak je setup concreet" : "Make your setup practical"}
        description={
          isNl
            ? "Gebruik de calculator om dit artikel te vertalen naar persoonlijke fitdoelen."
            : "Use the calculator to turn this article into personal fit targets."
        }
        actions={
          <>
            <Button render={<Link href={withLocalePrefix("/calculators/bike-fit", locale)} />}>
              {isNl ? "Open calculator" : "Open calculator"}
            </Button>
            <Button variant="outline" render={<Link href={withLocalePrefix("/blog", locale)} />}>
              {isNl ? "Alle artikelen" : "All articles"}
            </Button>
          </>
        }
      />
    </PublicPageShell>
  );
}
