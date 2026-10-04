import { SITE_ORIGIN } from "../../shared/brand";

export const BRAND = {
  name: "BikeFitBoost",
  authEmailFrom: "BikeFitBoost <noreply@notifications.bestbikefit4u.eu>",
  reportTitle: "BikeFitBoost - Fit Recommendation Report",
  supportEmail: "support@bestbikefit4u.eu",
  siteUrl: SITE_ORIGIN,
  host: new URL(SITE_ORIGIN).host,
} as const;

export function emailSender(configured = process.env.AUTH_EMAIL_FROM): string {
  const sender = configured?.trim() || BRAND.authEmailFrom;
  const address = sender.match(/<([^<>]+)>$/)?.[1] ?? sender;
  return `${BRAND.name} <${address}>`;
}
