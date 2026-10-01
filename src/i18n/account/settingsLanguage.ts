import type { DashboardMessages } from "@/i18n/dashboardMessages";
import type { Locale } from "@/i18n/config";

export const settingsDutch = {
  noRecentRides: "Geen recente ritten",
  syncError: "Strava synchroniseren is niet gelukt. Probeer het opnieuw.",
  recentRides: "{count} ritten in de afgelopen 90 dagen",
};

export function localizeStravaUsage(explanation: string, locale: string): string {
  const match = explanation.match(/^(\d+) rides in the last 90 days$/);
  return locale.startsWith("nl") && match
    ? settingsDutch.recentRides.replace("{count}", match[1]) : explanation;
}

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
      integrations: {
        ...messages.settings.integrations,
        bikeImport: {
          ...messages.settings.integrations.bikeImport,
          summaryReady: "{count} klaar voor afstelling",
          overviewReadyLabel: "Klaar voor afstelling",
          overviewAttentionNote: "Controleer het fietstype of de afstelling",
          fitReady: "Klaar voor afstelling",
          needsFitSetup: "Afstelling nodig",
          blockedDescription: "Fietsen importeren uit Strava is nu niet beschikbaar.",
          backendBlocked: "De gegevens die nodig zijn om je fietsen te importeren zijn niet beschikbaar.",
          parseError: "Je Strava-fietsgegevens konden niet worden gelezen.",
          emptyDescription: "Er zijn geen fietsen gevonden die je kunt importeren uit Strava.",
          resetSelection: "Selectie wissen",
        },
      },
    },
  };
}
