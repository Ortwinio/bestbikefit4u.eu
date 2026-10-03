import { PRODUCTS } from "../../shared/pricing/products";
import { isStripeBillingEnabled } from "./billing";
import type { Locale } from "@/i18n/config";

export const COMMERCIAL_CURRENCY = PRODUCTS.single.currency;

export const CONSUMER_CAMPAIGN_CONFIG = {
  campaignMode: true,
  campaignEndDate: "2026-06-04T23:59:59+02:00",
  donationUrl:
    "https://inschrijving.opgevenisgeenoptie.nl/fundraisers/OrtwinVerreck35756",
} as const;

/** Report exports stay available while checkout is paused. Authentication still applies. */
export function isReportAccessOpen(now = new Date()): boolean {
  return isConsumerCampaignActive(now) || !isStripeBillingEnabled();
}

export function isConsumerCampaignActive(now = new Date()): boolean {
  if (!CONSUMER_CAMPAIGN_CONFIG.campaignMode) {
    return false;
  }

  return (
    now.getTime() <= new Date(CONSUMER_CAMPAIGN_CONFIG.campaignEndDate).getTime()
  );
}

export function getConsumerCampaignEndLabel(locale: Locale): string {
  return locale === "nl" ? "4 juni 2026" : "June 4, 2026";
}

export function getConsumerCampaignCopy(locale: Locale) {
  const endLabel = getConsumerCampaignEndLabel(locale);

  return locale === "nl"
    ? {
        endLabel,
        startFreeCta: "Start gratis bike fit",
        donateCta: "Doneer via onze Alpe d'HuZes-pagina",
        announcement:
          `BikeFitBoost is tijdelijk gratis tot ${endLabel}. Wil je onze Alpe d'HuZes-campagne steunen, dan kun je een vrijwillige donatie doen.`,
        homepageEyebrow: "Tijdelijke gratis toegang voor Alpe d'HuZes",
        homepageTitle: "Gebruik BikeFitBoost gratis tot 4 juni 2026",
        homepageDescription:
          "Tot 4 juni 2026 kun je BikeFitBoost gratis gebruiken. In plaats van een verplichte betaling nodigen we je uit om, als je wilt, onze Alpe d'HuZes-fundraisingcampagne te steunen met een vrijwillige donatie.",
        pricingTitle: "Tijdelijke gratis campagne",
        pricingDescription:
          "Tot 4 juni 2026 is BikeFitBoost gratis voor consumenten. Vind je het waardevol, dan kun je onze Alpe d'HuZes-fundraisingcampagne steunen met een vrijwillige donatie.",
        loginTitle: "Tijdelijk gratis toegang",
        loginDescription:
          "Je account blijft gewoon nodig om je sessie op te slaan, je rapport te mailen en je resultaten terug te vinden. Betalen is tijdens deze campagne niet nodig.",
        fitStartTitle: "Je fit is tijdelijk gratis",
        fitStartDescription:
          "Tijdens onze Alpe d'HuZes-campagne kun je deze consumenten-bikefit gratis starten en afronden tot 4 juni 2026. Wil je ons steunen, dan kun je vrijblijvend doneren.",
        paywallTitle: "Je kunt deze bike fit gratis gebruiken tijdens onze Alpe d'HuZes-campagne.",
        paywallDescription:
          "Er is geen verplichte betaling. Wil je ons steunen, dan kun je via onze fundraisingpagina een vrijwillige donatie doen.",
        continueFreeCta: "Ga gratis verder",
        donateFirstCta: "Doneer eerst",
        optionalNote: "Doneren is volledig optioneel.",
      }
    : {
        endLabel,
        startFreeCta: "Start free bike fit",
        donateCta: "Donate via our Alpe d'HuZes page",
        announcement:
          `BikeFitBoost is temporarily free until ${endLabel}. If you would like to support our Alpe d'HuZes campaign, you can make a voluntary donation.`,
        homepageEyebrow: "Temporary free access for Alpe d'HuZes",
        homepageTitle: "Use BikeFitBoost for free until June 4, 2026",
        homepageDescription:
          "Until June 4, 2026, you can use BikeFitBoost for free. Instead of a required payment, we invite you to support our Alpe d'HuZes fundraising campaign with a voluntary donation if you want to.",
        pricingTitle: "Temporary free campaign",
        pricingDescription:
          "Until June 4, 2026, BikeFitBoost is free for consumer users. If you find it valuable, you can support our Alpe d'HuZes fundraising campaign with a voluntary donation.",
        loginTitle: "Temporary free access",
        loginDescription:
          "You still need an account to save your session, email your report, and come back to your results. During this campaign there is no required payment.",
        fitStartTitle: "Your fit is temporarily free",
        fitStartDescription:
          "During our Alpe d'HuZes campaign you can start and complete this consumer bike fit for free until June 4, 2026. If you would like to support us, you can make an optional donation.",
        paywallTitle:
          "You can use this bike fit for free during our Alpe d'HuZes campaign.",
        paywallDescription:
          "There is no required payment. If you would like to support us, you can make a voluntary donation through our fundraising page.",
        continueFreeCta: "Continue for free",
        donateFirstCta: "Donate first",
        optionalNote: "Donating is entirely optional.",
      };
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
    entry: formatEuroPriceFromCents(PRODUCTS.annual_entry.priceCents, locale),
    personal: formatEuroPriceFromCents(PRODUCTS.annual_personal.priceCents, locale),
  };
}

