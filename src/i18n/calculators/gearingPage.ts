export const gearingPageMessages = {
  nl: {
    description:
      "Schat je cadans op een klim met je lichtste verzet, helling en gewicht. Bekijk het onzekerheidsbereik.",
    sectionTitle: "Een schatting voor je lichtste verzet",
    sectionDescription:
      "Bekijk je geschatte cadans op de klim. De uitkomst is een modelberekening, geen meting tijdens het fietsen.",
    trustPoints: [
      {
        title: "Cadans op je klim",
        description:
          "Je kleinste voorblad, grootste tandwiel, helling en gewicht vormen de invoer voor je cadansschatting.",
      },
      {
        title: "Aannames zichtbaar",
        description:
          "De berekening gebruikt je bekende FTP, of een schatting op basis van je gewicht. Je ziet een onzekerheidsbereik.",
      },
      {
        title: "Pas je invoer aan",
        description:
          "Verander je verzet of de helling en bekijk hoe je geschatte cadans verandert.",
      },
    ],
  },
  en: {
    description:
      "Estimate climbing cadence from your easiest gear, gradient and weight. View the uncertainty range.",
    sectionTitle: "An estimate for your easiest gear",
    sectionDescription:
      "View your estimated climbing cadence. The result is a model calculation, not a measurement while riding.",
    trustPoints: [
      {
        title: "Cadence on your climb",
        description:
          "Your smallest chainring, largest sprocket, gradient and weight provide the inputs for your cadence estimate.",
      },
      {
        title: "Visible assumptions",
        description:
          "The calculation uses your known FTP, or an estimate based on your weight. You see an uncertainty range.",
      },
      {
        title: "Adjust your inputs",
        description:
          "Change your gearing or gradient and see how your estimated cadence changes.",
      },
    ],
  },
} as const;
