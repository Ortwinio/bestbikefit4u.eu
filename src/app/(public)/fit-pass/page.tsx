import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, FileDown, ListChecks, Repeat } from "lucide-react";
import { isStripeBillingEnabled } from "@/config/billing";
import { FitPassLandingCta } from "@/components/features/fitpass/FitPassLandingCta";
import { fitPassCopy, fitPassPresentation } from "@/i18n/marketing/fitPass";
import { buildLocaleAlternates } from "@/i18n/metadata";
import { withLocalePrefix } from "@/i18n/navigation";
import { getRequestLocale } from "@/i18n/request";
import styles from "./fit-pass.module.css";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getRequestLocale();
  const copy = fitPassCopy[locale];
  const alternates = buildLocaleAlternates("/fit-pass", locale);
  return {
    title: copy.metadata.title,
    description: copy.metadata.description,
    alternates,
    openGraph: {
      title: copy.metadata.title,
      description: copy.metadata.description,
      url: alternates.canonical,
    },
  };
}

const icons = { pdf: FileDown, sessions: Repeat, sequence: ListChecks };

function numericCopy(value: string) {
  return value.split(/(\d+(?:[.,]\d+)?)/).map((part, index) => (
    /^\d/.test(part) ? <span className={styles.mono} key={index}>{part}</span> : part
  ));
}

export default async function FitPassPage() {
  const locale = await getRequestLocale();
  const copy = fitPassCopy[locale];
  const presentation = fitPassPresentation[locale];
  const billingEnabled = isStripeBillingEnabled();
  const action = (
    <FitPassLandingCta
      locale={locale}
      label={copy.cta}
      loadingLabel={presentation.loading}
      alreadyActiveLabel={copy.alreadyActive}
      loginHref={withLocalePrefix("/login?redirect=/fit-pass", locale)}
      dashboardHref={withLocalePrefix("/dashboard", locale)}
    />
  );

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        <section className={styles.hero}>
          <div>
            <p className={styles.eyebrow}>{copy.eyebrow}</p>
            <h1>{presentation.title}</h1>
            <p className={styles.intro}>{presentation.intro}</p>
            {!billingEnabled && (
              <div className={styles.status}>
                <strong>{presentation.pausedTitle}</strong>
                <p>{presentation.paused}</p>
              </div>
            )}
            <div className={styles.action}>{action}</div>
          </div>
          <div className={styles.visual}>
            <Image
              src="/illustrations/03-cockpit-afstellen.webp"
              alt={presentation.imageAlt}
              width={900}
              height={600}
              sizes="(max-width: 800px) 100vw, 40vw"
              priority
            />
            <div className={styles.note}>
              <span className={styles.tag}>{presentation.tag}</span>
              <h2>{presentation.visualTitle}</h2>
              <p>{presentation.visualBody}</p>
            </div>
          </div>
        </section>

        <section className={styles.section} aria-labelledby="fit-pass-features">
          <p className={styles.eyebrow}>{copy.whatYouGet}</p>
          <h2 id="fit-pass-features" className={styles.sectionTitle}>{presentation.featuresTitle}</h2>
          <div className={styles.features}>
            {copy.features.map((feature) => {
              const Icon = icons[feature.icon];
              return (
                <article key={feature.title}>
                  <div className={styles.icon}><Icon size={28} aria-hidden="true" /></div>
                  <h3>{feature.title}</h3>
                  <p>{feature.body}</p>
                </article>
              );
            })}
          </div>
        </section>

        <section className={`${styles.section} ${styles.process}`} aria-labelledby="fit-pass-process">
          <div>
            <p className={styles.eyebrow}>{copy.howItWorksTitle}</p>
            <h2 id="fit-pass-process">{presentation.processTitle}</h2>
            <p>{billingEnabled ? presentation.processIntro : presentation.processPaused}</p>
            <Link className={styles.textLink} href={withLocalePrefix("/how-it-works", locale)}>
              {presentation.processLink}<ArrowRight size={20} aria-hidden="true" />
            </Link>
          </div>
          <div className={styles.steps}>
            {copy.steps.map((step, index) => (
              <article key={step.label}>
                <span className={styles.number}>{String(index + 1).padStart(2, "0")}</span>
                <div>
                  <h3>{step.label}</h3>
                  {!billingEnabled && index === 1 && (
                    <span className={`${styles.tag} ${styles.warning}`}>{presentation.unavailable}</span>
                  )}
                  <p>
                    {numericCopy(!billingEnabled && index === 1 ? presentation.pausedStep
                      : !billingEnabled && index === 2 ? presentation.reportStep : step.body)}
                  </p>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className={`${styles.section} ${styles.faq}`} aria-labelledby="fit-pass-faq">
          <div>
            <p className={styles.eyebrow}>{copy.faqTitle}</p>
            <h2 id="fit-pass-faq">{presentation.faqTitle}</h2>
            <Link className={styles.textLink} href={withLocalePrefix("/pricing", locale)}>
              {presentation.pricingLink}<ArrowRight size={20} aria-hidden="true" />
            </Link>
          </div>
          <div>
            {copy.faqs.map((faq, index) => (
              <details key={faq.q} open={index === 0}>
                <summary>{faq.q}</summary>
                <p>{faq.a}{!billingEnabled && index === 0 ? ` ${presentation.paused}` : ""}</p>
              </details>
            ))}
          </div>
        </section>

        <section className={styles.cta}>
          <div>
            <p className={styles.eyebrow}>{presentation.finalEyebrow}</p>
            <h2>{presentation.finalTitle}</h2>
            <p>{billingEnabled ? copy.subhero : presentation.finalPaused}</p>
          </div>
          <div className={styles.action}>{action}</div>
        </section>
      </div>
    </div>
  );
}
