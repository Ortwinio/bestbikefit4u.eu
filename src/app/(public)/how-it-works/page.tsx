import { ContentDisclosure, ShortAnswer } from "@/components/calculators/CalculatorAnswerSection";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { TrackMarketingEventOnView } from "@/components/analytics/MarketingEventTracker";
import { TrackedCtaLink } from "@/components/analytics/TrackedCtaLink";
import { JsonLd } from "@/components/seo/JsonLd";
import { howItWorksCopy as copy, howItWorksPresentation } from "@/i18n/marketing/howItWorks";
import { buildLocaleAlternates } from "@/i18n/metadata";
import { withLocalePrefix } from "@/i18n/navigation";
import { getRequestLocale } from "@/i18n/request";
import { buildHowToSchema } from "@/lib/seo/jsonLd";
import styles from "./how-it-works.module.css";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getRequestLocale();
  const page = copy[locale];
  const alternates = buildLocaleAlternates("/how-it-works", locale);

  return {
    title: page.metadata.title,
    description: page.metadata.description,
    keywords: page.metadata.keywords,
    openGraph: {
      title: page.metadata.title,
      description: page.metadata.description,
      type: "website",
      url: alternates.canonical,
    },
    alternates,
  };
}

export default async function HowItWorksPage() {
  const locale = await getRequestLocale();
  const page = copy[locale];
  const presentation = howItWorksPresentation[locale];
  const pagePath = withLocalePrefix("/how-it-works", locale);
  const actions = (section: "hero" | "footer") => (
    <div className={styles.actions}>
      <TrackedCtaLink href={withLocalePrefix("/login", locale)} locale={locale} pagePath={pagePath}
        section={section === "hero" ? "how_it_works_primary_cta" : "how_it_works_footer_primary"}
        ctaLabel={page.primaryCta} conversionKey={section === "hero" ? "pricing_signup" : undefined}
        className={styles.primary}>{page.primaryCta}</TrackedCtaLink>
      <TrackedCtaLink href={withLocalePrefix("/calculators/bike-fit", locale)} locale={locale} pagePath={pagePath}
        section={section === "hero" ? "how_it_works_secondary_cta" : "how_it_works_footer_secondary"}
        ctaLabel={page.secondaryCta} className={styles.secondary}>{page.secondaryCta}</TrackedCtaLink>
    </div>
  );

  return (
    <div className={styles.page}>
      <TrackMarketingEventOnView eventType="how_it_works_view" locale={locale} pagePath={pagePath} section="how_it_works" />
      <JsonLd schema={[buildHowToSchema({ name: page.title, description: page.metadata.description, steps: page.steps.map((step) => step.title) })]} />
      <div className={styles.container}>
        <section className={styles.hero}>
          <div>
            <p className={styles.eyebrow}>{page.eyebrow}</p>
            <h1>{page.title}</h1>
            <ShortAnswer text={page.intro} locale={locale} />
            {actions("hero")}
          </div>
          <figure>
            <Image src="/illustrations/01-racefiets.webp" alt={presentation.heroAlt} width={900} height={600} priority sizes="(max-width: 800px) 100vw, 40vw" />
            <figcaption>{presentation.heroCaption}</figcaption>
          </figure>
        </section>
        <section className={styles.section} aria-labelledby="fit-process">
          <p className={styles.eyebrow}>{presentation.processEyebrow}</p>
          <h2 id="fit-process">{presentation.processTitle}</h2>
          <p className={styles.intro}>{page.sectionIntro}</p>
          <div className={styles.steps}>
            {page.steps.map((step, index) => (
              <article className={styles.step} key={step.title}>
                <span className={styles.number} aria-hidden="true">{String(index + 1).padStart(2, "0")}</span>
                <h3>{step.title.replace(/^(Stap|Step) \d+: /, "")}</h3>
                <p>{step.body}</p>
                {index === 0 && <Link href={withLocalePrefix("/measurement-guide", locale)}>{presentation.measurementLink}<span aria-hidden="true"> →</span></Link>}
              </article>
            ))}
          </div>
        </section>
        <ContentDisclosure title={presentation.prepHeading}>
          <section className={styles.preparation} aria-labelledby="fit-preparation">
            <Image src="/illustrations/06-meetset.webp" alt={presentation.prepAlt} width={900} height={600} sizes="(max-width: 800px) 100vw, 35vw" />
            <div>
              <p className={styles.eyebrow}>{presentation.prepEyebrow}</p>
              <h2 id="fit-preparation">{presentation.prepHeading}</h2>
              <article><h3>{page.prepTitle}</h3><p>{page.prepBody}</p></article>
              <article><h3>{page.afterTitle}</h3><p>{page.afterBody}</p></article>
            </div>
          </section>
        </ContentDisclosure>
        <section className={styles.section} aria-labelledby="fit-help">
          <p className={styles.eyebrow}>{presentation.helpEyebrow}</p>
          <h2 id="fit-help">{presentation.helpTitle}</h2>
          <p className={styles.intro}>{presentation.helpIntro}</p>
          <div className={styles.links}>
            {presentation.links.map((link) => (
              <Link key={link.href} href={withLocalePrefix(link.href, locale)}>
                <span className={styles.linkTitle}>{link.title}</span><span>{link.body}</span><ArrowUpRight aria-hidden="true" />
              </Link>
            ))}
          </div>
        </section>
        <section data-usability="next-step" className={styles.cta} aria-labelledby="fit-next-step">
          <div>
            <p className={styles.eyebrow}>{presentation.ctaEyebrow}</p>
            <h2 id="fit-next-step">{presentation.ctaTitle}</h2>
            <p>{presentation.ctaBody}</p>
          </div>
          {actions("footer")}
        </section>
      </div>
    </div>
  );
}
