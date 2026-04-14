import type { GuideContentFaq, GuideContentRecord, GuideContentSection } from "../guide-content";
import { GUIDES } from "../../../app/(public)/guides/data";

const REMAINING_CLUSTERS_STRUCTURAL_SECTIONS = {
  en: [
    {
      title: "How to measure",
      type: "steps",
      items: [
        "You need the tool that matches the topic: a scale for body mass or hydration, a power meter or trainer for FTP and W/kg, a tape measure or geometry chart for fit topics, and a notebook or app to keep the baseline.",
        "Step 1: choose the one number or test the guide is really about and record it before changing anything.",
        "Step 2: repeat the same test twice under comparable conditions so you know the value is real and not just a good day.",
        "Step 3: for fueling and hydration, record intake, body mass change, and ride duration; for power, record the protocol and result; for fit, record the current position or geometry number.",
        "Common mistake: comparing different sessions, routes, or equipment and then treating the result as a clean baseline.",
      ],
    },
    {
      title: "How to adjust",
      type: "steps",
      items: [
        "Change one variable at a time and keep the test conditions as similar as possible.",
        "For fueling and hydration, adjust in practical steps such as 20 to 30 g/hour of carbohydrate or 100 to 250 ml/hour of fluid; for power and training zones, adjust from a fresh test and usually in about 5 percent steps; for fit and geometry, use 2 to 5 mm or 1 to 2 degree changes.",
        "Hold the new plan or position for 2 to 3 comparable sessions before judging it.",
        "If one improvement creates another problem, back up halfway and compare again instead of adding more changes.",
      ],
    },
    {
      title: "Warning signs",
      items: [
        "Bonking, nausea, bloating, dehydration, or a sudden power drop are signs the fueling or pacing plan is not working.",
        "Unexpected fatigue, inability to complete the planned interval work, or zone targets that suddenly feel wrong can mean the power baseline is stale.",
        "Numbness, pain, swelling, or a fit change that keeps moving the problem around are warning signs that the geometry or contact-point problem is not solved yet.",
        "Fainting, chest pain, symptoms outside exercise, or persistent neurological symptoms are escalation signals and should be assessed by a clinician.",
      ],
    },
    {
      title: "Variations by rider type",
      type: "table",
      items: [],
      tableHeaders: ["Rider / ride context", "Typical comparison lens"],
      tableRows: [
        ["Fueling / Power", "Compare beginner versus experienced riders, short versus long rides, indoor versus outdoor sessions, and climbing versus flat terrain."],
        ["Fit / Geometry", "Compare road, gravel, and MTB setups, then layer in endurance, race, tall-rider, shorter-torso, limited-flexibility, or returning-rider context when it matters."],
        ["Indoor", "Usually needs more attention to cooling and static pressure."],
        ["Outdoor", "Usually needs more attention to terrain, position changes, and handling."],
      ],
    },
    {
      title: "Practical recommendation",
      type: "prose",
      items: [
        "Start with the one baseline that matters most for the guide, not with the whole system at once.",
        "A calculator is enough when one variable dominates; a full fit, coach review, or clinician visit is better when several systems interact or the symptoms keep returning.",
        "Make one change, re-test it in comparable conditions, and only then decide whether to keep going or move to the next variable.",
      ],
    },
  ],
  nl: [
    {
      title: "Hoe je het meet",
      type: "steps",
      items: [
        "Je hebt het juiste hulpmiddel nodig voor het onderwerp: een weegschaal voor lichaamsmassa of hydratatie, een powermeter of trainer voor FTP en W/kg, een meetlint of geometrietabel voor fitonderwerpen, en een notitieboek of app om de basis vast te leggen.",
        "Stap 1: kies het ene getal of de test waar de gids echt over gaat en noteer die voordat je iets verandert.",
        "Stap 2: herhaal dezelfde test twee keer onder vergelijkbare omstandigheden zodat je weet dat de waarde echt is en niet alleen een goede dag.",
        "Stap 3: noteer bij voeding en hydratatie inname, gewichtsverandering en ritduur; bij power het protocol en resultaat; bij fit de huidige positie of geometriewaarde.",
        "Veelgemaakte fout: verschillende sessies, routes of uitrusting vergelijken en het resultaat toch als een zuivere baseline behandelen.",
      ],
    },
    {
      title: "Hoe je het afstelt",
      type: "steps",
      items: [
        "Verander telkens maar één variabele en houd de testomstandigheden zo vergelijkbaar mogelijk.",
        "Bij voeding en hydratatie kun je praktisch werken in stappen van 20 tot 30 g/uur koolhydraten of 100 tot 250 ml/uur vocht; bij power en trainingszones stel je bij vanaf een verse test en meestal in stappen van ongeveer 5 procent; bij fit en geometrie gebruik je 2 tot 5 mm of 1 tot 2 graden.",
        "Houd het nieuwe plan of de nieuwe positie 2 tot 3 vergelijkbare sessies vast voordat je het beoordeelt.",
        "Als één verbetering een ander probleem veroorzaakt, ga dan eerst halverwege terug en vergelijk opnieuw in plaats van nog meer veranderingen toe te voegen.",
      ],
    },
    {
      title: "Waarschuwingssignalen",
      items: [
        "Een bonk, misselijkheid, opgeblazen gevoel, uitdroging of een plotselinge vermogensdaling zijn signalen dat het voedings- of pacingplan niet werkt.",
        "Onverwachte vermoeidheid, intervalwerk dat ineens niet meer haalbaar is of zone-doelen die vreemd aanvoelen kunnen betekenen dat de powerbasis verouderd is.",
        "Gevoelloosheid, pijn, zwelling of een fitwijziging die het probleem steeds verplaatst zijn signalen dat de geometrie- of contactpuntkwestie nog niet is opgelost.",
        "Flauwvallen, pijn op de borst, klachten buiten inspanning of aanhoudende neurologische symptomen zijn opschaalsignalen en moeten medisch worden beoordeeld.",
      ],
    },
    {
      title: "Verschillen per rijtype",
      type: "table",
      items: [],
      tableHeaders: ["Rijder- / ritcontext", "Typische vergelijkingslens"],
      tableRows: [
        ["Voeding / Power", "Vergelijk beginner versus ervaren rijder, korte versus lange ritten, indoor versus outdoor sessies en klimwerk versus vlak rijden."],
        ["Fit / Geometrie", "Vergelijk road, gravel en MTB en kijk daarna naar endurance, race, lange rijder, kortere romp, beperkte flexibiliteit of terugkerende rijder wanneer dat relevant is."],
        ["Indoor", "Meer aandacht voor koeling en statische druk."],
        ["Outdoor", "Meer aandacht voor terrein, houdingswissels en handling."],
      ],
    },
    {
      title: "Praktische aanbeveling",
      type: "prose",
      items: [
        "Begin bij de ene basiswaarde die voor de gids het belangrijkst is en niet meteen bij het hele systeem.",
        "Een calculator is genoeg wanneer één variabele de boventoon voert; een volledige fit, coachreview of artsbezoek is beter wanneer meerdere systemen elkaar beïnvloeden of klachten terug blijven komen.",
        "Maak één wijziging, test die opnieuw onder vergelijkbare omstandigheden en bepaal pas daarna of je verdergaat of naar de volgende variabele gaat.",
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
          sections: [...guide.en.sections, ...REMAINING_CLUSTERS_STRUCTURAL_SECTIONS.en],
        },
        nl: {
          ...guide.nl,
          sections: [...guide.nl.sections, ...REMAINING_CLUSTERS_STRUCTURAL_SECTIONS.nl],
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
    return `Use the ${cardTitle} guide to turn ${subject.toLowerCase()} into a practical next step for your riding or training plan.`;
  }
  return `Gebruik de ${cardTitle} gids om ${subject.toLowerCase()} om te zetten in een praktische volgende stap voor je rit of trainingsplan.`;
}

function buildFaqExtras(slug: string, locale: "en" | "nl"): GuideContentFaq[] {
  const cardTitle = getGuideCardTitle(slug, locale);
  const subject = getGuideSubject(cardTitle);
  if (locale === "en") {
    return [
      {
        q: `How do I know if ${subject.toLowerCase()} is the main lever to change?`,
        a: `If a small change produces a clear, repeatable difference in how the ride feels or performs, ${subject.toLowerCase()} is probably a useful lever. If not, move to the next variable rather than making a bigger guess.`,
      },
      {
        q: "When should I get a coach, fitter, or clinician involved?",
        a: "Get help when the issue keeps returning, when more than one system is involved, or when the symptoms are sharp, persistent, or happening outside normal riding.",
      },
    ];
  }
  return [
    {
      q: `Hoe weet ik of ${subject.toLowerCase()} de belangrijkste knop is om aan te draaien?`,
      a: `Als een kleine wijziging een duidelijk en herhaalbaar verschil maakt in gevoel of prestatie, is ${subject.toLowerCase()} waarschijnlijk een bruikbare knop. Is dat niet zo, ga dan door naar de volgende variabele in plaats van groter te gokken.`,
    },
    {
      q: "Wanneer schakel ik een coach, fitter of arts in?",
      a: "Schakel hulp in als het probleem terug blijft komen, als meer dan één systeem meespeelt of als de klachten scherp, hardnekkig of ook buiten de normale rit aanwezig zijn.",
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
const REMAINING_CLUSTERS_GUIDE_CONTENT_BASE = {
  "cycling-fueling-basics": {
    en: {
      intro: [
        "Fueling is not about chasing a perfect sports nutrition formula. It is about keeping effort sustainable, preserving concentration, and avoiding the late-ride drop in output that starts when carbohydrate availability runs low.",
        "For most riders, the useful question is not whether to fuel at all, but how much, how early, and how simply they can do it without upsetting their stomach or overcomplicating the ride.",
      ],
      sections: [
        {
          title: "When you need to fuel on a ride",
          items: [
            "Rides under about 60 minutes usually do not require in-ride carbohydrate unless the session is very hard or you start under-fueled.",
            "Once the ride moves beyond an hour, especially at endurance or tempo intensity, regular carbohydrate intake becomes more useful for maintaining output.",
            "Long rides, back-to-back training days, and fasted starts all increase the value of an early and steady fueling plan.",
          ],
        },
        {
          title: "Pre-ride, during, and post-ride basics",
          items: [
            "Before the ride, eat a familiar carbohydrate-focused meal or snack that leaves enough time for digestion and does not feel heavy in training.",
            "During the ride, choose a plan you can repeat: small bites, drink mix, gels, or a combination that matches ride length and intensity.",
            "After the ride, replace fluid and carbohydrate first, then add protein and a normal meal so recovery supports the next session instead of just the current one.",
          ],
        },
        {
          title: "Simple carb targets by duration",
          items: [
            "Short rides: a small pre-ride snack is often enough if the rest of the day is well fueled.",
            "Moderate rides: many riders do well with steady intake that builds gradually rather than waiting until they feel empty.",
            "Long rides and race-like efforts usually need a more deliberate plan with enough carbohydrate to keep pace and decision-making stable.",
          ],
        },
        {
          title: "Common beginner fueling mistakes",
          items: [
            "Waiting until hunger is obvious usually means you are already behind on fueling.",
            "Trying race-day nutrition for the first time on an important ride is a common reason for stomach trouble.",
            "Overcomplicating the plan with too many products often makes it harder to execute consistently than a simpler routine would.",
          ],
        },
      ],
      faqs: [
        {
          q: "Do I need to eat on rides under an hour?",
          a: "Usually not, unless the ride is unusually hard, you are starting low on energy, or you know from experience that you fade quickly without a snack.",
        },
        {
          q: "What should I eat before a 3-hour ride?",
          a: "Choose a familiar carbohydrate-based meal 2 to 4 hours before the start, then top up with a small snack closer to the ride if needed. Keep fiber and fat moderate if your gut is sensitive.",
        },
        {
          q: "Why do I bonk even when I've eaten?",
          a: "Bonking can happen when intake is too late, too small, too hard to absorb, or mismatched to intensity. A good plan starts before you feel empty and stays steady.",
        },
      ],
    },
    nl: {
      intro: [
        "Voeding op de fiets draait niet om een perfect schema, maar om een plan dat je vermogen, focus en tempo stabiel houdt zonder je maag te overvragen.",
        "Voor de meeste rijders is de praktische vraag niet of je moet eten, maar hoeveel, hoe vroeg en hoe eenvoudig je het kunt houden tijdens een rit.",
      ],
      sections: [
        {
          title: "Wanneer je moet bijtanken op een rit",
          items: [
            "Ritten onder ongeveer 60 minuten vragen meestal geen koolhydraten tijdens de rit, tenzij de sessie erg hard is of je al met weinig energie start.",
            "Zodra een rit langer wordt dan een uur, vooral bij duur- of tempo-intensiteit, wordt regelmatige inname duidelijk nuttiger om output te behouden.",
            "Lange ritten, opeenvolgende trainingsdagen en een nuchtere start maken een vroeg en steady voedingsplan belangrijker.",
          ],
        },
        {
          title: "Basis voor voor, tijdens en na de rit",
          items: [
            "Voor de rit eet je het best een vertrouwde koolhydraatrijke maaltijd of snack die genoeg tijd krijgt om te verteren en niet zwaar aanvoelt.",
            "Tijdens de rit kies je een plan dat je kunt herhalen: kleine happen, drinkmix, gels of een combinatie die past bij duur en intensiteit.",
            "Na de rit vul je eerst vocht en koolhydraten aan, daarna voeg je eiwit en een normale maaltijd toe zodat herstel ook de volgende training ondersteunt.",
          ],
        },
        {
          title: "Eenvoudige koolhydraatrichtlijnen per duur",
          items: [
            "Korte ritten: een kleine snack vooraf is vaak genoeg als de rest van de dag goed gevoed is.",
            "Middellange ritten: veel rijders doen het goed met een gelijkmatige inname die je rustig opbouwt in plaats van te wachten tot je leegloopt.",
            "Lange ritten en wedstrijdachtige inspanningen vragen meestal om een bewuster plan met genoeg koolhydraten om tempo en concentratie stabiel te houden.",
          ],
        },
        {
          title: "Veelgemaakte fouten bij beginners",
          items: [
            "Wachten tot honger duidelijk voelbaar is betekent meestal dat je al achterloopt op je energie-inname.",
            "Wedstrijdvoeding voor het eerst proberen op een belangrijke rit is een veelvoorkomende oorzaak van maagproblemen.",
            "Te veel producten en keuzes maken een plan vaak moeilijker uit te voeren dan een simpele routine.",
          ],
        },
      ],
      faqs: [
        {
          q: "Moet ik eten op ritten onder een uur?",
          a: "Meestal niet, tenzij de rit uitzonderlijk zwaar is, je met weinig energie start of je weet dat je zonder snack snel inzakt.",
        },
        {
          q: "Wat eet ik voor een rit van 3 uur?",
          a: "Kies 2 tot 4 uur voor de start een vertrouwde koolhydraatrijke maaltijd en vul zo nodig kort voor vertrek nog licht aan. Houd vezels en vet gematigd als je maag gevoelig is.",
        },
        {
          q: "Waarom krijg ik een bonk terwijl ik wel gegeten heb?",
          a: "Dat kan gebeuren als je te laat, te weinig of met een slecht passend product eet, of als de inname niet bij de intensiteit past. Een goed plan begint vóórdat je leeg voelt.",
        },
      ],
    },
  },
  "carbs-per-hour-guide": {
    en: {
      intro: [
        "Carbohydrate targets per hour are a practical way to match intake to workload. The number is useful because it turns vague advice into something you can actually execute on the bike.",
        "The main goal is not maximum intake at any cost. It is to find the highest amount your gut can tolerate while still supporting the pace, duration, and quality of the ride.",
      ],
      sections: [
        {
          title: "The evidence base: 60g vs 90g per hour",
          items: [
            "Around 60 grams per hour is a common starting point for many endurance rides and is often enough for sustained work when the effort is steady.",
            "Higher targets near 90 grams per hour become more relevant when the ride is longer, harder, or more race-like and the athlete can absorb more.",
            "The best target depends on total duration, intensity, heat, and what you have trained your gut to tolerate in practice.",
          ],
        },
        {
          title: "Glucose-fructose ratios for higher intake",
          items: [
            "Multiple carbohydrate sources are useful because they use different transport pathways in the gut and can support higher total intake.",
            "Many riders tolerate mixed-source products better than a single-source approach when intake rises above moderate levels.",
            "The exact ratio matters less than whether the product lets you reach your target without bloating or nausea.",
          ],
        },
        {
          title: "Gut training: why tolerance increases with practice",
          items: [
            "The digestive system adapts to repeated carbohydrate intake during training just like the legs adapt to repeated workload.",
            "Start practice doses on normal rides before using higher targets in an event or key session.",
            "Tolerance is built by consistency, not by one heroic attempt to jump straight to a race-day number.",
          ],
        },
        {
          title: "Solid vs liquid fueling by intensity",
          items: [
            "Lower-intensity rides leave more room for solid food, which can make it easier to reach higher totals without constant eating.",
            "At higher intensity, liquid fueling and smaller doses are often easier to process and easier to maintain.",
            "The best mix is the one that matches the ride profile and still lets you keep pedaling at the planned effort.",
          ],
        },
      ],
      faqs: [
        {
          q: "How many carbs per hour do I need?",
          a: "A practical starting point is often around 60g per hour, then adjust upward if the ride is longer or harder and your gut handles more.",
        },
        {
          q: "Can I eat too many carbs on the bike?",
          a: "Yes. If intake exceeds what you can absorb and tolerate, performance can drop because of stomach distress, not because more carbohydrate is inherently bad.",
        },
        {
          q: "Does intensity change my carb needs?",
          a: "Yes. Higher intensity usually raises the value of earlier, steadier intake because the body has less room to make up for missed fueling later.",
        },
      ],
    },
    nl: {
      intro: [
        "Koolhydraten per uur zijn een praktische manier om je inname af te stemmen op de belasting. Het maakt voeding meetbaar en veel eenvoudiger om op de fiets uit te voeren.",
        "Het doel is niet om koste wat kost het hoogste aantal te halen, maar om het hoogste niveau te vinden dat je maag verdraagt en dat je rit echt ondersteunt.",
      ],
      sections: [
        {
          title: "De basis: 60 g versus 90 g per uur",
          items: [
            "Ongeveer 60 gram per uur is voor veel duurritten een logisch startpunt en vaak genoeg bij een steady inspanning.",
            "Richtingen rond 90 gram per uur worden relevanter zodra de rit langer, harder of wedstrijdachtiger wordt en je meer kunt opnemen.",
            "De beste waarde hangt af van duur, intensiteit, warmte en vooral van wat je in training hebt aangeleerd.",
          ],
        },
        {
          title: "Glucose-fructoseverhoudingen voor hogere inname",
          items: [
            "Meerdere koolhydraatbronnen zijn nuttig omdat ze via verschillende transportwegen worden opgenomen en zo hogere totale inname kunnen ondersteunen.",
            "Veel rijders verdragen een mix van bronnen beter dan een enkele bron wanneer de inname stijgt.",
            "De exacte verhouding is minder belangrijk dan of het product je doel haalt zonder opgeblazen gevoel of misselijkheid.",
          ],
        },
        {
          title: "Gut training: waarom tolerantie verbetert met oefening",
          items: [
            "Het spijsverteringsstelsel past zich aan aan herhaalde koolhydraatinname, net zoals je benen zich aanpassen aan training.",
            "Begin met oefendoses op normale ritten voordat je hogere doelen in een wedstrijd of zware training gebruikt.",
            "Tolerantie bouw je op met regelmaat, niet met één poging om meteen een wedstrijdniveau te halen.",
          ],
        },
        {
          title: "Vast versus vloeibaar bij verschillende intensiteit",
          items: [
            "Bij lagere intensiteit is er meer ruimte voor vast voedsel, waardoor hogere totale inname eenvoudiger kan worden.",
            "Bij hogere intensiteit zijn vloeibare voeding en kleinere doses vaak makkelijker te verwerken en vol te houden.",
            "De beste mix past bij het type rit en laat je tegelijk het geplande vermogen blijven trappen.",
          ],
        },
      ],
      faqs: [
        {
          q: "Hoeveel koolhydraten per uur heb ik nodig?",
          a: "Een praktisch startpunt ligt vaak rond 60 g per uur, waarna je kunt opschalen als de rit langer of harder is en je maag meer aankan.",
        },
        {
          q: "Kun je te veel koolhydraten op de fiets nemen?",
          a: "Ja. Als de inname hoger is dan je kunt opnemen en verdragen, daalt je prestatie door maagklachten in plaats van dat meer altijd beter is.",
        },
        {
          q: "Verandert intensiteit mijn koolhydraatbehoefte?",
          a: "Ja. Hogere intensiteit maakt eerdere en gelijkmatigere inname belangrijker omdat je later minder ruimte hebt om gemiste voeding in te halen.",
        },
      ],
    },
  },
  "hydration-and-sweat-rate-guide": {
    en: {
      intro: [
        "Hydration is a pacing and concentration tool as much as a fluid-balance issue. The goal is to stay close enough to normal that performance stays stable without turning every ride into a drink-counting exercise.",
        "Sweat rate is the most useful starting point because it gives you a real number to anchor bottle planning, heat management, and post-ride replacement.",
      ],
      sections: [
        {
          title: "How to estimate your sweat rate",
          items: [
            "Weigh yourself before and after a ride of known duration, then account for what you drank and any fluid you lost from the conditions.",
            "Repeat the test in different temperatures if you want a more realistic range rather than one single number.",
            "The result is not a rigid rule; it is a planning baseline that helps you estimate how quickly you dehydrate in your usual conditions.",
          ],
        },
        {
          title: "Bottle planning by duration and temperature",
          items: [
            "Short, cool rides may need only one bottle or even less if the session is easy and access to water is simple.",
            "Longer or hotter rides require more deliberate bottle planning so that drinking stays ahead of dehydration rather than reacting to it late.",
            "On very hot days, carrying and refilling bottles becomes part of the ride strategy, not an afterthought.",
          ],
        },
        {
          title: "Signs of under- and over-hydration",
          items: [
            "Under-hydration often shows up as rising effort for the same pace, a hotter feeling, and concentration that gets worse as the ride continues.",
            "Over-hydration can be just as problematic if fluid intake outruns sodium losses and body weight rises during the ride.",
            "The useful target is neither constant drinking nor aggressive restriction, but a stable plan that matches the session.",
          ],
        },
        {
          title: "Electrolyte basics for longer rides",
          items: [
            "Electrolytes matter more when the ride is long, hot, or sweaty enough that plain water alone feels insufficient.",
            "A drink mix can help maintain both fluid and sodium intake without requiring extra bottles or complicated timing.",
            "The right electrolyte approach depends on sweat rate, temperature, and how much food and fluid you are already taking in.",
          ],
        },
      ],
      faqs: [
        {
          q: "How do I measure my sweat rate?",
          a: "Weigh yourself before and after a ride, log the duration, and note how much you drank. That gives you a practical estimate of fluid loss per hour.",
        },
        {
          q: "How much should I drink per hour?",
          a: "There is no single perfect number. Start from your sweat-rate estimate and adjust for heat, intensity, and the practical limits of bottle access.",
        },
        {
          q: "Does thirst tell me when to drink?",
          a: "Thirst is useful, but it is usually better as a warning signal than as your only plan. A scheduled baseline works better on long or hot rides.",
        },
      ],
    },
    nl: {
      intro: [
        "Hydratatie is niet alleen een vochtvraag, maar ook een hulpmiddel voor tempo en concentratie. Het doel is dicht genoeg bij normaal te blijven zodat je prestaties stabiel blijven.",
        "Sweat rate is het handigste startpunt omdat het een echte waarde geeft voor bidonplanning, hittebeheer en aanvullen na de rit.",
      ],
      sections: [
        {
          title: "Hoe je je sweat rate schat",
          items: [
            "Weeg jezelf voor en na een rit van bekende duur en houd rekening met wat je hebt gedronken en met de omstandigheden.",
            "Herhaal de test bij verschillende temperaturen als je een bruikbare range wilt in plaats van één exact getal.",
            "De uitkomst is geen harde regel, maar een planningsbasis om te zien hoe snel je in jouw omstandigheden vocht verliest.",
          ],
        },
        {
          title: "Bidonplanning per duur en temperatuur",
          items: [
            "Korte ritten in koele omstandigheden vragen soms maar één bidon of zelfs minder als het rustig is en water dichtbij is.",
            "Langere of warmere ritten vragen om bewustere bidonplanning zodat drinken de dehydratie voorblijft in plaats van erop te reageren.",
            "Op hete dagen hoort bijvullen en meenemen van bidons bij de strategie van de rit.",
          ],
        },
        {
          title: "Signalen van onder- en overhydratatie",
          items: [
            "Onderhydratatie merk je vaak aan stijgende inspanning bij hetzelfde tempo, een heter gevoel en slechtere concentratie naarmate de rit vordert.",
            "Overhydratatie kan ook problemen geven als je meer drinkt dan je natrium verliest en je lichaamsgewicht tijdens de rit stijgt.",
            "Het nuttige doel is niet constant drinken of te streng beperken, maar een stabiel plan dat bij de sessie past.",
          ],
        },
        {
          title: "Basis van elektrolyten voor langere ritten",
          items: [
            "Elektrolyten worden belangrijker zodra de rit lang, warm of zweterig genoeg is dat alleen water minder goed werkt.",
            "Een drinkmix kan helpen om vocht en natrium tegelijk aan te vullen zonder extra gedoe met timing.",
            "De juiste aanpak hangt af van sweat rate, temperatuur en van hoeveel voeding en drinken je al gebruikt.",
          ],
        },
      ],
      faqs: [
        {
          q: "Hoe meet ik mijn sweat rate?",
          a: "Weeg jezelf voor en na een rit, noteer de duur en hoeveel je hebt gedronken. Daarmee krijg je een praktische schatting van vochtverlies per uur.",
        },
        {
          q: "Hoeveel moet ik per uur drinken?",
          a: "Er is geen enkel perfect getal. Begin met je sweat-rate schatting en pas aan voor warmte, intensiteit en de praktische mogelijkheden onderweg.",
        },
        {
          q: "Zegt dorst genoeg over wanneer ik moet drinken?",
          a: "Dorst is nuttig, maar werkt meestal beter als waarschuwing dan als enige plan. Voor lange of warme ritten is een basis op schema beter.",
        },
      ],
    },
  },
  "sodium-and-electrolytes-guide": {
    en: {
      intro: [
        "Sodium is the electrolyte that matters most for maintaining fluid balance during long, sweaty rides. It helps replace what is lost in sweat and supports the body when fluid intake rises.",
        "The right amount is not about maximum supplementation. It is about matching losses well enough that drinking and fueling still feel comfortable and effective.",
      ],
      sections: [
        {
          title: "What sodium does during exercise",
          items: [
            "Sodium helps the body retain fluid and supports normal nerve and muscle function while you are exercising.",
            "When rides are long or hot, sodium becomes more relevant because sweat losses increase and plain water can dilute the balance too far.",
            "It works best as part of an overall hydration plan rather than as a stand-alone fix.",
          ],
        },
        {
          title: "Estimating sodium loss",
          items: [
            "Sweat sodium concentration varies a lot between athletes, so personal response matters more than a generic label claim.",
            "Heavy sweaters and riders who leave visible salt marks on kit often need more attention to sodium replacement.",
            "The most useful estimate comes from matching your typical sweat rate with the concentration you seem to lose in your own conditions.",
          ],
        },
        {
          title: "When electrolyte products make a difference",
          items: [
            "Electrolyte products are most useful on long, hot, or very sweaty rides where water alone does not feel sufficient.",
            "They can also simplify planning because one bottle can cover both fluid and sodium needs.",
            "If your rides are short and cool, the practical benefit may be small compared with simply eating normal food later.",
          ],
        },
        {
          title: "The hyponatraemia risk: don't over-drink plain water",
          items: [
            "Drinking large amounts of plain water without enough sodium can push body fluid balance in the wrong direction.",
            "The risk is highest in very long events where riders keep drinking but replace little sodium and use a lot of fluid overall.",
            "A steady, modest plan is safer and more effective than trying to force hydration beyond what the ride actually requires.",
          ],
        },
      ],
      faqs: [
        {
          q: "Do I need electrolytes on every ride?",
          a: "Usually not. They matter more as rides get longer, hotter, and sweatier, or when you know you are a heavy sweater.",
        },
        {
          q: "How salty is my sweat?",
          a: "You can estimate it from personal response, salt residue, and how you feel on hot rides, but exact concentration is hard to know without testing.",
        },
        {
          q: "Can I get enough sodium from food alone?",
          a: "For many shorter rides, yes. On long or hot rides, an electrolyte drink or salt-containing snack can make the plan easier to execute.",
        },
      ],
    },
    nl: {
      intro: [
        "Natrium is de elektrolyt die het meest telt voor vochtbalans tijdens lange en zweterige ritten. Het helpt om verlies via zweet te compenseren en ondersteunt het lichaam zodra je veel drinkt.",
        "De juiste hoeveelheid draait niet om zoveel mogelijk suppleren, maar om verlies goed genoeg aan te vullen zodat drinken en eten comfortabel en effectief blijven.",
      ],
      sections: [
        {
          title: "Wat natrium doet tijdens inspanning",
          items: [
            "Natrium helpt het lichaam vocht vast te houden en ondersteunt normale zenuw- en spierfunctie tijdens inspanning.",
            "Bij lange of warme ritten wordt natrium belangrijker omdat zweetverlies toeneemt en alleen water de balans te ver kan verdunnen.",
            "Het werkt het best als onderdeel van een totaalplan voor hydratatie, niet als losse oplossing.",
          ],
        },
        {
          title: "Hoe je natriumverlies inschat",
          items: [
            "De natriumconcentratie in zweet verschilt sterk per atleet, dus je eigen reactie is belangrijker dan een generieke claim op het etiket.",
            "Rijders die veel zweten of zichtbare zoutplekken op kleding hebben, hebben vaak meer aandacht nodig voor aanvulling.",
            "De handigste schatting komt uit het combineren van je sweat rate met wat je in jouw omstandigheden lijkt te verliezen.",
          ],
        },
        {
          title: "Wanneer elektrolytproducten echt verschil maken",
          items: [
            "Elektrolytproducten zijn het nuttigst op lange, warme of zeer zweterige ritten waar alleen water minder goed werkt.",
            "Ze maken planning eenvoudiger omdat één bidon tegelijk vocht en natrium kan leveren.",
            "Bij korte en koele ritten is het praktische voordeel vaak klein en volstaat normaal eten later meestal prima.",
          ],
        },
        {
          title: "Het hyponatriëmierisico: niet te veel gewoon water drinken",
          items: [
            "Grote hoeveelheden gewoon water zonder genoeg natrium kunnen de vochtbalans de verkeerde kant op duwen.",
            "Dat risico is het grootst in zeer lange events waar rijders veel blijven drinken maar weinig natrium aanvullen.",
            "Een stabiel en gematigd plan is veiliger en effectiever dan proberen te overdrinken.",
          ],
        },
      ],
      faqs: [
        {
          q: "Heb ik op elke rit elektrolyten nodig?",
          a: "Meestal niet. Ze worden belangrijker naarmate ritten langer, warmer en zweteriger worden, of als je weet dat je veel zweet verliest.",
        },
        {
          q: "Hoe zout is mijn zweet?",
          a: "Dat kun je benaderen via je eigen reactie, zoutresten en hoe je je voelt op warme ritten, maar exacte concentratie is lastig zonder test.",
        },
        {
          q: "Kan ik genoeg natrium uit eten halen?",
          a: "Voor veel kortere ritten wel. Bij lange of warme ritten kan een elektrolytendrank of zoutrijke snack het plan eenvoudiger maken.",
        },
      ],
    },
  },
  "ftp-explained": {
    en: {
      intro: [
        "FTP is a useful training anchor, but it is still an estimate of sustainable power rather than a direct measure of every performance outcome. It gives structure, not certainty.",
        "Used well, FTP helps riders set zones, interpret workouts, and track progress over time without pretending that one number explains everything about fitness.",
      ],
      sections: [
        {
          title: "What FTP measures and what it doesn't",
          items: [
            "FTP is meant to represent a high sustainable effort, usually for roughly an hour, but real-world performance also depends on endurance, repeatability, and pacing skill.",
            "It does not capture sprint ability, climbing preference, aerodynamics, or how well you handle fatigue in long events.",
            "Treat FTP as one useful coordinate in the map, not the whole map itself.",
          ],
        },
        {
          title: "How FTP tests work",
          items: [
            "Twenty-minute, ramp, and eight-minute protocols all estimate threshold from different performance signatures.",
            "Each test has trade-offs: one may be more practical, another more repeatable, and another more sensitive to pacing style.",
            "The best test is the one you can perform consistently and interpret in the same way each time.",
          ],
        },
        {
          title: "Using FTP to set training zones",
          items: [
            "Zones turn threshold into a training language you can use for endurance, tempo, threshold, and interval work.",
            "They are most useful when they guide session design and recovery, not when they become the only way you judge a ride.",
            "A slightly imperfect FTP value is still useful if it helps you train with consistency.",
          ],
        },
        {
          title: "Why FTP changes over time",
          items: [
            "FTP changes with training load, freshness, body composition, and the specific kind of work you have been doing.",
            "A rise in FTP does not always mean every kind of ride got better, but it often signals improved sustainable output.",
            "Retesting is less important than tracking whether your recent sessions feel easier, harder, or more repeatable.",
          ],
        },
      ],
      faqs: [
        {
          q: "What is a good FTP for my level?",
          a: "A good FTP is the one that matches your goals, body size, and training history. Absolute numbers matter less than how the number supports your training decisions.",
        },
        {
          q: "How accurate are FTP estimates without a power meter?",
          a: "They can be directionally useful but are still less precise than direct power data. Use them as a rough guide, not as a lab-grade measurement.",
        },
        {
          q: "How often should I retest?",
          a: "Retest when training has moved enough that the old value is no longer a good guide, or when your workouts clearly show the number is stale.",
        },
      ],
    },
    nl: {
      intro: [
        "FTP is een nuttig anker voor training, maar blijft een schatting van duurzaam vermogen en geen directe meting van alles wat prestaties bepaalt.",
        "Goed gebruikt helpt FTP je zones, trainingen en progressie te ordenen zonder te doen alsof één getal je hele conditie uitlegt.",
      ],
      sections: [
        {
          title: "Wat FTP wel en niet meet",
          items: [
            "FTP moet een hoge duurzame inspanning benaderen, meestal rond een uur, maar echte prestaties hangen ook af van uithoudingsvermogen, herhaalbaarheid en pacing.",
            "Het zegt niets volledig over sprintvermogen, klimvoorkeur, aerodynamica of hoe je vermoeidheid op lange events verwerkt.",
            "Zie FTP dus als één bruikbaar punt op de kaart, niet als de hele kaart.",
          ],
        },
        {
          title: "Hoe FTP-tests werken",
          items: [
            "Twintig-minuten-, ramp- en acht-minutenprotocollen schatten drempel via verschillende prestatieprofielen.",
            "Elke test heeft voor- en nadelen: de ene is praktischer, de andere beter herhaalbaar of gevoeliger voor pacingstijl.",
            "De beste test is degene die je consequent kunt uitvoeren en telkens op dezelfde manier kunt interpreteren.",
          ],
        },
        {
          title: "FTP gebruiken om trainingszones te zetten",
          items: [
            "Zones vertalen drempel naar een trainingsvocabulaire voor duur, tempo, drempel en intervallen.",
            "Ze zijn het nuttigst als ze je sessie-opbouw en herstel sturen, niet als ze het enige oordeel over een rit vormen.",
            "Een licht onvolmaakte FTP-waarde blijft bruikbaar als ze je helpt om consistent te trainen.",
          ],
        },
        {
          title: "Waarom FTP in de tijd verandert",
          items: [
            "FTP verschuift mee met trainingsbelasting, frisheid, lichaamssamenstelling en het type werk dat je recent hebt gedaan.",
            "Een stijging betekent niet dat elk soort rit beter werd, maar wel vaak dat je duurvermogen is gegroeid.",
            "Opnieuw testen is minder belangrijk dan kijken of je recente sessies makkelijker, zwaarder of beter herhaalbaar aanvoelen.",
          ],
        },
      ],
      faqs: [
        {
          q: "Wat is een goede FTP voor mijn niveau?",
          a: "Een goede FTP is de waarde die past bij je doelen, lichaamsbouw en trainingsachtergrond. Het absolute getal is minder belangrijk dan wat je ermee doet.",
        },
        {
          q: "Hoe nauwkeurig zijn FTP-schattingen zonder powermeter?",
          a: "Ze kunnen richting geven, maar zijn minder precies dan echte powerdata. Gebruik ze als grove leidraad, niet als laboratoriummetingen.",
        },
        {
          q: "Hoe vaak moet ik opnieuw testen?",
          a: "Test opnieuw wanneer je training genoeg veranderd is dat de oude waarde geen goed stuurgetal meer is, of wanneer je workouts laten zien dat de waarde verouderd is.",
        },
      ],
    },
  },
  "wkg-and-power-zones-guide": {
    en: {
      intro: [
        "W/kg is a compact way to compare climbing power across different rider sizes, which makes it useful when gradients punish excess mass and reward sustainable output.",
        "Power zones then turn that threshold into a daily training tool, helping you decide which sessions build endurance, which build threshold, and which should be kept easy.",
      ],
      sections: [
        {
          title: "W/kg: why relative power matters on climbs",
          items: [
            "Relative power matters most when gravity is a major part of the work, especially on steady climbs and repeated punchy efforts.",
            "A lighter rider with lower absolute power may climb faster than a heavier rider with more watts if the ratio is better for the terrain.",
            "W/kg is useful for comparison, but it still does not replace pacing, aerodynamics, or riding skill.",
          ],
        },
        {
          title: "Zone models: 5-zone vs 7-zone",
          items: [
            "Five-zone models are simpler and often enough for riders who want clarity and easy session planning.",
            "Seven-zone models add more detail around threshold and high-intensity work, which can help when training is more structured.",
            "Choose the model that your coach, platform, or team uses consistently so your sessions stay comparable over time.",
          ],
        },
        {
          title: "How to use zones in training",
          items: [
            "Use zones to place each session in the right intensity bucket and to avoid drifting too hard on days that should stay aerobic.",
            "They are especially useful for interval structure, recovery decisions, and comparing the load of different workouts.",
            "The best zone system is the one that helps you execute the plan cleanly rather than second-guess every ride.",
          ],
        },
        {
          title: "The limits of zone-based training",
          items: [
            "Zones simplify physiology, which makes them practical but not complete.",
            "Fatigue, heat, terrain, and ride context can change what a given zone feels like on the day.",
            "Use zones as a guide, then confirm with performance trends, recovery, and how repeatable the work feels.",
          ],
        },
      ],
      faqs: [
        {
          q: "What W/kg do I need for club rides?",
          a: "That depends on the pace, terrain, and how the group rides. W/kg helps on climbs, but pack riding and drafting still matter a lot on flats.",
        },
        {
          q: "Which zone model should I use?",
          a: "Use the model that matches your coach, training platform, or team setup. Consistency matters more than the number of zones itself.",
        },
        {
          q: "Do zones change when my FTP changes?",
          a: "Yes. If FTP moves, zone boundaries should move with it so the training language stays aligned with your current capacity.",
        },
      ],
    },
    nl: {
      intro: [
        "W/kg is een compacte manier om klimvermogen tussen verschillende lichaamsgroottes te vergelijken. Het is vooral nuttig waar zwaartekracht veel van het werk bepaalt.",
        "Power zones zetten die drempel vervolgens om in een praktisch trainingsinstrument, zodat je weet welke sessies duur opbouwen en welke rustig moeten blijven.",
      ],
      sections: [
        {
          title: "W/kg: waarom relatieve power telt op klimmen",
          items: [
            "Relatieve power telt het meest zodra zwaartekracht een groot deel van het werk uitmaakt, vooral op constante klimmen en herhaalde punchy inspanningen.",
            "Een lichtere rijder met minder absolute watts kan sneller klimmen dan een zwaardere rijder met meer vermogen als de verhouding beter is.",
            "W/kg is handig om te vergelijken, maar vervangt pacing, aerodynamica of rijvaardigheid niet.",
          ],
        },
        {
          title: "Zone-modellen: 5-zone versus 7-zone",
          items: [
            "Vijf zones zijn simpeler en vaak genoeg voor rijders die duidelijkheid en makkelijke sessieplanning willen.",
            "Zeven zones geven meer detail rond drempel en hoge intensiteit, wat nuttig kan zijn bij meer gestructureerde training.",
            "Kies het model dat je coach, platform of team consequent gebruikt, zodat trainingen vergelijkbaar blijven.",
          ],
        },
        {
          title: "Hoe je zones gebruikt in training",
          items: [
            "Gebruik zones om elke sessie in de juiste intensiteitsbak te plaatsen en te voorkomen dat rustige dagen toch te hard worden.",
            "Ze zijn vooral nuttig voor intervalopbouw, hersteltiming en het vergelijken van trainingsbelasting.",
            "Het beste zonesysteem is het systeem dat je helpt om de training strak uit te voeren zonder elke rit te overdenken.",
          ],
        },
        {
          title: "De grenzen van zone-training",
          items: [
            "Zones vereenvoudigen fysiologie, dus ze zijn praktisch maar niet volledig.",
            "Vermoeidheid, warmte, terrein en context kunnen maken dat dezelfde zone anders aanvoelt.",
            "Gebruik zones als gids en check daarna met prestatie, herstel en herhaalbaarheid of het klopt.",
          ],
        },
      ],
      faqs: [
        {
          q: "Welke W/kg heb ik nodig voor clubritten?",
          a: "Dat hangt af van tempo, terrein en hoe de groep rijdt. W/kg helpt vooral op klimmen; op vlak terrein blijven positionering en draften belangrijk.",
        },
        {
          q: "Welk zone-model moet ik gebruiken?",
          a: "Gebruik het model dat past bij je coach, trainingsplatform of team. Consistentie is belangrijker dan het aantal zones zelf.",
        },
        {
          q: "Veranderen zones als mijn FTP verandert?",
          a: "Ja. Als FTP verandert, moeten de zonegrenzen mee verschuiven zodat de trainingsniveaus weer kloppen met je actuele capaciteit.",
        },
      ],
    },
  },
  "power-to-speed-guide": {
    en: {
      intro: [
        "Power to speed is a physics problem, not a promise. The same watts can produce very different speeds depending on drag, gradient, rolling resistance, wind, and rider mass.",
        "That is why speed estimates are most useful as planning tools: they show where gains are likely to come from and where extra watts will produce only a modest change.",
      ],
      sections: [
        {
          title: "The physics: CdA, Crr, gradient, and weight",
          items: [
            "CdA describes how much air you present to the wind, while Crr captures rolling losses from tires and road surface.",
            "Gradient changes the balance because climbing adds a mass penalty that flat-road riding does not have.",
            "Wind direction and strength can dominate the outcome more than riders expect, which is why speed is never a pure watts-to-watts comparison.",
          ],
        },
        {
          title: "Why small power gains don't always mean faster times",
          items: [
            "When drag or gradient is already the main limiter, a modest increase in power may only produce a small speed increase.",
            "The more aerodynamic or lighter the setup, the different the return on extra watts becomes.",
            "Aiming for a realistic gain is better than expecting every additional watt to save the same amount of time.",
          ],
        },
        {
          title: "Aerodynamics vs watts: where gains are largest",
          items: [
            "On flat and fast terrain, aerodynamic improvements often matter more than a small watt gain.",
            "On steep climbs, power and weight ratio gain importance, while aero still matters less than on the flat.",
            "The biggest wins often come from fixing the largest bottleneck rather than chasing the easiest-to-measure number.",
          ],
        },
        {
          title: "Using the speed estimator for goal planning",
          items: [
            "Use a speed estimate to sanity-check race plans, commute times, or segment goals before you commit to them.",
            "Treat the result as a range because temperature, road quality, drafting, and wind all move the answer.",
            "The estimator is most helpful when you compare scenarios: a position change, a wheel change, or a power target against the same route.",
          ],
        },
      ],
      faqs: [
        {
          q: "How much power does it take to ride 30 km/h?",
          a: "It depends on position, terrain, wind, tires, and rider size. There is no single number that applies to every rider or route.",
        },
        {
          q: "Is it faster to lose weight or add watts?",
          a: "That depends on the terrain and the size of the change. On climbs, weight matters more; on flats, aerodynamics and absolute power usually dominate.",
        },
        {
          q: "How do wind and gradient interact with speed?",
          a: "Wind changes the aerodynamic cost, while gradient changes the gravitational cost. Together they can make the same power output look very different on the road.",
        },
      ],
    },
    nl: {
      intro: [
        "Power-to-speed is een fysica-vraag, geen belofte. Dezelfde watts kunnen totaal andere snelheden opleveren door luchtweerstand, helling, rolweerstand, wind en lichaamsgewicht.",
        "Daarom is een snelheidschatting vooral nuttig als planningshulpmiddel: je ziet waar winst waarschijnlijk vandaan komt en waar extra watts maar weinig verschil maken.",
      ],
      sections: [
        {
          title: "De fysica: CdA, Crr, helling en gewicht",
          items: [
            "CdA beschrijft hoeveel lucht je aan de wind presenteert; Crr staat voor rolverliezen van banden en wegdek.",
            "Helling verandert de balans omdat klimmen een massa-penalty toevoegt die vlak rijden niet heeft.",
            "Windrichting en windsnelheid kunnen de uitkomst sterker beïnvloeden dan veel rijders verwachten, waardoor snelheid nooit een pure watt-vergelijking is.",
          ],
        },
        {
          title: "Waarom kleine vermogenswinsten niet altijd veel sneller zijn",
          items: [
            "Als luchtweerstand of helling al de hoofdlimiter is, levert een kleine vermogensstijging vaak maar een bescheiden snelheidswinst op.",
            "Hoe aerodynamischer of lichter de setup al is, hoe anders het rendement van extra watts wordt.",
            "Een realistische winst inschatten is beter dan verwachten dat elke extra watt evenveel tijd bespaart.",
          ],
        },
        {
          title: "Aerodynamica versus watts: waar zit de grootste winst",
          items: [
            "Op vlak en snel terrein leveren aerodynamische verbeteringen vaak meer op dan een kleine wattwinst.",
            "Op steile klimmen worden vermogen en gewicht belangrijker, terwijl aero daar minder zwaar weegt.",
            "De grootste winst komt vaak uit het aanpakken van de grootste bottleneck in plaats van het makkelijkst meetbare getal.",
          ],
        },
        {
          title: "De snelheidschatting gebruiken voor doelen",
          items: [
            "Gebruik een snelheidschatting om raceplannen, reistijden of segmentdoelen vooraf realistisch te maken.",
            "Zie de uitkomst als een bandbreedte, want temperatuur, wegkwaliteit, draften en wind verschuiven het antwoord.",
            "De tool is het nuttigst als je scenario's vergelijkt: een andere houding, een ander wiel of een vermogensdoel op dezelfde route.",
          ],
        },
      ],
      faqs: [
        {
          q: "Hoeveel vermogen heb ik nodig om 30 km/u te rijden?",
          a: "Dat hangt af van houding, terrein, wind, banden en lichaamsgrootte. Er is geen enkel getal dat voor elke rijder of route klopt.",
        },
        {
          q: "Is afvallen sneller dan meer watts trainen?",
          a: "Dat hangt af van het terrein en de grootte van de verandering. Op klimmen telt gewicht meer; op vlak terrein domineren aerodynamica en absoluut vermogen meestal.",
        },
        {
          q: "Hoe werken wind en helling samen met snelheid?",
          a: "Wind verandert de aerodynamische kost, terwijl helling de zwaartekrachtkost verandert. Samen kunnen ze hetzelfde vermogen heel anders laten voelen op de weg.",
        },
      ],
    },
  },
  "climb-time-and-event-pacing-guide": {
    en: {
      intro: [
        "Climb time and event pacing are about managing effort so you arrive at the top, the finish, or the decisive segment with enough capacity left to keep producing power.",
        "The best pacing plan is usually the one that avoids early overreach, respects the terrain, and leaves room for fuel, heat, and fatigue to do their work without derailing the ride.",
      ],
      sections: [
        {
          title: "Even vs variable pacing: what the data says",
          items: [
            "Even pacing is often efficient on steady climbs because it avoids big spikes that cost extra energy for little gain.",
            "Variable pacing can make sense when terrain changes, drafting matters, or you need to respond to tactical moments.",
            "The right choice depends on whether the event rewards steady output or strategic surges.",
          ],
        },
        {
          title: "Starting too hard: the most common mistake",
          items: [
            "The early minutes often feel easier than they actually are, which tempts riders to spend too much too soon.",
            "A small overstart can create a much larger cost later when fatigue, heat, and rising lactate stack together.",
            "Good pacing usually feels slightly conservative early and increasingly appropriate as the climb or event unfolds.",
          ],
        },
        {
          title: "Fueling and pacing as an integrated plan",
          items: [
            "Pacing fails more often when fueling is an afterthought, because low carbohydrate availability reduces the ability to hold target power.",
            "On longer climbs or events, eating and drinking should be scheduled around the pace plan rather than added randomly.",
            "The best effort strategy is the one that matches both intensity and intake from the first kilometer onward.",
          ],
        },
        {
          title: "Using W/kg to estimate climb time",
          items: [
            "W/kg is a useful input for climb estimates, but the route, gradient, and aerodynamics still decide the final result.",
            "Short steep climbs behave differently from long steady ascents, so the estimate should reflect the actual profile.",
            "Use the number to set expectations, then adjust for how fresh you are and how hard you can sustain the effort on the day.",
          ],
        },
      ],
      faqs: [
        {
          q: "How do I pace a long climb I've never done before?",
          a: "Start slightly more conservatively than you think you need to, keep the effort smooth, and reserve enough margin for the final third if the climb is long.",
        },
        {
          q: "Should I pace by power or by feel?",
          a: "Use power when you have it, then confirm with feel. Power keeps the plan honest, while feel helps account for heat, altitude, and stress.",
        },
        {
          q: "How does temperature affect pacing?",
          a: "Heat raises physiological cost, so the same power feels harder and usually needs a more conservative plan, especially on long efforts.",
        },
      ],
    },
    nl: {
      intro: [
        "Klimtijd en pacing gaan over effort zo verdelen dat je boven, op de finish of op het beslissende stuk nog genoeg over hebt om vermogen te blijven leveren.",
        "Het beste pacingplan voorkomt een te harde start, houdt rekening met het profiel en laat ruimte voor voeding, warmte en vermoeidheid zonder dat de rit ontspoort.",
      ],
      sections: [
        {
          title: "Gelijkmatig versus variabel pacing: wat zegt de data",
          items: [
            "Gelijkmatig pacing werkt vaak efficiënt op constante klimmen omdat je grote pieken vermijdt die extra energie kosten.",
            "Variabel pacing kan logisch zijn als het terrein verandert, draften belangrijk is of je tactisch moet reageren.",
            "De juiste keuze hangt af van of het event steady output of strategische surges beloont.",
          ],
        },
        {
          title: "Te hard starten: de meest voorkomende fout",
          items: [
            "De eerste minuten voelen vaak makkelijker dan ze werkelijk zijn, waardoor rijders te veel te vroeg uitgeven.",
            "Een kleine overshoot aan het begin kan later veel kosten zodra vermoeidheid, warmte en lactaat zich opstapelen.",
            "Goed pacing voelt meestal aan het begin iets conservatief en wordt gaandeweg steeds passender.",
          ],
        },
        {
          title: "Voeding en pacing als één plan",
          items: [
            "Pacing gaat sneller mis als voeding een bijzaak is, omdat te weinig koolhydraten het vermogen om target power vast te houden verlaagt.",
            "Bij langere klimmen of events moeten eten en drinken rond het pacingplan ingepland worden.",
            "De beste effort-strategie is die waarin intensiteit en inname vanaf het eerste kilometerdeel op elkaar aansluiten.",
          ],
        },
        {
          title: "W/kg gebruiken om klimtijd te schatten",
          items: [
            "W/kg is een bruikbare input voor klimschattingen, maar route, helling en aerodynamica bepalen nog steeds het eindresultaat.",
            "Korte steile klimmen gedragen zich anders dan lange constante beklimmingen, dus de schatting moet passen bij het echte profiel.",
            "Gebruik het getal om verwachtingen te zetten en pas daarna aan voor frisheid en hoe hard je het die dag kunt volhouden.",
          ],
        },
      ],
      faqs: [
        {
          q: "Hoe pace ik een lange klim die ik nog nooit heb gedaan?",
          a: "Begin iets conservatiever dan je denkt nodig te hebben, houd de inspanning soepel en bewaar marge voor het laatste derde als de klim lang is.",
        },
        {
          q: "Moet ik pace'en op power of op gevoel?",
          a: "Gebruik power als je die hebt en bevestig daarna met gevoel. Power houdt het plan eerlijk, gevoel vangt warmte, hoogte en stress op.",
        },
        {
          q: "Wat doet temperatuur met pacing?",
          a: "Warmte verhoogt de fysiologische kost, waardoor hetzelfde vermogen zwaarder voelt en meestal een conservatiever plan vraagt, zeker op lange inspanningen.",
        },
      ],
    },
  },
  "bike-fit-for-tall-riders": {
    en: {
      intro: [
        "Tall riders often run into a different kind of limit than smaller riders: the frame may be long enough in one dimension but compromised in another, especially once stack, reach, crank length, and cockpit setup are considered together.",
        "Good fit for tall riders is not just about buying the largest frame. It is about finding a platform that keeps proportions sensible without forcing extreme component choices.",
      ],
      sections: [
        {
          title: "Frame size and what runs out first at larger sizes",
          items: [
            "At larger sizes, stack and reach often become more important than the nominal size label on the frame.",
            "Some bikes have enough length but not enough front-end height, which creates a stretched or overly slammed position.",
            "Check the full geometry chart rather than assuming the biggest size will automatically fit a tall rider well.",
          ],
        },
        {
          title: "Long legs and torso: how they change setup",
          items: [
            "Long legs can push saddle height high enough that seatpost exposure, frame clearance, and crank length all need review.",
            "A longer torso often calls for more cockpit length, but not necessarily an aggressive drop from saddle to bar.",
            "The goal is a position that respects proportions instead of forcing every dimension to be maximized.",
          ],
        },
        {
          title: "Components that limit fit at larger sizes",
          items: [
            "Stem length, handlebar width, saddle setback, and crank length are the first parts that reveal whether the frame has enough room.",
            "Tall riders sometimes need longer cranks or a higher stack, but those changes should still be matched to mobility and pedaling style.",
            "If multiple component changes are required just to make the frame usable, the frame may not be the right platform.",
          ],
        },
        {
          title: "How to shortlist frames using stack and reach",
          items: [
            "Compare stack and reach first, then confirm with top tube shape, seat tube design, and cockpit range.",
            "Look for frames that leave adjustment room both up and down rather than ones that only work at one exact setup.",
            "A practical shortlist is usually a few frames that support your position without custom work or unstable component compromises.",
          ],
        },
      ],
      faqs: [
        {
          q: "What stack and reach should a 195cm rider look for?",
          a: "There is no single answer, because proportions vary. Start with a geometry range that matches your torso, flexibility, and cockpit needs rather than height alone.",
        },
        {
          q: "Are longer cranks better for tall riders?",
          a: "Sometimes, but not automatically. Longer cranks can suit long legs, yet they also change hip angle and clearance, so fit matters more than size alone.",
        },
        {
          q: "What frame geometry suits tall riders best?",
          a: "A frame with enough stack, enough reach, and room for sensible component choices usually works better than a tall frame that only fits on paper.",
        },
      ],
    },
    nl: {
      intro: [
        "Lange rijders lopen vaak tegen andere grenzen aan dan kleinere rijders: het frame kan in één richting wel passen, maar in een andere richting al snel krap worden zodra stack, reach, cranklengte en cockpit samenkomen.",
        "Een goede fit voor lange rijders gaat daarom niet alleen over het grootste frame kopen, maar over een platform vinden dat proporties netjes houdt zonder extreme componentkeuzes te forceren.",
      ],
      sections: [
        {
          title: "Framemaat en wat het eerst opraakt bij grote maten",
          items: [
            "Bij grotere maten worden stack en reach vaak belangrijker dan de maatsticker op het frame.",
            "Sommige fietsen hebben genoeg lengte maar niet genoeg voorkanthoogte, waardoor je te lang of te laag uitkomt.",
            "Bekijk de volledige geometrie in plaats van aan te nemen dat de grootste maat automatisch goed past.",
          ],
        },
        {
          title: "Lange benen en romp: wat verandert er in de setup",
          items: [
            "Lange benen kunnen de zadelhoogte zo ver omhoog brengen dat zadelpenuitsteking, framevrijheid en cranklengte samen bekeken moeten worden.",
            "Een langere romp vraagt vaak meer cockpitlengte, maar niet per se een agressieve drop van zadel naar stuur.",
            "Het doel is een positie die bij de verhoudingen past en niet alles maximaal opschuift.",
          ],
        },
        {
          title: "Componenten die de fit begrenzen bij grote maten",
          items: [
            "Stamlengte, stuurbreedte, setback van het zadel en cranklengte zijn vaak de eerste onderdelen die laten zien of het frame genoeg marge heeft.",
            "Lange rijders hebben soms langere cranks of meer stack nodig, maar die keuzes moeten wel passen bij mobiliteit en trapstijl.",
            "Als je meerdere componenten moet aanpassen om het frame bruikbaar te maken, is het waarschijnlijk niet de juiste basis.",
          ],
        },
        {
          title: "Frames shortlistten op stack en reach",
          items: [
            "Vergelijk eerst stack en reach en controleer daarna top tube, seat tube en cockpit-marge.",
            "Zoek frames die zowel omhoog als omlaag nog afstelruimte bieden in plaats van één exacte stand.",
            "Een bruikbare shortlist bestaat meestal uit een paar frames die je positie ondersteunen zonder maatwerk of vreemde compromissen.",
          ],
        },
      ],
      faqs: [
        {
          q: "Welke stack en reach moet een rijder van 195 cm zoeken?",
          a: "Daar is geen enkel antwoord op, omdat proporties verschillen. Begin met een geometriebereik dat past bij romp, flexibiliteit en cockpitbehoefte, niet alleen bij lengte.",
        },
        {
          q: "Zijn langere cranks beter voor lange rijders?",
          a: "Soms, maar niet automatisch. Langere cranks kunnen goed passen bij lange benen, maar veranderen ook heuphoek en ruimte, dus fit blijft leidend.",
        },
        {
          q: "Welke framegeometrie past het best bij lange rijders?",
          a: "Een frame met genoeg stack, genoeg reach en ruimte voor normale componentkeuzes werkt meestal beter dan een groot frame dat alleen op papier past.",
        },
      ],
    },
  },
  "bike-fit-for-riders-with-a-shorter-torso": {
    en: {
      intro: [
        "Riders with a shorter torso often feel stretched not because they are doing anything wrong, but because many stock frames are built around a reach assumption that does not match their proportions.",
        "The solution is usually not an extreme stem swap. It is a better match between frame reach, bar position, and the rider's actual upper-body length.",
      ],
      sections: [
        {
          title: "Why shorter torso riders feel stretched on standard frames",
          items: [
            "A frame can be correct in stack but still too long in the front end for a rider with shorter upper-body reach.",
            "When reach is excessive, riders often compensate by dropping the bars too low or shortening the stem too far.",
            "Those compensations can make the position feel worse even if the numbers look neat on paper.",
          ],
        },
        {
          title: "Frame reach and stem interaction for short-torso fit",
          items: [
            "Start with frame reach, because stem length can only adjust so much before handling changes become noticeable.",
            "A moderate stem on a shorter-reach frame usually preserves steering feel better than a very short stem on an oversized frame.",
            "The frame should do most of the sizing work; the stem should fine-tune the last part of the fit.",
          ],
        },
        {
          title: "Bar height and drop for shorter arm reach",
          items: [
            "A shorter torso often benefits from a bar position that is not too low, because excessive drop can increase the feeling of stretch.",
            "Saddle-to-bar drop should match flexibility and ride intent, not a generic road-race ideal.",
            "A slightly higher front end can make breathing, control, and long-ride comfort more sustainable.",
          ],
        },
        {
          title: "Component choices that help",
          items: [
            "Shorter stems, compact bars, and appropriate hood placement can improve cockpit feel without changing the whole bike.",
            "The right saddle position still matters, because moving the saddle too far forward to shorten reach can create other issues.",
            "Use components to refine a sensible frame choice, not to rescue a frame that is fundamentally too long.",
          ],
        },
      ],
      faqs: [
        {
          q: "How do I know if my torso is short relative to my legs?",
          a: "Look at how much reach you need compared with your saddle height and arm length. If standard bikes feel long even with normal stem lengths, torso proportion may be part of it.",
        },
        {
          q: "What stem length suits a shorter torso?",
          a: "It depends on the frame, steering, and bar shape, but the goal is to stay in a normal handling range rather than forcing a very short stem on the wrong frame.",
        },
        {
          q: "Is a women's-specific frame the answer?",
          a: "Not automatically. Some riders benefit from the geometry, but fit should be judged by stack, reach, and cockpit setup rather than the marketing label.",
        },
      ],
    },
    nl: {
      intro: [
        "Rijders met een kortere romp voelen zich vaak uitgestrekt niet omdat ze iets verkeerd doen, maar omdat veel standaardframes gebouwd zijn rond een reach-aannname die niet bij hun verhoudingen past.",
        "De oplossing is meestal geen extreme stambovering, maar een betere match tussen framereach, stuurpositie en de werkelijke lengte van de romp.",
      ],
      sections: [
        {
          title: "Waarom rijders met een kortere romp zich op standaardframes gestrekt voelen",
          items: [
            "Een frame kan qua stack kloppen en toch te lang aanvoelen voor een rijder met een kortere romp.",
            "Bij te veel reach gaan rijders vaak compenseren met een te lage voorkant of een extreem korte stuurpen.",
            "Die compensaties kunnen de positie juist slechter laten voelen, ook al zien de getallen er netjes uit.",
          ],
        },
        {
          title: "Frame reach en stamlengte bij een kortere romp",
          items: [
            "Begin bij frame reach, omdat een stuurpen maar beperkt kan corrigeren voordat het rijgedrag merkbaar verandert.",
            "Een normale stem op een frame met kortere reach houdt de stuurrespons meestal beter dan een extreem korte stem op een te groot frame.",
            "Het frame moet het grootste deel van de maatvoering dragen; de stem finetunet het laatste stuk.",
          ],
        },
        {
          title: "Stuurhoogte en drop bij kortere arm-reach",
          items: [
            "Een kortere romp vraagt vaak om een stuur dat niet te laag staat, omdat te veel drop het uitgestrekte gevoel vergroot.",
            "De drop tussen zadel en stuur moet passen bij flexibiliteit en rijdoel, niet bij een generiek race-ideaal.",
            "Een iets hogere voorkant kan ademhaling, controle en comfort op lange ritten verbeteren.",
          ],
        },
        {
          title: "Componentkeuzes die helpen",
          items: [
            "Kortere stems, compacte sturen en goede hood-positie kunnen het cockpitgevoel verbeteren zonder de hele fiets te veranderen.",
            "Ook de zadelpositie blijft belangrijk, want een zadel te ver naar voren zetten om reach te verkorten geeft vaak andere problemen.",
            "Gebruik componenten om een goede framekeuze verfijnen, niet om een fundamenteel te lang frame te redden.",
          ],
        },
      ],
      faqs: [
        {
          q: "Hoe weet ik of mijn romp korter is dan mijn benen?",
          a: "Kijk hoeveel reach je nodig hebt ten opzichte van je zadelhoogte en armlengte. Als standaardfietsen lang blijven aanvoelen ondanks normale stamlengtes, speelt de rompproportie mogelijk mee.",
        },
        {
          q: "Welke stamlengte past bij een kortere romp?",
          a: "Dat hangt af van frame, stuurgedrag en stuurvorm, maar het doel is om in een normale handlingrange te blijven in plaats van een extreem korte stem te forceren.",
        },
        {
          q: "Is een women's-specific frame dan de oplossing?",
          a: "Niet automatisch. Sommige rijders profiteren van die geometrie, maar stack, reach en cockpit setup zijn belangrijker dan het marketinglabel.",
        },
      ],
    },
  },
  "bike-fit-for-riders-with-limited-flexibility": {
    en: {
      intro: [
        "Limited flexibility does not automatically mean a bad position. It means the fit has to respect the rider's current mobility instead of forcing a low or long setup that only works on paper.",
        "A sustainable fit for less flexible riders usually prioritizes control, breathing room, and repeatable comfort over chasing an aggressive silhouette.",
      ],
      sections: [
        {
          title: "How flexibility limits drop and reach sustainably",
          items: [
            "Flexibility sets the ceiling for how much drop and forward reach can be tolerated without tension building up on longer rides.",
            "If the position exceeds that ceiling, the rider may compensate by rocking, locking the upper body, or losing steady power.",
            "A workable position should stay within the rider's functional range, not a theoretical ideal.",
          ],
        },
        {
          title: "Assessing functional flexibility for cycling",
          items: [
            "Cycling flexibility is about how the rider can hold position on the bike, not just how far they can stretch in a static test.",
            "Look at hip hinge, hamstring tolerance, shoulder comfort, and how long the rider can stay in the position without bracing.",
            "The key question is whether the rider can repeat the posture late in a ride, not just at the start.",
          ],
        },
        {
          title: "Position choices that work with limited flexibility",
          items: [
            "A slightly higher front end, shorter reach, and stable saddle support often make the position more usable.",
            "The right fit should make breathing and pelvic stability easier, not create a constant feeling of strain.",
            "Small geometric changes often work better than dramatic changes when flexibility is the main limiter.",
          ],
        },
        {
          title: "Stretching and mobility: long-term position improvement",
          items: [
            "Mobility work can help, but it should support the bike position rather than be treated as an instant fix.",
            "Progress is usually gradual, so the fit should still be comfortable now instead of assuming future flexibility will solve it.",
            "Use mobility to expand options, then revisit the position after the rider has genuinely adapted.",
          ],
        },
      ],
      faqs: [
        {
          q: "How flexible do I need to be for a road bike?",
          a: "Enough to hold the position comfortably and repeatably for the duration of your rides. The needed amount depends on your geometry, goals, and riding style.",
        },
        {
          q: "Can I improve my cycling position through stretching?",
          a: "Yes, but usually gradually. Stretching helps most when it supports a position change rather than replacing sensible bike setup.",
        },
        {
          q: "Is an endurance geometry always the answer for inflexible riders?",
          a: "Not always, but it is often a good starting point because it gives more room to find a sustainable combination of stack, reach, and drop.",
        },
      ],
    },
    nl: {
      intro: [
        "Beperkte flexibiliteit betekent niet automatisch een slechte fit. Het betekent vooral dat de positie moet aansluiten op de huidige mobiliteit in plaats van een lage of lange setup te forceren die alleen op papier werkt.",
        "Een houdbare fit voor minder flexibele rijders zet comfort, controle en ademruimte meestal boven een agressief uiterlijk.",
      ],
      sections: [
        {
          title: "Hoe flexibiliteit drop en reach begrenst",
          items: [
            "Flexibiliteit bepaalt hoeveel drop en voorwaartse reach je kunt verdragen zonder dat spanning tijdens langere ritten oploopt.",
            "Als de positie daar overheen gaat, gaat de rijder vaak compenseren met wiebelen, verkramping of minder stabiel vermogen.",
            "Een werkbare positie moet binnen de functionele range van de rijder blijven, niet binnen een theoretisch ideaal.",
          ],
        },
        {
          title: "Functionele flexibiliteit voor fietsen beoordelen",
          items: [
            "Fietsflexibiliteit gaat over hoe iemand de positie op de fiets kan houden, niet alleen over hoe ver die in een statische test kan reiken.",
            "Kijk naar heuphoek, hamstring-tolerantie, schoudercomfort en hoe lang iemand de houding kan volhouden zonder te verstijven.",
            "De belangrijkste vraag is of de positie ook aan het einde van een rit nog herhaalbaar is.",
          ],
        },
        {
          title: "Posities die werken bij beperkte flexibiliteit",
          items: [
            "Een iets hogere voorkant, kortere reach en stabiele zadelondersteuning maken de positie vaak bruikbaarder.",
            "De juiste fit moet ademhaling en bekkenstabiliteit makkelijker maken, niet voortdurend spanning oproepen.",
            "Kleine geometrische aanpassingen werken meestal beter dan grote ingrepen wanneer flexibiliteit de limiter is.",
          ],
        },
        {
          title: "Stretching en mobiliteit: lange termijn verbetering",
          items: [
            "Mobiliteitstraining kan helpen, maar hoort de bike fit te ondersteunen in plaats van als directe oplossing te gelden.",
            "Vooruitgang gaat meestal geleidelijk, dus de huidige positie moet nu al comfortabel zijn.",
            "Gebruik mobiliteit om opties te vergroten en herbekijk daarna pas de positie als de rijder echt is aangepast.",
          ],
        },
      ],
      faqs: [
        {
          q: "Hoe flexibel moet ik zijn voor een racefiets?",
          a: "Flexibel genoeg om de positie comfortabel en herhaalbaar vol te houden voor de duur van je ritten. Hoeveel precies hangt af van geometrie, doel en rijstijl.",
        },
        {
          q: "Kan ik mijn fietspositie verbeteren door te stretchen?",
          a: "Ja, maar meestal geleidelijk. Stretching helpt het meest als het een goede setup ondersteunt in plaats van deze te vervangen.",
        },
        {
          q: "Is een endurance geometrie altijd de oplossing bij weinig flexibiliteit?",
          a: "Niet altijd, maar vaak wel een goed startpunt omdat je daar meer ruimte hebt om stack, reach en drop duurzaam te combineren.",
        },
      ],
    },
  },
  "bike-fit-for-beginners-and-returning-riders": {
    en: {
      intro: [
        "Beginners and returning riders usually need a conservative setup first: one that feels stable, simple, and forgiving enough to make regular riding enjoyable again.",
        "The goal is not to build a perfect racing position on day one. It is to start with a setup that lets the rider build tolerance, fitness, and confidence at the same time.",
      ],
      sections: [
        {
          title: "The conservative starting position",
          items: [
            "A slightly higher and shorter position is often easier to adapt to than an aggressive one.",
            "The first fit should be easy to control and simple to understand, especially if the rider is rebuilding confidence after time away.",
            "Comfortable basics matter more than chasing an ideal number too early.",
          ],
        },
        {
          title: "What to check before your first long ride",
          items: [
            "Check saddle height, saddle angle, bar reach, and whether the rider can brake, shift, and steer without feeling cramped.",
            "Make sure shoes, cleats, and contact points are set up consistently before adding long-duration stress.",
            "A short test ride is more useful than guessing from a garage fit alone.",
          ],
        },
        {
          title: "How position adapts as fitness and flexibility change",
          items: [
            "As fitness improves, the rider may tolerate longer rides and slightly more committed positions.",
            "Flexibility and confidence usually improve with repeated riding, but the bike should not force the process.",
            "Small refinements over time are safer and more effective than major changes before adaptation has happened.",
          ],
        },
        {
          title: "When to get a professional fit",
          items: [
            "A professional fit is worth considering if the rider has persistent discomfort, unusual proportions, or trouble finding a stable starting setup.",
            "It is especially useful when the rider is buying a new bike and wants the frame choice to match the body rather than guess.",
            "The earlier a clear baseline is set, the easier it is to improve from there.",
          ],
        },
      ],
      faqs: [
        {
          q: "Do I need a professional fit as a beginner?",
          a: "Not always, but it can save time if you are uncertain about frame choice, contact points, or why the bike does not feel stable.",
        },
        {
          q: "How long before my position feels natural?",
          a: "Usually several rides, sometimes longer after a big break. The important part is that the setup keeps feeling better rather than repeatedly causing new problems.",
        },
        {
          q: "What is the most important thing to get right first?",
          a: "A stable saddle and cockpit relationship is usually the first priority, because it shapes how comfortable and confident the rest of the ride feels.",
        },
      ],
    },
    nl: {
      intro: [
        "Beginners en terugkerende rijders hebben meestal eerst een conservatieve setup nodig: stabiel, simpel en vergevingsgezind genoeg om weer plezier in regelmatig fietsen te krijgen.",
        "Het doel is niet om meteen een perfect raceprofiel te bouwen, maar om te starten met een setup waarmee comfort, conditie en vertrouwen samen kunnen groeien.",
      ],
      sections: [
        {
          title: "Het conservatieve startpunt",
          items: [
            "Een iets hogere en kortere positie is vaak makkelijker te dragen dan een agressieve setup.",
            "De eerste fit moet eenvoudig aanvoelen en makkelijk te begrijpen zijn, zeker wanneer iemand na een pauze weer opbouwt.",
            "Comfortabele basis is belangrijker dan te vroeg een ideaal getal najagen.",
          ],
        },
        {
          title: "Wat je controleert voor je eerste lange rit",
          items: [
            "Controleer zadelhoogte, zadelhoek, stuurafstand en of remmen, schakelen en sturen zonder klem gevoel kunnen.",
            "Zorg dat schoenen, cleats en contactpunten al consistent staan voordat je duurstress toevoegt.",
            "Een korte testrit levert meer op dan gokken vanuit de garage.",
          ],
        },
        {
          title: "Hoe de positie mee verandert met fitheid en flexibiliteit",
          items: [
            "Naarmate fitheid groeit, kan de rijder langere ritten en iets ambitieuzere posities verdragen.",
            "Flexibiliteit en vertrouwen verbeteren meestal door herhaalde ritten, maar de fiets moet dat proces niet afdwingen.",
            "Kleine verfijningen door de tijd zijn veiliger en effectiever dan grote veranderingen vóór adaptatie.",
          ],
        },
        {
          title: "Wanneer je een professionele fit neemt",
          items: [
            "Een professionele fit is nuttig als de rijder aanhoudende klachten heeft, ongebruikelijke proporties heeft of geen stabiel startpunt vindt.",
            "Het is extra handig bij de aankoop van een nieuwe fiets, wanneer framekeuze op het lichaam moet worden afgestemd.",
            "Hoe eerder een duidelijke basis staat, hoe makkelijker het is om daarop door te bouwen.",
          ],
        },
      ],
      faqs: [
        {
          q: "Heb ik als beginner een professionele fit nodig?",
          a: "Niet altijd, maar het kan veel tijd besparen als je twijfelt over framemaat, contactpunten of waarom de fiets niet stabiel aanvoelt.",
        },
        {
          q: "Hoe lang duurt het voor mijn positie natuurlijk aanvoelt?",
          a: "Meestal een paar ritten, soms langer na een lange onderbreking. Belangrijk is dat de setup beter blijft voelen in plaats van steeds nieuwe problemen te geven.",
        },
        {
          q: "Wat moet ik eerst goed krijgen?",
          a: "De relatie tussen zadel en cockpit is meestal het belangrijkste startpunt, omdat die bepaalt hoe comfortabel en zeker de rest van de rit voelt.",
        },
      ],
    },
  },
  "when-online-bike-fit-has-limits": {
    en: {
      intro: [
        "Online bike fit is useful when you need a structured starting point, a geometry short-list, or a repeatable way to compare bikes and positions.",
        "It has limits, though, because some issues only become obvious when a rider is on the bike in motion, under load, or interacting with a real human assessment.",
      ],
      sections: [
        {
          title: "What online bike fit does well",
          items: [
            "It is good at organizing inputs, comparing frame options, and giving riders a practical baseline before they buy or adjust anything.",
            "It works especially well when the problem is geometric and the needed changes are straightforward.",
            "For many riders, an online process is enough to avoid obvious mistakes and narrow the field quickly.",
          ],
        },
        {
          title: "Where in-person assessment adds value",
          items: [
            "In-person fitting can see movement patterns, asymmetry, touch points, and subtle compensations that a remote process may miss.",
            "Hands-on evaluation matters when the rider has a complex history, unusual body structure, or multiple interacting problems.",
            "The closer the issue is to dynamic behavior, the more valuable live observation becomes.",
          ],
        },
        {
          title: "Clinical vs fit: knowing when to escalate",
          items: [
            "Some symptoms belong in a fit conversation, while others may need medical review first.",
            "Pain that is sharp, persistent, or clearly not position-dependent should not be treated as a simple bike setup problem.",
            "Escalation is a sign of good judgment, not a failure of the fit process.",
          ],
        },
        {
          title: "How to prepare for an in-person fit appointment",
          items: [
            "Bring your usual shoes, pedals, and any parts you already know work well so the fitter sees your real starting point.",
            "Share what changed, what improved, and what still feels unresolved so the session can focus on evidence instead of guesswork.",
            "Arrive with the goal of comparing options, not of defending a preferred answer.",
          ],
        },
      ],
      faqs: [
        {
          q: "When should I see a professional fitter?",
          a: "See one when the problem is complex, persistent, or clearly not solved by straightforward geometry changes, or when you need hands-on evaluation.",
        },
        {
          q: "What can't an algorithm assess?",
          a: "It cannot fully judge movement, soft-tissue behavior, day-to-day compensation, or the feel of a real on-bike interaction under load.",
        },
        {
          q: "Is an online fit good enough for racing?",
          a: "Sometimes yes, especially for simpler cases. For high-stakes or complex setups, an in-person assessment adds safety and confidence.",
        },
      ],
    },
    nl: {
      intro: [
        "Online bikefit is nuttig wanneer je een gestructureerd startpunt, een korte lijst frame-opties of een herhaalbare manier nodig hebt om posities te vergelijken.",
        "Er zijn wel grenzen, omdat sommige problemen pas zichtbaar worden wanneer iemand echt op de fiets zit, onder belasting rijdt of een live beoordeling krijgt.",
      ],
      sections: [
        {
          title: "Waar online bikefit goed in is",
          items: [
            "Online werkt goed om input te ordenen, frame-opties te vergelijken en een praktisch startpunt te geven voor aankoop of afstelling.",
            "Het werkt vooral goed wanneer het probleem geometrisch is en de aanpassingen vrij rechttoe rechtaan zijn.",
            "Voor veel rijders is online genoeg om duidelijke missers te voorkomen en snel te verfijnen.",
          ],
        },
        {
          title: "Waar in-person beoordeling extra waarde heeft",
          items: [
            "Een live fit kan bewegingspatronen, asymmetrie, contactpunten en subtiele compensaties zien die online gemist worden.",
            "Hands-on beoordeling is belangrijker bij een complexe voorgeschiedenis, bijzondere lichaamsbouw of meerdere samenhangende problemen.",
            "Hoe dynamischer het probleem is, hoe nuttiger echte observatie wordt.",
          ],
        },
        {
          title: "Klinisch versus fit: wanneer je moet opschalen",
          items: [
            "Sommige signalen horen thuis in een fitgesprek, terwijl andere eerst medisch beoordeeld moeten worden.",
            "Pijn die scherp, aanhoudend of duidelijk niet positie-afhankelijk is, moet je niet als simpele bike-fitkwestie behandelen.",
            "Opschalen is een teken van goed oordeel, geen mislukking van het fitproces.",
          ],
        },
        {
          title: "Hoe je je voorbereidt op een fysieke fitafspraak",
          items: [
            "Neem je gebruikelijke schoenen, pedalen en onderdelen mee waarvan je weet dat ze werken, zodat de fitter je echte startpunt ziet.",
            "Deel wat veranderd is, wat beter werd en wat nog openstaat, zodat de sessie op bewijs kan focussen in plaats van op gokken.",
            "Kom met het doel om opties te vergelijken, niet om een voorkeursantwoord te verdedigen.",
          ],
        },
      ],
      faqs: [
        {
          q: "Wanneer moet ik een professionele fitter zien?",
          a: "Als het probleem complex of hardnekkig is, of duidelijk niet met simpele geometriewijzigingen op te lossen is, of wanneer je live observatie nodig hebt.",
        },
        {
          q: "Wat kan een algoritme niet beoordelen?",
          a: "Beweging, weefselreactie, dagelijkse compensatie en het gevoel van echte interactie onder belasting kan het niet volledig inschatten.",
        },
        {
          q: "Is online fit genoeg voor wedstrijden?",
          a: "Soms wel, vooral bij eenvoudige gevallen. Bij risicovollere of complexere setups geeft live beoordeling meer zekerheid.",
        },
      ],
    },
  },
} satisfies GuideContentRecord;

export const REMAINING_CLUSTERS_GUIDE_CONTENT: GuideContentRecord = appendStructuralSections(
  appendGuideCopy(REMAINING_CLUSTERS_GUIDE_CONTENT_BASE),
);