export function getCommercialFaqCopy(locale: Locale) {
  const price = commercialPrices(locale);
  if (isConsumerCampaignActive()) {
    const campaign = getConsumerCampaignCopy(locale);

    return {
      multipleBikeProfiles:
        locale === "nl"
          ? "Ja. Je kunt tijdens de campagne nog steeds meerdere fietsen beheren zodra je account hebt aangemaakt."
          : "Yes. During the campaign you can still manage multiple bikes once you have created your account.",
      pdfReport:
        locale === "nl"
          ? "Ja. Tijdens de campagne kun je je volledige rapport zonder verplichte betaling gebruiken."
          : "Yes. During the campaign you can use your full report without a required payment.",
      pricing: campaign.pricingDescription,
    };
  }

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
        ? `Een losse meting kost ${price.single}. Het jaarabonnement kost ${price.annual} in het eerste jaar, daarna ${price.renewal}. Met een persoonlijke bikefit kost het eerste jaar ${price.personal}. Alle prijzen zijn inclusief btw.`
        : `A single measurement costs ${price.single}. An annual subscription costs ${price.annual} in the first year, then ${price.renewal}. With a personal bike fit, the first year costs ${price.personal}. All prices include VAT.`,
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
  if (isConsumerCampaignActive()) {
    const campaign = getConsumerCampaignCopy(locale);

    return locale === "nl"
      ? `BikeFitBoost is tijdelijk gratis voor consumenten tot ${campaign.endLabel}. Vrijwillige donaties verlopen via onze Alpe d'HuZes-pagina en zijn niet verplicht.`
      : `BikeFitBoost is temporarily free for consumer users until ${campaign.endLabel}. Voluntary donations go through our Alpe d'HuZes page and are never required.`;
  }

  return locale === "nl"
    ? `Een losse meting kost ${price.single} en geeft drie maanden toegang voor één fiets. Het jaarabonnement kost ${price.annual} in het eerste jaar, daarna ${price.renewal} per jaar. Na een losse meting kost het eerste jaar ${price.entry}. Het jaarabonnement met een persoonlijke bikefit kost ${price.personal} in het eerste jaar en verlengt daarna voor ${price.renewal} zonder nieuwe afspraak. Alle prijzen zijn inclusief btw. Betalen via Stripe is nog niet geïmplementeerd.`
    : `A single measurement costs ${price.single} and gives three months of access for one bike. An annual subscription costs ${price.annual} in the first year, then ${price.renewal} per year. After a single measurement, the first year costs ${price.entry}. An annual subscription with a personal bike fit costs ${price.personal} in the first year and renews for ${price.renewal} without another appointment. All prices include VAT. Payment through Stripe has not been implemented yet.`;
}
