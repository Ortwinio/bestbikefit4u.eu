import { buildBikeRoleBias } from "../../../convex/recommendations/bikeRoleBias";
import { describe, expect, it } from "vitest";
import { localizePdfEngineNotes, PDF_ENGINE_NOTE_COPY } from "./pdfEngineNotes";

describe("PDF engine note localization", () => {
  it("translates every current generated note template and preserves source numeric measurements", () => {
    const notes = [
      "Saddle height of 754.5mm is optimized for your 850mm inseam.",
      "Your position is quite aggressive. Consider building up to this gradually.",
      "Your position prioritizes comfort with minimal bar drop.",
      "Reach calculations are refined using your torso and arm measurements.",
      "Adding torso and arm measurements would improve reach accuracy.",
    ];
    const translated = localizePdfEngineNotes(notes, "nl");
    expect(translated).toHaveLength(5);
    expect(translated[0]).toContain("754,5 mm");
    expect(translated[0]).toContain("850 mm");
    expect(translated[1]).toContain("geleidelijk");
    expect(translated[2]).toContain("comfort");
    expect(translated[3]).toContain("verfijnd");
    expect(translated[4]).toContain("nauwkeuriger");
    expect(translated).not.toContain(PDF_ENGINE_NOTE_COPY.nl.unknown);
    expect(localizePdfEngineNotes(notes, "en")).toEqual(notes);
  });

  it("localizes machine advisory context without leaking its freeform English summary", () => {
    const note =
      "My Bike: Performance-oriented usage usually leans aggressive and race-biased. " +
      "Treat this as advisory context only; the solver still prioritizes rider measurements and explicit fit inputs.";
    expect(localizePdfEngineNotes([note], "nl")[0]).toContain("My Bike: Prestatiegericht gebruik");
    expect(localizePdfEngineNotes([note], "nl")[0]).toContain(PDF_ENGINE_NOTE_COPY.nl.advisory);
    expect(localizePdfEngineNotes([note], "en")).toEqual([note]);
  });

  it("uses an explicit fallback for unknown provenance without leaking text or mutating stored notes", () => {
    const notes = Object.freeze(["Unknown future engine note <script>bad()</script>", "  "]);
    expect(localizePdfEngineNotes(notes, "nl")).toEqual([PDF_ENGINE_NOTE_COPY.nl.unknown]);
    expect(localizePdfEngineNotes(notes, "en")).toEqual([notes[0]]);
    expect(notes).toHaveLength(2);
  });
});

describe("real bike-role advisory templates", () => {
  const profiles = [
    "base",
    "mountain",
    "climbing",
    "endurance",
    "performance",
    "aero",
    "indoor",
    "technical",
    "comfort",
    "custom",
  ];
  const bikes = ["road", "gravel", "mountain", "hybrid", "city", "tt_triathlon", "cyclocross", "touring"];
  for (const profileType of profiles) {
    it(`preserves the ${profileType} profile meaning`, () => {
      const source = buildBikeRoleBias({ bikeName: "My: Bike", profileType });
      const translated = localizePdfEngineNotes(source.advisoryNotes, "nl")[0];
      expect(translated).toMatch(/^My: Bike: /);
      expect(translated).not.toContain(PDF_ENGINE_NOTE_COPY.nl.unknown);
      expect(translated).not.toContain(source.summary.slice("My: Bike: ".length));
      expect(translated).toContain(PDF_ENGINE_NOTE_COPY.nl.advisory);
    });
  }
  for (const bikeType of bikes) {
    it(`preserves ${bikeType} use and a mixed profile`, () => {
      const source = buildBikeRoleBias({ bikeName: "Bike", bikeType });
      const mixed = buildBikeRoleBias({ bikeName: "Bike", bikeType, profileType: "endurance" });
      const single = localizePdfEngineNotes(source.advisoryNotes, "nl")[0];
      const combined = localizePdfEngineNotes(mixed.advisoryNotes, "nl")[0];
      expect(single).toMatch(/^Bike: /);
      expect(single).not.toContain(PDF_ENGINE_NOTE_COPY.nl.unknown);
      expect(combined).toContain("Duurgericht gebruik");
      expect(combined).toContain(single.slice("Bike: ".length));
    });
  }
  it("translates generated style and goal enums while preserving only the bike label verbatim", () => {
    const source = buildBikeRoleBias({ bikeName: "My <Bike>", ridingStyle: "racing", primaryGoal: "performance" });
    expect(localizePdfEngineNotes(source.advisoryNotes, "nl")[0]).toContain(
      "My <Bike> wijst op rijstijl wedstrijdgericht en doel prestaties.",
    );
    expect(localizePdfEngineNotes(buildBikeRoleBias({}).advisoryNotes, "nl")[0]).toContain(
      "Geïmporteerde fiets geeft geen duidelijke gebruiksvoorkeur aan.",
    );
    const unknown = buildBikeRoleBias({ ridingStyle: "unknown future enum" });
    expect(localizePdfEngineNotes(unknown.advisoryNotes, "nl")).toEqual([PDF_ENGINE_NOTE_COPY.nl.unknown]);
  });
});
