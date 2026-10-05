import { describe, expect, it } from "vitest";
import { renderKneeAngleEvaluation } from "./reliability";
import { reliabilityEmailCopy } from "../i18n/reliability";
import { sampleData } from "./sampleData";
describe("knee evaluation service mail", () => {
  it("keeps NL/EN keys equal", () => expect(Object.keys(reliabilityEmailCopy.nl))
    .toEqual(Object.keys(reliabilityEmailCopy.en)));
  it.each(["nl", "en"] as const)("renders %s with real values, preferences and no placeholders", locale => {
    const mail = renderKneeAngleEvaluation({ ...sampleData(locale).kneeAngleEvaluation, firstName: "<script>x</script>" }, locale);
    expect(mail.html).toContain(`lang="${locale}"`);
    expect(mail.text).toContain("787 mm"); expect(mail.text).toContain("31°");
    expect(mail.html).not.toContain("<script>"); expect(mail.html).not.toMatch(/display:\s*(flex|grid)/);
    expect(mail.text).toContain(sampleData(locale).kneeAngleEvaluation.unsubscribeUrl);
    expect(mail.text).not.toMatch(/\{\w+\}/);
    expect(mail.subject).toBe(locale === "nl" ? "Hoe voelt je zadelhoogte na een week?"
      : "How does your saddle height feel after a week?");
  });
});
