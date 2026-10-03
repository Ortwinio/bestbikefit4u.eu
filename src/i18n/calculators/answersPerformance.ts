export const performanceAnswerMessages = {
  nl: {
    labels: {
      rider: "Gewicht fietser", bikeMass: "Gewicht fiets", bike: "Fiets", road: "Racefiets, asfalt",
      gradient: "Helling", power: "Vermogen", speed: "Snelheid", distance: "Klimafstand", ftp: "FTP",
      time: "Geschatte klimtijd", testPower: "Gemiddeld vermogen test", method: "Testmethode",
      twentyMinute: "Test van 20 minuten", wattsPerKg: "Vermogen per kilogram", duration: "Ritduur",
      temperature: "Temperatuur", sweat: "Zweetprofiel", medium: "Gemiddeld", bottle: "Inhoud bidon",
      carbs: "Koolhydraten per uur, tot", fluid: "Vocht per uur", totalFluid: "Vocht voor de rit",
      sodium: "Natrium per liter", hour: "uur", minute: "min",
    },
    "power-speed": {
      answer: "Vermogen alleen bepaalt je snelheid niet. Je gewicht, fiets, ondergrond en helling tellen mee. " +
        "De calculator schat de snelheid bij je vermogen, of het vermogen dat je voor een snelheid nodig hebt.",
      method: "Het model telt de weerstand door lucht, rollen en klimmen op. Het zoekt vervolgens de snelheid " +
        "waarbij het ingevoerde vermogen bij die weerstand past. Fietstype en ondergrond bepalen de vaste modelaannames.",
      limits: "Dit is een berekening voor constante omstandigheden. Wind, bochten, verkeer en je werkelijke " +
        "houding kunnen je snelheid veranderen. De geschatte snelheid is geen belofte voor je volgende rit.",
      mistakes: ["Alleen lichaamsgewicht invullen en het fietsgewicht vergeten.",
        "Een korte vermogenspiek vergelijken met de gemiddelde snelheid van een hele rit.",
        "Een asfaltinstelling gebruiken voor een gravelroute."],
    },
    "climb-planner": {
      answer: "Plan een klim met afstand, gemiddelde helling, FTP, gewicht en fietstype. De calculator geeft " +
        "een richtvermogen en geschatte klimtijd. Gebruik die als startpunt voor je tempo.",
      method: "De klimafstand bepaalt de duurcategorie. Het model kiest daaruit een factor voor je FTP " +
        "en rekent met het richtvermogen terug naar snelheid en tijd. Het fietstype levert het standaard fietsgewicht.",
      limits: "Een gemiddelde helling verbergt steile stukken. Wind, wegdek, vermoeidheid en een onjuiste FTP " +
        "maken de tijd minder betrouwbaar. De duurcategorie is een modelregel, geen meting van je belastbaarheid.",
      mistakes: ["De afstand van de hele route gebruiken in plaats van de klimafstand.",
        "Een oude FTP gebruiken alsof die je huidige vorm beschrijft.",
        "Het richtvermogen als verplicht minimum behandelen op een slechte dag."],
    },
    "ftp-wkg": {
      answer: "W/kg is je FTP gedeeld door je lichaamsgewicht. Je kunt je bekende FTP invullen of een " +
        "schatting uit een test laten maken. Houd bij vergelijken altijd dezelfde testmethode aan.",
      method: "Bij een bekende FTP gebruikt de calculator dat vermogen direct. Bij een test past hij " +
        "de vaste factor voor de gekozen methode toe. Daarna deelt hij het resultaat door je gewicht.",
      limits: "Een testfactor is een schatting en past niet bij iedere fietser. W/kg zegt niet alles over " +
        "duurvermogen, techniek of snelheid. Vergelijk geen verschillende meetmethodes alsof ze gelijk zijn.",
      mistakes: ["Fietsgewicht optellen bij lichaamsgewicht voor W/kg.",
        "Het beste korte piekvermogen invullen als gemiddeld testvermogen.",
        "Een testschatting presenteren als gemeten FTP."],
    },
    "fuel-hydration": {
      answer: "Plan eten en drinken op basis van je ritduur. De calculator geeft een koolhydraatadvies " +
        "en een vochtbandbreedte. Temperatuur en je gekozen zweetprofiel plaatsen een richtpunt binnen die band.",
      method: "De ritduur kiest de koolhydraatcategorie. De vochtband wordt vermenigvuldigd met de ritduur " +
        "en omgerekend naar je bidoninhoud. Bij langere ritten toont het model ook natriumconcentratie.",
      limits: "Het zweetprofiel is je inschatting, geen zweetmeting. Het richtpunt is een modelregel. " +
        "De bandbreedte is geen verplicht drinkdoel; pas je plan aan je ervaring en omstandigheden aan.",
      mistakes: ["Een hoeveelheid per uur verwarren met het totaal voor de rit.",
        "Bidons tellen zonder hun inhoud te controleren.",
        "Een hoge koolhydraatinname voor het eerst tijdens een belangrijke rit proberen."],
    },
  },
  en: {
    labels: {
      rider: "Rider weight", bikeMass: "Bike weight", bike: "Bike", road: "Road bike, asphalt",
      gradient: "Gradient", power: "Power", speed: "Speed", distance: "Climb distance", ftp: "FTP",
      time: "Estimated climbing time", testPower: "Average test power", method: "Test method",
      twentyMinute: "20-minute test", wattsPerKg: "Power per kilogram", duration: "Ride duration",
      temperature: "Temperature", sweat: "Sweat profile", medium: "Medium", bottle: "Bottle capacity",
      carbs: "Carbohydrate per hour, up to", fluid: "Fluid per hour", totalFluid: "Fluid for the ride",
      sodium: "Sodium per litre", hour: "hours", minute: "min",
    },
    "power-speed": {
      answer: "Power alone does not determine speed. Your weight, bike, surface and gradient also matter. " +
        "The calculator estimates speed at your power, or the power required for a chosen speed.",
      method: "The model adds aerodynamic, rolling and climbing resistance. It then finds the speed " +
        "at which your input power matches that resistance. Bike type and surface set the fixed model assumptions.",
      limits: "This calculation assumes steady conditions. Wind, corners, traffic and your actual position " +
        "can change your speed. The estimate is not a promise for your next ride.",
      mistakes: ["Entering rider weight but forgetting bike weight.",
        "Comparing a brief power peak with average speed over an entire ride.",
        "Using asphalt settings for a gravel route."],
    },
    "climb-planner": {
      answer: "Plan a climb using distance, average gradient, FTP, weight and bike type. The calculator " +
        "provides target power and estimated climbing time. Use them as a starting point for pacing.",
      method: "Climb distance selects a duration category. The model chooses an FTP factor for that category " +
        "and converts target power into speed and time. Bike type supplies the default bike weight.",
      limits: "An average gradient hides steep sections. Wind, surface, fatigue and an inaccurate FTP " +
        "reduce the estimate’s reliability. The duration category is a model rule, not a measurement of your capacity.",
      mistakes: ["Using the whole route distance instead of the climb distance.",
        "Using an old FTP as if it described your current fitness.",
        "Treating target power as a compulsory minimum on a difficult day."],
    },
    "ftp-wkg": {
      answer: "W/kg is your FTP divided by your body weight. Enter a known FTP or estimate it from a test. " +
        "Use the same test method when comparing results.",
      method: "For a known FTP, the calculator uses that power directly. For a test, it applies the fixed " +
        "factor for the selected method. It then divides the result by your weight.",
      limits: "A test factor is an estimate and does not fit every rider. W/kg does not describe all of " +
        "your endurance, technique or speed. Different test methods are not interchangeable measurements.",
      mistakes: ["Adding bike weight to body weight when calculating W/kg.",
        "Entering a short power peak instead of average test power.",
        "Presenting a test estimate as a measured FTP."],
    },
    "fuel-hydration": {
      answer: "Plan food and drink around ride duration. The calculator provides carbohydrate guidance " +
        "and a fluid range. Temperature and your chosen sweat profile position a reference point within that range.",
      method: "Ride duration selects the carbohydrate category. The fluid range is multiplied by duration " +
        "and converted into bottles using your bottle capacity. For longer rides, the model also shows sodium concentration.",
      limits: "Your sweat profile is an estimate, not a sweat measurement. The reference point is a model rule. " +
        "The range is not a compulsory drinking target; adapt your plan to your experience and conditions.",
      mistakes: ["Confusing an hourly amount with the total for the ride.",
        "Counting bottles without checking their capacity.",
        "Trying a high carbohydrate intake for the first time on an important ride."],
    },
  },
} as const;
