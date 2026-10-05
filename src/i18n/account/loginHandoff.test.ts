import { describe, expect, it } from "vitest";
import { HANDOFF_FIELD_UNITS, type HandoffField } from "@/lib/handoff/store";
import { handoffMessages } from "@/i18n/calculators/handoff";
import { loginHandoffCopy } from "./loginHandoff";

describe("login handoff field labels", () => {
  it.each(["nl", "en"] as const)("names every supported field in %s", locale => {
    for (const field of Object.keys(HANDOFF_FIELD_UNITS) as HandoffField[]) {
      expect(loginHandoffCopy[locale].fields[field]).toBeTruthy();
    }
    expect(loginHandoffCopy[locale].fields.powerWatts).toBe(handoffMessages[locale].fields.powerWatts);
    expect(loginHandoffCopy[locale].fields.hipCircumferenceCm).toBe(handoffMessages[locale].fields.hipCircumferenceCm);
  });

  it("keeps existing labels while including Dutch new labels", () => {
    expect(loginHandoffCopy.en.fields.heightCm).toBe("Height");
    expect(loginHandoffCopy.nl.fields.heightCm).toBe("Lichaamslengte");
    expect(loginHandoffCopy.nl.fields.powerWatts).toBe("Vermogen");
  });
});
