import type { Metadata } from "next";
import { Bike, CheckCircle2, FileDown, Repeat, Sparkles } from "lucide-react";
import { buildLocaleAlternates } from "@/i18n/metadata";
import { withLocalePrefix } from "@/i18n/navigation";
import { getRequestLocale } from "@/i18n/request";
import { PUBLIC_PLANS, formatEuroPriceFromCents } from "@/config/commercial";
import { FitPassLandingCta } from "@/components/features/fitpass/FitPassLandingCta";
import {
  PublicCtaBand,
  PublicFeatureCard,
  PublicHero,
  PublicPageShell,
  PublicSection,
  PublicSurfaceCard,
} from "@/components/public";
import type { Locale } from "@/i18n/config";

const proPlan = PUBLIC_PLANS.find((p) => p.id === "pro")!;

const copy: Record<
  Locale,
  {
    metadata: { title: string; description: string };
    eyebrow: string;
    hero: string;
    subhero: string;
    cta: string;
    alreadyActive: string;
    whatYouGet: string;
    features: { icon: "pdf" | "sessions" | "sequence"; title: string; body: string }[];
    howItWorksTitle: string;
    steps: { label: string; body: string }[];
    faqTitle: string;
    faqs: { q: string; a: string }[];
    finalCta: string;
    monthlySuffix: string;
  }
