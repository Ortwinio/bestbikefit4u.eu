import type { Locale } from "@/i18n/config";

const en = {
  title: "Bike fitting history",
  subtitle: "Your fitting sessions grouped by bike, newest first.",
  loading: "Loading sessions…",
  errorTitle: "History unavailable",
  errorDescription: "Your fitting history could not be loaded. Please try again later.",
  emptyTitle: "No fitting sessions yet",
  emptyDescription: "Complete a fitting session to build up your bike history.",
  emptyCta: "Start your first fit session",
  noBikeLinked: "No bike linked",
  noRecommendationYet: "No recommendation generated yet",
  confidence: "Confidence",
  saddleHeight: "Saddle height",
  handlebarDrop: "Handlebar drop",
  startNewSession: "Start new fitting session",
  cancel: "Cancel",
  status: {
    completed: "Completed",
    in_progress: "In progress",
    questionnaire_complete: "Questionnaire complete",
    processing: "Processing",
    archived: "Archived",
  },
  delete: {
    action: "Delete fitting",
    dialogTitle: "Delete bike fitting?",
    dialogDescription: "This permanently deletes the fitting session, its questionnaire answers, recommendations, and related validation data.",
    confirm: "Delete fitting",
    success: "Bike fitting deleted.",
    failed: "Could not delete the bike fitting. Please try again.",
  },
};

const nl: typeof en = {
  title: "Afstellingsgeschiedenis",
  subtitle: "Je afstellingssessies per fiets, nieuwste eerst.",
  loading: "Sessies laden…",
  errorTitle: "Geschiedenis niet beschikbaar",
  errorDescription: "Je afstellingsgeschiedenis kon niet worden geladen. Probeer het later opnieuw.",
  emptyTitle: "Nog geen fit-sessies",
  emptyDescription: "Voltooi een fit-sessie om hier je fietsgeschiedenis op te bouwen.",
  emptyCta: "Start je eerste fit-sessie",
  noBikeLinked: "Geen fiets gekoppeld",
  noRecommendationYet: "Nog geen aanbeveling gegenereerd",
  confidence: "Vertrouwen",
  saddleHeight: "Zadelhoogte",
  handlebarDrop: "Stuurval",
  startNewSession: "Start nieuwe fit-sessie",
  cancel: "Annuleren",
  status: {
    completed: "Voltooid",
    in_progress: "Bezig",
    questionnaire_complete: "Vragenlijst voltooid",
    processing: "Verwerken",
    archived: "Gearchiveerd",
  },
  delete: {
    action: "Fit verwijderen",
    dialogTitle: "Bike fitting verwijderen?",
    dialogDescription: "Dit verwijdert de fit-sessie, vragenlijstantwoorden, aanbevelingen en gerelateerde validatiedata permanent.",
    confirm: "Fit verwijderen",
    success: "Bike fitting verwijderd.",
    failed: "Kon de bike fitting niet verwijderen. Probeer het opnieuw.",
  },
};

export const fitHistoryCopy: Record<Locale, typeof en> = { en, nl };
