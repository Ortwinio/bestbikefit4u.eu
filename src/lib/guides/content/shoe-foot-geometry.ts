import type { GuideContentFaq, GuideContentRecord, GuideContentSection } from "../guide-content";
import { GUIDES } from "../../../app/(public)/guides/data";

const SHOE_FOOT_GEOMETRY_STRUCTURAL_SECTIONS = {
  en: [
    {
      title: "How to measure",
      type: "steps",
      items: [
        "You need: a tape measure or ruler, a sheet of paper, a marker, your cycling socks, and for geometry guides a geometry chart or calculator.",
        "Step 1: measure foot length and width for both feet, then note any obvious left-right difference or volume issue.",
        "Step 2: if the guide is about cleats or stance, also record the current cleat position, Q-factor, or shoe support setup before changing anything.",
        "Step 3: compare the result with the shoe size chart or frame geometry chart you are using, then repeat the key reading once to confirm it.",
        "Common mistake: measuring only one foot or only length, then assuming the whole fit problem is solved.",
      ],
    },
    {
      title: "How to adjust",
      type: "steps",
      items: [
        "Start with the part of the system that is most constrained: shoe length and width first, then cleat position, then stance width or support, and only then geometry-related compromises.",
        "Use small steps: 1 to 2 mm for cleat fore-aft or rotation checks, 2 to 5 mm for stance width or support changes, and one size or one geometry step at a time for shoe or frame changes.",
        "Test each change for 2 to 3 rides so the foot, knee, and contact points can settle before you decide the change worked.",
        "If a change fixes pressure in one place but creates heel lift, numbness, or knee tracking problems, go back halfway and compare again.",
      ],
    },
    {
      title: "Warning signs",
      items: [
        "Toe numbness, hot spots, or pressure across the whole forefoot usually means the shoe or support is still too tight or too flat.",
        "Heel lift, arch collapse, or a knee that starts tracking differently after a change are signs the setup is still compromised.",
        "One-sided numbness, pain that appears at rest, or symptoms that continue after the ride should be treated as escalation signals, especially after a crash or a major fitting change.",
        "If the problem keeps returning after 2 or 3 sensible adjustments, bring in a fitter, podiatrist, or clinician instead of chasing the next guess.",
      ],
    },
    {
      title: "Variations by rider type",
      type: "table",
      items: [],
      tableHeaders: ["Rider type", "Typical shoe / geometry priority"],
      tableRows: [
        ["Road", "The most precise shoe fit and the cleanest cleat line because every small mismatch shows up over repeated pedaling."],
        ["Gravel", "More volume, protection, and tolerance for swelling because vibration and longer days change the fit feel."],
        ["MTB", "More room for movement, more protection, and a setup that stays stable when the terrain is rough or the rider is standing."],
        ["Endurance / Triathlon", "Consider how the fit behaves after hours in the shoe or in an aero position, not just in a quick shop test."],
      ],
    },
    {
      title: "Practical recommendation",
      type: "prose",
      items: [
        "Start with the measurement that matches the guide topic: foot size for shoe guides, cleat position for cleat guides, Q-factor for stance guides, or stack and reach for frame geometry guides.",
        "A calculator is enough when you only need a sizing or comparison baseline; a full fit is better when asymmetry, hot spots, or knee tracking issues keep showing up.",
        "Make one small change, test it in the real shoe or real bike setup, and only then move to the next variable.",
      ],
    },
  ],
  nl: [
    {
      title: "Hoe je het meet",
      type: "steps",
      items: [
        "Je hebt nodig: een meetlint of liniaal, een vel papier, een stift, je fietssokken en voor geometriegidsen ook een geometrietabel of calculator.",
        "Stap 1: meet de lengte en breedte van beide voeten en noteer meteen eventuele links-rechtsverschillen of volumeproblemen.",
        "Stap 2: als de gids over cleats of standbreedte gaat, noteer dan ook eerst de huidige cleatpositie, Q-factor of supportopstelling voordat je iets wijzigt.",
        "Stap 3: vergelijk de uitkomst met de schoenmaat- of geometrietabel die je gebruikt en herhaal de belangrijkste meting nog eens ter controle.",
        "Veelgemaakte fout: maar één voet of alleen de lengte meten en dan denken dat het hele fitprobleem opgelost is.",
      ],
    },
    {
      title: "Hoe je het afstelt",
      type: "steps",
      items: [
        "Begin bij het deel van het systeem dat het meest beperkt is: eerst schoenlengte en -breedte, dan cleatpositie, dan standbreedte of support en pas daarna geometriecompromissen.",
        "Werk in kleine stappen: 1 tot 2 mm voor cleat-voor-achter of rotatie, 2 tot 5 mm voor standbreedte of support en steeds maar één maat- of geometriesprong tegelijk.",
        "Test elke wijziging 2 tot 3 ritten zodat voet, knie en contactpunten kunnen settelen voordat je beslist dat het werkt.",
        "Als een wijziging druk op één plek oplost maar haklift, gevoelloosheid of knietrackingproblemen geeft, ga dan eerst halverwege terug en vergelijk opnieuw.",
      ],
    },
    {
      title: "Waarschuwingssignalen",
      items: [
        "Tintelende tenen, hot spots of druk over de hele voorvoet betekenen meestal dat de schoen of support nog steeds te strak of te vlak is.",
        "Haklift, ingezakte boog of een knie die na een wijziging anders gaat lopen zijn signalen dat de setup nog niet klopt.",
        "Eenzijdige gevoelloosheid, pijn die ook in rust aanwezig is of klachten die na de rit blijven bestaan, zijn opschaalsignalen, zeker na een val of een grote aanpassing.",
        "Keert hetzelfde probleem terug na 2 of 3 logische aanpassingen, schakel dan een fitter, podoloog of arts in in plaats van de volgende gok te proberen.",
      ],
    },
    {
      title: "Verschillen per rijtype",
      type: "table",
      items: [],
      tableHeaders: ["Rijtype", "Typische schoen- / geometrieprioriteit"],
      tableRows: [
        ["Weg", "De meest precieze schoenfit en de schoonste cleatlijn, omdat elke kleine mismatch zich door herhaald trappen laat voelen."],
        ["Gravel", "Meer volume, bescherming en tolerantie voor zwelling omdat trillingen en langere dagen het fitgevoel veranderen."],
        ["MTB", "Meer bewegingsruimte, meer bescherming en een setup die stabiel blijft als het terrein ruw is of je staat te rijden."],
        ["Endurance / Triathlon", "Kijk hoe de fit aanvoelt na uren in de schoen of in aero, niet alleen in een snelle shopsessie."],
      ],
    },
    {
      title: "Praktische aanbeveling",
      type: "prose",
      items: [
        "Begin bij de meting die bij de gids hoort: voetmaat voor schoengidsen, cleatpositie voor cleatgidsen, Q-factor voor standbreedtegidsen of stack en reach voor framegidsen.",
        "Een calculator is genoeg als je alleen een maat- of vergelijkingsbasis nodig hebt; een volledige fit is beter zodra asymmetrie, hot spots of knietrackingproblemen terugkomen.",
        "Maak één kleine wijziging, test die in de echte schoen- of fietssetup en ga pas daarna door naar de volgende variabele.",
      ],
    },
  ],
} satisfies Record<"en" | "nl", GuideContentSection[]>;

