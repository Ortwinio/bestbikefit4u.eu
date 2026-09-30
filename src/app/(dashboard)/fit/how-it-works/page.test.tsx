import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import type { Locale } from "@/i18n/config";
import { getFitMethodCopy } from "@/i18n/account/fitMethod";
import { getFitStartCopy } from "@/i18n/account/fitStart";

const state = vi.hoisted(() => ({ locale: "nl" as Locale }));
vi.mock("@/i18n/request", () => ({ getRequestLocale: async () => state.locale }));

import HowItWorksPage, { generateMetadata } from "./page";

describe("fit method content", () => {
  it.each(["nl", "en"] as const)("preserves inputs, process, outputs, tips and return navigation in %s", async (locale) => {
    state.locale = locale;
    const copy = getFitMethodCopy(locale);
    const html = renderToStaticMarkup(await HowItWorksPage());
    expect(html.match(/<h1\b/g)).toHaveLength(1);
    expect(html).toContain(copy.title);
    expect(html).toContain(`href="/${locale}/fit"`);
    expect(html).toContain(copy.back);
    for (const item of [...copy.inputs, ...copy.steps, ...copy.outputs]) expect(html).toContain(item.title);
    expect(copy.inputs).toHaveLength(4);
    expect(copy.steps).toHaveLength(5);
    expect(copy.outputs).toHaveLength(6);
    expect(html).toContain('<span class="font-mono">3–5</span>');
    expect(html).not.toMatch(/Voorbeeldgegevens|Ontwerpstaat|\[CLAIM|LeMond|Holmes|Hamley/);
    expect(await generateMetadata()).toEqual({ title: copy.eyebrow });
  });

  it("provides matching owned dictionary keys for both locales", () => {
    expect(Object.keys(getFitStartCopy("en"))).toEqual(Object.keys(getFitStartCopy("nl")));
    expect(Object.keys(getFitMethodCopy("en"))).toEqual(Object.keys(getFitMethodCopy("nl")));
    for (const locale of ["en", "nl"] as const) {
      for (const value of Object.values(getFitStartCopy(locale))) expect(value.trim()).not.toBe("");
    }
  });
});
