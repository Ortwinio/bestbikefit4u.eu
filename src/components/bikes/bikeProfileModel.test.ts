import { describe, expect, it } from "vitest";
import { bikeProfileMessages } from "@/i18n/account/bikeProfile";
import { BIKE_MEASURE_POINTS } from "../../../shared/bikeProfileFields";
import { actualBikeAdvice, bikeProfileRows, displayBikeProfileValue, parseBikeProfileDraft } from "./bikeProfileModel";

describe("bike profile factual rows", () => {
  it("has seven scored groups and translated canonical fields/measurement points", () => {
    expect(new Set(bikeProfileRows.map(row => row.group)).size).toBe(7);
    for (const row of bikeProfileRows) for (const field of row.fields) {
      expect(Object.hasOwn(bikeProfileMessages.nl.fields, field)).toBe(true);
    }
    for (const locale of ["nl", "en"] as const) for (const point of Object.values(BIKE_MEASURE_POINTS)) {
      expect(Object.hasOwn(bikeProfileMessages[locale].points, point)).toBe(true);
    }
  });
  it("keeps bilingual key parity", () => {
    function keys(value: object): string[] {
      return Object.entries(value).flatMap(([key, item]) => item && typeof item === "object"
        ? keys(item).map((child) => `${key}.${child}`) : [key]).sort();
    }
    expect(keys(bikeProfileMessages.nl)).toEqual(keys(bikeProfileMessages.en));
  });
  it("never invents measurements, advice or default values", () => {
    expect(parseBikeProfileDraft("currentSetup.saddleHeightMm", "")).toBeNull();
    expect(parseBikeProfileDraft("currentSetup.saddleHeightMm", "0")).toBeNull();
    expect(parseBikeProfileDraft("currentSetup.spacersMm", "0")).toBe(0);
    expect(parseBikeProfileDraft("currentSetup.handlebarDropMm", "-20,5")).toBe(-20.5);
    expect(actualBikeAdvice(undefined, "currentSetup.saddleHeightMm")).toBeUndefined();
    expect(actualBikeAdvice({ saddleHeightMm: 725 }, "currentSetup.saddleHeightMm")).toBe(725);
    expect(actualBikeAdvice({ saddleHeightMm: 725 }, "maxSeatpostMm")).toBeUndefined();
    expect(displayBikeProfileValue(undefined, "mm", "nl", bikeProfileMessages.nl)).toBe("—");
    expect(displayBikeProfileValue(725.5, "mm", "nl", bikeProfileMessages.nl)).toBe("725,5 mm");
    expect(displayBikeProfileValue("road", "none", "nl", bikeProfileMessages.nl)).toBe("Racefiets");
  });
});
