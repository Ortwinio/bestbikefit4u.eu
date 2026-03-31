import type { Metadata } from "next";
import { Check } from "lucide-react";
import { Button } from "@/components/ui";
import { TrackMarketingEventOnView } from "@/components/analytics/MarketingEventTracker";
import { TrackedCtaLink } from "@/components/analytics/TrackedCtaLink";
import {
  COMMERCIAL_FEATURE_COPY,
  formatEuroPriceFromCents,
  getCommercialFaqCopy,
  getVisiblePublicPlans,
  PRODUCT_LIVE_FLAGS,
} from "@/config/commercial";
import { buildLocaleAlternates } from "@/i18n/metadata";
import { getRequestLocale } from "@/i18n/request";
import { withLocalePrefix } from "@/i18n/navigation";
import type { Locale } from "@/i18n/config";

const comparisonKeys = [
  "monthlyFitSession",
  "basicRecommendations",
  "multipleBikeProfiles",
  "sessionHistoryLimited",
  "emailReport",
  "pdfReport",
  "prioritySupport",
] as const;

const copy: Record<
  Locale,
  {
    metadata: { title: string; description: string; keywords: string[] };
    title: string;
    subtitle: string;
    eyebrow: string;
    monthlySuffix: string;
    faqTitle: string;
    ctaTitle: string;
    ctaBody: string;
  }
> = {
  en: {
    metadata: {
      title: "Pricing | BestBikeFit4U",
      description:
        "Compare BestBikeFit4U Free and Pro plans. All public prices are monthly in EUR and only reflect features that are live today.",
      keywords: ["bike fit pricing", "online bike fit price", "bike fit plans eur"],
    },
    title: "Clear pricing for real riders",
    subtitle:
      "Start free, then upgrade to Pro when you need unlimited sessions, multiple bikes, and PDF reports.",
    eyebrow: "Public plans",
    monthlySuffix: "/ month",
    faqTitle: "Pricing FAQ",
    ctaTitle: "Start free. Upgrade when you need more.",
    ctaBody:
      "The public pricing page only shows live plans and live features. No unsupported categories, no placeholder claims.",
  },
  nl: {
    metadata: {
      title: "Prijzen | BestBikeFit4U",
      description:
        "Vergelijk BestBikeFit4U Free en Pro. Alle publieke prijzen zijn maandelijks in euro en tonen alleen functies die nu live zijn.",
      keywords: ["bike fit prijzen", "online bike fit prijs", "bike fit plannen euro"],
    },
    title: "Heldere prijzen voor echte rijders",
    subtitle:
      "Start gratis en upgrade naar Pro wanneer je onbeperkte sessies, meerdere fietsen en PDF-rapporten nodig hebt.",
    eyebrow: "Publieke plannen",
    monthlySuffix: "/ maand",
    faqTitle: "Prijs-FAQ",
    ctaTitle: "Start gratis. Upgrade wanneer je meer nodig hebt.",
    ctaBody:
      "Deze publieke prijzenpagina toont alleen live plannen en live functies. Geen unsupported categorieën en geen placeholder-claims.",
  },
};

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getRequestLocale();
  const page = copy[locale];
  const alternates = buildLocaleAlternates("/pricing", locale);

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

