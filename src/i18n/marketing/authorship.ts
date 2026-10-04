import type { Locale } from "@/i18n/config";

interface AuthorshipCopy {
  methodsTitle: string;
  methodsDescription: string;
  intro: string;
  scientificTitle: string;
  scientificBody: string;
  practiceTitle: string;
  practiceBody: string;
  ownTitle: string;
  ownBody: string;
  pressureRule: string;
  limits: string;
  strength: string;
  limit: string;
  sourceLink: string;
  engineLink: string;
  methodsLink: string;
  pressureLink: string;
}
export const authorshipMessages: Record<Locale, AuthorshipCopy> = {
  nl: {
    methodsTitle: "Bronnen en rekenmethodes | BikeFitBoost",
    methodsDescription: "Hoe BikeFitBoost wetenschappelijke bronnen, praktijkreferenties en eigen rekenregels gebruikt.",
    intro: "Een bron, een praktijkmethode en een rekenregel zijn niet hetzelfde. Hieronder zie je welke rol ze hebben "
      + "in onze uitleg en calculators. Een verwijzing betekent niet dat alle uitkomsten wetenschappelijk zijn gevalideerd.",
    scientificTitle: "Wetenschappelijke bronnen",
    scientificBody: "De voedingscalculator vermeldt onderstaande publicaties bij koolhydraten en vocht. "
      + "Lees de doelgroep en beperkingen in de bron; een richtlijn is geen persoonlijke meting.",
    practiceTitle: "Praktijkreferenties",
    practiceBody: "Deze vergelijking komt uit onze uitleg over bikefit-methodes. Formules en referentiepunten geven "
      + "een startpunt. Een dynamische meting vraagt een andere werkwijze dan onze online invoer.",
    ownTitle: "Onze eigen rekenregels en aannames",
    ownBody: "Onze software kiest ook vaste aannames en correcties. Die keuzes maken een berekening uitvoerbaar, "
      + "maar zijn geen afzonderlijke onderzoeksresultaten. De calculators tonen hun invoer, methode en beperkingen.",
    pressureRule: "De basisberekening voor bandenspanning verdeelt rijder- en fietsgewicht voor 40% over het voorwiel "
      + "en voor 60% over het achterwiel. Zonder ingevuld fietsgewicht gebruikt de code 8 kg. "
      + "Dit zijn modelaannames, geen metingen van jouw fiets.",
    limits: "Controleer je invoer en test veranderingen stap voor stap. Een berekend startpunt vervangt geen "
      + "observatie op de fiets. Controleer bij bandenspanning ook de toegestane band- en velgcombinatie en druklimieten.",
    strength: "Bruikbaar voor", limit: "Beperking", sourceLink: "Bekijk de bron",
    engineLink: "Hoe de rekenengine werkt", methodsLink: "Vergelijk bikefit-methodes",
    pressureLink: "Bekijk de bandenspanningcalculator",
  },
  en: {
    methodsTitle: "Sources and calculation methods | BikeFitBoost",
    methodsDescription: "How BikeFitBoost uses scientific sources, practice references and its own calculation rules.",
    intro: "A source, a practical method and a calculation rule are different things. Below we explain their roles "
      + "in our guidance and calculators. A citation does not mean every output has been scientifically validated.",
    scientificTitle: "Scientific sources",
    scientificBody: "The nutrition calculator cites the publications below for carbohydrates and fluids. "
      + "Check the population and limitations in each source; a guideline is not a personal measurement.",
    practiceTitle: "Practice references",
    practiceBody: "This comparison comes from our explanation of bike fitting methods. Formulas and reference "
      + "points provide a starting point. Dynamic measurement requires a different process from our online inputs.",
    ownTitle: "Our calculation rules and assumptions",
    ownBody: "Our software also selects fixed assumptions and adjustments. These choices make calculation possible, "
      + "but they are not separate research findings. The calculators show their inputs, methods and limitations.",
    pressureRule: "The basic tyre pressure calculation assigns 40% of rider and bike weight to the front wheel "
      + "and 60% to the rear. When bike weight is not supplied, the code uses 8 kg. "
      + "These are model assumptions, not measurements of your bike.",
    limits: "Check your inputs and test changes step by step. A calculated starting point does not replace "
      + "observation on the bike. For tyre pressure, also check the permitted tyre and rim combination and pressure limits.",
    strength: "Useful for", limit: "Limitation", sourceLink: "Read the source",
    engineLink: "How the calculation engine works", methodsLink: "Compare bike fitting methods",
    pressureLink: "Open the tyre pressure calculator",
  },
};
