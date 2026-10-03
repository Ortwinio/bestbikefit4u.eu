export const reportErrors = {
  en: {
    emailFallback: "Something went wrong. Please try again.",
    401: "Sign in to open your PDF report.",
    403: "You do not have access to this PDF. A free account can download its latest report. " +
      "A single fit or annual plan opens the reports included in that access.",
    404: "This fit report could not be found.",
    409: "Your fit report is not ready yet. Please try again shortly.",
    429: "Too many report requests. Please wait 30 seconds and try again.",
    fallback: "Failed to generate the PDF report. Please try again.",
  },
  nl: {
    emailFallback: "Versturen mislukt. Probeer het opnieuw.",
    401: "Log in om je PDF-rapport te openen.",
    403: "Je hebt geen toegang tot deze PDF. Met een gratis account download je je laatste rapport. " +
      "Een losse meting of jaarabonnement opent de rapporten die binnen die toegang vallen.",
    404: "Dit fitrapport is niet gevonden.",
    409: "Je fitrapport is nog niet klaar. Probeer het zo opnieuw.",
    429: "Te veel rapportaanvragen. Wacht 30 seconden en probeer het opnieuw.",
    fallback: "Genereren van het PDF-rapport mislukt. Probeer het opnieuw.",
  },
} as const;
