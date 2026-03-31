import type { Metadata } from "next";
import { CheckCircle2, FileDown, Repeat, Bike } from "lucide-react";
import { getRequestLocale } from "@/i18n/request";
import { buildLocaleAlternates } from "@/i18n/metadata";
import { withLocalePrefix } from "@/i18n/navigation";
import { BRAND } from "@/config/brand";
import { PUBLIC_PLANS, formatEuroPriceFromCents } from "@/config/commercial";
import { FitPassLandingCta } from "@/components/features/fitpass/FitPassLandingCta";
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
        "Fit Pass gives you a downloadable PDF with all your bike fit values, unlimited sessions, and multiple bike profiles. €9/month.",
    },
    eyebrow: "Fit Pass",
    hero: "Your full bike fit report, ready to download.",
    subhero:
      "Fit Pass gives you a PDF with every adjustment value and priority — based on your measurements, your bike, and your riding style.",
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
        body: "Every step, in the right order. Start with saddle height, work through to handlebar reach — nothing left out.",
      },
      {
        icon: "sessions",
        title: "Unlimited sessions and bike profiles",
        body: "Re-run your fit any time — after a new bike, a weight change, or a position experiment. Each bike gets its own profile.",
      },
    ],
    howItWorksTitle: "How it works",
    steps: [
      { label: "Complete a fit session", body: "Enter your measurements and answer the questionnaire. Takes about 10 minutes." },
      { label: "Upgrade to Fit Pass", body: "One click. €9/month, cancel any time from account settings." },
      { label: "Download your PDF", body: "Your full report is available immediately. All values are the same as your on-screen results." },
    ],
    faqTitle: "Questions",
    faqs: [
      {
        q: "What is Fit Pass?",
        a: "Fit Pass is the paid tier for BestBikeFit4U (also called Pro). It unlocks PDF reports, unlimited fit sessions, and unlimited bike profiles.",
      },
      {
        q: "Can I cancel?",
        a: "Yes. You can cancel at any time from your account settings. Access continues until the end of the billing period.",
      },
      {
        q: "Do I need a bike already?",
        a: "No. You can run a fit session without a specific bike — the results give you reference values for what to look for when buying, or what to adjust on your current setup.",
      },
    ],
    finalCta: `Get Fit Pass — ${formatEuroPriceFromCents(proPlan.priceCentsMonthly, "en")}/month`,
    monthlySuffix: "/ month",
  },
  nl: {
    metadata: {
      title: "Fit Pass — Volledig rapport, onbeperkte sessies | BestBikeFit4U",
      description:
        "Met Fit Pass krijg je een downloadbaar PDF met alle bikefitting-waarden, onbeperkte sessies en meerdere fietsprofielen. €9/maand.",
    },
    eyebrow: "Fit Pass",
    hero: "Jouw complete bikefitting-rapport, klaar om te downloaden.",
    subhero:
      "Met Fit Pass ontvang je een PDF met alle aanpassingswaarden en prioriteiten — gebaseerd op jouw lichaamsmetingen, fiets en rijstijl.",
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
        body: "Elke stap, in de juiste volgorde. Begin met zadelhoogte, werk door naar stuurpenlengte — niets overgeslagen.",
      },
      {
        icon: "sessions",
        title: "Onbeperkte sessies en fietsprofielen",
        body: "Voer je fit opnieuw uit na een nieuwe fiets, gewichtsverandering of positie-experiment. Elke fiets krijgt zijn eigen profiel.",
      },
    ],
    howItWorksTitle: "Hoe het werkt",
    steps: [
      { label: "Voltooi een fit-sessie", body: "Voer je metingen in en beantwoord de vragenlijst. Duurt ongeveer 10 minuten." },
      { label: "Activeer Fit Pass", body: "Één klik. €9/maand, op elk moment opzegbaar via je accountinstellingen." },
      { label: "Download je PDF", body: "Je volledige rapport is direct beschikbaar. Alle waarden zijn gelijk aan je schermresultaten." },
    ],
    faqTitle: "Vragen",
    faqs: [
      {
        q: "Wat is Fit Pass?",
        a: "Fit Pass is het betaalde abonnement van BestBikeFit4U (ook wel Pro genoemd). Het geeft toegang tot PDF-rapporten, onbeperkte fit-sessies en onbeperkte fietsprofielen.",
      },
      {
        q: "Kan ik opzeggen?",
        a: "Ja. Je kunt op elk moment opzeggen via je accountinstellingen. Toegang blijft actief tot het einde van de factureringsperiode.",
      },
      {
        q: "Heb ik al een fiets nodig?",
        a: "Nee. Je kunt een fit-sessie uitvoeren zonder specifieke fiets — de resultaten geven referentiewaarden die je helpen bij het kopen van een fiets of het aanpassen van je huidige positie.",
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
  const loginHref = withLocalePrefix(`/login?redirect=/fit-pass`, locale);
  const dashboardHref = withLocalePrefix("/dashboard", locale);

  return (
    <div className="py-16">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">

        {/* Hero */}
        <section className="text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-[color:var(--border)] bg-[color:var(--background)] px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-[color:var(--primary)]">
            {c.eyebrow}
          </div>
          <h1 className="mt-5 text-4xl font-semibold tracking-tight text-[color:var(--foreground)] sm:text-5xl">
            {c.hero}
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-lg leading-8 text-[color:var(--muted-foreground)]">
            {c.subhero}
          </p>
          <div className="mt-8">
            <FitPassLandingCta
              locale={locale}
              label={c.cta}
              alreadyActiveLabel={c.alreadyActive}
              loginHref={loginHref}
              dashboardHref={dashboardHref}
            />
          </div>
        </section>

        {/* What you get */}
        <section className="mt-16">
          <h2 className="text-center text-xs font-semibold uppercase tracking-[0.24em] text-[color:var(--primary)]">
            {c.whatYouGet}
          </h2>
          <div className="mt-6 grid gap-4 sm:grid-cols-3">
            {c.features.map((feature) => (
              <div
                key={feature.title}
                className="rounded-2xl border border-[color:var(--border)] bg-[color:var(--card)] p-6"
              >
                <div className="mb-3 inline-flex rounded-xl bg-[color:var(--primary-soft)] p-2.5 text-[color:var(--primary)]">
                  {featureIcon(feature.icon)}
                </div>
                <h3 className="text-base font-semibold text-[color:var(--foreground)]">
                  {feature.title}
                </h3>
                <p className="mt-2 text-sm leading-6 text-[color:var(--muted-foreground)]">
                  {feature.body}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* How it works */}
        <section className="mt-14">
          <h2 className="text-center text-xs font-semibold uppercase tracking-[0.24em] text-[color:var(--primary)]">
            {c.howItWorksTitle}
          </h2>
          <div className="mt-6 grid gap-4 sm:grid-cols-3">
            {c.steps.map((step, i) => (
              <div key={step.label} className="flex gap-4">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[color:var(--primary)] text-sm font-bold text-[color:var(--primary-foreground)]">
                  {i + 1}
                </div>
                <div>
                  <p className="text-sm font-semibold text-[color:var(--foreground)]">{step.label}</p>
                  <p className="mt-1 text-sm leading-6 text-[color:var(--muted-foreground)]">{step.body}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* FAQ */}
        <section className="mt-14">
          <h2 className="text-center text-xs font-semibold uppercase tracking-[0.24em] text-[color:var(--primary)]">
            {c.faqTitle}
          </h2>
          <div className="mt-6 grid gap-4">
            {c.faqs.map((faq) => (
              <article
                key={faq.q}
                className="rounded-2xl border border-[color:var(--border)] bg-[color:var(--card)] p-5"
              >
                <h3 className="text-base font-semibold text-[color:var(--foreground)]">{faq.q}</h3>
                <p className="mt-2 text-sm leading-7 text-[color:var(--muted-foreground)]">{faq.a}</p>
              </article>
            ))}
          </div>
        </section>

        {/* Final CTA */}
        <section className="mt-14 rounded-[2rem] bg-[linear-gradient(160deg,color-mix(in_oklch,var(--primary)_92%,black_8%),color-mix(in_oklch,var(--primary)_72%,var(--warning)_28%))] p-8 text-center sm:p-10">
          <h2 className="text-2xl font-bold text-[color:var(--primary-foreground)] sm:text-3xl">
            {c.hero}
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-sm leading-7 text-[color:var(--primary-foreground)]/84">
            {c.subhero}
          </p>
          <div className="mt-6 flex justify-center">
            <FitPassLandingCta
              locale={locale}
              label={c.finalCta}
              alreadyActiveLabel={c.alreadyActive}
              loginHref={loginHref}
              dashboardHref={dashboardHref}
            />
          </div>
        </section>

      </div>
    </div>
  );
}
