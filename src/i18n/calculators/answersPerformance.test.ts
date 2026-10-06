import { describe, expect, it } from "vitest";
import { performanceAnswerMessages } from "./answersPerformance";

describe("public performance explanations", () => {
  it.each(["nl", "en"] as const)("describes shipped fuel inputs and hourly results in %s", (locale) => {
    const copy = performanceAnswerMessages[locale]["fuel-hydration"];
    expect(copy.method).toContain("20 °C");
    expect(copy.method).toMatch(/gram/);
    expect(copy.method).toMatch(/millilit/);
    expect(copy.method).not.toMatch(/bidon|bottle|natrium|sodium/);
    expect(copy.answer).not.toMatch(/zweetprofiel|sweat profile/);
    expect(copy.limits).toMatch(/geen zweetmeting|not a sweat measurement/);
  });

  it.each(["nl", "en"] as const)("describes the fixed road-bike climb estimate in %s", (locale) => {
    const copy = performanceAnswerMessages[locale]["climb-planner"];
    expect(copy.answer).toMatch(/percentage/);
    expect(copy.answer).not.toMatch(/fietstype|bike type|geeft een richtvermogen|provides target power/);
    expect(copy.method).toMatch(/8[,.]5 kg/);
  });

  it("retains the implemented inverse-power mode and FTP method distinctions", () => {
    expect(performanceAnswerMessages.en["power-speed"].answer).toContain("power required for a chosen speed");
    expect(performanceAnswerMessages.en["ftp-wkg"].method).toContain("known FTP");
    expect(performanceAnswerMessages.en["ftp-wkg"].limits).toContain("not interchangeable measurements");
  });
});
