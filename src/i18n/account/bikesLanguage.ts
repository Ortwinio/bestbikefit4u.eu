import type { Locale } from "@/i18n/config";
import { getDashboardMessages } from "@/i18n/dashboardMessages";

type Messages = ReturnType<typeof getDashboardMessages>;

const en = {
  gearing: "Gearing",
  drivetrain: "Drivetrain",
  frontChainring: "Front chainring",
  innerChainring: "Inner chainring",
  wheelCircumference: "Wheel circumference",
  cassetteTeeth: "Cassette teeth",
  groupset: "Groupset",
  rearDerailleurMaxCog: "Rear derailleur max cog",
};
const nl: typeof en = {
  gearing: "Versnellingen",
  drivetrain: "Aandrijving",
  frontChainring: "Buitenste kettingblad",
  innerChainring: "Binnenste kettingblad",
  wheelCircumference: "Wielomtrek",
  cassetteTeeth: "Tanden per cassettetandwiel",
  groupset: "Schakelgroep",
  rearDerailleurMaxCog: "Grootste tandwiel voor achterderailleur",
};

export const getBikesLanguageCopy = (locale: Locale) => locale === "nl" ? nl : en;

/** Scoped overrides keep the shared dictionaries frozen and English unchanged. */
export function getBikeLanguageMessages(locale: Locale, messages: Messages): Messages {
  if (locale !== "nl") return messages;
  const passport = messages.bikeForm.passportImport;
  return {
    ...messages,
    bikeTypes: {
      ...messages.bikeTypes,
      road: { ...messages.bikeTypes.road, description: "Racestuur, geometrie voor lange ritten of wedstrijden" },
    },
    bikes: {
      ...messages.bikes,
      identity: {
        ...messages.bikes.identity,
        passportLabel: "Fietspas-ID",
        passportDescription:
          "Deel deze ID met een andere fietser. Die kan een eigen bewerkbare kopie van je fiets maken. " +
          "Wijzigingen aan die kopie veranderen jouw fiets nooit.",
        passportMissing: "De fietspas-ID is nog niet beschikbaar.",
        passportCopied: "Fietspas-ID gekopieerd.",
        passportCopyFailed: "De fietspas-ID kon niet worden gekopieerd.",
      },
    },
    bikeForm: {
      ...messages.bikeForm,
      createChooser: {
        ...messages.bikeForm.createChooser,
        passport: {
          title: "Gebruik een fietspas-ID",
          description: "Plak de fietspas-ID van een andere fietser en maak je eigen bewerkbare kopie.",
          cta: "Gebruik een fietspas-ID",
        },
      },
      passportImport: {
        ...passport,
        entryCta: "Gebruik een fietspas-ID",
        title: "Importeer een fiets met een fietspas-ID",
        description: "Plak een gedeelde fietspas-ID. Bekijk de fietsgegevens en maak je eigen bewerkbare kopie.",
        entryTitle: "Plak een fietspas-ID",
        entryDescription:
          "Met een gedeelde fietspas-ID maak je een kopie van de fiets van een andere fietser. " +
          "Je wordt geen eigenaar van de oorspronkelijke fiets.",
        confirmationDescription:
          "Je voegt een nieuwe fiets toe aan je eigen garage. Je kunt die daarna bewerken. " +
          "De oorspronkelijke fiets van de andere fietser blijft ongewijzigd.",
        photoCopied: "Dit voorbeeld toont de gedeelde hoofdfoto van de fiets als die beschikbaar is.",
        photoMissing: "Er is geen gedeelde fietsfoto beschikbaar voor dit voorbeeld.",
        copyCard: {
          ...passport.copyCard,
          eyebrow: "Veilig delen tussen fietsers",
          title: "Met een fietspas-ID maak je een persoonlijke kopie",
          shareableId: "De andere fietser hoeft alleen de fietspas-ID te delen.",
        },
        loading: { ...passport.loading, preview: "Voorbeeld van de fiets laden..." },
        actions: {
          ...passport.actions,
          previewLoading: "Voorbeeld laden...",
          startOver: "Gebruik een andere fietspas-ID",
        },
        fields: {
          passportId: {
            ...passport.fields.passportId,
            label: "Fietspas-ID",
            helper: "Plak de fietspas-ID precies zoals die met je is gedeeld. Letters en cijfers zijn toegestaan.",
          },
        },
        errors: {
          ...passport.errors,
          title: "Importeren via een fietspas vraagt aandacht",
          previewFailed: "Het voorbeeld van de fiets kon niet worden geladen. Probeer het opnieuw.",
          backendUnavailable: "Importeren via een fietspas is hier nog niet beschikbaar.",
          invalidPassport: "Gebruik een geldige fietspas-ID. Alleen letters, cijfers en koppeltekens zijn toegestaan.",
          notFound: "We vonden geen fiets voor deze fietspas-ID. Controleer de ID en probeer het opnieuw.",
          alreadyOwned: "Deze fietspas hoort al bij een fiets van jou. Je hoeft die niet opnieuw te importeren.",
        },
      },
    },
  };
}
