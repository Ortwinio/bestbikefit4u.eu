import { describe, expect, it } from "vitest";
import { estimateFlexibility, estimateFtp } from "./index";
import { scoreAdviceReliability } from "../profileScore";
import { riderEstimateMessages } from "../../src/i18n/account/riderEstimates";

const now = Date.UTC(2026, 9, 3);

describe("rider estimate integration contract", () => {
  it("does not expose unsupported numbers or a default flexibility category", () => {
    const input = Object.freeze({ sex: "female" as const, birthDate: "1990-04-10", weightKg: 65 });
    for (const result of [estimateFtp(input, now), estimateFlexibility(input, now)]) {
      expect(result.status).toBe("unavailable");
      expect(result).not.toHaveProperty("value");
      expect(result).not.toHaveProperty("quality");
    }
  });

  it.each(["ftpWatts", "flexibilityScore"])("keeps derived %s evidence at quality 0.3", field => {
    const value = field === "ftpWatts" ? 200 : "average";
    const score = scoreAdviceReliability({ profile: { [field]: value }, riderFields: [field],
      bikeFields: [], observations: [{ field, value, kind: "derived", recordedAt: now }] }, now);
    expect(score.items[0].quality).toBe(0.3);
    expect(score.reliability).toBe(30);
  });

  it("reserves explicit bilingual estimate labels without displaying placeholders", () => {
    expect(riderEstimateMessages.nl.ftpFromSexAgeWeight).toBe("Geschat uit je geslacht, leeftijd en gewicht");
    expect(riderEstimateMessages.nl.flexibilityFromAgeSex).toBe("Geschat uit je leeftijd en geslacht");
    expect(Object.keys(riderEstimateMessages.en)).toEqual(Object.keys(riderEstimateMessages.nl));
    expect(JSON.stringify(riderEstimateMessages)).not.toContain("PLACEHOLDER");
  });
});
