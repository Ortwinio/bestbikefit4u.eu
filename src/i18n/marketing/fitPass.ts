import type { Locale } from "@/i18n/config";
import { FIT_PASS_PRODUCT, formatEuroPriceFromCents } from "@/config/commercial";

const singlePrice = (locale: Locale) => formatEuroPriceFromCents(FIT_PASS_PRODUCT.priceCents, locale);

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
    processIntro: "Begin met een gratis fit. Kies daarna een losse meting voor één fiets of een jaarabonnement voor al je fietsen.",
    processPaused: "Begin met een gratis fit. Nieuwe betaalde abonnementen zijn tijdelijk niet beschikbaar.",
    processLink: "Bekijk hoe een fit werkt",
    unavailable: "Tijdelijk niet beschikbaar",
    pausedStep: "Je kunt nu geen nieuw betaald abonnement afsluiten. De gratis functies blijven beschikbaar.",
    reportStep: "Heb je al volledige toegang voor je fiets? Je volledige rapport bevat dezelfde waarden als op je scherm.",
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
    processIntro: "Start with a free fit. Then choose a single measurement for one bike or an annual subscription for all your bikes.",
    processPaused: "Start with a free fit. New paid subscriptions are temporarily unavailable.",
    processLink: "See how a fit works",
    unavailable: "Temporarily unavailable",
    pausedStep: "You cannot start a new paid subscription right now. The free features remain available.",
    reportStep: "Already have full access for your bike? Your full report contains the same values you see on screen.",
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
  }
> = {
  en: {
    metadata: {
      title: "Single measurement — One bike, three months | BikeFitBoost",
      description:
        `A single measurement gives you a complete setup plan for one bike and three months of access. ${singlePrice("en")} one-off, including VAT.`,
    },
    eyebrow: "Single measurement",
    hero: "Your full bike fit report, ready to download.",
    subhero:
      "A single measurement gives you a PDF with every adjustment value and priority, based on your measurements, your bike, and your riding style.",
    cta: `Choose a single measurement — ${singlePrice("en")} incl. VAT`,
    alreadyActive: "Your single measurement is active",
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
        title: "One bike, three months",
        body: "Use the full setup plan for your selected bike for three months. Choose an annual subscription for all your bikes.",
      },
    ],
    howItWorksTitle: "How it works",
    steps: [
      { label: "Complete a fit session", body: "Enter your measurements and answer the questionnaire. It takes about 10 minutes." },
      { label: "Choose a single measurement", body: `Choose one bike for three months. ${singlePrice("en")} one-off, including VAT. Checkout through Stripe is not yet implemented.` },
      { label: "Download your PDF", body: "After activation, your report contains the same values as the screen. No purchase is activated while Stripe checkout is unavailable." },
    ],
    faqTitle: "Questions",
    faqs: [
      {
        q: "What is a single measurement?",
        a: `A single measurement opens the complete setup plan for one bike for three months. It costs ${singlePrice("en")} once, including VAT.`,
      },
      {
        q: "Does a single measurement renew?",
        a: "No. A single measurement ends after three months. An annual subscription is a separate choice.",
      },
      {
        q: "Do I need a bike already?",
        a: "No. You can run a fit session without a specific bike. The results give you reference values for what to buy or what to adjust on your current setup.",
      },
    ],
    finalCta: `Choose a single measurement — ${singlePrice("en")} incl. VAT`,
  },
  nl: {
    metadata: {
      title: "Losse meting — Eén fiets, drie maanden | BikeFitBoost",
      description:
        `Met een losse meting krijg je een volledig stappenplan voor één fiets en drie maanden toegang. Eenmalig ${singlePrice("nl")}, inclusief btw.`,
    },
    eyebrow: "Losse meting",
    hero: "Jouw complete bikefitting-rapport, klaar om te downloaden.",
    subhero:
      "Met een losse meting ontvang je een PDF met alle aanpassingswaarden en prioriteiten, gebaseerd op jouw lichaamsmetingen, fiets en rijstijl.",
    cta: `Kies een losse meting — ${singlePrice("nl")} incl. btw`,
    alreadyActive: "Je losse meting is actief",
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
        title: "Eén fiets, drie maanden",
        body: "Gebruik drie maanden het volledige stappenplan voor je gekozen fiets. Kies een jaarabonnement voor al je fietsen.",
      },
    ],
    howItWorksTitle: "Hoe het werkt",
    steps: [
      { label: "Voltooi een fit-sessie", body: "Voer je metingen in en beantwoord de vragenlijst. Dit duurt ongeveer 10 minuten." },
      { label: "Kies een losse meting", body: `Kies één fiets voor drie maanden. Eenmalig ${singlePrice("nl")}, inclusief btw. Betalen via Stripe is nog niet geïmplementeerd.` },
      { label: "Download je PDF", body: "Na activering bevat je rapport dezelfde waarden als op je scherm. Zolang betalen via Stripe niet beschikbaar is, wordt geen aankoop geactiveerd." },
    ],
    faqTitle: "Vragen",
    faqs: [
      {
        q: "Wat is een losse meting?",
        a: `Een losse meting opent het volledige stappenplan voor één fiets, drie maanden lang. Je betaalt eenmalig ${singlePrice("nl")}, inclusief btw.`,
      },
      {
        q: "Wordt een losse meting verlengd?",
        a: "Nee. Een losse meting eindigt na drie maanden. Een jaarabonnement is een aparte keuze.",
      },
      {
        q: "Heb ik al een fiets nodig?",
        a: "Nee. Je kunt een fitsessie uitvoeren zonder specifieke fiets. De resultaten geven referentiewaarden voor aankoop of aanpassing van je huidige fietsafstelling.",
      },
    ],
    finalCta: `Kies een losse meting — ${singlePrice("nl")} incl. btw`,
  },
};
