import type { Metadata } from "next";
import { Check } from "lucide-react";
import { JsonLd } from "@/components/seo/JsonLd";
import { TrackMarketingEventOnView } from "@/components/analytics/MarketingEventTracker";
import { TrackedCtaLink } from "@/components/analytics/TrackedCtaLink";
import { Button } from "@/components/prototyper-ui/ui/button";
import { Card, CardContent } from "@/components/prototyper-ui/ui/card";
import { PublicSection } from "@/components/public/PublicSection";
import { PublicSurfaceCard } from "@/components/public/PublicSurfaceCard";
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
    proofTitle: string;
    proofItems: Array<{ title: string; body: string }>;
    confidenceLine: string;
    featureCompareTitle: string;
    featureLabel: string;
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
      "Start with a free fit check, then move to Pro when you want to track multiple bikes, repeat fit sessions, and keep downloadable reports.",
    eyebrow: "Public plans",
    monthlySuffix: "/ month",
    faqTitle: "Pricing FAQ",
    ctaTitle: "Start with a free bike fit check",
    ctaBody:
      "No account needed for the calculator. See what your fit report includes before you decide whether Pro is worth it for your riding.",
    proofTitle: "Why riders trust this as a first step",
    proofItems: [
      {
        title: "Method-backed calculations",
        body: "Recommendations are based on established bike fitting formulas plus rider-specific corrections for your body and riding style.",
      },
      {
        title: "Concrete fit outputs",
        body: "Saddle height, reach, drop, crank length, and handlebar position in millimeters, plus a prioritized adjustment order.",
      },
      {
        title: "Honest about limits",
        body: "Online fitting gives you a strong starting point. For complex pain or injury, an in-person fitter is the better next step.",
      },
    ],
    confidenceLine: "No contract. Start free and upgrade or cancel at any time.",
    featureCompareTitle: "Compare live features",
    featureLabel: "Feature",
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
      "Begin met een gratis fit check en kies Pro wanneer je meerdere fietsen wilt volgen, vaker wilt herhalen en downloadbare rapporten nodig hebt.",
    eyebrow: "Publieke plannen",
    monthlySuffix: "/ maand",
    faqTitle: "Prijs-FAQ",
    ctaTitle: "Begin met een gratis bike fit check",
    ctaBody:
      "Voor de calculator heb je geen account nodig. Bekijk eerst wat je fitrapport bevat voordat je beslist of Pro past bij jouw gebruik.",
    proofTitle: "Waarom rijders dit vertrouwen als eerste stap",
    proofItems: [
      {
        title: "Onderbouwde methode",
        body: "Aanbevelingen zijn gebaseerd op beproefde bikefitting-formules plus correcties voor jouw lichaam en rijstijl.",
      },
      {
        title: "Concrete output",
        body: "Zadelhoogte, reach, drop, cranklengte en stuurpositie in millimeters, inclusief een prioriteitsvolgorde voor aanpassingen.",
      },
      {
        title: "Eerlijk over grenzen",
        body: "Online fitting geeft een sterke basis. Bij complexe klachten of blessures is een persoonlijke fitter de betere volgende stap.",
      },
    ],
    confidenceLine:
      "Geen contract. Start gratis en upgrade of annuleer op elk moment.",
    featureCompareTitle: "Vergelijk live functies",
    featureLabel: "Functie",
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
  const pricingFaqs = [
    {
      q: locale === "nl" ? "Kan ik meerdere fietsen beheren?" : "Can I manage multiple bikes?",
      a: commercialFaq.multipleBikeProfiles,
    },
    {
      q: locale === "nl" ? "Krijg ik rapporten?" : "Do I get reports?",
      a: commercialFaq.pdfReport,
    },
    {
      q: locale === "nl" ? "Hoe werkt de prijs?" : "How does pricing work?",
      a: commercialFaq.pricing,
    },
  ];

  return (
    <div className="bg-[linear-gradient(180deg,var(--background)_0%,color-mix(in_oklch,var(--muted)_42%,var(--background)_58%)_100%)] py-16">
      <JsonLd schema={buildFaqPageSchema(pricingFaqs)} />
      <TrackMarketingEventOnView
        eventType="pricing_view"
        locale={locale}
        pagePath={pagePath}
        section="pricing"
      />
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <Card className="gap-0 rounded-[2.25rem] border border-border/70 bg-card/95 px-6 py-10 text-center shadow-sm sm:px-10 sm:py-12">
          <p className="text-sm font-semibold uppercase tracking-[0.28em] text-primary">
            {page.eyebrow}
          </p>
          <h1 className="mt-4 text-4xl font-bold text-foreground sm:text-5xl">{page.title}</h1>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground">{page.subtitle}</p>
        </Card>

        <div className={`mt-14 grid gap-8 ${plans.length > 1 ? "md:grid-cols-2" : "md:grid-cols-1 md:max-w-xl"} mx-auto`}>
          {plans.map((plan) => {
            const localized = plan.copy[locale];
            return (
              <Card
                key={plan.id}
                className={`gap-0 rounded-[2rem] border p-8 shadow-sm transition ${plan.highlighted ? "border-primary bg-primary text-primary-foreground shadow-lg" : "border-border/70 bg-card/95"}`}
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
                    />
                  }
                  className={`mt-8 w-full ${plan.highlighted ? "border-background/50 bg-background text-primary after:bg-background hover-only:after:bg-muted" : ""}`}
                  variant={plan.highlighted ? "outline" : "default"}
                >
                  {localized.cta}
                </Button>
              </Card>
            );
          })}
        </div>

        <div className="mt-14">
          <PublicSection
            header={{
              title: page.proofTitle,
              align: "start",
            }}
            contentClassName="pt-6"
          >
            <div className="grid gap-6 md:grid-cols-3">
            {page.proofItems.map((item) => (
              <PublicSurfaceCard
                key={item.title}
                title={item.title}
                description={item.body}
              >
                <div />
              </PublicSurfaceCard>
            ))}
            </div>
          </PublicSection>
        </div>

        <p className="mt-6 text-center text-sm text-muted-foreground">{page.confidenceLine}</p>

        <div className="mt-16">
          <PublicSection
            header={{
              title: page.featureCompareTitle,
            }}
            contentClassName="pt-6"
          >
            <Card className="gap-0 overflow-hidden rounded-[1.5rem] border border-border/70 bg-background/90 shadow-none">
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-muted/40">
                      <tr className="border-b border-border">
                        <th className="px-4 py-4 text-left font-semibold text-foreground">{page.featureLabel}</th>
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
              </CardContent>
            </Card>
            {!PRODUCT_LIVE_FLAGS.moneyBackGuarantee ? (
              <p className="mt-4 text-sm text-muted-foreground">
                {locale === "nl"
                  ? "Er wordt op dit moment geen publieke geld-terug-garantie geclaimd."
                  : "No public money-back guarantee is claimed at this time."}
              </p>
            ) : null}
          </PublicSection>
        </div>

        <section className="mt-16 grid gap-6 md:grid-cols-3">
          <PublicSurfaceCard title={pricingFaqs[0].q} description={commercialFaq.multipleBikeProfiles}>
            <div />
          </PublicSurfaceCard>
          <PublicSurfaceCard title={pricingFaqs[1].q} description={commercialFaq.pdfReport}>
            <div />
          </PublicSurfaceCard>
          <PublicSurfaceCard title={pricingFaqs[2].q} description={commercialFaq.pricing}>
            <div />
          </PublicSurfaceCard>
        </section>

        <Card className="mt-16 gap-0 rounded-[2rem] bg-primary px-6 py-12 text-center text-primary-foreground shadow-lg sm:px-10">
          <h2 className="text-2xl font-semibold text-primary-foreground">{page.ctaTitle}</h2>
          <p className="mx-auto mt-3 max-w-3xl text-sm leading-7 text-primary-foreground/82">
            {page.ctaBody}
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Button
              render={
                <TrackedCtaLink
                  href={withLocalePrefix("/calculators/bike-fit", locale)}
                  locale={locale}
                  pagePath={pagePath}
                  section="pricing_footer_cta_primary"
                  ctaLabel={locale === "nl" ? "Start gratis fit" : "Start free fit"}
                />
              }
              size="lg"
              variant="outline"
              className="border-background/50 bg-background text-primary after:bg-background hover-only:after:bg-muted"
            >
              {locale === "nl" ? "Start gratis fit" : "Start free fit"}
            </Button>
            <Button
              render={
                <TrackedCtaLink
                  href={withLocalePrefix("/case-study", locale)}
                  locale={locale}
                  pagePath={pagePath}
                  section="pricing_footer_case_study_cta"
                  ctaLabel={locale === "nl" ? "Bekijk rider cases" : "Browse rider cases"}
                />
              }
              size="lg"
              variant="outline"
              className="border-primary-foreground/50 bg-transparent text-primary-foreground after:bg-transparent hover-only:after:bg-primary-foreground/10"
            >
              {locale === "nl" ? "Bekijk rider cases" : "Browse rider cases"}
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}
