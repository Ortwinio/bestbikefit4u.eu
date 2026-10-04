import { SITE_ORIGIN } from "../../shared/brand";

export const BRAND = {
  name: "BikeFitBoost",
  siteUrl: SITE_ORIGIN,
  host: new URL(SITE_ORIGIN).hostname,
  authEmailFrom: "BikeFitBoost <noreply@notifications.bikefitboost.com>",
  supportEmail: "support@bikefitboost.com",
  reportTitle: "BikeFitBoost - Fit Recommendation Report",
  reportSlug: "bikefitboost-report",
  assets: {
    logoPrimary: "/brand/svg/logo-horizontaal.svg",
    logoDark: "/brand/svg/logo-horizontaal-negatief.svg",
    mark: "/brand/svg/beeldmerk.svg",
    appIconSvg: "/favicon.svg",
    appleTouchIcon: "/apple-touch-icon.png",
    appIcon192: "/android-chrome-192.png",
    appIconMaskable: "/maskable-512.png",
    favicon: "/favicon.ico",
    socialImage: "/og-image-1200x630.png",
    appIconPng: "/android-chrome-512.png",
  },
} as const;
