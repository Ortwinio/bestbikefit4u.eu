import { describe, expect, it } from "vitest";
import { HANDOFF_FIELD_UNITS } from "@/lib/handoff/store";
import { handoffMessages } from "./handoff";

function keys(value: object, prefix = ""): string[] {
  return Object.entries(value).flatMap(([key, child]) => {
    const path = `${prefix}${key}`;
    return typeof child === "object" && child !== null ? keys(child, `${path}.`) : [path];
  }).sort();
}

describe("public handoff copy", () => {
  it("keeps every nested key and field label available in Dutch and English", () => {
    expect(keys(handoffMessages.nl)).toEqual(keys(handoffMessages.en));
    for (const copy of Object.values(handoffMessages)) {
      expect(Object.keys(copy.fields).sort()).toEqual(Object.keys(HANDOFF_FIELD_UNITS).sort());
      expect(Object.keys(copy.calculators)).toHaveLength(11);
      expect(copy.count).toContain("{count}");
      expect(copy.prefill).toContain("{fields}");
    }
  });
  it("preserves the RP1 saddle board copy without hardcoded example data", () => {
    const copy = handoffMessages.nl;
    expect(copy.title).toBe("Maak dit advies persoonlijker");
    expect(copy.cta).toBe("Bewaar mijn gegevens · gratis account");
    expect(copy.calculators["saddle-height"].headline).toBe(
      "Vergelijk met de zadelhoogte van je eigen fiets en zie precies hoeveel millimeter je verstelt.",
    );
    expect(copy.calculators["saddle-height"].betterBody).toBe(
      "Met je flexibiliteit en cranklengte rekenen we met jouw waarden, niet met gemiddelden.",
    );
    expect(copy.calculators["saddle-height"].nextBody).toBe("Zadelbreedte en bike fit gebruiken dezelfde gegevens.");
    expect(copy.prefillInseam).toBe("Je binnenbeen van de vorige calculator is al ingevuld.");
    expect(JSON.stringify(copy)).not.toMatch(/Sanne|Canyon|174 cm|81 cm/);
  });
});
