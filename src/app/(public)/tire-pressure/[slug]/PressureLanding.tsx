import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { TrackedCtaLink } from "@/components/analytics/TrackedCtaLink";
import { JsonLd } from "@/components/seo/JsonLd";
import { BRAND } from "@/config/brand";
import type { Locale } from "@/i18n/config";
import { pressureLandingMessages } from "@/i18n/marketing/pressureLanding";
import { withLocalePrefix } from "@/i18n/navigation";
import { calculateBasicPressure } from "@/lib/pressure-engine";
import { getLocalizedPublicCalculatorPath } from "@/lib/public-calculators";
import { buildBreadcrumbListSchema, buildFaqPageSchema, buildWebApplicationSchema } from "@/lib/seo/jsonLd";
import {
  BIKE_TYPE_LABELS,
  buildPressureAlternates,
  buildPressureInput,
  type EnBikeType,
} from "@/lib/seo/programmatic/tirePressure";
import { getRelatedLinks } from "@/lib/seo/relatedLinks";
import styles from "./PressureLanding.module.css";

export function PressureLanding({
  locale,
  slug,
  weight,
  bikeType,
  pathname,
}: {
  locale: Locale;
  slug: string;
  weight: number;
  bikeType: EnBikeType;
  pathname?: string;
}) {
  const copy = pressureLandingMessages[locale];
  const label = BIKE_TYPE_LABELS[bikeType];
  const input = buildPressureInput(weight, bikeType, "tubeless");
  const tubeless = calculateBasicPressure(input);
  const innerTube = calculateBasicPressure(buildPressureInput(weight, bikeType, "inner_tube"));
  const pagePath = withLocalePrefix(
    pathname ?? `/${locale === "en" ? "tire-pressure" : "bandenspanning"}/${slug}`,
    locale,
  );
  const pageUrl = buildPressureAlternates(weight, bikeType, locale).canonical;
  const title = copy.title(weight, label[locale]);
  const calculatorPath = withLocalePrefix(getLocalizedPublicCalculatorPath("tire-pressure", locale), locale);
  const homePath = withLocalePrefix("/", locale);
  const surface = copy.surfaces[input.surface as keyof typeof copy.surfaces];
  const faqs = [
    { q: copy.faqFixed(tubeless.frontBar, tubeless.rearBar, weight), a: copy.faqFixedAnswer },
    { q: copy.faqTubes, a: copy.faqTubesAnswer },
  ];
  const number = (value: number) => new Intl.NumberFormat(locale, { maximumFractionDigits: 2 }).format(value);
  return (
    <article className={styles.page}>
      <JsonLd
        schema={[
          buildBreadcrumbListSchema([
            { name: copy.home, item: new URL(homePath, BRAND.siteUrl).toString() },
            { name: copy.calculator, item: new URL(calculatorPath, BRAND.siteUrl).toString() },
            { name: title, item: pageUrl },
          ]),
          buildFaqPageSchema(faqs),
          buildWebApplicationSchema({
            name: title,
            description: copy.schemaDescription(weight, label[locale]),
            url: pageUrl,
          }),
        ]}
      />
      <nav aria-label={copy.breadcrumb} className={styles.breadcrumbs}>
        <Link href={homePath}>{copy.home}</Link>
        <span aria-hidden="true">/</span>
        <Link href={calculatorPath}>{copy.calculator}</Link>
        <span aria-hidden="true">/</span>
        <span aria-current="page">
          {weight} kg · {label[locale]}
        </span>
      </nav>
      <header className={styles.hero}>
        <div>
          <p className={styles.eyebrow}>
            {copy.eyebrow} · {label[locale]}
          </p>
          <span className={styles.chip}>{copy.example}</span>
          <h1>{title}</h1>
          <p className={styles.intro}>{copy.intro(weight, label[locale])}</p>
        </div>
        <Image
          src="/illustrations/04-bandenspanning.webp"
          alt={copy.illustration}
          width={392}
          height={350}
          priority
          className={styles.illustration}
        />
      </header>
      <section className={styles.assumptions} aria-labelledby="pressure-assumptions">
        <h2 id="pressure-assumptions">{copy.assumptions}</h2>
        <dl className={styles.assumptionGrid}>
          <div>
            <dt>{copy.mass}</dt>
            <dd>
              <span className={styles.number}>
                {number(weight)} + {input.bikeWeightKg ?? 8}
              </span>{" "}
              kg
            </dd>
          </div>
          <div>
            <dt>{copy.width}</dt>
            <dd>
              <span className={styles.number}>{input.widthFrontMm}</span> mm
            </dd>
          </div>
          <div>
            <dt>{copy.surface}</dt>
            <dd>{surface}</dd>
          </div>
          <div>
            <dt>{copy.goal}</dt>
            <dd>{copy.balance}</dd>
          </div>
        </dl>
        <p>{copy.bikeAssumption}</p>
      </section>
      <section className={styles.section} aria-labelledby="pressure-results">
        <p className={styles.eyebrow}>{copy.resultsEyebrow}</p>
        <h2 id="pressure-results">{copy.results}</h2>
        <div className={styles.tableFrame}>
          <table className={styles.pressureTable} aria-labelledby="pressure-results">
            <thead>
              <tr>
                <th scope="col">{copy.tubeType}</th>
                <th scope="col">{copy.front}</th>
                <th scope="col">{copy.rear}</th>
              </tr>
            </thead>
            <tbody>
              {[
                { label: copy.tubeless, result: tubeless },
                { label: copy.innerTube, result: innerTube },
              ].map(({ label: rowLabel, result }, index) => (
                <tr key={rowLabel} className={index === 0 ? styles.primaryRow : undefined}>
                  <th scope="row">{rowLabel}</th>
                  {[
                    { bar: result.frontBar, psi: result.frontPsi },
                    { bar: result.rearBar, psi: result.rearPsi },
                  ].map((value, side) => (
                    <td key={side}>
                      <span className={styles.pressure}>{number(value.bar)}</span>
                      <span className={styles.unit}>bar</span>
                      <div className={styles.psi}>{number(value.psi)} PSI</div>
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p>
          {copy.explanation(input.widthFrontMm, surface)} {copy.innerTubeNote}
        </p>
      </section>
      <section className={styles.section} aria-labelledby="pressure-baseline">
        <p className={styles.eyebrow}>{copy.baselineEyebrow}</p>
        <h2 id="pressure-baseline">{copy.baseline}</h2>
        <ol className={styles.steps}>
          {copy.steps.map((step, index) => (
            <li key={step.title}>
              <span className={styles.stepNumber} aria-hidden="true">
                0{index + 1}
              </span>
              <h3>{step.title}</h3>
              <p>{step.body}</p>
            </li>
          ))}
        </ol>
      </section>
      <section className={`${styles.section} ${styles.faq}`} aria-labelledby="pressure-faq">
        <div>
          <p className={styles.eyebrow}>{copy.faq}</p>
          <h2 id="pressure-faq">{copy.faqTitle}</h2>
        </div>
        <div>
          {faqs.map((faq) => (
            <details key={faq.q}>
              <summary>{faq.q}</summary>
              <p>{faq.a}</p>
            </details>
          ))}
        </div>
      </section>
      <section className={styles.cta} aria-labelledby="pressure-next">
        <div>
          <h2 id="pressure-next">{copy.next}</h2>
          <p>{copy.nextBody}</p>
        </div>
        <div className={styles.ctaLinks}>
          <TrackedCtaLink
            href={calculatorPath}
            locale={locale}
            pagePath={pagePath}
            section="programmatic_pressure_primary_cta"
            ctaLabel={copy.cta}
            className={styles.button}
          >
            {copy.cta}
            <ArrowRight aria-hidden="true" size={20} />
          </TrackedCtaLink>
          <TrackedCtaLink
            href={withLocalePrefix(label.guideHref, locale)}
            locale={locale}
            pagePath={pagePath}
            section="programmatic_pressure_secondary_cta"
            ctaLabel={copy.guideCta(label[locale])}
            className={styles.guideLink}
          >
            {copy.guideCta(label[locale])}
            <ArrowRight aria-hidden="true" size={18} />
          </TrackedCtaLink>
        </div>
      </section>
      <section className={styles.related} aria-labelledby="pressure-related">
        <h2 id="pressure-related">{copy.related}</h2>
        <div className={styles.relatedGrid}>
          {getRelatedLinks("tire-pressure", locale).map((link) => (
            <Link key={link.href} href={withLocalePrefix(link.href, locale)}>
              <span>{link.label}</span>
              <ArrowRight aria-hidden="true" size={20} />
            </Link>
          ))}
        </div>
      </section>
    </article>
  );
}
