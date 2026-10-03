import type { Locale } from "@/i18n/config";

const nl = {
  demographicReasons: { sex: "Optioneel: geslacht is bedoeld voor toekomstige, wetenschappelijk onderbouwde referenties. We schatten hiermee nu geen FTP of flexibiliteit. Je mag dit liever niet zeggen.", birthDate: "Optioneel: je geboortedatum maakt het mogelijk je leeftijd te bepalen. We schatten hiermee nu geen FTP of flexibiliteit." },
  demographicNote: "Deze gegevens zijn ongescoord. Schattingen zijn geen metingen en vervangen nooit je eigen opgegeven of gemeten waarden.",
  dateHelp: "Vul een echte geboortedatum in. De ondersteunde leeftijd is 10 tot en met 100 jaar.",
  demographicSaved: "Je optionele gegeven is opgeslagen. Je profielscore verandert hierdoor niet; een onderbouwde schatting is geen meting.",
  demographicDeclined: "Je keuze is opgeslagen. We raden je geslacht niet en maken geen schatting die geslacht vereist.",
  data: "Mijn gegevens", bikes: "Mijn fietsen", score: "Je riderprofiel", explanation: "Hoe berekenen we dit?",
  recorded: "Vastgelegd", legacyFormula: "Afgeleid uit lichaamslengte", legacyDefault: "Eerdere standaardwaarde",
  protocols: { single_measurement: "Eenmalige meting", ftp_test: "FTP-test", twentyMinute: "Twintigminutentest", known: "Bekende FTP", ramp: "Ramptest", self_assessment: "Zelfbeoordeling", self_report: "Eigen opgave", low: "Weinig", medium: "Gemiddeld", high: "Veel", start: "Aan het begin van de rit", during: "Tijdens langere ritten", climbing: "Bij het klimmen", always: "Gedurende de hele rit", after_ride: "Na de rit", knee_front: "Voorkant knie", knee_back: "Achterkant knie", saddle_area: "Zadelgebied" },
  additionalFields: { sex: "Geslacht", birthDate: "Geboortedatum", footLengthCm: "Voetlengte", handSpanCm: "Handspanwijdte", hipCircumferenceCm: "Heupomtrek", age: "Leeftijd", painSeverity: "Ernst van klachten", kneePainTiming: "Wanneer kniepijn optreedt", ftpMethod: "FTP-methode", sweatProfile: "Zweetprofiel" },
  saveMethods: { single_measurement: "Ik heb dit gemeten", self_assessment: "Ik schat dit zelf in", self_report: "Dit is mijn antwoord", ftp_test: "FTP-test" },
  scoreDescription: "Volledig = welke gegevens we hebben. Betrouwbaar = hoe zeker ze zijn: gemeten telt zwaarder dan zelf ingeschat, en een berekende waarde telt nooit als meting.",
  groups: { all: "Alles", body: "Lichaamsmaten", mobility: "Beweeglijkheid", riding: "Rijstijl & comfort", performance: "Prestatie", contact: "Contactpunten" },
  allData: "Al je gegevens", provenance: "Elke waarde met methode, bron en datum", filter: "Kies een groep", complete: "Volledig", reliable: "Betrouwbaar",
  missing: "Ontbreekt", unknown: "Herkomst onbekend", unknownMethod: "Methode onbekend", unknownSource: "Bron onbekend", unknownDate: "Datum onbekend", loading: "Herkomst laden…",
  legacy: "Bij oudere gegevens kennen we de oorspronkelijke meetwijze niet altijd. Een score-aanname is geen bevestigde meting.",
  edit: "Wijzig", add: "Vul aan", save: "Bewaar gegeven", cancel: "Annuleer", kind: "Hoe is deze waarde bepaald?", method: "Meetmethode", choose: "Kies een optie", methodHelp: "Beschrijf hoe je deze waarde hebt bepaald. Een berekening is geen meting.",
  valueHelp: "Gebruik je eigen waarde in de getoonde eenheid. Laat een ontbrekende meting leeg totdat je deze weet.",
  saved: "Gegeven en herkomst opgeslagen.", error: "Opslaan is niet gelukt. Je invoer blijft staan. Probeer opnieuw.",
  conflict: "Twee waarden voor dit gegeven. Welke klopt?", noOverwrite: "We overschrijven niets zonder jouw keuze.", current: "Je profiel", incoming: "Je nieuwe waarde", keepCurrent: "Profielwaarde houden", useIncoming: "Nieuwe waarde gebruiken", remeasure: "Meet opnieuw", remeasureHint: "Je profielwaarde blijft staan. Controleer de meting en bewaar daarna je nieuwe waarde.",
  legend: "Wat de labels betekenen", kinds: { measured: "Gemeten", estimated: "Geschat", derived: "Berekend", declared: "Opgegeven" },
  kindHints: { measured: "Een geregistreerde meting; eenmalig gemeten telt voor 85% betrouwbaarheid.", estimated: "Een schatting telt voor 60% betrouwbaarheid.", derived: "Afgeleid uit andere waarden; telt voor 30%, nooit als meting.", declared: "Jouw antwoord; telt voor 60% betrouwbaarheid." },
  repeated: "Herhaald gemeten", fitter: "Fitter / video", ruleNote: "Dit zijn onze eigen rekenregels, geen gevalideerde norm. Ouderdom en waarschuwingen kunnen de betrouwbaarheid verlagen.",
  improve: "Wat je nog kunt verbeteren", upTo: "tot", points: "punten betrouwbaar", improveHint: "Vul aan of controleer de herkomst. De werkelijke winst hangt af van de kwaliteit van de nieuwe invoer.", allComplete: "Je profiel is volledig. Houd veranderlijke gegevens actueel.",
  privacy: "Je gegevens blijven van jou", privacyText: "Je maten staan in je account. We nemen meetwaarden niet op in statistieken of e-mailtracking.", privacyLink: "Privacy-instellingen",
  directEdit: "Direct aanpassen", directHint: "Je bestaande profielvelden blijven beschikbaar met automatisch opslaan.", wizard: "Open de meetwizard", hideEditor: "Sluit direct aanpassen",
  sourceLabels: { public_handoff: "Publieke calculator", legacy_migration: "Bestaand profiel", profile_edit: "Profiel aangepast", profile_measurement: "Profielmeting", profile: "Mijn profiel", calculator: "Account-calculator", manual: "Handmatig ingevuld" },
  methodLabels: { measured: "Eenmalige meting", estimated: "Schatting", declared: "Eigen opgave", derived: "Afgeleid", legacy_unknown: "Oorspronkelijke methode onbekend", legacy_declared: "Eerdere opgave", manual: "Handmatige invoer", self_assessed: "Zelfbeoordeling", fitter: "Fitter", video: "Video", known: "Bekende FTP", twentyMinute: "Twintigminutentest", ramp: "Ramptest" },
  fields: { inseamCm: "Binnenbeenlengte", heightCm: "Lichaamslengte", armLengthCm: "Armlengte", torsoLengthCm: "Torsolengte", shoulderWidthCm: "Schouderbreedte", femurLengthCm: "Dijbeenlengte", flexibilityScore: "Flexibiliteit", coreStabilityScore: "Rompstabiliteit", experienceLevel: "Ervaring", weeklyHours: "Uren per week", typicalRideLength: "Gewone ritlengte", positionPriority: "Standaard rijdoel", hasPain: "Klachten", painAreas: "Klachtgebieden", weightKg: "Gewicht", ftpWatts: "FTP", sitBoneWidthMm: "Zitbotbreedte", shoeSizeEu: "Schoenmaat", cleatSystem: "Cleatsysteem" },
  values: { female: "Vrouw", male: "Man", prefer_not_to_say: "Zeg ik liever niet", very_limited: "Zeer beperkt", limited: "Beperkt", average: "Gemiddeld", good: "Goed", excellent: "Uitstekend", comfort: "Comfort", balanced: "Gebalanceerd", performance: "Prestatie", beginner: "Beginner", intermediate: "Gevorderd", advanced: "Ervaren", competitive: "Wedstrijdrenner", short: "Kort", medium: "Gemiddeld", long: "Lang", ultra: "Ultra", yes: "Ja", no: "Nee", neck: "Nek", shoulders: "Schouders", hands: "Handen", wrists: "Polsen", lower_back: "Onderrug", upper_back: "Bovenrug", knees: "Knieën", hips: "Heupen", feet: "Voeten", saddle: "Zadelcontact" },
};
type Copy = { [Key in keyof typeof nl]: typeof nl[Key] extends string ? string : { [Nested in keyof typeof nl[Key]]: string } };
const en: Copy = {
  demographicReasons: { sex: "Optional: sex is intended for future evidence-based references. We do not currently use it to estimate FTP or flexibility. You can prefer not to say.", birthDate: "Optional: your date of birth lets us determine your age. We do not currently use it to estimate FTP or flexibility." },
  demographicNote: "These details are unscored. Estimates are not measurements and never replace your own provided or measured values.",
  dateHelp: "Enter a real date of birth. The supported age is 10 through 100 years.",
  demographicSaved: "Your optional detail is saved. It does not change your profile score; an evidence-based estimate is not a measurement.",
  demographicDeclined: "Your choice is saved. We do not guess your sex or make an estimate that requires it.",
  data: "My details", bikes: "My bikes", score: "Your rider profile", explanation: "How do we calculate this?",
  recorded: "Recorded", legacyFormula: "Derived from body height", legacyDefault: "Earlier default value",
  protocols: { single_measurement: "Single measurement", ftp_test: "FTP test", twentyMinute: "Twenty-minute test", known: "Known FTP", ramp: "Ramp test", self_assessment: "Self-assessment", self_report: "Your answer", low: "Low", medium: "Medium", high: "High", start: "At the start of rides", during: "During longer rides", climbing: "When climbing", always: "Throughout the ride", after_ride: "After the ride", knee_front: "Front of knee", knee_back: "Back of knee", saddle_area: "Saddle area" },
  additionalFields: { sex: "Sex", birthDate: "Date of birth", footLengthCm: "Foot length", handSpanCm: "Hand span", hipCircumferenceCm: "Hip circumference", age: "Age", painSeverity: "Discomfort severity", kneePainTiming: "When knee pain occurs", ftpMethod: "FTP method", sweatProfile: "Sweat profile" },
  saveMethods: { single_measurement: "I measured this", self_assessment: "I estimate this myself", self_report: "This is my answer", ftp_test: "FTP test" },
  scoreDescription: "Complete means which details we have. Reliable means how certain they are: measurements count more than estimates, and a calculated value never counts as a measurement.",
  groups: { all: "All", body: "Body measurements", mobility: "Mobility", riding: "Riding & comfort", performance: "Performance", contact: "Contact points" },
  allData: "All your details", provenance: "Every value with method, source and date", filter: "Choose a group", complete: "Complete", reliable: "Reliable",
  missing: "Missing", unknown: "Unknown provenance", unknownMethod: "Method unknown", unknownSource: "Source unknown", unknownDate: "Date unknown", loading: "Loading provenance…",
  legacy: "For older details, the original measurement method may be unknown. A scoring assumption is not a confirmed measurement.",
  edit: "Change", add: "Add detail", save: "Save detail", cancel: "Cancel", kind: "How was this value determined?", method: "Measurement method", choose: "Choose an option", methodHelp: "Describe how you determined this value. A calculation is not a measurement.",
  valueHelp: "Use your own value in the displayed unit. Leave a missing measurement blank until you know it.",
  saved: "Detail and provenance saved.", error: "We couldn’t save this detail. Your entry is still here. Please try again.",
  conflict: "Two values for this detail. Which is correct?", noOverwrite: "We never overwrite a value without your choice.", current: "Your profile", incoming: "Your new value", keepCurrent: "Keep profile value", useIncoming: "Use new value", remeasure: "Measure again", remeasureHint: "Your profile value stays in place. Check the measurement, then save your new value.",
  legend: "What the labels mean", kinds: { measured: "Measured", estimated: "Estimated", derived: "Calculated", declared: "Provided" },
  kindHints: { measured: "A recorded measurement; a single measurement contributes 85% reliability.", estimated: "An estimate contributes 60% reliability.", derived: "Derived from other values; contributes 30%, never as a measurement.", declared: "Your answer; contributes 60% reliability." },
  repeated: "Repeated measurement", fitter: "Fitter / video", ruleNote: "These are our own scoring rules, not a validated standard. Age and warnings can reduce reliability.",
  improve: "What you can improve", upTo: "up to", points: "reliability points", improveHint: "Add a detail or check its provenance. The actual gain depends on the quality of the new entry.", allComplete: "Your profile is complete. Keep changing details up to date.",
  privacy: "Your data stays yours", privacyText: "Your measurements stay in your account. We do not include measurement values in analytics or email tracking.", privacyLink: "Privacy settings",
  directEdit: "Edit directly", directHint: "Your existing profile fields remain available with automatic saving.", wizard: "Open measurement wizard", hideEditor: "Close direct editing",
  sourceLabels: { public_handoff: "Public calculator", legacy_migration: "Existing profile", profile_edit: "Profile updated", profile_measurement: "Profile measurement", profile: "My profile", calculator: "Account calculator", manual: "Entered manually" },
  methodLabels: { measured: "Single measurement", estimated: "Estimate", declared: "Your answer", derived: "Derived", legacy_unknown: "Original method unknown", legacy_declared: "Earlier answer", manual: "Manual entry", self_assessed: "Self-assessment", fitter: "Fitter", video: "Video", known: "Known FTP", twentyMinute: "Twenty-minute test", ramp: "Ramp test" },
  fields: { inseamCm: "Inseam", heightCm: "Body height", armLengthCm: "Arm length", torsoLengthCm: "Torso length", shoulderWidthCm: "Shoulder width", femurLengthCm: "Femur length", flexibilityScore: "Flexibility", coreStabilityScore: "Core stability", experienceLevel: "Experience", weeklyHours: "Hours per week", typicalRideLength: "Usual ride length", positionPriority: "Default riding goal", hasPain: "Discomfort", painAreas: "Discomfort areas", weightKg: "Weight", ftpWatts: "FTP", sitBoneWidthMm: "Sit bone width", shoeSizeEu: "Shoe size", cleatSystem: "Cleat system" },
  values: { female: "Female", male: "Male", prefer_not_to_say: "Prefer not to say", very_limited: "Very limited", limited: "Limited", average: "Average", good: "Good", excellent: "Excellent", comfort: "Comfort", balanced: "Balanced", performance: "Performance", beginner: "Beginner", intermediate: "Intermediate", advanced: "Experienced", competitive: "Competitive", short: "Short", medium: "Medium", long: "Long", ultra: "Ultra", yes: "Yes", no: "No", neck: "Neck", shoulders: "Shoulders", hands: "Hands", wrists: "Wrists", lower_back: "Lower back", upper_back: "Upper back", knees: "Knees", hips: "Hips", feet: "Feet", saddle: "Saddle contact" },
};
export function getProfileProvenanceCopy(locale: Locale): Copy { return locale === "nl" ? nl : en; }
export type ProvenanceField = keyof typeof nl.fields | keyof typeof nl.additionalFields;
export type ProvenanceGroup = keyof typeof nl.groups;

export function formatProfileBirthDate(value: unknown, locale: Locale): string | null {
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return null;
  const date = new Date(value + "T00:00:00Z");
  if (!Number.isFinite(date.getTime()) || date.toISOString().slice(0, 10) !== value) return null;
  return date.toLocaleDateString(locale === "nl" ? "nl-NL" : "en-GB", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" });
}
