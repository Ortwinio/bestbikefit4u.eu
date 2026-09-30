/** PDF-only presentation of stored recommendation notes; never changes engine output or stored data. */
const DUTCH_ENGINE_NOTES: Readonly<Record<string, string>> = {
  "Your position is quite aggressive. Consider building up to this gradually.":
    "Je houding is vrij diep en sportief. Bouw het rijden in deze houding geleidelijk op.",
  "Your position prioritizes comfort with minimal bar drop.":
    "Je houding geeft voorrang aan comfort, met weinig hoogteverschil tussen zadel en stuur.",
  "Reach calculations are refined using your torso and arm measurements.":
    "De berekende stuurafstand is verfijnd met je romp- en armlengte.",
  "Adding torso and arm measurements would improve reach accuracy.":
    "Met je romp- en armlengte kan de stuurafstand nauwkeuriger worden berekend.",
};

const DUTCH_BIAS_SUMMARIES: Readonly<Record<string, string>> = {
  "The base bike profile does not add a role bias.": "Het basisprofiel van de fiets voegt geen gebruiksvoorkeur toe.",
  "Mountain-oriented usage usually benefits from a more stable, balanced cockpit.":
    "Berggericht gebruik heeft meestal baat bij een stabielere, evenwichtige stuurpositie.",
  "Climbing-focused usage tends to favor a performance-leaning fit.":
    "Klimgericht gebruik vraagt doorgaans om een meer prestatiegerichte afstelling.",
  "Endurance usage usually leans toward comfort and longer-session stability.":
    "Duurgericht gebruik vraagt meestal om comfort en stabiliteit tijdens langere ritten.",
  "Performance-oriented usage usually leans aggressive and race-biased.":
    "Prestatiegericht gebruik vraagt meestal om een diepe, wedstrijdgerichte houding.",
  "Aero-oriented usage usually leans toward a lower, more aggressive position.":
    "Aerodynamisch gebruik vraagt meestal om een lagere, diepere houding.",
  "Indoor setups usually favor a controlled, repeatable position over aggressive reach.":
    "Binnen fietsen vraagt meestal om een beheerste, herhaalbare houding in plaats van een verre stuurafstand.",
  "Technical riding usually benefits from a stable and adaptable fit bias.":
    "Technisch rijden heeft meestal baat bij een stabiele, aanpasbare afstelling.",
  "Comfort-oriented usage usually benefits from a relaxed, forgiving fit bias.":
    "Comfortgericht gebruik heeft meestal baat bij een ontspannen, vergevingsgezinde afstelling.",
  "Custom bike profiles stay neutral unless they carry explicit usage fields.":
    "Aangepaste fietsprofielen blijven neutraal tenzij expliciete gebruiksgegevens zijn ingevuld.",
  "Road-bike usage usually leans toward a performance-oriented position.":
    "Gebruik van een racefiets vraagt meestal om een prestatiegerichte houding.",
  "Gravel-bike usage usually leans toward a balanced and adaptable fit.":
    "Gebruik van een gravelbike vraagt meestal om een evenwichtige, aanpasbare afstelling.",
  "Mountain-bike usage usually leans toward a stable, control-first fit.":
    "Gebruik van een mountainbike vraagt meestal om een stabiele afstelling met nadruk op controle.",
  "Hybrid-bike usage usually leans toward comfort and everyday control.":
    "Gebruik van een hybride fiets vraagt meestal om comfort en dagelijkse controle.",
  "City-bike usage usually leans toward an upright, comfort-first position.":
    "Gebruik van een stadsfiets vraagt meestal om een rechte houding met nadruk op comfort.",
  "TT and triathlon bikes usually lean aggressive and aero-focused.":
    "Tijdrit- en triatlonfietsen vragen meestal om een diepe, aerodynamische houding.",
  "Cyclocross bikes usually lean toward a stable, all-round race fit.":
    "Cyclocrossfietsen vragen meestal om een stabiele, veelzijdige wedstrijdafstelling.",
  "Touring bikes usually lean toward comfort and long-session stability.":
    "Toerfietsen vragen meestal om comfort en stabiliteit tijdens lange ritten.",
};

