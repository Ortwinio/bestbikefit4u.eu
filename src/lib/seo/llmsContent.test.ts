import { describe, expect, it } from "vitest";
import { getLlmsContent } from "./llmsContent";
import { methodsCopy } from "@/i18n/marketing/science";
import { PAIN_PAGES } from "@/content/painPages";
import { pressureBikeLandingMessages } from "@/i18n/marketing/pressureBikeLanding";
import { llmsCopy } from "@/i18n/marketing/llms";

describe("public LLMS answer resolver", () => {
  it.each(["nl", "en"] as const)("reuses science, pain and pressure source copy in %s", locale => {
    expect(getLlmsContent("/science/bike-fit-methods", locale)).toEqual({
      title: methodsCopy[locale].hero.title, answer: methodsCopy[locale].hero.description,
    });
    for (const pain of PAIN_PAGES) {
      expect(getLlmsContent(`/pain/${pain.slug}`, locale).answer).toBe(pain[locale].intro);
    }
    const pressure = getLlmsContent(locale === "nl" ? "/bandenspanning/racefiets" : "/tire-pressure/road-bike", locale);
    expect(pressure.answer).toBe(pressureBikeLandingMessages[locale].intro);
    expect(pressure.limits).toBe(pressureBikeLandingMessages[locale].limits);
    expect(pressure.method).toContain("28 / 28 mm");
  });
  it.each(["nl", "en"] as const)("does not invent author identity or expose unknown CMS slugs in %s", locale => {
    expect(getLlmsContent("/authors/ortwin-verreck", locale)).toEqual({
      title: "Ortwin Verreck", answer: "BikeFitBoost",
    });
    const content = getLlmsContent("/blog/sensitive-slug?email=lisa@example.com#value", locale);
    expect(content.answer).toBe(llmsCopy[locale].dynamic);
    expect(JSON.stringify(content)).not.toMatch(/sensitive|lisa|example.com/);
    expect(getLlmsContent("/guides/cms-only-example", locale).answer).toBe(llmsCopy[locale].dynamic);
  });
  it("keeps Dutch dictionary keys aligned with English", () => {
    expect(Object.keys(llmsCopy.nl.pages)).toEqual(Object.keys(llmsCopy.en.pages));
    expect(Object.keys(llmsCopy.nl.tools)).toEqual(Object.keys(llmsCopy.en.tools));
  });
});
