import type { Metadata } from "next";
import { Check } from "lucide-react";
import { JsonLd } from "@/components/seo/JsonLd";
import { TrackMarketingEventOnView } from "@/components/analytics/MarketingEventTracker";
import { TrackedCtaLink } from "@/components/analytics/TrackedCtaLink";
import { CampaignCtaGroup } from "@/components/campaign/CampaignCtaGroup";
import { Button } from "@/components/prototyper-ui/ui/button";
import { Card, CardContent } from "@/components/prototyper-ui/ui/card";
import {
  PublicCtaBand,
  PublicHero,
  PublicPageShell,
  PublicSection,
  PublicSurfaceCard,
  RatingBadge,
} from "@/components/public";
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
  const campaignActive = isConsumerCampaignActive();
  const campaign = getConsumerCampaignCopy(locale);
  const alternates = buildLocaleAlternates("/pricing", locale);
  const metadata = campaignActive
    ? {
        title:
          locale === "nl"
            ? "Tijdelijk gratis bike fit | BestBikeFit4U"
            : "Temporary Free Bike Fit | BestBikeFit4U",
        description: campaign.pricingDescription,
        keywords:
          locale === "nl"
            ? ["gratis bike fit", "vrijwillige donatie", "Alpe d'HuZes", "tijdelijke campagne"]
            : ["free bike fit", "voluntary donation", "Alpe d'HuZes", "temporary campaign"],
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
  const page = copy[locale];
  const campaignActive = isConsumerCampaignActive();
  const campaign = getConsumerCampaignCopy(locale);
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
    <PublicPageShell className="bg-[linear-gradient(180deg,var(--background)_0%,color-mix(in_oklch,var(--muted)_42%,var(--background)_58%)_100%)]">
      <JsonLd schema={buildFaqPageSchema(pricingFaqs)} />
      <TrackMarketingEventOnView
        eventType="pricing_view"
        locale={locale}
        pagePath={pagePath}
        section="pricing"
      />
      <PublicHero eyebrow={page.eyebrow} title={page.title} description={page.subtitle} />
      <div className="mt-4">
        <RatingBadge rating="4.8" count={locale === "nl" ? "380+ rijders" : "380+ riders"} />
      </div>

      {campaignActive ? (
        <Card className="public-card-surface mt-14 gap-0 rounded-[2rem] border px-6 py-8 shadow-sm sm:px-8">
          <CardContent className="px-0 py-0">
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-primary">
              {campaign.pricingTitle}
            </p>
            <h2 className="mt-4 text-3xl font-semibold text-foreground sm:text-4xl">
              {campaign.homepageTitle}
            </h2>
            <p className="mt-4 max-w-3xl text-base leading-7 text-muted-foreground">
              {campaign.pricingDescription}
            </p>
            <div className="mt-6">
              <CampaignCtaGroup
                locale={locale}
                pagePath={pagePath}
                startHref={withLocalePrefix("/calculators/bike-fit", locale)}
                startSection="pricing_campaign_start"
                donateHref={CONSUMER_CAMPAIGN_CONFIG.donationUrl}
                donateSection="pricing_campaign_donate"
                startLabel={campaign.startFreeCta}
                donateLabel={locale === "nl" ? "Doneer voor Alpe d'HuZes" : "Make a donation"}
                buttonSize="lg"
              />
            </div>
            <p className="mt-4 text-sm text-muted-foreground">{campaign.optionalNote}</p>
          </CardContent>
        </Card>
      ) : (
        <div
          className={`mx-auto mt-14 grid gap-8 ${plans.length > 1 ? "md:grid-cols-2" : "md:max-w-xl md:grid-cols-1"}`}
        >
          {plans.map((plan) => {
            const localized = plan.copy[locale];
            return (
              <Card
                key={plan.id}
                className={`gap-0 rounded-[2rem] border p-8 shadow-sm ${plan.highlighted ? "public-card-surface border-[color:var(--primary)] ring-1 ring-[color:color-mix(in_oklch,var(--primary)_22%,transparent)] shadow-lg" : "public-card-surface-subtle border-[color:var(--border)]"}`}
              >
                {localized.badge ? (
                  <p
                    className={`mb-4 text-sm font-semibold uppercase tracking-[0.22em] ${plan.highlighted ? "text-[color:var(--primary)]" : "text-[color:var(--muted-foreground)]"}`}
                  >
                    {localized.badge}
                  </p>
                ) : null}
                <h2 className="text-2xl font-semibold text-foreground">{localized.name}</h2>
                <p className="mt-2 text-sm text-muted-foreground">{localized.description}</p>
                <div className="mt-6 flex items-end gap-2">
                  <span className="text-4xl font-bold text-foreground">
                    {formatEuroPriceFromCents(plan.priceCentsMonthly, locale)}
                  </span>
                  <span className="pb-1 text-sm text-muted-foreground">{page.monthlySuffix}</span>
                </div>

                <ul className="mt-8 space-y-3">
                  {localized.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-3">
                      <Check className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
                      <span className="text-sm text-muted-foreground">{feature}</span>
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
                  className="mt-8 w-full"
                  variant="outline"
                >
                  {localized.cta}
                </Button>
              </Card>
            );
          })}
        </div>
      )}

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
                      <th className="px-4 py-4 text-left font-semibold text-foreground">
                        {page.featureLabel}
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

      <PublicCtaBand
        className="mt-16"
        title={page.ctaTitle}
        description={page.ctaBody}
        actions={
          <Button
            render={
              <TrackedCtaLink
                href={withLocalePrefix("/calculators/bike-fit", locale)}
                locale={locale}
                pagePath={pagePath}
                section="pricing_footer_cta_primary"
                ctaLabel={locale === "nl" ? "Start gratis bike fit" : "Start free bike fit"}
              />
            }
            size="lg"
          >
            {locale === "nl" ? "Start gratis bike fit" : "Start free bike fit"}
          </Button>
        }
      />
    </PublicPageShell>
  );
}