function appendStructuralSections(content: GuideContentRecord): GuideContentRecord {
  return Object.fromEntries(
    Object.entries(content).map(([slug, guide]) => [
      slug,
      {
        ...guide,
        en: {
          ...guide.en,
          sections: [...guide.en.sections, ...SHOE_FOOT_GEOMETRY_STRUCTURAL_SECTIONS.en],
        },
        nl: {
          ...guide.nl,
          sections: [...guide.nl.sections, ...SHOE_FOOT_GEOMETRY_STRUCTURAL_SECTIONS.nl],
        },
      },
    ]),
  ) as GuideContentRecord;
}

function getGuideCardTitle(slug: string, locale: "en" | "nl") {
  return GUIDES.find((guide) => guide.slug === slug)?.[locale].cardTitle ?? slug.replaceAll("-", " ");
}

function getGuideSubject(cardTitle: string) {
  return cardTitle
    .replace(/\s+Guide$/i, "")
    .replace(/\s+gids$/i, "")
    .trim();
}

function buildHeroIntro(intro: string[]) {
  return intro.slice(0, 2).join(" ");
}

function buildCtaDescription(slug: string, locale: "en" | "nl") {
  const cardTitle = getGuideCardTitle(slug, locale);
  const subject = getGuideSubject(cardTitle);
  if (locale === "en") {
    return `Use the ${cardTitle} guide to narrow down the next shoe or geometry adjustment for ${subject.toLowerCase()}.`;
  }
  return `Gebruik de ${cardTitle} gids om de volgende schoen- of geometrieaanpassing voor ${subject.toLowerCase()} te bepalen.`;
}

function buildFaqExtras(slug: string, locale: "en" | "nl"): GuideContentFaq[] {
  const cardTitle = getGuideCardTitle(slug, locale);
  const subject = getGuideSubject(cardTitle);
  if (locale === "en") {
    return [
      {
        q: `How do I know if ${subject.toLowerCase()} is causing my foot or cleat issue?`,
        a: `If the discomfort stays in the same area and changes when you adjust one shoe or cleat variable, ${subject.toLowerCase()} is probably involved. If the problem moves around, check the next fit factor instead.`,
      },
      {
        q: "When should I replace shoes or get a professional fit?",
        a: "Replace or get help when the shoe keeps causing hot spots, numbness, or heel lift even after careful adjustment, or when the problem is tied to asymmetry or persistent pain.",
      },
    ];
  }
  return [
    {
      q: `Hoe weet ik of ${subject.toLowerCase()} mijn voet- of cleatprobleem veroorzaakt?`,
      a: `Als het ongemak op dezelfde plek blijft en verandert zodra je één schoen- of cleatvariabele aanpast, is ${subject.toLowerCase()} waarschijnlijk betrokken. Verplaatst het probleem zich, kijk dan naar de volgende fitfactor.`,
    },
    {
      q: "Wanneer moet ik schoenen vervangen of een professional inschakelen?",
      a: "Vervang of vraag hulp als de schoen ondanks zorgvuldige aanpassing hot spots, gevoelloosheid of haklift blijft geven, of als het probleem samenhangt met asymmetrie of aanhoudende pijn.",
    },
  ];
}

