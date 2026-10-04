import type { Locale } from "@/i18n/config";
import { PUBLIC_PLANS, formatEuroPriceFromCents } from "@/config/commercial";

const proPlan = PUBLIC_PLANS.find((plan) => plan.id === "pro")!;

export const fitPassPresentation = {
  nl: {
    title: "Je complete fit. Ook naast je fiets.",
    intro: "Alle afstelwaarden en prioriteiten in één PDF, gebaseerd op je lichaamsmaten, fiets en rijstijl.",
    pausedTitle: "Betalingen tijdelijk niet beschikbaar",
    paused: "Nieuwe betaalde abonnementen zijn tijdelijk niet beschikbaar. Je kunt de gratis functies blijven gebruiken.",
    loading: "Laad je accountstatus",
    imageAlt: "Pentekening van het afstellen van een fietscockpit",
    tag: "Bewaren · delen · opnieuw afstellen",
    visualTitle: "Van advies naar afstelling.",
    visualBody: "Bewaar je rapport als referentie. Of neem het mee naar je fietsenwinkel of fitter.",
    featuresTitle: "Je aanbevelingen. Bij elkaar, voor later.",
    processTitle: "Van je maten naar je rapport.",
    processIntro: "Begin met een gratis fit. Activeer daarna Fit Pass om je volledige rapport te bewaren.",
    processPaused: "Begin met een gratis fit. Nieuwe betaalde abonnementen zijn tijdelijk niet beschikbaar.",
    processLink: "Bekijk hoe een fit werkt",
    unavailable: "Tijdelijk niet beschikbaar",
    pausedStep: "Je kunt nu geen nieuw betaald abonnement afsluiten. De gratis functies blijven beschikbaar.",
    reportStep: "Heb je al een actieve Fit Pass? Je volledige rapport bevat dezelfde waarden als op je scherm.",
    faqTitle: "Voor je verdergaat.",
    pricingLink: "Vergelijk de mogelijkheden",
    finalEyebrow: "Begin met je gratis fit",
    finalTitle: "Je volgende stap hoeft niet te wachten.",
    finalPaused: "Maak gratis een account aan en blijf de gratis functies gebruiken.",
  },
  en: {
    title: "Your complete fit. Beyond the bike.",
    intro: "Every adjustment value and priority in one PDF, based on your measurements, bike and riding style.",
    pausedTitle: "Payments temporarily unavailable",
    paused: "New paid subscriptions are temporarily unavailable. You can continue using the free features.",
    loading: "Loading your account status",
    imageAlt: "Pen drawing of a bicycle cockpit adjustment",
    tag: "Save · share · adjust again",
    visualTitle: "From advice to adjustment.",
    visualBody: "Keep your report for reference. Or take it to your bike shop or fitter.",
    featuresTitle: "Your recommendations. Together, for later.",
    processTitle: "From your measurements to your report.",
    processIntro: "Start with a free fit. Then activate Fit Pass to keep your complete report.",
    processPaused: "Start with a free fit. New paid subscriptions are temporarily unavailable.",
    processLink: "See how a fit works",
    unavailable: "Temporarily unavailable",
    pausedStep: "You cannot start a new paid subscription right now. The free features remain available.",
    reportStep: "Already have an active Fit Pass? Your full report contains the same values you see on screen.",
    faqTitle: "Before you continue.",
    pricingLink: "Compare your options",
    finalEyebrow: "Start with your free fit",
    finalTitle: "Your next step does not have to wait.",
    finalPaused: "Create a free account and keep using the free features.",
  },
} satisfies Record<Locale, Record<string, string>>;

export const fitPassCopy: Record<
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
      title: "Fit Pass — Full report, unlimited sessions | BikeFitBoost",
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
        a: "Fit Pass is the paid tier for BikeFitBoost, also called Pro. It unlocks PDF reports, unlimited fit sessions, and unlimited bike profiles.",
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
      title: "Fit Pass — Volledig rapport, onbeperkte sessies | BikeFitBoost",
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
        a: "Fit Pass is het betaalde abonnement van BikeFitBoost, ook wel Pro genoemd. Het geeft toegang tot PDF-rapporten, onbeperkte fit-sessies en onbeperkte fietsprofielen.",
      },
      {
        q: "Kan ik opzeggen?",
        a: "Ja. Je kunt op elk moment opzeggen via je accountinstellingen. Toegang blijft actief tot het einde van de factureringsperiode.",
      },
      {
        q: "Heb ik al een fiets nodig?",
        a: "Nee. Je kunt een fitsessie uitvoeren zonder specifieke fiets. De resultaten geven referentiewaarden voor aankoop of aanpassing van je huidige fietsafstelling.",
      },
    ],
    finalCta: `Fit Pass activeren — ${formatEuroPriceFromCents(proPlan.priceCentsMonthly, "nl")}/maand`,
    monthlySuffix: "/ maand",
  },
};
