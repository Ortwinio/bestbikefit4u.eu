import { currentSiteUrl } from "@/lib/seo/siteUrl";
import { socialImage } from "@/lib/seo/social-image";
import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { BlogBodyMarkdown } from "@/components/content/BlogBodyMarkdown";
import { BlogTableOfContents } from "@/components/content/BlogTableOfContents";
import { PublicBreadcrumbs } from "@/components/public";
import { BlogCta, BlogShell } from "@/components/blog/BlogPresentation";
import styles from "@/components/blog/blog.module.css";
import { blogMessages } from "@/i18n/marketing/blog";
import { JsonLd } from "@/components/seo/JsonLd";
import { RelatedLinksSection } from "@/components/seo/RelatedLinksSection";
import { BRAND } from "@/config/brand";
import { getGuideBacklog } from "@/lib/guides/backlog";
import { getGuideLinkLabel } from "@/lib/guides/content";
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
    label: locale === "nl"
      ? getGuideLinkLabel(normalizedPath, locale)
      : guide?.pageTitle ?? normalizedPath.replace(/^\/guides\//, "").replace(/-/g, " "),
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
  const canonical = currentSiteUrl(post.canonicalUrl ?? alternates.canonical);
  const ogImage = post.ogImageUrl ?? post.featuredImageUrl;

  return {
    title,
    description,
    twitter: {
      card: "summary_large_image", title, description,
      images: ogImage ? [socialImage(ogImage,
        localizeBlogText(post.ogImageAlt ?? post.featuredImageAlt, locale, title))] : undefined,
    },
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
            socialImage(ogImage, localizeBlogText(post.ogImageAlt ?? post.featuredImageAlt, locale, title)),
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
  const copy = blogMessages[locale];
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
    <BlogShell>
      <JsonLd
        schema={[
          buildBlogPostingSchema({
            headline: h1,
            description,
            url: pageUrl,
            inLanguage: locale,
            image: currentSiteUrl(post.ogImageUrl ?? imageUrl),
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

      <article>
        <header className={styles.articleHeader}>
          <p className={styles.eyebrow}>
            {categoryLabel}
          </p>
          <h1>
            {h1}
          </h1>
          <div className={styles.metadata}>
            {publishedDate ? <time className={styles.number} dateTime={new Date(post.publishedAt!).toISOString()}>{publishedDate}</time> : null}
            <span><span className={styles.number}>{readingTime}</span> {copy.readTime}</span>
            {post.authorName ? <span>{copy.by} {post.authorName}</span> : null}
          </div>
          {localizeBlogText(post.excerpt, locale) ? (
            <p className={styles.lead}>
              {localizeBlogText(post.excerpt, locale)}
            </p>
          ) : null}
        </header>

        {imageUrl ? (
          <div>
            <Image
              src={imageUrl}
              alt={imageAlt}
              width={1200}
              height={630}
              priority
              sizes="(max-width: 639px) 100vw, (max-width: 1199px) 90vw, 1200px"
              className={styles.articleImage}
            />
          </div>
        ) : null}

        <div className={`${styles.bodyGrid} ${!post.tableOfContents ? styles.bodyGridSingle : ""}`}>
          <div className={styles.body}>
            <BlogBodyMarkdown content={body} />
          </div>
          {post.tableOfContents ? (
            <aside className={styles.toc}>
              <BlogTableOfContents
                content={body}
                title={copy.toc}
              />
            </aside>
          ) : null}
        </div>

        <div className={styles.related}>
        <RelatedLinksSection
          title={copy.relatedPosts}
          links={relatedPosts}
          locale={locale}
        />

        <RelatedLinksSection
          title={copy.relatedGuides}
          links={relatedGuides}
          locale={locale}
        />
        </div>
      </article>
      <BlogCta locale={locale} detail />
    </BlogShell>
  );
}