function appendGuideCopy(content: GuideContentRecord): GuideContentRecord {
  return Object.fromEntries(
    Object.entries(content).map(([slug, guide]) => [
      slug,
      {
        ...guide,
        en: {
          ...guide.en,
          heroIntro: guide.en.heroIntro ?? buildHeroIntro(guide.en.intro),
          ctaDescription: guide.en.ctaDescription ?? buildCtaDescription(slug, "en"),
          faqs: [...guide.en.faqs, ...buildFaqExtras(slug, "en")],
        },
        nl: {
          ...guide.nl,
          heroIntro: guide.nl.heroIntro ?? buildHeroIntro(guide.nl.intro),
          ctaDescription: guide.nl.ctaDescription ?? buildCtaDescription(slug, "nl"),
          faqs: [...guide.nl.faqs, ...buildFaqExtras(slug, "nl")],
        },
      },
    ]),
  ) as GuideContentRecord;
}
const SHOE_FOOT_GEOMETRY_GUIDE_CONTENT_BASE = {
  "foot-measurement-guide-for-cyclists": {
    en: {
      intro: [
        "Foot size is the starting point for every shoe and cleat decision. If you measure length, width, and left-right differences carefully at home, you can choose a cycling shoe size with far less guesswork and avoid chasing cleat changes for a problem that begins in the shoe.",
        "The key is to measure when your feet are at their largest, record both feet separately, and treat shoe size as a translation step rather than a direct match to everyday sneakers.",
      ],
      sections: [
        {
          title: "How to measure foot length correctly",
          items: [
            "Measure at the end of the day, standing with full weight on the foot so you capture the longest practical length.",
            "Trace each foot on paper or use a wall, then measure from heel to the longest toe with a ruler or tape.",
            "Repeat the measurement in cycling socks if you already know the sock thickness you usually ride in.",
          ],
        },
        {
          title: "Width and volume: the often-ignored dimensions",
          items: [
            "Width tells you how much forefoot space you need; volume tells you how much three-dimensional room you need over the instep and midfoot.",
            "A foot can be average in length but still need a wide last, a taller vamp, or a shoe with more overall volume.",
            "If the shoe feels right in length but clamps the sides or tops of the foot, the last or volume is probably the real issue.",
          ],
        },
        {
          title: "Left-right differences: when they matter",
          items: [
            "Small left-right differences are normal and often fit best by sizing to the larger foot and fine-tuning with insole volume, sock choice, or closure tension.",
            "If one foot is clearly wider, longer, or higher volume, trying to force both feet into one uniform setup usually creates hot spots or numbness.",
            "Large asymmetries are worth noting before buying shoes because the wrong size can be hard to correct later.",
          ],
        },
        {
          title: "Translating measurements to shoe size",
          items: [
            "Use the brand's size chart as a starting point, not a final answer, because cycling brands vary more than most riders expect.",
            "Compare your measured length to the shoe's internal length and leave some room for toe movement, especially on longer rides.",
            "If you are between sizes, comfort and width usually matter more than chasing the smallest number on the box.",
          ],
        },
      ],
      faqs: [
        {
          q: "When is the best time of day to measure my feet?",
          a: "Measure in the evening or after a long day on your feet. That is when swelling is most realistic and you are less likely to buy a shoe that feels fine in the morning but tight on the bike.",
        },
        {
          q: "My feet are different sizes - which shoe size do I buy?",
          a: "Buy to the larger foot and use the smaller side's fit tools, such as insole volume, sock choice, or closure tension, to reduce slack. Forcing the smaller foot to match the larger one often creates more problems than it solves.",
        },
        {
          q: "Does cycling shoe sizing match regular shoe sizing?",
          a: "Usually not closely. Cycling shoe sizing is brand-specific, and the relevant fit is internal length, width, and volume rather than the number you wear in casual shoes.",
        },
      ],
    },
    nl: {
      intro: [
        "Voetmaat is het vertrekpunt voor elke schoen- en cleatkeuze. Als je lengte, breedte en links-rechtsverschillen thuis zorgvuldig meet, kies je veel gerichter een fietsschoen en voorkom je dat je een schoenprobleem probeert op te lossen met cleataanpassingen.",
        "Meet wanneer je voeten het grootst zijn, noteer beide voeten apart en zie schoenmaat als een vertaalslag in plaats van als een directe kopie van je normale sneakermaat.",
      ],
      sections: [
        {
          title: "Hoe je voetlengte correct meet",
          items: [
            "Meet aan het einde van de dag, terwijl je staat en volledig op de voet belast, zodat je de praktische maximale lengte vastlegt.",
            "Teken beide voeten af op papier of gebruik een muur, en meet van hiel tot langste teen met een liniaal of meetlint.",
            "Meet opnieuw met de sokken die je op de fiets draagt als je die dikte al gewend bent.",
          ],
        },
        {
          title: "Breedte en volume: de vaak vergeten maten",
          items: [
            "Breedte zegt hoeveel ruimte je voorvoet nodig heeft; volume zegt hoeveel driedimensionale ruimte je nodig hebt over wreef en middenvoet.",
            "Een voet kan qua lengte gemiddeld zijn en toch een brede leest, een hogere wreef of meer totale schoenruimte nodig hebben.",
            "Als de schoen in lengte goed voelt maar aan de zijkanten of bovenkant knelt, is de leest of het volume waarschijnlijk het echte probleem.",
          ],
        },
        {
          title: "Links-rechtsverschillen: wanneer ze tellen",
          items: [
            "Kleine verschillen zijn normaal en worden vaak het best opgevangen door op de grotere voet te kiezen en de andere kant bij te sturen met inlegzoolvolume, sokdikte of sluiting.",
            "Als één voet duidelijk langer, breder of hoger van volume is, levert beide voeten in dezelfde vorm duwen vaak hot spots of gevoelloosheid op.",
            "Grote asymmetrie is belangrijk om vooraf te noteren, omdat een verkeerde maat achteraf lastig te herstellen is.",
          ],
        },
        {
          title: "Van meting naar schoenmaat",
          items: [
            "Gebruik de maattabel van het merk als startpunt, niet als eindpunt, want fietsschoenen vallen per merk sterk verschillend.",
            "Vergelijk je gemeten lengte met de binnenlengte van de schoen en laat genoeg ruimte voor teenbeweging, vooral op langere ritten.",
            "Twijfel je tussen twee maten, dan tellen comfort en breedte meestal zwaarder dan het kleinste nummer op de doos.",
          ],
        },
      ],
      faqs: [
        {
          q: "Wat is het beste moment van de dag om mijn voeten te meten?",
          a: "Meet 's avonds of na een lange dag staan. Dan zijn je voeten realistischer van formaat en verklein je de kans op schoenen die 's ochtends prima lijken maar op de fiets krap worden.",
        },
        {
          q: "Mijn voeten hebben verschillende maten - welke schoenmaat koop ik?",
          a: "Kies op de grootste voet en corrigeer de kleinere voet met bijvoorbeeld inlegzoolvolume, sokkeuze of sluiting. De kleinere voet forceren naar de grotere maat veroorzaakt vaak meer problemen dan het oplost.",
        },
        {
          q: "Komt fietsschoenmaat overeen met gewone schoenmaat?",
          a: "Meestal niet echt. Fietsschoenmaten zijn merkspecifiek en de echte fit zit in binnenlengte, breedte en volume, niet in het nummer dat je in casual schoenen draagt.",
        },
      ],
    },
  },
  "cycling-shoe-fit-width-and-last-guide": {
    en: {
      intro: [
        "The shoe last is the shape of the shoe, and it is usually the first fit variable that matters. A shoe can be the right length on paper and still feel wrong if the last is too narrow, too low over the instep, or too shallow in the toe box.",
        "On stiff-soled cycling shoes, fit precision matters more because the shoe gives you less forgiveness. Soft-sole shoes can hide some mismatch; a stiffer shoe will often expose it immediately.",
      ],
      sections: [
        {
          title: "What 'last' means and why it matters",
          items: [
            "The last defines the overall 3D shape of the shoe: toe box shape, forefoot width, midfoot hold, and vamp height.",
            "Two shoes with the same size label can fit very differently if their lasts are built for different foot shapes.",
            "A good last matches your foot before you start tightening closures or adding volume tricks.",
          ],
        },
        {
          title: "Width and volume mismatches: symptoms and solutions",
          items: [
            "Numb toes, side pressure, and a hot spot over the instep are common signs that the shoe is too narrow or too low in volume.",
            "Heel lift can also happen in a shoe that is too roomy in the wrong place, even when the forefoot feels tight.",
            "Solutions include switching to a different last, trying a wide version, or choosing a shoe with more vamp height rather than simply sizing up.",
          ],
        },
        {
          title: "Boa vs velcro vs lace closure for fit adjustability",
          items: [
            "Boa dials are excellent for on-ride micro-adjustment and even pressure distribution.",
            "Velcro is simple and light, but it gives less precise control when you need to fine-tune across different parts of the foot.",
            "Laces can feel very even and comfortable, yet they are slower to change and less convenient if your foot volume changes during a ride.",
          ],
        },
        {
          title: "When shoes are the problem, not the cleat",
          items: [
            "If discomfort appears across the whole forefoot or midfoot, cleat movement alone is unlikely to solve it.",
            "When the shoe shape forces the foot into a compromise, cleat tweaks often just move the pressure somewhere else.",
            "Change the shoe first when the symptoms clearly match width, volume, or last mismatch.",
          ],
        },
      ],
      faqs: [
        {
          q: "How do I know if my cycling shoes are too narrow?",
          a: "Look for persistent side pressure, toe numbness, or a sensation that the shoe walls are pushing the forefoot inward. If loosening the closure helps only briefly, the shape is likely wrong rather than the tension.",
        },
        {
          q: "Does a stiff sole make shoe fit more critical?",
          a: "Yes. A stiff sole transfers force efficiently, but it also gives you less tolerance for a bad last or volume mismatch, so small fit problems become more noticeable.",
        },
        {
          q: "Should I go up a size if my shoes feel tight?",
          a: "Only if the problem is truly length. If the real issue is width, vamp height, or volume, going up a size can create heel lift and make the fit worse.",
        },
      ],
    },
    nl: {
      intro: [
        "De leest is de vorm van de schoen en meestal de eerste fitvariabele die echt telt. Een schoen kan op papier de juiste lengte hebben en toch verkeerd aanvoelen als de leest te smal is, te laag over de wreef loopt of te ondiep is bij de tenen.",
        "Bij fietsschoenen met een stijve zool is pasvorm nog belangrijker, omdat de schoen minder vergevingsgezind is. Een soepelere zool maskeert soms een mismatch; een stijvere schoen laat die vaak direct zien.",
      ],
      sections: [
        {
          title: "Wat 'leest' betekent en waarom het telt",
          items: [
            "De leest bepaalt de 3D-vorm van de schoen: teenbox, voorvoetbreedte, middenvoetsteun en wreefhoogte.",
            "Twee schoenen met dezelfde maat kunnen heel anders passen als ze op een andere voetvorm zijn gebouwd.",
            "Een goede leest sluit aan op je voet nog vóór je sluitingen hoeft aan te trekken of met volumeoplossingen moet gaan werken.",
          ],
        },
        {
          title: "Breedte- en volumemismatches: signalen en oplossingen",
          items: [
            "Tintelende tenen, zijdelingse druk en een hot spot over de wreef wijzen vaak op een schoen die te smal of te laag in volume is.",
            "Ook haklift kan ontstaan in een schoen met te veel ruimte op de verkeerde plekken, zelfs als de voorvoet juist krap voelt.",
            "Oplossingen zijn onder meer een andere leest, een wide-uitvoering of een schoen met meer wreefhoogte in plaats van simpelweg een maat groter nemen.",
          ],
        },
        {
          title: "Boa vs klittenband vs veters voor afstelbaarheid",
          items: [
            "Boa-draaiknoppen zijn sterk in kleine aanpassingen onderweg en geven een gelijkmatige drukverdeling.",
            "Klittenband is eenvoudig en licht, maar biedt minder precieze controle als je verschillende zones apart wilt afstellen.",
            "Veters kunnen heel gelijkmatig en comfortabel aanvoelen, maar zijn trager aan te passen en minder handig als je voetvolume tijdens de rit verandert.",
          ],
        },
        {
          title: "Wanneer het de schoen is, niet de cleat",
          items: [
            "Als de klacht over de hele voorvoet of middenvoet verspreid is, lost cleatverplaatsing het probleem meestal niet op.",
            "Wanneer de schoenvorm je voet dwingt tot een compromis, verplaatst een cleataanpassing vaak alleen de druk naar een andere plek.",
            "Verander eerst van schoen als de symptomen duidelijk passen bij breedte-, volume- of leestmismatch.",
          ],
        },
      ],
      faqs: [
        {
          q: "Hoe weet ik of mijn fietsschoenen te smal zijn?",
          a: "Let op aanhoudende zijdelingse druk, tintelende tenen of het gevoel dat de wanden van de schoen de voorvoet naar binnen duwen. Als losser maken alleen kort helpt, is de vorm waarschijnlijk het probleem en niet de spanning.",
        },
        {
          q: "Maakt een stijve zool schoenfit kritischer?",
          a: "Ja. Een stijve zool draagt kracht efficiënt over, maar vergeeft een slechte leest of volumemismatch minder snel, waardoor kleine pasvormproblemen meer opvallen.",
        },
        {
          q: "Moet ik een maat groter nemen als mijn schoenen strak voelen?",
          a: "Alleen als lengte echt het probleem is. Als breedte, wreefhoogte of volume de oorzaak zijn, kan een grotere maat juist haklift geven en de fit verslechteren.",
        },
      ],
    },
  },
  "cleat-position-basics-guide": {
    en: {
      intro: [
        "Cleat position is easiest to get right when you start from a neutral, repeatable baseline. The most important first variable is fore-aft placement relative to the ball of the foot, then rotation and float, and only after that the more marginal adjustments.",
        "A clean setup does not need to be perfect in one step. It needs to be stable enough that you can test changes without confusing cleat errors with shoe-fit or stance-width issues.",
      ],
      sections: [
        {
          title: "Fore-aft position: placing the cleat under the first metatarsal",
          items: [
            "A practical starting point is to align the cleat so the pedal axle sits close to the ball of the foot, usually around the first metatarsal head.",
            "Moving the cleat rearward can improve stability and reduce calf load for many riders, especially when they feel overworked in the forefoot.",
            "Moving it too far forward usually increases foot pressure and can make the bike feel less stable under load.",
          ],
        },
        {
          title: "Rotation and float: starting neutral",
          items: [
            "Set the cleat so your foot can sit naturally without forcing the heel in or out.",
            "Float is a comfort range, not a license to ignore a bad angle; it only helps if the foot can settle near its natural track.",
            "Start neutral, ride, then make small changes only if the knees or feet clearly ask for them.",
          ],
        },
        {
          title: "Heel in vs heel out: the Q-factor relationship",
          items: [
            "If your heels naturally tuck inward or flare outward, the foot may be asking for a different stance width rather than a rotated cleat.",
            "Changing cleat angle can sometimes mask a Q-factor mismatch, but it does not actually fix the underlying track of the leg.",
            "Use the cleat angle to support your natural line, not to force the knees toward an ideal that the rest of the bike does not support.",
          ],
        },
        {
          title: "How to check your cleat position without a professional",
          items: [
            "Mark the current cleat position before changing anything so you can always return to the baseline.",
            "Look at wear marks, knee tracking, and whether you can clip in and out consistently without searching for the pedal.",
            "Make one change at a time and test it on a short, familiar ride before assuming the result is good or bad.",
          ],
        },
      ],
      faqs: [
        {
          q: "What is the correct fore-aft cleat position?",
          a: "There is no single correct number for every rider, but a neutral starting point is to place the axle near the ball of the foot and then refine from there based on comfort, stability, and power feel.",
        },
        {
          q: "Should I use zero-float or float cleats?",
          a: "Most riders are better served by some float because it gives the foot room to track naturally. Zero float can work for riders with very stable tracking, but it is less forgiving if alignment is not already excellent.",
        },
        {
          q: "How often do cleats need to be replaced?",
          a: "Replace them when engagement feels sloppy, clipping in becomes inconsistent, or the wear is enough that your foot no longer returns to the same position ride after ride.",
        },
      ],
    },
    nl: {
      intro: [
        "Cleatpositie is het makkelijkst goed te krijgen als je begint met een neutrale, herhaalbare basis. De belangrijkste eerste variabele is de voor-achterpositie ten opzichte van de bal van de voet, daarna rotatie en float, en pas daarna de fijnere afstellingen.",
        "Een goede setup hoeft niet in één stap perfect te zijn. Hij moet vooral stabiel genoeg zijn zodat je veranderingen kunt testen zonder schoenfit of standbreedte met cleatfouten te verwarren.",
      ],
      sections: [
        {
          title: "Voor-achterpositie: de cleat onder de eerste metatarsaal",
          items: [
            "Een praktisch startpunt is om de cleat zo te plaatsen dat de pedaalas dicht bij de bal van de voet ligt, meestal rond de kop van het eerste middenvoetsbeen.",
            "De cleat iets naar achteren verplaatsen kan voor veel rijders meer stabiliteit geven en de belasting op de kuit verlagen, zeker als de voorvoet snel overwerkt raakt.",
            "Te ver naar voren plaatsen geeft vaak meer voetdruk en kan het geheel minder stabiel laten aanvoelen onder belasting.",
          ],
        },
        {
          title: "Rotatie en float: begin neutraal",
          items: [
            "Stel de cleat zo in dat je voet natuurlijk kan staan zonder de hiel naar binnen of buiten te dwingen.",
            "Float is een comfortmarge, geen vrijbrief om een verkeerde hoek te negeren; het helpt alleen als de voet ook echt dicht bij zijn natuurlijke lijn kan staan.",
            "Begin neutraal, rijd en wijzig pas iets als knieën of voeten daar duidelijk om vragen.",
          ],
        },
        {
          title: "Hiel naar binnen of buiten: de relatie met Q-factor",
          items: [
            "Als je hielen van nature naar binnen trekken of juist naar buiten staan, vraagt je lichaam mogelijk om een andere standbreedte in plaats van een geroteerde cleat.",
            "Een cleathoek aanpassen kan een Q-factormismatch soms maskeren, maar het onderliggende loopspoor van het been blijft hetzelfde.",
            "Gebruik de cleathoek om je natuurlijke lijn te ondersteunen, niet om de knieën te forceren naar een ideale houding die de rest van de fiets niet ondersteunt.",
          ],
        },
        {
          title: "Hoe je cleatpositie zonder professional controleert",
          items: [
            "Markeer de huidige positie voordat je iets wijzigt, zodat je altijd terug kunt naar de basis.",
            "Let op slijtage, knietracking en of je zonder zoeken consequent in en uit kunt klikken.",
            "Verander telkens maar één ding en test het eerst op een korte, vertrouwde rit.",
          ],
        },
      ],
      faqs: [
        {
          q: "Wat is de juiste voor-achterpositie van de cleat?",
          a: "Er is geen enkel getal dat voor iedereen klopt, maar een neutraal startpunt is om de pedaalas dicht bij de bal van de voet te plaatsen en daarna te verfijnen op basis van comfort, stabiliteit en krachtgevoel.",
        },
        {
          q: "Moet ik zero-float of float cleats gebruiken?",
          a: "De meeste rijders zijn beter af met wat float, omdat de voet dan natuurlijker kan bewegen. Zero float kan werken als je uitlijning al heel stabiel is, maar vergeeft minder fouten.",
        },
        {
          q: "Hoe vaak moeten cleats vervangen worden?",
          a: "Vervang ze zodra het in- en uitklikken slordig voelt, je de pedaalpositie minder consistent terugvindt of de slijtage groot genoeg is dat je voet niet meer steeds op dezelfde plek terugkomt.",
        },
      ],
    },
  },
  "stance-width-q-factor-and-pedal-spacer-guide": {
    en: {
      intro: [
        "Q-factor is the distance between the outer pedal spindle faces, and it shapes how wide your feet sit on the bike. When stance width and leg track line up, the knees tend to move more naturally and the hips often feel less constrained.",
        "Pedal spacers can help, but only when the issue is truly width-related. They are a fit tool, not a universal fix for every knee or hip complaint.",
      ],
      sections: [
        {
          title: "What Q-factor is and what it affects",
          items: [
            "Q-factor influences how far apart your feet are and can change the load path through the hips, knees, and feet.",
            "Too narrow can feel cramped and may encourage the knees to drift inward; too wide can feel splayed and sometimes reduce smooth tracking.",
            "The goal is not the largest or smallest number, but the stance width that matches your natural leg path.",
          ],
        },
        {
          title: "Hip width and ideal stance width",
          items: [
            "Hip width is a useful clue, but it does not map one-to-one to an ideal Q-factor because movement style and pelvic control also matter.",
            "A rider with a narrow pelvis can still need a wider stance if their knees track out or if shoe volume pushes the foot inward.",
            "Use comfort, knee line, and repeatability together rather than chasing a single body measurement.",
          ],
        },
        {
          title: "Pedal spacers: when and how much",
          items: [
            "Spacers are most useful when small width changes clearly improve knee track or foot clearance.",
            "Start with the smallest meaningful change and test it before adding more, because too much spacer can create a new problem.",
            "If the change only feels better for a few minutes but not over a real ride, the root cause may be somewhere else.",
          ],
        },
        {
          title: "Road vs MTB Q-factor differences",
          items: [
            "MTB setups often run wider than road setups because of terrain, shoes, and crank/pedal standards.",
            "Road riders usually notice smaller changes more quickly, so even a few millimetres can be meaningful.",
            "Do not compare road and MTB numbers directly without considering the whole system around them.",
          ],
        },
      ],
      faqs: [
        {
          q: "How do I know if my Q-factor is too narrow or too wide?",
          a: "If the knees feel cramped, the hips feel pinched, or the feet sit uncomfortably close together, the stance may be too narrow. If the legs feel splayed or tracking feels forced outward, it may be too wide.",
        },
        {
          q: "Will adding spacers fix knee tracking?",
          a: "It can help when the problem is actually stance-width related, but it will not fix a cleat, saddle, or shoe issue disguised as knee pain.",
        },
        {
          q: "Does Q-factor affect saddle height?",
          a: "Not directly in the basic sense, but changing stance width can change how the legs move, so a saddle-height check is smart after a significant spacer change.",
        },
      ],
    },
    nl: {
      intro: [
        "Q-factor is de afstand tussen de buitenzijden van de pedaalas en bepaalt hoe breed je voeten op de fiets staan. Als standbreedte en beenlijn goed op elkaar passen, bewegen de knieën meestal natuurlijker en voelen de heupen minder opgesloten.",
        "Pedaalspacers kunnen helpen, maar alleen wanneer het probleem echt breedtegerelateerd is. Het is een fittool, geen universele oplossing voor elke knie- of heupklacht.",
      ],
      sections: [
        {
          title: "Wat Q-factor is en wat het beïnvloedt",
          items: [
            "Q-factor beïnvloedt hoe ver je voeten uit elkaar staan en kan de belasting door heupen, knieën en voeten veranderen.",
            "Te smal kan beklemd aanvoelen en de knieën naar binnen laten vallen; te breed kan gespreid aanvoelen en de tracking verstoren.",
            "Het doel is niet de grootste of kleinste waarde, maar de standbreedte die bij jouw natuurlijke beenlijn past.",
          ],
        },
        {
          title: "Heupbreedte en ideale standbreedte",
          items: [
            "Heupbreedte is een bruikbare aanwijzing, maar die vertaalt zich niet één-op-één naar een ideale Q-factor omdat ook bewegingsstijl en bekkencontrole meetellen.",
            "Iemand met een smal bekken kan nog steeds een bredere stand nodig hebben als de knieën naar buiten lopen of als schoenvolume de voet naar binnen duwt.",
            "Gebruik comfort, knielijn en herhaalbaarheid samen in plaats van één lichaamsmaat na te jagen.",
          ],
        },
        {
          title: "Pedaalspacers: wanneer en hoeveel",
          items: [
            "Spacers zijn vooral nuttig wanneer kleine breedteverschillen duidelijk helpen bij knietracking of voetvrijheid.",
            "Begin met de kleinste zinvolle wijziging en test die eerst, want te veel spacer kan een nieuw probleem creëren.",
            "Als de wijziging alleen kort goed voelt en niet over een echte rit, ligt de oorzaak waarschijnlijk ergens anders.",
          ],
        },
        {
          title: "Road vs MTB Q-factor verschillen",
          items: [
            "MTB-opstellingen zijn vaak breder dan road-opstellingen door terrein, schoenen en crank-/pedaalstandaarden.",
            "Wegfietsers merken kleine veranderingen meestal sneller, waardoor zelfs een paar millimeter relevant kan zijn.",
            "Vergelijk road- en MTB-waarden niet rechtstreeks zonder de rest van het systeem mee te nemen.",
          ],
        },
      ],
      faqs: [
        {
          q: "Hoe weet ik of mijn Q-factor te smal of te breed is?",
          a: "Als de knieën beklemd voelen, de heupen knellen of de voeten te dicht bij elkaar staan, kan de stand te smal zijn. Als de benen gespreid voelen of de tracking naar buiten geforceerd aanvoelt, kan hij te breed zijn.",
        },
        {
          q: "Lost een spacer mijn knietracking op?",
          a: "Dat kan helpen als het probleem echt om standbreedte draait, maar het lost geen cleat-, zadel- of schoenprobleem op dat zich als knieklacht vermomt.",
        },
        {
          q: "Beïnvloedt Q-factor de zadelhoogte?",
          a: "Niet rechtstreeks in de basiszin, maar een andere standbreedte kan de beenbeweging veranderen, dus een controle van de zadelhoogte is verstandig na een grote spacerwijziging.",
        },
      ],
    },
  },
  "insoles-arch-support-and-footbeds-guide": {
    en: {
      intro: [
        "Insoles can be useful, but they are not magic. Their main job is to manage volume, shape the way the foot sits in the shoe, and provide the level of arch support that helps the foot stay stable without forcing it into an overcorrected position.",
        "For many riders, the stock insole is enough. The mistake is to treat every foot issue as a support problem when the real issue may be shoe shape, cleat position, or simply too much correction.",
      ],
      sections: [
        {
          title: "What insoles can and can't do for bike fit",
          items: [
            "Insoles can fill space, support the arch, and improve contact under the foot.",
            "They cannot fix the wrong last, the wrong shoe length, or a badly placed cleat.",
            "A better insole is only useful if it solves a specific problem instead of adding another layer of pressure.",
          ],
        },
        {
          title: "Stock vs aftermarket insoles: when to upgrade",
          items: [
            "Start with stock insoles if the shoes already hold your foot securely and you do not have obvious arch collapse or hot spots.",
            "Move to aftermarket options when the stock insole feels too flat, too thin, or too loose for the shoe volume you need.",
            "Do not upgrade just because a product is marketed as more advanced; upgrade because your current setup has a clear limitation.",
          ],
        },
        {
          title: "Arch height and power transfer",
          items: [
            "Arch support should make the foot more stable, not clamp it into a rigid shape.",
            "A moderate support profile often improves comfort and contact, while excessive support can push pressure into the wrong area.",
            "The best footbed is the one that lets you ride longer without the foot feeling squeezed or collapsed.",
          ],
        },
        {
          title: "When to see a podiatrist",
          items: [
            "See a podiatrist when pain is persistent, one-sided, or linked to an old injury or structural issue.",
            "Professional help is also smart if custom orthotics were prescribed before or if changing shoes and insoles never solves the problem.",
            "If symptoms are worsening despite a conservative fit approach, stop guessing and get the foot assessed properly.",
          ],
        },
      ],
      faqs: [
        {
          q: "Do insoles help with hot foot?",
          a: "They can, if the hot foot is caused by poor pressure distribution or too much collapse under the arch. If the real issue is shoe tightness, cleat position, or heat buildup from fit, insoles alone may do little.",
        },
        {
          q: "Can insoles change my cleat position needs?",
          a: "They can change how the foot sits in the shoe, which may slightly affect feel, but they do not replace cleat positioning. Treat them as a support and volume tool, not a cleat fix.",
        },
        {
          q: "Are custom orthotics worth it for cycling?",
          a: "Sometimes, especially for riders with clear structural issues or persistent pain. They are most valuable when they solve a specific problem that stock or heat-mouldable options cannot handle.",
        },
      ],
    },
    nl: {
      intro: [
        "Inlegzolen kunnen nuttig zijn, maar ze zijn geen tovermiddel. Hun belangrijkste taak is volume beheren, de manier waarop de voet in de schoen ligt vormgeven en precies genoeg boogsupport geven zodat de voet stabiel blijft zonder in een overcorrectie te worden geduwd.",
        "Voor veel rijders is de standaardinlegzool voldoende. De fout is om elk voetprobleem als een supportprobleem te zien terwijl de echte oorzaak misschien schoenvorm, cleatpositie of simpelweg te veel correctie is.",
      ],
      sections: [
        {
          title: "Wat inlegzolen wel en niet kunnen doen",
          items: [
            "Inlegzolen kunnen ruimte opvullen, de boog ondersteunen en het contact onder de voet verbeteren.",
            "Ze lossen niet de verkeerde leest, de verkeerde schoenlengte of een slecht geplaatste cleat op.",
            "Een betere inlegzool is alleen zinvol als die een specifiek probleem oplost in plaats van een extra druklaag toe te voegen.",
          ],
        },
        {
          title: "Standaard vs aftermarket: wanneer upgraden",
          items: [
            "Begin met de standaardinlegzool als de schoen je voet al stevig vasthoudt en je geen duidelijke booginzinking of drukplekken hebt.",
            "Stap over op aftermarket-opties wanneer de standaardzool te vlak, te dun of te los aanvoelt voor het schoenvolume dat je nodig hebt.",
            "Upgrade niet alleen omdat een product 'beter' klinkt; upgrade omdat je huidige setup een duidelijk tekort heeft.",
          ],
        },
        {
          title: "Booghoogte en krachtoverbrenging",
          items: [
            "Boogsupport moet de voet stabieler maken, niet in een starre vorm duwen.",
            "Een matig supportprofiel verbetert vaak comfort en contact, terwijl te veel support juist druk naar de verkeerde plek kan verplaatsen.",
            "De beste footbed is degene waarmee je langer kunt rijden zonder dat de voet geplet of ingezakt aanvoelt.",
          ],
        },
        {
          title: "Wanneer je naar een podoloog moet",
          items: [
            "Ga naar een podoloog wanneer de pijn aanhoudt, eenzijdig is of gekoppeld lijkt aan een oude blessure of structureel probleem.",
            "Professionele hulp is ook verstandig als je eerder al orthesen voorgeschreven kreeg of als schoenen en inlegzolen het probleem nooit oplossen.",
            "Worden de klachten erger ondanks een conservatieve fitaanpak, stop dan met gokken en laat de voet goed beoordelen.",
          ],
        },
      ],
      faqs: [
        {
          q: "Helpen inlegzolen tegen hot foot?",
          a: "Dat kan, als de hot foot ontstaat door slechte drukverdeling of te veel inzakkende boogondersteuning. Als het echte probleem schoenknelling, cleatpositie of warmteopbouw is, doen inlegzolen alleen vaak weinig.",
        },
        {
          q: "Kunnen inlegzolen mijn cleatbehoefte veranderen?",
          a: "Ze kunnen wel veranderen hoe de voet in de schoen ligt, waardoor het gevoel iets verschuift, maar ze vervangen geen cleatpositionering. Zie ze als support- en volumetool, niet als cleatoplossing.",
        },
        {
          q: "Zijn custom orthesen de moeite waard voor fietsen?",
          a: "Soms wel, vooral bij duidelijke structurele problemen of hardnekkige pijn. Ze zijn het meest waardevol als ze een specifiek probleem oplossen dat standaard- of heat-mouldable opties niet aankunnen.",
        },
      ],
    },
  },
  "frame-size-guide": {
    en: {
      intro: [
        "Frame size labels are a weak way to compare bikes because brands do not use them consistently. One brand's medium can overlap another brand's large, and the same nominal size can hide very different rider positions.",
        "Stack and reach are the numbers that matter. They tell you how tall and how long the frame really is before you start adjusting stems, spacers, and handlebars.",
      ],
      sections: [
        {
          title: "Why frame size labels mislead",
          items: [
            "Size labels are marketing shorthand, not a universal fit system.",
            "A 54, M, or medium tells you almost nothing unless you know the brand's geometry chart and intended category.",
            "Two bikes with the same label can still require very different stems, spacers, and seatpost setups.",
          ],
        },
        {
          title: "Stack and reach: what to compare instead",
          items: [
            "Stack is the vertical height of the frame; reach is the horizontal length from the bottom bracket reference point.",
            "These two numbers create a much better first comparison than the size label printed on the frame.",
            "Compare them with your current bike or with a known target position so you can see how much cockpit change you would need.",
          ],
        },
        {
          title: "Standover and top tube length: secondary checks",
          items: [
            "Standover matters mainly for clearance and confidence, not for fine fit.",
            "Top tube length can still hint at cockpit feel, but it should not replace stack and reach.",
            "Use these checks to rule out obvious problems after the geometry numbers already look acceptable.",
          ],
        },
        {
          title: "Between sizes: how to decide",
          items: [
            "If you are between sizes, choose the size that best supports your target position rather than the one that looks safer on paper.",
            "A slightly smaller frame can be easier to extend; a slightly larger frame can be easier to lower, but each comes with trade-offs.",
            "Your flexibility, stem range, and preferred handling should all be part of the decision.",
          ],
        },
      ],
      faqs: [
        {
          q: "How do I find the right frame size using stack and reach?",
          a: "Compare the stack and reach of the bike you want with a bike that already fits you, then choose the frame that gets you closest without forcing extreme stem or spacer changes.",
        },
        {
          q: "Can a stem compensate for a frame that's the wrong size?",
          a: "Only within limits. A stem can fine-tune reach, but it cannot fully fix a frame whose stack and reach are fundamentally off for your position.",
        },
        {
          q: "Is standover height important for road bikes?",
          a: "It matters for clearance and confidence, but it is secondary to stack, reach, and cockpit setup for actual riding fit.",
        },
      ],
    },
    nl: {
      intro: [
        "Framemaatlabels zijn een zwakke manier om fietsen te vergelijken, omdat merken ze niet consistent gebruiken. De ene medium overlapt met de large van een ander merk, en dezelfde nominale maat kan een heel andere rijpositie verbergen.",
        "Stack en reach zijn de waarden die echt tellen. Ze laten zien hoe hoog en hoe lang het frame werkelijk is nog vóór je met stuurpen, spacers en cockpit begint te schuiven.",
      ],
      sections: [
        {
          title: "Waarom framemaatlabels misleiden",
          items: [
            "Maatlabels zijn marketingafkortingen, geen universeel fitsysteem.",
            "Een 54, M of medium zegt weinig als je de geometrietabel en de beoogde categorie niet kent.",
            "Twee fietsen met hetzelfde label kunnen nog steeds heel andere stuurpennen, spacers en zadelpen-instellingen nodig hebben.",
          ],
        },
        {
          title: "Stack en reach: wat je wel moet vergelijken",
          items: [
            "Stack is de verticale hoogte van het frame; reach is de horizontale lengte vanaf het referentiepunt van de trapas.",
            "Deze twee getallen geven veel beter weer hoe een fiets zal passen dan het maatlabel op het frame.",
            "Vergelijk ze met je huidige fiets of met een bekende doelpositie zodat je ziet hoeveel cockpitverandering nodig is.",
          ],
        },
        {
          title: "Standover en bovenbuislengte: secundaire checks",
          items: [
            "Standover gaat vooral over ruimte en vertrouwen, niet over fijne fit.",
            "De bovenbuislengte kan nog iets zeggen over het cockpitgevoel, maar mag stack en reach niet vervangen.",
            "Gebruik deze checks pas om duidelijke problemen uit te sluiten nadat de geometriewaarden al goed lijken.",
          ],
        },
        {
          title: "Tussen twee maten: hoe kies je",
          items: [
            "Zit je tussen maten, kies dan de maat die je doelpositie het best ondersteunt, niet de maat die op papier het veiligst lijkt.",
            "Een iets kleiner frame is vaak makkelijker te verlengen; een iets groter frame is vaak makkelijker te verlagen, maar beide keuzes hebben trade-offs.",
            "Je flexibiliteit, de range van de stuurpen en je voorkeur voor handling horen allemaal mee te wegen.",
          ],
        },
      ],
      faqs: [
        {
          q: "Hoe vind ik de juiste framemaat met stack en reach?",
          a: "Vergelijk de stack en reach van de fiets die je wilt met een fiets die al goed past, en kies het frame dat daar het dichtst bij komt zonder extreme wijzigingen aan stuurpen of spacers te forceren.",
        },
        {
          q: "Kan een stuurpen een verkeerd frame compenseren?",
          a: "Alleen tot op zekere hoogte. Een stuurpen kan de reach verfijnen, maar niet een frame oplossen waarvan stack en reach fundamenteel niet bij je positie passen.",
        },
        {
          q: "Is standoverhoogte belangrijk voor racefietsen?",
          a: "Ja, voor ruimte en vertrouwen, maar het is ondergeschikt aan stack, reach en cockpitopbouw voor de echte rijfit.",
        },
      ],
    },
  },
  "road-vs-endurance-vs-race-geometry": {
    en: {
      intro: [
        "Race, endurance, and sportive road frames differ in more than marketing language. The geometry changes the height of the front end, the effective length of the cockpit, the handling feel, and the range of positions you can reach comfortably.",
        "The same rider can need different setups on each category because geometry sets the baseline before stems, spacers, and bars enter the picture.",
      ],
      sections: [
        {
          title: "Race geometry: what it means in practice",
          items: [
            "Race frames usually have lower stack and longer reach, which creates a lower and more stretched position.",
            "They are built for a more aggressive front end and usually reward riders who can hold that position without strain.",
            "That does not make them automatically faster for everyone, but it does make them less forgiving.",
          ],
        },
        {
          title: "Endurance geometry: longer head tube, shorter top tube",
          items: [
            "Endurance bikes tend to raise the bars with a taller head tube and often shorten the effective reach slightly.",
            "This makes it easier to achieve a comfortable position without extreme spacer stacks or short stems.",
            "The trade-off is usually less racetrack aggression and a calmer, more stable road feel.",
          ],
        },
        {
          title: "How geometry affects what components you can use",
          items: [
            "A frame with the right stack and reach gives you more room to choose sensible stems, spacers, and handlebar shapes.",
            "A frame that is too low or too long can force extreme component choices that hurt handling or comfort.",
            "Geometry should create a workable fit window, not just a theoretical one.",
          ],
        },
        {
          title: "Choosing a geometry category for your goals and flexibility",
          items: [
            "Choose race geometry if you want a lower front end and can actually hold it in real rides.",
            "Choose endurance geometry if you want a more relaxed fit window, more bar height, or a calmer all-day position.",
            "If you are uncertain, your flexibility, riding duration, and event type should weigh more than labels like fast or relaxed.",
          ],
        },
      ],
      faqs: [
        {
          q: "Can I ride an endurance bike as fast as a race bike?",
          a: "Often yes for real-world riding, because rider position, comfort, and sustainable power matter more than the category label alone. The race bike may have more aero potential, but only if you can hold the position.",
        },
        {
          q: "What geometry suits a new road rider?",
          a: "Most new riders do better with endurance geometry because it is easier to fit, easier to hold, and less punishing when flexibility is still developing.",
        },
        {
          q: "Does frame geometry matter if I'm adjusting my fit anyway?",
          a: "Yes. Fit adjustments work best when the frame already puts you in the right range; geometry determines how much compromise you need to make before the adjustments start.",
        },
      ],
    },
    nl: {
      intro: [
        "Race-, endurance- en sportive wegframes verschillen in meer dan marketingtaal. De geometrie bepaalt de hoogte van de voorkant, de effectieve lengte van de cockpit, het stuurgedrag en het bereik aan posities dat je comfortabel kunt halen.",
        "Dezelfde rijder kan op elk van die categorieën een andere setup nodig hebben, omdat geometrie het startpunt zet nog vóór stuurpen, spacers en stuurvorm in beeld komen.",
      ],
      sections: [
        {
          title: "Racegeometrie: wat het in de praktijk betekent",
          items: [
            "Raceframes hebben meestal een lagere stack en een langere reach, wat een lagere en meer gestrekte positie geeft.",
            "Ze zijn gebouwd voor een agressievere voorkant en belonen meestal rijders die die houding goed kunnen vasthouden.",
            "Dat maakt ze niet automatisch sneller voor iedereen, maar wel minder vergevingsgezind.",
          ],
        },
        {
          title: "Endurancegeometrie: langere balhoofdbuis, kortere bovenbuis",
          items: [
            "Endurancefietsen tillen de cockpit vaak op met een hogere balhoofdbuis en verkorten de effectieve reach meestal iets.",
            "Daardoor haal je makkelijker een comfortabele positie zonder extreme spacerstapels of erg korte stuurpennen.",
            "De ruil is meestal minder race-achtige agressie en een rustiger, stabieler rijgevoel.",
          ],
        },
        {
          title: "Hoe geometrie bepaalt welke componenten je kunt gebruiken",
          items: [
            "Een frame met de juiste stack en reach geeft je meer ruimte om een logische stuurpen-, spacer- en stuurkeuze te maken.",
            "Een frame dat te laag of te lang is, dwingt je vaak tot extreme componentkeuzes die handling of comfort schaden.",
            "Geometrie moet een bruikbaar fitbereik creëren, niet alleen een theoretische fit.",
          ],
        },
        {
          title: "Een geometriecategorie kiezen op basis van doel en flexibiliteit",
          items: [
            "Kies racegeometrie als je een lagere voorkant wilt en die houding ook echt kunt vasthouden.",
            "Kies endurancegeometrie als je meer ruimte wilt voor een comfortabele opbouw, meer stuurhoogte of een rustiger all-day positie.",
            "Als je twijfelt, laat je flexibiliteit, ritduur en eventtype zwaarder wegen dan labels als snel of relaxed.",
          ],
        },
      ],
      faqs: [
        {
          q: "Kan ik op een endurancefiets net zo hard rijden als op een racefiets?",
          a: "Vaak wel in de praktijk, omdat rijpositie, comfort en vol te houden vermogen belangrijker zijn dan alleen de categorie. De racefiets kan meer aero-potentieel hebben, maar alleen als je de positie ook kunt vasthouden.",
        },
        {
          q: "Welke geometrie past bij een beginnende wielrenner?",
          a: "De meeste beginnende rijders doen het beter op endurancegeometrie, omdat die makkelijker te passen is, makkelijker vol te houden is en minder hard straft als flexibiliteit nog groeit.",
        },
        {
          q: "Maakt framegeometrie uit als ik mijn fit toch aanpas?",
          a: "Ja. Fitaanpassingen werken het best als het frame je al in de juiste bandbreedte zet; geometrie bepaalt hoeveel compromis je vóór die afstellingen al moet accepteren.",
        },
      ],
    },
  },
  "how-to-compare-two-bikes-for-fit": {
    en: {
      intro: [
        "Comparing two bikes for fit works best when you reduce the decision to stack, reach, and cockpit range. That gives you a clear way to compare the frames themselves instead of guessing based on label size, marketing claims, or how the bike looks in a photo.",
        "The goal is not to find the perfect bike on paper. The goal is to find the bike that gets closest to your target position with the least risky adjustment range after purchase.",
      ],
      sections: [
        {
          title: "Step 1: Compare stack and reach numbers",
          items: [
            "Write down the stack and reach for both bikes and compare them side by side.",
            "Use those numbers to estimate how high and how long each frame will feel before any parts are swapped.",
            "A small difference can matter a lot if you are already near your limit for bar height or reach.",
          ],
        },
        {
          title: "Step 2: Check cockpit adjustability range",
          items: [
            "Look at the stem lengths, spacer limits, and bar shapes each bike can realistically use.",
            "A bike with the right frame numbers but poor cockpit adjustability may still be the worse long-term choice.",
            "Do not assume every frame can be made to fit with the same ease.",
          ],
        },
        {
          title: "Step 3: Calculate effective reach with different stems",
          items: [
            "Estimate the final cockpit using the frame reach plus the stem and bar setup you would likely run.",
            "Use that estimate to compare what each bike would feel like in your actual riding position.",
            "This is where a frame that looks close can still prove expensive or awkward to finish.",
          ],
        },
        {
          title: "Step 4: Assess fit risk and transition adjustment",
          items: [
            "Consider how much adaptation the new position will require from your body and your riding style.",
            "A move that is slightly worse on paper can still be better if it is easier to adapt to and easier to fine-tune.",
            "If you are changing bikes to solve discomfort, reduce fit risk instead of chasing the most aggressive numbers.",
          ],
        },
      ],
      faqs: [
        {
          q: "If two bikes have the same stack and reach, will they fit the same?",
          a: "Not necessarily. Head tube shape, front-end adjustment range, bar geometry, and frame handling can still make them feel different even when the headline numbers match.",
        },
        {
          q: "How much can I adjust a bike after buying it?",
          a: "Quite a bit, but only within sensible limits. Stems, spacers, bars, and saddle position can fine-tune a fit, but they cannot fix every geometry mismatch cleanly.",
        },
        {
          q: "Should I buy the geometry that fits now or the geometry that fits my goal position?",
          a: "If you ride in your goal position often, choose the geometry that supports it. If you are still building toward that position, choose the one that is easier and safer to live with right now.",
        },
      ],
    },
    nl: {
      intro: [
        "Twee fietsen op fit vergelijken werkt het best als je de keuze terugbrengt naar stack, reach en cockpitbereik. Zo vergelijk je het frame zelf in plaats van te gokken op framemaat, marketingteksten of hoe een fiets op een foto oogt.",
        "Het doel is niet om op papier de perfecte fiets te vinden. Het doel is om de fiets te kiezen die het dichtst bij je doelpositie komt met de kleinste risicovolle afstelmarge achteraf.",
      ],
      sections: [
        {
          title: "Stap 1: vergelijk stack en reach",
          items: [
            "Noteer de stack en reach van beide fietsen en zet ze naast elkaar.",
            "Gebruik die waarden om in te schatten hoe hoog en hoe lang elk frame zal aanvoelen vóór je onderdelen wisselt.",
            "Zelfs een klein verschil kan belangrijk zijn als je al dicht bij je limiet voor stuurhoogte of reach zit.",
          ],
        },
        {
          title: "Stap 2: controleer de afstelruimte van de cockpit",
          items: [
            "Kijk naar stuurpenlengtes, spacerlimieten en stuurvormen die op elke fiets realistisch bruikbaar zijn.",
            "Een fiets met de juiste framewaarden maar slechte afstelbaarheid van de cockpit kan alsnog de slechtere langetermijnkeuze zijn.",
            "Ga er niet vanuit dat elk frame even makkelijk passend te maken is.",
          ],
        },
        {
          title: "Stap 3: bereken de effectieve reach met verschillende stuurpennen",
          items: [
            "Schat de eindcockpit op basis van frame reach plus de stuurpen- en stuurset-up die je waarschijnlijk zou gebruiken.",
            "Gebruik die schatting om te vergelijken hoe elke fiets in je echte rijpositie zou voelen.",
            "Hier kan een frame dat dichtbij lijkt alsnog duur of onhandig blijken om af te maken.",
          ],
        },
        {
          title: "Stap 4: beoordeel fitrisico en overgangsaanpassing",
          items: [
            "Denk na over hoeveel gewenning de nieuwe positie vraagt van je lichaam en je rijstijl.",
            "Een keuze die op papier iets minder is, kan toch beter zijn als die makkelijker te wennen en makkelijker fijn te tunen is.",
            "Koop je een andere fiets om klachten op te lossen, verlaag dan eerst het fitrisico in plaats van de meest agressieve cijfers na te jagen.",
          ],
        },
      ],
      faqs: [
        {
          q: "Als twee fietsen dezelfde stack en reach hebben, passen ze dan ook hetzelfde?",
          a: "Niet per se. Balhoofdbuisvorm, afstelbereik van de voorkant, stuurgeometrie en framegedrag kunnen de fiets nog steeds anders laten aanvoelen, zelfs als de hoofdwaarden gelijk zijn.",
        },
        {
          q: "Hoeveel kan ik na aankoop nog aanpassen aan een fiets?",
          a: "Best veel, maar alleen binnen redelijke grenzen. Stuurpen, spacers, stuur en zadelpositie kunnen een fit verfijnen, maar ze lossen niet elk geometrieverschil netjes op.",
        },
        {
          q: "Koop ik beter de geometrie die nu past of de geometrie die bij mijn doelpositie past?",
          a: "Als je vaak in je doelpositie rijdt, kies dan de geometrie die die positie ondersteunt. Ben je die houding nog aan het opbouwen, kies dan de fiets die je nu makkelijker en veiliger kunt rijden.",
        },
      ],
    },
  },
} satisfies GuideContentRecord;

export const SHOE_FOOT_GEOMETRY_GUIDE_CONTENT: GuideContentRecord = appendStructuralSections(
  appendGuideCopy(SHOE_FOOT_GEOMETRY_GUIDE_CONTENT_BASE),
);
