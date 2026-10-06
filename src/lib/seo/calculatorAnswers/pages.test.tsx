// @vitest-environment jsdom
import type { ReactNode } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import PowerSpeedPage from "@/app/(public)/calculators/power-speed/page";
import ClimbPlannerPage from "@/app/(public)/calculators/climb-planner/page";
import FtpWkgPage from "@/app/(public)/calculators/ftp-wkg/page";
import FuelHydrationPage from "@/app/(public)/calculators/fuel-hydration/page";
import { getPerformanceAnswer } from "./performance";

const request = vi.hoisted(() => ({ locale: "nl" as "nl" | "en" }));
vi.mock("@/i18n/request", () => ({ getRequestLocale: async () => request.locale }));
vi.mock("@/app/(public)/calculators/power-speed/PerformanceCalculator", () => ({
  PerformanceCalculator: ({ tool }: { tool: string }) => <div data-calculator-form={tool} />,
}));
vi.mock("@/components/analytics/TrackedCtaLink", () => ({
  TrackedCtaLink: ({ href, children }: { href: string; children?: ReactNode }) => <a href={href}>{children}</a>,
}));
// The async nonce wrapper needs a Next request; preserve its real serialized schema output.
vi.mock("@/components/seo/JsonLd", () => ({
  JsonLd: ({ schema }: { schema: object | object[] }) => <script type="application/ld+json"
    dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />,
}));

const pages = [
  ["power-speed", PowerSpeedPage], ["climb-planner", ClimbPlannerPage],
  ["ftp-wkg", FtpWkgPage], ["fuel-hydration", FuelHydrationPage],
] as const;

describe.each(pages)("%s server answer content", (tool, Page) => {
  it.each(["nl", "en"] as const)("renders answers and one visible matching FAQ schema in %s", async locale => {
    request.locale = locale;
    const document = new DOMParser().parseFromString(renderToStaticMarkup(await Page()), "text/html");
    const scripts = [...document.querySelectorAll('script[type="application/ld+json"]')];
    const schemas = scripts.flatMap(script => JSON.parse(script.textContent ?? "[]"));
    scripts.forEach(script => script.remove());
    const faqs = schemas.filter(schema => schema["@type"] === "FAQPage");
    expect(faqs).toHaveLength(1);
    expect(faqs[0].mainEntity.length).toBeGreaterThan(0);
    for (const question of faqs[0].mainEntity) {
      expect(document.body.textContent).toContain(question.name);
      expect(document.body.textContent).toContain(question.acceptedAnswer.text);
    }
    const section = document.querySelector(`[data-calculator-answer="${tool}"]`);
    expect(section).not.toBeNull();
    const content = getPerformanceAnswer(tool, locale);
    for (const { segment } of new Intl.Segmenter(locale, { granularity: "sentence" }).segment(content.answer)) {
      expect(section?.textContent).toContain(segment.trim());
    }
    for (const text of [content.method, content.limits, ...content.mistakes]) {
      expect(section?.textContent).toContain(text);
    }
    for (const row of [...content.example.inputs, ...content.example.results]) {
      expect(section?.textContent).toContain(row.label);
      expect(section?.textContent).toContain(row.value);
    }
    const form = document.querySelector(`[data-calculator-form="${tool}"]`);
    expect(form?.nextElementSibling).toBe(section);
  });
});
