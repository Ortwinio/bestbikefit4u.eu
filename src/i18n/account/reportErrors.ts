export const reportErrors = {
  en: {
    401: "Sign in to open your PDF report.",
    403: "The PDF report is part of Pro. Upgrade to Pro to view or download it.",
    404: "This fit report could not be found.",
    409: "Your fit report is not ready yet. Please try again shortly.",
    429: "Too many report requests. Please wait 30 seconds and try again.",
    fallback: "Failed to generate the PDF report. Please try again.",
  },
  nl: {
    401: "Log in om je PDF-rapport te openen.",
    403: "Het PDF-rapport is onderdeel van Pro. Upgrade naar Pro om het te bekijken of downloaden.",
    404: "Dit fitrapport is niet gevonden.",
    409: "Je fitrapport is nog niet klaar. Probeer het zo opnieuw.",
    429: "Te veel rapportaanvragen. Wacht 30 seconden en probeer het opnieuw.",
    fallback: "Genereren van het PDF-rapport mislukt. Probeer het opnieuw.",
  },
} as const;