export const PDF_ENGINE_NOTE_COPY = {
  nl: {
    unknown:
      "Voor een opgeslagen advies is nog geen vertaling beschikbaar. Bekijk de oorspronkelijke tekst in je dashboard.",
    advisory:
      "Het gebruiksprofiel van je fiets geeft alleen aanvullende context. " +
      "Je lichaamsmaten en expliciete fitgegevens blijven leidend voor de berekening.",
  },
  en: {
    unknown: "A stored recommendation has no translation yet. Read the original text in your dashboard.",
    advisory:
      "Your bike usage profile provides advisory context only. " +
      "The calculation still prioritizes rider measurements and explicit fit inputs.",
  },
} as const;

const ADVISORY_SUFFIX =
  "Treat this as advisory context only; the solver still prioritizes rider measurements and explicit fit inputs.";

/**
 * Normal source: recommendations/actions.generateFromData -> generateFitNotes + bikeRoleBias.
 * Recommendation storage and ReportV2Payload carry string[] only, with no author/provenance flag.
 * Unknown Dutch notes therefore use an explicit fallback, never an assumed user-authored exemption.
 */
export function localizePdfEngineNotes(notes: readonly string[], locale: string): string[] {
  return notes
    .filter((note) => note.trim())
    .map((note) => {
      if (locale !== "nl") return note;
      const normalized = note.trim();
      if (DUTCH_ENGINE_NOTES[normalized]) return DUTCH_ENGINE_NOTES[normalized];
      const saddle = normalized.match(
        /^Saddle height of (\d+(?:\.\d+)?)mm is optimized for your (\d+(?:\.\d+)?)mm inseam\.$/,
      );
      if (saddle) {
        const height = saddle[1].replace(".", ",");
        const inseam = saddle[2].replace(".", ",");
        return `De zadelhoogte van ${height} mm is afgestemd op je binnenbeenlengte van ${inseam} mm.`;
      }
      if (normalized.endsWith(ADVISORY_SUFFIX)) {
        const summary = localizeAdvisorySummary(normalized.slice(0, -ADVISORY_SUFFIX.length).trim());
        return summary ? `${summary} ${PDF_ENGINE_NOTE_COPY.nl.advisory}` : PDF_ENGINE_NOTE_COPY.nl.unknown;
      }
      return PDF_ENGINE_NOTE_COPY.nl.unknown;
    });
}

const DUTCH_STYLES: Readonly<Record<string, string>> = {
  racing: "wedstrijdgericht",
  sportive: "sportief",
  touring: "toerend",
  fitness: "fitnessgericht",
  commuting: "woon-werkverkeer",
  recreational: "recreatief",
};
const DUTCH_GOALS: Readonly<Record<string, string>> = {
  balanced: "balans",
  performance: "prestaties",
  comfort: "comfort",
  aerodynamics: "aerodynamica",
};

function localizeAdvisorySummary(summary: string): string | null {
  // Match complete known sentences from the end, so a bike name containing punctuation stays intact.
  let rest = summary;
  const translated: string[] = [];
  for (let count = 0; count < 2; count++) {
    const match = Object.keys(DUTCH_BIAS_SUMMARIES).find((sentence) => rest.endsWith(sentence));
    if (!match) break;
    translated.unshift(DUTCH_BIAS_SUMMARIES[match]);
    rest = rest.slice(0, -match.length).trimEnd();
  }
  const label = (value: string) => (value === "Imported bike" ? "Geïmporteerde fiets" : value);
  if (translated.length && rest.endsWith(":")) {
    return `${label(rest.slice(0, -1))}: ${translated.join(" ")}`;
  }
  const neutral = summary.match(/^(.*) does not expose a clear usage bias\.$/);
  if (neutral) return `${label(neutral[1])} geeft geen duidelijke gebruiksvoorkeur aan.`;
  const direct = summary.match(/^(.*) suggests (.+)\.$/);
  if (!direct) return null;
  const parts = direct[2].split(" and ");
  const localized: string[] = [];
  for (const part of parts) {
    const style = part.match(/^riding style (.+)$/);
    const goal = part.match(/^goal (.+)$/);
    if (style && DUTCH_STYLES[style[1]]) localized.push(`rijstijl ${DUTCH_STYLES[style[1]]}`);
    else if (goal && DUTCH_GOALS[goal[1]]) localized.push(`doel ${DUTCH_GOALS[goal[1]]}`);
    else return null;
  }
  return `${label(direct[1])} wijst op ${localized.join(" en ")}.`;
}
