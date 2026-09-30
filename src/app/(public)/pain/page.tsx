import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { TrackMarketingEventOnView } from "@/components/analytics/MarketingEventTracker";
import { TrackedCtaLink } from "@/components/analytics/TrackedCtaLink";
import { PAIN_PAGES } from "@/content/painPages";
import { painPresentation } from "@/i18n/marketing/pain";
import { buildLocaleAlternates } from "@/i18n/metadata";
import { withLocalePrefix } from "@/i18n/navigation";
import { getRequestLocale } from "@/i18n/request";
import styles from "./pain.module.css";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getRequestLocale();
  const copy = painPresentation[locale];
  const alternates = buildLocaleAlternates("/pain", locale);
  return {
    title: copy.metadataTitle,
    description: copy.metadataDescription,
    openGraph: {
      title: copy.metadataTitle,
      description: copy.metadataDescription,
      type: "website",
      url: alternates.canonical,
    },
    alternates,
  };
}

export default async function PainIndexPage() {
  const locale = await getRequestLocale();
  const copy = painPresentation[locale];
  const pagePath = withLocalePrefix("/pain", locale);
  const calculator = (section: string) => (
    <TrackedCtaLink
      href={withLocalePrefix("/calculators/bike-fit", locale)}
      locale={locale}
      pagePath={pagePath}
      section={section}
      ctaLabel={copy.calculator}
      className={section.includes("band") ? styles.primary : styles.secondary}
    >
      {copy.calculator}
    </TrackedCtaLink>
  );

  return (
    <div className={styles.page}>
      <TrackMarketingEventOnView
        eventType="pain_page_view" locale={locale} pagePath={pagePath} section="pain_index"
      />
      <div className={styles.container}>
        <section className={styles.hero}>
          <div>
            <p className={styles.eyebrow}>{copy.eyebrow}</p>
            <h1>{copy.title}</h1>
            <p className={styles.lead}>{copy.intro}</p>
            <div className={styles.actions}>
              <Link className={styles.primary} href="#klachten">
                {copy.choose}<ArrowRight size={18} aria-hidden="true" />
              </Link>
              {calculator("pain_index_primary_cta")}
            </div>
          </div>
          <Image src="/illustrations/01-racefiets.webp" width={568} height={370} alt={copy.indexImage} priority />
        </section>
        <aside className={styles.disclaimer}>
          <h2>{copy.disclaimerTitle}</h2><p>{copy.disclaimer}</p>
        </aside>
        <section id="klachten" className={styles.section}>
          <div className={styles.sectionHeading}>
            <div><p className={styles.eyebrow}>{copy.symptomsEyebrow}</p><h2>{copy.symptomsTitle}</h2></div>
            <p>{copy.symptomsIntro}</p>
          </div>
          <div className={styles.cards}>
            {PAIN_PAGES.map((page, index) => (
              <article className={styles.card} key={page.slug}>
                <span className={styles.number}>{String(index + 1).padStart(2, "0")}</span>
                <h3>{copy.labels[page.painArea]}</h3><p>{copy.summaries[page.painArea]}</p>
                <Link
                  href={withLocalePrefix(`/pain/${page.slug}`, locale)} className={styles.textLink}
                  aria-label={`${copy.openPage}: ${copy.labels[page.painArea]}`}
                >
                  {copy.openPage}<ArrowRight size={18} aria-hidden="true" />
                </Link>
              </article>
            ))}
            <article className={`${styles.card} ${styles.limits}`}>
              <h3>{copy.limitsTitle}</h3><p>{copy.limits}</p>
            </article>
          </div>
        </section>
        <section className={styles.section}>
          <p className={styles.eyebrow}>{copy.processEyebrow}</p><h2>{copy.processTitle}</h2>
          <div className={styles.process}>
            {copy.process.map((step, index) => (
              <article key={step.title}>
                <span className={styles.ordinal}>{String(index + 1).padStart(2, "0")}</span>
                <h3>{step.title}</h3><p>{step.body}</p>
              </article>
            ))}
          </div>
        </section>
        <section className={styles.section}>
          <p className={styles.eyebrow}>{copy.toolsEyebrow}</p><h2>{copy.toolsTitle}</h2>
          <div className={styles.tools}>
            {copy.tools.map((tool) => (
              <Link key={tool.href} href={withLocalePrefix(tool.href, locale)} className={styles.tool}>
                <div><h3>{tool.title}</h3><p>{tool.body}</p></div><ArrowRight size={24} aria-hidden="true" />
              </Link>
            ))}
          </div>
        </section>
        <section className={styles.cta}>
          <div><h2>{copy.ctaTitle}</h2><p>{copy.ctaIntro}</p></div>
          <div className={styles.actions}>
            {calculator("pain_index_band_primary_cta")}
            <TrackedCtaLink
              href={withLocalePrefix("/case-study", locale)} locale={locale} pagePath={pagePath}
              section="pain_index_band_secondary_cta" ctaLabel={copy.caseStudy} className={styles.secondary}
            >
              {copy.caseStudy}
            </TrackedCtaLink>
          </div>
        </section>
      </div>
    </div>
  );
}
