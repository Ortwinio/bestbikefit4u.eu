import type { Locale } from "@/i18n/config";

export const COMMERCIAL_CURRENCY = "EUR" as const;

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

export type PublicPlanId = "free" | "pro";

export type PublicPlanFeatureKey =
  | "monthlyFitSession"
  | "unlimitedFitSessions"
  | "basicRecommendations"
  | "advancedRecommendations"
  | "multipleBikeProfiles"
  | "sessionHistoryLimited"
  | "sessionHistoryUnlimited"
  | "emailReport"
  | "pdfReport"
  | "prioritySupport";

type CommercialFeatureCopy = Record<
  Locale,
  {
    title: string;
    valueFree: string;
    valuePro: string;
  }
>;

export const COMMERCIAL_FEATURE_COPY: Record<
  PublicPlanFeatureKey,
  CommercialFeatureCopy
> = {
  monthlyFitSession: {
    en: {
      title: "Fit sessions",
      valueFree: "1 / month",
      valuePro: "Unlimited",
    },
    nl: {
      title: "Fit-sessies",
      valueFree: "1 / maand",
      valuePro: "Onbeperkt",
    },
  },
  unlimitedFitSessions: {
    en: {
      title: "Fit sessions",
      valueFree: "1 / month",
      valuePro: "Unlimited",
    },
    nl: {
      title: "Fit-sessies",
      valueFree: "1 / maand",
      valuePro: "Onbeperkt",
    },
  },
  basicRecommendations: {
    en: {
      title: "Recommendation depth",
      valueFree: "Core fit outputs",
      valuePro: "Advanced fit outputs",
    },
    nl: {
      title: "Diepgang aanbevelingen",
      valueFree: "Kern van fit-output",
      valuePro: "Geavanceerde fit-output",
    },
  },
  advancedRecommendations: {
    en: {
      title: "Recommendation depth",
      valueFree: "Core fit outputs",
      valuePro: "Advanced fit outputs",
    },
    nl: {
      title: "Diepgang aanbevelingen",
      valueFree: "Kern van fit-output",
      valuePro: "Geavanceerde fit-output",
    },
  },
  multipleBikeProfiles: {
    en: {
      title: "Bike profiles",
      valueFree: "1",
      valuePro: "Unlimited",
    },
    nl: {
      title: "Fietsprofielen",
      valueFree: "1",
      valuePro: "Onbeperkt",
    },
  },
  sessionHistoryLimited: {
    en: {
      title: "Session history",
      valueFree: "7 days",
      valuePro: "Unlimited",
    },
    nl: {
      title: "Sessiegeschiedenis",
      valueFree: "7 dagen",
      valuePro: "Onbeperkt",
    },
  },
  sessionHistoryUnlimited: {
    en: {
      title: "Session history",
      valueFree: "7 days",
      valuePro: "Unlimited",
    },
    nl: {
      title: "Sessiegeschiedenis",
      valueFree: "7 dagen",
      valuePro: "Onbeperkt",
    },
  },
  emailReport: {
    en: {
      title: "Email report",
      valueFree: "Yes",
      valuePro: "Yes",
    },
    nl: {
      title: "Rapport per e-mail",
      valueFree: "Ja",
      valuePro: "Ja",
    },
  },
  pdfReport: {
    en: {
      title: "PDF report",
      valueFree: "No",
      valuePro: "Yes",
    },
    nl: {
      title: "PDF-rapport",
      valueFree: "Nee",
      valuePro: "Ja",
    },
  },
  prioritySupport: {
    en: {
      title: "Support",
      valueFree: "Email queue",
      valuePro: "Priority email",
    },
    nl: {
      title: "Support",
      valueFree: "E-mailwachtrij",
      valuePro: "Prioriteit per e-mail",
    },
  },
};

type PlanCopy = Record<
  Locale,
  {
    name: string;
    description: string;
    cta: string;
    badge?: string;
    features: string[];
  }
>;

