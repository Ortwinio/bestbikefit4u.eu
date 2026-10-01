import type { Locale } from "@/i18n/config";

export const pricingCopy: Record<
  Locale,
  {
    metadata: { title: string; description: string; keywords: string[] };
    campaignMetadata: { title: string; keywords: string[] };
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
    guarantee: string;
    paymentsUnavailable: string;
    unavailable: string;
    start: string;
    donate: string;
    questions: [string, string, string];
  }
> = {
  en: {
    campaignMetadata: { title: "Temporary Free Bike Fit | BestBikeFit4U", keywords: ["free bike fit", "voluntary donation", "Alpe d'HuZes", "temporary campaign"] },
    metadata: {
      title: "Pricing | BestBikeFit4U",
      description:
        "Compare BestBikeFit4U Free and Pro plans. All public prices are monthly in EUR and only reflect features that are live today.",
      keywords: ["bike fit pricing", "online bike fit price", "bike fit plans eur"],
    },
    title: "Clear pricing for real riders",
    subtitle:
      "Start with a free fit check. Choose Pro when you want to track multiple bikes and download PDF reports.",
    eyebrow: "Pricing",
    monthlySuffix: "/ month",
    faqTitle: "Pricing FAQ",
    ctaTitle: "Try it first. No account needed.",
    ctaBody:
      "The calculators are free. Decide afterwards whether Pro fits your needs.",
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
    featureCompareTitle: "Compare",
    guarantee: "No public money-back guarantee is claimed at this time.",
    featureLabel: "Feature",
    paymentsUnavailable: "Payments are temporarily unavailable. You can still create a free account.",
    unavailable: "Temporarily unavailable",
    start: "Start free bike fit",
    donate: "Make a donation",
    questions: ["Can I manage multiple bikes?", "Do I get reports?", "How does pricing work?"],
  },
  nl: {
    campaignMetadata: { title: "Tijdelijk gratis bike fit | BestBikeFit4U", keywords: ["gratis bike fit", "vrijwillige donatie", "Alpe d'HuZes", "tijdelijke campagne"] },
    metadata: {
      title: "Prijzen | BestBikeFit4U",
      description:
        "Vergelijk BestBikeFit4U Free en Pro. Alle publieke prijzen zijn maandelijks in euro en tonen alleen functies die nu live zijn.",
      keywords: ["bike fit prijzen", "online bike fit prijs", "bike fit plannen euro"],
    },
    title: "Heldere prijzen voor echte rijders",
    subtitle:
      "Begin met een gratis bikefit. Kies Pro als je meerdere fietsen wilt volgen en PDF-rapporten nodig hebt.",
    eyebrow: "Prijzen",
    monthlySuffix: "/ maand",
    faqTitle: "Veelgestelde vragen over prijzen",
    ctaTitle: "Eerst proberen? Geen account nodig.",
    ctaBody:
      "De calculators zijn gratis. Beslis daarna of Pro bij je past.",
    proofTitle: "Waarom rijders dit vertrouwen als eerste stap",
    proofItems: [
      {
        title: "Onderbouwde methode",
        body: "Aanbevelingen zijn gebaseerd op beproefde bikefitting-formules plus correcties voor jouw lichaam en rijstijl.",
      },
      {
        title: "Concrete afstelwaarden",
        body: "Zadelhoogte, reach, drop, cranklengte en stuurpositie in millimeters, inclusief een prioriteitsvolgorde voor aanpassingen.",
      },
      {
        title: "Eerlijk over grenzen",
        body: "Online fitting geeft een sterke basis. Bij complexe klachten of blessures is een persoonlijke fitter de betere volgende stap.",
      },
    ],
    confidenceLine:
      "Geen contract. Start gratis en upgrade of annuleer op elk moment.",
    featureCompareTitle: "Vergelijk",
    guarantee: "Er wordt op dit moment geen publieke geld-terug-garantie geclaimd.",
    featureLabel: "Functie",
    paymentsUnavailable: "Betalingen zijn tijdelijk niet beschikbaar. Je kunt wel gratis een account aanmaken.",
    unavailable: "Tijdelijk niet beschikbaar",
    start: "Start gratis bike fit",
    donate: "Doneer voor Alpe d'HuZes",
    questions: ["Kan ik meerdere fietsen beheren?", "Krijg ik rapporten?", "Hoe werkt de prijs?"],
  },
};
