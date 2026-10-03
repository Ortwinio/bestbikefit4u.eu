const nl = {
  labels: {
    height: "Lichaamslengte", inseam: "Gemeten binnenbeen", category: "Fietstype", road: "Racefiets",
    goal: "Rijdoel", balanced: "Balans tussen comfort en prestatie", flexibility: "Lenigheid (invoer op 5)",
    core: "Rompstabiliteit (invoer op 5)", missing: "Extra lichaamsmaten en fietsgeometrie",
    notProvided: "Niet opgegeven; de calculator gebruikt zijn standaardinschattingen",
    saddle: "Zadelhoogte vanaf het midden van de trapas", saddleRange: "Startbereik zadelhoogte",
    reach: "Afstand van zadel tot stuur", drop: "Hoogteverschil zadel tot stuur", crank: "Cranklengte",
    frame: "Globale framemaat", quickSaddle: "Snelle inschatting zadelhoogte",
  },
  tools: {
    "bike-fit": {
      answer: "Je lichaamslengte, binnenbeen en rijdoel geven een eerste richting voor je fietspositie. " +
        "Gebruik de uitkomst om je huidige afstelling te vergelijken en één wijziging tegelijk te testen.",
      method: "De calculator zet je maten om naar millimeters. Fietstype, rijdoel, lenigheid en rompstabiliteit " +
        "beïnvloeden de doelen voor zadelhoogte, afstand tot het stuur en drop.",
      limits: "Dit is een rekenmodel, geen beoordeling van hoe je beweegt op de fiets. Extra lichaamsmaten en " +
        "de geometrie van je eigen frame ontbreken in dit voorbeeld. Standaardinschattingen vullen die informatie aan.",
      mistakes: ["Binnenbeen verwarren met de lengte van je broek.",
        "Reach van het frame verwarren met de afstand van zadel tot stuur.",
        "Zadel en stuur tegelijk verplaatsen, zodat je niet merkt welke wijziging helpt."],
    },
    "saddle-height": {
      answer: "Je binnenbeen is het vertrekpunt voor je zadelhoogte. De calculator geeft een startwaarde " +
        "en een bereik om rustig te testen. Meet vanaf het midden van de trapas tot de bovenkant van het zadel.",
      method: "De berekening vermenigvuldigt je binnenbeen met een factor voor je fietstype. Daarna volgen " +
        "kleine correcties voor rijdoel, lenigheid en rompstabiliteit. De uitkomst wordt afgerond op millimeters.",
      limits: "Een rekenwaarde bewijst niet dat een hoogte voor jou comfortabel is. Je schoenen, pedalen en " +
        "beweging op de fiets worden hier niet gemeten. Test een kleine wijziging voordat je verder afstelt.",
      mistakes: ["Met schoenen aan je binnenbeen meten.", "Zadelhoogte vanaf de grond meten in plaats van vanaf de trapas.",
        "Een schatting invoeren alsof je die zorgvuldig hebt gemeten."],
    },
    "frame-size": {
      answer: "Je lengte en fietstype geven een globale framemaat om mee te beginnen. Vergelijk daarna de " +
        "stack en reach van concrete modellen: dezelfde maatnaam kan bij een ander merk anders uitvallen.",
      method: "De calculator kiest een maatbereik uit een tabel op basis van lichaamslengte en fietstype. " +
        "Je binnenbeen wordt apart gebruikt voor een snelle inschatting van je zadelhoogte; het verandert deze maattabel niet.",
      limits: "Dit bereik is geen koopadvies voor één frame. De calculator controleert hier geen geometrie, " +
        "overstaphoogte of verstelruimte van een bepaald model.",
      mistakes: ["Alleen op de maatsticker afgaan.", "Denken dat je binnenbeen in deze calculator de framemaat bepaalt.",
        "Een bestaand comfortabel frame niet meenemen in je vergelijking."],
    },
    "crank-length": {
      answer: "De calculator kiest een eerste cranklengte uit je binnenbeen en fietstype. Zie dit als een " +
        "startpunt om met je huidige crank te vergelijken, niet als een verplicht nieuw onderdeel.",
      method: "Je binnenbeen wordt in millimeters opgezocht in de cranklengtetabel van de calculator. " +
        "Voor sommige MTB-uitkomsten past de berekening een kortere crank toe voor extra bodemvrijheid.",
      limits: "De tabel beoordeelt geen heupbeweging, pedaalvrijheid of persoonlijke voorkeur op jouw fiets. " +
        "Controleer bij een andere cranklengte ook je zadelafstelling en de compatibiliteit van onderdelen.",
      mistakes: ["De lichaamslengte invoeren waar om binnenbeen wordt gevraagd.",
        "Een klein verschil met je huidige crank zien als bewijs dat die verkeerd is.",
        "Na een crankwissel de rest van je afstelling niet opnieuw controleren."],
    },
  },
};

