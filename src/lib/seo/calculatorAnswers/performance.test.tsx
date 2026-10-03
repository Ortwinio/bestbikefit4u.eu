import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { CalculatorAnswerSection } from "@/components/calculators/CalculatorAnswerSection";
import { answerSectionMessages } from "@/i18n/calculators/answerSection";
import { climbPlan, ftpEstimate, fuelHydration, speedAtPower } from "@/lib/public-calculators/performance";
import { getPerformanceAnswer, performanceExamples as fixtures } from "./performance";

const tools = ["power-speed", "climb-planner", "ftp-wkg", "fuel-hydration"] as const;
describe("performance answer examples", () => {
  it.each(["nl", "en"] as const)("renders actual engine results and localized explanations in %s", locale => {
    const fmt = (value: number) => new Intl.NumberFormat(locale === "nl" ? "nl-NL" : "en-GB", {
      maximumFractionDigits: 2,
    }).format(value);
    const speed = speedAtPower(fixtures.speed, fixtures.speed.power);
    const climb = climbPlan(fixtures.climb);
    const ftp = ftpEstimate(fixtures.ftp.method, fixtures.ftp.watts, fixtures.ftp.riderMassKg);
    const fuel = fuelHydration(fixtures.fuel);
    expect(getPerformanceAnswer("power-speed", locale).example.results[0].value).toBe(`${fmt(speed.speedKmh)} km/h`);
    expect(getPerformanceAnswer("climb-planner", locale).example.results[0].value)
      .toBe(`${fmt(climb.targetPowerWatts)} W`);
    expect(getPerformanceAnswer("ftp-wkg", locale).example.results.map(row => row.value))
      .toEqual([`${fmt(ftp.ftpWatts)} W`, `${fmt(ftp.wattsPerKg)} W/kg`]);
    expect(getPerformanceAnswer("fuel-hydration", locale).example.results[0].value)
      .toBe(`${fmt(fuel.carbohydrate.gramsPerHour!)} g/h`);
    for (const tool of tools) {
      const content = getPerformanceAnswer(tool, locale);
      const html = renderToStaticMarkup(<CalculatorAnswerSection id={tool} locale={locale} content={content} />);
      expect(html).toContain(answerSectionMessages[locale].answer);
      expect(html).toContain(answerSectionMessages[locale].method);
      expect(html).toContain(answerSectionMessages[locale].mistakes);
      expect(content.example.inputs.length).toBeGreaterThan(2);
      expect(html).not.toContain("undefined");
      expect(html).not.toContain("NaN");
    }
  });
  it("makes model limitations explicit in Dutch", () => {
    expect(getPerformanceAnswer("ftp-wkg", "nl").limits).toContain("schatting");
    expect(getPerformanceAnswer("fuel-hydration", "nl").limits).toContain("geen zweetmeting");
    expect(getPerformanceAnswer("power-speed", "nl").answer).toContain("Vermogen alleen");
  });
});
