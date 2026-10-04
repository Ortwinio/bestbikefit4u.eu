import { PRODUCTS } from "../../shared/pricing/products";
import { isStripeBillingEnabled } from "./billing";
import type { Locale } from "@/i18n/config";

export const COMMERCIAL_CURRENCY = PRODUCTS.single.currency;

export function isReportAccessOpen(): boolean {
  return !isStripeBillingEnabled();
}

export const PRODUCT_LIVE_FLAGS = {
  pdfReport: true,
  emailReport: true,
  multipleBikeProfiles: true,
  premiumPlanPublic: false,
  brandedPdf: false,
  apiAccess: false,
  clientManagement: false,
  moneyBackGuarantee: false,
} as const;

// Compatibility for the legacy Fit Pass UI while it moves to the new checkout flow.
// This represents a single-bike purchase, never an automatically renewing subscription.
export const FIT_PASS_PRODUCT = {
  key: "fit_pass",
  priceCents: PRODUCTS.single.priceCents,
  currency: COMMERCIAL_CURRENCY,
  copy: {
    en: {
      name: "Single measurement",
      title: "Your complete setup plan for one bike.",
      description: "A complete setup plan for one bike, with three months of access.",
      cta: "Choose a single measurement",
      priceSuffix: "one-off · 3 months · VAT included",
    },
    nl: {
      name: "Losse meting",
      title: "Je volledige stappenplan voor één fiets.",
      description: "Een volledig stappenplan voor één fiets, met drie maanden toegang.",
      cta: "Kies een losse meting",
      priceSuffix: "eenmalig · 3 maanden · inclusief btw",
    },
  },
} as const;

export function formatEuroPriceFromCents(
  valueCents: number,
  locale: Locale
): string {
  return new Intl.NumberFormat(locale === "nl" ? "nl-NL" : "en-US", {
    style: "currency",
    currency: COMMERCIAL_CURRENCY,
    minimumFractionDigits: valueCents === 0 ? 0 : 2,
    maximumFractionDigits: valueCents === 0 ? 0 : 2,
  }).format(valueCents / 100);
}

function commercialPrices(locale: Locale) {
  return {
    single: formatEuroPriceFromCents(PRODUCTS.single.priceCents, locale),
    annual: formatEuroPriceFromCents(PRODUCTS.annual.priceCents, locale),
    renewal: formatEuroPriceFromCents(PRODUCTS.annual.renewalPriceCents, locale),
    upgrade: formatEuroPriceFromCents(PRODUCTS.annual_upgrade.priceCents, locale),
    standalone: formatEuroPriceFromCents(PRODUCTS.personal_fit_standalone.priceCents, locale),
    personal: formatEuroPriceFromCents(PRODUCTS.annual_personal.priceCents, locale),
  };
}

export function getCommercialFaqCopy(locale: Locale) {
  const price = commercialPrices(locale);
  return {
    multipleBikeProfiles:
      locale === "nl"
        ? "Een losse meting geldt voor één fiets, drie maanden lang. Het jaarabonnement geldt voor al je fietsen, twaalf maanden lang."
        : "A single measurement covers one bike for three months. An annual subscription covers all your bikes for twelve months.",
    pdfReport:
      locale === "nl"
        ? "Met een gratis account kun je de PDF van je laatste rapport downloaden. Een losse meting opent het volledige stappenplan voor één fiets; een jaarabonnement geldt voor al je fietsen."
        : "A free account can download the PDF of its latest report. A single measurement opens the full setup plan for one bike; an annual subscription covers all your bikes.",
    pricing:
      locale === "nl"
        ? `Een losse meting kost ${price.single}. Het jaarabonnement kost ${price.annual} per jaar, met automatische verlenging en 2 cadeaumetingen per abonnementsjaar. Binnen zes maanden na aankoop van een losse meting of het inwisselen van een cadeaumeting kun je upgraden voor ${price.upgrade} in het eerste jaar, daarna ${price.renewal} per jaar. Met een persoonlijke bikefit kost het eerste jaar ${price.personal}, daarna ${price.renewal} per jaar zonder nieuwe afspraak. Een losse persoonlijke bikefit-afspraak kost ${price.standalone} voor wie een losse meting heeft gekocht of een jaarabonnement heeft. Alle prijzen zijn inclusief btw.`
        : `A single measurement costs ${price.single}. An annual subscription costs ${price.annual} per year, renews automatically and includes 2 gift measurements per subscription year. Within six months of buying a single measurement or redeeming a gift measurement, you can upgrade for ${price.upgrade} in the first year, then ${price.renewal} per year. With a personal bike fit, the first year costs ${price.personal}, then ${price.renewal} per year without another appointment. A standalone personal bike fit appointment costs ${price.standalone} for riders who have purchased a single measurement or have an annual subscription. All prices include VAT.`,
  };
}

export function getSupportResponseItems(locale: Locale): string[] {
  return locale === "nl"
    ? [
        "Free-plan: doorgaans binnen 3 werkdagen",
        "Pro-plan: doorgaans binnen 1 werkdag",
      ]
    : [
        "Free plan: usually within 3 business days",
        "Pro plan: usually within 1 business day",
      ];
}

export function getSubscriptionTermsCopy(locale: Locale): string {
  const price = commercialPrices(locale);
  return locale === "nl"
    ? `Een losse meting kost ${price.single} en geeft drie maanden toegang voor één fiets. Het jaarabonnement kost ${price.annual} per jaar, verlengt automatisch en geeft twaalf maanden toegang voor al je fietsen, een volledig profiel en 2 cadeaumetingen per abonnementsjaar. Binnen zes maanden na aankoop van een losse meting of het inwisselen van een cadeaumeting kost een upgrade ${price.upgrade} in het eerste jaar, daarna ${price.renewal} per jaar. Het jaarabonnement met een persoonlijke bikefit kost ${price.personal} in het eerste jaar en verlengt daarna voor ${price.renewal} zonder nieuwe afspraak. Een losse persoonlijke bikefit-afspraak kost ${price.standalone} en is alleen beschikbaar als je een losse meting hebt gekocht of een jaarabonnement hebt. Alle prijzen zijn inclusief btw.`
    : `A single measurement costs ${price.single} and gives three months of access for one bike. An annual subscription costs ${price.annual} per year, renews automatically and includes twelve months of access for all your bikes, a complete profile and 2 gift measurements per subscription year. Within six months of buying a single measurement or redeeming a gift measurement, an upgrade costs ${price.upgrade} in the first year, then ${price.renewal} per year. An annual subscription with a personal bike fit costs ${price.personal} in the first year and renews for ${price.renewal} without another appointment. A standalone personal bike fit appointment costs ${price.standalone} and is only available if you have purchased a single measurement or have an annual subscription. All prices include VAT.`;
}
