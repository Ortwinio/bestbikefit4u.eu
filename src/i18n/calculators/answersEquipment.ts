const nl = {
  saddle: {
    answer: "Begin bij je zitbotbreedte en rijhouding. De calculator geeft een startbreedte en een bereik om op de fiets te testen.",
    method: "De calculator gebruikt je gemeten zitbotbreedte of schat die uit lengte, gewicht en heupomtrek. "
      + "Rijhouding en fietstype passen de steunbreedte aan. Daarna kiest de tool een praktisch "
      + "breedtebereik.",
    limits: "Dit is een startpunt om zadels te vergelijken, geen garantie op comfort. Vorm, uitsparing, "
      + "kanteling en positie tellen ook mee. Een lichaamsmeting is geen directe zitbotmeting.",
    mistakes: [
      "De afstand tussen de buitenranden meten in plaats van tussen de middelpunten van de afdrukken.",
      "Een geschatte zitbotbreedte als gemeten invoeren.",
      "Alleen naar breedte kijken en vorm of zadelpositie overslaan.",
    ],
    labels: ["Invoermethode", "Zitbotbreedte", "Gebruik", "Houding", "Startbreedte", "Breedtebereik"],
    values: ["Gemeten", "Endurance racefiets", "Gebalanceerd"],
  },
  gearing: {
    answer: "Je lichtste verzet combineert het kleinste kettingblad met de grootste krans. Met 50/34 voor en "
      + "11–34 achter is de lichtste verhouding {ratio}. Bij {cadence} omwentelingen per minuut rijdt dit "
      + "voorbeeld {speed} km/u.",
    method: "Voor de cadansschatting gebruiken we 85% van je eerder ingevulde FTP, of schatten we FTP op "
      + "3 W/kg als die ontbreekt. Met je gewicht, helling en vaste aannames voor fietsgewicht (9 kg), "
      + "rolweerstand en luchtweerstand berekenen we een modelsnelheid. De wielomtrek (2,1 m) en het aantal "
      + "tanden voor gedeeld door achter zetten die snelheid om in cadans. Het rekenvoorbeeld hieronder "
      + "laat apart zien hoe verzet en een vaste cadans de snelheid bepalen.",
    limits: "De cadans is een modelschatting, geen voorspelling van wat je kunt volhouden. Zonder eigen "
      + "invoer nemen we 75 kg en 10% helling aan. Wind, je werkelijke fietsweerstand, vermoeidheid en "
      + "klimduur worden niet gemeten. Het losse snelheidsvoorbeeld beoordeelt geen persoonlijke belastbaarheid.",
    mistakes: [
      "Banddiameter invullen waar wielomtrek wordt gevraagd.",
      "De lichtste verhouding verwarren met de grootste krans alleen.",
      "De berekende snelheid lezen als haalbare klimsnelheid zonder rekening te houden met je vermogen.",
    ],
    labels: [
      "Aandrijving",
      "Kettingbladen",
      "Cassette",
      "Wielomtrek",
      "Cadans",
      "Fietstype",
      "Helling",
      "Klimlengte",
      "Lichtste verhouding",
      "Afstand per omwenteling",
      "Snelheid in lichtste verzet",
    ],
    values: ["Racefiets", "Middellang"],
  },
  pressure: {
    answer: "Voor de racefiets in dit voorbeeld adviseert de basiscalculator {front} bar voor en {rear} bar "
      + "achter. Gebruik dit als startpunt en controleer altijd de limieten van band en velg.",
    method: "De basiscalculator verdeelt het gewicht van rijder en fiets voor 40% over het voorwiel en voor 60% "
      + "over het achterwiel. Bandbreedte, fietstype, ondergrond, bandtype en rijdoel passen het drukadvies "
      + "aan.",
    limits: "De gewichtsverdeling is een aanname, geen meting aan jouw fiets. De basisberekening kent je "
      + "velglimiet en bandkarkas niet. Controleer de toegestane combinatie van band en velg, vooral bij "
      + "hookless, voordat je de druk instelt.",
    mistakes: [
      "Alleen de maat op de zijwand gebruiken terwijl je gemeten bandbreedte daarvan afwijkt.",
      "Bar en psi verwisselen.",
      "Een advies overnemen zonder de maximale druk van band en velg te controleren.",
    ],
    labels: [
      "Gewicht rijder",
      "Gewicht fiets",
      "Bandbreedte voor / achter",
      "Fietstype",
      "Bandtype",
      "Ondergrond",
      "Rijdoel",
      "Aangenomen gewichtsverdeling",
      "Druk voor",
      "Druk achter",
    ],
    values: ["Racefiets", "Tubeless", "Gemiddeld asfalt", "Balans", "40% voor / 60% achter"],
  },
};
type EquipmentCopy = { [K in keyof typeof nl]: { [P in keyof typeof nl[K]]: typeof nl[K][P] } };
const en: EquipmentCopy = {
  saddle: {
    answer: "Start with your sit-bone width and riding posture. The calculator gives a starting width and a range to test on your bike.",
    method: "The calculator uses your measured sit-bone width or estimates it from height, weight and hip "
      + "circumference. Posture and riding type adjust the support width. The tool then selects a practical "
      + "width range.",
    limits: "This is a starting point for comparing saddles, not a comfort guarantee. Shape, cutout, tilt and "
      + "position also matter. Body measurements are not a direct sit-bone measurement.",
    mistakes: [
      "Measuring between the outer edges instead of the centres of the impressions.",
      "Entering an estimated sit-bone width as measured.",
      "Considering width alone and overlooking shape or saddle position.",
    ],
    labels: ["Input method", "Sit-bone width", "Riding type", "Posture", "Starting width", "Width range"],
    values: ["Measured", "Endurance road", "Balanced"],
  },
  gearing: {
    answer: "Your easiest gear pairs the smallest chainring with the largest cassette cog. With 50/34 "
      + "chainrings and an 11–34 cassette, the easiest ratio is {ratio}. At {cadence} rpm, this example gives "
      + "{speed} km/h.",
    method: "To estimate cadence, we use 85% of your previously entered FTP, or estimate FTP at 3 W/kg "
      + "when it is missing. Your weight, gradient and fixed assumptions for bike weight (9 kg), rolling "
      + "resistance and aerodynamic drag give a modelled speed. Wheel circumference (2.1 m) and the front "
      + "tooth count divided by the rear tooth count convert that speed to cadence. The worked example "
      + "below separately shows how gearing and a fixed cadence determine speed.",
    limits: "Cadence is a model estimate, not a prediction of what you can sustain. Without your own input, "
      + "we assume 75 kg and a 10% gradient. Wind, your actual bike resistance, fatigue and climb duration "
      + "are not measured. The separate speed example does not assess personal capacity.",
    mistakes: [
      "Entering wheel diameter instead of wheel circumference.",
      "Treating the largest cassette cog alone as the easiest gear ratio.",
      "Reading calculated speed as achievable climbing speed without considering your power.",
    ],
    labels: [
      "Drivetrain",
      "Chainrings",
      "Cassette",
      "Wheel circumference",
      "Cadence",
      "Bike type",
      "Gradient",
      "Climb length",
      "Easiest ratio",
      "Distance per revolution",
      "Speed in easiest gear",
    ],
    values: ["Road", "Medium"],
  },
  pressure: {
    answer: "For the road bike in this example, the basic calculator recommends {front} bar front and {rear} "
      + "bar rear. Use this as a starting point and always check tyre and rim limits.",
    method: "The basic calculator distributes rider and bike weight 40% to the front wheel and 60% to the rear. "
      + "Tyre width, discipline, surface, tyre type and riding goal adjust the pressure recommendation.",
    limits: "Weight distribution is an assumption, not a measurement of your bike. The basic calculation does "
      + "not know your rim limit or tyre casing. Check the permitted tyre and rim combination, especially "
      + "with hookless rims, before setting pressure.",
    mistakes: [
      "Using only the sidewall size when the measured tyre width differs.",
      "Confusing bar and psi.",
      "Following a recommendation without checking tyre and rim pressure limits.",
    ],
    labels: [
      "Rider weight",
      "Bike weight",
      "Front / rear tyre width",
      "Discipline",
      "Tyre type",
      "Surface",
      "Riding goal",
      "Assumed weight distribution",
      "Front pressure",
      "Rear pressure",
    ],
    values: ["Road", "Tubeless", "Average asphalt", "Balance", "40% front / 60% rear"],
  },
};
export const equipmentAnswerMessages = { nl, en };
