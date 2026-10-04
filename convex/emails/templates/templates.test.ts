import { describe, expect, it } from "vitest";
import { parseHtml } from "../../../scripts/lib/html.mjs";
import * as templates from "./index";
import { sampleData } from "./sampleData";
import type { EmailLocale } from "./index";

const renders = {
  loginCode: templates.renderLoginCode,
  resultsSummary: templates.renderResultsSummary,
  fitReport: templates.renderFitReport,
  fitPassWelcome: templates.renderFitPassWelcome,
  caseStudyLead: templates.renderCaseStudyLead,
  caseStudyConfirmation: templates.renderCaseStudyConfirmation,
  fitReminder: templates.renderFitReminder,
  upgradeNudge: templates.renderUpgradeNudge,
  winback: templates.renderWinback,
  proExplainer: templates.renderProExplainer,
  day1Tips: templates.renderDay1Tips,
  day7CheckIn: templates.renderDay7CheckIn,
  day14Evaluation: templates.renderDay14Evaluation,
};
const service = new Set(["fitReminder", "upgradeNudge", "winback", "day1Tips", "day7CheckIn", "day14Evaluation"]);
const expectedSubjects = {
  nl: [
    "482915 is je BikeFitBoost-inlogcode",
    "Je fit is klaar: zadel op 754 mm",
    "Je fitrapport: framemaat XL",
    "Je volledige stappenplan voor je Canyon Endurace staat klaar",
    "Nieuwe aanmelding voor een praktijkverhaal: Lisa Jansen",
    "Bedankt! We mailen je over je verhaal",
    "Je fit in 10 minuten, met alleen een meetlint",
    "Je meting is afgelopen — je gegevens blijven bewaard",
    "Klopt je fit nog?",
    "Je jaarabonnement verlengt op 1 maart",
    "3 tips voor een fit die echt klopt",
    "Hoe rijdt je nieuwe zadelhoogte?",
    "Twee weken verder: tijd voor je evaluatie",
  ],
  en: [
    "482915 is your BikeFitBoost login code",
    "Your fit is ready: saddle at 754 mm",
    "Your fit report: frame size XL",
    "Your complete setup plan for your Canyon Endurace is ready",
    "Nieuwe aanmelding voor een praktijkverhaal: Lisa Jansen",
    "Thanks! We'll email you about your story",
    "Your fit in 10 minutes, with just a tape measure",
    "Your measurement has ended — your data is saved",
    "Is your fit still right?",
    "Your annual subscription renews on 1 March",
    "3 tips for a fit that's spot on",
    "How does your new saddle height feel?",
    "Two weeks on: time for your evaluation",
  ],
};

describe.each<EmailLocale>(["nl", "en"])("%s email templates", (locale) => {
  const data = sampleData(locale);
  for (const [index, kind] of Object.keys(renders).entries()) {
    it(`renders complete, safe table markup and plain text for ${kind}`, () => {
      const key = kind as keyof typeof renders;
      // Each data object is checked against its renderer's contract in sampleData.ts.
      const render = renders[key] as (value: typeof data[typeof key], locale: EmailLocale) => templates.RenderedEmail;
      const result = render(data[key], locale);
      expect(result.subject).toBe(expectedSubjects[locale][index]);
      expect(result.preheader.length).toBeGreaterThan(10);
      expect(result.html).not.toMatch(/\{(?:firstName|name|code|bike|saddleHeight|frameSize|confidence|date|min|max|version)\}/);
      expect(result.html).not.toMatch(/display\s*:\s*(?:inline-)?(?:flex|grid)/i);
      expect(result.text).not.toMatch(/<(?:table|p|br|span|img)\b/i);
      expect(result.text).not.toContain("undefined");
      expect(result.text).not.toContain("NaN");
      const dom = parseHtml(result.html);
      const doc = dom.window.document;
      expect(doc.documentElement.lang).toBe(kind === "caseStudyLead" ? "nl" : locale);
      expect(doc.body.firstElementChild?.tagName).toBe("SPAN");
      expect(doc.body.firstElementChild?.textContent).toContain(result.preheader);
      expect(doc.querySelector("script")).toBeNull();
      expect(doc.querySelectorAll('a[href*="token=preview-only"]').length).toBe(service.has(kind) ? 1 : 0);
      const cta = doc.querySelectorAll(`a[href="https://bikefitboost.com/${locale}/fit"]`);
      expect(cta.length).toBe(["loginCode", "caseStudyLead"].includes(kind) ? 0 : 1);
      if (cta.length) expect(result.html).toContain("<v:rect");
      for (const image of doc.querySelectorAll("img")) {
        expect(image.src).toMatch(/^https:\/\/bikefitboost\.com\/(?:email\/[a-z0-9-]+|brand\/png\/logo-horizontaal-960)\.png$/);
        expect(image.hasAttribute("alt")).toBe(true);
      }
      dom.window.close();
    });
  }

  it("omits unavailable bike, test range, geometry, notes and frame details", () => {
    const summary = templates.renderResultsSummary({ saddleHeightMm: 754, actionUrl: data.resultsSummary.actionUrl }, locale);
    expect(summary.text).toContain(locale === "nl" ? "Hoi," : "Hi,");
    expect(summary.text).not.toContain(locale === "nl" ? "testmarge" : "test range");
    expect(summary.text).not.toContain("Canyon");
    const report = templates.renderFitReport({ actionUrl: data.fitReport.actionUrl, confidenceScore: 90 }, locale);
    expect(report.text).not.toContain(locale === "nl" ? "Framegeometrie" : "Frame geometry");
    expect(report.text).not.toContain(locale === "nl" ? "Tips voor jou" : "Tips for you");
    expect(report.subject).toBe(locale === "nl" ? "Je fitrapport" : "Your fit report");
    expect(report.text).not.toContain("%");
  });

  it("formats full fit values and notes, preserves zero, and selects the existing-fit CTA", () => {
    const report = templates.renderFitReport({
      ...data.fitReport, saddleSetbackMm: 0, recommendedStackMm: 610, recommendedReachMm: 395,
      effectiveTopTubeMm: 580, algorithmVersion: "v2", fitNotes: ["<b>Personal note</b>"],
    }, locale);
    expect(report.text).toContain(locale === "nl" ? "172,5 mm" : "172.5 mm");
    expect(report.text).toContain("100 mm · −6°");
    expect(report.text).toContain("0 mm");
    expect(report.text).toContain("610 mm");
    expect(report.html).toContain("&lt;b&gt;Personal note&lt;/b&gt;");
    expect(report.text).toContain(locale === "nl" ? "Berekend met versie v2" : "Calculated with version v2");
    const day1 = templates.renderDay1Tips({ ...data.day1Tips, hasFit: true }, locale);
    expect(day1.text).toContain(locale === "nl" ? "Bekijk mijn fit:" : "View my fit:");
  });
});

it("escapes user fields and rejects executable CTA URLs", () => {
  const data = sampleData("nl");
  const result = templates.renderResultsSummary({
    ...data.resultsSummary, firstName: '<img src=x onerror="bad()">', bikeName: "<script>bad()</script>",
  }, "nl");
  const dom = parseHtml(result.html);
  expect(dom.window.document.querySelector("script")).toBeNull();
  expect(dom.window.document.querySelector("[onerror]")).toBeNull();
  dom.window.close();
  expect(() => templates.renderFitReminder({ ...data.fitReminder, actionUrl: "javascript:alert(1)" }, "nl")).toThrow();
});
