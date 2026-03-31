import { ANALYTICS_CONFIG, type MarketingConversionKey } from "@/config/analytics";
import { pushDataLayerEvent } from "./marketing";

export type { MarketingConversionKey } from "@/config/analytics";

export function trackAdConversion(
  conversionKey: MarketingConversionKey,
  payload: Record<string, unknown> = {}
) {
  const googleAdsLabel =
    conversionKey === "pricing_signup"
      ? ANALYTICS_CONFIG.conversions.pricingSignupLabel
      : conversionKey === "fit_pass_purchase"
        ? ANALYTICS_CONFIG.conversions.fitPassPurchaseLabel
        : ANALYTICS_CONFIG.conversions.caseStudyLeadLabel;

  pushDataLayerEvent({
    event: "bbf_conversion",
    conversionKey,
    googleAdsId: ANALYTICS_CONFIG.googleAdsId,
    googleAdsLabel,
    metaPixelId: ANALYTICS_CONFIG.metaPixelId,
    ...payload,
  });
}
