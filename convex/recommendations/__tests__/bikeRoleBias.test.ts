import { describe, expect, it } from "vitest";
import { buildBikeRoleBias } from "../bikeRoleBias";

describe("bikeRoleBias", () => {
  it("uses bike usage context as advisory guidance", () => {
    const bias = buildBikeRoleBias({
      bikeName: "Race bike",
      bikeType: "road",
      discipline: "road",
    });

    expect(bias.source).toBe("bike");
    expect(bias.confidence).toBe("high");
    expect(bias.suggestedRidingStyle).toBe("racing");
    expect(bias.suggestedPrimaryGoal).toBe("performance");
    expect(bias.summary).toContain("Race bike");
    expect(bias.advisoryNotes[0]).toContain("advisory context only");
  });

  it("falls back to bike profile role hints when bike usage is incomplete", () => {
    const bias = buildBikeRoleBias({
      bikeName: "Indoor trainer",
      profileName: "Performance profile",
      profileType: "performance",
    });

    expect(bias.source).toBe("bike_profile");
    expect(bias.suggestedRidingStyle).toBe("racing");
    expect(bias.suggestedPrimaryGoal).toBe("performance");
    expect(bias.summary).toContain("Indoor trainer");
    expect(bias.summary).toContain("Performance-oriented usage");
  });
});
