import { describe, expect, it } from "vitest";
import { localizeAccountError } from "./clientErrors";

describe("account error language", () => {
  it.each([
    ["Please sign in to continue.", "Log in om verder te gaan."],
    ["You are not allowed to perform this action.", "Je hebt geen toegang tot deze actie."],
    ["Too many requests. Please wait and try again.", "Te veel verzoeken. Wacht even en probeer het opnieuw."],
    ["Please check your input and try again.", "Controleer je invoer en probeer het opnieuw."],
  ])("localizes %s and preserves English", (english, dutch) => {
    expect(localizeAccountError(english, "nl")).toBe(dutch);
    expect(localizeAccountError(english, "en")).toBe(english);
  });
  it("preserves an already localized fallback", () => {
    expect(localizeAccountError("Opslaan mislukt.", "nl")).toBe("Opslaan mislukt.");
  });
});
