import type { Locale } from "@/i18n/config";

const nl = {
  mark: "Markeer als uitgevoerd", markTitle: "Wanneer heb je dit aangepast?", date: "Datum van de aanpassing",
  dateHelp: "Kies de dag waarop je dit advies hebt uitgevoerd. Datums worden als UTC-kalenderdag bewaard.",
  note: "Notitie (optioneel)", noteHelp: "Maximaal 500 tekens. Schrijf alleen wat je bij dit advies wilt bewaren.",
  save: "Aanpassing bewaren", cancel: "Annuleren", saving: "Bewaren…", feedback: "Geef ritfeedback",
  feedbackTitle: "Hoe voelde je rit na de aanpassing?", better: "Beter", same: "Hetzelfde", worse: "Slechter",
  saveFeedback: "Ritfeedback bewaren", performedDate: "Aangepast op", waiting: "Wacht op ritfeedback", performed: "Uitgevoerd",
  ride: "Bestaande ritfeedback koppelen (optioneel)", noRide: "Geen bestaande rit koppelen",
  rideHelp: "Je kunt een eerdere rit koppelen. Kies zelf hoe het voelde; we leiden dat niet af uit je eerdere feedback.",
  rideNote: "Notitie bij de gekoppelde rit", outcome: "Rit voelde", awaiting: "Rijd met de aanpassing en laat weten hoe het voelt.",
  unavailable: "Je advies is gewijzigd. Herlaad de pagina en probeer opnieuw.",
  errors: { ADVICE_NOT_FOUND: "Dit advies is niet meer beschikbaar.", ADVICE_CHANGED: "Het advies is opnieuw berekend. Bekijk de nieuwe waarden en probeer opnieuw.",
    ADVICE_ALREADY_PERFORMED: "Deze aanpassing is al bewaard. Herlaad de pagina om de actuele status te zien.",
    FEEDBACK_ALREADY_RECORDED: "Je ritfeedback is al bewaard. Herlaad de pagina om die te bekijken.",
    INVALID_DATE: "Kies een geldige datum vanaf de berekening tot en met vandaag (UTC).", INVALID_NOTE: "Houd je notitie korter dan 501 tekens.",
    FEEDBACK_REQUIRES_PERFORMED: "Bewaar eerst wanneer je de aanpassing hebt uitgevoerd.", INVALID_FEEDBACK: "Kies beter, hetzelfde of slechter.",
    AUTH_CHANGED: "Je account is gewijzigd. Herlaad de pagina voordat je bewaart.",
    generic: "Bewaren is niet gelukt. Probeer het opnieuw." },
};
type Copy = Omit<{ [Key in keyof typeof nl]: string }, "errors"> & { errors: Record<keyof typeof nl.errors, string> };
const en: Copy = {
  mark: "Mark as performed", markTitle: "When did you make this adjustment?", date: "Adjustment date",
  dateHelp: "Choose the day you followed this advice. Dates are stored as UTC calendar days.",
  note: "Note (optional)", noteHelp: "Up to 500 characters. Only write what you want to keep with this advice.",
  save: "Save adjustment", cancel: "Cancel", saving: "Saving…", feedback: "Give ride feedback",
  feedbackTitle: "How did your ride feel after the adjustment?", better: "Better", same: "The same", worse: "Worse",
  saveFeedback: "Save ride feedback", performedDate: "Adjusted on", waiting: "Waiting for ride feedback", performed: "Performed",
  ride: "Link existing ride feedback (optional)", noRide: "Do not link an existing ride",
  rideHelp: "You can link an earlier ride. Choose how it felt yourself; we do not infer this from your earlier feedback.",
  rideNote: "Linked ride note", outcome: "Ride felt", awaiting: "Ride with the adjustment and share how it feels.",
  unavailable: "Your advice changed. Reload the page and try again.",
  errors: { ADVICE_NOT_FOUND: "This advice is no longer available.", ADVICE_CHANGED: "The advice was recalculated. Review the new values and try again.",
    ADVICE_ALREADY_PERFORMED: "This adjustment was already saved. Reload the page to see its current status.",
    FEEDBACK_ALREADY_RECORDED: "Your ride feedback was already saved. Reload the page to view it.",
    INVALID_DATE: "Choose a valid date from the calculation date through today (UTC).", INVALID_NOTE: "Keep your note under 501 characters.",
    FEEDBACK_REQUIRES_PERFORMED: "First save when you made the adjustment.", INVALID_FEEDBACK: "Choose better, the same or worse.",
    AUTH_CHANGED: "Your account changed. Reload the page before saving.", generic: "Could not save. Please try again." },
};
export const getAdviceProgressCopy = (locale: Locale) => locale === "nl" ? nl : en;