type FitAnswerCopy = typeof nl;
const en: FitAnswerCopy = {
  labels: {
    height: "Height", inseam: "Measured inseam", category: "Bike type", road: "Road bike",
    goal: "Riding goal", balanced: "Balance of comfort and performance", flexibility: "Flexibility (input out of 5)",
    core: "Core stability (input out of 5)", missing: "Additional body measurements and frame geometry",
    notProvided: "Not supplied; the calculator uses its default estimates",
    saddle: "Saddle height from the bottom bracket centre", saddleRange: "Starting saddle-height range",
    reach: "Saddle-to-bar distance", drop: "Saddle-to-bar height difference", crank: "Crank length",
    frame: "Approximate frame size", quickSaddle: "Quick saddle-height estimate",
  },
  tools: {
    "bike-fit": {
      answer: "Your height, inseam and riding goal give an initial direction for your riding position. " +
        "Use the result to compare your current setup and test one change at a time.",
      method: "The calculator converts your measurements to millimetres. Bike type, riding goal, flexibility " +
        "and core stability influence the targets for saddle height, saddle-to-bar distance and drop.",
      limits: "This is a calculation model, not an assessment of how you move on the bike. Additional body " +
        "measurements and your frame geometry are absent from this example. Default estimates fill those gaps.",
      mistakes: ["Confusing inseam with trouser length.", "Confusing frame reach with saddle-to-bar distance.",
        "Moving the saddle and bars together, making it hard to tell which change helps."],
    },
    "saddle-height": {
      answer: "Your inseam is the starting point for saddle height. The calculator gives an initial value " +
        "and a range to test gradually. Measure from the bottom bracket centre to the top of the saddle.",
      method: "The calculation multiplies your inseam by a factor for your bike type. Small adjustments " +
        "follow for riding goal, flexibility and core stability. The result is rounded to millimetres.",
      limits: "A calculated value does not establish that a height is comfortable for you. Your shoes, pedals " +
        "and movement on the bike are not measured here. Test a small change before adjusting further.",
      mistakes: ["Measuring your inseam with shoes on.", "Measuring saddle height from the ground instead of the bottom bracket.",
        "Entering an estimate as though it were a careful measurement."],
    },
    "frame-size": {
      answer: "Your height and bike type give an approximate frame size to start with. Then compare the " +
        "stack and reach of actual models: the same size label can mean different dimensions across brands.",
      method: "The calculator chooses a size range from a table using height and bike type. Your inseam is " +
        "used separately for a quick saddle-height estimate; it does not change this sizing table.",
      limits: "This range is not a purchase recommendation for a particular frame. The calculator does not " +
        "check the geometry, standover height or adjustment room of a specific model here.",
      mistakes: ["Relying only on the size label.", "Assuming your inseam determines frame size in this calculator.",
        "Leaving a comfortable existing frame out of your comparison."],
    },
    "crank-length": {
      answer: "The calculator selects an initial crank length from your inseam and bike type. Treat it as " +
        "a starting point to compare with your current crank, not a requirement to buy a new component.",
      method: "Your inseam in millimetres is looked up in the calculator's crank-length table. For some MTB " +
        "results, the calculation selects a shorter crank for additional ground clearance.",
      limits: "The table does not assess hip movement, pedal clearance or your preferences on your own bike. " +
        "When changing crank length, also check saddle setup and component compatibility.",
      mistakes: ["Entering height when the calculator asks for inseam.",
        "Treating a small difference from your current crank as proof that it is wrong.",
        "Failing to check the rest of your setup after changing cranks."],
    },
  },
};

export const answersFit = { nl, en };
export type FitAnswerTool = keyof FitAnswerCopy["tools"];
