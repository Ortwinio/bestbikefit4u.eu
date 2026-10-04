import { BRAND } from "../../lib/brand";
import { PRODUCTS } from "../../../shared/pricing/products";
import { emailCopy } from "../i18n";
import { pricingEmailCopy } from "../i18n/pricing";
import { formatNumber, formatPrice } from "../format";
import {
  renderLayout, heading, subheading, paperBlock, paragraph, hero, valueRows, valueTiles, benefits, primaryButton, safeHref,
  escapeHtml,
} from "../layout";
import type {
  EmailLocale, RenderedEmail, PreferenceLinks, PurchaseConfirmationData, SubscriptionWelcomeData,
  AccessExpiredData, RenewalReminderData, CancellationConfirmationData, TransitionAnnouncementData,
  UpgradeNudgeData,
} from "./index";

function fill(copy: string, values: Record<string, string>): string {
  return copy.replace(/\{(\w+)\}/g, (_, key: string) => {
    if (!(key in values)) throw new Error(`Missing email value: ${key}`);
    return values[key];
  });
}

/** Mail boards use readable dates; caller supplies real timestamps, never inferred entitlement dates. */
function dateLabel(value: number, locale: EmailLocale, short = false): string {
  return new Intl.DateTimeFormat(locale === "nl" ? "nl-NL" : "en-GB", {
    day: "numeric", month: short ? "long" : "short", ...(short ? {} : { year: "numeric" }), timeZone: "UTC",
  }).format(value).replace(/\./g, "");
}

function mail(locale: EmailLocale, subject: string, preheader: string, footer: string, links?: PreferenceLinks) {
  const common = emailCopy[locale].common;
  const html: string[] = [];
  const text: string[] = [];
  return {
    add(markup: string, plain: string) { html.push(markup); text.push(plain); },
    heading(value: string) { html.push(heading(value)); text.push(value); },
    section(value: string) { html.push(subheading(value)); text.push(value); },
    paragraph(value: string, small = false) { html.push(paragraph(value, { small })); text.push(value); },
    greet(firstName: string | undefined, value: string) {
      const greeting = firstName?.trim()
        ? fill(common.greeting, { firstName: firstName.trim() }) : common.genericGreeting;
      html.push(paragraph(`${greeting} ${value}`)); text.push(`${greeting} ${value}`);
    },
    button(url: string, label: string) { html.push(primaryButton(url, label)); text.push(`${label}: ${url}`); },
    finish(): RenderedEmail {
      return {
        subject, preheader,
        html: renderLayout({ locale, subject, preheader, content: html.join(""), footerReason: footer,
          unsubscribeUrl: links?.unsubscribeUrl, preferencesUrl: links?.preferencesUrl }),
        text: [...text, common.signoff, common.team, footer, BRAND.host,
          ...(links ? [`${common.unsubscribe}: ${links.unsubscribeUrl}`,
            `${common.preferences}: ${links.preferencesUrl}`] : [])].join("\n\n"),
      };
    },
  };
}

function list(items: readonly { title?: string; text: string }[]) {
  return { html: benefits(items), text: items.map(item => [item.title, item.text].filter(Boolean).join("\n")).join("\n\n") };
}
function rows(items: { label: string; value: string; unit?: string }[], highlight?: string) {
  return { html: valueRows(items, { boxed: true, highlight }), text: items.map(item => `${item.label}: ${item.value}${item.unit ? ` ${item.unit}` : ""}`).join("\n") };
}

export function renderPurchaseConfirmation(data: PurchaseConfirmationData, locale: EmailLocale): RenderedEmail {
  const copy = pricingEmailCopy[locale].purchase;
  const date = data.accessEndsAt === undefined ? undefined : dateLabel(data.accessEndsAt, locale);
  const amount = data.amountPaid === undefined ? undefined : formatPrice(data.amountPaid, locale);
  if (data.productId && data.productId !== "single") return renderAnnualPurchase(data, locale);
  const subject = data.bikeName ? fill(copy.subject, { bike: data.bikeName }) : copy.subjectWithoutBike;
  const preheader = date && amount ? fill(copy.preheader, { date, amount }) : copy.preheaderWithoutDetails;
  const email = mail(locale, subject, preheader, copy.footer);
  const eyebrow = data.firstName?.trim() ? fill(copy.eyebrow, { name: data.firstName.trim() }) : copy.eyebrowWithoutName;
  email.add(hero({ eyebrow, heading: copy.heading }), `${eyebrow}\n${copy.heading}`);
  email.paragraph(data.bikeName ? fill(copy.intro, { bike: data.bikeName }) : copy.introWithoutBike);
  const values = rows([
    { label: copy.product, value: [copy.productName, data.bikeName].filter(Boolean).join(" · ") },
    ...(amount ? [{ label: copy.amount, value: amount, unit: copy.vat }] : []),
    ...(date ? [{ label: copy.until, value: date }] : []),
  ]);
  email.add(values.html, values.text);
  email.section(copy.benefitsHeading);
  const items = list(copy.benefits.flatMap((item, index) => index === 2 && !date ? []
    : [{ ...item, text: date ? fill(item.text, { date }) : item.text }]));
  email.add(items.html, items.text);
  email.button(data.actionUrl, copy.button);
  const after = [date ? fill(copy.after, { date }) : undefined,
    data.invoiceAttached ? copy.invoice : undefined,
    data.withdrawalAcknowledged ? copy.withdrawal : undefined].filter(Boolean).join(" ");
  if (after) email.paragraph(after, true);
  email.paragraph(emailCopy[locale].common.reply, true);
  return email.finish();
}

