import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/prototyper-ui/ui/button";
import { TrackedCtaLink } from "@/components/analytics/TrackedCtaLink";
import { getRequestLocale } from "@/i18n/request";
import { withLocalePrefix } from "@/i18n/navigation";
import { buildLocaleAlternates } from "@/i18n/metadata";
import { aboutCopy as content, aboutPresentation, aboutTrustPoints } from "@/i18n/marketing/about";
import styles from "./about.module.css";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getRequestLocale();
  const page = content[locale];
  const alternates = buildLocaleAlternates("/about", locale);

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

export default async function AboutPage() {
  const locale = await getRequestLocale();
  const page = content[locale];
  const presentation = aboutPresentation[locale];
  const pagePath = withLocalePrefix("/about", locale);

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        <section className={styles.hero} aria-labelledby="about-title">
          <div>
            <p className={styles.eyebrow}>{presentation.eyebrow}</p>
            <h1 id="about-title">{page.title}</h1>
            <p className={styles.lead}>{page.subtitle}</p>
            <ul className={styles.chips}>
              {presentation.chips.map((chip) => <li key={chip}>{chip}</li>)}
            </ul>
          </div>
          <Image
            src="/illustrations/06-meetset.webp"
            alt={presentation.imageAlt}
            width={640}
            height={400}
            sizes="(max-width: 800px) 100vw, 42vw"
            priority
          />
        </section>

        <section className={styles.section} aria-labelledby="about-principles">
          <p className={styles.eyebrow}>{presentation.trustEyebrow}</p>
          <h2 id="about-principles">{presentation.trustTitle}</h2>
          <p className={styles.intro}>{presentation.trustBody}</p>
          <div className={styles.three}>
            {aboutTrustPoints[locale].map((point) => (
              <article key={point.title} className={styles.principle}>
                <h3>{point.title}</h3>
                <p>{point.description}</p>
              </article>
            ))}
          </div>
        </section>

        <section className={styles.section} aria-labelledby="about-science">
          <p className={styles.eyebrow}>{presentation.scienceEyebrow}</p>
          <h2 id="about-science">{page.scienceTitle}</h2>
          <p className={styles.intro}>{page.scienceBody}</p>
          <div className={styles.two}>
            <article className={styles.card}>
              <h3>{page.saddleTitle}</h3>
              <p>{page.saddleBody1}</p>
              <p>{page.saddleBody2}</p>
              <ul>{page.saddleBullets.map((item) => <li key={item}>{item}</li>)}</ul>
            </article>
            <article className={styles.card}>
              <h3>{page.reachTitle}</h3>
              <p>{page.reachBody1}</p>
              <p>{page.reachBody2}</p>
              <ul>{page.reachBullets.map((item) => <li key={item}>{item}</li>)}</ul>
            </article>
            <article className={styles.drop}>
              <div>
                <h3>{page.dropTitle}</h3>
                <p>{page.dropBody1}</p>
                <p>{page.dropBody2}</p>
              </div>
              <ul className={styles.dropValues}>
                {page.dropBullets.map((item) => {
                  const [label, value] = item.split(": ");
                  const [range, unit] = value.split(/(?=mm)/);
                  return (
                    <li key={item}>
                      <span>{label}: </span>
                      <strong>{range}</strong><span className={styles.unit}>{unit}</span>
                    </li>
                  );
                })}
              </ul>
            </article>
          </div>
        </section>

        <section className={styles.section} aria-labelledby="about-components">
          <h2 id="about-components">{page.componentsTitle}</h2>
          <p className={styles.intro}>{page.componentsBody}</p>
          <div className={styles.two}>
            {page.componentCards.map((card) => (
              <article key={card.title} className={styles.card}>
                <h3>{card.title}</h3>
                <p>{card.text}</p>
              </article>
            ))}
          </div>
        </section>

        <section className={styles.inputs} aria-labelledby="about-inputs">
          <div>
            <h2 id="about-inputs">{page.considerTitle}</h2>
            <p>{page.considerBody}</p>
          </div>
          <ul>
            {page.considerBullets.map((item) => <li key={item}>{item}</li>)}
          </ul>
        </section>

        <section className={styles.section} aria-labelledby="about-guides">
          <h2 id="about-guides">{page.guideTitle}</h2>
          <p className={styles.intro}>{page.guideBody}</p>
          <div className={styles.three}>
            {page.guideLinks.map((link) => (
              <Link key={link.href} href={withLocalePrefix(link.href, locale)} className={styles.linkCard}>
                {link.label}
                <ArrowRight size={24} aria-hidden="true" />
              </Link>
            ))}
          </div>
        </section>

        <section className={styles.cta} aria-labelledby="about-cta">
          <div>
            <p className={styles.eyebrow}>{presentation.ctaEyebrow}</p>
            <h2 id="about-cta">{page.ctaTitle}</h2>
            <p>{page.ctaBody}</p>
          </div>
          <Button
            className={styles.primary}
            nativeButton={false}
            role="link"
            render={
              <TrackedCtaLink
                href={withLocalePrefix("/login", locale)}
                locale={locale}
                pagePath={pagePath}
                section="about_final_cta"
                ctaLabel={page.ctaButton}
              />
            }
          >
            {page.ctaButton}
          </Button>
        </section>
      </div>
    </div>
  );
}