export const PUBLIC_PLANS: ReadonlyArray<{
  id: PublicPlanId;
  priceCentsMonthly: number;
  highlighted: boolean;
  featureKeys: readonly PublicPlanFeatureKey[];
  copy: PlanCopy;
}> = [
  {
    id: "free",
    priceCentsMonthly: 0,
    highlighted: false,
    featureKeys: [
      "monthlyFitSession",
      "basicRecommendations",
      "sessionHistoryLimited",
      "emailReport",
    ],
    copy: {
      en: {
        name: "Free",
        description:
          "Try the bike fit tools and see your setup targets. Perfect for a first check on saddle height, reach, and cockpit balance.",
        cta: "Start free",
        features: [
          "1 guided fit session each month",
          "Core fit outputs for saddle, cockpit, and setup priorities",
          "Email report to yourself",
          "7-day dashboard history",
        ],
      },
      nl: {
        name: "Free",
        description:
          "Probeer de bikefit-tools en bekijk je afstelwaarden. Ideaal voor een eerste check op zadelhoogte, reach en cockpitbalans.",
        cta: "Start gratis",
        features: [
          "1 begeleide fit-sessie per maand",
          "Kernoutput voor zadel, cockpit en prioriteiten",
          "Mail je rapport naar jezelf",
          "7 dagen dashboardgeschiedenis",
        ],
      },
    },
  },
  {
    id: "pro",
    priceCentsMonthly: 900,
    highlighted: true,
    featureKeys: [
      "unlimitedFitSessions",
      "advancedRecommendations",
      "multipleBikeProfiles",
      "sessionHistoryUnlimited",
      "emailReport",
      "pdfReport",
      "prioritySupport",
    ],
    copy: {
      en: {
        name: "Pro",
        description:
          "Track fit changes across multiple bikes, refine your position over time, and download detailed PDF reports.",
        cta: "Start Pro - EUR 9/month",
        badge: "Most popular",
        features: [
          "Unlimited fit sessions",
          "Advanced recommendations and follow-up adjustments",
          "Unlimited bike profiles",
          "Unlimited session history",
          "PDF and email reports",
          "Priority support",
        ],
      },
      nl: {
        name: "Pro",
        description:
          "Volg fitveranderingen over meerdere fietsen, verfijn je positie over tijd en download gedetailleerde PDF-rapporten.",
        cta: "Start Pro - EUR 9/maand",
        badge: "Meest gekozen",
        features: [
          "Onbeperkte fit-sessies",
          "Geavanceerde aanbevelingen en vervolg-aanpassingen",
          "Onbeperkte fietsprofielen",
          "Onbeperkte sessiegeschiedenis",
          "PDF- en e-mailrapporten",
          "Prioriteit bij support",
        ],
      },
    },
  },
] as const;

// FIT_PASS_PRODUCT is the marketing wrapper for the Pro subscription tier.
// priceCents must stay in sync with PUBLIC_PLANS[pro].priceCentsMonthly and the Stripe price.
export const FIT_PASS_PRODUCT = {
  key: "fit_pass",
  priceCents: 900, // €9/month — must match Pro plan and STRIPE_PRO_PRICE_ID
  currency: COMMERCIAL_CURRENCY,
  copy: {
    en: {
      name: "Fit Pass",
      title: "Your full report is one step away.",
      description:
        "Fit Pass gives you a downloadable PDF, the full adjustment sequence, unlimited sessions, and multiple bike profiles.",
      cta: "Unlock Fit Pass",
      priceSuffix: "/ month",
    },
    nl: {
      name: "Fit Pass",
      title: "Je volledige rapport is één stap verwijderd.",
      description:
        "Met Fit Pass krijg je een downloadbaar PDF, de volledige aanpassingsvolgorde, onbeperkte sessies en meerdere fietsprofielen.",
      cta: "Fit Pass activeren",
      priceSuffix: "/ maand",
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

export function getVisiblePublicPlans() {
  return PUBLIC_PLANS.filter((plan) => {
    if (plan.id === "pro") {
      return true;
    }
    return true;
  });
}

export function getCommercialFaqCopy(locale: Locale) {
  return {
    multipleBikeProfiles:
      locale === "nl"
        ? "Ja. Met Pro kun je onbeperkt fietsprofielen toevoegen en per fiets een aparte fit-sessie uitvoeren."
        : "Yes. With Pro, you can create unlimited bike profiles and run a separate fit session for each bike.",
    pdfReport:
      locale === "nl"
        ? "Ja. PDF-rapporten zijn live voor Pro. E-mailrapporten zijn beschikbaar in zowel Free als Pro."
        : "Yes. PDF reports are live in Pro. Email reports are available in both Free and Pro.",
    pricing:
      locale === "nl"
        ? "BestBikeFit4U toont publiek alleen Free en Pro. Alle prijzen zijn per maand in euro."
        : "BestBikeFit4U currently sells Free and Pro publicly. All prices are monthly and listed in EUR.",
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
  return locale === "nl"
    ? "BestBikeFit4U toont publiek Free en Pro. Betaalde Pro-plannen worden maandelijks in euro gefactureerd en kunnen op elk moment worden opgezegd."
    : "BestBikeFit4U publicly offers Free and Pro. Paid Pro plans are billed monthly in EUR and can be cancelled at any time.";
}
