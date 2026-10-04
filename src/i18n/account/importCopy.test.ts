import { describe, expect, it } from "vitest";
import { bikeProfileMessages } from "./bikeProfile";
import { getProfileScoreCopy } from "./profileScore";
import { getFeedbackCopy } from "@/components/feedback/feedback-copy";

function copyValues(value: unknown): string[] {
  if (typeof value === "string") return [value];
  if (value && typeof value === "object") return Object.values(value).flatMap(copyValues);
  return [];
}

describe("legacy import copy", () => {
  it.each(["en", "nl"] as const)("keeps a generic legacy bike label in %s", (locale) => {
    expect(bikeProfileMessages[locale].importSources.strava).toBe(locale === "nl" ? "Geïmporteerd" : "Imported");
    expect(copyValues([
      bikeProfileMessages[locale], getProfileScoreCopy(locale), getFeedbackCopy(locale),
    ]).join(" ")).not.toMatch(/strava/i);
  });
});
