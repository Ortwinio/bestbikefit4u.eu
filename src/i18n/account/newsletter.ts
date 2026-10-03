import type { Locale } from "@/i18n/config";

const nl = {
  title: "Nieuwsbrief", signupLabel: "Stuur mij de nieuwsbrief",
  description: "Ontvang de nieuwsbrief van BestBikeFit4U met nieuws en fietstips. Optioneel; je kunt je op elk moment afmelden.",
  confirmationLabel: "Ja, stuur mij de nieuwsbrief voor dit account",
  confirmTitle: "Bevestig je nieuwsbriefkeuze", confirmText: "Wil je de nieuwsbrief ontvangen op het e-mailadres waarmee je nu bent ingelogd?",
  confirm: "Ja, stuur mij de nieuwsbrief", skip: "Niet nu", saving: "Nieuwsbriefkeuze opslaan…", retry: "Probeer opnieuw",
  storageNotice: "Je optionele nieuwsbriefkeuze kon niet worden onthouden. Je kunt de nieuwsbrief later inschakelen in je profiel.",
  emailUnavailable: "We kunnen je ingelogde e-mailadres nu niet bevestigen. Je kunt de nieuwsbrief later inschakelen in je profiel.",
  save: "Bewaar nieuwsbriefvoorkeur", saved: "Je nieuwsbriefvoorkeur is opgeslagen.",
  loading: "Nieuwsbriefvoorkeur laden…", error: "Opslaan is niet gelukt. Je keuze blijft staan. Probeer opnieuw.",
  loginRequired: "Log in om je nieuwsbriefvoorkeur te beheren.",
};
const en: Record<keyof typeof nl, string> = {
  title: "Newsletter", signupLabel: "Send me the newsletter",
  description: "Receive the BestBikeFit4U newsletter with news and cycling tips. Optional; you can unsubscribe at any time.",
  confirmationLabel: "Yes, send me the newsletter for this account",
  confirmTitle: "Confirm your newsletter choice", confirmText: "Would you like the newsletter sent to the email address you are currently signed in with?",
  confirm: "Yes, send me the newsletter", skip: "Not now", saving: "Saving newsletter choice…", retry: "Try again",
  storageNotice: "Your optional newsletter choice could not be remembered. You can enable the newsletter later in your profile.",
  emailUnavailable: "We cannot confirm your signed-in email address right now. You can enable the newsletter later in your profile.",
  save: "Save newsletter preference", saved: "Your newsletter preference has been saved.",
  loading: "Loading newsletter preference…", error: "We couldn’t save this. Your choice is still here. Please try again.",
  loginRequired: "Sign in to manage your newsletter preference.",
};
export const newsletterCopy = { nl, en };
export function getNewsletterCopy(locale: Locale) { return newsletterCopy[locale]; }
