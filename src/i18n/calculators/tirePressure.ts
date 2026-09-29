export const tirePressureMessages = {
  en: {
    eyebrow: "Tire pressure · your starting point",
    title: "More grip, less resistance",
    intro: "Example values are filled in. Adjust them for your bike and the ride ahead.",
    body: "You and your bike",
    tires: "Your tires",
    route: "Your ride",
    example: "Example starting pressure",
    result: "Your starting pressure",
    linked: "Same width front and rear",
    advanced: "Refine bike weight and riding goal",
    unset: "No preference",
    limit:
      "Always check the maximum pressure marked on your tire and rim, especially with hookless rims. " +
      "Never exceed the lower of those limits.",
    excluded:
      "This basic calculation does not include internal rim width, casing construction or " +
      "wet conditions. " +
      "Use your account for a more detailed setup.",
    adjustment: "Test and refine",
    steps: [
      "Check the tire and rim limits before inflating.",
      "Start here and test changes of 0.1 bar at a time.",
      "Check grip and comfort on the front tire first.",
    ],
    save: "Continue with your bike",
    saveText: "Sign in to build a tire setup for your bike and include more details.",
    warning: "Check your setup",
    error: "Check your measurements before using the result.",
    summary: "Pressure recommendation",
    related: "Related tools and guides",
    gauge: "Recommended pressure",
    scope: "What this calculation covers",
    scale:
      "The meter shows the pressure range for your discipline, not a tire or rim safety limit.",
    preset: {
      road: "Road tire pressure",
      gravel: "Gravel tire pressure",
      mtb: "MTB tire pressure",
    },
  },
  nl: {
    eyebrow: "Bandenspanning · jouw startpunt",
    title: "Meer grip, minder weerstand",
    intro: "Voorbeeldwaarden ingevuld. Pas ze aan voor jouw fiets en de rit die je gaat maken.",
    body: "Jij en je fiets",
    tires: "Je banden",
    route: "Je rit",
    example: "Voorbeeld bandenspanning",
    result: "Jouw bandenspanning",
    linked: "Gelijk voor en achter",
    advanced: "Verfijn fietsgewicht en rijdoel",
    unset: "Geen voorkeur",
    limit:
      "Controleer altijd de maximale druk op je band en velg, vooral bij hookless velgen. " +
      "Overschrijd nooit de laagste van die twee grenzen.",
    excluded:
      "Deze basisberekening neemt interne velgbreedte, karkasconstructie en nat weer niet mee. " +
      "Gebruik je account voor een uitgebreidere instelling.",
    adjustment: "Test en verfijn",
    steps: [
      "Controleer de limieten van band en velg voordat je oppompt.",
      "Begin hier en test veranderingen van 0,1 bar per keer.",
      "Controleer eerst grip en comfort op de voorband.",
    ],
    save: "Ga verder met jouw fiets",
    saveText:
      "Log in om een bandenconfiguratie voor je fiets op te bouwen en meer details mee te nemen.",
    warning: "Controleer je combinatie",
    error: "Controleer je maten voordat je de uitkomst gebruikt.",
    summary: "Bandenspanningsadvies",
    related: "Gerelateerde tools en gidsen",
    gauge: "Aanbevolen druk",
    scope: "Wat deze berekening meeneemt",
    scale:
      "De meter toont het drukbereik voor je discipline, niet de veiligheidslimiet van je " +
      "band of velg.",
    preset: {
      road: "Bandenspanning racefiets",
      gravel: "Bandenspanning gravelbike",
      mtb: "Bandenspanning MTB",
    },
  },
};
export type TirePressureCopy = typeof tirePressureMessages.en;
