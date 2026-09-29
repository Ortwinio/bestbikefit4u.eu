import type { Metadata } from "next";
import { Check } from "lucide-react";
import { isStripeBillingEnabled } from "@/config/billing";
import { JsonLd } from "@/components/seo/JsonLd";
import { TrackMarketingEventOnView } from "@/components/analytics/MarketingEventTracker";
import { TrackedCtaLink } from "@/components/analytics/TrackedCtaLink";
import {
  COMMERCIAL_FEATURE_COPY,
  CONSUMER_CAMPAIGN_CONFIG,
  formatEuroPriceFromCents,
  getConsumerCampaignCopy,
  getCommercialFaqCopy,
  getVisiblePublicPlans,
  isConsumerCampaignActive,
  PRODUCT_LIVE_FLAGS,
} from "@/config/commercial";
import { buildLocaleAlternates } from "@/i18n/metadata";
import { getRequestLocale } from "@/i18n/request";
import { withLocalePrefix } from "@/i18n/navigation";
import { pricingCopy as copy } from "@/i18n/marketing/pricing";
import styles from "./pricing.module.css";
import { buildFaqPageSchema } from "@/lib/seo/jsonLd";

const comparisonKeys = [
  "monthlyFitSession",
  "basicRecommendations",
  "multipleBikeProfiles",
  "sessionHistoryLimited",
  "emailReport",
  "pdfReport",
  "prioritySupport",
] as const;

function PricingText({ children }: { children: string }) {
  return children.split(/(\d+(?:[.,]\d+)?)/).map((part, index) =>
    /^\d/.test(part) ? <span className={styles.number} key={index}>{part}</span> : part
  );
}

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getRequestLocale();
  const page = copy[locale];
  const campaignActive = isConsumerCampaignActive();
  const campaign = getConsumerCampaignCopy(locale);
  const alternates = buildLocaleAlternates("/pricing", locale);
  const metadata = campaignActive
    ? {
        title: page.campaignMetadata.title,
        description: campaign.pricingDescription,
        keywords: page.campaignMetadata.keywords,
      }
    : page.metadata;

  return {
    title: metadata.title,
    description: metadata.description,
    keywords: metadata.keywords,
    openGraph: {
      title: metadata.title,
      description: metadata.description,
      type: "website",
      url: alternates.canonical,
    },
    alternates,
  };
}

