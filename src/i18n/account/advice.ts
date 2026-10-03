import type { Locale } from "@/i18n/config";
import { getProfileScoreCopy } from "./profileScore";
import { getProfileProvenanceCopy } from "./profileProvenance";

const nl = {
  savedDate: "Opgeslagen op", unknownUnit: "Eenheid onbekend",
  filter: "Toon adviezen voor", all: "Alles", rider: "Rijder", unknownBike: "Fiets", item: "Advies", target: "Doel", range: "Bandbreedte", current: "Nu", difference: "Verschil", confidence: "Zekerheid", status: "Status", date: "Berekend op", unknownDate: "Datum onbekend", open: "Bekijk advies",
  empty: "Nog geen adviezen voor deze groep en selectie.", unknownValue: "Onbekend", unknownAdvice: "Calculatoradvies", unknownField: "Een profielgegeven",
  count: (count: number) => `${count} ${count === 1 ? "advies" : "adviezen"}`,
  statuses: { new: "Nieuw", stale: "Verouderd", needs_calculation: "Nog berekenen", unknown: "Actualiteit onbekend", waiting_feedback: "Wacht op ritfeedback", performed: "Uitgevoerd" },
  reliability: { engine_confidence: "Zekerheid van de berekening, niet je profielscore.", unknown: "De zekerheid is niet vastgelegd.", saved_inputs_only: "Alleen invoer bewaard; nog geen berekend advies." },
  freshnessUnknown: "De gebruikte invoer is niet te verifiëren; dit advies is niet bevestigd actueel.",
  reasons: { value_changed: "Een gebruikte waarde is gewijzigd.", observation_changed: "De herkomst van gebruikte invoer is gewijzigd.", missing_input: "Gebruikte invoer ontbreekt nu.", legacy_provenance: "De oorspronkelijke invoerherkomst ontbreekt." },
  unknownReason: "De reden is niet beschikbaar.",
  improvements: "Wat je nog kunt verbeteren", noImprovements: "Geen aanvullende profielacties beschikbaar.", upTo: "tot", points: "punten profielbetrouwbaarheid", gainNote: "Mogelijke profielwinst, geen gegarandeerde verbetering van dit advies.",
  groups: { seating: "Zitpositie", contact: "Contactpunten", cockpit: "Cockpit en reach", drivetrain: "Aandrijving", tires: "Banden", performance: "Prestatie en voeding", frame: "Framemaat en aankoop" },
  fields: { saddleHeightMm: "Zadelhoogte", saddleSetbackMm: "Zadelterugstand", handlebarDropMm: "Zadel–stuur-drop", handlebarReachMm: "Zadel–stuur-reach", stemLengthMm: "Stuurpenlengte", handlebarWidthMm: "Stuurbreedte", crankLengthMm: "Cranklengte", recommendedStackMm: "Aanbevolen stack", recommendedReachMm: "Aanbevolen reach", saddleWidthMm: "Zadelbreedte", gearRangePercent: "Versnellingsbereik", pressureFrontBar: "Bandenspanning voor", pressureRearBar: "Bandenspanning achter", speed: "Snelheid", power: "Vermogen", ftp: "FTP", wattsPerKg: "Vermogen per kilogram", climbPower: "Klimvermogen", fluid: "Vocht per uur", carbohydrate: "Koolhydraten per uur", crankLength: "Cranklengte", saddleHeight: "Zadelhoogte", frameSize: "Framemaat", "saddle-height": "Zadelhoogte", "bike-fit": "Bikefit", "frame-size": "Framemaat", "crank-length": "Cranklengte", "power-speed": "Vermogen en snelheid", "climb-planner": "Klimplanner", "ftp-wkg": "FTP en W/kg", "fuel-hydration": "Voeding en hydratatie" },
  units: { mm: "mm", cm: "cm", m: "m", kg: "kg", W: "W", "%": "%", bar: "bar", psi: "psi", "km/h": "km/u", "W/kg": "W/kg", "ml/h": "ml/u", "g/h": "g/u", "L/h": "l/u", "l/h": "l/u" },
};
type Copy = { [Key in keyof typeof nl]: typeof nl[Key] extends (...args: never[]) => unknown ? typeof nl[Key] : typeof nl[Key] extends string ? string : { [Sub in keyof typeof nl[Key]]: string } };
const en: Copy = {
  savedDate: "Saved on", unknownUnit: "Unknown unit",
  filter: "Show advice for", all: "All", rider: "Rider", unknownBike: "Bike", item: "Advice", target: "Target", range: "Range", current: "Current", difference: "Difference", confidence: "Confidence", status: "Status", date: "Calculated on", unknownDate: "Date unknown", open: "View advice",
  empty: "No advice yet for this group and selection.", unknownValue: "Unknown", unknownAdvice: "Calculator advice", unknownField: "A profile detail",
  count: (count: number) => `${count} ${count === 1 ? "result" : "results"}`,
  statuses: { new: "New", stale: "Stale", needs_calculation: "Needs calculation", unknown: "Freshness unknown", waiting_feedback: "Waiting for ride feedback", performed: "Performed" },
  reliability: { engine_confidence: "Confidence in this calculation, not your profile score.", unknown: "Confidence was not recorded.", saved_inputs_only: "Only inputs saved; no calculated advice yet." },
  freshnessUnknown: "The inputs used cannot be verified; this advice is not confirmed current.",
  reasons: { value_changed: "An input value has changed.", observation_changed: "The provenance of an input has changed.", missing_input: "An input used is now missing.", legacy_provenance: "The original input provenance is missing." },
  unknownReason: "The reason is unavailable.",
  improvements: "What you can improve", noImprovements: "No additional profile actions available.", upTo: "up to", points: "profile reliability points", gainNote: "Potential profile gain, not a guaranteed improvement to this advice.",
  groups: { seating: "Seating position", contact: "Contact points", cockpit: "Cockpit and reach", drivetrain: "Drivetrain", tires: "Tires", performance: "Performance and nutrition", frame: "Frame size and buying" },
  fields: { saddleHeightMm: "Saddle height", saddleSetbackMm: "Saddle setback", handlebarDropMm: "Saddle–bar drop", handlebarReachMm: "Saddle–bar reach", stemLengthMm: "Stem length", handlebarWidthMm: "Handlebar width", crankLengthMm: "Crank length", recommendedStackMm: "Recommended stack", recommendedReachMm: "Recommended reach", saddleWidthMm: "Saddle width", gearRangePercent: "Gear range", pressureFrontBar: "Front tire pressure", pressureRearBar: "Rear tire pressure", speed: "Speed", power: "Power", ftp: "FTP", wattsPerKg: "Power per kilogram", climbPower: "Climbing power", fluid: "Fluid per hour", carbohydrate: "Carbohydrate per hour", crankLength: "Crank length", saddleHeight: "Saddle height", frameSize: "Frame size", "saddle-height": "Saddle height", "bike-fit": "Bike fit", "frame-size": "Frame size", "crank-length": "Crank length", "power-speed": "Power and speed", "climb-planner": "Climb planner", "ftp-wkg": "FTP and W/kg", "fuel-hydration": "Fuel and hydration" },
  units: { mm: "mm", cm: "cm", m: "m", kg: "kg", W: "W", "%": "%", bar: "bar", psi: "psi", "km/h": "km/h", "W/kg": "W/kg", "ml/h": "ml/h", "g/h": "g/h", "L/h": "l/h", "l/h": "l/h" },
};
export const adviceCopy = { nl, en };
export function getAdviceCopy(locale: Locale) {
  const profile = getProfileProvenanceCopy(locale);
  const fitFields = locale === "nl"
    ? { saddleSetback: "Zadelterugstand", barDrop: "Zadel–stuur-drop", saddleToBarReach: "Zadel–stuur-reach", frameStack: "Aanbevolen stack", frameReach: "Aanbevolen reach" }
    : { saddleSetback: "Saddle setback", barDrop: "Saddle–bar drop", saddleToBarReach: "Saddle–bar reach", frameStack: "Recommended stack", frameReach: "Recommended reach" };
  return { ...adviceCopy[locale], fields: { ...adviceCopy[locale].fields, ...fitFields }, improvementFields: getProfileScoreCopy(locale).fields, inputFields: { ...profile.fields, ...profile.additionalFields } };
}
