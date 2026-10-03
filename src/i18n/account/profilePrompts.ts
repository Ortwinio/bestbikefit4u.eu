import type { Locale } from "@/i18n/config";
import { getProfileProvenanceCopy } from "./profileProvenance";

const nl = {
  eyebrow: "Een klein stapje voor je profiel", title: "Maak je profiel vandaag iets sterker",
  introduction: "We kiezen maximaal twee vragen die je advies helpen verbeteren. Overslaan mag altijd.",
  loading: "Je profielvragen laden…", error: "Dat is niet gelukt. Je invoer blijft staan. Probeer het opnieuw.", retry: "Probeer opnieuw",
  dismiss: "Niet nu", dismissing: "We verbergen je vragenkaart…", profile: "Naar Mijn profiel",
  hidden: "De vragenkaart is verborgen tot", hiddenHint: "Je kunt je profiel altijd zelf aanvullen.",
  skip: "Sla over", skipped: "Overgeslagen. Deze vraag is minimaal 14 dagen verborgen; je kunt het gegeven altijd zelf in je profiel aanpassen.",
  save: "Bewaar gegeven", confirm: "Bevestig deze waarde", stale: "Klopt deze waarde nog?",
  saved: "Opgeslagen. Toekomstige berekeningen gebruiken dit gegeven voor", genericEffect: "je persoonlijke advies",
  effect: "Helpt bij", reliability: "punten betrouwbaarheid mogelijk", completeness: "punten volledigheid",
  quick: "Eén antwoord", measure: "Even meten", footer: "Hooguit twee vragen per login. Geen vragen over klachten of blessures in deze kaart.",
  bike: "Fiets", unknownField: "Profielgegeven", methods: "Hoe is deze waarde bepaald?", choose: "Kies een optie",
  measurePoint: "Meetpunt zadelhoogte", saddleInstruction: "Meet van het midden van de trapas tot de bovenkant van het zadel. Bevestig dit meetpunt voordat je bewaart.", saddlePoint: "Midden trapas tot bovenkant zadel",
  ftpHint: "Vul je resulterende FTP in, niet het ruwe gemiddelde vermogen van de 20-minutentest. Een testresultaat is afgeleid, niet direct gemeten.",
  unknownFtp: "Weet ik niet", unknownFtpHint: "Geen probleem. Je kunt je FTP schatten met de FTP-calculator. Er wordt nu niets opgeslagen.", ftpLink: "Open de FTP-calculator", upTo: "tot",
  armInstruction: "Sta met je arm ontspannen langs je lichaam. Meet van het benige schouderpunt (acromion) tot het topje van je middelvinger, zoals in de meetwizard.",
  ftpMethods: { self_report: "FTP uit mijn trainingsapp", ftp_test: "FTP-resultaat van een 20-minutentest (berekend)", single_measurement: "Direct gemeten FTP", self_assessment: "Mijn eigen schatting" },
  bikeValues: { road: "Racefiets", gravel: "Gravelbike", mountain: "Mountainbike", hybrid: "Hybridefiets", tt_triathlon: "Tijdrit / triatlon", cyclocross: "Cyclocrossfiets", touring: "Toerfiets", city: "Stadsfiets" },
  valueHelp: "Vul je eigen waarde in. Er wordt niets bewaard voordat je dit zelf bevestigt.",
  methodHelp: "Kies hoe je de waarde hebt bepaald. Eén meting is geen herhaalde meting.",
  conflict: "Je profiel is ondertussen gewijzigd", current: "Huidige waarde", incoming: "Jouw invoer",
  conflictHint: "We overschrijven niets zonder jouw keuze.", keep: "Behoud profielwaarde", today: "Gebruik mijn invoer", remeasure: "Opnieuw meten",
  discarded: "Je huidige profielwaarde blijft behouden. Controleer de waarde voordat je opnieuw opslaat.",
  bikeFields: { "currentSetup.crankLengthMm": "Cranklengte", "currentSetup.saddleHeightMm": "Zadelhoogte", "currentSetup.saddleSetbackMm": "Zadelterugstand", weightKg: "Gewicht", bikeType: "Fietstype", primaryGoal: "Rijdoel fiets" },
  effects: { reach: "reach en stuurpen", bike_fit: "je fietspositie", "bike-fit": "je fietspositie", saddle_height: "zadelhoogte", "saddle-height": "zadelhoogte", saddle_width: "zadelbreedte", "saddle-width": "zadelbreedte", frame_size: "framemaat", "frame-size": "framemaat", crank_length: "cranklengte", "crank-length": "cranklengte", pressure: "bandenspanning", gearing: "versnellingen", climb: "klimplanning", "climb-planner": "klimplanning", power: "vermogen en snelheid", "power-speed": "vermogen en snelheid", ftp: "vermogen per kilogram", "ftp-wkg": "vermogen per kilogram", fuel: "voeding en hydratatie", "fuel-hydration": "voeding en hydratatie" },
};
type Copy = { [Key in keyof typeof nl]: typeof nl[Key] extends string ? string : { [Sub in keyof typeof nl[Key]]: string } };
const en: Copy = {
  eyebrow: "A small step for your profile", title: "Make your profile a little stronger today",
  introduction: "We choose at most two questions that help improve your advice. You can always skip.",
  loading: "Loading your profile questions…", error: "That didn’t work. Your entry is still here. Please try again.", retry: "Try again",
  dismiss: "Not now", dismissing: "Hiding your question card…", profile: "Go to My profile",
  hidden: "The question card is hidden until", hiddenHint: "You can always update your profile yourself.",
  skip: "Skip", skipped: "Skipped. This question is hidden for at least 14 days; you can always update the detail in your profile.",
  save: "Save detail", confirm: "Confirm this value", stale: "Is this value still correct?",
  saved: "Saved. Future calculations use this detail for", genericEffect: "your personal advice",
  effect: "Helps with", reliability: "possible reliability points", completeness: "completeness points",
  quick: "One answer", measure: "A measurement", footer: "At most two questions per login. No questions about discomfort or injuries in this card.",
  bike: "Bike", unknownField: "Profile detail", methods: "How was this value determined?", choose: "Choose an option",
  measurePoint: "Saddle height measurement point", saddleInstruction: "Measure from the bottom bracket centre to the top of the saddle. Confirm this measurement point before saving.", saddlePoint: "Bottom bracket centre to saddle top",
  ftpHint: "Enter your resulting FTP, not the raw average power from a twenty-minute test. A test result is derived, not directly measured.",
  unknownFtp: "I don’t know", unknownFtpHint: "No problem. You can estimate your FTP with the FTP calculator. Nothing is saved now.", ftpLink: "Open the FTP calculator", upTo: "up to",
  armInstruction: "Stand with your arm relaxed at your side. Measure from the bony shoulder tip (acromion) to the middle finger tip, as in the measurement wizard.",
  ftpMethods: { self_report: "FTP from my training app", ftp_test: "FTP result from a twenty-minute test (calculated)", single_measurement: "Directly measured FTP", self_assessment: "My own estimate" },
  bikeValues: { road: "Road bike", gravel: "Gravel bike", mountain: "Mountain bike", hybrid: "Hybrid bike", tt_triathlon: "Time trial / triathlon", cyclocross: "Cyclocross bike", touring: "Touring bike", city: "City bike" },
  valueHelp: "Enter your own value. Nothing is saved until you explicitly confirm it.",
  methodHelp: "Choose how you determined the value. One measurement is not a repeated measurement.",
  conflict: "Your profile changed in the meantime", current: "Current value", incoming: "Your entry",
  conflictHint: "We never overwrite anything without your choice.", keep: "Keep profile value", today: "Use my entry", remeasure: "Measure again",
  discarded: "Your current profile value stays in place. Check the value before saving again.",
  bikeFields: { "currentSetup.crankLengthMm": "Crank length", "currentSetup.saddleHeightMm": "Saddle height", "currentSetup.saddleSetbackMm": "Saddle setback", weightKg: "Weight", bikeType: "Bike type", primaryGoal: "Bike riding goal" },
  effects: { reach: "reach and stem", bike_fit: "your riding position", "bike-fit": "your riding position", saddle_height: "saddle height", "saddle-height": "saddle height", saddle_width: "saddle width", "saddle-width": "saddle width", frame_size: "frame size", "frame-size": "frame size", crank_length: "crank length", "crank-length": "crank length", pressure: "tire pressure", gearing: "gearing", climb: "climb planning", "climb-planner": "climb planning", power: "power and speed", "power-speed": "power and speed", ftp: "power per kilogram", "ftp-wkg": "power per kilogram", fuel: "fuel and hydration", "fuel-hydration": "fuel and hydration" },
};

export function getProfilePromptsCopy(locale: Locale) {
  const provenance = getProfileProvenanceCopy(locale);
  const copy = locale === "nl" ? nl : en;
  return { ...copy, demographicReasons: provenance.demographicReasons, demographicNote: provenance.demographicNote, demographicSaved: provenance.demographicSaved, demographicDeclined: provenance.demographicDeclined, dateHelp: provenance.dateHelp, effects: { ...copy.effects, "tire-pressure": copy.effects.pressure }, fields: { ...provenance.fields, ...provenance.additionalFields }, values: provenance.values, protocols: provenance.protocols, saveMethods: provenance.saveMethods };
}
