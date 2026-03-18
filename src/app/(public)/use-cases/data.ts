import type { Locale } from "@/i18n/config";

export type UseCaseCopy = {
  seoTitle: string;
  seoDescription: string;
  seoKeywords: string[];
  cardTitle: string;
  cardDescription: string;
  h1: string;
  intro: string;
  challengesTitle: string;
  challenges: string[];
  solutionsTitle: string;
  solutions: string[];
  faqTitle: string;
  faqs: { q: string; a: string }[];
  relatedTitle: string;
  relatedLinks: { href: string; label: string }[];
  primaryCta: string;
};

export type UseCase = {
  slug: string;
  en: UseCaseCopy;
  nl: UseCaseCopy;
};

export const USE_CASES: UseCase[] = [
  {
    slug: "endurance-cycling-fit",
    en: {
      seoTitle: "Bike Fit for Endurance Cyclists | BestBikeFit4U",
      seoDescription: "Reduce fatigue and stay comfortable on long rides with a fit that supports steady power over hours in the saddle.",
      seoKeywords: ["endurance cycling bike fit", "long distance cycling position", "bike fit for long rides"],
      cardTitle: "Bike Fit for Endurance Cyclists",
      cardDescription: "Stay efficient and comfortable on rides that last for hours.",
      h1: "Bike Fit for Endurance Cyclists",
      intro: "Small setup errors become major comfort problems on long rides. An endurance-oriented fit helps you keep stable power, reduce pressure hotspots, and arrive fresher after several hours.",
      challengesTitle: "Common endurance fit problems",
      challenges: ["Hand numbness after two hours", "Saddle discomfort on long steady efforts", "Lower-back fatigue from too much drop", "Neck tension during long road rides"],
      solutionsTitle: "How bike fit helps",
      solutions: ["Adjust reach and drop to your real mobility", "Stabilize pelvic support with saddle height and fore-aft", "Reduce excessive front-end load", "Use realistic ride duration when testing changes"],
      faqTitle: "FAQ",
      faqs: [
        { q: "Should endurance riders always sit more upright?", a: "Not always. The best endurance position is the most efficient posture you can sustain without accumulating pain." },
        { q: "What should I adjust first for long-ride comfort?", a: "Start with saddle height and reach, because both strongly affect pelvic stability and upper-body loading." },
      ],
      relatedTitle: "Related tools and guides",
      relatedLinks: [
        { href: "/calculators/bike-fit", label: "Bike Fit Calculator" },
        { href: "/calculators/saddle-height", label: "Saddle Height Calculator" },
        { href: "/guides/road-bike-fit-guide", label: "Road Bike Fit Guide" },
      ],
      primaryCta: "Start Free Fit",
    },
    nl: {
      seoTitle: "Bikefit voor duurrijders | BestBikeFit4U",
      seoDescription: "Beperk vermoeidheid en blijf comfortabel tijdens lange ritten met een positie die urenlang vol te houden is.",
      seoKeywords: ["bikefit duurritten", "lange rit fietspositie", "bikefit voor lange ritten"],
      cardTitle: "Bikefit voor duurrijders",
      cardDescription: "Blijf efficiënt en comfortabel tijdens ritten van meerdere uren.",
      h1: "Bikefit voor duurrijders",
      intro: "Kleine afstelfouten worden op lange ritten grote comfortproblemen. Een endurance-gerichte fit helpt je stabiel vermogen te leveren en drukpunten te beperken.",
      challengesTitle: "Veelvoorkomende endurance-problemen",
      challenges: ["Dove handen na twee uur", "Zadelongemak bij lange blokken", "Lage rugvermoeidheid door te veel drop", "Nekspanning tijdens lange wegritten"],
      solutionsTitle: "Hoe bikefit helpt",
      solutions: ["Stem reach en drop af op je echte mobiliteit", "Stabiliseer bekkenondersteuning met zadelhoogte en setback", "Beperk overmatige druk op de voorkant", "Test aanpassingen op realistische ritduur"],
      faqTitle: "FAQ",
      faqs: [
        { q: "Moet een duurrijder altijd rechter zitten?", a: "Niet altijd. De beste endurance-positie is de meest efficiënte houding die je zonder oplopende klachten kunt vasthouden." },
        { q: "Wat pas ik als eerste aan voor lange ritten?", a: "Begin met zadelhoogte en reach, omdat die veel invloed hebben op bekkenstabiliteit en belasting van het bovenlichaam." },
      ],
      relatedTitle: "Gerelateerde tools en gidsen",
      relatedLinks: [
        { href: "/calculators/bike-fit", label: "Bike fit calculator" },
        { href: "/calculators/saddle-height", label: "Zadelhoogte calculator" },
        { href: "/guides/road-bike-fit-guide", label: "Racefiets fit gids" },
      ],
      primaryCta: "Start gratis fit",
    },
  },
  {
    slug: "mountain-cycling-fit",
    en: {
      seoTitle: "Bike Fit for Mountain Biking | BestBikeFit4U",
      seoDescription: "Improve climbing efficiency, descending confidence, and trail control with an MTB position tuned for real terrain.",
      seoKeywords: ["MTB bike fit", "mountain bike fitting", "trail bike position"],
      cardTitle: "Bike Fit for Mountain Biking",
      cardDescription: "Dial in a setup that supports control on technical terrain.",
      h1: "Bike Fit for Mountain Biking",
      intro: "Mountain-bike fit is not only about seated pedaling. It must support climbing, movement, and confidence when the terrain gets rough or steep.",
      challengesTitle: "Common MTB fit problems",
      challenges: ["Cockpit too short or too long for control", "Hand fatigue on rough descents", "Poor climbing traction from saddle height issues", "Difficulty weighting the front wheel"],
      solutionsTitle: "How bike fit helps",
      solutions: ["Set saddle height for seated climbing efficiency", "Use cockpit length for balance and control", "Tune lever angle and hand support", "Test fit on real trails, not only the trainer"],
      faqTitle: "FAQ",
      faqs: [
        { q: "Is MTB fit different from road fit?", a: "Yes. MTB positions prioritize movement freedom and terrain control much more than a pure road setup." },
        { q: "What should I optimize first for trails?", a: "Start with control and comfort before chasing speed or a lower front end." },
      ],
      relatedTitle: "Related tools and guides",
      relatedLinks: [
        { href: "/calculators/crank-length", label: "Crank Length Calculator" },
        { href: "/bandenspanning/mtb", label: "MTB Tire Pressure Calculator" },
        { href: "/guides/mountain-bike-fit-guide", label: "Mountain Bike Fit Guide" },
      ],
      primaryCta: "Start Free Fit",
    },
    nl: {
      seoTitle: "Bikefit voor mountainbiken | BestBikeFit4U",
      seoDescription: "Verbeter klimefficiëntie, controle en vertrouwen op technische trails met een MTB-positie die past bij echt terrein.",
      seoKeywords: ["MTB bikefit", "mountainbike afstelling", "trail positie"],
      cardTitle: "Bikefit voor mountainbiken",
      cardDescription: "Stem je setup af op controle op technisch terrein.",
      h1: "Bikefit voor mountainbiken",
      intro: "Een MTB-fit draait niet alleen om zittend trappen. Je positie moet ook klimmen, bewegen en vertrouwen op ruig terrein ondersteunen.",
      challengesTitle: "Veelvoorkomende MTB-problemen",
      challenges: ["Cockpit te kort of te lang voor controle", "Handvermoeidheid op ruwe afdalingen", "Minder klimtractie door zadelhoogte", "Moeite om het voorwiel te belasten"],
      solutionsTitle: "Hoe bikefit helpt",
      solutions: ["Zet zadelhoogte op klim-efficiëntie", "Gebruik cockpitlengte voor balans en controle", "Stem remgreephoek en handpositie af", "Test je fit op echte trails, niet alleen binnen"],
      faqTitle: "FAQ",
      faqs: [
        { q: "Verschilt MTB-fit van racefiets-fit?", a: "Ja. MTB-posities leggen veel meer nadruk op bewegingsvrijheid en terreincontrole dan een pure wegopstelling." },
        { q: "Wat optimaliseer ik eerst voor trails?", a: "Begin met controle en comfort voordat je meer snelheid of een lagere voorkant zoekt." },
      ],
      relatedTitle: "Gerelateerde tools en gidsen",
      relatedLinks: [
        { href: "/calculators/crank-length", label: "Cranklengte calculator" },
        { href: "/bandenspanning/mtb", label: "MTB bandenspanning calculator" },
        { href: "/guides/mountain-bike-fit-guide", label: "MTB fit gids" },
      ],
      primaryCta: "Start gratis fit",
    },
  },
  {
    slug: "gravel-cycling-fit",
    en: {
      seoTitle: "Bike Fit for Gravel Riding | BestBikeFit4U",
      seoDescription: "Improve control, comfort, and mixed-terrain stability with a gravel fit that balances road efficiency and off-road confidence.",
      seoKeywords: ["gravel bike fit", "gravel cycling setup", "gravel bike position"],
      cardTitle: "Bike Fit for Gravel Riding",
      cardDescription: "Blend control and comfort for long mixed-surface rides.",
      h1: "Bike Fit for Gravel Riding",
      intro: "Gravel fit sits between road efficiency and off-road control. The right setup helps you absorb terrain, stay relaxed, and keep confidence on variable surfaces.",
      challengesTitle: "Common gravel fit problems",
      challenges: ["Too much drop for rough surfaces", "Hand fatigue from vibration", "Limited control on loose descents", "Road-oriented setup carried over unchanged"],
      solutionsTitle: "How bike fit helps",
      solutions: ["Bias toward control rather than aggressive aero", "Pair fit changes with realistic tire pressure", "Moderate reach for relaxed arm bend", "Tune hood position and weight distribution"],
      faqTitle: "FAQ",
      faqs: [
        { q: "Should gravel bikes be more upright than road bikes?", a: "Often yes, but the exact difference depends on terrain, event duration, and your mobility." },
        { q: "Does tire pressure matter as much as bike fit on gravel?", a: "Yes. Fit and pressure work together because both affect comfort, confidence, and upper-body load." },
      ],
      relatedTitle: "Related tools and guides",
      relatedLinks: [
        { href: "/bandenspanning/gravelbike", label: "Gravel Tire Pressure Calculator" },
        { href: "/calculators/bike-fit", label: "Bike Fit Calculator" },
        { href: "/guides/gravel-bike-fit-guide", label: "Gravel Bike Fit Guide" },
      ],
      primaryCta: "Start Free Fit",
    },
    nl: {
      seoTitle: "Bikefit voor gravelrijden | BestBikeFit4U",
      seoDescription: "Verbeter controle, comfort en stabiliteit op gemengd terrein met een gravel-fit die weg- en offroad-eisen combineert.",
      seoKeywords: ["gravel bikefit", "gravel afstelling", "gravel positie"],
      cardTitle: "Bikefit voor gravelrijden",
      cardDescription: "Combineer controle en comfort voor lange ritten op gemengd terrein.",
      h1: "Bikefit voor gravelrijden",
      intro: "Een gravel-fit zit tussen racefiets-efficiëntie en offroad-controle in. De juiste setup helpt je terrein op te vangen en vertrouwen te houden op wisselende ondergrond.",
      challengesTitle: "Veelvoorkomende gravel-problemen",
      challenges: ["Te veel drop voor ruwe ondergrond", "Handvermoeidheid door trillingen", "Minder controle op losse afdalingen", "Wegsetup ongewijzigd overgenomen"],
      solutionsTitle: "Hoe bikefit helpt",
      solutions: ["Kies eerder voor controle dan extreme aero", "Combineer fit-aanpassingen met realistische bandenspanning", "Houd reach gematigd voor ontspannen armen", "Stem remgreeppositie en gewichtsverdeling af"],
      faqTitle: "FAQ",
      faqs: [
        { q: "Moet een gravelbike rechter zitten dan een racefiets?", a: "Vaak wel, maar het exacte verschil hangt af van terrein, ritduur en jouw mobiliteit." },
        { q: "Is bandenspanning net zo belangrijk als bikefit op gravel?", a: "Ja. Fit en bandenspanning werken samen omdat ze beide comfort, vertrouwen en belasting van het bovenlichaam beïnvloeden." },
      ],
      relatedTitle: "Gerelateerde tools en gidsen",
      relatedLinks: [
        { href: "/bandenspanning/gravelbike", label: "Gravel bandenspanning calculator" },
        { href: "/calculators/bike-fit", label: "Bike fit calculator" },
        { href: "/guides/gravel-bike-fit-guide", label: "Gravel fit gids" },
      ],
      primaryCta: "Start gratis fit",
    },
  },
  {
    slug: "triathlon-bike-fit",
    en: {
      seoTitle: "Bike Fit for Triathlon | BestBikeFit4U",
      seoDescription: "Find a triathlon position that balances aerodynamics, sustainable power, and a better run off the bike.",
      seoKeywords: ["triathlon bike fit", "TT bike position", "triathlon aero position"],
      cardTitle: "Bike Fit for Triathlon",
      cardDescription: "Balance aerodynamics with a sustainable race position.",
      h1: "Bike Fit for Triathlon",
      intro: "A strong triathlon fit is not the most aggressive setup on paper. It is the most aggressive position you can hold at race power without sabotaging comfort and run performance.",
      challengesTitle: "Common triathlon fit problems",
      challenges: ["Hip angle too closed", "Neck and shoulder fatigue in aero bars", "Saddle pressure on long steady efforts", "Run performance compromised after the bike"],
      solutionsTitle: "How bike fit helps",
      solutions: ["Set saddle support before front-end drop", "Tune extension reach and height for stability", "Test sustainability at race intensity", "Balance aero gain with breathing and hip comfort"],
      faqTitle: "FAQ",
      faqs: [
        { q: "Should I always lower the front end for triathlon?", a: "No. If you cannot sustain the posture, power and control fall and your run can suffer." },
        { q: "Can I use a road fit as a triathlon fit?", a: "Only as a starting point. Triathlon positions need separate checks for aero support and post-bike running." },
      ],
      relatedTitle: "Related tools and guides",
      relatedLinks: [
        { href: "/calculators/bike-fit", label: "Bike Fit Calculator" },
        { href: "/guides/triathlon-bike-fit-guide", label: "Triathlon Bike Fit Guide" },
        { href: "/science/stack-and-reach", label: "Stack and Reach Guide" },
      ],
      primaryCta: "Start Free Fit",
    },
    nl: {
      seoTitle: "Bikefit voor triathlon | BestBikeFit4U",
      seoDescription: "Vind een triathlon-positie die aerodynamica, duurzaam vermogen en een betere loopprestatie na het fietsen combineert.",
      seoKeywords: ["triathlon bikefit", "TT positie", "triathlon aero houding"],
      cardTitle: "Bikefit voor triathlon",
      cardDescription: "Combineer aerodynamica met een houdbare racepositie.",
      h1: "Bikefit voor triathlon",
      intro: "Een goede triathlon-fit is niet de meest extreme positie op papier, maar de meest agressieve houding die je op wedstrijdvermogen kunt vasthouden zonder je comfort of loopprestatie te schaden.",
      challengesTitle: "Veelvoorkomende triathlon-problemen",
      challenges: ["Te gesloten heuphoek", "Nek- en schoudervermoeidheid in extensions", "Zadeldruk tijdens lange blokken", "Minder loopprestatie na het fietsen"],
      solutionsTitle: "Hoe bikefit helpt",
      solutions: ["Zorg eerst voor stabiele zadelondersteuning", "Stem lengte en hoogte van extensions af", "Test houdbaarheid op wedstrijdintensiteit", "Zoek balans tussen aero-winst en heupcomfort"],
      faqTitle: "FAQ",
      faqs: [
        { q: "Moet de voorkant altijd lager voor triathlon?", a: "Nee. Als je de houding niet kunt vasthouden, daalt je vermogen en lijdt ook je looponderdeel." },
        { q: "Kan ik mijn racefiets-fit gebruiken voor triathlon?", a: "Alleen als startpunt. Triathlon-posities vragen aparte controle op aero-ondersteuning en lopen na het fietsen." },
      ],
      relatedTitle: "Gerelateerde tools en gidsen",
      relatedLinks: [
        { href: "/calculators/bike-fit", label: "Bike fit calculator" },
        { href: "/guides/triathlon-bike-fit-guide", label: "Triathlon fit gids" },
        { href: "/science/stack-and-reach", label: "Stack en reach gids" },
      ],
      primaryCta: "Start gratis fit",
    },
  },
  {
    slug: "commuter-bike-fit",
    en: {
      seoTitle: "Bike Fit for Commuters | BestBikeFit4U",
      seoDescription: "Make your daily commute more comfortable by correcting the basics: saddle height, reach, handlebar support, and frame size.",
      seoKeywords: ["commuter bike fit", "city bike setup", "commuter cycling position"],
      cardTitle: "Bike Fit for Commuters",
      cardDescription: "Improve daily comfort with the setup basics that matter most.",
      h1: "Bike Fit for Commuters",
      intro: "Commuting multiplies small fit errors because you repeat the same setup every day. Fixing saddle height, reach, and posture support can remove daily discomfort quickly.",
      challengesTitle: "Common commuter fit problems",
      challenges: ["Saddle left at shop-default height", "Too much weight on the hands", "Persistent saddle discomfort", "Incorrect frame size for daily riding"],
      solutionsTitle: "How bike fit helps",
      solutions: ["Start with a correct saddle-height baseline", "Use reach to balance weight between saddle and hands", "Check bar height against your flexibility", "Verify frame size before replacing multiple components"],
      faqTitle: "FAQ",
      faqs: [
        { q: "Do commuters need a professional fit?", a: "Not always. A good self-fit baseline can solve many daily comfort problems before professional help is needed." },
        { q: "What matters most for commuting comfort?", a: "Saddle height and overall reach are usually the first things to correct." },
      ],
      relatedTitle: "Related tools and guides",
      relatedLinks: [
        { href: "/calculators/saddle-height", label: "Saddle Height Calculator" },
        { href: "/calculators/frame-size", label: "Frame Size Calculator" },
        { href: "/calculators/bike-fit", label: "Bike Fit Calculator" },
      ],
      primaryCta: "Start Free Fit",
    },
    nl: {
      seoTitle: "Bikefit voor forenzen | BestBikeFit4U",
      seoDescription: "Maak je dagelijkse rit comfortabeler door de basis goed te zetten: zadelhoogte, reach, stuurondersteuning en framemaat.",
      seoKeywords: ["forenzen bikefit", "stadsfiets afstelling", "woon-werk fietspositie"],
      cardTitle: "Bikefit voor forenzen",
      cardDescription: "Verbeter dagelijks comfort met de afstelbasis die het meeste oplevert.",
      h1: "Bikefit voor forenzen",
      intro: "Woon-werkverkeer vergroot kleine fitfouten omdat je elke dag dezelfde setup herhaalt. Zadelhoogte, reach en houdingsondersteuning corrigeren levert vaak snel winst op.",
      challengesTitle: "Veelvoorkomende forenzenproblemen",
      challenges: ["Zadel op winkel-standaardhoogte", "Te veel gewicht op de handen", "Aanhoudend zadelongemak", "Verkeerde framemaat voor dagelijks gebruik"],
      solutionsTitle: "Hoe bikefit helpt",
      solutions: ["Begin met een correcte zadelhoogtebasis", "Gebruik reach om gewicht te verdelen", "Stem stuurhoogte af op je mobiliteit", "Controleer framemaat voordat je veel onderdelen vervangt"],
      faqTitle: "FAQ",
      faqs: [
        { q: "Hebben forenzen een professionele fit nodig?", a: "Niet altijd. Een goede basis-self-fit lost vaak al veel dagelijkse comfortproblemen op." },
        { q: "Wat telt het meest voor woon-werkcomfort?", a: "Zadelhoogte en totale reach zijn meestal de eerste zaken die je moet corrigeren." },
      ],
      relatedTitle: "Gerelateerde tools en gidsen",
      relatedLinks: [
        { href: "/calculators/saddle-height", label: "Zadelhoogte calculator" },
        { href: "/calculators/frame-size", label: "Framemaat calculator" },
        { href: "/calculators/bike-fit", label: "Bike fit calculator" },
      ],
      primaryCta: "Start gratis fit",
    },
  },
  {
    slug: "back-pain-cycling",
    en: {
      seoTitle: "Bike Fit for Lower Back Pain | BestBikeFit4U",
      seoDescription: "Reduce cycling-related lower back pain by correcting reach, drop, and saddle support with a structured fit approach.",
      seoKeywords: ["lower back pain cycling", "bike fit back pain", "cycling back pain fit"],
      cardTitle: "Bike Fit for Lower Back Pain",
      cardDescription: "Find the setup errors that often trigger back pain on the bike.",
      h1: "Bike Fit for Lower Back Pain While Cycling",
      intro: "Lower-back pain on the bike often comes from a cockpit or saddle setup that asks more from your mobility than you can comfortably support.",
      challengesTitle: "Common back-pain triggers",
      challenges: ["Cockpit too long", "Too much bar drop", "Saddle height mismatch", "Poor pelvic stability under load"],
      solutionsTitle: "How bike fit helps",
      solutions: ["Shorten reach where needed", "Reduce drop progressively", "Fine-tune saddle height and support", "Test one change at a time"],
      faqTitle: "FAQ",
      faqs: [
        { q: "Should I just raise the bars?", a: "Sometimes, but reach and saddle position usually need to be checked at the same time." },
        { q: "When should I see a clinician?", a: "If pain is severe, radiating, or does not improve after setup changes, seek medical advice." },
      ],
      relatedTitle: "Related tools and guides",
      relatedLinks: [
        { href: "/calculators/bike-fit", label: "Bike Fit Calculator" },
        { href: "/guides/bike-fitting-for-lower-back-pain", label: "Back Pain Fit Guide" },
        { href: "/science/stack-and-reach", label: "Stack and Reach Guide" },
      ],
      primaryCta: "Start Free Fit",
    },
    nl: {
      seoTitle: "Bikefit bij lage rugklachten | BestBikeFit4U",
      seoDescription: "Verminder lage rugklachten op de fiets door reach, drop en zadelondersteuning gericht te corrigeren.",
      seoKeywords: ["lage rugklachten fietsen", "bikefit rugpijn", "rugpijn op de fiets"],
      cardTitle: "Bikefit bij lage rugklachten",
      cardDescription: "Vind de afstelfouten die vaak lage rugpijn op de fiets veroorzaken.",
      h1: "Bikefit bij lage rugklachten op de fiets",
      intro: "Lage rugklachten op de fiets komen vaak door een cockpit- of zadelsetup die meer mobiliteit vraagt dan je comfortabel kunt ondersteunen.",
      challengesTitle: "Veelvoorkomende rug-triggers",
      challenges: ["Cockpit te lang", "Te veel stuurdrop", "Mismatch in zadelhoogte", "Onvoldoende bekkenstabiliteit onder belasting"],
      solutionsTitle: "Hoe bikefit helpt",
      solutions: ["Verkort reach waar nodig", "Verminder drop geleidelijk", "Stem zadelhoogte en ondersteuning af", "Test steeds één wijziging tegelijk"],
      faqTitle: "FAQ",
      faqs: [
        { q: "Moet ik gewoon mijn stuur hoger zetten?", a: "Soms, maar reach en zadelpositie moeten meestal tegelijk worden bekeken." },
        { q: "Wanneer moet ik een behandelaar zien?", a: "Bij hevige, uitstralende of aanhoudende pijn na setup-wijzigingen is medische beoordeling verstandig." },
      ],
      relatedTitle: "Gerelateerde tools en gidsen",
      relatedLinks: [
        { href: "/calculators/bike-fit", label: "Bike fit calculator" },
        { href: "/guides/bike-fitting-for-lower-back-pain", label: "Gids bij lage rugklachten" },
        { href: "/science/stack-and-reach", label: "Stack en reach gids" },
      ],
      primaryCta: "Start gratis fit",
    },
  },
  {
    slug: "short-torso-bike-fit",
    en: {
      seoTitle: "Bike Fit for a Shorter Torso | BestBikeFit4U",
      seoDescription: "Reduce overreach and improve comfort if you have a shorter torso relative to your height.",
      seoKeywords: ["short torso bike fit", "bike fit shorter torso", "cycling position short torso"],
      cardTitle: "Bike Fit for a Shorter Torso",
      cardDescription: "Fix the over-stretched feeling common on standard bike setups.",
      h1: "Bike Fit for Riders with a Shorter Torso",
      intro: "Riders with a shorter torso often end up on setups that feel too long even when frame size looks correct on paper.",
      challengesTitle: "Common shorter-torso fit problems",
      challenges: ["Over-stretched reach", "Too much pressure on the hands", "Limited control in the drops", "Lower-back strain from a long cockpit"],
      solutionsTitle: "How bike fit helps",
      solutions: ["Shorten reach before making extreme bar-height changes", "Use frame size and stem length together", "Check hood position and bar shape", "Aim for sustainable support, not maximal extension"],
      faqTitle: "FAQ",
      faqs: [
        { q: "Should I always size down the frame?", a: "Not always. Sometimes a different stem, bar, or hood position solves the issue without changing frame size." },
        { q: "What should I measure first?", a: "Start with overall height and inseam, then check whether your cockpit feels longer than you can support comfortably." },
      ],
      relatedTitle: "Related tools and guides",
      relatedLinks: [
        { href: "/calculators/frame-size", label: "Frame Size Calculator" },
        { href: "/calculators/bike-fit", label: "Bike Fit Calculator" },
        { href: "/guides/road-bike-fit-guide", label: "Road Bike Fit Guide" },
      ],
      primaryCta: "Start Free Fit",
    },
    nl: {
      seoTitle: "Bikefit voor een kortere romp | BestBikeFit4U",
      seoDescription: "Verminder overreach en verbeter comfort als je romp relatief korter is ten opzichte van je lengte.",
      seoKeywords: ["korte romp bikefit", "bikefit kortere romp", "fietspositie korte romp"],
      cardTitle: "Bikefit voor een kortere romp",
      cardDescription: "Los het uitgerekte gevoel op dat vaak ontstaat bij standaard setups.",
      h1: "Bikefit voor rijders met een kortere romp",
      intro: "Rijders met een kortere romp komen vaak op setups uit die te lang voelen, zelfs wanneer de framemaat op papier klopt.",
      challengesTitle: "Veelvoorkomende problemen bij een kortere romp",
      challenges: ["Overstrekte reach", "Te veel druk op de handen", "Minder controle in de beugels", "Lage rugbelasting door een lange cockpit"],
      solutionsTitle: "Hoe bikefit helpt",
      solutions: ["Verkort reach voordat je extreme stuurhoogtewijzigingen doet", "Bekijk framemaat en stuurpen samen", "Controleer remgreeppositie en stuurvorm", "Kies voor houdbare ondersteuning, niet maximale strekking"],
      faqTitle: "FAQ",
      faqs: [
        { q: "Moet ik altijd een kleinere framemaat kiezen?", a: "Niet altijd. Soms lossen een andere stuurpen, stuurvorm of remgreeppositie het probleem al op." },
        { q: "Wat meet ik als eerste?", a: "Begin met lengte en binnenbeenlengte en beoordeel daarna of je cockpit langer voelt dan je comfortabel kunt ondersteunen." },
      ],
      relatedTitle: "Gerelateerde tools en gidsen",
      relatedLinks: [
        { href: "/calculators/frame-size", label: "Framemaat calculator" },
        { href: "/calculators/bike-fit", label: "Bike fit calculator" },
        { href: "/guides/road-bike-fit-guide", label: "Racefiets fit gids" },
      ],
      primaryCta: "Start gratis fit",
    },
  },
  {
    slug: "tall-rider-bike-fit",
    en: {
      seoTitle: "Bike Fit for Tall Riders | BestBikeFit4U",
      seoDescription: "Get a more balanced bike setup if standard sizing leaves you cramped, unstable, or under-supported as a taller rider.",
      seoKeywords: ["bike fit tall rider", "cycling fit for tall riders", "tall cyclist bike setup"],
      cardTitle: "Bike Fit for Tall Riders",
      cardDescription: "Improve fit balance when standard bike sizing becomes limiting.",
      h1: "Bike Fit for Tall Riders",
      intro: "Tall riders often run into the limits of stock geometry, stock stems, and default contact-point setups. A better fit focuses on balance rather than just making everything bigger.",
      challengesTitle: "Common tall-rider fit problems",
      challenges: ["Cramped cockpit on the right frame size", "Poor weight balance from compensating parts", "Bar width and crank length mismatches", "Limited frame-choice overlap"],
      solutionsTitle: "How bike fit helps",
      solutions: ["Check frame size before stacking long stems", "Use reach and bar width together", "Review crank length and saddle setback proportionally", "Choose realistic targets for sustainable control"],
      faqTitle: "FAQ",
      faqs: [
        { q: "Do tall riders always need bigger frames?", a: "Not always. The right answer depends on proportions, not height alone." },
        { q: "What becomes limiting first for tall riders?", a: "Usually cockpit length, front-end support, or contact-point sizing rather than only saddle height." },
      ],
      relatedTitle: "Related tools and guides",
      relatedLinks: [
        { href: "/calculators/frame-size", label: "Frame Size Calculator" },
        { href: "/calculators/bike-fit", label: "Bike Fit Calculator" },
        { href: "/guides/gravel-bike-fit-guide", label: "Gravel Bike Fit Guide" },
      ],
      primaryCta: "Start Free Fit",
    },
    nl: {
      seoTitle: "Bikefit voor lange rijders | BestBikeFit4U",
      seoDescription: "Krijg een beter gebalanceerde setup als standaard framematen en onderdelen je als lange rijder beperken.",
      seoKeywords: ["bikefit lange rijder", "fietsafstelling lange rijders", "lange fietser setup"],
      cardTitle: "Bikefit voor lange rijders",
      cardDescription: "Verbeter de balans wanneer standaard framematen tekortschieten.",
      h1: "Bikefit voor lange rijders",
      intro: "Lange rijders lopen vaak tegen de grenzen van standaard geometrie en standaard onderdelen aan. Een betere fit draait om balans, niet alleen om alles groter maken.",
      challengesTitle: "Veelvoorkomende problemen voor lange rijders",
      challenges: ["Krappe cockpit op de juiste framemaat", "Matige gewichtsbalans door compenserende onderdelen", "Mismatch in stuurbreedte en cranklengte", "Beperkte framekeuze"],
      solutionsTitle: "Hoe bikefit helpt",
      solutions: ["Controleer framemaat voordat je extreem lange stuurpennen gebruikt", "Bekijk reach en stuurbreedte samen", "Stem cranklengte en setback proportioneel af", "Kies realistische doelen voor houdbare controle"],
      faqTitle: "FAQ",
      faqs: [
        { q: "Hebben lange rijders altijd grotere frames nodig?", a: "Niet altijd. De juiste keuze hangt af van verhoudingen, niet alleen van lengte." },
        { q: "Wat wordt het eerst beperkend voor lange rijders?", a: "Meestal cockpitlengte, front-end ondersteuning of contactpuntmaten, niet alleen zadelhoogte." },
      ],
      relatedTitle: "Gerelateerde tools en gidsen",
      relatedLinks: [
        { href: "/calculators/frame-size", label: "Framemaat calculator" },
        { href: "/calculators/bike-fit", label: "Bike fit calculator" },
        { href: "/guides/gravel-bike-fit-guide", label: "Gravel fit gids" },
      ],
      primaryCta: "Start gratis fit",
    },
  },
];

export const USE_CASE_SLUGS = USE_CASES.map((item) => item.slug);

export function getUseCaseBySlug(slug: string) {
  return USE_CASES.find((item) => item.slug === slug);
}

export function getUseCaseCopy(useCase: UseCase, locale: Locale) {
  return locale === "nl" ? useCase.nl : useCase.en;
}
