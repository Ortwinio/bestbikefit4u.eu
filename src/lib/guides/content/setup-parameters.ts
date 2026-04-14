import type { GuideContentFaq, GuideContentRecord, GuideContentSection } from "../guide-content";
import { GUIDES } from "../../../app/(public)/guides/data";

const SETUP_PARAMETERS_STRUCTURAL_SECTIONS = {
  en: [
    {
      title: "How to measure",
      type: "steps",
      items: [
        "You need: a tape measure, a hex key, a digital level, and ideally a trainer or a helper so you can read the number without balancing the bike.",
        "Step 1: record the current value from the correct reference points for the setup variable you are changing, and write it down before you touch anything.",
        "Step 2: repeat the reading twice on level ground, using the same shoes and the same bike position each time.",
        "Step 3: compare the number with how the bike feels on a steady ride so you have both a static and a dynamic baseline.",
        "Common mistake: changing the setup first and trying to remember the old number later, which makes it impossible to know what actually helped.",
      ],
    },
    {
      title: "How to adjust",
      type: "steps",
      items: [
        "Change only one variable at a time so you can tell whether the result is better or just different.",
        "Use small steps: 2 to 3 mm for height or fore-aft changes, 1 to 2 degrees for tilt or hood angle, 5 mm for crank length, and 5 to 10 mm for stem or reach changes.",
        "Ride the new setup for 2 to 3 rides before making another change, and include at least one longer steady ride in the test.",
        "If the change improves one symptom but creates another, move halfway back instead of doubling down on the same direction.",
      ],
    },
    {
      title: "Warning signs",
      items: [
        "Hips rock, knees feel cramped, or you slide forward on the saddle after a small change.",
        "Hands, neck, or shoulders tense up after a cockpit or front-end change that should have made the position easier to hold.",
        "Feet go numb, hot spots appear, or pedaling starts to feel uneven after a shoe, cleat, or support change.",
        "Sharp pain, one-sided symptoms, swelling, or symptoms that continue off the bike are escalation signals for a fitter or clinician.",
      ],
    },
    {
      title: "Variations by rider type",
      type: "table",
      items: [],
      tableHeaders: ["Rider type", "Typical setup direction"],
      tableRows: [
        ["Road", "Slightly more compact and race-oriented, but only within the range the rider can hold for the full ride."],
        ["Gravel", "A little more forgiveness and control because vibration and terrain changes expose marginal setups faster."],
        ["MTB", "More movement room and trail control, especially when a dropper post or rough terrain changes the riding position."],
        ["Endurance / Triathlon", "Judge the setting against the longest effort the rider wants to sustain, not the shortest one that feels fine."],
      ],
    },
    {
      title: "Practical recommendation",
      type: "prose",
      items: [
        "Start with the current number on the bike and adjust the single parameter that the guide is about, not the whole bike at once.",
        "A calculator is usually enough if you are refining one variable in isolation; a full fit is the better next step when height, reach, and contact points interact or symptoms keep returning.",
        "Make one small change, test it for 2 to 3 rides, and then move to the next parameter only after the first result is clearly better.",
      ],
    },
  ],
  nl: [
    {
      title: "Hoe je het meet",
      type: "steps",
      items: [
        "Je hebt nodig: een meetlint, een inbussleutel, een digitale waterpas en liefst een trainer of helper zodat je de waarde kunt lezen zonder het wiel te laten kantelen.",
        "Stap 1: noteer de huidige waarde vanaf de juiste referentiepunten voor de setupvariabele die je wijzigt, en schrijf die op voordat je iets aanpast.",
        "Stap 2: herhaal de meting twee keer op een vlakke ondergrond, met dezelfde schoenen en dezelfde fietspositie.",
        "Stap 3: vergelijk de waarde met hoe de fiets voelt op een rustige rit, zodat je een statische en dynamische basis hebt.",
        "Veelgemaakte fout: eerst aanpassen en daarna proberen de oude maat te onthouden, waardoor je niet meer weet wat echt geholpen heeft.",
      ],
    },
    {
      title: "Hoe je het afstelt",
      type: "steps",
      items: [
        "Verander telkens maar één variabele, zodat je kunt zien of het resultaat beter is of alleen anders.",
        "Werk in kleine stappen: 2 tot 3 mm voor hoogte of voor-achter, 1 tot 2 graden voor tilt of hood-hoek, 5 mm voor cranklengte en 5 tot 10 mm voor stem- of reachwijzigingen.",
        "Rijd 2 tot 3 ritten met de nieuwe setup voordat je opnieuw wijzigt, en neem minstens één langere steady rit mee in de test.",
        "Als een wijziging één klacht verbetert maar een andere veroorzaakt, ga dan eerst halverwege terug in plaats van verder dezelfde kant op te duwen.",
      ],
    },
    {
      title: "Waarschuwingssignalen",
      items: [
        "Heupen wiebelen, de knieën voelen gekneld of je schuift naar voren op het zadel na een kleine wijziging.",
        "Handen, nek of schouders spannen op na een cockpit- of front-endaanpassing die de houding juist makkelijker had moeten maken.",
        "Voeten worden gevoelloos, hot spots ontstaan of trappen voelt ongelijk na een schoen-, cleat- of supportaanpassing.",
        "Scherpe pijn, eenzijdige klachten, zwelling of klachten die ook buiten de fiets aanwezig blijven zijn opschaalsignalen voor een fitter of arts.",
      ],
    },
    {
      title: "Verschillen per rijtype",
      type: "table",
      items: [],
      tableHeaders: ["Rijtype", "Typische afstelrichting"],
      tableRows: [
        ["Weg", "Iets compacter en meer racegericht, maar alleen binnen de bandbreedte die de rijder de hele rit kan vasthouden."],
        ["Gravel", "Meer vergevingsgezindheid en controle, omdat trillingen en terreinwissels borderline setups sneller blootleggen."],
        ["MTB", "Meer bewegingsruimte en trailcontrole, zeker als een dropper post of ruw terrein de rijhouding verandert."],
        ["Endurance / Triathlon", "Beoordeel de afstelling tegen de langste inspanning die de rijder echt wil volhouden, niet tegen de kortste die goed voelt."],
      ],
    },
    {
      title: "Praktische aanbeveling",
      type: "prose",
      items: [
        "Begin met de huidige waarde op de fiets en pas alleen de variabele aan waar deze gids over gaat, niet meteen de hele fiets.",
        "Een calculator is meestal genoeg als je één variabele los verfijnt; een volledige fit is de betere vervolgstap zodra hoogte, reach en contactpunten samen gaan meespelen of klachten terugkomen.",
        "Maak één kleine wijziging, test die 2 tot 3 ritten en ga pas naar de volgende variabele wanneer het eerste resultaat duidelijk beter is.",
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
          sections: [...guide.en.sections, ...SETUP_PARAMETERS_STRUCTURAL_SECTIONS.en],
        },
        nl: {
          ...guide.nl,
          sections: [...guide.nl.sections, ...SETUP_PARAMETERS_STRUCTURAL_SECTIONS.nl],
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
    return `Use the ${cardTitle} to get a starting reference for ${subject.toLowerCase()} before you make your next change.`;
  }
  return `Gebruik de ${cardTitle} om een startreferentie te krijgen voor ${subject.toLowerCase()} voordat je je volgende wijziging doet.`;
}

function buildFaqExtras(slug: string, locale: "en" | "nl"): GuideContentFaq[] {
  const cardTitle = getGuideCardTitle(slug, locale);
  const subject = getGuideSubject(cardTitle);
  if (locale === "en") {
    return [
      {
        q: `How do I know if ${subject.toLowerCase()} is the main thing to change?`,
        a: `If the bike feels better or worse in a clear, repeatable way after one small change, ${subject.toLowerCase()} is likely part of the answer. If it stays ambiguous, move to the next variable instead of making a bigger adjustment.`,
      },
      {
        q: "When should I get a fitter instead of adjusting myself?",
        a: "Get help if the bike still feels wrong after a few careful changes, if more than one contact point seems involved, or if the same symptom keeps coming back once you return to normal rides.",
      },
    ];
  }
  return [
    {
      q: `Hoe weet ik of ${subject.toLowerCase()} het belangrijkste is om aan te passen?`,
      a: `Als de fiets na één kleine wijziging duidelijk en herhaalbaar beter of slechter voelt, is ${subject.toLowerCase()} waarschijnlijk een belangrijk deel van de oplossing. Blijft het onduidelijk, ga dan door naar de volgende variabele in plaats van groter te gaan corrigeren.`,
    },
    {
      q: "Wanneer schakel ik een fitter in in plaats van zelf verder te sleutelen?",
      a: "Schakel hulp in als de fiets na een paar zorgvuldige aanpassingen nog steeds niet goed voelt, als meer dan één contactpunt meespeelt of als dezelfde klacht terugkomt zodra je normaal gaat rijden.",
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
const SETUP_PARAMETERS_GUIDE_CONTENT_BASE = {
  "saddle-height-guide": {
    en: {
      intro: [
        "Saddle height is one of the most important fit variables because it sets the range of motion your leg works through every pedal stroke. The same rider can end up with slightly different numbers depending on whether the fitter uses LeMond, Holmes, or inseam-based formulas such as inseam x 0.883.",
        "Those methods are best treated as starting points. In real riding, the right height is the one that lets you produce power without rocking the hips, reaching for the pedals, or feeling like the knee is being pushed beyond a comfortable extension.",
      ],
      sections: [
        {
          title: "How saddle height is calculated",
          items: [
            "LeMond-style methods, Holmes-style methods, and inseam-based formulas each estimate leg extension from a different landmark, so they often disagree by 5 to 8 mm even when measured carefully.",
            "That spread is normal: inseam measurements can be affected by stance width and pubic bone contact, while dynamic methods can be affected by pedal stroke style, shoe stack, and crank length.",
            "Use the formula that matches your measuring method and your riding goal, then validate it on the bike instead of treating the formula as the final answer.",
          ],
        },
        {
          title: "Validating saddle height by feel",
          items: [
            "A saddle that is too high often feels like the hips are reaching for the bottom of the stroke, with a subtle side-to-side sway, hamstring tension behind the knee, or numbness from over-extension.",
            "A saddle that is too low usually feels cramped: the knee stays too closed at the top of the stroke, the quads fatigue early, and power can feel blunt or inefficient on longer rides.",
            "If the position only feels wrong when you are tired, check whether the issue is height, load, or both; fatigue often reveals a marginal setup rather than creating a new problem.",
          ],
        },
        {
          title: "Dynamic vs static measurement",
          items: [
            "A static heel-on-pedal check can be useful, but it does not fully capture what happens when you are clipped in, moving at cadence, and stabilizing the pelvis under load.",
            "Two riders with the same static measurement can feel very different on the road because one has more ankle motion, more hip mobility, or a different preferred cadence.",
            "Trust the static number as a baseline, then judge the dynamic result by comfort, smoothness, and whether the pelvis stays stable during steady riding and efforts.",
          ],
        },
        {
          title: "Fine-tuning in small increments",
          items: [
            "Adjust in 2 to 3 mm steps; big changes make it harder to tell whether the new position is better or just different.",
            "After each change, test the position on at least 2 to 4 rides that include both seated steady work and some harder efforts.",
            "If the adjustment improves one symptom but creates another, move back halfway before trying a second correction.",
          ],
        },
      ],
      faqs: [
        {
          q: "What is the LeMond saddle height formula?",
          a: "It is a rule-of-thumb starting point based on inseam and crank/pedal geometry. It is useful for getting close, but it should be validated on the bike because different measurement methods can differ by several millimeters.",
        },
        {
          q: "Why does my saddle height feel right but still cause knee pain?",
          a: "Because knee pain is not always caused by height alone. Saddle setback, cleat position, crank length, and load management can all change how the knee is loaded even when the height feels plausible.",
        },
        {
          q: "How do I know I've reached the right saddle height?",
          a: "You are usually close when the hips stay quiet, the stroke feels even on both legs, and small changes of 2 to 3 mm make the position clearly worse in one direction and better in the other.",
        },
      ],
    },
    nl: {
      intro: [
        "Zadelhoogte is een van de belangrijkste afstelpunten omdat die bepaalt hoeveel bewegingsuitslag je been bij elke trapbeweging gebruikt. Dezelfde rijder kan een iets andere uitkomst krijgen afhankelijk van de methode: LeMond, Holmes of een inseam-formule zoals inseam x 0,883.",
        "Zie die methodes als startpunt. In de praktijk is de juiste hoogte de positie waarin je vermogen kunt leveren zonder heupzwaai, zonder naar de pedalen te reiken en zonder het gevoel dat de knie te ver wordt doorgetrokken.",
      ],
      sections: [
        {
          title: "Hoe zadelhoogte wordt berekend",
          items: [
            "LeMond-methodes, Holmes-methodes en inseam-formules schatten allemaal beenextensie vanuit een ander referentiepunt, waardoor ze zelfs zorgvuldig gemeten vaak 5 tot 8 mm van elkaar verschillen.",
            "Die spreiding is normaal: een inseam-meting wordt beïnvloed door standbreedte en contact met het schaambeen, terwijl dynamische metingen reageren op pedaalstijl, schoenopbouw en cranklengte.",
            "Gebruik de formule die past bij jouw meetmethode en doel, en valideer daarna altijd op de fiets in plaats van de formule als eindantwoord te zien.",
          ],
        },
        {
          title: "Zadelhoogte valideren op gevoel",
          items: [
            "Een zadel dat te hoog staat voelt vaak alsof de heupen naar de onderkant van de trapbeweging moeten reiken, met lichte heupzwaai, spanning achter de knie of een gevoel van overstrekte beenlengte.",
            "Een te laag zadel voelt meestal compact of gedrongen: de knie blijft te gesloten bovenaan de trap, de quadriceps verzuren sneller en vermogen kan op langere ritten vlak of inefficiënt aanvoelen.",
            "Als de positie vooral fout voelt wanneer je vermoeid bent, check dan of het probleem uit hoogte, belasting of beide komt; vermoeidheid legt vaak een borderline afstelling bloot.",
          ],
        },
        {
          title: "Dynamische versus statische meting",
          items: [
            "Een statische hiel-op-pedaal check kan nuttig zijn, maar vangt niet volledig wat er gebeurt wanneer je vastklikt, cadence draait en het bekken onder belasting stabiliseert.",
            "Twee rijders met dezelfde statische meting kunnen op de weg heel anders aanvoelen door verschil in enkelbeweging, heupmobiliteit of voorkeurscadans.",
            "Gebruik de statische waarde als basis en beoordeel het dynamische resultaat op comfort, souplesse en de vraag of het bekken stabiel blijft tijdens rustige ritten en inspanningen.",
          ],
        },
        {
          title: "Fijn afstellen in kleine stappen",
          items: [
            "Pas aan in stappen van 2 tot 3 mm; grote sprongen maken het moeilijk om te voelen of de nieuwe positie beter is of alleen anders.",
            "Test elke wijziging op minstens 2 tot 4 ritten met zowel steady werk als wat hardere inspanningen.",
            "Als een verandering één klacht verbetert maar een andere veroorzaakt, ga dan eerst halverwege terug voordat je een tweede correctie probeert.",
          ],
        },
      ],
      faqs: [
        {
          q: "Wat is de LeMond-formule voor zadelhoogte?",
          a: "Dat is een vuistregel die op basis van inseam en pedaal/crank-geometrie een startwaarde geeft. Handig om dicht in de buurt te komen, maar je moet het altijd op de fiets bevestigen omdat meetmethodes enkele millimeters uiteen kunnen lopen.",
        },
        {
          q: "Waarom voelt mijn zadelhoogte goed maar krijg ik toch kniepijn?",
          a: "Omdat kniepijn niet alleen door hoogte wordt bepaald. Zadel setback, cleat-positie, cranklengte en trainingsbelasting beïnvloeden allemaal hoe de knie wordt belast, ook als de hoogte op gevoel klopt.",
        },
        {
          q: "Hoe weet ik dat ik de juiste zadelhoogte heb bereikt?",
          a: "Je zit meestal dicht bij de juiste waarde wanneer de heupen stil blijven, de trapbeweging links en rechts gelijk voelt en kleine stappen van 2 tot 3 mm de positie duidelijk slechter of beter maken.",
        },
      ],
    },
  },
  "saddle-fore-aft-and-tilt-guide": {
    en: {
      intro: [
        "Saddle fore-aft and tilt work together more than most riders expect. Fore-aft changes where your pelvis sits over the bottom bracket, while tilt changes how stable and supported that pelvis feels once you are actually riding.",
        "KOPS is useful as a starting reference, but it is not the goal. The goal is a pelvic angle and load distribution that lets you pedal smoothly without sliding forward, bracing with the arms, or overloading the hands and knees.",
      ],
      sections: [
        {
          title: "Setback: what it controls and what it doesn't",
          items: [
            "Setback changes how far the saddle sits behind the bottom bracket, which influences hip opening, hamstring demand, and how much weight the arms need to support.",
            "It does not by itself guarantee good knee tracking or pain-free riding; a rider can be on a textbook setback and still be too low, too high, or poorly supported elsewhere.",
            "Think of setback as part of the whole support system, not as a standalone fix for knee pain or reach complaints.",
          ],
        },
        {
          title: "KOPS: a starting point, not a law",
          items: [
            "Knee Over Pedal Spindle is best used as an initial alignment check, not as a rule that every rider must obey in every discipline.",
            "A rider who needs more hip opening, a more forward torso, or a more rearward balance point may end up slightly in front of or behind the KOPS line and still be well fit.",
            "Use KOPS to orient the setup, then judge the result by comfort, stability, and whether you can hold the position without pushing on the bars.",
          ],
        },
        {
          title: "Tilt: the small angle that changes everything",
          items: [
            "Saddle tilt often starts near level, then moves only a small amount because even a change of 1 to 2 degrees can be enough to alter pelvic pressure.",
            "A nose that points too far down can cause sliding and extra arm support; a nose that points too far up can increase soft-tissue pressure and make the pelvis rotate backward.",
            "Measure tilt carefully on the riding surface of the saddle, not on the tail or the side shell, because shape and padding can trick a casual reading.",
          ],
        },
        {
          title: "How setback and saddle height interact",
          items: [
            "Raising saddle height often makes setback feel more important because the pelvis has more room to rock and the rider becomes more sensitive to where the load sits.",
            "Moving the saddle forward can sometimes let you lower the saddle slightly without closing the hip too much, especially on riders who are already stretched.",
            "Change one variable at a time and re-check the others, because fore-aft, tilt, and height can all change how the same position feels.",
          ],
        },
      ],
      faqs: [
        {
          q: "What is KOPS and should I follow it?",
          a: "KOPS means Knee Over Pedal Spindle. Use it as a reference to start the fit, but do not treat it as a law; comfort, pelvic stability, and the rest of the cockpit matter more than a single line check.",
        },
        {
          q: "How do I measure saddle tilt accurately?",
          a: "Measure along the main seating surface with a digital level or inclinometer, and repeat the reading after you sit on the saddle once so you are not measuring only the unloaded shape.",
        },
        {
          q: "Does saddle setback affect knee pain?",
          a: "Yes, it can, but usually as part of a wider chain that includes saddle height, cleat position, and handlebar support. Fore-aft alone is rarely the full explanation.",
        },
      ],
    },
    nl: {
      intro: [
        "Zadel setback en tilt werken sterker samen dan veel rijders verwachten. Setback verandert waar het zadel ten opzichte van de trapas staat, terwijl tilt bepaalt hoe stabiel en ondersteund het bekken aanvoelt zodra je echt fietst.",
        "KOPS is handig als startreferentie, maar het is geen einddoel. Het doel is een bekkenhoek en belastingverdeling waarmee je soepel kunt trappen zonder naar voren te schuiven, zonder op de armen te steunen en zonder extra druk op handen of knieën.",
      ],
      sections: [
        {
          title: "Setback: wat het wel en niet controleert",
          items: [
            "Setback bepaalt hoe ver het zadel achter de trapas staat, en beïnvloedt daarmee heupopening, hamstringbelasting en hoeveel steun de armen moeten leveren.",
            "Het garandeert niet vanzelf een goede knielijn of pijnvrij fietsen; een rijder kan perfect op KOPS zitten en toch te laag, te hoog of elders slecht ondersteund zijn.",
            "Zie setback dus als onderdeel van het totale supportsysteem, niet als losse oplossing voor kniepijn of reach-klachten.",
          ],
        },
        {
          title: "KOPS: een startpunt, geen wet",
          items: [
            "Knee Over Pedal Spindle gebruik je het best als eerste uitlijningscheck, niet als regel die elke rijder in elke discipline moet volgen.",
            "Een rijder die meer heupopening, een langere torsohoek of een iets achterwaardse balans nodig heeft, kan prima iets voor of achter de KOPS-lijn uitkomen.",
            "Gebruik KOPS om de setup te oriënteren en beoordeel daarna op comfort, stabiliteit en of je de positie kunt vasthouden zonder op het stuur te duwen.",
          ],
        },
        {
          title: "Tilt: de kleine hoek die alles verandert",
          items: [
            "Zadeltilt begint vaak rond waterpas en verschuift daarna maar een klein beetje, omdat al 1 tot 2 graden verschil de drukverdeling duidelijk kan veranderen.",
            "Een neus die te ver omlaag staat kan schuiven en extra armsteun veroorzaken; een neus die te ver omhoog staat verhoogt juist de druk op zachte weefsels en kan het bekken naar achteren kantelen.",
            "Meet de tilt op het echte zitvlak van het zadel en niet op de achterkant of zijkant, want vorm en padding kunnen een snelle meting vertekenen.",
          ],
        },
        {
          title: "Hoe setback en zadelhoogte elkaar beïnvloeden",
          items: [
            "Een hogere zadelstand maakt setback vaak gevoeliger, omdat het bekken meer ruimte heeft om te bewegen en de rijder preciezer voelt waar de belasting terechtkomt.",
            "Het zadel iets naar voren zetten kan soms toelaten om het zadel iets te verlagen zonder de heup te veel te sluiten, vooral bij rijders die al ver uitgestrekt zitten.",
            "Verander één variabele per keer en controleer de rest opnieuw, omdat setback, tilt en hoogte samen bepalen hoe een positie voelt.",
          ],
        },
      ],
      faqs: [
        {
          q: "Wat is KOPS en moet ik dat volgen?",
          a: "KOPS betekent Knee Over Pedal Spindle. Gebruik het als referentie om de fit te starten, maar niet als wet; comfort, stabiliteit van het bekken en de rest van de cockpit zijn belangrijker dan één lijncontrole.",
        },
        {
          q: "Hoe meet ik zadeltilt nauwkeurig?",
          a: "Meet langs het hoofd-zitvlak met een digitale waterpas of inclinometer en herhaal de meting nadat je eenmaal op het zadel hebt gezeten, zodat je niet alleen de onbelaste vorm meet.",
        },
        {
          q: "Heeft zadelsetback invloed op kniepijn?",
          a: "Ja, dat kan, maar meestal als onderdeel van een keten met zadelhoogte, cleat-positie en stuursteun. Setback alleen verklaart zelden het volledige probleem.",
        },
      ],
    },
  },
  "reach-and-stem-guide": {
    en: {
      intro: [
        "Reach is not just a stem question. Your total cockpit length is the sum of frame reach, stem length and angle, bar reach, hood position, and even how the bar is rotated in the clamp.",
        "That is why a shorter stem alone often fails to fix lower back pain or an overextended feeling: the frame may already be long, the bar may add extra reach, or the hoods may sit farther forward than you think.",
      ],
      sections: [
        {
          title: "Total cockpit length: what actually matters",
          items: [
            "The rider experiences the whole front end as one system, so the usable reach is the combined effect of frame geometry, stem, handlebar shape, and hood placement.",
            "A bar with 80 to 90 mm of reach can feel dramatically longer than a compact bar even when the frame and stem are unchanged.",
            "Measure and adjust the complete cockpit first; then decide which component is the best lever for change.",
          ],
        },
        {
          title: "Frame reach as the constraint",
          items: [
            "Frame reach sets the hard limit for how short or long the front end can become without creating a compromised stem or bar setup.",
            "If the frame is too long, a very short stem may make steering feel nervous or place the bars too close to the rider for good control.",
            "When fit problems start at the frame level, cockpit changes can refine the position, but they cannot fully erase a frame that is fundamentally wrong.",
          ],
        },
        {
          title: "Stem length and angle: the adjustment tool",
          items: [
            "Stem length is the easiest way to shift cockpit length in small increments, usually in steps of 5 to 10 mm.",
            "Stem angle changes both reach and stack: a 6 degree or 10 degree stem can move the bar height enough to change how the rider supports their torso.",
            "If you change stem length, re-check stack and hood angle too, because a small reach change can feel larger once the hand position is altered.",
          ],
        },
        {
          title: "Bar shape, flare, and how they affect effective reach",
          items: [
            "Compact bars reduce effective reach because the hoods sit closer to the rider, while traditional shapes and longer bar reach add length.",
            "Flare can make the drops wider without changing hood position much, which matters for control on gravel and endurance bikes.",
            "Two bars with the same nominal width can feel very different because reach, ramp shape, and hood rotation all change the hand position.",
          ],
        },
      ],
      faqs: [
        {
          q: "How do I measure my total cockpit length?",
          a: "Add the practical effects of frame reach, stem length and angle, bar reach, and hood position. The exact number matters less than being consistent in how you measure it.",
        },
        {
          q: "Should I change stem length or stem angle first?",
          a: "Start with the change that moves you the least and preserves handling. If the goal is mainly reach, a small length change is usually cleaner; if height is also wrong, angle may be the better first move.",
        },
        {
          q: "Why does a shorter stem alone not always fix lower back pain?",
          a: "Because back pain can come from too much drop, saddle fore-aft, or a bar shape that still leaves you overreaching. Shortening the stem does not automatically change those other loads.",
        },
      ],
    },
    nl: {
      intro: [
        "Reach is niet alleen een stemvraag. De totale cockpitlengte is de som van frame reach, stemlengte en -hoek, bar reach, hood-positie en zelfs hoe het stuur in de klem staat.",
        "Daarom lost een kortere stem alleen lage-rugklachten of een uitgerekt gevoel vaak niet op: het frame kan al lang zijn, het stuur kan extra reach toevoegen of de hoods staan verder naar voren dan je denkt.",
      ],
      sections: [
        {
          title: "Totale cockpitlengte: wat echt telt",
          items: [
            "De rijder ervaart de hele voorkant als één systeem, dus de bruikbare reach is het gecombineerde effect van framegeometrie, stem, stuurvorm en hood-plaatsing.",
            "Een stuur met 80 tot 90 mm reach kan duidelijk langer aanvoelen dan een compact stuur, ook als frame en stem hetzelfde blijven.",
            "Meet en beoordeel eerst de complete cockpit en bepaal daarna welk onderdeel de beste hefboom is om aan te passen.",
          ],
        },
        {
          title: "Frame reach als beperking",
          items: [
            "Frame reach zet de harde bovengrens voor hoe kort of lang de voorkant kan worden zonder een gekunstelde stem- of stuursetup.",
            "Als het frame te lang is, kan een heel korte stem het sturen nerveus maken of het stuur te dicht op de rijder brengen voor goede controle.",
            "Wanneer het probleem op frameniveau begint, kun je de positie verfijnen met cockpitwijzigingen, maar een fundamenteel verkeerd frame niet volledig wegwerken.",
          ],
        },
        {
          title: "Stemlengte en -hoek: het afstelgereedschap",
          items: [
            "Stemlengte is de eenvoudigste manier om de cockpitlengte in kleine stappen te verschuiven, meestal in stappen van 5 tot 10 mm.",
            "Stemhoek verandert zowel reach als stack: een stem van 6 graden of 10 graden kan de stuurhoogte genoeg verplaatsen om de steun van de romp te veranderen.",
            "Als je de stemlengte aanpast, controleer dan ook stack en hoodhoek opnieuw, omdat een kleine reachwijziging groter kan aanvoelen zodra de handpositie verschuift.",
          ],
        },
        {
          title: "Stuurvorm, flare en effectieve reach",
          items: [
            "Compacte sturen verkorten de effectieve reach omdat de hoods dichter bij de rijder komen, terwijl traditionele vormen en langere bar reach extra lengte toevoegen.",
            "Flare kan de drops breder maken zonder de hood-positie sterk te veranderen, wat belangrijk is voor controle op gravel- en endurancefietsen.",
            "Twee sturen met dezelfde nominale breedte kunnen heel anders aanvoelen omdat reach, rampvorm en hood-rotatie de handpositie wijzigen.",
          ],
        },
      ],
      faqs: [
        {
          q: "Hoe meet ik mijn totale cockpitlengte?",
          a: "Tel de praktische effecten van frame reach, stemlengte en -hoek, bar reach en hood-positie samen. Het exacte getal is minder belangrijk dan dat je altijd op dezelfde manier meet.",
        },
        {
          q: "Moet ik eerst de stemlengte of de stemhoek veranderen?",
          a: "Begin met de wijziging die het minst verplaatst en de handling behoudt. Is vooral reach het probleem, dan is een kleine lengte-aanpassing vaak het zuiverst; is de hoogte ook fout, dan kan hoek de betere eerste stap zijn.",
        },
        {
          q: "Waarom lost een kortere stem mijn lage-rugklachten niet altijd op?",
          a: "Omdat rugklachten ook kunnen komen door te veel drop, een verkeerde setback of een stuurvorm die je nog steeds laat overreiken. Een kortere stem verandert die andere belastingen niet automatisch.",
        },
      ],
    },
  },
  "handlebar-drop-guide": {
    en: {
      intro: [
        "Handlebar drop is not a badge of honor. It is the vertical relationship between the saddle and the front end, and the right amount depends on hip flexion, core stability, and how much time you can spend in the position without compensating.",
        "Stack and drop are separate variables: stack changes how high the front end sits, while drop describes how far below the saddle the bars end up. Riders often need to tune both together rather than chasing more drop by itself.",
      ],
      sections: [
        {
          title: "What handlebar drop actually measures",
          items: [
            "Drop tells you how much the rider has to hinge at the hips to get to the bars, which directly affects torso angle and pressure distribution.",
            "A moderate drop can support aero efficiency and front-end stability, but too much drop often shifts weight onto the hands and makes breathing feel restricted.",
            "The number only means something when you compare it with the rider's mobility, flexibility, and riding demands.",
          ],
        },
        {
          title: "Hip angle and flexible reach: the real limits",
          items: [
            "Hip flexor length and pelvic control are often the true limits, not ambition or pain tolerance.",
            "If the rider cannot hinge from the hip without rounding the lower back, the position may be asking for more drop than the body can support.",
            "A strong core helps, but it does not replace enough mobility to maintain an open, repeatable hip angle under load.",
          ],
        },
        {
          title: "Stack and drop as a pair",
          items: [
            "If stack is too low, the rider may feel forced into more drop even when the stem and bars are otherwise correct.",
            "If stack is too high, the front end may feel upright and cramped even though the numeric drop looks small.",
            "Use spacers, stem angle, and bar choice to tune stack first when the main problem is front-end support rather than pure reach.",
          ],
        },
        {
          title: "Adapting to more drop progressively",
          items: [
            "Do not jump straight to an aggressive position if your body is not already adapted to it; introduce more drop in small stages.",
            "A practical progression is to lower the front end by one small step, then test it for 2 to 3 weeks of normal riding before lowering again.",
            "If the rider cannot keep the pelvis stable or the neck and hands start complaining within the first few rides, the change was probably too large.",
          ],
        },
      ],
      faqs: [
        {
          q: "What is a normal handlebar drop range?",
          a: "There is no single normal range, but many endurance riders sit in a modest drop while more aggressive road or triathlon positions use more. The correct number is the one you can support consistently.",
        },
        {
          q: "Why does adding spacers not always reduce back pain?",
          a: "Because back pain may be coming from reach, saddle position, or a front end that is still too long even after the bars get higher. More stack helps only if drop was the real problem.",
        },
        {
          q: "How do I know if I have too much drop?",
          a: "Common signs are a hard time breathing deeply, pressure on the hands, neck tension, and a pelvis that keeps sliding forward or rotating excessively to reach the bars.",
        },
      ],
    },
    nl: {
      intro: [
        "Handlebar drop is geen prestatiebadge. Het is de verticale relatie tussen zadel en voorkant, en de juiste hoeveelheid hangt af van heupflexie, rompspanning en hoe lang je die houding kunt volhouden zonder te compenseren.",
        "Stack en drop zijn verschillende variabelen: stack bepaalt hoe hoog de voorkant staat, terwijl drop beschrijft hoe ver de stuurpositie onder het zadel uitkomt. Vaak moeten rijders beide tegelijk bijsturen in plaats van alleen maar meer drop na te jagen.",
      ],
      sections: [
        {
          title: "Wat handlebar drop echt meet",
          items: [
            "Drop laat zien hoeveel de rijder uit de heup moet scharnieren om bij het stuur te komen, en beïnvloedt daarmee direct de romphoek en drukverdeling.",
            "Een matige drop kan aerodynamica en stabiliteit ondersteunen, maar te veel drop verplaatst vaak gewicht naar de handen en maakt ademen beperkter.",
            "Het getal zegt pas echt iets wanneer je het naast mobiliteit, flexibiliteit en de eisen van de rit legt.",
          ],
        },
        {
          title: "Heuphoek en flexibele reach: de echte grens",
          items: [
            "Heupflexor-lengte en bekkencontrole zijn vaak de echte grenzen, niet ambitie of pijntolerantie.",
            "Als de rijder niet uit de heup kan scharnieren zonder de onderrug rond te maken, vraagt de positie waarschijnlijk meer drop dan het lichaam kan dragen.",
            "Een sterke core helpt, maar vervangt geen voldoende mobiliteit om onder belasting een open en herhaalbare heuphoek te houden.",
          ],
        },
        {
          title: "Stack en drop als paar",
          items: [
            "Als de stack te laag is, kan de rijder zich gedwongen voelen tot meer drop, zelfs wanneer stem en stuur verder goed zijn.",
            "Als de stack te hoog is, kan de voorkant rechtop en compact aanvoelen, ook al lijkt de numerieke drop klein.",
            "Gebruik spacers, stemhoek en stuurkeuze om eerst de stack te tunen wanneer het hoofdprobleem ondersteuning van de voorkant is en niet puur reach.",
          ],
        },
        {
          title: "Stapsgewijs wennen aan meer drop",
          items: [
            "Spring niet direct naar een agressieve positie als je lichaam daar nog niet aan gewend is; bouw meer drop op in kleine stappen.",
            "Een praktische opbouw is de voorkant één kleine stap laten zakken en die wijziging 2 tot 3 weken normaal rijden testen voordat je opnieuw verlaagt.",
            "Als het bekken niet stabiel blijft of nek en handen al in de eerste ritten gaan protesteren, was de verandering waarschijnlijk te groot.",
          ],
        },
      ],
      faqs: [
        {
          q: "Wat is een normale range voor handlebar drop?",
          a: "Er is geen enkele normale range, maar veel endurance-rijders zitten in een bescheiden drop terwijl agressievere weg- of triathlonposities meer drop gebruiken. De juiste waarde is de positie die je consequent kunt dragen.",
        },
        {
          q: "Waarom verminderen spacers mijn rugpijn niet altijd?",
          a: "Omdat rugpijn ook door reach, zadelpositie of een voorkant die zelfs na verhogen nog te lang is kan komen. Meer stack helpt alleen als drop echt het probleem was.",
        },
        {
          q: "Hoe weet ik of ik te veel drop heb?",
          a: "Typische signalen zijn moeite met diep ademen, druk op de handen, nekspanning en een bekken dat naar voren blijft schuiven of te veel kantelt om het stuur te bereiken.",
        },
      ],
    },
  },
  "crank-length-guide": {
    en: {
      intro: [
        "Crank length changes the size of the pedal circle and the hip angle required at the top of the stroke. That matters most for riders with limited hip flexion and for triathletes who are already trying to stay aero at the front of the bike.",
        "Most riders can stay within the common 165 to 175 mm range and fit well. Deviation becomes useful when hip comfort, clearance, or front-end posture is the limiting factor rather than raw pedaling preference.",
      ],
      sections: [
        {
          title: "Why crank length matters (and when it doesn't)",
          items: [
            "Crank length affects leverage, cadence feel, and the amount of knee and hip flexion through each stroke, but the practical differences are often smaller than riders expect.",
            "If the rider already has adequate clearance and no hip pinch, changing crank length may be a refinement rather than a correction.",
            "It becomes important when the rider repeatedly feels closed at the top of the stroke, especially in low or forward positions.",
          ],
        },
        {
          title: "Hip angle at top of stroke: the key variable",
          items: [
            "Shorter cranks open the hip angle at the top of the stroke, which can reduce compression in aggressive positions.",
            "That extra clearance can help riders who struggle with front-end drop, low back tension, or a pinched feeling when pedaling hard out of the saddle.",
            "The main question is not whether the crank is long or short in isolation, but whether it lets the rider preserve an open, repeatable hip angle.",
          ],
        },
        {
          title: "Short cranks for triathlon and hip-limited riders",
          items: [
            "Triathlon riders often benefit from shorter cranks because they need to sustain a low torso angle for long periods and still run well afterward.",
            "Riders with limited hip flexion, previous hip irritation, or a strong preference for higher cadence may also do better with 165 or 160 mm cranks.",
            "Use shorter cranks when they solve a real mobility or aero problem, not simply because they are currently fashionable.",
          ],
        },
        {
          title: "Changing crank length: what else to re-check",
          items: [
            "If you shorten the crank by 5 mm, re-check saddle height because the effective leg extension changes.",
            "Also review saddle fore-aft, drop, and cleat setup so the whole position stays coherent after the new pedal arc is installed.",
            "Make the change with enough test rides to confirm that comfort, cadence, and power feel stable across different intensities.",
          ],
        },
      ],
      faqs: [
        {
          q: "Should most riders change their crank length?",
          a: "No. Most riders can stay in the common 165 to 175 mm range and do fine. Change it when a specific hip-angle, clearance, or discipline requirement justifies it.",
        },
        {
          q: "How does crank length affect knee pain?",
          a: "Longer cranks increase the amount of flexion and extension the knee goes through, which can irritate riders who are already near their limit. Shorter cranks usually reduce that demand slightly.",
        },
        {
          q: "If I change crank length, does saddle height change too?",
          a: "Usually yes. A shorter crank often means the saddle should be raised slightly to preserve leg extension, while a longer crank often requires the opposite check.",
        },
      ],
    },
    nl: {
      intro: [
        "Cranklengte verandert de grootte van de trapcirkel en de heuphoek die je bovenaan de slag nodig hebt. Dat is vooral relevant voor rijders met beperkte heupflexie en voor triatleten die al laag en aerodynamisch op de fiets zitten.",
        "De meeste rijders kunnen prima binnen de gangbare range van 165 tot 175 mm blijven. Afwijken wordt nuttig wanneer heupcomfort, bodemvrijheid of houding aan de voorkant de beperkende factor is, en niet puur voorkeur in trapgevoel.",
      ],
      sections: [
        {
          title: "Waarom cranklengte telt (en wanneer niet)",
          items: [
            "Cranklengte beïnvloedt hefboom, cadansgevoel en de hoeveelheid knie- en heupflexie per omwenteling, maar de praktische verschillen zijn vaak kleiner dan rijders verwachten.",
            "Als de rijder voldoende bodemvrijheid heeft en geen heupknelling voelt, is cranklengte vaak eerder een verfijning dan een correctie.",
            "Het wordt belangrijk wanneer de rijder zich bovenaan de trap herhaaldelijk te gesloten voelt, vooral in een lage of ver naar voren geplaatste houding.",
          ],
        },
        {
          title: "Heuphoek bovenaan de trap: de sleutelvariabele",
          items: [
            "Kortere cranks openen de heuphoek bovenaan de trap, waardoor compressie in agressieve posities kan afnemen.",
            "Die extra ruimte kan helpen bij rijders die moeite hebben met front-end drop, lage-rugspanning of een geknepen gevoel bij hard doortrappen.",
            "De vraag is dus niet of de crank op zichzelf lang of kort is, maar of je er een open en herhaalbare heuphoek mee kunt behouden.",
          ],
        },
        {
          title: "Korte cranks voor triathlon en heup-beperkte rijders",
          items: [
            "Triatleten hebben vaak baat bij kortere cranks omdat ze lang een lage romphoek moeten vasthouden en daarna ook nog moeten kunnen lopen.",
            "Rijders met beperkte heupflexie, eerdere heupirritatie of een duidelijke voorkeur voor hogere cadans doen soms beter op 165 of 160 mm cranks.",
            "Gebruik kortere cranks wanneer ze een echt heuphoek- of aeroprobleem oplossen, niet alleen omdat ze op dit moment populair zijn.",
          ],
        },
        {
          title: "Cranklengte veranderen: wat je opnieuw moet controleren",
          items: [
            "Als je de crank met 5 mm verkort, controleer dan opnieuw de zadelhoogte omdat de effectieve beenextensie verandert.",
            "Bekijk ook setback, drop en cleat-afstelling opnieuw, zodat de hele positie coherent blijft met de nieuwe trapcirkel.",
            "Test lang genoeg om te bevestigen dat comfort, cadans en vermogen op verschillende intensiteiten stabiel blijven.",
          ],
        },
      ],
      faqs: [
        {
          q: "Moeten de meeste rijders hun cranklengte aanpassen?",
          a: "Nee. De meeste rijders kunnen prima in de gangbare range van 165 tot 175 mm blijven. Verander pas als een duidelijke heuphoek-, bodemvrijheid- of discipline-eis dat rechtvaardigt.",
        },
        {
          q: "Hoe beïnvloedt cranklengte kniepijn?",
          a: "Langere cranks vergroten de mate van flexie en extensie van de knie, wat rijders kan irriteren die al dicht bij hun grens zitten. Kortere cranks verminderen die vraag meestal iets.",
        },
        {
          q: "Moet mijn zadelhoogte veranderen als ik de cranklengte verander?",
          a: "Meestal wel. Een kortere crank vraagt vaak om een iets hoger zadel om de beenextensie te behouden, terwijl een langere crank juist een hercontrole naar beneden vraagt.",
        },
      ],
    },
  },
  "handlebar-width-and-hood-position-guide": {
    en: {
      intro: [
        "Handlebar width is a baseline fit variable because it sets how the shoulders, chest, and hands line up. The goal is not maximum narrowness or maximum width; it is a position that supports breathing, steering control, and relaxed upper-body posture.",
        "Hood position matters too. Hood angle and lever reach can quietly change wrist angle, forearm support, and how much width you actually feel once your hands are on the bike.",
      ],
      sections: [
        {
          title: "Bar width: matching to shoulder width",
          items: [
            "A sensible starting point is to match bar width to shoulder width at the acromion, then adjust for discipline and rider preference.",
            "Road riders often do well on bars that are close to shoulder width or slightly narrower, while gravel riders may choose a little extra width for leverage and stability.",
            "The right width is the one that lets the rider keep the shoulders relaxed without making the front end feel twitchy or too open.",
          ],
        },
        {
          title: "How bar width affects breathing and shoulder position",
          items: [
            "Bars that are too narrow can compress the chest, force the elbows inward, and create a tight, guarded breathing pattern.",
            "Bars that are too wide can over-open the shoulders, increase frontal area, and sometimes make the upper body feel braced instead of supported.",
            "The sweet spot is usually a width that lets the ribs expand naturally while the shoulder blades sit in a stable, neutral position.",
          ],
        },
        {
          title: "Hood angle: rotation and lever reach",
          items: [
            "Hood rotation changes where the wrist lands when you ride on the hoods, so even a small twist can alter comfort significantly.",
            "Lever reach also matters because riders with smaller hands may need the lever closer to the fingers to avoid overextending the grip.",
            "A hood setup that looks symmetrical on the bench may still feel uneven on the road if the bar shape or hand posture differs left to right.",
          ],
        },
        {
          title: "Wide vs narrow bars for different disciplines",
          items: [
            "Road riding usually rewards a more compact, less draggy setup, while gravel and technical riding often benefit from extra leverage and control.",
            "Triathlon positions often prefer narrower frontal width for aerodynamics, but only if the rider can still control the bike safely.",
            "Choose width based on the riding task, then refine hood rotation and lever reach so the hands feel supported in your most common riding position.",
          ],
        },
      ],
      faqs: [
        {
          q: "How do I measure the correct bar width for me?",
          a: "A practical starting point is shoulder width at the acromion, then adjust for discipline, flexibility, and how the bike feels when you ride on the hoods and in the drops.",
        },
        {
          q: "Should gravel bars be wider than road bars?",
          a: "Often yes, because extra width can add leverage and stability on rough surfaces. The exact amount depends on the rider, the terrain, and how much control they want at the front end.",
        },
        {
          q: "How does hood angle affect wrist pain?",
          a: "If the hoods are rotated too far up or down, the wrist can be forced into extension or deviation. A small rotation change can reduce strain by aligning the hand with the forearm more naturally.",
        },
      ],
    },
    nl: {
      intro: [
        "Stuurbreedte is een basis-fitvariabele omdat die bepaalt hoe schouders, borst en handen op elkaar aansluiten. Het doel is niet zo smal mogelijk of zo breed mogelijk, maar een positie die ademhaling, stuurcontrole en een ontspannen bovenlichaam ondersteunt.",
        "Ook de hood-positie is belangrijk. Hood-hoek en leverbereik kunnen stilletjes de polshoek, steun van de onderarm en de breedte die je daadwerkelijk voelt veranderen zodra je op de fiets zit.",
      ],
      sections: [
        {
          title: "Barbreedte: afstemmen op schouderbreedte",
          items: [
            "Een logisch startpunt is de barbreedte af te stemmen op de schouderbreedte bij de acromion en daarna te corrigeren voor discipline en voorkeur.",
            "Wegrijders doen het vaak goed op sturen die dicht bij schouderbreedte liggen of iets smaller zijn, terwijl gravelrijders vaak iets meer breedte kiezen voor controle en leverage.",
            "De juiste breedte is de breedte waarmee de schouders ontspannen blijven zonder dat de voorkant nerveus of juist te open aanvoelt.",
          ],
        },
        {
          title: "Hoe barbreedte invloed heeft op ademhaling en schouderpositie",
          items: [
            "Te smalle sturen kunnen de borst samendrukken, de ellebogen naar binnen dwingen en een strak, afwerend adempatroon veroorzaken.",
            "Te brede sturen kunnen de schouders juist te ver openen, de frontale oppervlakte vergroten en het bovenlichaam soms eerder gespannen dan ondersteund laten voelen.",
            "De sweet spot is meestal een breedte waarbij de ribben natuurlijk kunnen uitzetten terwijl de schouderbladen stabiel en neutraal blijven.",
          ],
        },
        {
          title: "Hood-hoek: rotatie en leverbereik",
          items: [
            "Hood-rotatie verandert waar de pols uitkomt wanneer je op de hoods rijdt, dus zelfs een kleine draai kan veel comfortverschil geven.",
            "Het leverbereik telt ook mee, omdat rijders met kleinere handen de remgreep soms dichter bij de vingers nodig hebben om niet te ver te reiken.",
            "Een hood-opstelling die op de werkbank symmetrisch lijkt, kan op de weg nog steeds ongelijk voelen als barvorm of handhouding links en rechts verschilt.",
          ],
        },
        {
          title: "Brede versus smalle sturen per discipline",
          items: [
            "Wegfietsen profiteert vaak van een compacter en minder draggy front, terwijl gravel en technisch rijden juist baat hebben bij meer leverage en controle.",
            "Triathlonposities kiezen vaak voor een smallere frontale breedte om aerodynamisch te blijven, maar alleen als de rijder de fiets nog veilig kan controleren.",
            "Kies de breedte op basis van de taak, en verfijn daarna hood-rotatie en leverbereik zodat de handen in je meest gebruikte positie goed ondersteund aanvoelen.",
          ],
        },
      ],
      faqs: [
        {
          q: "Hoe meet ik de juiste barbreedte voor mij?",
          a: "Een praktisch startpunt is de schouderbreedte bij de acromion, waarna je corrigeert voor discipline, flexibiliteit en hoe de fiets voelt op de hoods en in de drops.",
        },
        {
          q: "Moeten gravelsturen breder zijn dan wegsturen?",
          a: "Vaak wel, omdat extra breedte meer controle en leverage op ruwe ondergrond kan geven. De juiste marge hangt af van de rijder, het terrein en hoeveel controle je vooraan wilt.",
        },
        {
          q: "Hoe beïnvloedt hood-hoek polspijn?",
          a: "Als de hoods te ver omhoog of omlaag gedraaid zijn, kan de pols in extensie of afwijking worden geduwd. Een kleine rotatie-aanpassing kan de onderarm en hand natuurlijker uitlijnen en zo spanning verminderen.",
        },
      ],
    },
  },
} satisfies GuideContentRecord;

export const SETUP_PARAMETERS_GUIDE_CONTENT: GuideContentRecord = appendStructuralSections(
  appendGuideCopy(SETUP_PARAMETERS_GUIDE_CONTENT_BASE),
);
