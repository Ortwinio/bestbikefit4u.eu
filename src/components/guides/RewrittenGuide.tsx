import { Fragment } from "react";
import Image from "next/image";
import Link from "next/link";
import type { Locale } from "@/i18n/config";
import { guideRewriteMessages } from "@/i18n/marketing/guideRewrite";
import { withLocalePrefix } from "@/i18n/navigation";
import { BRAND } from "@/config/brand";
import { GuideBodyMarkdown } from "@/components/content/GuideBodyMarkdown";
import { PublicBreadcrumbs } from "@/components/public";
import { JsonLd } from "@/components/seo/JsonLd";
import { buildArticleSchema, buildBreadcrumbListSchema, buildFaqPageSchema } from "@/lib/seo/jsonLd";
import { getRewriteFaqs, type GuideRewrite } from "@/lib/guides/rewrite-types";
import styles from "./Guides.module.css";

export function RewrittenGuide({ guide, locale }: { guide: GuideRewrite; locale: Locale }) {
  const article = guide[locale];
  const copy = guideRewriteMessages[locale];
  const pagePath = withLocalePrefix(`/guides/${guide.slug}`, locale);
  const url = new URL(pagePath, BRAND.siteUrl).href;
  const hero = `/illustrations/guides/${guide.illustration}.webp`;
  const date = new Intl.DateTimeFormat(locale === "nl" ? "nl-NL" : "en-GB", {
    day: "numeric", month: "long", year: "numeric", timeZone: "UTC",
  }).format(new Date(`${guide.updatedAt}T00:00:00Z`));
  const breadcrumbs = [
    { label: copy.home, href: withLocalePrefix("/", locale) },
    { label: copy.guides, href: withLocalePrefix("/guides", locale) },
    { label: article.title, href: pagePath },
  ];

  return (
    <div className={styles.page} data-guide-source={guide.source ?? "code-rewrite"}>
      <JsonLd schema={[
        {
          ...buildArticleSchema({
            headline: article.title,
            description: article.metaDescription,
            url,
            inLanguage: locale,
            image: new URL(hero, BRAND.siteUrl).href,
          }),
          dateModified: guide.updatedAt,
        },
        buildFaqPageSchema(getRewriteFaqs(article.markdown)),
        buildBreadcrumbListSchema(breadcrumbs.map(({ label, href }) => ({
          name: label, item: new URL(href, BRAND.siteUrl).href,
        }))),
      ]} />
      <div className={styles.container}>
        <PublicBreadcrumbs items={breadcrumbs} />
        <header className={styles.hero}>
          <div>
            <p className={styles.eyebrow}>{copy.guide}</p>
            <h1 className="max-sm:text-[36px]!">
              {article.title.split(/(?<=endurance)(?=geometrie)/).map((part, index) => (
                <Fragment key={part}>{index > 0 ? <wbr /> : null}{part}</Fragment>
              ))}
            </h1>
            <section aria-labelledby="guide-quick-title" className="mt-6">
              <h2 id="guide-quick-title" className="text-lg font-semibold">{copy.quick}</h2>
              <p>{article.quickAnswer}</p>
            </section>
            <div className="text-sm text-muted-foreground">
              {copy.updated}: <time dateTime={guide.updatedAt}>{date}</time>
            </div>
          </div>
          <Image
            src={hero} alt={article.alt} width={1600} height={1000}
            sizes="(max-width: 700px) calc(100vw - 40px), 500px" priority
          />
        </header>
        <article id="guide-content" className="mx-auto max-w-3xl pb-12">
          <GuideBodyMarkdown content={article.markdown} locale={locale} preserveLinkLabels />
          <div className="mt-12 rounded-3xl border border-border bg-card p-6 sm:p-8">
            <p className="text-lg text-foreground">{article.cta}</p>
            <Link
              href={withLocalePrefix(article.ctaTarget, locale)}
              className="mt-5 inline-flex min-h-11 items-center justify-center rounded-full bg-primary px-6 py-3
                text-center font-semibold text-primary-foreground focus-visible:outline-2
                focus-visible:outline-offset-4 focus-visible:outline-ring"
            >
              {article.ctaLabel}
            </Link>
          </div>
        </article>
      </div>
    </div>
  );
}