export function renderSubscriptionWelcome(data: SubscriptionWelcomeData, locale: EmailLocale): RenderedEmail {
  const copy = pricingEmailCopy[locale].welcome;
  const email = mail(locale, copy.subject, copy.preheader, copy.footer);
  email.heading(copy.heading);
  email.greet(data.firstName, copy.intro);
  if (data.accessEndsAt !== undefined) {
    const values = rows([{ label: copy.until, value: dateLabel(data.accessEndsAt, locale) }]);
    email.add(values.html, values.text);
  }
  const items = list(copy.benefits.map(text => ({ text })));
  email.add(items.html, items.text);
  email.button(data.actionUrl, copy.button);
  email.paragraph(emailCopy[locale].common.reply, true);
  return email.finish();
}

export function renderAccessExpired(data: AccessExpiredData, locale: EmailLocale): RenderedEmail {
  const copy = pricingEmailCopy[locale].expiry;
  const email = mail(locale, copy.subject, copy.preheader, copy.footer);
  email.heading(copy.heading);
  email.greet(data.firstName, data.bikeName ? fill(copy.intro, { bike: data.bikeName }) : copy.introWithoutBike);
  const items = list(copy.benefits);
  email.add(items.html, items.text);
  email.button(data.actionUrl, copy.button);
  return email.finish();
}

/** M08 remains a consent-based marketing preview; the expiry service mail above has no offer. */
export function renderExpiredOffer(data: UpgradeNudgeData, locale: EmailLocale): RenderedEmail {
  const copy = pricingEmailCopy[locale];
  const email = mail(locale, copy.expiry.subject, copy.offer.preheader, copy.offer.footer, data);
  email.heading(copy.expiry.heading);
  email.greet(data.firstName, data.bikeName ? fill(copy.expiry.intro, { bike: data.bikeName }) : copy.expiry.introWithoutBike);
  const items = list(copy.expiry.benefits);
  email.add(items.html, items.text);
  email.section(copy.offer.heading);
  email.paragraph(copy.offer.intro);
  email.add(hero({ eyebrow: copy.offer.detail, heading: formatPrice(PRODUCTS.annual_entry.priceCents / 100, locale) }),
    `${formatPrice(PRODUCTS.annual_entry.priceCents / 100, locale)}\n${copy.offer.detail}`);
  email.paragraph(fill(copy.offer.body, { renewal: formatPrice(PRODUCTS.annual.renewalPriceCents / 100, locale) }));
  email.button(data.actionUrl, copy.offer.button);
  email.paragraph(copy.offer.after, true);
  return email.finish();
}

