import { BRAND } from "../../lib/brand";
import { PRODUCTS } from "../../../shared/pricing/products";
import { formatPrice } from "../format";
import { emailCopy } from "../i18n";
import { giftEmailCopy } from "../i18n/gifts";
import { benefits, hero, paperBlock, paragraph, primaryButton, renderLayout, subheading } from "../layout";
import type { EmailLocale, RenderedEmail } from "./index";

export interface GiftMeasurementData {
  senderFirstName?: string;
  message?: string;
  expiresAt: number;
  actionUrl: string;
}

export function renderGiftMeasurement(data: GiftMeasurementData, locale: EmailLocale): RenderedEmail {
  const copy = giftEmailCopy[locale];
  const common = emailCopy[locale].common;
  const values: Record<string, string> = {
    sender: data.senderFirstName?.trim() || copy.anonymousSender,
    value: formatPrice(PRODUCTS.single.priceCents / 100, locale),
    upgrade: formatPrice(PRODUCTS.annual_upgrade.priceCents / 100, locale),
    renewal: formatPrice(PRODUCTS.annual.renewalPriceCents / 100, locale),
    date: new Intl.DateTimeFormat(locale === "nl" ? "nl-NL" : "en-GB", {
      day: "numeric", month: "short", year: "numeric", timeZone: "UTC",
    }).format(data.expiresAt).replace(/\./g, ""),
  };
  const fill = (value: string) => value.replace(/\{(\w+)\}/g, (_, key: string) => values[key]);
  const subject = fill(copy.subject);
  const preheader = fill(copy.preheader);
  const footerReason = fill(copy.footer);
  const message = data.message?.trim();
  const content = [
    hero({ eyebrow: copy.eyebrow, heading: subject }),
    paragraph(fill(copy.intro)),
    ...(message ? [paperBlock(subheading(copy.message) + paragraph(message))] : []),
    subheading(copy.includes),
    benefits(copy.benefits.map(text => ({ text }))),
    paragraph(fill(copy.deadline)),
    paragraph(fill(copy.upgrade), { small: true }),
    primaryButton(data.actionUrl, copy.button),
    paragraph(common.reply, { small: true }),
  ].join("");
  return {
    subject,
    preheader,
    html: renderLayout({ locale, subject, preheader, content, footerReason }),
    text: [copy.eyebrow, subject, fill(copy.intro), ...(message ? [copy.message, message] : []),
      copy.includes, ...copy.benefits, fill(copy.deadline), fill(copy.upgrade),
      `${copy.button}: ${data.actionUrl}`, common.reply, common.signoff, common.team, footerReason, BRAND.host,
    ].join("\n\n"),
  };
}
