import type { GuideContentFaq, GuideContentRecord, GuideContentSection } from "../guide-content";
import { GUIDES } from "../../../app/(public)/guides/data";

const RIDE_TYPES_STRUCTURAL_SECTIONS = {
  en: [
    {
      title: "How to measure",
      type: "steps",
      items: [
        "You need: a tape measure, a digital level, a trainer or a familiar route, and for indoor work a fan and a thermometer if cooling is part of the issue.",
        "Step 1: record the current number that matters most for the discipline, such as saddle height and reach on road, bar width on gravel, or pad stack and reach on triathlon bikes.",
        "Step 2: repeat the measurement twice on the same bike and in the same shoes so you know the baseline is real.",
        "Step 3: test the setup on the ride type itself, not on a different bike or a very different route.",
        "Common mistake: judging a gravel, MTB, or triathlon setup by how it feels on a short smooth road spin.",
      ],
    },
    {
      title: "How to adjust",
      type: "steps",
      items: [
        "Change the setup in the order the discipline depends on it: saddle and support first, then cockpit, then width or pad placement, then fine-tuning details.",
        "Use small steps: 2 to 3 mm for saddle or support changes, 5 to 10 mm for stem or reach changes, 1 to 2 degrees for hood or pad angle, and about 2 cm for width changes when the rider needs more leverage or room.",
        "Test each change for 2 to 3 rides or one full event-style session before changing again.",
        "If the change helps one part of the ride but makes another part worse, move halfway back and compare again.",
      ],
    },
    {
      title: "Warning signs",
      items: [
        "Road riders usually notice hand, neck, or lower-back tension first when the cockpit or drop is too aggressive.",
        "Gravel riders often feel the warning in the shoulders, hands, or front-end control when width or stability is off.",
        "MTB riders often notice cramped standing posture, heavy brake hand load, or poor control in technical terrain.",
        "Sharp pain, numbness, swelling, or symptoms that persist after the ride are escalation signals for a fitter or clinician.",
      ],
    },
    {
      title: "Variations by rider type",
      type: "table",
      items: [],
      tableHeaders: ["Rider type", "Typical fit priority"],
      tableRows: [
        ["Road", "The most efficient and compact version of the setup, but only within the range the rider can hold for the full ride."],
        ["Gravel", "More control and tolerance for movement because rough surfaces expose marginal fits quickly."],
        ["MTB", "More movement room and front-end control, especially when standing, descending, or using a dropper post."],
        ["Triathlon / Endurance / Indoor", "Shift the priority toward the exact job of the bike: aero support, long-ride durability, or heat and static-pressure management."],
      ],
    },
    {
      title: "Practical recommendation",
      type: "prose",
      items: [
        "Start with the part of the position that the discipline depends on most: saddle and reach for road, width and control for gravel, and movement room for MTB.",
        "A calculator is enough when you are checking one obvious parameter; a full fit is better when the bike has to do more than one job or when symptoms keep returning.",
        "Make one change, test it in the real discipline, and only then move on to the next variable.",
      ],
    },
  ],
  nl: [
    {
      title: "Hoe je het meet",
      type: "steps",
      items: [
        "Je hebt nodig: een meetlint, een digitale waterpas, een trainer of een vertrouwde route, en voor indoor werk een ventilator en eventueel een thermometer als koeling onderdeel van het probleem is.",
        "Stap 1: noteer de huidige waarde die in jouw discipline het belangrijkst is, zoals zadelhoogte en reach op de weg, stuurbreedte op gravel of pad stack en reach op een triathlonfiets.",
        "Stap 2: herhaal de meting twee keer op dezelfde fiets en met dezelfde schoenen zodat je zeker weet dat de basis klopt.",
        "Stap 3: test de setup op het type rit zelf, niet op een heel andere fiets of een totaal andere route.",
        "Veelgemaakte fout: een gravel-, MTB- of triathlonsetup beoordelen op basis van een korte, vlakke road spin.",
      ],
    },
    {
      title: "Hoe je het afstelt",
      type: "steps",
      items: [
        "Verander de setup in de volgorde waarin de discipline daarom vraagt: eerst zadel en steun, dan cockpit, dan breedte of padpositie en pas daarna de finetuning.",
        "Werk in kleine stappen: 2 tot 3 mm voor zadel- of supportwijzigingen, 5 tot 10 mm voor stem- of reachaanpassingen, 1 tot 2 graden voor hood- of padhoek en ongeveer 2 cm voor breedtewijzigingen wanneer de rijder meer ruimte of leverage nodig heeft.",
        "Test elke wijziging 2 tot 3 ritten of één volledige session-achtige rit voordat je opnieuw aanpast.",
        "Helpt de wijziging op het ene punt maar maakt hij iets anders slechter, ga dan eerst halverwege terug en vergelijk opnieuw.",
      ],
    },
    {
      title: "Waarschuwingssignalen",
      items: [
        "Wegfietsers merken vaak eerst spanning in handen, nek of onderrug als de cockpit of drop te agressief is.",
        "Gravelrijders voelen het signaal vaak in schouders, handen of front-endcontrole wanneer breedte of stabiliteit niet klopt.",
        "MTB-rijders merken het vaak aan een gekrompen staande houding, zware belasting op de remhanden of minder controle op technisch terrein.",
        "Scherpe pijn, gevoelloosheid, zwelling of klachten die na de rit blijven bestaan zijn opschaalsignalen voor een fitter of arts.",
      ],
    },
    {
      title: "Verschillen per rijtype",
      type: "table",
      items: [],
      tableHeaders: ["Rijtype", "Typische fitprioriteit"],
      tableRows: [
        ["Weg", "De meest efficiënte en compacte versie van de setup, maar alleen binnen de bandbreedte die de rijder de hele rit kan vasthouden."],
        ["Gravel", "Meer controle en tolerantie voor beweging omdat ruwe ondergrond borderline fits sneller blootlegt."],
        ["MTB", "Meer bewegingsruimte en front-endcontrole, vooral bij staan, afdalen of rijden met een dropper post."],
        ["Triathlon / Endurance / Indoor", "Verschuif de prioriteit naar de echte taak van de fiets: aero-ondersteuning, houdbaarheid of warmte- en statische drukbeheersing."],
      ],
    },
    {
      title: "Praktische aanbeveling",
      type: "prose",
      items: [
        "Begin bij het deel van de positie waar jouw discipline het meest van afhangt: zadel en reach op de weg, breedte en controle op gravel en bewegingsruimte op MTB.",
        "Een calculator is genoeg als je één duidelijke parameter controleert; een volledige fit is beter wanneer de fiets meer dan één doel moet dienen of klachten terugkomen.",
        "Maak één wijziging, test die in de echte discipline en ga pas daarna door naar de volgende variabele.",
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
          sections: [...guide.en.sections, ...RIDE_TYPES_STRUCTURAL_SECTIONS.en],
        },
        nl: {
          ...guide.nl,
          sections: [...guide.nl.sections, ...RIDE_TYPES_STRUCTURAL_SECTIONS.nl],
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
    return `Use the ${cardTitle} to compare how ${subject.toLowerCase()} changes your fit priorities before you change the bike.`;
  }
  return `Gebruik de ${cardTitle} om te vergelijken hoe ${subject.toLowerCase()} je fitprioriteiten verandert voordat je aan de fiets sleutelt.`;
}

function buildFaqExtras(slug: string, locale: "en" | "nl"): GuideContentFaq[] {
  const cardTitle = getGuideCardTitle(slug, locale);
  const subject = getGuideSubject(cardTitle);
  if (locale === "en") {
    return [
      {
        q: `How do I know if ${subject.toLowerCase()} is the right discipline-specific choice for me?`,
        a: `If the bike feels more stable, more comfortable, or easier to hold for the rides you actually do, the setup is probably moving in the right direction. If it only feels good for one short test, keep testing in the real riding context.`,
      },
      {
        q: "When should I get a fitter instead of trying another adjustment?",
        a: "Get help when the position has to serve more than one job, when the same discomfort keeps coming back, or when a small change on its own is no longer enough to explain the result.",
      },
    ];
  }
  return [
    {
      q: `Hoe weet ik of ${subject.toLowerCase()} de juiste disciplinekeuze voor mij is?`,
      a: `Als de fiets stabieler, comfortabeler of makkelijker te dragen voelt voor de ritten die jij echt rijdt, beweegt de setup waarschijnlijk de goede kant op. Voelt het alleen goed in één korte test, blijf dan testen in de echte rijcontext.`,
    },
    {
      q: "Wanneer schakel ik een fitter in in plaats van nog een aanpassing te proberen?",
      a: "Schakel hulp in als de positie meer dan één taak moet vervullen, als hetzelfde ongemak terugkomt of als een kleine wijziging alleen niet meer genoeg verklaart wat je voelt.",
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
const RIDE_TYPES_GUIDE_CONTENT_BASE = {
  "road-bike-fit-guide": {
    en: {
      intro: [
        "Road-bike fit is a tradeoff between sustainable comfort and aerodynamic speed. The best position is not the one that looks lowest in a parking-lot photo, but the one you can hold when the ride becomes long, hilly, or hard.",
        "For most riders, the saddle is the foundation. Once saddle height and support are stable, you can judge reach, bar drop, and hood position with much better clarity because the pelvis is not already fighting the cockpit.",
        "Road fit should also match your goal. An endurance setup and a race setup both need stable pedaling, but they ask for different amounts of hip closure, reach, and time spent in the drops.",
      ],
      sections: [
        {
          title: "Saddle setup: the foundation of road fit",
          items: [
            "Lock in saddle height, setback, and tilt before you chase a lower front end, because a bad saddle position will distort every cockpit decision that follows.",
            "If you are sliding forward, bracing with your hands, or rocking at the hips, the road fit problem often starts at the saddle rather than the bars.",
            "A stable saddle lets you judge pressure and load honestly on the road, which is especially important when you switch between steady endurance riding and harder race efforts.",
          ],
        },
        {
          title: "Reach and cockpit: endurance vs race priorities",
          items: [
            "Endurance road fit usually wants a slightly shorter and more relaxed cockpit so the shoulders stay calm and the rider can stay compact without tension.",
            "Race fit can be longer, but only if you can keep the pelvis stable and keep pressure off the hands when the effort rises.",
            "Stem length, hood rotation, and bar shape all contribute to total reach, so do not treat them as separate, isolated fixes.",
          ],
        },
        {
          title: "Bar drop: matching flexibility to goal",
          items: [
            "Bar drop should reflect hip flexor length, hamstring tolerance, and core control, not just what is popular in a pro peloton photo.",
            "If the drop forces you to round the lower back or crowd the hips, the apparent aero gain is often canceled by worse stability and less consistent power.",
            "A useful road fit can be moderately aggressive and still sustainable if the rider can breathe, hinge, and support the torso without strain.",
          ],
        },
        {
          title: "Adaptation: how long position changes take to feel right",
          items: [
            "A small road-fit change can feel strange for one or two rides even when it is correct, because your tissue tolerance and motor pattern need time to adapt.",
            "Bigger changes, especially a lower front end or longer reach, should be tested over several rides before you decide the setup is wrong.",
            "Use the same route, pacing, and weather as much as possible so you can separate true adaptation issues from random ride variation.",
          ],
        },
      ],
      faqs: [
        {
          q: "What is the difference between an endurance and a race fit?",
          a: "Endurance fit keeps a little more support and breathing room so you can stay fresh longer. Race fit usually lowers the front end and extends the cockpit more, but only if you can still hold it under load.",
        },
        {
          q: "Should I always ride in the drops?",
          a: "No. The drops are a tool for specific moments, not a default posture for every rider and every segment. Use them when the position stays stable and when the terrain or speed justifies it.",
        },
        {
          q: "How do I know if my road position is sustainable?",
          a: "A sustainable road position feels controlled after the first hour, keeps your hands and neck calm, and does not collapse when you ride harder or longer than usual.",
        },
      ],
    },
    nl: {
      intro: [
        "Racefiets-fit is een afweging tussen duurzaam comfort en aerodynamische snelheid. De beste positie is niet de laagste stand op een parkeerplaatsfoto, maar de houding die je ook kunt vasthouden als de rit lang, heuvelachtig of zwaar wordt.",
        "Voor de meeste rijders is het zadel het startpunt. Zodra zadelhoogte en ondersteuning kloppen, kun je reach, stuurdrop en hoodpositie veel zuiverder beoordelen omdat het bekken niet al tegen de cockpit hoeft te vechten.",
        "Racefiets-fit moet ook passen bij je doel. Een endurance-opstelling en een race-opstelling vragen allebei om stabiel trappen, maar verschillen in hoeveel heupsluiting, reach en tijd in de drops houdbaar is.",
      ],
      sections: [
        {
          title: "Zadelafstelling: de basis van racefiets-fit",
          items: [
            "Zet zadelhoogte, setback en kanteling vast voordat je de voorkant lager zet, omdat een slecht zadel de hele vervolgbeslissing vertekent.",
            "Als je naar voren schuift, je op je handen steunt of met de heupen wiebelt, begint het probleem vaak bij het zadel en niet bij het stuur.",
            "Een stabiel zadel laat je druk en belasting eerlijk voelen op de weg, vooral als je wisselt tussen rustige endurance-ritten en hardere race-inspanningen.",
          ],
        },
        {
          title: "Reach en cockpit: endurance versus race prioriteiten",
          items: [
            "Een endurance-racefietsfit vraagt meestal om een iets kortere en rustigere cockpit zodat de schouders ontspannen blijven en je compact kunt blijven zonder spanning.",
            "Een racefit mag langer zijn, maar alleen als je het bekken stabiel houdt en de handen niet overbelast wanneer het tempo omhoog gaat.",
            "Stuurpenlengte, hoodrotatie en barvorm bepalen samen de totale reach, dus behandel ze niet als losse, aparte oplossingen.",
          ],
        },
        {
          title: "Stuurdrop: afstemmen op flexibiliteit en doel",
          items: [
            "Stuurdrop moet passen bij heupflexibiliteit, hamstringtolerantie en corecontrole, niet alleen bij wat er in een profkoersfoto goed uitziet.",
            "Als de drop je onderrug laat rond worden of je heupen dichtknijpt, verdwijnt het vermeende aero-voordeel vaak in slechtere stabiliteit en minder constant vermogen.",
            "Een bruikbare racefietspositie mag best sportief zijn en toch houdbaar blijven, zolang je nog kunt ademen, heupen kunt scharnieren en de romp kunt dragen zonder spanning.",
          ],
        },
        {
          title: "Adaptatie: hoe lang een positie-wijziging nodig heeft",
          items: [
            "Een kleine racefietsaanpassing kan een of twee ritten vreemd voelen, ook als die correct is, omdat weefsels en motoriek tijd nodig hebben om te wennen.",
            "Grotere aanpassingen, vooral een lagere voorkant of langere reach, moet je over meerdere ritten testen voordat je beslist dat de setup fout is.",
            "Gebruik zo veel mogelijk dezelfde route, inspanning en weersomstandigheden, zodat je echte adaptatie kunt onderscheiden van toevallige ritverschillen.",
          ],
        },
      ],
      faqs: [
        {
          q: "Wat is het verschil tussen een endurance- en een racefit?",
          a: "Een endurance-fit houdt iets meer steun en ademruimte over zodat je langer fris blijft. Een racefit zet meestal de voorkant lager en de cockpit langer, maar alleen als je dat onder belasting kunt vasthouden.",
        },
        {
          q: "Moet ik altijd in de drops rijden?",
          a: "Nee. De drops zijn een hulpmiddel voor specifieke momenten, geen standaardhouding voor elke rijder en elke rit. Gebruik ze alleen wanneer de positie stabiel blijft en de situatie erom vraagt.",
        },
        {
          q: "Hoe weet ik of mijn racefietspositie houdbaar is?",
          a: "Een houdbare racefietspositie voelt na het eerste uur nog steeds gecontroleerd, houdt handen en nek rustig en stort niet in wanneer je harder of langer rijdt dan normaal.",
        },
      ],
    },
  },

  "gravel-bike-fit-guide": {
    en: {
      intro: [
        "Gravel fit is about control and compliance first, not chasing the lowest possible front end. Rough surfaces punish a position that looks fast on paper but loads the hands, shoulders, and lower back too aggressively.",
        "A good gravel fit usually behaves more like endurance road fit than MTB fit. You still want efficient pedaling, but you also need room for body movement, traction changes, and long hours on broken terrain.",
        "The bar, saddle, and tyre pressure all shape how the bike feels. If one of those is off, the whole gravel setup can feel nervous even when the static numbers look reasonable.",
      ],
      sections: [
        {
          title: "Weight distribution on rough terrain",
          items: [
            "On gravel, the front end must stay calm enough for steering but open enough that your arms are not absorbing every vibration.",
            "A slightly rearward, balanced weight distribution often feels safer than a road-race stance because it gives you more control when the surface breaks up.",
            "The goal is to keep the bike predictable when you move between seated pedaling, standing climbs, and short technical corrections.",
          ],
        },
        {
          title: "Bar width and control",
          items: [
            "Wider bars can improve leverage on loose terrain, but too much width can stretch the shoulders and create unnecessary upper-body fatigue.",
            "Choose bar width based on shoulder width, terrain, and how much control you need on descents or under braking.",
            "Hood angle and flare matter as much as raw width, because hand position changes how stable the front end feels on rough ground.",
          ],
        },
        {
          title: "Saddle and cockpit for mixed-surface comfort",
          items: [
            "Gravel fit should still start with a stable saddle, because bouncing or sliding on the saddle makes the cockpit feel worse than it is.",
            "A cockpit that is a little shorter and calmer than a pure race-road setup often works better for long mixed-surface days.",
            "If the lower back or neck complains on gravel but not on road, the issue is often a combination of reach, vibration, and how much the body has to brace.",
          ],
        },
        {
          title: "Tyre pressure and how it changes how your fit feels",
          items: [
            "Tyre pressure changes the effective fit because it changes how much vibration reaches your hands, saddle, and torso.",
            "Too much pressure can make a reasonable position feel harsh, while lower pressure can let a more relaxed setup feel controlled and connected.",
            "Always evaluate gravel fit with realistic tyre pressure, since a static indoor check can miss the very thing that makes gravel unique.",
          ],
        },
      ],
      faqs: [
        {
          q: "Is a gravel fit just a more upright road fit?",
          a: "Not exactly. Gravel fit is usually a bit calmer than road fit, but it also has to handle loose surfaces, more movement, and different control demands.",
        },
        {
          q: "How wide should my gravel bars be?",
          a: "There is no single number. Start with shoulder width, then adjust for terrain, riding style, and whether you need more stability or a slightly tighter upper-body position.",
        },
        {
          q: "Why does my lower back hurt on gravel but not on the road?",
          a: "Gravel adds vibration, steering corrections, and more body bracing. A position that works on smooth road can become too demanding once the surface gets rough.",
        },
      ],
    },
    nl: {
      intro: [
        "Gravel-fit draait eerst om controle en demping, niet om de laagst mogelijke voorkant. Ruwe ondergrond straft een positie af die op papier snel lijkt maar handen, schouders en onderrug te hard belast.",
        "Een goede gravel-fit lijkt meestal meer op endurance-road-fit dan op MTB-fit. Je wilt nog steeds efficiënt trappen, maar ook ruimte houden voor lichaamsbeweging, wisselende grip en lange uren op gebroken terrein.",
        "Stuur, zadel en bandenspanning bepalen samen hoe de fiets aanvoelt. Als een van die factoren niet klopt, kan de hele gravelopstelling onrustig voelen terwijl de statische cijfers prima lijken.",
      ],
      sections: [
        {
          title: "Gewichtsverdeling op ruwe ondergrond",
          items: [
            "Op gravel moet de voorkant rustig genoeg blijven om te sturen, maar ook open genoeg zodat je armen niet elke trilling opvangen.",
            "Een iets meer gebalanceerde of licht achterwaartse verdeling voelt vaak veiliger dan een pure racehouding omdat je meer controle houdt als de ondergrond breekt.",
            "Het doel is een voorspelbare fiets wanneer je wisselt tussen zittend trappen, staand klimmen en korte technische correcties.",
          ],
        },
        {
          title: "Stuurbreedte en controle",
          items: [
            "Een breder stuur kan meer hefboom geven op losse ondergrond, maar te veel breedte trekt de schouders open en geeft onnodige bovenlichaamvermoeidheid.",
            "Kies stuurbreedte op basis van schouderbreedte, terrein en hoeveel controle je nodig hebt bij afdalingen of remmen.",
            "Hoodhoek en flare zijn net zo belangrijk als de pure breedte, omdat handpositie bepaalt hoe stabiel de voorkant aanvoelt.",
          ],
        },
        {
          title: "Zadel en cockpit voor comfort op gemengd terrein",
          items: [
            "Gravel-fit begint nog steeds met een stabiel zadel, omdat stuiteren of schuiven op het zadel de cockpit vaak slechter doet aanvoelen dan hij is.",
            "Een cockpit die iets korter en rustiger is dan een pure race-opstelling werkt vaak beter voor lange dagen met gemengd terrein.",
            "Als je onderrug of nek op gravel meer klaagt dan op de weg, is de oorzaak vaak een combinatie van reach, trillingen en hoeveel het lichaam moet meebracen.",
          ],
        },
        {
          title: "Bandenspanning en het effect op fitgevoel",
          items: [
            "Bandenspanning verandert de effectieve fit omdat het bepaalt hoeveel trillingen je handen, zadel en romp bereiken.",
            "Te veel druk kan een goede positie hard laten voelen, terwijl lagere druk een ontspannen setup juist rustiger en meer verbonden kan maken.",
            "Beoordeel gravel-fit altijd met realistische bandendruk, want een statische check mist precies de factor die gravel uniek maakt.",
          ],
        },
      ],
      faqs: [
        {
          q: "Is een gravel-fit gewoon een rechtere racefiets-fit?",
          a: "Niet helemaal. Gravel-fit is meestal iets rustiger dan racefiets-fit, maar moet ook losse ondergrond, meer beweging en andere controle-eisen aankunnen.",
        },
        {
          q: "Hoe breed moeten mijn gravelsturen zijn?",
          a: "Er is geen enkel juist getal. Begin bij je schouderbreedte en stel daarna bij op basis van terrein, rijstijl en of je meer stabiliteit of juist een compacter bovenlichaam wilt.",
        },
        {
          q: "Waarom heb ik op gravel wel onderrugpijn en op de weg niet?",
          a: "Gravel voegt trillingen, stuurcorrecties en meer lichaamsbracing toe. Een positie die op glad asfalt werkt, kan op ruw terrein te zwaar worden.",
        },
      ],
    },
  },

  "mountain-bike-fit-guide": {
    en: {
      intro: [
        "Mountain bike fit is dynamic. You are not just setting up a seated pedaling posture; you are preparing for standing attacks, technical braking, climbing traction, and frequent body movement over the bike.",
        "Because the rider moves more on an MTB, the fit goal is control first and efficiency second. A setup that feels perfect in a static shop check can still fail if it blocks movement on trail.",
        "The best MTB position gives you room to shift weight, absorb impacts, and keep the bike predictable when the terrain gets steep or technical.",
      ],
      sections: [
        {
          title: "Standing position and attack stance",
          items: [
            "When you stand, the bike becomes part of a moving system, so the fit has to support a ready stance instead of a locked seated posture.",
            "The attack position needs enough room at the hips and shoulders for quick corrections without feeling stretched or crowded.",
            "If you cannot comfortably stand neutral with the bars under control, the cockpit is probably too long, too low, or both for your trail use.",
          ],
        },
        {
          title: "Seated climbing: traction and efficiency",
          items: [
            "On climbs, saddle height still matters, but the real goal is keeping traction while producing useful power and staying balanced over the bike.",
            "A seated climbing position that is too stretched makes it hard to keep weight where it belongs, which can hurt rear-wheel grip.",
            "Find the point where pedaling feels efficient without forcing you to brace through the upper body to stay in line.",
          ],
        },
        {
          title: "Cockpit reach for trail control",
          items: [
            "Reach on an MTB is about front-wheel control, not just efficiency per pedal stroke.",
            "A slightly shorter cockpit can improve steering confidence in technical terrain, while a longer one may help at speed if you still retain quick control.",
            "Stem length, bar sweep, and lever reach all change how the bike responds when you are moving around the cockpit on trail.",
          ],
        },
        {
          title: "Dropper post: how it changes your fit needs",
          items: [
            "A dropper post changes what fit means because the saddle height is no longer fixed for every part of the ride.",
            "With a dropper, the seated climbing height and the technical descending height can be different, so you should judge the bike in both positions.",
            "If your saddle feels perfect only when the dropper is up or only when it is down, the rest of the setup may still need refinement.",
          ],
        },
      ],
      faqs: [
        {
          q: "Is my MTB saddle height the same as my road saddle height?",
          a: "Often it is similar for seated pedaling, but MTB riding changes the context. Because you stand, descend, and move more, the practical target can feel different once trail use is added.",
        },
        {
          q: "How does bar height affect my trail confidence?",
          a: "Bar height changes how easy it is to move around the bike and keep the front wheel calm. Too low can feel cramped, while too high can reduce front-end precision.",
        },
        {
          q: "Why do my arms get tired on technical terrain?",
          a: "Technical terrain makes you steer, brace, and absorb impacts more often. If the cockpit is too long or too low, the arms end up doing too much of that work.",
        },
      ],
    },
    nl: {
      intro: [
        "MTB-fit is dynamisch. Je stelt niet alleen een zittende trappositie in; je bereidt de fiets voor op staande aanvallen, technisch remmen, klimtractie en veel lichaamsbeweging over de fiets heen.",
        "Omdat de rijder op een MTB meer beweegt, staat controle voorop en efficiency pas daarna. Een setup die in de winkel statisch goed voelt, kan op trail alsnog tekortschieten als hij beweging blokkeert.",
        "De beste MTB-positie geeft ruimte om gewicht te verplaatsen, klappen op te vangen en de fiets voorspelbaar te houden wanneer het terrein steil of technisch wordt.",
      ],
      sections: [
        {
          title: "Staand rijden en attack stance",
          items: [
            "Wanneer je staat, wordt de fiets onderdeel van een bewegend systeem, dus de fit moet een actieve houding ondersteunen in plaats van een vaste zittende positie.",
            "De attack stance heeft genoeg ruimte nodig bij heupen en schouders om snel te kunnen corrigeren zonder strak of opgesloten te voelen.",
            "Als je niet comfortabel neutraal kunt staan met het stuur onder controle, is de cockpit waarschijnlijk te lang, te laag of beide voor jouw trailgebruik.",
          ],
        },
        {
          title: "Zittend klimmen: tractie en efficiency",
          items: [
            "Bij klimmen blijft zadelhoogte belangrijk, maar het echte doel is tractie houden terwijl je nuttig vermogen levert en in balans blijft.",
            "Een zittende klimpositie die te lang aanvoelt maakt het moeilijk om het gewicht goed te plaatsen, en dat kan de grip achter verminderen.",
            "Zoek het punt waar trappen efficiënt voelt zonder dat je bovenlichaam te hard moet bracen om op lijn te blijven.",
          ],
        },
        {
          title: "Cockpit reach voor trailcontrole",
          items: [
            "Reach op een MTB draait om controle over het voorwiel, niet alleen om efficiency per pedaalslag.",
            "Een iets kortere cockpit kan vertrouwen geven in technisch terrein, terwijl een langere cockpit op snelheid kan helpen als je de fiets nog snel kunt sturen.",
            "Stuurpenlengte, bar sweep en remgreepreach veranderen allemaal hoe de fiets reageert wanneer je veel beweegt op trail.",
          ],
        },
        {
          title: "Dropper post: hoe die je fit verandert",
          items: [
            "Een dropper post verandert wat fit betekent, omdat de zadelhoogte niet meer voor elk deel van de rit vaststaat.",
            "Met een dropper kunnen de hoogte voor zittend klimmen en de hoogte voor technisch dalen verschillen, dus beoordeel de fiets in beide posities.",
            "Als je zadel alleen goed voelt met de dropper omhoog of alleen met de dropper omlaag, moet de rest van de setup mogelijk nog fijner worden afgesteld.",
          ],
        },
      ],
      faqs: [
        {
          q: "Is mijn MTB-zadelhoogte hetzelfde als op de racefiets?",
          a: "Vaak lijkt die er dichtbij in de buurt, maar MTB verandert de context. Omdat je meer staat, daalt en beweegt, kan de praktische afstelling anders aanvoelen zodra trailgebruik meeweegt.",
        },
        {
          q: "Hoe beinvloedt stuurhoogte mijn vertrouwen op trail?",
          a: "Stuurhoogte verandert hoe makkelijk je rond de fiets beweegt en hoe rustig het voorwiel aanvoelt. Te laag kan benauwd voelen, te hoog kan precisie wegnemen.",
        },
        {
          q: "Waarom worden mijn armen moe op technisch terrein?",
          a: "Technisch terrein vraagt meer sturen, bracen en schokken opvangen. Als de cockpit te lang of te laag is, gaan de armen te veel van dat werk dragen.",
        },
      ],
    },
  },

  "triathlon-bike-fit-guide": {
    en: {
      intro: [
        "Triathlon fit is about sustainable aerodynamics, not just minimum drag. The position must let you produce power, stay stable, and still run well after the bike leg.",
        "Hip angle is the key limiter on a tri setup. If the front end closes the hips too much, the fit may look fast but can reduce power, breathing, and run readiness.",
        "Pad stack, pad width, and saddle support are the main levers. Once those are close, you can judge how far to extend the position without breaking sustainability.",
      ],
      sections: [
        {
          title: "Hip angle: the number that limits everything",
          items: [
            "A triathlon position should keep the hips open enough to breathe, produce force, and preserve enough function for the run afterward.",
            "If the hips close too far, riders often compensate with the lower back, shoulders, or neck, which makes the aero gain harder to hold.",
            "The right hip angle depends on mobility, saddle choice, and how aggressively you want to ride before the transition to running.",
          ],
        },
        {
          title: "Aero extension setup: stack, reach, and pad width",
          items: [
            "Pad stack controls how low the front end sits, while pad reach controls how stretched the shoulders and trunk become.",
            "Pad width matters because it changes support and breathing efficiency, especially when the position gets long and narrow.",
            "A fast tri fit is one where the aero bars feel like support, not a place where you are hanging on for dear life.",
          ],
        },
        {
          title: "Saddle support on a TT bike",
          items: [
            "The saddle must support the pelvis without forcing too much forward rotation or excessive pressure on sensitive tissues.",
            "Small changes in saddle shape or setback can radically change how easy it is to stay in aero for long periods.",
            "If you cannot stay centered on the saddle, the front end and the saddle are probably fighting each other.",
          ],
        },
        {
          title: "Run preservation: what to check in transition pace",
          items: [
            "The real test of a tri fit is often the first run off the bike, because it reveals whether the position preserved the movement pattern you need for running.",
            "If your hip flexors, lower back, or hamstrings feel locked up after the bike, the position may be too closed or too demanding.",
            "Check the fit at race intensity, not just during easy spinning, because the transition problem often shows up only when the effort is real.",
          ],
        },
      ],
      faqs: [
        {
          q: "What hip angle should I target for a triathlon fit?",
          a: "There is no universal number. The target is the most closed angle you can hold while still breathing well, producing power, and running adequately off the bike.",
        },
        {
          q: "How do I know if my aero position is hurting my run?",
          a: "Look for heavy hip flexors, locked hamstrings, or a run that feels limited immediately out of transition. Those are signs the bike position is costing you run quality.",
        },
        {
          q: "Do I need a dedicated TT bike for a triathlon fit?",
          a: "Not always. A dedicated TT bike helps you build a true aero position, but the real question is whether the bike and fit can deliver the sustainability your race demands.",
        },
      ],
    },
    nl: {
      intro: [
        "Triathlon-fit draait om duurzame aerodynamica, niet alleen om minimale luchtweerstand. De houding moet vermogen laten leveren, stabiel blijven en je nog steeds goed laten lopen na het fietsonderdeel.",
        "Heuphoek is de belangrijkste begrenzing op een tri-opstelling. Als de voorkant de heupen te ver sluit, ziet de fit er misschien snel uit, maar kan hij vermogen, ademhaling en loopklaarheid verminderen.",
        "Pad stack, padbreedte en zadelondersteuning zijn de belangrijkste hefbomen. Als die dicht bij elkaar liggen, kun je bepalen hoe ver je de houding kunt verlengen zonder de houdbaarheid te breken.",
      ],
      sections: [
        {
          title: "Heuphoek: de getal dat alles begrenst",
          items: [
            "Een triathlonpositie moet de heupen open genoeg houden om te ademen, kracht te leveren en nog functioneel te blijven voor het lopen daarna.",
            "Als de heupen te ver sluiten, compenseert de rijder vaak met onderrug, schouders of nek, waardoor het aero-voordeel moeilijker vast te houden is.",
            "De juiste heuphoek hangt af van mobiliteit, zadelkeuze en hoe agressief je wilt rijden voordat je overgaat naar het lopen.",
          ],
        },
        {
          title: "Aero-extensions: stack, reach en padbreedte",
          items: [
            "Pad stack bepaalt hoe laag de voorkant staat, terwijl pad reach bepaalt hoe ver schouders en romp worden uitgestrekt.",
            "Padbreedte is belangrijk omdat die steun en ademhalingsruimte verandert, vooral als de positie lang en smal wordt.",
            "Een snelle tri-fit voelt als ondersteuning in de aero bars, niet alsof je er met moeite aan blijft hangen.",
          ],
        },
        {
          title: "Zadelondersteuning op een TT-fiets",
          items: [
            "Het zadel moet het bekken ondersteunen zonder te veel voorwaartse rotatie of te veel druk op gevoelige zones te forceren.",
            "Kleine veranderingen in zadelvorm of setback kunnen sterk bepalen hoe lang je aero kunt blijven zitten.",
            "Als je niet gecentreerd op het zadel kunt blijven, vechten de voorkant en het zadel waarschijnlijk tegen elkaar.",
          ],
        },
        {
          title: "Loopbehoud: wat je bij transition pace controleert",
          items: [
            "De echte test van een tri-fit zit vaak in de eerste run na de fiets, omdat daar zichtbaar wordt of de houding de loopbeweging heeft behouden.",
            "Als heupflexoren, onderrug of hamstrings na de fiets opgesloten voelen, is de houding mogelijk te gesloten of te zwaar.",
            "Controleer de fit op wedstrijdintensiteit, niet alleen rustig, want het overgangsprobleem verschijnt vaak pas als het echt hard gaat.",
          ],
        },
      ],
      faqs: [
        {
          q: "Welke heuphoek moet ik targeten voor een triathlon-fit?",
          a: "Er bestaat geen universeel getal. Het doel is de meest gesloten hoek die je nog goed kunt vasthouden terwijl je blijft ademen, vermogen levert en voldoende kunt lopen na de fiets.",
        },
        {
          q: "Hoe weet ik of mijn aero-houding mijn looponderdeel schaadt?",
          a: "Let op zware heupflexoren, vastgezette hamstrings of een loop die direct na de fiets beperkt voelt. Dat zijn signalen dat de fietspositie je loopkwaliteit kost.",
        },
        {
          q: "Heb ik een aparte TT-fiets nodig voor een triathlon-fit?",
          a: "Niet altijd. Een aparte TT-fiets helpt wel om een echte aero-houding te bouwen, maar de echte vraag is of fiets en fit de houdbaarheid leveren die jouw race vraagt.",
        },
      ],
    },
  },

  "endurance-bike-fit-guide": {
    en: {
      intro: [
        "Endurance fit is about durability over many hours, not just comfort for the first ten minutes. The position should keep you productive when fatigue, small posture errors, and long time in the saddle start to accumulate.",
        "Endurance does not simply mean more upright. It means the bike is tuned so the rider can hold a calm, efficient posture for the longest ride they normally do without building avoidable strain.",
        "The most useful endurance setup protects the things that degrade first: lower back support, hand comfort, breathing space, and a stable pelvis that can keep pedaling smoothly as the ride goes on.",
      ],
      sections: [
        {
          title: "What makes a fit truly endurance-appropriate",
          items: [
            "An endurance fit should let you stay steady, breathe well, and produce useful power after hours instead of only feeling good at the start.",
            "The posture should reduce the amount of bracing needed from the hands, neck, and lower back so the body can spend energy on riding.",
            "If a setup feels fine for 45 minutes but falls apart after two hours, it is not endurance-appropriate yet.",
          ],
        },
        {
          title: "Saddle and pelvic support for long rides",
          items: [
            "Long rides expose poor saddle support quickly because even small pressure problems compound over time.",
            "The saddle should let the pelvis stay settled without forcing frequent micro-adjustments just to stay comfortable.",
            "When saddle support is right, the rider can keep the torso calmer and avoid wasting energy holding themselves up.",
          ],
        },
        {
          title: "Cockpit length and fatigue management",
          items: [
            "A slightly calmer cockpit often improves endurance because it reduces load in the upper body and keeps the front end easy to manage late in the ride.",
            "Reach should let you relax the shoulders without collapsing the chest or forcing the rider to brace through the arms.",
            "If the cockpit is too long, the bike may feel efficient for a few minutes but become progressively harder to support.",
          ],
        },
        {
          title: "Calibrating for your longest typical ride",
          items: [
            "Endurance fit should be judged against your real longest ride, not just the short spins that feel easy in the first half hour.",
            "Test the setup in weather, terrain, and pacing conditions that look like your normal big day, because endurance failures often hide in real-world variation.",
            "If the longest ride is still comfortable, shorter rides almost always benefit from the same setup.",
          ],
        },
      ],
      faqs: [
        {
          q: "What is the difference between an endurance fit and a comfort fit?",
          a: "Comfort fit is usually the broad, easy baseline. Endurance fit is more specific: it keeps you comfortable enough to hold a productive position for long rides without turning the bike into a lazy setup.",
        },
        {
          q: "Can I do long rides in an aggressive race position?",
          a: "Yes, if the position is truly sustainable for you. The problem is that many aggressive setups look good briefly but become limiting once fatigue and hours on the bike add up.",
        },
        {
          q: "How do I build toward a more aggressive position over time?",
          a: "Make one small change at a time, give it multiple rides, and only advance the position if the current one stays stable late in the longest ride you care about.",
        },
      ],
    },
    nl: {
      intro: [
        "Endurance-fit draait om houdbaarheid over vele uren, niet alleen om comfort in de eerste tien minuten. De positie moet je productief houden wanneer vermoeidheid, kleine houdingsfouten en veel tijd in het zadel zich opstapelen.",
        "Endurance betekent niet simpelweg rechter zitten. Het betekent dat de fiets zo is afgestemd dat de rijder een rustige, efficiënte houding kan vasthouden voor de langste rit die hij normaal maakt zonder vermijdbare belasting op te bouwen.",
        "De meest bruikbare endurance-opstelling beschermt juist de onderdelen die het eerst verslechteren: steun voor de onderrug, comfort voor de handen, ademruimte en een stabiel bekken dat soepel blijft trappen.",
      ],
      sections: [
        {
          title: "Wat een fit echt endurance-geschikt maakt",
          items: [
            "Een endurance-fit moet je in staat stellen om na uren nog stabiel te blijven, goed te ademen en nuttig vermogen te leveren.",
            "De houding moet de noodzaak tot bracen via handen, nek en onderrug verlagen, zodat het lichaam energie kan gebruiken om te rijden.",
            "Als een setup 45 minuten goed voelt maar na twee uur inzakt, is hij nog niet echt endurance-geschikt.",
          ],
        },
        {
          title: "Zadel en bekkensteun voor lange ritten",
          items: [
            "Lange ritten onthullen slechte zadelondersteuning snel, omdat kleine drukproblemen zich door de tijd heen opstapelen.",
            "Het zadel moet het bekken laten rusten zonder dat je voortdurend kleine correcties hoeft te maken om comfortabel te blijven.",
            "Als zadelondersteuning goed is, blijft de romp rustiger en verspilt de rijder minder energie aan zichzelf overeind houden.",
          ],
        },
        {
          title: "Cockpitlengte en vermoeidheidsbeheersing",
          items: [
            "Een iets rustigere cockpit werkt vaak beter voor endurance, omdat die de bovenlichaamsbelasting verlaagt en de voorkant later op de rit makkelijker maakt.",
            "Reach moet de schouders laten ontspannen zonder de borst te laten instorten of de rijder via de armen te laten bracen.",
            "Is de cockpit te lang, dan voelt de fiets misschien kort goed aan, maar wordt hij gaandeweg steeds zwaarder om te dragen.",
          ],
        },
        {
          title: "Afstemmen op je langste gebruikelijke rit",
          items: [
            "Endurance-fit moet je beoordelen op je echte langste rit, niet op de korte spin die na dertig minuten nog altijd makkelijk voelt.",
            "Test in weer, terrein en tempo die lijken op je normale grote rit, omdat endurance-problemen vaak pas in echte omstandigheden zichtbaar worden.",
            "Als de langste rit goed gaat, profiteren kortere ritten meestal ook van dezelfde setup.",
          ],
        },
      ],
      faqs: [
        {
          q: "Wat is het verschil tussen een endurance-fit en een comfort-fit?",
          a: "Comfort-fit is meestal de brede, makkelijke basis. Endurance-fit is specifieker: die houdt je comfortabel genoeg om een productieve houding lang vol te houden zonder van de fiets een te gemakzuchtige setup te maken.",
        },
        {
          q: "Kan ik lange ritten doen in een agressieve racepositie?",
          a: "Ja, als die positie echt houdbaar voor jou is. Het probleem is dat veel agressieve setups er eerst goed uitzien maar limiterend worden zodra vermoeidheid en vele uren meespelen.",
        },
        {
          q: "Hoe bouw ik toe naar een agressievere positie?",
          a: "Verander steeds maar een kleine factor, geef die meerdere ritten, en ga alleen verder als de huidige positie nog steeds stabiel blijft aan het einde van je langste rit.",
        },
      ],
    },
  },

  "indoor-trainer-bike-fit-guide": {
    en: {
      intro: [
        "Indoor riding magnifies fit problems because the bike cannot move around under you the way it does on the road. Without vibration and small body shifts, every contact point becomes more static and every pressure issue becomes easier to notice.",
        "Trainer fit often needs to be checked separately from outdoor fit because sweat, cooling, saddle pressure, and fixed body position create a different load pattern.",
        "The right indoor setup is not necessarily a different bike fit, but it often is a different check order: saddle pressure, cooling, and cockpit tolerance usually matter more than they do outside.",
      ],
      sections: [
        {
          title: "Why your indoor position needs to be checked separately",
          items: [
            "A trainer removes road texture and many small compensations, so issues that are mild outdoors can become obvious indoors.",
            "Fixed resistance and low variation can make a normal road position feel harsher because the body cannot micro-adjust as much.",
            "If the bike feels fine outside but wrong indoors, treat that as a real setup difference rather than ignoring it.",
          ],
        },
        {
          title: "Saddle pressure and the static load problem",
          items: [
            "Indoor riding often increases saddle pressure because you sit more still and do not get the same side-to-side relief you get outdoors.",
            "A saddle that is tolerable outside can still create hotspots indoors if the support area or tilt is not well matched.",
            "Small saddle changes and a little more movement freedom can make indoor pressure feel dramatically better.",
          ],
        },
        {
          title: "Reach and head position on a fixed trainer",
          items: [
            "On a trainer, reach affects how much the torso has to brace when the body is already more static than usual.",
            "If the cockpit is too long, the neck and shoulders often feel the extra load quickly because the rider cannot shift around as much.",
            "A slightly calmer indoor cockpit can keep head position and breathing more relaxed without changing the outdoor bike too aggressively.",
          ],
        },
        {
          title: "Cooling, sweat, and their effect on hotspot development",
          items: [
            "Ventilation is part of fit indoors because heat and sweat increase friction, pressure sensitivity, and discomfort.",
            "A strong fan can make the same saddle and cockpit feel much more manageable by reducing tissue swelling and keeping the rider cooler.",
            "If indoor fit problems build slowly over a session, cooling is one of the first variables to check before you change hardware.",
          ],
        },
      ],
      faqs: [
        {
          q: "Should my trainer setup match my outdoor setup exactly?",
          a: "Not always. The outdoor bike may be the same, but the indoor environment changes pressure, cooling, and movement, so a small indoor-specific adjustment can be justified.",
        },
        {
          q: "Why do I get saddle sores indoors but not outdoors?",
          a: "Indoors you sit more still, sweat more, and often lose the tiny movement that relieves pressure outside. That combination can create hotspots even when the outdoor fit is fine.",
        },
        {
          q: "Does fan placement affect how my fit feels?",
          a: "Yes. Better cooling can change how much pressure and heat you feel, so fan setup is a real part of indoor fit rather than just a comfort extra.",
        },
      ],
    },
    nl: {
      intro: [
        "Indoor rijden vergroot fitproblemen omdat de fiets onder je niet beweegt zoals buiten op de weg. Zonder trillingen en kleine lichaamsverplaatsingen wordt elk contactpunt statischer en wordt elk drukprobleem sneller zichtbaar.",
        "Trainer-fit moet vaak apart worden beoordeeld van outdoor-fit, omdat zweet, koeling, zadeldruk en een vaste lichaamspositie een ander belastingspatroon geven.",
        "De juiste indoor-opstelling is niet altijd een volledig andere bike fit, maar wel vaak een andere volgorde van controleren: zadeldruk, koeling en cockpit-tolerantie zijn binnen meestal belangrijker dan buiten.",
      ],
      sections: [
        {
          title: "Waarom je indoorpositie apart moet worden bekeken",
          items: [
            "Een trainer haalt de weginvloeden en veel kleine compensaties weg, waardoor problemen die buiten mild zijn binnen duidelijk kunnen worden.",
            "Vaste weerstand en weinig variatie kunnen een normale wegpositie harder laten voelen, omdat het lichaam minder kan meebewegen.",
            "Voelt de fiets buiten goed maar binnen niet, behandel dat dan als een echt verschil in setup in plaats van het te negeren.",
          ],
        },
        {
          title: "Zadeldruk en het statische belastingseffect",
          items: [
            "Indoor rijden verhoogt vaak de zadeldruk omdat je stiller zit en minder van de kleine ontlastende bewegingen hebt die buiten vanzelf ontstaan.",
            "Een zadel dat buiten prima is, kan binnen hotspots geven als het steunvlak of de kanteling net niet klopt.",
            "Kleine zadelwijzigingen en iets meer bewegingsvrijheid kunnen de druk binnen al sterk verbeteren.",
          ],
        },
        {
          title: "Reach en hoofdhouding op een vaste trainer",
          items: [
            "Op een trainer bepaalt reach hoeveel de romp moet bracen terwijl het lichaam al statischer is dan normaal.",
            "Is de cockpit te lang, dan voelen nek en schouders de extra belasting snel omdat je minder kunt schuiven op de fiets.",
            "Een iets rustigere indoor-cockpit kan hoofdpositie en ademhaling ontspannen houden zonder de outdoorfiets te agressief te veranderen.",
          ],
        },
        {
          title: "Koeling, zweet en het effect op drukpunten",
          items: [
            "Ventilatie is onderdeel van fit binnen, omdat warmte en zweet wrijving, drukgevoeligheid en discomfort verhogen.",
            "Een sterke ventilator kan hetzelfde zadel en dezelfde cockpit veel beter laten voelen door weefselzwelling te beperken en je koeler te houden.",
            "Ontstaan indoorproblemen langzaam tijdens een sessie, dan is koeling een van de eerste variabelen om te controleren voordat je hardware verandert.",
          ],
        },
      ],
      faqs: [
        {
          q: "Moet mijn traineropstelling exact gelijk zijn aan buiten?",
          a: "Niet altijd. De fiets kan hetzelfde zijn, maar de indooromgeving verandert druk, koeling en beweging, dus een kleine indoor-specifieke aanpassing kan terecht zijn.",
        },
        {
          q: "Waarom krijg ik binnen wel zadelschuurplekken en buiten niet?",
          a: "Binnen zit je stiller, zweet je meer en mis je vaak de kleine ontlastende bewegingen van buiten. Die combinatie kan hotspots geven terwijl de outdoor-fit prima is.",
        },
        {
          q: "Maakt de plaats van de ventilator uit voor mijn fitgevoel?",
          a: "Ja. Betere koeling verandert hoeveel druk en warmte je voelt, dus ventilatoropstelling is echt een onderdeel van indoor-fit en niet alleen een luxe extra.",
        },
      ],
    },
  },
} satisfies GuideContentRecord;

export const RIDE_TYPES_GUIDE_CONTENT: GuideContentRecord = appendStructuralSections(
  appendGuideCopy(RIDE_TYPES_GUIDE_CONTENT_BASE),
);
