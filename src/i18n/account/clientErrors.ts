import type { Locale } from "@/i18n/config";

const dutchErrors: Record<string, string> = {
  "Please sign in to continue.": "Log in om verder te gaan.",
  "You are not allowed to perform this action.": "Je hebt geen toegang tot deze actie.",
  "Too many requests. Please wait and try again.": "Te veel verzoeken. Wacht even en probeer het opnieuw.",
  "Please check your input and try again.": "Controleer je invoer en probeer het opnieuw.",
};

export function localizeAccountError(message: string, locale: Locale): string {
  return locale === "nl" ? dutchErrors[message] ?? message : message;
}
