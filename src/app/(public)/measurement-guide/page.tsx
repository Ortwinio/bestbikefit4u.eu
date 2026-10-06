import { ContentDisclosure, ShortAnswer } from "@/components/calculators/CalculatorAnswerSection";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { TrackedCtaLink } from "@/components/analytics/TrackedCtaLink";
import { measurementGuideCopy, measurementGuidePresentation } from "@/i18n/marketing/measurementGuide";
import { getRequestLocale } from "@/i18n/request";
import { withLocalePrefix } from "@/i18n/navigation";
import { buildLocaleAlternates } from "@/i18n/metadata";
import styles from "./measurement-guide.module.css";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getRequestLocale();
  const page = measurementGuideCopy[locale];
  const alternates = buildLocaleAlternates("/measurement-guide", locale);
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

function MeasurementDiagram({ id, label }: { id: string; label: string }) {
  return (
    <figure className={styles.figure}>
      <div className={styles.drawing} aria-hidden="true">
        {id === "foot" ? <span className={styles.foot} /> : (
          <>
            <span className={styles.head} />
            <span className={styles.body} />
            <span className={styles.shoulders} />
            <span className={styles.armLeft} />
            <span className={styles.armRight} />
            <span className={styles.legLeft} />
            <span className={styles.legRight} />
          </>
        )}
        <span className={`${styles.dimension} ${styles[id]}`}><span /><span /></span>
      </div>
      <figcaption>{label}</figcaption>
    </figure>
  );
}

function NumberText({ text }: { text: string }) {
  return text.split(/(\d+(?:[.,–-]\d+)*)/).map((part, index) => (
    /\d/.test(part) ? <span className={styles.number} key={index}>{part}</span> : part
  ));
}

export default async function MeasurementGuidePage() {
  const locale = await getRequestLocale();
  const page = measurementGuideCopy[locale];
  const presentation = measurementGuidePresentation[locale];
  const pagePath = withLocalePrefix("/measurement-guide", locale);
  const localized = (path: string) => withLocalePrefix(path, locale);

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        <section className={styles.hero}>
          <div>
            <p className={styles.eyebrow}>{presentation.eyebrow}</p>
            <h1>{page.title}</h1>
            <ShortAnswer text={page.subtitle} locale={locale} />
            <div className={styles.actions}>
              <a className={styles.primary} href="#metingen">{presentation.begin}</a>
              <Link className={styles.secondary} href={localized("/calculators/bike-fit")}>{presentation.openTool}</Link>
            </div>
          </div>
          <Image src="/illustrations/06-meetset.webp" alt={presentation.heroAlt}
            width={900} height={600} priority sizes="(max-width: 800px) 100vw, 40vw" />
        </section>
        <section className={styles.preparation} aria-labelledby="preparation">
          <h2 id="preparation">{page.beforeStartTitle}</h2>
          <ul>{page.beforeStartBullets.map((item) => <li key={item}><NumberText text={item} /></li>)}</ul>
        </section>
        <section id="metingen" className={styles.measurements} aria-labelledby="measurements-title">
          <div className={styles.intro}>
            <div>
              <p className={styles.eyebrow}>{presentation.measurementsEyebrow}</p>
              <h2 id="measurements-title">{presentation.measurementsTitle}</h2>
            </div>
            <p>{presentation.measurementsIntro}</p>
          </div>
          <div className={styles.grid}>
            {page.items.map((item, index) => {
              const measurement = (
              <article key={item.id} id={item.id} className={styles.card}>
                <div className={styles.cardTop}>
                  <div className={styles.cardTitle}>
                    <p className={`${styles.tag} ${item.required ? styles.required : ""}`}>
                      {item.required ? page.requiredLabel : page.optionalLabel}
                      {" · "}<span className={styles.number}>{item.unit}</span>
                    </p>
                    <h3><span className={styles.number}>{index + 1}.</span> {item.name}</h3>
                    {item.targetRange && (
                      <p className={styles.range}>{page.rangeLabel}: <NumberText text={item.targetRange} /></p>
                    )}
                  </div>
                  <MeasurementDiagram id={item.id} label={presentation.diagramLabels[index]} />
                </div>
                <p className={styles.tools}><strong>{page.toolsLabel}:</strong> {item.tools.join(" · ")}</p>
                <ol className={styles.steps} aria-label={page.measureLabel}>
                  {item.steps.map((step, stepIndex) => (
                    <li key={step}>
                      <span className={styles.step} aria-hidden="true">{stepIndex + 1}</span>
                      <span>{step}</span>
                    </li>
                  ))}
                </ol>
                <p className={styles.caution}><strong>{page.mistakesLabel}:</strong> {item.mistakes.join(" ")}</p>
              </article>
              );
              return item.required ? measurement : <ContentDisclosure key={item.id} title={item.name}>{measurement}</ContentDisclosure>;
            })}
            <aside className={`${styles.card} ${styles.next}`}>
              <p className={styles.eyebrow}>{presentation.nextEyebrow}</p>
              <h3>{presentation.nextTitle}</h3>
              <p>{presentation.nextBody}</p>
              <div className={styles.actions}>
                <Link className={styles.primary} href={localized("/calculators/bike-fit")}>{presentation.bikeFit}</Link>
                <Link className={styles.secondary} href={localized("/calculators/saddle-height")}>
                  {presentation.saddleHeight}
                </Link>
              </div>
            </aside>
          </div>
        </section>
        <ContentDisclosure title={page.remeasureTitle}>
          <section className={styles.recheck} aria-labelledby="recheck">
            <div>
              <p className={styles.eyebrow}>{presentation.recheck}</p>
              <h2 id="recheck">{page.remeasureTitle}</h2>
            </div>
            <ul>{page.remeasureBullets.map((item) => <li key={item}><NumberText text={item} /></li>)}</ul>
          </section>
        </ContentDisclosure>
        <section data-usability="next-step" className={styles.cta} aria-labelledby="next-step">
          <div><h2 id="next-step">{page.ctaTitle}</h2><p>{page.ctaBody}</p></div>
          <div className={styles.actions}>
            <TrackedCtaLink className={styles.primary} href={localized("/login")} locale={locale} pagePath={pagePath}
              section="measurement_guide_primary_cta" ctaLabel={page.ctaProfile} conversionKey="pricing_signup">
              {page.ctaProfile}
            </TrackedCtaLink>
            <TrackedCtaLink className={styles.secondary} href={localized("/calculators/bike-fit")}
              locale={locale} pagePath={pagePath} section="measurement_guide_secondary_cta" ctaLabel={page.ctaFit}>
              {page.ctaFit}
            </TrackedCtaLink>
          </div>
        </section>
        <nav className={styles.related} aria-label={presentation.related}>
          <Link href={localized("/science/bike-fit-methods")}>{presentation.methods}</Link>
          <Link href={localized("/science/calculation-engine")}>{presentation.science}</Link>
          <Link href={localized("/pain")}>{presentation.pain}</Link>
        </nav>
      </div>
    </div>
  );
}
