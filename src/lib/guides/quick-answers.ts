import type { Locale } from "@/i18n/config";

export type GuideQuickAnswerContent = {
  keyTakeaway: string;
  commonMistake: string;
  payAttention: string;
};

type GuideQuickAnswerRecord = Record<
  string,
  {
    en: GuideQuickAnswerContent;
    nl: GuideQuickAnswerContent;
  }
>;

const GUIDE_QUICK_ANSWERS: GuideQuickAnswerRecord = {
  "pain-and-discomfort": {
    en: {
      keyTakeaway:
        "Use this hub to separate symptom location first, because knee pain, saddle pressure, and hand numbness rarely come from the same adjustment.",
      commonMistake:
        "Treating every discomfort complaint as a single 'bad fit' problem instead of narrowing down which contact point or joint is being overloaded.",
      payAttention:
        "Riders whose symptoms build over time, shift during the ride, or appear only under higher load and fatigue.",
    },
    nl: {
      keyTakeaway:
        "Gebruik deze hub om eerst de klachtlocatie te scheiden, want kniepijn, zadeldruk en handverdoofdheid komen zelden uit dezelfde afstelling.",
      commonMistake:
        "Elke klacht behandelen als één algemeen bikefit-probleem in plaats van eerst te bepalen welk contactpunt of gewricht overbelast raakt.",
      payAttention:
        "Rijders bij wie klachten opbouwen in de tijd, tijdens de rit van plaats veranderen of vooral onder hogere belasting en vermoeidheid ontstaan.",
    },
  },
  "bike-fitting-for-knee-pain": {
    en: {
      keyTakeaway:
        "For knee pain, start with saddle height and then check cleat line and saddle setback based on where the pain sits around the joint.",
      commonMistake:
        "Changing cleats first while leaving a clearly too-high or too-low saddle in place.",
      payAttention:
        "Riders with pain at the front versus back of the knee, recurring pain after harder rides, or a recent crank, shoe, or cleat change.",
    },
    nl: {
      keyTakeaway:
        "Begin bij kniepijn met zadelhoogte en controleer daarna cleatlijn en setback op basis van waar de pijn rond de knie zit.",
      commonMistake:
        "Eerst aan cleats sleutelen terwijl het zadel duidelijk te hoog of te laag staat.",
      payAttention:
        "Rijders met pijn voorin versus achterin de knie, terugkerende pijn na zwaardere ritten of een recente wijziging aan crank, schoen of cleat.",
    },
  },
  "bike-fitting-for-lower-back-pain": {
    en: {
      keyTakeaway:
        "Lower-back pain is usually a support problem: too much reach, too much drop, or a pelvis that cannot stay calm over longer rides.",
      commonMistake:
        "Stretching the back more aggressively while keeping the same long, low cockpit that created the overload.",
      payAttention:
        "Riders who feel fine for 20 to 40 minutes but tighten up as the ride lengthens, especially in the drops or on rough roads.",
    },
    nl: {
      keyTakeaway:
        "Onderrugpijn is meestal een supportprobleem: te veel reach, te veel drop of een bekken dat op langere ritten niet rustig blijft.",
      commonMistake:
        "Agressiever gaan rekken terwijl dezelfde lange, lage cockpit die de overbelasting veroorzaakt gewoon blijft staan.",
      payAttention:
        "Rijders die zich 20 tot 40 minuten goed voelen maar op langere ritten vastlopen, vooral in de beugels of op ruwer wegdek.",
    },
  },
  "bike-fit-for-neck-and-shoulder-pain": {
    en: {
      keyTakeaway:
        "Neck and shoulder pain usually means the upper body is holding up too much of the rider rather than being supported by the saddle and core.",
      commonMistake:
        "Rotating the bars or moving the hoods repeatedly without first asking whether the cockpit is simply too long or too low.",
      payAttention:
        "Riders who shrug the shoulders under load, lock the elbows, or feel worse when looking up the road for long periods.",
    },
    nl: {
      keyTakeaway:
        "Nek- en schouderpijn betekent meestal dat het bovenlichaam te veel draagwerk doet in plaats van ondersteund te worden door zadel en core.",
      commonMistake:
        "Steeds stuur en hoods draaien zonder eerst te beoordelen of de cockpit gewoon te lang of te laag is.",
      payAttention:
        "Rijders die de schouders optrekken onder belasting, de ellebogen vergrendelen of vooral klachten krijgen wanneer ze lang vooruit moeten kijken.",
    },
  },
  "bike-fit-for-hand-numbness-and-wrist-pain": {
    en: {
      keyTakeaway:
        "Hand numbness is usually a pressure-distribution problem, not a glove problem: too much weight on the bars or a poor wrist angle under load.",
      commonMistake:
        "Adding thicker tape or gloves before checking saddle tilt, cockpit support, and hood angle.",
      payAttention:
        "Riders who go numb on longer steady rides, feel pressure in one hand more than the other, or brace hard while climbing seated.",
    },
    nl: {
      keyTakeaway:
        "Handverdoofdheid is meestal een drukverdelingsprobleem en geen handschoenenprobleem: te veel gewicht op het stuur of een slechte polshoek onder belasting.",
      commonMistake:
        "Dikker stuurlint of andere handschoenen kiezen voordat zadeltilt, cockpitsteun en hoodhoek zijn gecontroleerd.",
      payAttention:
        "Rijders die op langere constante ritten doof worden, in één hand meer druk voelen of zittend klimmend hard op het stuur steunen.",
    },
  },
  "bike-fit-for-saddle-pressure-perineal-numbness-and-saddle-sores": {
    en: {
      keyTakeaway:
        "Saddle pressure is rarely solved by width alone; height, tilt, shape, and how stable you sit all matter together.",
      commonMistake:
        "Tilting the saddle nose sharply downward to escape pressure, then creating sliding and even more arm support.",
      payAttention:
        "Riders with soft-tissue numbness, repeated sore spots on one side, or discomfort that appears only after an hour or more.",
    },
    nl: {
      keyTakeaway:
        "Zadeldruk los je zelden met breedte alleen op; hoogte, tilt, vorm en hoe stabiel je zit werken samen.",
      commonMistake:
        "De zadelneus sterk omlaag zetten om druk te ontlopen en daarmee juist schuiven en extra armsteun te creëren.",
      payAttention:
        "Rijders met verdoofd zacht weefsel, terugkerende drukplekken aan één zijde of klachten die pas na een uur of langer opkomen.",
    },
  },
  "bike-fit-for-foot-pain-hot-foot-and-numb-toes": {
    en: {
      keyTakeaway:
        "Foot pain usually starts with shoe pressure, cleat position, or stance width before it starts with a dramatic change in saddle height.",
      commonMistake:
        "Blaming the insole immediately while the shoe is too narrow, the cleat is too far forward, or the forefoot is being over-compressed.",
      payAttention:
        "Riders with burning under the forefoot, numb toes on long rides, or symptoms that worsen in heat and high-intensity efforts.",
    },
    nl: {
      keyTakeaway:
        "Voetpijn begint meestal bij schoendruk, cleatpositie of standbreedte en niet bij een grote wijziging in zadelhoogte.",
      commonMistake:
        "Direct de inlegzool de schuld geven terwijl de schoen te smal is, de cleat te ver naar voren staat of de voorvoet te veel wordt samengedrukt.",
      payAttention:
        "Rijders met branderigheid onder de voorvoet, dove tenen op lange ritten of klachten die verergeren bij warmte en hogere intensiteit.",
    },
  },
  "ride-types": {
    en: {
      keyTakeaway:
        "Choose the guide that matches how and where you ride, because road, gravel, MTB, triathlon, endurance, and indoor riding do not ask the same things from a position.",
      commonMistake:
        "Copying a fit target from another discipline without checking whether the terrain, duration, and control demands are different.",
      payAttention:
        "Riders moving between disciplines, buying a second bike, or trying to decide how aggressive their setup really needs to be.",
    },
    nl: {
      keyTakeaway:
        "Kies de gids die past bij hoe en waar je rijdt, want weg, gravel, MTB, triathlon, endurance en indoor vragen niet hetzelfde van een positie.",
      commonMistake:
        "Een fitdoel uit een andere discipline kopiëren zonder te controleren of terrein, duur en controle-eisen anders zijn.",
      payAttention:
        "Rijders die tussen disciplines wisselen, een tweede fiets kopen of willen bepalen hoe agressief hun setup echt moet zijn.",
    },
  },
  "road-bike-fit-guide": {
    en: {
      keyTakeaway:
        "A good road fit balances sustainable support with speed, so you can stay efficient after the first hour instead of just looking low in a photo.",
      commonMistake:
        "Chasing a pro-looking front end before the saddle and pelvic support are stable enough to carry it.",
      payAttention:
        "Riders choosing between endurance and race priorities, spending more time in the drops, or getting hand and neck tension on longer rides.",
    },
    nl: {
      keyTakeaway:
        "Een goede racefietsfit balanceert duurzame steun met snelheid, zodat je na het eerste uur nog efficiënt zit in plaats van alleen laag te ogen op een foto.",
      commonMistake:
        "Een pro-achtige lage voorkant najagen voordat zadel en bekkensteun stabiel genoeg zijn om die positie te dragen.",
      payAttention:
        "Rijders die kiezen tussen endurance- en raceprioriteiten, meer tijd in de drops willen doorbrengen of op langere ritten hand- en nekspanning krijgen.",
    },
  },
  "gravel-bike-fit-guide": {
    en: {
      keyTakeaway:
        "Gravel fit should protect control and compliance first, because rough terrain punishes a position that is only comfortable on smooth tarmac.",
      commonMistake:
        "Using a pure road-race posture on gravel and then blaming the bike for feeling nervous or harsh.",
      payAttention:
        "Riders descending on loose ground, spending long hours on mixed surfaces, or getting upper-body fatigue that does not appear on the road.",
    },
    nl: {
      keyTakeaway:
        "Gravelfit moet eerst controle en demping beschermen, omdat ruwe ondergrond een positie afstraft die alleen op glad asfalt werkt.",
      commonMistake:
        "Een pure racehouding op gravel gebruiken en daarna de fiets de schuld geven van een nerveus of hard gevoel.",
      payAttention:
        "Rijders die afdalen op losse ondergrond, lange dagen op gemengd terrein maken of bovenlichaamvermoeidheid krijgen die op de weg niet optreedt.",
    },
  },
  "mountain-bike-fit-guide": {
    en: {
      keyTakeaway:
        "Mountain-bike fit is about climbing support and descending control together, not just a pedaling position measured with the dropper down.",
      commonMistake:
        "Judging MTB fit only from seated pedaling numbers while ignoring bar control, standing balance, and the dropper-post context.",
      payAttention:
        "Riders who climb seated for long periods, feel cramped when descending, or struggle to move freely behind the saddle on steep terrain.",
    },
    nl: {
      keyTakeaway:
        "MTB-fit gaat tegelijk over klimsteun en afdalingscontrole, niet alleen over een trappositie gemeten zonder rekening te houden met de droppercontext.",
      commonMistake:
        "MTB-fit alleen op zittende trapcijfers beoordelen en stuurcontrole, staande balans en de dropperpost vergeten.",
      payAttention:
        "Rijders die lang zittend klimmen, zich benauwd voelen in afdalingen of op steil terrein moeilijk vrij achter het zadel kunnen bewegen.",
    },
  },
  "triathlon-bike-fit-guide": {
    en: {
      keyTakeaway:
        "Triathlon fit is only fast when you can hold the aero posture calmly and still run well off the bike afterward.",
      commonMistake:
        "Forcing a lower front end in aero while losing pelvic stability, breathing room, and sustainable power.",
      payAttention:
        "Riders getting neck strain in the extensions, saddle pressure on the aero bars, or heavy legs starting the run.",
    },
    nl: {
      keyTakeaway:
        "Triathlonfit is alleen snel als je de aerohouding rustig kunt vasthouden en daarna nog goed kunt lopen.",
      commonMistake:
        "Een lagere aero-voorkant forceren terwijl bekkenstabiliteit, ademruimte en duurzaam vermogen juist verslechteren.",
      payAttention:
        "Rijders met nekspanning in de extensions, zadeldruk in aeropositie of zware benen aan het begin van de run.",
    },
  },
  "endurance-bike-fit-guide": {
    en: {
      keyTakeaway:
        "Endurance fit should reduce strain accumulation over many hours, not just feel relaxed in the first few kilometers.",
      commonMistake:
        "Making the bike very upright while leaving the saddle, hood position, and pressure distribution unresolved.",
      payAttention:
        "Riders training for sportives, gran fondos, or back-to-back long rides where comfort must still support useful power.",
    },
    nl: {
      keyTakeaway:
        "Endurance-fit moet de opbouw van belasting over vele uren beperken en niet alleen in de eerste kilometers ontspannen aanvoelen.",
      commonMistake:
        "De fiets heel rechtop maken terwijl zadel, hoodpositie en drukverdeling nog steeds niet kloppen.",
      payAttention:
        "Rijders die trainen voor toertochten, gran fondo's of opeenvolgende lange ritten waarbij comfort nog steeds bruikbaar vermogen moet ondersteunen.",
    },
  },
  "indoor-trainer-bike-fit-guide": {
    en: {
      keyTakeaway:
        "Indoor riding usually needs more support and cooling awareness because the bike moves less and the body loads contact points more constantly.",
      commonMistake:
        "Assuming outdoor fit numbers transfer perfectly indoors even when the trainer reduces bike movement and increases heat buildup.",
      payAttention:
        "Riders who get saddle discomfort, hand pressure, or hip tightness indoors sooner than they do outside.",
    },
    nl: {
      keyTakeaway:
        "Indoor fietsen vraagt meestal om meer support en aandacht voor koeling, omdat de fiets minder beweegt en contactpunten constanter belast worden.",
      commonMistake:
        "Aannemen dat buitenshuis-fitcijfers één op één naar binnen vertalen terwijl de trainer minder fietsbeweging en meer warmteopbouw geeft.",
      payAttention:
        "Rijders die binnenshuis eerder zadelongemak, handdruk of heupstijfheid krijgen dan buiten.",
    },
  },
  "rider-profiles": {
    en: {
      keyTakeaway:
        "Use this hub when a generic fit rule does not match your body, because torso length, flexibility, experience, and total size all change how a bike should be set up.",
      commonMistake:
        "Comparing yourself only to average stack, reach, or drop targets without adjusting for your own body proportions and riding history.",
      payAttention:
        "Tall riders, inflexible riders, beginners, and anyone whose body shape makes stock bike advice feel obviously off.",
    },
    nl: {
      keyTakeaway:
        "Gebruik deze hub wanneer een algemene fitregel niet bij jouw lichaam past, want romplengte, flexibiliteit, ervaring en totale lengte veranderen hoe een fiets moet worden afgesteld.",
      commonMistake:
        "Jezelf alleen vergelijken met gemiddelde stack-, reach- of dropdoelen zonder te corrigeren voor je eigen lichaamsverhoudingen en rijgeschiedenis.",
      payAttention:
        "Lange rijders, stijve rijders, beginners en iedereen bij wie standaard fietstips duidelijk niet passend voelen.",
    },
  },
  "bike-fit-for-tall-riders": {
    en: {
      keyTakeaway:
        "Tall riders often need more than simply a bigger frame; they usually need better control over stack, reach, bar width, and crank choices together.",
      commonMistake:
        "Sizing up until the reach is finally long enough and then accepting a front end that is too tall, too wide, or hard to balance.",
      payAttention:
        "Riders struggling with toe overlap, excessive seatpost extension, or bikes that feel stable in one dimension but wrong everywhere else.",
    },
    nl: {
      keyTakeaway:
        "Lange rijders hebben vaak meer nodig dan alleen een groter frame; stack, reach, stuurbreedte en crankkeuze moeten meestal samen kloppen.",
      commonMistake:
        "Steeds groter kiezen tot de reach eindelijk lang genoeg is en dan een voorkant accepteren die te hoog, te breed of slecht in balans is.",
      payAttention:
        "Rijders met teenoverlap, extreem veel zadelpenuitsteek of fietsen die in één maat kloppen maar verder overal vreemd aanvoelen.",
    },
  },
  "bike-fit-for-riders-with-a-shorter-torso": {
    en: {
      keyTakeaway:
        "Riders with a shorter torso often need a shorter effective cockpit without giving up saddle support or knee alignment.",
      commonMistake:
        "Sliding the saddle too far forward to shorten reach instead of solving the cockpit length properly.",
      payAttention:
        "Riders who feel stretched despite a sensible frame size, especially when saddle position starts to look compromised just to reach the bars.",
    },
    nl: {
      keyTakeaway:
        "Rijders met een kortere romp hebben vaak een kortere effectieve cockpit nodig zonder zadelsteun of knie-uitlijning op te offeren.",
      commonMistake:
        "Het zadel te ver naar voren schuiven om de reach te verkorten in plaats van de cockpitlengte echt goed op te lossen.",
      payAttention:
        "Rijders die uitgestrekt blijven voelen ondanks een logische framemaat, vooral wanneer de zadelpositie er vreemd uit gaat zien alleen om het stuur te halen.",
    },
  },
  "bike-fit-for-riders-with-limited-flexibility": {
    en: {
      keyTakeaway:
        "Limited flexibility changes which posture is sustainable, so fit should reduce strain without pretending mobility can be bypassed completely.",
      commonMistake:
        "Forcing a low, long position and hoping the body will adapt even though the rider cannot hinge or breathe well there.",
      payAttention:
        "Riders who struggle with hamstring tension, back rounding, or hand pressure when the bars are lowered or the cockpit is extended.",
    },
    nl: {
      keyTakeaway:
        "Beperkte flexibiliteit verandert welke houding houdbaar is, dus fit moet de belasting verminderen zonder te doen alsof mobiliteit helemaal omzeild kan worden.",
      commonMistake:
        "Een lage, lange positie forceren en hopen dat het lichaam wel went terwijl scharnieren en ademen daar duidelijk moeilijk gaan.",
      payAttention:
        "Rijders die hamstringspanning, een ronde rug of handdruk krijgen zodra het stuur lager staat of de cockpit langer wordt.",
    },
  },
  "bike-fit-for-beginners-and-returning-riders": {
    en: {
      keyTakeaway:
        "Beginners and returning riders usually need a stable, forgiving setup first so fitness and skill can develop on top of it.",
      commonMistake:
        "Copying an experienced rider's aggressive setup before basic saddle support, confidence, and tolerance are built.",
      payAttention:
        "Riders coming back after time away, building volume quickly, or feeling discomfort everywhere because nothing on the bike feels familiar yet.",
    },
    nl: {
      keyTakeaway:
        "Beginners en terugkerende rijders hebben meestal eerst een stabiele, vergevingsgezinde setup nodig waarop conditie en techniek kunnen groeien.",
      commonMistake:
        "De agressieve setup van een ervaren rijder kopiëren voordat basissteun, vertrouwen en belastbaarheid zijn opgebouwd.",
      payAttention:
        "Rijders die terugkomen na een pauze, trainingsvolume snel opbouwen of overal ongemak voelen omdat niets op de fiets nog vertrouwd aanvoelt.",
    },
  },
  "setup-parameters": {
    en: {
      keyTakeaway:
        "Use this hub when you know which number you want to change but need to understand what that number actually does on the bike first.",
      commonMistake:
        "Changing one setup number in isolation without checking how it shifts support, reach, and load elsewhere.",
      payAttention:
        "Riders making self-adjustments in millimeter steps, comparing calculator outputs, or trying to decide which parameter to test first.",
    },
    nl: {
      keyTakeaway:
        "Gebruik deze hub wanneer je weet welk getal je wilt aanpassen maar eerst wilt begrijpen wat dat getal op de fiets echt doet.",
      commonMistake:
        "Eén afstelgetal geïsoleerd veranderen zonder te controleren hoe steun, reach en belasting elders mee verschuiven.",
      payAttention:
        "Rijders die zelf in millimeters bijstellen, calculatoruitkomsten vergelijken of willen bepalen welk afstelpunt eerst getest moet worden.",
    },
  },
  "saddle-height-guide": {
    en: {
      keyTakeaway:
        "Saddle height is a starting value plus validation: the number only works if the hips stay stable and the leg is neither cramped nor overextended under load.",
      commonMistake:
        "Treating one inseam formula as final instead of checking what happens dynamically when you actually pedal.",
      payAttention:
        "Riders who rock at the hips, feel tension behind the knee, or struggle to tell whether a 2 to 3 mm change helped or hurt.",
    },
    nl: {
      keyTakeaway:
        "Zadelhoogte is een startwaarde plus validatie: het getal werkt alleen als de heupen stabiel blijven en het been onder belasting niet te compact of te ver gestrekt is.",
      commonMistake:
        "Eén inseam-formule als eindantwoord behandelen in plaats van te controleren wat er dynamisch gebeurt wanneer je echt trapt.",
      payAttention:
        "Rijders die met de heupen wiebelen, spanning achter de knie voelen of moeilijk kunnen onderscheiden of een stap van 2 tot 3 mm hielp of juist niet.",
    },
  },
  "saddle-fore-aft-and-tilt-guide": {
    en: {
      keyTakeaway:
        "Fore-aft and tilt decide whether the pelvis is supported or sliding, so they should be judged together rather than as two unrelated adjustments.",
      commonMistake:
        "Using KOPS as the end goal and ignoring whether the rider is actually stable and pressure-balanced on the saddle.",
      payAttention:
        "Riders who slide forward, brace on the hands, or keep changing tilt without understanding why the pressure pattern keeps returning.",
    },
    nl: {
      keyTakeaway:
        "Setback en tilt bepalen of het bekken wordt ondersteund of juist schuift, dus je moet ze samen beoordelen en niet als twee losse aanpassingen.",
      commonMistake:
        "KOPS als einddoel gebruiken en negeren of de rijder op het zadel echt stabiel en drukgebalanceerd zit.",
      payAttention:
        "Rijders die naar voren schuiven, op de handen steunen of tilt blijven aanpassen zonder te begrijpen waarom hetzelfde drukpatroon terugkomt.",
    },
  },
  "reach-and-stem-guide": {
    en: {
      keyTakeaway:
        "Effective reach is more than stem length; saddle position, hood shape, bar reach, and how the rider supports the torso all change the real cockpit feel.",
      commonMistake:
        "Swapping stems repeatedly before checking whether the saddle support or hood position is causing the stretched feeling.",
      payAttention:
        "Riders with locked elbows, heavy hands, or a torso that collapses when the pace rises or the ride gets longer.",
    },
    nl: {
      keyTakeaway:
        "Effectieve reach is meer dan stuurpenlengte; zadelpositie, hoodvorm, bar-reach en hoe de rijder de romp ondersteunt veranderen het echte cockpitgevoel.",
      commonMistake:
        "Steeds stuurpennen wisselen voordat is gecontroleerd of zadelsteun of hoodpositie het uitgestrekte gevoel veroorzaakt.",
      payAttention:
        "Rijders met vergrendelde ellebogen, zware handen of een romp die inzakt zodra tempo of ritduur oploopt.",
    },
  },
  "handlebar-drop-guide": {
    en: {
      keyTakeaway:
        "Bar drop only works when the rider can hinge, breathe, and keep the pelvis stable at that height for the real duration of the ride.",
      commonMistake:
        "Lowering the bars for aerodynamics while ignoring hip closure, neck tension, and loss of sustainable posture.",
      payAttention:
        "Riders who feel powerful for a short time but lose breathing room, neck comfort, or back control as the ride continues.",
    },
    nl: {
      keyTakeaway:
        "Stuurdrop werkt alleen wanneer de rijder op die hoogte kan scharnieren, ademen en het bekken stabiel kan houden voor de werkelijke ritduur.",
      commonMistake:
        "Het stuur voor aerodynamica verlagen terwijl heupsluiting, nekspanning en houdbare posture verslechteren.",
      payAttention:
        "Rijders die zich kort krachtig voelen maar gaandeweg ademruimte, nekcomfort of rugcontrole verliezen.",
    },
  },
  "crank-length-guide": {
    en: {
      keyTakeaway:
        "Crank length changes joint range of motion more than it changes gearing, so it matters most when hip or knee angles are already close to their limit.",
      commonMistake:
        "Choosing crank length only by rider height or tradition instead of checking top-of-stroke compression and riding goal.",
      payAttention:
        "Riders with anterior hip pinching, knee compression, or aggressive low positions where top-of-stroke clearance is limited.",
    },
    nl: {
      keyTakeaway:
        "Cranklengte verandert de bewegingsuitslag van gewrichten meer dan de gearing, dus het telt vooral wanneer heup- of kniehoeken al dicht bij hun grens zitten.",
      commonMistake:
        "Cranklengte alleen op basis van lichaamslengte of traditie kiezen in plaats van top-of-stroke-compressie en rijdoel te beoordelen.",
      payAttention:
        "Rijders met knellende heupen bovenin, kniecompressie of agressieve lage posities waar de ruimte bovenin beperkt is.",
    },
  },
  "handlebar-width-and-hood-position-guide": {
    en: {
      keyTakeaway:
        "Bar width and hood position shape shoulder load, wrist angle, and steering control together, so they should be tuned as a contact-point system.",
      commonMistake:
        "Buying wider or narrower bars to fix comfort while leaving the hood angle and hand support unchanged.",
      payAttention:
        "Riders with shoulder tension, wrist pressure, or unstable steering feel when riding on the hoods for long periods.",
    },
    nl: {
      keyTakeaway:
        "Stuurbreedte en hoodpositie bepalen samen schouderbelasting, polshoek en stuurcontrole, dus je stemt ze af als één contactpuntsysteem.",
      commonMistake:
        "Breder of smaller stuur kopen voor comfort terwijl hoodhoek en handsteun onveranderd blijven.",
      payAttention:
        "Rijders met schouderspanning, polsdruk of een onrustig stuurgevoel wanneer ze lang op de hoods rijden.",
    },
  },
  "shoe-foot-cleat-fit": {
    en: {
      keyTakeaway:
        "Use this hub when comfort problems start at the shoe-pedal interface, because shoe shape, cleat line, and stance width often explain what the rest of the fit cannot.",
      commonMistake:
        "Trying to solve forefoot, numbness, or tracking issues only from the saddle and bars without checking the feet first.",
      payAttention:
        "Riders with hotspots, numb toes, unstable knee tracking, or purchase decisions around shoes, insoles, and pedal stance.",
    },
    nl: {
      keyTakeaway:
        "Gebruik deze hub wanneer comfortproblemen bij schoen en pedaal beginnen, omdat schoenvorm, cleatlijn en standbreedte vaak verklaren wat de rest van de fit niet oplost.",
      commonMistake:
        "Voorvoet-, verdoofdheids- of trackingproblemen alleen vanuit zadel en stuur proberen op te lossen zonder eerst naar de voeten te kijken.",
      payAttention:
        "Rijders met hotspots, dove tenen, een onrustige knielijn of aankoopvragen rond schoenen, inlegzolen en pedaalstand.",
    },
  },
  "foot-measurement-guide-for-cyclists": {
    en: {
      keyTakeaway:
        "Accurate foot measurement gives you a better starting point for shoe choice than brand size labels ever will.",
      commonMistake:
        "Buying by normal shoe size alone without measuring both length and width under real weight-bearing conditions.",
      payAttention:
        "Riders with one foot larger than the other, repeated pressure points, or uncertainty between two shoe sizes and widths.",
    },
    nl: {
      keyTakeaway:
        "Een nauwkeurige voetmeting geeft een beter startpunt voor schoenkeuze dan een merkmaatlabel ooit zal doen.",
      commonMistake:
        "Alleen op normale schoenmaat kopen zonder lengte en breedte van beide voeten onder belasting te meten.",
      payAttention:
        "Rijders met één grotere voet, terugkerende drukpunten of twijfel tussen twee schoenmaten en breedtes.",
    },
  },
  "cycling-shoe-fit-width-and-last-guide": {
    en: {
      keyTakeaway:
        "Shoe fit is about shape as much as size, because the wrong last can create pain even when the nominal length looks correct.",
      commonMistake:
        "Assuming a longer shoe will solve width pressure when the real issue is the wrong shape through the forefoot or arch.",
      payAttention:
        "Riders with wide forefeet, narrow heels, toe numbness, or shoes that feel fine at first and painful after an hour.",
    },
    nl: {
      keyTakeaway:
        "Schoenfit gaat net zo veel over vorm als over maat, want een verkeerde leest kan pijn geven terwijl de nominale lengte klopt.",
      commonMistake:
        "Denken dat een langere schoen breedtedruk oplost terwijl het echte probleem in de leestvorm van voorvoet of middenvoet zit.",
      payAttention:
        "Rijders met brede voorvoeten, smalle hielen, dove tenen of schoenen die eerst goed voelen en na een uur pijnlijk worden.",
    },
  },
  "cleat-position-basics-guide": {
    en: {
      keyTakeaway:
        "Cleat setup should support your natural foot path, not force the foot into an angle that looks tidy but loads the knee and forefoot badly.",
      commonMistake:
        "Moving the cleat a long way at once or setting rotation by eye without checking how the foot wants to track under load.",
      payAttention:
        "Riders with knee tracking issues, numb feet, or one shoe that always feels less natural to clip in and pedal.",
    },
    nl: {
      keyTakeaway:
        "Cleatafstelling moet de natuurlijke voetlijn ondersteunen en de voet niet in een keurige maar belastende hoek dwingen.",
      commonMistake:
        "De cleat in één grote stap verplaatsen of rotatie op het oog zetten zonder te controleren hoe de voet onder belasting wil sporen.",
      payAttention:
        "Rijders met knietrackingproblemen, dove voeten of één schoen die altijd onnatuurlijker aanvoelt tijdens inklikken en trappen.",
    },
  },
  "stance-width-q-factor-and-pedal-spacer-guide": {
    en: {
      keyTakeaway:
        "Stance width changes how the knee tracks over the foot, so it matters most when the rider looks stable everywhere except the pedal line.",
      commonMistake:
        "Adding spacers because the knees brush the top tube without checking cleat position, shoe width, and natural stance first.",
      payAttention:
        "Riders with inward or outward knee drift, asymmetry between sides, or persistent foot pressure that does not improve with shoe changes alone.",
    },
    nl: {
      keyTakeaway:
        "Standbreedte verandert hoe de knie boven de voet spoort, dus het telt vooral wanneer de rijder overal stabiel oogt behalve in de pedaallijn.",
      commonMistake:
        "Spacers toevoegen omdat de knieën de bovenbuis raken zonder eerst cleatpositie, schoenbreedte en natuurlijke stand te controleren.",
      payAttention:
        "Rijders met naar binnen of buiten wijkende knieën, asymmetrie tussen links en rechts of aanhoudende voetdruk die niet verdwijnt met alleen een andere schoen.",
    },
  },
  "insoles-arch-support-and-footbeds-guide": {
    en: {
      keyTakeaway:
        "Insoles should stabilize the foot enough to reduce collapse and pressure, not force the arch into a shape it cannot tolerate for hours.",
      commonMistake:
        "Choosing the highest arch support available and then mistaking new pressure for 'needed correction.'",
      payAttention:
        "Riders with collapsing arches, repeated hotspots, or symptoms that improve briefly with better shoes but never fully settle.",
    },
    nl: {
      keyTakeaway:
        "Inlegzolen moeten de voet genoeg stabiliseren om inzakken en druk te verminderen, niet de voetboog in een vorm dwingen die urenlang niet houdbaar is.",
      commonMistake:
        "De hoogst mogelijke voetboogondersteuning kiezen en nieuwe druk vervolgens aanzien voor 'noodzakelijke correctie'.",
      payAttention:
        "Rijders met inzakkende voetbogen, terugkerende hotspots of klachten die met betere schoenen even verbeteren maar nooit echt verdwijnen.",
    },
  },
  "bike-size-and-geometry": {
    en: {
      keyTakeaway:
        "Use this hub when the question is about bike choice, because frame size and geometry decide what range of fit is possible before any spacer or stem is added.",
      commonMistake:
        "Comparing only seat-tube size or manufacturer size labels while ignoring stack, reach, and front-center differences.",
      payAttention:
        "Riders between sizes, comparing two bikes, or trying to understand why one frame feels easy to fit and another never quite works.",
    },
    nl: {
      keyTakeaway:
        "Gebruik deze hub wanneer de vraag over fietskeuze gaat, want framemaat en geometrie bepalen welk fitbereik überhaupt mogelijk is voordat er spacers of een andere stuurpen bijkomen.",
      commonMistake:
        "Alleen zitbuismaat of merklabels vergelijken en stack, reach en front-center negeren.",
      payAttention:
        "Rijders tussen twee maten, mensen die twee fietsen vergelijken of willen begrijpen waarom het ene frame makkelijk passend te maken is en het andere nooit helemaal klopt.",
    },
  },
  "frame-size-guide": {
    en: {
      keyTakeaway:
        "Frame size is about the usable fit range of the bike, not just whether you can technically straddle or sit on it.",
      commonMistake:
        "Choosing the bike that feels 'less aggressive' in the shop without checking whether stack and reach still leave room to fine-tune.",
      payAttention:
        "Riders between sizes, riders needing unusual saddle-to-bar relationships, or anyone relying on online size charts alone.",
    },
    nl: {
      keyTakeaway:
        "Framemaat gaat over het bruikbare fitbereik van de fiets en niet alleen over of je er technisch op kunt zitten of boven kunt staan.",
      commonMistake:
        "De fiets kiezen die in de winkel 'minder agressief' voelt zonder te controleren of stack en reach nog ruimte laten om fijn af te stellen.",
      payAttention:
        "Rijders tussen twee maten, rijders met een ongebruikelijke zadel-stuurverhouding of iedereen die alleen op online maatadviezen vertrouwt.",
    },
  },
  "road-vs-endurance-vs-race-geometry": {
    en: {
      keyTakeaway:
        "Road, endurance, and race geometry differ mainly in stack, reach, and front-end intent, which changes how much posture the bike asks from the rider.",
      commonMistake:
        "Calling one category automatically 'comfortable' or 'fast' without looking at the actual geometry numbers and the rider's goals.",
      payAttention:
        "Riders choosing a new bike for longer rides, more speed, or more flexibility margin than their current frame allows.",
    },
    nl: {
      keyTakeaway:
        "Road-, endurance- en racegeometrie verschillen vooral in stack, reach en voorkant-intentie, wat verandert hoeveel houding de fiets van de rijder vraagt.",
      commonMistake:
        "Eén categorie automatisch 'comfortabel' of 'snel' noemen zonder naar de echte geometriecijfers en het doel van de rijder te kijken.",
      payAttention:
        "Rijders die een nieuwe fiets kiezen voor langere ritten, meer snelheid of meer flexibiliteitsmarge dan hun huidige frame toelaat.",
    },
  },
  "how-to-compare-two-bikes-for-fit": {
    en: {
      keyTakeaway:
        "Compare two bikes by stack, reach, and how much spacer or stem adjustment each frame needs to hit your position, not by brand size names.",
      commonMistake:
        "Assuming two '56 cm' bikes will fit the same because the nominal size matches.",
      payAttention:
        "Riders comparing a new purchase against a known-good bike or trying to judge whether a second bike can mirror an existing position.",
    },
    nl: {
      keyTakeaway:
        "Vergelijk twee fietsen op stack, reach en hoeveel spacer- of stuurpenaanpassing nodig is om jouw positie te halen, niet op merkmaatnamen.",
      commonMistake:
        "Aannemen dat twee '56 cm'-fietsen hetzelfde passen omdat de nominale maat overeenkomt.",
      payAttention:
        "Rijders die een nieuwe aankoop vergelijken met een bekende goede fiets of willen inschatten of een tweede fiets een bestaande positie kan benaderen.",
    },
  },
  "nutrition-and-hydration": {
    en: {
      keyTakeaway:
        "Use this hub when the limiter is fueling rather than fit, because under-fueling can look like poor position tolerance when the real issue is energy and fluid management.",
      commonMistake:
        "Changing the bike setup first while repeated bonking, cramping, or late-ride fade is actually being driven by nutrition habits.",
      payAttention:
        "Riders preparing for longer events, warm conditions, or repeated high-output sessions where food and fluid timing matter.",
    },
    nl: {
      keyTakeaway:
        "Gebruik deze hub wanneer voeding de beperkende factor is in plaats van fit, want te weinig eten of drinken kan lijken op slechte positietolerantie terwijl het echte probleem energiemanagement is.",
      commonMistake:
        "Eerst de fietssetup veranderen terwijl terugkerende hongerklop, krampen of verval laat in de rit eigenlijk door voedingsgewoonten worden veroorzaakt.",
      payAttention:
        "Rijders die zich voorbereiden op langere evenementen, warme omstandigheden of herhaalde sessies met hoge output waarbij timing van eten en drinken telt.",
    },
  },
  "cycling-fueling-basics": {
    en: {
      keyTakeaway:
        "Fueling basics start with consistency: eat enough, start early enough, and match intake to ride duration before chasing advanced formulas.",
      commonMistake:
        "Waiting until you feel empty before taking in calories and then trying to catch up late in the ride.",
      payAttention:
        "Riders who fade after 90 minutes, skip food on training rides, or are unsure when fueling should begin.",
    },
    nl: {
      keyTakeaway:
        "Voedingsbasis begint met consistentie: genoeg eten, vroeg genoeg starten en inname koppelen aan ritduur voordat je geavanceerde schema's najaagt.",
      commonMistake:
        "Wachten tot je leeg voelt voordat je calorieën neemt en daarna laat in de rit proberen in te halen.",
      payAttention:
        "Rijders die na 90 minuten leeg lopen, eten overslaan op trainingsritten of niet weten wanneer de inname moet beginnen.",
    },
  },
  "carbs-per-hour-guide": {
    en: {
      keyTakeaway:
        "Carbs per hour should scale with intensity and duration, but only if the gut has been trained to tolerate that intake.",
      commonMistake:
        "Jumping straight to elite-level carb targets without practicing the intake pattern in training.",
      payAttention:
        "Riders targeting long races, hard group rides, or indoor sessions where carb demand rises quickly.",
    },
    nl: {
      keyTakeaway:
        "Koolhydraten per uur moeten meegroeien met intensiteit en duur, maar alleen als de maag-darm tolerantie daarvoor is getraind.",
      commonMistake:
        "Meteen naar elite-koolhydraatdoelen springen zonder dat innamemoment en -hoeveelheid in training te oefenen.",
      payAttention:
        "Rijders die lange wedstrijden, harde groepsritten of indoor sessies met snel oplopende koolhydraatvraag plannen.",
    },
  },
  "hydration-and-sweat-rate-guide": {
    en: {
      keyTakeaway:
        "Hydration works best when it is based on your sweat loss pattern, not on one generic bottle-per-hour rule.",
      commonMistake:
        "Drinking too little in heat or too much in cool weather because the plan is not tied to sweat rate and ride conditions.",
      payAttention:
        "Riders who finish rides much lighter, stop needing to pee entirely, or get headaches and performance drop in warmer weather.",
    },
    nl: {
      keyTakeaway:
        "Hydratatie werkt het best wanneer die gebaseerd is op jouw zweetverliespatroon en niet op één algemene fles-per-uurregel.",
      commonMistake:
        "Te weinig drinken in de hitte of te veel in koel weer omdat het plan niet aan zweettempo en omstandigheden is gekoppeld.",
      payAttention:
        "Rijders die duidelijk lichter finishen, helemaal niet meer hoeven plassen of bij warmer weer hoofdpijn en prestatieverlies krijgen.",
    },
  },
  "sodium-and-electrolytes-guide": {
    en: {
      keyTakeaway:
        "Sodium matters most when sweat loss is high, so the right plan depends on heat, duration, and how salty your sweat actually is.",
      commonMistake:
        "Taking large sodium doses on every ride without checking whether the conditions and personal sweat losses justify it.",
      payAttention:
        "Riders with salt marks on clothing, long hot events, or repeated cramp and fade patterns late in the day.",
    },
    nl: {
      keyTakeaway:
        "Natrium telt vooral wanneer zweetverlies hoog is, dus het juiste plan hangt af van hitte, duur en hoe zout jouw zweet echt is.",
      commonMistake:
        "Op elke rit grote natriumdoseringen nemen zonder te controleren of omstandigheden en persoonlijke zweetverliezen dat rechtvaardigen.",
      payAttention:
        "Rijders met zoutsporen op kleding, lange hete evenementen of terugkerende kramp- en vervalpatronen laat op de dag.",
    },
  },
  "power-ftp-pacing": {
    en: {
      keyTakeaway:
        "Use this hub when you need to connect fitness numbers to real pacing decisions, because FTP is only useful when it changes how you ride.",
      commonMistake:
        "Treating one headline power number as the answer to training, pacing, and event strategy all at once.",
      payAttention:
        "Riders preparing for climbs, time goals, pacing plans, or training blocks where power data needs practical meaning.",
    },
    nl: {
      keyTakeaway:
        "Gebruik deze hub wanneer je fitheidsgetallen wilt koppelen aan echte pacingbeslissingen, want FTP is pas nuttig als het verandert hoe je rijdt.",
      commonMistake:
        "Eén opvallend powergetal behandelen alsof het training, pacing en wedstrijdstrategie tegelijk oplost.",
      payAttention:
        "Rijders die zich voorbereiden op klimmen, tijdsdoelen, pacingplannen of trainingsblokken waarin powerdata praktische betekenis moet krijgen.",
    },
  },
  "ftp-explained": {
    en: {
      keyTakeaway:
        "FTP is a useful anchor for training and pacing, but it is still a model of sustainable effort rather than a perfect description of your whole engine.",
      commonMistake:
        "Using FTP as an identity score instead of as a practical planning number for training and events.",
      payAttention:
        "Riders interpreting a new test result, setting zones for the first time, or comparing test protocols that produce different numbers.",
    },
    nl: {
      keyTakeaway:
        "FTP is een bruikbaar anker voor training en pacing, maar het blijft een model van duurzaam vermogen en geen perfecte beschrijving van je hele motor.",
      commonMistake:
        "FTP als identiteitscijfer gebruiken in plaats van als praktisch planningsgetal voor training en events.",
      payAttention:
        "Rijders die een nieuwe testuitslag interpreteren, voor het eerst zones instellen of verschillende testprotocollen met elkaar vergelijken.",
    },
  },
  "wkg-and-power-zones-guide": {
    en: {
      keyTakeaway:
        "W/kg and power zones are useful only when you know what they should change in your pacing, workouts, and event expectations.",
      commonMistake:
        "Comparing W/kg with other riders without checking body size, terrain, or what zone structure actually means for your training.",
      payAttention:
        "Riders training for climbs, structuring intervals, or trying to reconcile absolute watts with relative climbing ability.",
    },
    nl: {
      keyTakeaway:
        "W/kg en powerzones zijn alleen nuttig wanneer je weet wat ze moeten veranderen in je pacing, trainingen en eventverwachtingen.",
      commonMistake:
        "W/kg met andere rijders vergelijken zonder te kijken naar lichaamsgrootte, terrein of wat de zone-indeling voor jouw training betekent.",
      payAttention:
        "Rijders die voor klimmen trainen, intervallen structureren of absoluut vermogen willen rijmen met relatief klimvermogen.",
    },
  },
  "power-to-speed-guide": {
    en: {
      keyTakeaway:
        "Power-to-speed depends on drag, gradient, and rolling losses, so one watt number means something different on flat roads than on climbs.",
      commonMistake:
        "Expecting a direct watts-to-kmh conversion without accounting for posture, terrain, and conditions.",
      payAttention:
        "Riders pacing time trials, estimating outdoor speed from indoor power, or trying to understand why similar watts produce different speeds.",
    },
    nl: {
      keyTakeaway:
        "Power-naar-snelheid hangt af van luchtweerstand, helling en rolweerstand, dus één wattgetal betekent iets anders op vlak terrein dan op een klim.",
      commonMistake:
        "Een directe omzetting van watt naar km/u verwachten zonder houding, terrein en omstandigheden mee te nemen.",
      payAttention:
        "Rijders die tijdritten pacen, buitensnelheid uit indoor power schatten of willen begrijpen waarom vergelijkbare watts andere snelheden opleveren.",
    },
  },
  "climb-time-and-event-pacing-guide": {
    en: {
      keyTakeaway:
        "Good climb pacing protects the effort you can still hold near the top, not just the excitement you feel in the first minutes.",
      commonMistake:
        "Starting a climb at short-interval intensity and assuming you can settle later without paying for it.",
      payAttention:
        "Riders targeting long climbs, mountainous sportives, or events where one pacing mistake can ruin the final hour.",
    },
    nl: {
      keyTakeaway:
        "Goede klim-pacing beschermt het vermogen dat je bovenin nog kunt vasthouden en niet alleen het enthousiasme van de eerste minuten.",
      commonMistake:
        "Een klim op intervalintensiteit starten en aannemen dat je later wel kunt herstellen zonder de prijs te betalen.",
      payAttention:
        "Rijders die lange beklimmingen, bergsportieven of evenementen rijden waar één pacingfout het laatste uur kan ruïneren.",
    },
  },
  "fit-science": {
    en: {
      keyTakeaway:
        "Use this hub when you need to understand the limits of rules and calculators, because bike fit is strongest when the method matches the question.",
      commonMistake:
        "Treating every formula or screenshot as if it can replace context, testing, and rider feedback.",
      payAttention:
        "Riders making bigger changes, working around persistent asymmetry, or deciding when online guidance is no longer enough.",
    },
    nl: {
      keyTakeaway:
        "Gebruik deze hub wanneer je de grenzen van regels en calculators wilt begrijpen, want bikefit werkt het best wanneer de methode past bij de vraag.",
      commonMistake:
        "Elke formule of screenshot behandelen alsof die context, testen en rijderfeedback kan vervangen.",
      payAttention:
        "Rijders die grotere veranderingen maken, met hardnekkige asymmetrie werken of willen beslissen wanneer online begeleiding niet meer genoeg is.",
    },
  },
  "when-online-bike-fit-has-limits": {
    en: {
      keyTakeaway:
        "Online fit works well for many position questions, but it has limits once asymmetry, pain, or complex equipment interactions become the main issue.",
      commonMistake:
        "Continuing to stack remote adjustments after the evidence already says the problem needs in-person eyes and dynamic assessment.",
      payAttention:
        "Riders with persistent one-sided symptoms, repeated failed adjustments, or complicated cases involving injury history and equipment changes together.",
    },
    nl: {
      keyTakeaway:
        "Online bikefit werkt goed voor veel positionele vragen, maar kent grenzen zodra asymmetrie, pijn of complexe materiaalinteracties het hoofdprobleem worden.",
      commonMistake:
        "Blijven stapelen met aanpassingen op afstand terwijl het bewijs al aangeeft dat de situatie fysieke observatie en dynamische beoordeling nodig heeft.",
      payAttention:
        "Rijders met aanhoudende eenzijdige klachten, herhaald mislukte aanpassingen of complexe situaties waarin blessuregeschiedenis en materiaalwissels samenkomen.",
    },
  },
};

export function getGuideQuickAnswer(
  slug: string,
  locale: Locale
): GuideQuickAnswerContent | undefined {
  return GUIDE_QUICK_ANSWERS[slug]?.[locale];
}
