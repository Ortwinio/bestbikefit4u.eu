import type { Locale } from "@/i18n/config";

const nl = {
  title: "Fietsprofiel", lookup: "Zoek je fiets op",
  lookupHint: "Kies je merk, model en maat. Een match vult de geometrie uit de database in.",
  optional: "Optioneel. Laat leeg wat je nog niet weet.",
  equipmentHint: "Neem de naam of het systeem over van het onderdeel. Laat leeg als je het niet weet.",
  saddleModel: "Zadelmodel", saddleWidthMm: "Zadelbreedte", pedalModel: "Pedaalmodel", cleatSystem: "Cleatsysteem",
  maxSeatpostMm: "Maximaal veilige uitstekende zadelpen",
  maxSpacerStackMm: "Maximale spacerhoogte",
  spacersMm: "Spacers onder de stuurpen", handlebarReachMm: "Afstand zadelneus tot stuur",
  handlebarDropMm: "Hoogteverschil zadel en stuur",
  limitsHint: "Neem de veilige limiet over van de fabrikant. De zadelpenlengte is niet je zadelhoogte.",
  measureSpacers: "Meet de totale hoogte van de spacers onder je stuurpen.",
  measureReach: "Meet horizontaal van de zadelneus tot het midden van het stuur.",
  measureDrop: "Meet het verticale verschil tussen de bovenkant van het zadel en het stuur. Positief is een lager stuur.",
  setup: "Afstelling", improve: "Vul je fietsprofiel aan", measure: "Meet je",
};
const en: typeof nl = {
  title: "Bike profile", lookup: "Look up your bike",
  lookupHint: "Choose your brand, model and size. A match fills in geometry from the database.",
  optional: "Optional. Leave unknown details empty.",
  equipmentHint: "Copy the name or system from the component. Leave empty if you do not know it.",
  saddleModel: "Saddle model", saddleWidthMm: "Saddle width", pedalModel: "Pedal model", cleatSystem: "Cleat system",
  maxSeatpostMm: "Maximum safe exposed seatpost length", maxSpacerStackMm: "Maximum spacer stack",
  spacersMm: "Spacers below the stem", handlebarReachMm: "Saddle nose to handlebar distance",
  handlebarDropMm: "Saddle to handlebar height difference",
  limitsHint: "Use the safe limit specified by the manufacturer. Seatpost length is not saddle height.",
  measureSpacers: "Measure the total height of the spacers below your stem.",
  measureReach: "Measure horizontally from the saddle nose to the centre of the handlebar.",
  measureDrop: "Measure the vertical difference between the saddle top and bar top. Positive means a lower bar.",
  setup: "Setup", improve: "Complete your bike profile", measure: "Measure your",
};
export const bikeProfileFormMessages: Record<Locale, typeof nl> = { nl, en };
