import { getGuideUpdatedDate } from "@/config/authorship";
import { ShortAnswer } from "@/components/calculators/CalculatorAnswerSection";
import { CollapsedArticle } from "@/components/content/CollapsedArticle";
import { GuideAttribution } from "./GuideAttribution";
import { Fragment } from "react";
import Image from "next/image";
import Link from "next/link";
import type { Locale } from "@/i18n/config";
import { bikeFittingLinks } from "@/i18n/marketing/bikeFittingLinks";
import { guideRewriteMessages } from "@/i18n/marketing/guideRewrite";
import { withLocalePrefix, switchLocalePathname } from "@/i18n/navigation";
import { BRAND } from "@/config/brand";
import { GuideBodyMarkdown } from "@/components/content/GuideBodyMarkdown";
import { PublicBreadcrumbs } from "@/components/public";
import { JsonLd } from "@/components/seo/JsonLd";
import { buildArticleSchema, buildBreadcrumbListSchema, buildFaqPageSchema, buildPersonSchema } from "@/lib/seo/jsonLd";
import { getRewriteFaqs, type GuideRewrite } from "@/lib/guides/rewrite-types";
import styles from "./Guides.module.css";

export function RewrittenGuide({ guide, locale }: { guide: GuideRewrite; locale: Locale }) {
  const article = guide[locale];
  const copy = guideRewriteMessages[locale];
  const pagePath = withLocalePrefix(`/guides/${guide.slug}`, locale);
  const url = new URL(pagePath, BRAND.siteUrl).href;
  const hero = `/illustrations/guides/${guide.illustration}.webp`;
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
            author: buildPersonSchema(locale),
            dateModified: getGuideUpdatedDate(guide.updatedAt),
            image: new URL(hero, BRAND.siteUrl).href,
          }),

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
              <ShortAnswer text={article.quickAnswer} locale={locale} />
            </section>
            <GuideAttribution locale={locale} updatedAt={guide.updatedAt} />
          </div>
          <Image
            src={hero} alt={article.alt} width={1600} height={1000}
            sizes="(max-width: 700px) calc(100vw - 40px), 500px" priority
          />
        </header>
        <article id="guide-content" className="mx-auto max-w-3xl pb-12">
          <CollapsedArticle content={article.markdown} locale={locale}
            render={content => <GuideBodyMarkdown content={content} locale={locale} preserveLinkLabels />} />
          <p className="mt-8 leading-relaxed text-muted-foreground">
            {bikeFittingLinks[locale].context}{" "}
            <Link href={switchLocalePathname("/bike-fitting", locale)}
              className="font-semibold text-primary underline underline-offset-4 focus-visible:outline-2
                focus-visible:outline-offset-4 focus-visible:outline-ring">
              {bikeFittingLinks[locale].guideLink}
            </Link>
          </p>
          <div data-usability="next-step" className="mt-12 rounded-3xl border border-border bg-card p-6 sm:p-8">
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
