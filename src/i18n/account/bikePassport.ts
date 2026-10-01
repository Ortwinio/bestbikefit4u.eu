import type { Locale } from "@/i18n/config";

const bikePassport = {
  nl: {
    descriptionLabel: "Beschrijving",
    descriptionPlaceholder: "De gedeelde beschrijving staat hier. Je kunt die aanpassen voor je eigen fiets.",
  },
  en: {
    descriptionLabel: "Description",
    descriptionPlaceholder: "The shared description appears here. You can edit it for your own bike.",
  },
};

export const getBikePassportCopy = (locale: Locale) => bikePassport[locale];
