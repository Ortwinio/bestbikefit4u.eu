import { localizePdfEngineNotes, PDF_ENGINE_NOTE_COPY } from "@/lib/reports/pdfEngineNotes";
import { getReportV2Copy } from "@/lib/reports/reportV2Copy";
import type { Locale } from "@/i18n/config";

export const fitAuditCopy = {
  nl: {
    error: "Er ging iets mis. Probeer het opnieuw.",
    scaleLegend: "Kies een waarde op de schaal",
    positionAlt: "Illustratie van je fietshouding",
    unavailable: "Niet bekend",
    unnamedBike: "Fiets zonder naam",
    aerodynamics: "Aerodynamica",
    casual: "Recreatief / conditie",
    coreStability: "Rompstabiliteit",
    recreational: "Ontspannen / recreatief",
  },
  en: {
    error: "Something went wrong. Please try again.",
    scaleLegend: "Select a scale value",
    positionAlt: "Riding position illustration",
    unavailable: "n/a",
    unnamedBike: "Unnamed bike",
    aerodynamics: "Aerodynamics",
    casual: "Casual / fitness",
    coreStability: "Core stability",
    recreational: "Casual / recreational",
  },
};

export const fitExperienceDescriptionsNl: Record<string, string> = {
  beginner: "Je begint met fietsen of pakt het na lange tijd weer op.",
  intermediate: "Je fietst regelmatig en voelt je op de meeste terreinen op je gemak.",
  advanced: "Je rijdt wedstrijden of traint serieus en wilt een prestatiegerichte houding.",
};

export function getFitReportCopy(locale: Locale) {
  const copy = getReportV2Copy(locale);
  if (locale !== "nl") return copy;
  return {
    ...copy,
    sections: { ...copy.sections, coreStability: fitAuditCopy.nl.coreStability },
    scoreMeta: {
      ...copy.scoreMeta,
      coreStability: { ...copy.scoreMeta.coreStability, title: fitAuditCopy.nl.coreStability },
    },
  };
}

const dutchValues: Record<string, string> = {
  road: "Racefiets", gravel: "Gravelbike", mountain: "Mountainbike",
  hybrid: "Hybride fiets", tt_triathlon: "Tijdrit / triatlon", cyclocross: "Cyclocross",
  touring: "Toeren", city: "Stadsfiets", recreational: "Recreatief", fitness: "Conditie",
  sportive: "Sportief", racing: "Wedstrijd", commuting: "Woon-werk",
  comfort: "Comfort", balanced: "Balans", performance: "Prestatie", aerodynamics: "Aerodynamica",
  speed: "Snelheid", grip: "Grip", efficiency: "Efficiëntie",
  smooth_asphalt: "Glad asfalt", average_asphalt: "Gemiddeld asfalt", rough_asphalt: "Ruw asfalt",
  hardpack_gravel: "Harde gravel", loose_gravel: "Losse gravel", trail: "Bospad",
  "n/a": "Niet bekend", unknown: "Niet bekend",
  very_limited: "Zeer beperkt", limited: "Beperkt", average: "Gemiddeld", good: "Goed", excellent: "Uitstekend",
};

export function localizeFitValue(value: string, locale: string): string {
  if (locale !== "nl") return value;
  return dutchValues[value.toLowerCase().replaceAll(" ", "_")] ?? value;
}

export function localizeFitNotes(notes: readonly string[], locale: string): string[] {
  return notes.map((note) => {
    if (locale !== "nl") return note;
    const translated = localizePdfEngineNotes([note], locale)[0];
    return translated && translated !== PDF_ENGINE_NOTE_COPY.nl.unknown ? translated : note;
  });
}

export const legacyFitQuestions = {
  knee_pain_timing: {
    questionText: "Wanneer doet je knie pijn?",
    options: { start: "Aan het begin van je rit", during: "Tijdens langere ritten", climbing: "Tijdens het klimmen", always: "De hele rit" },
  },
  pain_severity: {
    questionText: "Hoeveel last heb je?",
    minLabel: "Licht – een beetje ongemak",
    maxLabel: "Ernstig – beperkt je fietsen",
  },
  position_priority: {
    questionText: "Wat vind je het belangrijkst aan je fietshouding?",
    options: { comfort: "Comfort – lang fietsen zonder spanning", balanced: "Balans – comfort en efficiëntie", performance: "Prestatie – wat minder comfort voor meer snelheid" },
  },
};
