import { describe, expect, it } from "vitest";
import { BRAND } from "../../lib/brand";
import { PRODUCTS } from "../../../shared/pricing/products";
import { parseHtml } from "../../../scripts/lib/html.mjs";
import { pricingEmailCopy } from "../i18n/pricing";
import * as templates from "./index";
import { sampleData } from "./sampleData";
import type { EmailLocale } from "./index";

const serviceRenders = {
  purchaseConfirmation: templates.renderPurchaseConfirmation,
  subscriptionWelcome: templates.renderSubscriptionWelcome,
  accessExpired: templates.renderAccessExpired,
  renewalReminder: templates.renderRenewalReminder,
  cancellationConfirmation: templates.renderCancellationConfirmation,
  transitionAnnouncement: templates.renderTransitionAnnouncement,
};

function strings(value: unknown, prefix = ""): Array<[string, string]> {
  if (typeof value === "string") return [[prefix, value]];
  return Object.entries(value as Record<string, unknown>).flatMap(([key, item]) => strings(item, `${prefix}.${key}`));
}

it("has matching pricing dictionary keys and interpolation parameters", () => {
  const nl = strings(pricingEmailCopy.nl);
  const en = new Map(strings(pricingEmailCopy.en));
  expect(nl.map(([key]) => key).sort()).toEqual([...en.keys()].sort());
  for (const [key, value] of nl) {
    const translation = en.get(key)!;
    expect(translation.trim()).not.toBe("");
    expect(value.match(/\{\w+\}/g)?.sort() ?? []).toEqual(translation.match(/\{\w+\}/g)?.sort() ?? []);
  }
});

