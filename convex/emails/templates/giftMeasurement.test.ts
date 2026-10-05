import { describe, expect, it } from "vitest";
import { giftEmailCopy } from "../i18n/gifts";
import { renderGiftMeasurement } from "./giftMeasurement";

const data = {
  senderFirstName: "Thomas",
  message: "Veel plezier!",
  expiresAt: Date.UTC(2026, 10, 4),
  actionUrl: "https://bikefitboost.com/nl/gift#token=test-token",
};

describe.each(["nl", "en"] as const)("M11 %s", locale => {
  it("includes gift terms, redemption deadline and correct upgrade prices", () => {
    const email = renderGiftMeasurement(data, locale);
    expect(email.subject).toContain("Thomas");
    expect(email.html).toContain(`lang="${locale}"`);
    expect(email.text).toContain(locale === "nl" ? "€13,50" : "€13.50");
    expect(email.text).toContain(locale === "nl" ? "€9,50" : "€9.50");
    expect(email.text).toContain(locale === "nl" ? "€21,50" : "€21.50");
    expect(email.text).toContain(locale === "nl" ? "1 fiets" : "1 bike");
    expect(email.text).toContain(locale === "nl" ? "3 maanden" : "3 months");
    expect(email.text).toContain(locale === "nl" ? "6 maanden" : "6 months");
    expect(email.text).toContain(locale === "nl" ? "1 maand" : "1 month");
    expect(email.text).toContain(locale === "nl" ? "4 nov 2026" : "4 Nov 2026");
    expect(email.html).toContain(data.actionUrl);
    expect(email.html).not.toMatch(/\{\w+\}|undefined|NaN|display\s*:\s*(?:flex|grid)/);
  });

  it("escapes sender and optional personal message without interpreting markup", () => {
    const email = renderGiftMeasurement({ ...data, senderFirstName: '<img src=x onerror="alert(1)">',
      message: '<script>alert("x")</script> & enjoy' }, locale);
    for (const unsafe of ["<script", "<img src=x", 'href="javascript:']) expect(email.html).not.toContain(unsafe);
    expect(email.html).toContain("&lt;script&gt;");
    expect(email.text).toContain('<script>alert("x")</script> & enjoy');
  });

  it("rejects non-HTTP redemption URLs", () => {
    expect(() => renderGiftMeasurement({ ...data, actionUrl: "javascript:alert(1)" }, locale))
      .toThrow("Email links must use HTTP or HTTPS");
  });

  it("omits an empty note and does not invent personal data", () => {
    const email = renderGiftMeasurement({ ...data, senderFirstName: undefined, message: "  " }, locale);
    expect(email.html).not.toContain(giftEmailCopy[locale].message);
    expect(email.subject).toContain(giftEmailCopy[locale].anonymousSender);
    expect(email.text).not.toContain("Thomas");
  });
});

it("keeps dictionary keys and placeholders in parity", () => {
  expect(Object.keys(giftEmailCopy.nl)).toEqual(Object.keys(giftEmailCopy.en));
  for (const key of Object.keys(giftEmailCopy.nl) as Array<keyof typeof giftEmailCopy.nl>) {
    expect(JSON.stringify(giftEmailCopy.nl[key]).match(/\{\w+\}/g) ?? [])
      .toEqual(JSON.stringify(giftEmailCopy.en[key]).match(/\{\w+\}/g) ?? []);
  }
});
