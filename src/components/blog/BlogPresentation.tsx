import type { ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/prototyper-ui/ui/button";
import type { Locale } from "@/i18n/config";
import { withLocalePrefix } from "@/i18n/navigation";
import { blogMessages } from "@/i18n/marketing/blog";
import { formatBlogDate, getBlogCategoryLabel, localizeBlogText, type BlogPostSummary } from "@/app/(public)/blog/data";
import styles from "./blog.module.css";

export function BlogShell({ children }: { children: ReactNode }) {
  return <div className={styles.surface}><div className={styles.container}>{children}</div></div>;
}

export function BlogCta({ locale, detail = false }: { locale: Locale; detail?: boolean }) {
  const copy = blogMessages[locale];
  return (
    <section className={styles.cta}>
      <div><h2>{detail ? copy.detailCta : copy.indexCta}</h2><p>{detail ? copy.detailCtaCopy : copy.indexCtaCopy}</p></div>
      <div className={styles.actions}>
        <Button className={styles.primary} nativeButton={false} role="link" render={<Link href={withLocalePrefix("/calculators/bike-fit", locale)} />}>{detail ? copy.detailCalculator : copy.calculator}</Button>
        {detail ? <Button className={styles.secondary} variant="outline" nativeButton={false} role="link" render={<Link href={withLocalePrefix("/blog", locale)} />}>{copy.back}</Button> : null}
      </div>
    </section>
  );
}

export function BlogCard({ post, locale, priority }: { post: BlogPostSummary; locale: Locale; priority?: boolean }) {
  const title = localizeBlogText(post.title, locale, post.slug);
  const href = withLocalePrefix(`/blog/${post.slug}`, locale);
  const date = formatBlogDate(post.publishedAt, locale);
  return (
    <article className={styles.card}>
      {post.featuredImageUrl ? <Link href={href}><Image src={post.featuredImageUrl} alt={localizeBlogText(post.featuredImageAlt, locale, title)} width={800} height={450} sizes="(max-width: 639px) 100vw, (max-width: 1023px) 50vw, 400px" priority={priority} className={styles.cardImage} /></Link> : null}
      <div className={styles.cardContent}>
        <p className={styles.eyebrow}>{getBlogCategoryLabel(post.category, locale)}</p>
        <h3><Link href={href}>{title}</Link></h3>
        {date ? <time className={styles.number} dateTime={new Date(post.publishedAt!).toISOString()}>{date}</time> : null}
        {localizeBlogText(post.excerpt, locale) ? <p>{localizeBlogText(post.excerpt, locale)}</p> : null}
        <Link href={href} className={styles.readLink}>{blogMessages[locale].read}<ArrowRight size={18} aria-hidden="true" /></Link>
      </div>
    </article>
  );
}
