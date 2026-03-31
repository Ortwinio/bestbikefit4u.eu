export const ANALYTICS_CONFIG = {
  gtmId: process.env.NEXT_PUBLIC_GTM_ID || "GTM-KH48ZSSC",
  googleAdsId: process.env.NEXT_PUBLIC_GOOGLE_ADS_ID || null,
  metaPixelId: process.env.NEXT_PUBLIC_META_PIXEL_ID || null,
  conversions: {
    pricingSignupLabel:
      process.env.NEXT_PUBLIC_GOOGLE_ADS_PRICING_SIGNUP_LABEL || null,
    caseStudyLeadLabel:
      process.env.NEXT_PUBLIC_GOOGLE_ADS_CASE_STUDY_LABEL || null,
  },
} as const;

export type MarketingConversionKey = "pricing_signup" | "case_study_lead";
