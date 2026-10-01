import type { Locale } from "@/i18n/config";

const bikeDeletion = {
  nl: {
    action: "Verwijder fiets",
    title: "Fiets definitief verwijderen?",
    description: "Je verwijdert deze fiets en alle bijbehorende gegevens:",
    settings: "Geometrie, wielen en banden, bandenspanning, versnellingen en calculatorinstellingen.",
    photos: "Foto’s, fietspaspoort en de openbare fitpascode.",
    rides: "De ritgeschiedenis en je feedback over ritten op deze fiets.",
    sessions: (count: number) => `${count} fitsessie${count === 1 ? "" : "s"} met alle adviezen en PDF-rapporten.`,
    loading: "Aantal fitsessies ophalen…",
    warning: "Dit kan niet ongedaan worden gemaakt.",
    nameLabel: "Typ de naam van je fiets",
    nameHint: "Neem de naam hierboven precies over om te bevestigen.",
    cancel: "Annuleren",
    close: "Dialoog sluiten",
    confirm: "Definitief verwijderen",
    success: "Fiets verwijderd",
    error: "Je fiets kon niet worden verwijderd. Probeer het opnieuw.",
  },
  en: {
    action: "Delete bike",
    title: "Permanently delete this bike?",
    description: "You will delete this bike and all its data:",
    settings: "Geometry, wheels and tires, tire pressure, gearing and calculator settings.",
    photos: "Photos, bike passport and the public fit pass code.",
    rides: "Cycling activity history and your ride feedback for this bike.",
    sessions: (count: number) => `${count} fit session${count === 1 ? "" : "s"} with all advice and PDF reports.`,
    loading: "Loading the number of fit sessions…",
    warning: "This cannot be undone.",
    nameLabel: "Type your bike’s name",
    nameHint: "Enter the name above exactly to confirm.",
    cancel: "Cancel",
    close: "Close dialog",
    confirm: "Permanently delete",
    success: "Bike deleted",
    error: "Your bike could not be deleted. Please try again.",
  },
};

export function getBikeDeletionCopy(locale: Locale) {
  return bikeDeletion[locale];
}
