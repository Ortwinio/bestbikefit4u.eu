import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { build } from "esbuild";
import { describe, expect, it } from "vitest";
import { parseHtml } from "../../../scripts/lib/html.mjs";
import { BRAND } from "../../lib/brand";
import { emailCopy } from "../i18n";
import { renderDay7CheckIn, renderDay14Evaluation, type EmailLocale } from "./index";
import { sampleData } from "./sampleData";

describe.each<EmailLocale>(["nl", "en"])("%s follow-up renderers", (locale) => {
  const data = sampleData(locale);
  const cases = [
    { kind: "day7CheckIn" as const, render: () => renderDay7CheckIn(data.day7CheckIn, locale) },
    { kind: "day14Evaluation" as const, render: () => renderDay14Evaluation(data.day14Evaluation, locale) },
  ];
  for (const { kind, render } of cases) {
    it(`${kind} preserves copy, progress, localized links and HTML/text parity`, () => {
      const result = render();
      const copy = emailCopy[locale][kind];
      expect(result.subject).toBe(copy.subject);
      expect(result.preheader).toBe(copy.preheader);
      const dom = parseHtml(result.html);
      const document = dom.window.document;
      for (const value of [copy.eyebrow, copy.heading, copy.intro, copy.button, copy.progressLabel]) {
        expect(result.text).toContain(value);
        expect(`${document.body.textContent} ${document.querySelector('[role="img"]')?.getAttribute("aria-label")}`).toContain(value);
      }
      expect(document.querySelector('[role="img"]')?.getAttribute("aria-label")).toBe(copy.progressLabel);
      expect([...document.querySelectorAll('[role="img"] td')].map((cell) => cell.textContent))
        .toEqual(Array.from({ length: 14 }, (_, index) => String(index + 1)));
      for (const link of document.querySelectorAll("a")) {
        const url = new URL(link.href);
        expect(url.origin).toBe(BRAND.siteUrl);
        if (url.pathname !== "/") {
          expect(url.pathname).toMatch(new RegExp(`^/${locale}/`));
          expect(result.text).toContain(link.href);
        }
      }
      expect(result.text).toContain(BRAND.host);
      expect(result.html).not.toMatch(/bikefitboost\.eu|In de inbox|Dag 0|Day 0|href="#"/);
      dom.window.close();
    });
  }

  it("places the decorative board gauge beside the day-14 tip", () => {
    const result = renderDay14Evaluation(data.day14Evaluation, locale);
    const dom = parseHtml(result.html);
    const gauge = dom.window.document.querySelector('img[src$="/email/icon-gauge.png"]');
    expect(gauge?.getAttribute("alt")).toBe("");
    expect(gauge?.getAttribute("width")).toBe("22");
    expect(gauge?.getAttribute("height")).toBe("22");
    expect(gauge?.closest("td")?.nextElementSibling?.textContent)
      .toBe(`${emailCopy[locale].day14Evaluation.tipTitle} ${emailCopy[locale].day14Evaluation.tip}`);
    expect(gauge?.closest("table")?.getAttribute("role")).toBe("presentation");
    expect(result.html).not.toContain("icon-tip.png");
    dom.window.close();
  });

  it("preserves all explicit answer destinations without manufacturing prefill state", () => {
    const answerUrls = {
      better: `${BRAND.siteUrl}/${locale}/fit?opaque=one&value=%22`,
      same: `${BRAND.siteUrl}/${locale}/fit?opaque=two`,
      worse: `${BRAND.siteUrl}/${locale}/fit?opaque=three`,
    };
    const result = renderDay7CheckIn({ ...data.day7CheckIn, answerUrls }, locale);
    const dom = parseHtml(result.html);
    for (const answer of ["better", "same", "worse"] as const) {
      const label = emailCopy[locale].day7CheckIn.answers[answer];
      expect([...dom.window.document.querySelectorAll("a")].find((link) => link.textContent === label)?.href)
        .toBe(answerUrls[answer]);
      expect(result.text).toContain(`${label}: ${answerUrls[answer]}`);
    }
    expect(result.html).toContain("&amp;value=%22");
    dom.window.close();
  });

  it("escapes personal data and handles absent or blank names", () => {
    for (const firstName of [undefined, "  ", '<img src=x onerror="bad()">&\'']) {
      for (const result of [
        renderDay7CheckIn({ ...data.day7CheckIn, firstName }, locale),
        renderDay14Evaluation({ ...data.day14Evaluation, firstName }, locale),
      ]) {
        expect(result.html).not.toContain("Lisa");
        const dom = parseHtml(result.html);
        expect(dom.window.document.querySelector("[onerror],script")).toBeNull();
        if (firstName?.trim()) {
          expect(result.html).toContain("&lt;img");
          expect(result.text).toContain(firstName);
        } else {
          expect(result.text).toContain(emailCopy[locale].common.genericGreeting);
        }
        dom.window.close();
      }
    }
  });

  it("rejects unsafe action, preference and answer URLs", () => {
    for (const url of ["javascript:alert(1)", "data:text/html,bad", "/relative", "#"]) {
      for (const field of ["actionUrl", "unsubscribeUrl", "preferencesUrl"] as const) {
        expect(() => renderDay7CheckIn({ ...data.day7CheckIn, [field]: url }, locale)).toThrow();
        expect(() => renderDay14Evaluation({ ...data.day14Evaluation, [field]: url }, locale)).toThrow();
      }
      for (const answer of ["better", "same", "worse"] as const) {
        expect(() => renderDay7CheckIn({ ...data.day7CheckIn,
          answerUrls: { ...data.day7CheckIn.answerUrls, [answer]: url } }, locale)).toThrow();
      }
    }
  });
});

it("keeps the complete preview import graph pure and free of transport/lifecycle modules", async () => {
  const result = await build({
    entryPoints: ["convex/emails/templates/index.ts", "convex/emails/templates/sampleData.ts"],
    bundle: true, write: false, outdir: "unused", platform: "node", metafile: true,
  });
  for (const filename of Object.keys(result.metafile!.inputs)) {
    expect(filename).toMatch(/^(convex\/emails\/(templates|i18n|layout)\/|convex\/emails\/format\.ts$|convex\/lib\/brand\.ts$|shared\/brand\.ts$)/);
    expect(readFileSync(resolve(filename), "utf8")).not.toMatch(/\b(fetch|XMLHttpRequest|Resend|runMutation|runAction|scheduler|setTimeout|setInterval)\s*\(/);
  }
});
