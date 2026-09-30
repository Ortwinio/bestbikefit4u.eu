import type { Locale } from "@/i18n/config";

const copy = {
  nl: {
    coreStability: "Rompstabiliteit", adviceAvailable: "Fitadvies beschikbaar",
    extra: "Extra maten", missing: "Niet ingevuld", complete: "Ingevuld",
    improve: "Maak je advies nog scherper",
    improveBody: "Vul ontbrekende lichaamsmaten en fietsgegevens aan voor persoonlijker advies.",
    frame: "Framemaat nu", tires: "Banden", rim: "Velgtype",
    rimUnknown: "Velgtype onbekend. Controleer de maximale druk van je band en velg vóór je gaat rijden.",
    reportMissing: "Dit rapport is niet beschikbaar. Open je fit-sessie om verder te gaan.",
    tube: { tubeless: "Tubeless", inner_tube: "Binnenband", latex_tube: "Latex binnenband" },
    rims: { hooked: "Met haak", hookless: "Haakloos", unknown: "Niet opgegeven" },
  },
  en: {
    coreStability: "Core stability", adviceAvailable: "Fit advice available",
    extra: "Extra measurements", missing: "Not provided", complete: "Provided",
    improve: "Make your advice more precise",
    improveBody: "Add missing body measurements and bike details for more personalized advice.",
    frame: "Current frame size", tires: "Tires", rim: "Rim type",
    rimUnknown: "Rim type unknown. Check the maximum pressure of your tire and rim before riding.",
    reportMissing: "This report is unavailable. Open your fit session to continue.",
    tube: { tubeless: "Tubeless", inner_tube: "Inner tube", latex_tube: "Latex inner tube" },
    rims: { hooked: "Hooked", hookless: "Hookless", unknown: "Not provided" },
  },
};

export function getDashboardReportCopy(locale: Locale) {
  return copy[locale];
}
