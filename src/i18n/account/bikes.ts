import type { Locale } from "@/i18n/config";

const en = {
  addCog: "Add sprocket",
  removeCog: "Remove sprocket",
  garage: "Your bike garage",
  back: "Back to bikes",
  unknown: "Not entered",
  enter: "Add measurement",
  clear: "Clear measurement",
  details: "Bike details",
  measurements: "Measurements",
  gearing: "Gearing",
  notes: "Notes",
  compare: "Compare bike fit",
  compareIntro: "Compare stack, reach and adjustment room before choosing your next bike.",
  compareTitle: "Start with your current position",
  compareBody:
    "Save your current bike and its measurements in your garage. Use these as a reference when checking another frame.",
  compareSteps: [
    {
      title: "Frame",
      body: "Compare stack and reach together. A frame-size label alone does not describe your position.",
    },
    {
      title: "Cockpit",
      body: "Check stem length, spacers and handlebar reach against the position you want to achieve.",
    },
    {
      title: "Adjustment room",
      body: "Check saddle position and component limits. Get a professional assessment for a complex fit.",
    },
  ],
  openGarage: "Open bike garage",
};
const nl: typeof en = {
  addCog: "Tandwiel toevoegen",
  removeCog: "Tandwiel verwijderen",
  garage: "Mijn fietsgarage",
  back: "Terug naar fietsen",
  unknown: "Niet ingevuld",
  enter: "Maat toevoegen",
  clear: "Maat wissen",
  details: "Fietsgegevens",
  measurements: "Meetwaarden",
  gearing: "Versnelling",
  notes: "Notities",
  compare: "Fietsen vergelijken",
  compareIntro: "Vergelijk stack, reach en aanpasbaarheid voordat je een volgende fiets kiest.",
  compareTitle: "Begin bij je huidige positie",
  compareBody:
    "Bewaar je huidige fiets en meetwaarden in je garage. Gebruik die als referentie wanneer je een ander frame bekijkt.",
  compareSteps: [
    {
      title: "Frame",
      body: "Vergelijk stack en reach samen. Alleen een framemaat zegt niet genoeg over je positie.",
    },
    {
      title: "Cockpit",
      body: "Controleer stuurpenlengte, spacers en stuur-reach voor de positie die je wilt bereiken.",
    },
    {
      title: "Aanpasbaarheid",
      body: "Controleer zadelpositie en de grenzen van onderdelen. Vraag bij een complexe fit professioneel advies.",
    },
  ],
  openGarage: "Open fietsengarage",
};
export const getBikesCopy = (locale: Locale) => (locale === "nl" ? nl : en);
