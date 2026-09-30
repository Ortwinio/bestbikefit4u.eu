import type { Locale } from "@/i18n/config";

const fitMethod = {
  nl: {
    back: "Terug naar je bikefit",
    eyebrow: "Zo werkt je bikefit",
    title: "Van jouw maten naar jouw afstelling.",
    description: "Je lichaamsmaten, hoe je beweegt en hoe je fietst vormen samen het startpunt. Daarna test je het advies op je eigen fiets.",
    stages: ["Meten", "Berekenen", "Afstellen en testen"],
    inputsTitle: "Wat nemen we mee?",
    inputs: [
      { title: "Je lichaamsmaten", description: "Lengte, binnenbeenlengte, romp, armen, schouders en bovenbenen. Binnenbeenlengte helpt vooral bij je zadelhoogte; romp en armen bij de afstand tot je stuur." },
      { title: "Hoe je beweegt", description: "Flexibiliteit, rompstabiliteit en comfort helpen bepalen welke houding je kunt volhouden." },
      { title: "Hoe je fietst", description: "Je ervaring, rijtijd, ritafstand en voorkeur voor comfort of prestatie tellen mee." },
      { title: "Hoe je nu zit", description: "Je fietstype, terrein en antwoorden over je huidige positie geven de nodige context bij je maten." },
    ],
    processTitle: "Zo komt je advies tot stand",
    steps: [
      { title: "Begin bij de zadelhoogte", description: "Je binnenbeenlengte is de basis. Fietstype, flexibiliteit, rompstabiliteit en je doel helpen deze maat afstemmen." },
      { title: "Bepaal je stuurpositie", description: "Je lichaamsmaten, flexibiliteit en rompstabiliteit helpen de afstand en het hoogteverschil tot je stuur bepalen. Romp- en armlengte verfijnen de afstand als je die hebt gemeten." },
      { title: "Stem af op jouw ritten", description: "Je voorkeur en ritcontext bepalen of je advies meer op comfort of op prestatie gericht is." },
      { title: "Neem je comfort mee", description: "Waar je ongemak ervaart helpt bepalen welke onderdelen van je houding aandacht nodig hebben." },
      { title: "Controleer de uitkomsten", description: "De berekening begrenst afstelmaten en controleert je gegevens en uitkomsten. Aandachtspunten verschijnen als waarschuwing bij je advies." },
    ],
    outputsTitle: "Wat vind je terug in je advies?",
    outputs: [
      { title: "Zadelhoogte", description: "Van het midden van de trapas tot de zadeltop, langs de zitbuis." },
      { title: "Zadelterugstand", description: "De horizontale afstand van de trapas tot de zadelneus." },
      { title: "Stuurdrop", description: "Het hoogteverschil tussen de zadeltop en het stuur." },
      { title: "Reach", description: "De horizontale afstand van de zadelneus tot het midden van je stuur." },
      { title: "Je stuurpen", description: "Een lengte en hoek die helpen de geadviseerde stuurpositie te bereiken." },
      { title: "Schoenplaatjes", description: "Advies over de positie van je schoenplaatjes, passend bij je fietstype en doel." },
    ],
    tipsTitle: "Maak je volgende meting scherper",
    tips: [
      "Meet binnenbeenlengte en romp opnieuw als een uitkomst vreemd voelt.",
      "Werk je profiel bij als je gewicht, flexibiliteit of rijdoelen veranderen.",
      "Houd je flexibiliteits- en rompstabiliteitsscores bij als je conditie verandert.",
      "Beschrijf waar en wanneer je ongemak voelt zo precies mogelijk.",
    ],
    adaptationBefore: "Geef een nieuwe positie",
    adaptationAfter: "ritten voordat je conclusies trekt.",
  },
  en: {
    back: "Back to your bike fit",
    eyebrow: "How your bike fit works",
    title: "From your measurements to your setup.",
    description: "Your measurements, movement and riding habits form the starting point. Then you test the advice on your own bike.",
    stages: ["Measure", "Calculate", "Adjust and test"],
    inputsTitle: "What do we take into account?",
    inputs: [
      { title: "Your measurements", description: "Height, inseam, torso, arms, shoulders and thighs. Inseam mainly informs saddle height; torso and arms help determine the distance to your handlebar." },
      { title: "How you move", description: "Flexibility, core stability and comfort help determine a position you can sustain." },
      { title: "How you ride", description: "Your experience, riding time, ride distance and preference for comfort or performance all contribute." },
      { title: "Your current position", description: "Bike type, terrain and answers about your current position provide context for your measurements." },
    ],
    processTitle: "How your advice takes shape",
    steps: [
      { title: "Start with saddle height", description: "Your inseam is the starting point. Bike type, flexibility, core stability and your goal help refine this measurement." },
      { title: "Find your handlebar position", description: "Your body measurements, flexibility and core stability help determine handlebar distance and drop. Torso and arm measurements refine the distance when available." },
      { title: "Adapt to your rides", description: "Your preferences and riding context determine whether your advice focuses more on comfort or performance." },
      { title: "Consider your comfort", description: "Where you feel discomfort helps identify parts of your position that need attention." },
      { title: "Check the results", description: "The calculation limits setup measurements and checks your data and results. Points needing attention appear as warnings alongside your advice." },
    ],
    outputsTitle: "What is included in your advice?",
    outputs: [
      { title: "Saddle height", description: "From the centre of the bottom bracket to the saddle top, along the seat tube." },
      { title: "Saddle setback", description: "The horizontal distance from the bottom bracket to the saddle nose." },
      { title: "Handlebar drop", description: "The height difference between the saddle top and the handlebar." },
      { title: "Reach", description: "The horizontal distance from the saddle nose to the centre of your handlebar." },
      { title: "Your stem", description: "A length and angle that help achieve the advised handlebar position." },
      { title: "Cleats", description: "Advice on cleat position based on your bike type and goal." },
    ],
    tipsTitle: "Make your next measurement more accurate",
    tips: [
      "Measure your inseam and torso again if a result feels off.",
      "Update your profile when your weight, flexibility or riding goals change.",
      "Keep your flexibility and core stability scores up to date as your fitness changes.",
      "Describe where and when you feel discomfort as precisely as possible.",
    ],
    adaptationBefore: "Give a new position",
    adaptationAfter: "rides before drawing conclusions.",
  },
};

export function getFitMethodCopy(locale: Locale) {
  return fitMethod[locale];
}
