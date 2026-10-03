// @vitest-environment jsdom
import { describe, expect, it, vi } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { PressureBikeLanding } from "./PressureBikeLanding";
import { EN_BIKE_TYPES, BIKE_TYPE_LABELS, buildPressureBikeTable } from "@/lib/seo/programmatic/tirePressure";
import { pressureBikeLandingMessages } from "@/i18n/marketing/pressureBikeLanding";

vi.mock("./JsonLd", () => ({ JsonLd: ({schema}: {schema: object}) =>
  <script type="application/ld+json" dangerouslySetInnerHTML={{__html:JSON.stringify(schema)}} /> }));

describe("complete bike pressure tables", () => {
  it.each(["nl", "en"] as const)("renders every bike in %s with real rows and matching FAQ", locale => {
    for (const bikeType of EN_BIKE_TYPES) {
      const copy = pressureBikeLandingMessages[locale];
      const doc = new DOMParser().parseFromString(
        renderToStaticMarkup(<PressureBikeLanding locale={locale} bikeType={bikeType} />), "text/html");
      expect(doc.querySelector("h1")?.textContent).toBe(copy.title(BIKE_TYPE_LABELS[bikeType][locale]));
      expect(doc.querySelectorAll("table")).toHaveLength(2);
      for (const table of doc.querySelectorAll("table")) {
        expect(table.querySelectorAll("tbody tr")).toHaveLength(10);
        expect(table.textContent).toContain("55 kg");
        expect(table.textContent).toContain("100 kg");
        const setup = table.getAttribute("data-pressure-setup") as "tubeless" | "innerTube";
        const number = (value: number) => new Intl.NumberFormat(locale, { maximumFractionDigits: 2 }).format(value);
        [...table.querySelectorAll("tbody tr")].forEach((element, index) => {
          const row = buildPressureBikeTable(bikeType)[index];
          expect([...element.querySelectorAll("td")].map(cell => cell.textContent)).toEqual([
            `${number(row[setup].frontBar)} / ${number(row[setup].frontPsi)}`,
            `${number(row[setup].rearBar)} / ${number(row[setup].rearPsi)}`,
          ]);
        });
      }
      expect(doc.querySelector("article")?.textContent).toContain(copy.limits);
      const faq = JSON.parse(doc.querySelector('script[type="application/ld+json"]')!.textContent!);
      expect(faq.mainEntity).toHaveLength(3);
      expect(doc.querySelectorAll("details")).toHaveLength(3);
      for (const question of faq.mainEntity) expect(doc.querySelector("article")?.textContent).toContain(question.name);
      expect(doc.querySelectorAll('a[href*="kg-"]')).toHaveLength(0);
    }
  });
});
