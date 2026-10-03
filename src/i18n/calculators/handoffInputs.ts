import type { Locale } from "@/i18n/config";

interface HandoffInputMessages {
  currentCrank: string;
  currentSaddle: string;
  optional: string;
}
export const handoffInputMessages: Record<Locale, HandoffInputMessages> = {
  nl: {
    currentCrank: "Je huidige cranklengte (mm)",
    currentSaddle: "Je huidige zadelmodel",
    optional: "Optioneel. Vul alleen in wat je weet van je eigen fiets.",
  },
  en: {
    currentCrank: "Your current crank length (mm)",
    currentSaddle: "Your current saddle model",
    optional: "Optional. Only enter what you know about your own bike.",
  },
};
