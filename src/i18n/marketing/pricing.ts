import type { Locale } from "@/i18n/config";
import { PRODUCTS, type ProductId } from "../../../shared/pricing/products";

export type PricingProductId = Extract<ProductId, "single" | "annual" | "annual_personal">;

function productPrice(productId: PricingProductId, locale: Locale) {
  return `€${(PRODUCTS[productId].priceCents / 100).toFixed(2).replace(".", locale === "nl" ? "," : ".")}`;
}

export type PricingProductCopy = {
  name: string;
  description: string;
  price: string;
  period: string;
  renewal?: string;
  badge?: string;
  facts: [string, string][];
  features: string[];
  cta: string;
};

type PricingCopy = {
  metadata: { title: string; description: string; keywords: string[] };
  eyebrow: string;
  title: string;
  subtitle: string;
  vat: string;
  vatShort: string;
  freePrompt: string;
  freeLink: string;
  freeDetail: string;
  free: string;
  gift: { title: string; body: string; cta: string };
  products: Record<PricingProductId, PricingProductCopy>;
  featureCompareTitle: string;
  featureLabel: string;
  included: string;
  excluded: string;
  comparison: { label: string; values: [boolean | string, boolean | string, boolean | string, boolean | string] }[];
  accountNote: string;
  adviceEyebrow: string;
  adviceTitle: string;
  advice: string[];
  proofItems: { title: string; body: string }[];
  faqTitle: string;
  allQuestions: string;
  faqs: { q: string; a: string }[];
  ctaTitle: string;
  ctaBody: string;
  start: string;
};