export function renderRenewalReminder(data: RenewalReminderData, locale: EmailLocale): RenderedEmail {
  const copy = pricingEmailCopy[locale].renewal;
  const date = data.renewalAt === undefined ? undefined : dateLabel(data.renewalAt, locale);
  const subject = data.renewalAt === undefined ? copy.subjectWithoutDate
    : fill(copy.subject, { date: dateLabel(data.renewalAt, locale, true) });
  const discount = data.firstYearPriceCents === 2450 && PRODUCTS.annual.renewalPriceCents === 1950
    ? `${copy.discount} ${copy.discountDetail}` : undefined;
  const email = mail(locale, subject, copy.preheader, copy.footer);
  email.heading(subject);
  email.greet(data.firstName, data.daysUntilRenewal === 30 ? copy.intro : copy.introWithoutDate);
  const values = rows([
    ...(date ? [{ label: copy.date, value: date }] : []),
    { label: copy.price, value: formatPrice(PRODUCTS.annual.renewalPriceCents / 100, locale), unit: copy.unit },
  ], discount);
  email.add(values.html, [values.text, discount].filter(Boolean).join("\n"));
  const metrics = [
    { label: copy.bikes, value: data.bikesAdjusted }, { label: copy.reports, value: data.reportsCreated },
    { label: copy.gifts, value: data.giftsGiven },
  ].flatMap(item => item.value === undefined ? [] : [{ label: item.label, value: formatNumber(item.value, locale) }]);
  if (metrics.length) {
    email.section(copy.year);
    email.add(valueTiles(metrics, { columns: 3, valueFirst: true }), metrics.map(item => `${item.value} ${item.label}`).join("\n"));
  }
  if (data.giftsIncluded) email.paragraph(copy.nextGifts);
  email.button(data.actionUrl, copy.button);
  const cancellation = data.cancellationUrl
    ? `<p><a href="${safeHref(data.cancellationUrl)}" style="color:#0A7263;font-weight:700;">`
      + `${escapeHtml(copy.cancel)}</a></p>` : "";
  email.add(paperBlock(paragraph(copy.cancelBody, { small: true }) + cancellation),
    `${copy.cancelBody}${data.cancellationUrl ? `\n${copy.cancel}: ${data.cancellationUrl}` : ""}`);
  email.paragraph(emailCopy[locale].common.reply, true);
  return email.finish();
}

export function renderCancellationConfirmation(data: CancellationConfirmationData, locale: EmailLocale): RenderedEmail {
  const copy = pricingEmailCopy[locale].cancellation;
  const email = mail(locale, copy.subject, copy.preheader, copy.footer);
  email.heading(copy.heading);
  email.greet(data.firstName, fill(copy.intro, { date: dateLabel(data.accessEndsAt, locale) }));
  if (data.refundAmount !== undefined) email.paragraph(fill(copy.refund, { amount: formatPrice(data.refundAmount, locale) }));
  email.paragraph(copy.body);
  email.button(data.actionUrl, copy.button);
  return email.finish();
}

export function renderTransitionAnnouncement(data: TransitionAnnouncementData, locale: EmailLocale): RenderedEmail {
  const copy = pricingEmailCopy[locale].transition;
  const date = data.launchAt === null ? locale === "nl" ? "[DATUM]" : "[DATE]" : dateLabel(data.launchAt, locale);
  const subject = fill(data.eligibleTransitionOffer ? copy.subject : copy.heading, { date });
  const email = mail(locale, subject, copy.preheader, copy.footer);
  email.heading(fill(copy.heading, { date }));
  email.greet(data.firstName, data.daysUntilLaunch === 14 ? copy.intro : copy.introWithoutDays);
  email.section(copy.changes);
  const values = rows([
    { label: copy.free, value: copy.freePrice },
    { label: copy.single, value: formatPrice(PRODUCTS.single.priceCents / 100, locale), unit: copy.singleUnit },
    { label: copy.annual, value: formatPrice(PRODUCTS.annual.priceCents / 100, locale), unit: copy.annualUnit },
  ]);
  email.add(values.html, values.text);
  email.paragraph(copy.prices, true);
  email.section(copy.keeps);
  const items = list(copy.benefits.map(text => ({ text })));
  email.add(items.html, items.text);
  if (data.eligibleTransitionOffer) {
    const detail = fill(copy.giftBody, { date });
    email.add(hero({ eyebrow: copy.eyebrow, heading: copy.gift, detail }), `${copy.eyebrow}\n${copy.gift}\n${detail}`);
  }
  email.button(data.actionUrl, copy.button);
  email.paragraph(emailCopy[locale].common.reply, true);
  return email.finish();
}

/** Annual variants use the actual purchased product, never single-bike confirmation copy. */
function renderAnnualPurchase(data: PurchaseConfirmationData, locale: EmailLocale): RenderedEmail {
  const copy = pricingEmailCopy[locale];
  const email = mail(locale, copy.receipt.subject, copy.welcome.preheader, copy.receipt.footer);
  email.heading(copy.receipt.subject);
  email.greet(data.firstName, copy.receipt.intro);
  const values = rows([
    { label: copy.purchase.product, value: copy.products[data.productId!] },
    ...(data.amountPaid === undefined ? []
      : [{ label: copy.purchase.amount, value: formatPrice(data.amountPaid, locale), unit: copy.purchase.vat }]),
    ...(data.accessEndsAt === undefined ? []
      : [{ label: copy.purchase.until, value: dateLabel(data.accessEndsAt, locale) }]),
  ]);
  email.add(values.html, values.text);
  email.button(data.actionUrl, copy.purchase.button);
  if (data.invoiceAttached) email.paragraph(copy.purchase.invoice, true);
  if (data.withdrawalAcknowledged) email.paragraph(copy.purchase.withdrawal, true);
  return email.finish();
}
