import Image from "next/image";
import Link from "next/link";
import { ArrowRight, CircleAlert } from "lucide-react";
import { TrackMarketingEventOnView } from "@/components/analytics/MarketingEventTracker";
import { TrackedCtaLink } from "@/components/analytics/TrackedCtaLink";
import { JsonLd } from "@/components/seo/JsonLd";
import { BRAND } from "@/config/brand";
import type { PainPageCopy } from "@/content/painPages";
import type { Locale } from "@/i18n/config";
import { painPresentation } from "@/i18n/marketing/pain";
import { withLocalePrefix } from "@/i18n/navigation";
import { buildArticleSchema, buildBreadcrumbListSchema, buildFaqPageSchema } from "@/lib/seo/jsonLd";
import styles from "./pain.module.css";

export function PainDetail({ locale, slug, copy }: { locale: Locale; slug: string; copy: PainPageCopy }) {
  const presentation = painPresentation[locale];
  const pagePath = withLocalePrefix(`/pain/${slug}`, locale);
  const pageUrl = new URL(pagePath, BRAND.siteUrl).toString();
  const homePath = withLocalePrefix("/", locale);
  const indexPath = withLocalePrefix("/pain", locale);
  const actions = (footer = false) => (
    <div className={styles.actions}>
      <TrackedCtaLink
        href={withLocalePrefix("/login", locale)} locale={locale} pagePath={pagePath}
        section={footer ? "pain_footer_primary_cta" : "pain_primary_cta"}
        ctaLabel={copy.primaryCta} conversionKey="pricing_signup" className={styles.primary}
      >
        {copy.primaryCta}
      </TrackedCtaLink>
      <TrackedCtaLink
        href={withLocalePrefix("/case-study", locale)} locale={locale} pagePath={pagePath}
        section={footer ? "pain_footer_secondary_cta" : "pain_secondary_cta"}
        ctaLabel={copy.secondaryCta} className={styles.secondary}
      >
        {copy.secondaryCta}
      </TrackedCtaLink>
    </div>
  );
  return (
    <div className={`${styles.page} ${styles.detail}`}>
      <TrackMarketingEventOnView eventType="pain_page_view" locale={locale} pagePath={pagePath} section={slug} />
      <JsonLd schema={[
        buildArticleSchema({ headline: copy.title, description: copy.intro, url: pageUrl, inLanguage: locale }),
        buildFaqPageSchema(copy.faqs),
        buildBreadcrumbListSchema([
          { name: presentation.home, item: new URL(homePath, BRAND.siteUrl).toString() },
          { name: presentation.painIndex, item: new URL(indexPath, BRAND.siteUrl).toString() },
          { name: copy.title, item: pageUrl },
        ]),
      ]} />
      <div className={styles.container}>
        <nav className={styles.breadcrumbs} aria-label={presentation.breadcrumbs}>
          <Link href={homePath}>{presentation.home}</Link><span aria-hidden="true">/</span>
          <Link href={indexPath}>{presentation.painIndex}</Link><span aria-hidden="true">/</span>
          <span aria-current="page">{copy.title}</span>
        </nav>
        <section className={styles.hero}>
          <div>
            <p className={styles.eyebrow}>{copy.categoryLabel}</p>
            <h1>{copy.title}</h1><p className={styles.lead}>{copy.intro}</p>{actions()}
          </div>
          <Image
            src="/illustrations/02-zadelhoogte-meten.webp" width={568} height={460}
            alt={presentation.detailImage} priority
          />
        </section>
        <section className={styles.section}>
          <p className={styles.eyebrow}>{presentation.detailEyebrow}</p><h2>{copy.symptomTitle}</h2>
          <div className={styles.symptoms}>
            {copy.symptomBullets.map((symptom) => (
              <article className={styles.card} key={symptom}>
                <span className={styles.icon}><CircleAlert size={24} aria-hidden="true" /></span><p>{symptom}</p>
              </article>
            ))}
          </div>
          <aside className={styles.checklist}>
            <h3>{copy.riderChecklistTitle}</h3>
            <ul>{copy.riderChecklist.map((item) => <li key={item}>{item}</li>)}</ul>
          </aside>
        </section>
        <section className={`${styles.section} ${styles.split}`}>
          <div>
            <p className={styles.eyebrow}>{presentation.checkEyebrow}</p>
            <h2>{presentation.checkTitle}</h2><p className={styles.intro}>{presentation.checkIntro}</p>
            {locale === "nl" && (
              <Link href={withLocalePrefix("/fiets-afstellen", locale)} className={styles.textLink}>
                {presentation.setup}<ArrowRight size={18} aria-hidden="true" />
              </Link>
            )}
          </div>
          <div>
            <h3 className={styles.checkTitle}>{copy.fitTitle}</h3>
            <ol className={styles.adjustments}>
              {copy.fitBullets.map((item, index) => (
                <li key={item}>
                  <span className={styles.number}>{String(index + 1).padStart(2, "0")}</span><p>{item}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>
        <aside className={styles.support}>
          <div><p className={styles.eyebrow}>{presentation.supportEyebrow}</p><h2>{presentation.supportTitle}</h2></div>
          <p>{presentation.support}</p>
        </aside>
        <section className={`${styles.section} ${styles.split}`}>
          <h2>{copy.faqTitle}</h2>
          <div className={styles.faq}>
            {copy.faqs.map((faq, index) => (
              <details key={faq.q} open={index === 0}>
                <summary>{faq.q}</summary><p>{faq.a}</p>
              </details>
            ))}
          </div>
        </section>
        <section className={styles.section}>
          <h2>{copy.relatedTitle}</h2>
          <div className={styles.related}>
            {copy.relatedLinks.map((link) => (
              <Link className={styles.textLink} key={link.href} href={withLocalePrefix(link.href, locale)}>
                {link.label}<ArrowRight size={18} aria-hidden="true" />
              </Link>
            ))}
          </div>
        </section>
        <section className={styles.cta}>
          <div><h2>{presentation.detailCtaTitle}</h2><p>{presentation.detailCtaIntro}</p></div>{actions(true)}
        </section>
      </div>
    </div>
  );
}
