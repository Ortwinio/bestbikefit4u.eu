import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { BookOpen } from "lucide-react";
import { BlogCard, BlogCta, BlogShell } from "@/components/blog/BlogPresentation";
import styles from "@/components/blog/blog.module.css";
import { PublicBreadcrumbs } from "@/components/public";
import { blogMessages } from "@/i18n/marketing/blog";
import { JsonLd } from "@/components/seo/JsonLd";
import { BRAND } from "@/config/brand";
import { buildLocaleAlternates } from "@/i18n/metadata";
import { withLocalePrefix } from "@/i18n/navigation";
import { getRequestLocale } from "@/i18n/request";
import { buildBreadcrumbListSchema } from "@/lib/seo/jsonLd";
import {
  getBlogCategoryLabel,
  listAllPublishedBlogPosts,
  localizeBlogText,
  truncateBlogExcerpt,
} from "./data";

export const revalidate = 900;

type BlogIndexProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

const PAGE_SIZE = 9;

function getSearchParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

function parsePage(value: string | undefined) {
  const parsed = Number.parseInt(value ?? "1", 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 1;
}

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getRequestLocale();
  const alternates = buildLocaleAlternates("/blog", locale);
  const description = blogMessages[locale].metadataDescription;

  return {
    title: "Blog - BestBikeFit4U",
    description,
    openGraph: {
      title: "Blog - BestBikeFit4U",
      description,
      type: "website",
      url: alternates.canonical,
    },
    alternates,
  };
}

export default async function BlogIndexPage({ searchParams }: BlogIndexProps) {
  const locale = await getRequestLocale();
  const copy = blogMessages[locale];
  const resolvedSearchParams = (await searchParams) ?? {};
  const selectedCategory = getSearchParam(resolvedSearchParams.category);
  const currentPage = parsePage(getSearchParam(resolvedSearchParams.page));
  const allPosts = await listAllPublishedBlogPosts();
  const categories = [...new Set(allPosts.map((post) => post.category).filter(Boolean))].sort();
  const filteredPosts = selectedCategory
    ? allPosts.filter((post) => post.category === selectedCategory)
    : allPosts;
  const pageCount = Math.max(1, Math.ceil(filteredPosts.length / PAGE_SIZE));
  const safePage = Math.min(currentPage, pageCount);
  const posts = filteredPosts.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);
  const blogUrl = new URL(withLocalePrefix("/blog", locale), BRAND.siteUrl).toString();
  const homeUrl = new URL(withLocalePrefix("/", locale), BRAND.siteUrl).toString();

  return (
    <BlogShell>
      <JsonLd
        schema={buildBreadcrumbListSchema([
          { name: "Home", item: homeUrl },
          { name: "Blog", item: blogUrl },
        ])}
      />

      <PublicBreadcrumbs items={[{ label: "Home", href: withLocalePrefix("/", locale) }, { label: copy.title }]} />
      <section className={styles.hero}>
        <div>
          <p className={styles.eyebrow}>{copy.eyebrow}</p>
          <h1>{copy.title}</h1>
          <p className={styles.lead}>{copy.intro}</p>
          <span className={styles.tag}><span className={styles.number}>{allPosts.length.toLocaleString(locale)}</span> {copy.articles}</span>
        </div>
        <Image className={styles.heroImage} src="/illustrations/06-meetset.webp" alt={copy.imageAlt} width={552} height={300} priority />
      </section>

      <section aria-labelledby="blog-articles">
        <h2 id="blog-articles" className={styles.sectionTitle}>{copy.sectionTitle}</h2>
        <p className={styles.sectionCopy}>{copy.sectionCopy}</p>
        {categories.length > 0 ? (
          <nav className={styles.filters} aria-label={copy.filters}>
            <Link className={styles.pill} aria-current={!selectedCategory ? "page" : undefined} href={withLocalePrefix("/blog", locale)}>{copy.all}</Link>
            {categories.map((category) => (
              <Link
                key={category}
                className={styles.pill}
                aria-current={selectedCategory === category ? "page" : undefined}
                href={`${withLocalePrefix("/blog", locale)}?category=${encodeURIComponent(category)}`}
              >
                {getBlogCategoryLabel(category, locale)}
              </Link>
            ))}
          </nav>
        ) : null}

        {posts.length > 0 ? (
          <>
            <div className={styles.cards}>
              {posts.map((post, index) => (
                <BlogCard
                  key={post.slug}
                  post={{
                    ...post,
                    excerpt: {
                      en: truncateBlogExcerpt(localizeBlogText(post.excerpt, "en")),
                      nl: truncateBlogExcerpt(localizeBlogText(post.excerpt, "nl")),
                    },
                  }}
                  locale={locale}
                  priority={index < 2}
                />
              ))}
            </div>
            {pageCount > 1 ? (
              <nav className={styles.pagination} aria-label={copy.pages}>
                {Array.from({ length: pageCount }, (_, index) => index + 1).map((page) => {
                  const params = new URLSearchParams();
                  if (selectedCategory) {
                    params.set("category", selectedCategory);
                  }
                  if (page > 1) {
                    params.set("page", String(page));
                  }
                  const query = params.toString();

                  return (
                    <Link
                      key={page}
                      className={styles.pill}
                      aria-label={`${copy.page} ${page}`}
                      aria-current={page === safePage ? "page" : undefined}
                      href={`${withLocalePrefix("/blog", locale)}${query ? `?${query}` : ""}`}
                    >
                      {page}
                    </Link>
                  );
                })}
              </nav>
            ) : null}
          </>
        ) : (
          <div className={styles.empty}>
            <div className={styles.emptyIcon}><BookOpen size={36} aria-hidden="true" /></div>
            <div><h3>{copy.emptyTitle}</h3><p>{copy.emptyCopy}</p></div>
          </div>
        )}
      </section>
      <BlogCta locale={locale} />
    </BlogShell>
  );
}