export default async function PricingPage() {
  const locale = await getRequestLocale();
  const billingEnabled = isStripeBillingEnabled();
  const page = copy[locale];
  const paymentsUnavailable = page.paymentsUnavailable;
  const campaignActive = isConsumerCampaignActive();
  const campaign = getConsumerCampaignCopy(locale);
  const plans = getVisiblePublicPlans();
  const commercialFaq = getCommercialFaqCopy(locale);
  const pagePath = withLocalePrefix("/pricing", locale);
  const pricingFaqs = [
    {
      q: page.questions[0],
      a: commercialFaq.multipleBikeProfiles,
    },
    {
      q: page.questions[1],
      a: commercialFaq.pdfReport,
    },
    {
      q: page.questions[2],
      a: commercialFaq.pricing,
    },
  ];

  return (
    <div className={styles.page}>
      <JsonLd schema={buildFaqPageSchema(pricingFaqs)} />
      <TrackMarketingEventOnView eventType="pricing_view" locale={locale} pagePath={pagePath} section="pricing" />
      <section className={styles.hero}>
        <p className={styles.eyebrow}>{page.eyebrow}</p>
        <h1>{page.title}</h1>
        <p className={styles.intro}>{page.subtitle}</p>
        {!billingEnabled && <p id="payments-unavailable" role="status" className={styles.notice}>{paymentsUnavailable}</p>}
      </section>
      {campaignActive ? (
        <section className={styles.campaign}>
          <p className={styles.eyebrow}>{campaign.pricingTitle}</p>
          <h2>{campaign.homepageTitle}</h2>
          <p>{campaign.pricingDescription}</p>
          <div className={styles.campaignActions}>
            <TrackedCtaLink className={styles.primary} href={withLocalePrefix("/calculators/bike-fit", locale)} locale={locale} pagePath={pagePath} section="pricing_campaign_start" ctaLabel={campaign.startFreeCta}>{campaign.startFreeCta}</TrackedCtaLink>
            <TrackedCtaLink className={styles.secondary} href={CONSUMER_CAMPAIGN_CONFIG.donationUrl} locale={locale} pagePath={pagePath} section="pricing_campaign_donate" ctaLabel={page.donate}>{page.donate}</TrackedCtaLink>
          </div>
          <p>{campaign.optionalNote}</p>
        </section>
      ) : (
        <section className={styles.plans} aria-label={page.eyebrow}>
          {plans.map((plan) => {
            const localized = plan.copy[locale];
            return (
              <article key={plan.id} className={`${styles.plan} ${plan.highlighted ? styles.pro : ""}`}>
                <div className={styles.planHeading}>
                  <h2>{localized.name}</h2>
                  {localized.badge && <span className={styles.badge}>{localized.badge}</span>}
                </div>
                <p className={styles.description}>{localized.description}</p>
                <p className={styles.price}><span>{formatEuroPriceFromCents(plan.priceCentsMonthly, locale)}</span><span>{page.monthlySuffix}</span></p>
                <ul className={styles.features}>
                  {localized.features.map((feature) => <li key={feature}><Check size={20} strokeWidth={2} aria-hidden="true" /><span><PricingText>{feature}</PricingText></span></li>)}
                </ul>
                {!billingEnabled && plan.priceCentsMonthly > 0 ? (
                  <button type="button" disabled aria-describedby="payments-unavailable" className={styles.unavailable}>{page.unavailable}</button>
                ) : (
                  <TrackedCtaLink className={plan.highlighted ? styles.primary : styles.secondary} href={withLocalePrefix("/login", locale)} locale={locale} pagePath={pagePath} section={`pricing_${plan.id}_cta`} ctaLabel={localized.cta} conversionKey="pricing_signup">{localized.cta}</TrackedCtaLink>
                )}
              </article>
            );
          })}
        </section>
      )}
      <section className={styles.comparison} aria-labelledby="pricing-compare">
        <h2 id="pricing-compare">{page.featureCompareTitle}</h2>
        <div className={styles.tableWrap} tabIndex={0} role="region" aria-label={page.featureCompareTitle}>
          <table>
            <thead><tr><th scope="col">{page.featureLabel}</th>{plans.map((plan) => <th scope="col" key={plan.id}>{plan.copy[locale].name}</th>)}</tr></thead>
            <tbody>{comparisonKeys.map((key) => (
              <tr key={key}>
                <th scope="row">{COMMERCIAL_FEATURE_COPY[key][locale].title}</th>
                {plans.map((plan) => <td key={plan.id}><PricingText>{plan.id === "free" ? COMMERCIAL_FEATURE_COPY[key][locale].valueFree : COMMERCIAL_FEATURE_COPY[key][locale].valuePro}</PricingText></td>)}
              </tr>
            ))}</tbody>
          </table>
        </div>
        {!PRODUCT_LIVE_FLAGS.moneyBackGuarantee && <p className={styles.guarantee}>{page.guarantee}</p>}
      </section>
      <section className={styles.details} aria-labelledby="pricing-faq">
        <h2 id="pricing-faq">{page.faqTitle}</h2>
        {pricingFaqs.map((faq) => <details key={faq.q}><summary>{faq.q}</summary><p>{faq.a}</p></details>)}
        <details><summary>{page.proofTitle}</summary><div className={styles.proof}>{page.proofItems.map((item) => <div key={item.title}><h3>{item.title}</h3><p>{item.body}</p></div>)}</div></details>
      </section>
      <section className={styles.cta}>
        <div><h2>{page.ctaTitle}</h2><p>{page.ctaBody}</p></div>
        <TrackedCtaLink className={styles.primary} href={withLocalePrefix("/calculators/bike-fit", locale)} locale={locale} pagePath={pagePath} section="pricing_footer_cta_primary" ctaLabel={page.start}>{page.start}</TrackedCtaLink>
      </section>
    </div>
  );
}