> = {
  en: {
    metadata: {
      title: "Fit Pass — Full report, unlimited sessions | BestBikeFit4U",
      description:
        "Fit Pass gives you a downloadable PDF with all your bike fit values, unlimited sessions, and multiple bike profiles. EUR9/month.",
    },
    eyebrow: "Fit Pass",
    hero: "Your full bike fit report, ready to download.",
    subhero:
      "Fit Pass gives you a PDF with every adjustment value and priority, based on your measurements, your bike, and your riding style.",
    cta: `Get Fit Pass — ${formatEuroPriceFromCents(proPlan.priceCentsMonthly, "en")}/month`,
    alreadyActive: "Fit Pass is active",
    whatYouGet: "What you get",
    features: [
      {
        icon: "pdf",
        title: "Downloadable PDF report",
        body: "Every adjustment value in one file. Share it with your bike shop, your fitter, or keep it for reference.",
      },
      {
        icon: "sequence",
        title: "Full adjustment sequence",
        body: "Every step, in the right order. Start with saddle height, work through to handlebar reach, with nothing left out.",
      },
      {
        icon: "sessions",
        title: "Unlimited sessions and bike profiles",
        body: "Re-run your fit after a new bike, a weight change, or a position experiment. Each bike gets its own profile.",
      },
    ],
    howItWorksTitle: "How it works",
    steps: [
      { label: "Complete a fit session", body: "Enter your measurements and answer the questionnaire. It takes about 10 minutes." },
      { label: "Upgrade to Fit Pass", body: "One click. EUR9/month, and you can cancel any time from account settings." },
      { label: "Download your PDF", body: "Your full report is available immediately, with the same values you see on screen." },
    ],
    faqTitle: "Questions",
    faqs: [
      {
        q: "What is Fit Pass?",
        a: "Fit Pass is the paid tier for BestBikeFit4U, also called Pro. It unlocks PDF reports, unlimited fit sessions, and unlimited bike profiles.",
      },
      {
        q: "Can I cancel?",
        a: "Yes. You can cancel any time from your account settings. Access continues until the end of the billing period.",
      },
      {
        q: "Do I need a bike already?",
        a: "No. You can run a fit session without a specific bike. The results give you reference values for what to buy or what to adjust on your current setup.",
      },
    ],
    finalCta: `Get Fit Pass — ${formatEuroPriceFromCents(proPlan.priceCentsMonthly, "en")}/month`,
    monthlySuffix: "/ month",
  },
  nl: {
    metadata: {
      title: "Fit Pass — Volledig rapport, onbeperkte sessies | BestBikeFit4U",
      description:
        "Met Fit Pass krijg je een downloadbaar PDF met alle bikefitting-waarden, onbeperkte sessies en meerdere fietsprofielen. EUR9/maand.",
    },
    eyebrow: "Fit Pass",
    hero: "Jouw complete bikefitting-rapport, klaar om te downloaden.",
    subhero:
      "Met Fit Pass ontvang je een PDF met alle aanpassingswaarden en prioriteiten, gebaseerd op jouw lichaamsmetingen, fiets en rijstijl.",
    cta: `Fit Pass activeren — ${formatEuroPriceFromCents(proPlan.priceCentsMonthly, "nl")}/maand`,
    alreadyActive: "Fit Pass is actief",
    whatYouGet: "Wat je krijgt",
    features: [
      {
        icon: "pdf",
        title: "Downloadbaar PDF-rapport",
        body: "Alle aanpassingswaarden in één bestand. Deel het met je fietsenwinkel, je fitter of bewaar het als referentie.",
      },
      {
        icon: "sequence",
        title: "Volledige aanpassingsvolgorde",
        body: "Elke stap, in de juiste volgorde. Begin met zadelhoogte en werk door naar je cockpit, zonder hiaten.",
      },
      {
        icon: "sessions",
        title: "Onbeperkte sessies en fietsprofielen",
        body: "Voer je fit opnieuw uit na een nieuwe fiets, gewichtsverandering of positie-experiment. Elke fiets krijgt een eigen profiel.",
      },
    ],
    howItWorksTitle: "Hoe het werkt",
    steps: [
      { label: "Voltooi een fit-sessie", body: "Voer je metingen in en beantwoord de vragenlijst. Dit duurt ongeveer 10 minuten." },
      { label: "Activeer Fit Pass", body: "Eén klik. EUR9/maand, op elk moment opzegbaar via je accountinstellingen." },
      { label: "Download je PDF", body: "Je volledige rapport is direct beschikbaar, met dezelfde waarden als op je scherm." },
    ],
    faqTitle: "Vragen",
    faqs: [
      {
        q: "Wat is Fit Pass?",
        a: "Fit Pass is het betaalde abonnement van BestBikeFit4U, ook wel Pro genoemd. Het geeft toegang tot PDF-rapporten, onbeperkte fit-sessies en onbeperkte fietsprofielen.",
      },
      {
        q: "Kan ik opzeggen?",
        a: "Ja. Je kunt op elk moment opzeggen via je accountinstellingen. Toegang blijft actief tot het einde van de factureringsperiode.",
      },
      {
        q: "Heb ik al een fiets nodig?",
        a: "Nee. Je kunt een fit-sessie uitvoeren zonder specifieke fiets. De resultaten geven referentiewaarden voor aankoop of aanpassing van je huidige setup.",
      },
    ],
    finalCta: `Fit Pass activeren — ${formatEuroPriceFromCents(proPlan.priceCentsMonthly, "nl")}/maand`,
    monthlySuffix: "/ maand",
  },
};

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getRequestLocale();
  const c = copy[locale];
  const alternates = buildLocaleAlternates("/fit-pass", locale);
  return {
    title: c.metadata.title,
    description: c.metadata.description,
    alternates,
    openGraph: {
      title: c.metadata.title,
      description: c.metadata.description,
      url: alternates.canonical,
    },
  };
}

const featureIcon = (icon: "pdf" | "sessions" | "sequence") => {
  if (icon === "pdf") return <FileDown className="h-5 w-5" />;
  if (icon === "sessions") return <Repeat className="h-5 w-5" />;
  return <Bike className="h-5 w-5" />;
};

