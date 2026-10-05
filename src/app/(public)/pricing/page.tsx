import type { Metadata } from "next";
import Link from "next/link";
import { Check, Gift } from "lucide-react";
import { JsonLd } from "@/components/seo/JsonLd";
import { TrackMarketingEventOnView } from "@/components/analytics/MarketingEventTracker";
import { TrackedCtaLink } from "@/components/analytics/TrackedCtaLink";
import { PricingCard } from "@/components/pricing/PricingCard";
import { BRAND } from "@/config/brand";
import { buildLocaleAlternates } from "@/i18n/metadata";
import { getRequestLocale } from "@/i18n/request";
import { withLocalePrefix } from "@/i18n/navigation";
import { pricingCopy, type PricingProductId } from "@/i18n/marketing/pricing";
import { buildFaqPageSchema } from "@/lib/seo/jsonLd";
import styles from "./pricing.module.css";
import { PRODUCTS } from "../../../../shared/pricing/products";

const productOrder: PricingProductId[] = ["single", "annual", "annual_personal"];
const mobileProductOrder: PricingProductId[] = ["annual", "single", "annual_personal"];

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getRequestLocale();
  const { metadata } = pricingCopy[locale];
  const alternates = buildLocaleAlternates("/pricing", locale);
  return {
    ...metadata,
    openGraph: { title: metadata.title, description: metadata.description, type: "website", url: alternates.canonical },
    alternates,
  };
}

export default async function PricingPage() {
  const locale = await getRequestLocale();
  const page = pricingCopy[locale];
  const pagePath = withLocalePrefix("/pricing", locale);
  const checkoutHref = (productId: PricingProductId) => withLocalePrefix(`/checkout?product=${productId}`, locale);
  const serviceSchema = {
    "@context": "https://schema.org",
    "@type": "Service",
    name: page.metadata.title,
    description: page.metadata.description,
    url: `${BRAND.siteUrl}${pagePath}`,
    provider: { "@id": `${BRAND.siteUrl}/#organization` },
    offers: productOrder.map((productId) => ({
      "@type": "Offer",
      name: page.products[productId].name,
      description: [page.products[productId].description, page.products[productId].period, page.products[productId].renewal].filter(Boolean).join(" "),
      price: (PRODUCTS[productId].priceCents / 100).toFixed(2),
      priceCurrency: "EUR",
      url: `${BRAND.siteUrl}${checkoutHref(productId)}`,
      priceSpecification: { "@type": "UnitPriceSpecification", price: (PRODUCTS[productId].priceCents / 100).toFixed(2), priceCurrency: "EUR", valueAddedTaxIncluded: true },
    })),
  };

  return (
    <div className={styles.page}>
      <JsonLd schema={[serviceSchema, buildFaqPageSchema(page.faqs)]} />
      <TrackMarketingEventOnView eventType="pricing_view" locale={locale} pagePath={pagePath} section="pricing" />
      <section className={styles.hero}>
        <p className={styles.eyebrow}>{page.eyebrow}</p>
        <h1>{page.title}</h1>
        <p className={styles.intro}>{page.subtitle}</p>
        <p className={styles.small}>{page.vat}</p>
      </section>
      <p className={styles.free}>{page.freePrompt} <Link href={withLocalePrefix("/login", locale)}>{page.freeLink}</Link> {page.freeDetail}</p>
      <section className={styles.plans} aria-label={page.eyebrow}>
        {mobileProductOrder.map((productId) => <PricingCard key={productId} locale={locale} productId={productId} href={checkoutHref(productId)} />)}
      </section>
      <section className={styles.gift} aria-labelledby="pricing-gift">
        <div className={styles.giftIntro}>
          <span className={styles.giftIcon}><Gift size={24} aria-hidden="true" /></span>
          <div><h2 id="pricing-gift">{page.gift.title}</h2><p>{page.gift.body}</p></div>
        </div>
        <Link className={styles.giftLink} href={withLocalePrefix("/gift", locale)}>
          {page.gift.cta} <span aria-hidden="true">→</span>
        </Link>
      </section>
      <section className={styles.comparison}>
        <h2 id="pricing-compare">{page.featureCompareTitle}</h2>
        <div className={styles.tableWrap} tabIndex={0} role="region" aria-label={page.featureCompareTitle}>
          <table>
            <thead><tr><th scope="col">{page.featureLabel}</th><th scope="col">{page.free}<span className={styles.tablePrice}>€0</span></th>{productOrder.map((productId) => <th scope="col" key={productId} className={productId === "annual" ? styles.annualColumn : undefined}>{productId === "annual" && <span className={styles.tableBadge}>{page.products.annual.badge}</span>}{page.products[productId].name}<span className={styles.tablePrice}>{page.products[productId].price}</span></th>)}</tr></thead>
            <tbody>{page.comparison.map((row) => <tr key={row.label}><th scope="row">{row.label}</th>{row.values.map((value, index) => <td key={index} className={index === 2 ? styles.annualColumn : undefined}>{typeof value === "boolean" ? <span className={styles.indicator} role="img" aria-label={value ? page.included : page.excluded}>{value ? <Check size={20} aria-hidden="true" /> : "—"}</span> : value}</td>)}</tr>)}</tbody>
          </table>
        </div>
        <p className={styles.small}>{page.accountNote}</p>
      </section>
      <section className={styles.advice} aria-labelledby="pricing-advice">
        <div><p className={styles.eyebrow}>{page.adviceEyebrow}</p><h2 id="pricing-advice">{page.adviceTitle}</h2></div>
        <div>{page.advice.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}</div>
      </section>
      <section className={styles.details} aria-labelledby="pricing-faq">
        <div className={styles.sectionHeading}><h2 id="pricing-faq">{page.faqTitle}</h2><Link href={withLocalePrefix("/faq", locale)}>{page.allQuestions}</Link></div>
        {page.faqs.map((faq) => <details key={faq.q}><summary>{faq.q}</summary><p>{faq.a}</p></details>)}
      </section>
      <section className={styles.cta}>
        <div><h2>{page.ctaTitle}</h2><p>{page.ctaBody}</p></div>
        <TrackedCtaLink className={styles.primary} href={withLocalePrefix("/calculators/bike-fit", locale)} locale={locale} pagePath={pagePath} section="pricing_footer_cta_primary" ctaLabel={page.start}>{page.start}</TrackedCtaLink>
      </section>
    </div>
  );
}