describe.each<EmailLocale>(["nl", "en"])("%s pricing service emails", locale => {
  const data = sampleData(locale);
  for (const key of Object.keys(serviceRenders) as Array<keyof typeof serviceRenders>) {
    it(`renders complete table-based ${key} without subscription marketing links`, () => {
      const render = serviceRenders[key] as (value: typeof data[typeof key], locale: EmailLocale) => templates.RenderedEmail;
      const result = render(data[key], locale);
      expect(result.subject).not.toBe("");
      expect([result.subject, result.preheader, result.html, result.text].join("\n"))
        .not.toMatch(/bestbikefit4u/i);
      expect(result.text).toContain(BRAND.host);
      expect(result.html).toContain(`${BRAND.siteUrl}/brand/png/logo-horizontaal-960.png`);
      expect(result.preheader.length).toBeGreaterThan(10);
      expect(result.preheader.length).toBeLessThanOrEqual(90);
      expect(result.html).not.toMatch(/\{\w+\}|undefined|NaN/);
      expect(result.html).not.toMatch(/display\s*:\s*(?:inline-)?(?:flex|grid)/i);
      expect(result.text).not.toMatch(/<(?:p|table|span|br)\b/);
      expect(result.text).not.toMatch(/€\s*(?:9(?:\D|$)|12[,.]50)|per (?:maand|month)/);
      expect(result.html).not.toContain("preview-only");
      const dom = parseHtml(result.html);
      expect(dom.window.document.documentElement.lang).toBe(locale);
      expect(dom.window.document.querySelector("script")).toBeNull();
      expect(dom.window.document.querySelector('meta[name="color-scheme"]')).not.toBeNull();
      expect(result.html).toContain("<v:rect");
      dom.window.close();
    });
  }

  it("uses the board purchase copy only with supplied purchase evidence", () => {
    const result = templates.renderPurchaseConfirmation(data.purchaseConfirmation, locale);
    expect(result.text).toContain(locale === "nl" ? "€13,50" : "€13.50");
    expect(result.text).toContain(locale === "nl" ? "3 jan 2027" : "3 Jan 2027");
    expect(result.text).toContain(locale === "nl" ? "Je factuur zit als PDF" : "Your invoice is attached");
    const minimal = templates.renderPurchaseConfirmation({ productId: "single", actionUrl: data.purchaseConfirmation.actionUrl }, locale);
    expect(minimal.text).not.toMatch(/2027|invoice|factuur|withdrawal|herroepingsrecht|€/i);
    expect(minimal.text).not.toContain("Canyon");
  });

  it.each(["annual", "annual_entry", "annual_personal"] as const)("labels %s purchase honestly", productId => {
    const result = templates.renderPurchaseConfirmation({
      ...data.purchaseConfirmation, productId, amountPaid: PRODUCTS[productId].priceCents / 100,
    }, locale);
    expect(result.text).toContain(pricingEmailCopy[locale].products[productId]);
    expect(result.text).not.toContain(pricingEmailCopy[locale].purchase.introWithoutBike);
  });

  it("renders board renewal price and discount without inventing dates or activity", () => {
    const result = templates.renderRenewalReminder(data.renewalReminder, locale);
    expect(result.text).toContain(locale === "nl" ? "€19,50" : "€19.50");
    expect(result.text).toContain(locale === "nl" ? "€5 korting" : "€5 discount");
    const minimal = templates.renderRenewalReminder({ actionUrl: data.renewalReminder.actionUrl }, locale);
    expect(minimal.text).not.toMatch(/2027|30|Canyon/);
    expect(minimal.text).not.toContain(pricingEmailCopy[locale].renewal.year);
    expect(minimal.text).not.toContain(pricingEmailCopy[locale].renewal.nextGifts);
  });

  it.each([1350, 23450, undefined])("does not claim a discount for first-year price %s", firstYearPriceCents => {
    const result = templates.renderRenewalReminder({ ...data.renewalReminder, firstYearPriceCents }, locale);
    const discount = locale === "nl" ? "€5 korting" : "€5 discount";
    expect(result.text).not.toContain(discount);
    expect(result.html).not.toContain(discount);
    expect(result.text).toContain(locale === "nl" ? "€19,50" : "€19.50");
    const wrapper = templates.renderProExplainer({ ...data.proExplainer, firstYearPriceCents }, locale);
    expect(wrapper.text).not.toContain(discount);
    expect(wrapper.html).not.toContain(discount);
  });

  it("keeps unknown transition date visible and requires eligibility for the free offer", () => {
    const eligible = templates.renderTransitionAnnouncement(data.transitionAnnouncement, locale);
    expect(eligible.text).toContain(locale === "nl" ? "[DATUM]" : "[DATE]");
    expect(eligible.text).toContain(pricingEmailCopy[locale].transition.gift);
    const ineligible = templates.renderTransitionAnnouncement({
      ...data.transitionAnnouncement, eligibleTransitionOffer: false, daysUntilLaunch: undefined,
    }, locale);
    expect(ineligible.text).not.toContain(pricingEmailCopy[locale].transition.gift);
    expect(ineligible.subject).not.toContain(locale === "nl" ? "gratis meting" : "free measurement");
    expect(ineligible.text).not.toContain("14");
  });

  it("separates the expiry service notice from the consent-based M08 offer", () => {
    const service = templates.renderAccessExpired(data.accessExpired, locale);
    const marketing = templates.renderUpgradeNudge(data.upgradeNudge, locale);
    expect(service.text).not.toContain("€");
    expect(service.html).not.toContain("preview-only");
    expect(marketing.html).toContain("preview-only");
    expect(marketing.text).toContain(locale === "nl" ? "€13,50" : "€13.50");
  });

  it("only includes an actual supplied refund amount", () => {
    const without = templates.renderCancellationConfirmation(data.cancellationConfirmation, locale);
    expect(without.text).not.toContain(locale === "nl" ? "Restitutie" : "refund");
    const withRefund = templates.renderCancellationConfirmation({ ...data.cancellationConfirmation, refundAmount: 5 }, locale);
    expect(withRefund.text).toContain("€5");
  });
});

it("keeps the existing welcome, 24h tips and upgrade lifecycle separate from purchase facts", () => {
  const data = sampleData("nl");
  const welcome = templates.renderAccessWelcome(data.fitPassWelcome, "nl");
  const tips = templates.renderFitTips(data.proExplainer, "nl");
  const options = templates.renderAccessOptions(data.upgradeNudge, "nl");
  expect(welcome.text).not.toContain("aankoopbevestiging");
  expect(tips.text).not.toContain("verlengt");
  expect(options.text).not.toContain("is afgelopen");
  expect(options.text).toContain("€24,50");
});