export const pricingCopy: Record<Locale, PricingCopy> = {
  nl: {
    metadata: {
      title: "Prijzen | BikeFitBoost",
      description: "Een losse meting voor €13,50 of een jaar al je fietsen afstellen voor €21,50. Met persoonlijke bikefit: €234,50. Inclusief btw.",
      keywords: ["bikefit prijzen", "online bikefit prijs", "jaarabonnement bikefit"],
    },
    eyebrow: "Prijzen",
    title: "Een goede bikefit, betaalbaar",
    subtitle: "Met het jaarabonnement stel je een jaar lang al je fietsen af en bewaar je de afstellingen, voor €21,50. Gaat het om één fiets, dan volstaat een losse meting.",
    vat: "Alle prijzen inclusief 21% btw. Geen maandabonnement, geen verborgen kosten.",
    vatShort: "incl. 21% btw",
    freePrompt: "Eerst gratis beginnen?",
    freeLink: "Maak een gratis account",
    freeDetail: "en bewaar je profiel en 1 fiets.",
    free: "Gratis",
    gift: { title: "Cadeau ontvangen?", body: "Verzilver je bikefit binnen een maand voor één fiets. Je betaalt niets.", cta: "Verzilver je cadeau" },
    products: {
      single: {
        name: "Losse meting", description: "Het volledige stappenplan voor één fiets, in de juiste volgorde.",
        price: productPrice("single", "nl"), period: "eenmalig", facts: [["Looptijd", "3 maanden"], ["Fietsen", "1"]],
        features: ["Gedetailleerde fit-tabel en stappenplan", "Bandenspanning, controleplan, fit-notities en klimprofiel", "Opnieuw berekenen na een aanpassing"],
        cta: "Kies losse meting",
      },
      annual: {
        name: "Jaarabonnement", description: "Al je fietsen afstellen en hun afstelwaarden bewaren.",
        price: productPrice("annual", "nl"), period: "per jaar", renewal: "Verlengt automatisch voor €21,50 per jaar. Altijd online opzegbaar.", badge: "Favoriete keuze",
        facts: [["Looptijd", "12 maanden"], ["Fietsen", "Onbeperkt"]],
        features: ["12 maanden optimaliseren", "2 cadeaumetingen per jaar", "Alles uit de losse meting, voor al je fietsen", "Afstelwaarden van al je fietsen bewaren", "Klimplanner en volledige geschiedenis"],
        cta: "Kies het jaarabonnement",
      },
      annual_personal: {
        name: "Jaarabonnement + persoonlijke bikefit", description: "Je online profiel als basis, afgerond bij een fitter.",
        price: productPrice("annual_personal", "nl"), period: "eerste jaar", renewal: "De afspraak is eenmalig. Daarna verlengt het als jaarabonnement voor €21,50 per jaar.", badge: "Met persoonlijke afspraak",
        facts: [["Afspraak", "1 persoonlijke bikefit"], ["Locatie en duur", "Neem contact met ons op"]],
        features: ["Alles van het jaarabonnement", "Persoonlijke bikefit-afspraak bij een fitter", "Je fitter start met jouw profiel en metingen"],
        cta: "Kies met persoonlijke bikefit",
      },
    },
    featureCompareTitle: "Vergelijk wat erin zit", featureLabel: "Functie", included: "Inbegrepen", excluded: "Niet inbegrepen",
    comparison: [
      { label: "Calculators met opslag", values: [true, true, true, true] },
      { label: "Profiel bewaren", values: [true, true, true, true] },
      { label: "Fietsprofielen", values: ["1", "1", "Onbeperkt", "Onbeperkt"] },
      { label: "Profielscore", values: ["tot 80%", "tot 100%", "tot 100%", "tot 100%"] },
      { label: "Kernwaarden zadel en stuur, met prioriteiten", values: [true, true, true, true] },
      { label: "Gedetailleerde fit-tabel en stappenplan in volgorde", values: [false, "Voor die fiets", true, true] },
      { label: "Bandenspanning, controleplan, fit-notities, klimprofiel", values: [false, "Voor die fiets", true, true] },
      { label: "Opnieuw berekenen na aanpassing", values: [false, "Voor die fiets", true, true] },
      { label: "Schoenplaatjes-tool en zadelkiezer", values: [true, true, true, true] },
      { label: "Meerdere fietsprofielen, klimplanner", values: [false, false, true, true] },
      { label: "Geschiedenis", values: ["Laatste rapport", "Binnen looptijd", "Volledig", "Volledig"] },
      { label: "PDF laatste rapport", values: [true, true, true, true] },
      { label: "Export en account verwijderen", values: [true, true, true, true] },
      { label: "Persoonlijke bikefit-afspraak", values: [false, false, false, "1 afspraak"] },
    ],
    accountNote: "Zonder account gebruik je de calculators en zie je je kernwaarden, maar worden je gegevens niet bewaard.",
    adviceEyebrow: "Eerlijk advies", adviceTitle: "Wat een online fit wel en niet doet",
    advice: ["Een online fitting is een sterke basis: je meet zelf, je krijgt onderbouwde afstelwaarden en je weet in welke volgorde je aanpast.", "Heb je klachten of een blessure, of verandert er na een paar aanpassingen niets? Ga dan naar een fysieke bikefitter of zorgverlener. Neem je rapport mee als startpunt."],
    proofItems: [{ title: "Onderbouwde methode", body: "Afstelwaarden op basis van je profiel." }, { title: "Concrete afstelwaarden", body: "Zadel- en stuurpositie met een volgorde voor aanpassingen." }],
    faqTitle: "Veelgestelde vragen over prijzen", allQuestions: "Alle vragen →",
    faqs: [
      { q: "Wat is het verschil tussen een losse meting en een jaarabonnement?", a: "Een losse meting geeft je voor één fiets drie maanden het volledige stappenplan, met fit-tabel, controleplan en bandenspanning. Een jaarabonnement geeft dat voor al je fietsen, twaalf maanden lang, plus meerdere fietsprofielen en de klimplanner." },
      { q: "Wat is het jaarabonnement met persoonlijke bikefit?", a: "Je krijgt alles van het jaarabonnement plus één persoonlijke bikefit-afspraak bij een fitter. Je fitter start met jouw profiel en metingen. Na betaling plan je de afspraak zelf via de agenda. Neem contact met ons op voor locatie, duur en vragen over verzetten of annuleren. De afspraak is eenmalig: na het eerste jaar (€234,50) verlengt het als gewoon jaarabonnement voor €21,50 per jaar, altijd online opzegbaar." },
      { q: "Wat gebeurt er na afloop?", a: "Je gaat terug naar een gratis account. Je gegevens blijven bewaard. Betaalde onderdelen blijven zichtbaar en exporteerbaar, maar zijn alleen-lezen. De PDF van je laatste rapport blijft gratis beschikbaar." },
      { q: "Hoe zeg ik mijn jaarabonnement op?", a: "Online, met één knop in Instellingen. Je krijgt 30 dagen voor de verlenging een herinnering met de datum en het bedrag (€21,50). In het eerste jaar houd je toegang tot het einde van het jaar. Zeg je op na een verlenging, dan krijg je het resterende deel naar rato terug." },
      { q: "Hoe werken de cadeaumetingen?", a: "Met een jaarabonnement krijg je 2 cadeaumetingen per abonnementsjaar. De ontvanger heeft één maand om het cadeau te verzilveren voor één fiets en krijgt daarna drie maanden toegang. Je deelt geen profielgegevens." },
      { q: "Kan ik upgraden na een losse meting of cadeau?", a: "Binnen zes maanden na aankoop van een losse meting of het verzilveren van een cadeau kost je eerste jaarabonnement €9,50. Daarna betaal je €21,50 per jaar. De korting wordt automatisch toegepast als je in aanmerking komt." },
      { q: "Kan ik alleen een persoonlijke bikefit boeken?", a: "Als je een losse meting hebt gekocht of een jaarabonnement hebt, kun je een persoonlijke bikefit-afspraak kopen voor €209,50. Na betaling kies je Plan je afspraak. Deze afspraak verlengt niet automatisch." },
      { q: "Is de btw inbegrepen?", a: "Ja. Alle prijzen op deze pagina zijn inclusief 21% btw. Je ziet het totaalbedrag altijd voordat je betaalt." },
    ],
    ctaTitle: "Eerst proberen? Geen account nodig.", ctaBody: "De calculators zijn gratis. Beslis daarna of een losse meting of jaarabonnement bij je past.", start: "Start gratis bike fit",
  },
  en: {
    metadata: {
      title: "Pricing | BikeFitBoost",
      description: "A single measurement for €13.50 or a year of fitting all your bikes for €21.50. With a personal bike fit: €234.50. VAT included.",
      keywords: ["bike fit pricing", "online bike fit price", "annual bike fit plan"],
    },
    eyebrow: "Pricing", title: "A good bike fit, affordable",
    subtitle: "With the annual plan, adjust all your bikes and save their setups for a year for €21.50. For just one bike, a single measurement is enough.",
    vat: "All prices include 21% VAT. No monthly subscription, no hidden costs.", vatShort: "incl. 21% VAT",
    freePrompt: "Want to start for free?", freeLink: "Create a free account", freeDetail: "and save your profile and 1 bike.", free: "Free",
    gift: { title: "Received a gift?", body: "Redeem your bike fit within one month for one bike. There is nothing to pay.", cta: "Redeem your gift" },
    products: {
      single: {
        name: "Single measurement", description: "The complete adjustment plan for one bike, in the right order.",
        price: productPrice("single", "en"), period: "one-off", facts: [["Access", "3 months"], ["Bikes", "1"]],
        features: ["Detailed fit table and adjustment plan", "Tyre pressure, check plan, fit notes and climbing profile", "Recalculate after an adjustment"], cta: "Choose a single measurement",
      },
      annual: {
        name: "Annual plan", description: "Adjust all your bikes and save their fit values.",
        price: productPrice("annual", "en"), period: "per year", renewal: "Renews automatically at €21.50 per year. Cancel online anytime.", badge: "Favourite choice",
        facts: [["Access", "12 months"], ["Bikes", "Unlimited"]],
        features: ["12 months of fine-tuning", "2 gift measurements per year", "Everything in a single measurement, for all your bikes", "Save fit values for all your bikes", "Climbing planner and full history"], cta: "Choose the annual plan",
      },
      annual_personal: {
        name: "Annual plan + personal bike fit", description: "Your online profile as a starting point, completed with a fitter.",
        price: productPrice("annual_personal", "en"), period: "first year", renewal: "The appointment is one-off. Afterwards, it renews as an annual plan for €21.50 per year.", badge: "With a personal appointment",
        facts: [["Appointment", "1 personal bike fit"], ["Location and duration", "Contact us"]],
        features: ["Everything in the annual plan", "Personal bike fit appointment with a fitter", "Your fitter starts with your profile and measurements"], cta: "Choose a personal bike fit",
      },
    },
    featureCompareTitle: "Compare what’s included", featureLabel: "Feature", included: "Included", excluded: "Not included",
    comparison: [
      { label: "Calculators with saved results", values: [true, true, true, true] },
      { label: "Save your profile", values: [true, true, true, true] },
      { label: "Bike profiles", values: ["1", "1", "Unlimited", "Unlimited"] },
      { label: "Profile score", values: ["up to 80%", "up to 100%", "up to 100%", "up to 100%"] },
      { label: "Core saddle and handlebar values, with priorities", values: [true, true, true, true] },
      { label: "Detailed fit table and ordered adjustment plan", values: [false, "For that bike", true, true] },
      { label: "Tyre pressure, check plan, fit notes, climbing profile", values: [false, "For that bike", true, true] },
      { label: "Recalculate after an adjustment", values: [false, "For that bike", true, true] },
      { label: "Cleat tool and saddle selector", values: [true, true, true, true] },
      { label: "Multiple bike profiles, climbing planner", values: [false, false, true, true] },
      { label: "History", values: ["Latest report", "During access period", "Full", "Full"] },
      { label: "PDF of latest report", values: [true, true, true, true] },
      { label: "Export and delete account", values: [true, true, true, true] },
      { label: "Personal bike fit appointment", values: [false, false, false, "1 appointment"] },
    ],
    accountNote: "Without an account, you can use the calculators and see your core values, but your data will not be saved.",
    adviceEyebrow: "Honest advice", adviceTitle: "What an online fit can and cannot do",
    advice: ["An online fit gives you a strong starting point: take your own measurements, get informed fit values and know which adjustments to make first.", "If you have pain or an injury, or a few adjustments do not help, see an in-person bike fitter or healthcare professional. Bring your report as a starting point."],
    proofItems: [{ title: "Method-backed calculations", body: "Fit values based on your profile." }, { title: "Concrete fit outputs", body: "Saddle and handlebar position with an adjustment order." }],
    faqTitle: "Pricing FAQ", allQuestions: "All questions →",
    faqs: [
      { q: "What is the difference between a single measurement and an annual plan?", a: "A single measurement gives you the complete adjustment plan for one bike for three months, including the fit table, check plan and tyre pressure. An annual plan covers all your bikes for twelve months, plus multiple bike profiles and the climbing planner." },
      { q: "What is the annual plan with a personal bike fit?", a: "You get everything in the annual plan plus one personal bike fit appointment with a fitter. Your fitter starts with your profile and measurements. After payment, book your appointment through the calendar. Contact us for the location, duration and questions about rescheduling or cancellation. The appointment is one-off: after the first year (€234.50), it renews as a regular annual plan for €21.50 per year. Cancel online anytime." },
      { q: "What happens when access ends?", a: "You return to a free account. Your data stays saved. Paid sections remain visible and exportable, but become read-only. The PDF of your latest report remains available for free." },
      { q: "How do I cancel my annual plan?", a: "Online, with one button in Settings. You receive a reminder 30 days before renewal with the date and amount (€21.50). In the first year, you keep access until the end of the year. If you cancel after a renewal, the unused portion is refunded pro rata." },
      { q: "How do gift measurements work?", a: "An annual plan includes 2 gift measurements per subscription year. The recipient has one month to redeem a gift for one bike, then gets three months of access. No profile information is shared." },
      { q: "Can I upgrade after a single measurement or gift?", a: "Within six months of buying a single measurement or redeeming a gift, your first annual plan costs €9.50. It then renews at €21.50 per year. The discount is applied automatically if you are eligible." },
      { q: "Can I buy just a personal bike fit appointment?", a: "If you have bought a single measurement or have an annual plan, you can buy a personal bike fit appointment for €209.50. After payment, choose Book your appointment. This appointment does not renew automatically." },
      { q: "Is VAT included?", a: "Yes. All prices on this page include 21% VAT. You always see the total before you pay." },
    ],
    ctaTitle: "Try it first. No account needed.", ctaBody: "The calculators are free. Decide afterwards whether a single measurement or annual plan suits you.", start: "Start free bike fit",
  },
};