export default async function FitPassPage() {
  const locale = await getRequestLocale();
  const c = copy[locale];
  const isNl = locale === "nl";
  const loginHref = withLocalePrefix("/login?redirect=/fit-pass", locale);
  const dashboardHref = withLocalePrefix("/dashboard", locale);

  return (
    <PublicPageShell>
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <PublicHero
          eyebrow={c.eyebrow}
          title={c.hero}
          description={c.subhero}
          chips={
            isNl
              ? ["PDF rapport", "Onbeperkte sessies", "NL en EN beschikbaar"]
              : ["PDF report", "Unlimited sessions", "Available in Dutch and English"]
          }
          actions={
            <FitPassLandingCta
              locale={locale}
              label={c.cta}
              alreadyActiveLabel={c.alreadyActive}
              loginHref={loginHref}
              dashboardHref={dashboardHref}
            />
          }
        />

        <PublicSection
          className="mt-10"
          header={{
            eyebrow: c.whatYouGet,
            title: isNl ? "Wat Fit Pass concreet toevoegt" : "What Fit Pass adds in practice",
            description: isNl
              ? "Dit is bedoeld voor rijders die hun aanbevelingen willen bewaren, delen en opnieuw willen valideren over meerdere sessies."
              : "This is built for riders who want to save, share, and revisit their recommendations across multiple sessions.",
          }}
        >
          <div className="grid gap-4 sm:grid-cols-3">
            {c.features.map((feature) => (
              <PublicFeatureCard
                key={feature.title}
                icon={featureIcon(feature.icon)}
                title={feature.title}
                description={feature.body}
              />
            ))}
          </div>
        </PublicSection>

        <PublicSection
          className="mt-10"
          header={{
            eyebrow: c.howItWorksTitle,
            title: isNl ? "Van fit-sessie naar downloadbaar rapport" : "From fit session to downloadable report",
            description: isNl
              ? "De flow blijft eenvoudig: je doet eerst de gratis fit, en activeert daarna Fit Pass wanneer je de volledige output wilt bewaren."
              : "The flow stays simple: complete the free fit first, then activate Fit Pass when you want to keep the full output.",
          }}
        >
          <div className="grid gap-4">
            {c.steps.map((step, i) => (
              <div
                key={step.label}
                className="grid gap-4 rounded-[var(--radius-xl)] border border-border/80 bg-card px-5 py-5 sm:grid-cols-[auto_1fr]"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-sm font-semibold text-primary-foreground">
                  {i + 1}
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground">{step.label}</p>
                  <p className="mt-1 text-sm leading-6 text-muted-foreground">{step.body}</p>
                </div>
              </div>
            ))}
          </div>
        </PublicSection>

        <PublicSection
          className="mt-10"
          header={{
            eyebrow: c.faqTitle,
            title: isNl ? "Wat rijders meestal willen weten" : "What riders usually want to know",
            description: isNl
              ? "Duidelijke verwachtingen vergroten vertrouwen, vooral rond toegang, opzeggen en gebruik zonder vaste fiets."
              : "Clear expectations matter here, especially around access, cancellation, and using the product before you have a final bike.",
          }}
        >
          <div className="grid gap-4">
            {c.faqs.map((faq) => (
              <PublicSurfaceCard key={faq.q} title={faq.q} description={faq.a} leading={<CheckCircle2 className="h-5 w-5" />}>
                <div />
              </PublicSurfaceCard>
            ))}
          </div>
        </PublicSection>

        <PublicCtaBand
          className="mt-12"
          eyebrow={c.eyebrow}
          title={c.hero}
          description={c.subhero}
          actions={
            <FitPassLandingCta
              locale={locale}
              label={c.finalCta}
              alreadyActiveLabel={c.alreadyActive}
              loginHref={loginHref}
              dashboardHref={dashboardHref}
            />
          }
          aside={
            <span className="inline-flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-primary" />
              {isNl
                ? `Gebaseerd op dezelfde fitlogica als de gratis flow, met bewaarde output voor later gebruik.`
                : "Built on the same fit logic as the free flow, with saved output for later use."}
            </span>
          }
        />
      </div>
    </PublicPageShell>
  );
}
