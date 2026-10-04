import { Check } from "lucide-react";
import type { Locale } from "@/i18n/config";
import { pricingCopy, type PricingProductId } from "@/i18n/marketing/pricing";
import { withLocalePrefix } from "@/i18n/navigation";
import { TrackedCtaLink } from "@/components/analytics/TrackedCtaLink";
import styles from "./PricingCard.module.css";

export function PricingCard({ locale, productId, href, highlighted = productId === "annual" }: {
  locale: Locale;
  productId: PricingProductId;
  href: string;
  highlighted?: boolean;
}) {
  const page = pricingCopy[locale];
  const product = page.products[productId];

  return (
    <article className={`${styles.card} ${highlighted ? styles.featured : ""}`} data-product={productId} aria-labelledby={`pricing-${productId}`}>
      {product.badge && <p className={styles.badge}>{product.badge}</p>}
      <h2 id={`pricing-${productId}`}>{product.name}</h2>
      <p className={styles.description}>{product.description}</p>
      <div>
        <p className={styles.price}>{product.price}</p>
        <p className={styles.period}>{product.period} · {page.vatShort}</p>
      </div>
      {product.renewal && <p className={styles.renewal}>{product.renewal}</p>}
      <dl className={styles.facts}>{product.facts.map(([label, value]) => <div key={label}><dt>{label}</dt><dd>{value}</dd></div>)}</dl>
      <ul className={styles.features}>{product.features.map((feature) => <li key={feature}><Check size={20} aria-hidden="true" /><span>{feature}</span></li>)}</ul>
      <TrackedCtaLink className={styles.cta} href={href} locale={locale} pagePath={withLocalePrefix("/pricing", locale)} section={`pricing_${productId}_cta`} ctaLabel={product.cta}>{product.cta}</TrackedCtaLink>
    </article>
  );
}
