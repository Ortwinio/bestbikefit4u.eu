import type { DashboardMessages } from "@/i18n/dashboardMessages";
import type { Locale } from "@/i18n/config";

export function getSettingsLanguage(messages: DashboardMessages, locale: Locale): DashboardMessages {
  if (locale !== "nl") return messages;
  return {
    ...messages,
    settings: {
      ...messages.settings,
      billing: {
        ...messages.settings.billing,
        description: "Beheer je betaalmethode, facturen en opzegging bij Stripe. " +
          "Wijzigingen gelden zodra Stripe ze heeft verwerkt.",
      },
    },
  };
}
