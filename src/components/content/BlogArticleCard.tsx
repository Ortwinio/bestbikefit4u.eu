import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { Locale } from "@/i18n/config";
import { withLocalePrefix } from "@/i18n/navigation";
import {
  formatBlogDate,
  getBlogCategoryLabel,
  localizeBlogText,
  truncateBlogExcerpt,
  type BlogPostSummary,
} from "@/app/(public)/blog/data";

type BlogArticleCardProps = {
  post: BlogPostSummary;
  locale: Locale;
  priority?: boolean;
};

export function BlogArticleCard({ post, locale, priority = false }: BlogArticleCardProps) {
  const title = localizeBlogText(post.title, locale, post.slug);
  const excerpt = truncateBlogExcerpt(localizeBlogText(post.excerpt, locale));
  const date = formatBlogDate(post.publishedAt, locale);
  const categoryLabel = getBlogCategoryLabel(post.category, locale);
  const href = withLocalePrefix(`/blog/${post.slug}`, locale);

  return (
    <article className="public-card-surface-subtle flex h-full flex-col overflow-hidden rounded-[var(--radius-xl)] border border-border bg-card">
      {post.featuredImageUrl ? (
        <Link href={href} className="block overflow-hidden">
          <Image
            src={post.featuredImageUrl}
            alt={localizeBlogText(post.featuredImageAlt, locale, title)}
            width={800}
            height={450}
            priority={priority}
            className="aspect-video w-full object-cover transition-transform duration-300 hover:scale-[1.02]"
          />
        </Link>
      ) : null}
      <div className="flex flex-1 flex-col p-5">
        <div className="flex flex-wrap items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-primary">
          <span>{categoryLabel}</span>
          {date ? <span className="text-muted-foreground">{date}</span> : null}
        </div>
        <h2 className="mt-3 text-xl font-semibold tracking-tight text-foreground">
          <Link href={href} className="transition-colors hover:text-primary">
            {title}
          </Link>
        </h2>
        {excerpt ? (
          <p className="mt-3 flex-1 text-sm leading-6 text-muted-foreground">{excerpt}</p>
        ) : null}
        <Link
          href={href}
          className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-primary"
        >
          {locale === "nl" ? "Lees artikel" : "Read article"}
          <ArrowRight className="h-4 w-4" aria-hidden="true" />
        </Link>
      </div>
    </article>
  );
}
