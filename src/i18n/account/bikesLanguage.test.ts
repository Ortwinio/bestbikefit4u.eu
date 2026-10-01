import { describe, expect, it } from "vitest";
import { getDashboardMessages } from "@/i18n/dashboardMessages";
import { getBikeLanguageMessages, getBikesLanguageCopy } from "./bikesLanguage";

describe("Dutch bike copy", () => {
  it("translates gearing labels used by the form and its accessible number controls", () => {
    expect(getBikesLanguageCopy("nl")).toEqual({
      gearing: "Versnellingen",
      drivetrain: "Aandrijving",
      frontChainring: "Buitenste kettingblad",
      innerChainring: "Binnenste kettingblad",
      wheelCircumference: "Wielomtrek",
      cassetteTeeth: "Tanden per cassettetandwiel",
      groupset: "Schakelgroep",
      rearDerailleurMaxCog: "Grootste tandwiel voor achterderailleur",
    });
  });

  it("uses fietser and fietspas across chooser, import, detail, feedback and validation", () => {
    const original = getDashboardMessages("nl");
    const copy = getBikeLanguageMessages("nl", original);
    expect(copy.bikeForm.createChooser.passport.description)
      .toBe("Plak de fietspas-ID van een andere fietser en maak je eigen bewerkbare kopie.");
    expect(copy.bikeForm.passportImport.copyCard.shareableId)
      .toBe("De andere fietser hoeft alleen de fietspas-ID te delen.");
    expect(copy.bikes.identity.passportDescription).toContain("Deel deze ID met een andere fietser.");
    expect(copy.bikes.identity.passportCopied).toBe("Fietspas-ID gekopieerd.");
    expect(copy.bikeForm.passportImport.errors.invalidPassport).toContain("Gebruik een geldige fietspas-ID.");
    expect(copy.bikeTypes.road.description).toBe("Racestuur, geometrie voor lange ritten of wedstrijden");
    expect(JSON.stringify(copy.bikeForm.passportImport)).not.toMatch(/rider/i);
    expect(original.bikeForm.passportImport.copyCard.shareableId).toContain("rider");
  });

  it("preserves all existing English messages and the existing English gearing labels", () => {
    const english = getDashboardMessages("en");
    expect(getBikeLanguageMessages("en", english)).toBe(english);
    expect(getBikesLanguageCopy("en")).toEqual({
      gearing: "Gearing",
      drivetrain: "Drivetrain",
      frontChainring: "Front chainring",
      innerChainring: "Inner chainring",
      wheelCircumference: "Wheel circumference",
      cassetteTeeth: "Cassette teeth",
      groupset: "Groupset",
      rearDerailleurMaxCog: "Rear derailleur max cog",
    });
  });
});
