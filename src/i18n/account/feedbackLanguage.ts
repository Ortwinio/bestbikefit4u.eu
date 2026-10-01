export const feedbackDutch = {
  requiredField: "Vul {field} in.",
  nextSteps: [
    "We beoordelen je feedback en sturen die naar het juiste team.",
    "Als het team reageert, zie je dat terug in je dashboard.",
    "Zodra een verbetering beschikbaar is, kunnen we die aan je melding koppelen.",
  ],
  browserInfoHelper: "Wordt automatisch vastgelegd bij foutmeldingen en hulpvragen.",
  technicalDetailsHint: "Helpt ons fouten te onderzoeken. Je hoeft dit niet te bewerken.",
  categoryPlaceholder: "Dashboard, fietsafstelling, gegevens…",
  browserInfoPlaceholder: "Automatisch verzameld bij foutmeldingen en hulpvragen.",
  bug: "Foutmelding",
  support: "Hulpvraag",
  review: "Beoordeling",
  live: "Beschikbaar",
  fitEngine: "Afstellingsberekening",
  content: "Inhoud",
  emptyMine: "Stuur een foutmelding, idee of hulpvraag.",
  emptyBoardTitle: "Geen open functieverzoeken",
  emptyBoardDescription: "Er zijn nu geen functieverzoeken om op te stemmen.",
  emptyChangelogTitle: "Nog geen updates",
  emptyChangelogDescription: "Hier zie je updates zodra ze beschikbaar zijn.",
  releaseNotes: "Wijzigingen",
  linkedRelease: "Gekoppelde update",
  planned: "Dit staat op de planning voor een volgende update.",
  released: "Dit is verwerkt in een update die beschikbaar is of wordt uitgerold.",
  submitError: "Je feedback is niet verstuurd. Probeer het opnieuw.",
};

export function getFeedbackSubmitError(error: unknown, locale: string, fallback: string): string {
  if (locale === "nl") return feedbackDutch.submitError;
  return error instanceof Error && error.message.trim() ? error.message : fallback;
}
