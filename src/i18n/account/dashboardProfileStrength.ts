import type { Locale } from "@/i18n/config";

const nl = {
  title: "Je riderprofiel", loading: "Je profielscores laden…",
  description: "Gemeten waarden tellen zwaarder dan geschatte. Je scores laten zien wat je al hebt ingevuld en hoe zeker die gegevens zijn.",
  next: "Grootste mogelijke winst", gain: "punten betrouwbaarheid", upTo: "Tot",
  check: "Vul dit gegeven aan of controleer de meetwijze. De echte winst hangt af van hoe je het vaststelt.",
  complete: "Je gegevens zijn compleet", completeDetail: "Controleer je gegevens opnieuw als er iets verandert.",
  profile: "Bekijk alle gegevens", explanation: "Hoe werkt je profielscore?",
};
const en: typeof nl = {
  title: "Your rider profile", loading: "Loading your profile scores…",
  description: "Measured values carry more weight than estimates. Your scores show what you have filled in and how certain those inputs are.",
  next: "Largest possible gain", gain: "reliability points", upTo: "Up to",
  check: "Add this detail or check how it was measured. The actual gain depends on how you establish the value.",
  complete: "Your details are complete", completeDetail: "Check your details again when something changes.",
  profile: "View all details", explanation: "How does your profile score work?",
};
export const getDashboardProfileStrengthCopy = (locale: Locale) => locale === "nl" ? nl : en;