export default async function PricingPage() {
  const locale = await getRequestLocale();
  const page = copy[locale];
  const plans = getVisiblePublicPlans();
  const commercialFaq = getCommercialFaqCopy(locale);
  const pagePath = withLocalePrefix("/pricing", locale);

  return (
    <div className="bg-[linear-gradient(180deg,var(--background)_0%,color-mix(in_oklch,var(--muted)_42%,var(--background)_58%)_100%)] py-16">
      <TrackMarketingEventOnView
        eventType="pricing_view"
        locale={locale}
        pagePath={pagePath}
        section="pricing"
      />
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <section className="rounded-[2.25rem] border border-border/70 bg-card/95 px-6 py-10 text-center shadow-sm sm:px-10 sm:py-12">
          <p className="text-sm font-semibold uppercase tracking-[0.28em] text-primary">
            {page.eyebrow}
          </p>
          <h1 className="mt-4 text-4xl font-bold text-foreground sm:text-5xl">{page.title}</h1>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground">{page.subtitle}</p>
        </section>

        <div className={`mt-14 grid gap-8 ${plans.length > 1 ? "md:grid-cols-2" : "md:grid-cols-1 md:max-w-xl"} mx-auto`}>
          {plans.map((plan) => {
            const localized = plan.copy[locale];
            return (
              <article
                key={plan.id}
                className={`rounded-[2rem] border p-8 shadow-sm transition ${plan.highlighted ? "border-primary bg-primary text-primary-foreground shadow-lg" : "border-border/70 bg-card/95"}`}
              >
                {localized.badge ? (
                  <p className="mb-4 text-sm font-semibold uppercase tracking-[0.22em] text-current/80">
                    {localized.badge}
                  </p>
                ) : null}
                <h2 className="text-2xl font-semibold">{localized.name}</h2>
                <p className={`mt-2 text-sm ${plan.highlighted ? "text-primary-foreground/85" : "text-muted-foreground"}`}>
                  {localized.description}
                </p>
                <div className="mt-6 flex items-end gap-2">
                  <span className="text-4xl font-bold">
                    {formatEuroPriceFromCents(plan.priceCentsMonthly, locale)}
                  </span>
                  <span className={`pb-1 text-sm ${plan.highlighted ? "text-primary-foreground/80" : "text-muted-foreground"}`}>
                    {page.monthlySuffix}
                  </span>
                </div>

                <ul className="mt-8 space-y-3">
                  {localized.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-3">
                      <Check className={`mt-0.5 h-5 w-5 shrink-0 ${plan.highlighted ? "text-primary-foreground/90" : "text-primary"}`} />
                      <span className={`text-sm ${plan.highlighted ? "text-primary-foreground" : "text-muted-foreground"}`}>
                        {feature}
                      </span>
                    </li>
                  ))}
                </ul>

                <Button
                  render={
                    <TrackedCtaLink
                      href={withLocalePrefix("/login", locale)}
                      locale={locale}
                      pagePath={pagePath}
                      section={`pricing_${plan.id}_cta`}
                      ctaLabel={localized.cta}
                      conversionKey="pricing_signup"
                      className="block"
                    />
                  }
                  className={`mt-8 w-full ${plan.highlighted ? "bg-background text-primary hover:bg-muted" : ""}`}
                  variant={plan.highlighted ? "secondary" : "primary"}
                >
                  {localized.cta}
                </Button>
              </article>
            );
          })}
        </div>

        <section className="mt-16 rounded-[2rem] border border-border/70 bg-card/95 p-8 shadow-sm sm:p-10">
          <h2 className="text-2xl font-semibold text-foreground">
            {locale === "nl" ? "Vergelijk live functies" : "Compare live features"}
          </h2>
          <div className="mt-6 overflow-x-auto rounded-[1.5rem] border border-border/70 bg-background/90">
            <table className="w-full">
              <thead className="bg-muted/40">
                <tr className="border-b border-border">
                  <th className="px-4 py-4 text-left font-semibold text-foreground">
                    {locale === "nl" ? "Functie" : "Feature"}
                  </th>
                  {plans.map((plan) => (
                    <th key={plan.id} className="px-4 py-4 text-center font-semibold text-foreground">
                      {plan.copy[locale].name}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {comparisonKeys.map((key) => (
                  <tr key={key}>
                    <td className="px-4 py-4 text-sm text-foreground">
                      {COMMERCIAL_FEATURE_COPY[key][locale].title}
                    </td>
                    <td className="px-4 py-4 text-center text-sm text-muted-foreground">
                      {COMMERCIAL_FEATURE_COPY[key][locale].valueFree}
                    </td>
                    <td className="px-4 py-4 text-center text-sm font-medium text-primary">
                      {COMMERCIAL_FEATURE_COPY[key][locale].valuePro}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {!PRODUCT_LIVE_FLAGS.moneyBackGuarantee ? (
            <p className="mt-4 text-sm text-muted-foreground">
              {locale === "nl"
                ? "Er wordt op dit moment geen publieke geld-terug-garantie geclaimd."
                : "No public money-back guarantee is claimed at this time."}
            </p>
          ) : null}
        </section>

        <section className="mt-16 grid gap-6 md:grid-cols-3">
          <div className="rounded-[1.75rem] border border-border/70 bg-card/95 p-6 shadow-sm">
            <h3 className="font-semibold text-foreground">
              {locale === "nl" ? "Meerdere fietsen" : "Multiple bikes"}
            </h3>
            <p className="mt-2 text-sm text-muted-foreground">{commercialFaq.multipleBikeProfiles}</p>
          </div>
          <div className="rounded-[1.75rem] border border-border/70 bg-card/95 p-6 shadow-sm">
            <h3 className="font-semibold text-foreground">
              {locale === "nl" ? "Rapporten" : "Reports"}
            </h3>
            <p className="mt-2 text-sm text-muted-foreground">{commercialFaq.pdfReport}</p>
          </div>
          <div className="rounded-[1.75rem] border border-border/70 bg-card/95 p-6 shadow-sm">
            <h3 className="font-semibold text-foreground">{page.faqTitle}</h3>
            <p className="mt-2 text-sm text-muted-foreground">{commercialFaq.pricing}</p>
          </div>
        </section>

        <section className="mt-16 rounded-[2rem] bg-primary px-6 py-12 text-center shadow-lg sm:px-10">
          <h2 className="text-2xl font-semibold text-primary-foreground">{page.ctaTitle}</h2>
          <p className="mx-auto mt-3 max-w-3xl text-sm leading-7 text-primary-foreground/82">
            {page.ctaBody}
          </p>
          <Button
            render={
              <TrackedCtaLink
                href={withLocalePrefix("/login", locale)}
                locale={locale}
                pagePath={pagePath}
                section="pricing_footer_cta"
                ctaLabel={locale === "nl" ? "Start gratis fit" : "Start free fit"}
                conversionKey="pricing_signup"
              />
            }
            size="lg"
            className="mt-8 bg-background text-primary hover:bg-muted"
          >
            {locale === "nl" ? "Start gratis fit" : "Start free fit"}
          </Button>
        </section>
      </div>
    </div>
  );
}
