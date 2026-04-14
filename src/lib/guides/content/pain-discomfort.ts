import type { GuideContentFaq, GuideContentRecord, GuideContentSection } from "../guide-content";
import { GUIDES } from "../../../app/(public)/guides/data";

const PAIN_DISCOMFORT_STRUCTURAL_SECTIONS = {
  en: [
    {
      title: "How to measure",
      type: "steps",
      items: [
        "You need: a tape measure, a trainer or a steady indoor setup, a plumb line or helper, and a short note log so you can record where the pain starts and when it appears.",
        "Step 1: write down the exact pain location, side, and timing, then note the ride length, cadence, and terrain when it first shows up.",
        "Step 2: check the most likely related setup numbers twice, such as saddle height, setback, cleat position, reach, or bar height.",
        "Step 3: compare the painful ride with a normal pain-free ride so you can see whether the setup change actually changed the symptom pattern.",
        "Common mistake: changing several numbers at once and then trying to guess which change caused the symptom to improve or worsen.",
      ],
    },
    {
      title: "How to adjust",
      type: "steps",
      items: [
        "Start with the variable that best matches the symptom: saddle height for front or back knee pain, reach or bar drop for back and shoulder pain, and cleat or support changes for foot or contact-point pain.",
        "Use small increments: 2 to 3 mm for saddle or setback changes, 5 to 10 mm for cockpit changes, and 1 to 2 degrees for cleat rotation or tilt-related changes.",
        "Hold each change for 2 to 3 rides before deciding whether it helped, and keep the test route and effort as consistent as possible.",
        "If the new position fixes one area but moves the problem somewhere else, go halfway back before making the next change.",
      ],
    },
    {
      title: "Warning signs",
      items: [
        "Sharp pain during the pedal stroke, swelling, warmth, or numbness that starts to spread are escalation signals, not normal fit noise.",
        "Pain that changes sides or becomes more frequent after each adjustment usually means the setup is still compensating somewhere else.",
        "Symptoms that show up off the bike, at rest, or at night should not be treated as a routine fit problem only.",
        "If the same pain survives 3 to 4 careful fit changes, involve a fitter or clinician instead of continuing to guess.",
      ],
    },
    {
      title: "Variations by rider type",
      type: "table",
      items: [],
      tableHeaders: ["Rider type", "Typical pain-pattern context"],
      tableRows: [
        ["Road", "Fit errors often show up as repeated load, so small saddle-height or reach changes can matter over many pedal strokes."],
        ["Gravel / MTB", "Vibration and movement expose problems first, so a position that looks fine on paper can still fail on rough ground."],
        ["Triathlon / Endurance / Indoor", "Static load, closed hip angles, or long time in one position can hide a problem at first and then expose it later."],
        ["Race / Climb / Commute / Long steady rides", "The same symptom can point to different causes depending on the actual job of the ride."],
      ],
    },
    {
      title: "Practical recommendation",
      type: "prose",
      items: [
        "Start with the contact point most closely linked to the pain, not with the whole bike at once.",
        "A calculator is enough when one number clearly stands out, but a full fit is better when more than one contact point is involved or when the pain keeps returning.",
        "Make one small change, test it over 2 to 3 rides, and stop changing the bike if the symptoms become sharp, spread, or show up outside riding.",
      ],
    },
  ],
  nl: [
    {
      title: "Hoe je het meet",
      type: "steps",
      items: [
        "Je hebt nodig: een meetlint, een trainer of een stabiele indoor-opstelling, een schietlood of helper, en een kort notitieblok zodat je kunt vastleggen waar de pijn begint en wanneer die opkomt.",
        "Stap 1: noteer de exacte pijnlocatie, de kant en het moment, plus ritduur, cadans en terrein op het moment dat de klacht begint.",
        "Stap 2: controleer de meest waarschijnlijke relevante afstelwaarden twee keer, zoals zadelhoogte, setback, cleatpositie, reach of stuurhoogte.",
        "Stap 3: vergelijk de pijnrit met een normale pijnvrije rit zodat je kunt zien of de wijziging het klachtenpatroon echt heeft veranderd.",
        "Veelgemaakte fout: meerdere waarden tegelijk wijzigen en daarna moeten gokken welke wijziging de klacht beter of slechter maakte.",
      ],
    },
    {
      title: "Hoe je het afstelt",
      type: "steps",
      items: [
        "Begin bij de variabele die het best bij het symptoom past: zadelhoogte bij pijn voor- of achter in de knie, reach of drop bij rug- en schouderklachten, en cleat- of supportwijzigingen bij voet- of contactpuntklachten.",
        "Werk in kleine stappen: 2 tot 3 mm voor zadel- of setbackwijzigingen, 5 tot 10 mm voor cockpitwijzigingen en 1 tot 2 graden voor cleatrotatie of tilt-gerelateerde aanpassingen.",
        "Houd elke wijziging 2 tot 3 ritten vast voordat je beslist of ze geholpen heeft, en maak de route en inspanning zo vergelijkbaar mogelijk.",
        "Als de nieuwe positie één klacht oplost maar het probleem ergens anders laat opduiken, ga dan eerst halverwege terug.",
      ],
    },
    {
      title: "Waarschuwingssignalen",
      items: [
        "Scherpe pijn tijdens de trapbeweging, zwelling, warmte of gevoelloosheid die zich uitbreidt zijn opschaalsignalen, geen normale fitruis.",
        "Pijn die van kant verandert of na elke wijziging vaker terugkomt, betekent meestal dat de setup elders nog compenseert.",
        "Klachten die ook buiten de fiets, in rust of 's nachts aanwezig zijn, moet je niet alleen als fitprobleem behandelen.",
        "Als dezelfde pijn 3 tot 4 zorgvuldige fitaanpassingen overleeft, schakel dan een fitter of arts in in plaats van verder te gokken.",
      ],
    },
    {
      title: "Verschillen per rijtype",
      type: "table",
      items: [],
      tableHeaders: ["Rijtype", "Typische pijncontext"],
      tableRows: [
        ["Weg", "Fitfouten voelen vaak als herhaalde belasting, waardoor kleine veranderingen in hoogte of reach over veel omwentelingen groot kunnen uitpakken."],
        ["Gravel / MTB", "Trillingen en beweging leggen problemen sneller bloot, waardoor een positie die op papier klopt op ruw terrein toch verkeerd kan voelen."],
        ["Triathlon / Endurance / Indoor", "Statische druk, gesloten heuphoeken of veel tijd in één houding kunnen een probleem eerst verbergen en daarna zichtbaar maken."],
        ["Race / Klim / Pendel / Lange steady ritten", "Hetzelfde symptoom kan een andere oorzaak hebben afhankelijk van de echte taak van de rit."],
      ],
    },
    {
      title: "Praktische aanbeveling",
      type: "prose",
      items: [
        "Begin bij het contactpunt dat het dichtst bij de pijn staat en niet bij de hele fiets tegelijk.",
        "Een calculator is genoeg wanneer één waarde duidelijk uitspringt, maar een volledige fit is beter zodra meer dan één contactpunt meespeelt of de pijn terug blijft komen.",
        "Maak één kleine wijziging, test die 2 tot 3 ritten en stop met sleutelen als de klachten scherp worden, zich verspreiden of ook buiten het fietsen opduiken.",
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
          sections: [...guide.en.sections, ...PAIN_DISCOMFORT_STRUCTURAL_SECTIONS.en],
        },
        nl: {
          ...guide.nl,
          sections: [...guide.nl.sections, ...PAIN_DISCOMFORT_STRUCTURAL_SECTIONS.nl],
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
    return `Start the free fit flow to check whether ${subject.toLowerCase()} is being driven by saddle, reach, or contact-point setup.`;
  }
  return `Start de gratis fit flow om te checken of ${subject.toLowerCase()} wordt veroorzaakt door zadel, reach of contactpuntafstelling.`;
}

function buildFaqExtras(slug: string, locale: "en" | "nl"): GuideContentFaq[] {
  const cardTitle = getGuideCardTitle(slug, locale);
  const subject = getGuideSubject(cardTitle);
  if (locale === "en") {
    return [
      {
        q: `How do I know if ${subject.toLowerCase()} is the main cause of my pain?`,
        a: `If the pain changes predictably when you make one small fit change, ${subject.toLowerCase()} is worth treating as a likely cause. If it stays vague or jumps around, check the next fit variable instead of making bigger changes.`,
      },
      {
        q: "When should I stop adjusting the bike and get help?",
        a: "Stop if the pain is sharp, one-sided, worsening, or present off the bike. That is the point to involve a fitter or clinician rather than trying another adjustment.",
      },
    ];
  }
  return [
    {
      q: `Hoe weet ik of ${subject.toLowerCase()} de belangrijkste oorzaak van mijn pijn is?`,
      a: `Als de pijn voorspelbaar verandert wanneer je één kleine fitaanpassing doet, is ${subject.toLowerCase()} waarschijnlijk een serieuze verdachte. Blijft het vaag of verschuift het steeds, controleer dan de volgende variabele in plaats van groter te gaan corrigeren.`,
    },
    {
      q: "Wanneer stop ik met aanpassen en schakel ik hulp in?",
      a: "Stop als de pijn scherp, eenzijdig, erger wordend of ook buiten de fiets aanwezig is. Dan is het tijd om een fitter of arts in te schakelen in plaats van nog een wijziging te proberen.",
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
const PAIN_DISCOMFORT_GUIDE_CONTENT_BASE = {
  "bike-fitting-for-knee-pain": {
    en: {
      heroIntro: "Knee pain on the bike is almost always a load and alignment issue rather than a mystery injury. It usually develops gradually because a position that is slightly off repeats itself thousands of times per hour. This guide is for riders who want to understand which part of the knee is hurting, why it is hurting, and which fit variables to check first before making any changes.",
      ctaDescription: "Start your free fit flow to get a complete position check that covers saddle height, setback, and cockpit length in one guided session.",
      intro: [
        "Knee pain on the bike is usually a load and alignment problem, not a random flare-up. The first fit question is whether the knee is being asked to extend too much, compress too much, or track too far off line.",
        "Saddle height is the first variable to check because it changes knee angle on every pedal stroke. From there, saddle setback and cockpit length tell you whether the rider is stable, reaching, or sliding around on the saddle.",
        "Anterior pain tends to point toward too much compression or a too-low saddle, while posterior pain more often points to over-extension or a saddle that sits too high.",
      ],
      sections: [
        {
          title: "What type of knee pain you have",
          items: [
            "Front-of-knee pain is commonly linked to a saddle that is too low, a very forward cleat position, or a rider who is pushing the knee through a large flexion range under load.",
            "Back-of-knee pain more often appears when saddle height is too high, reach is too long, or the rider is rocking the pelvis to reach the bottom of the stroke.",
            "Pain on the inside or outside of the knee is often a tracking issue first: cleat rotation, stance width, or saddle setback can pull the knee off its natural line.",
          ],
        },
        {
          title: "Saddle height: the first check",
          items: [
            "A practical target for many riders is roughly 25-35 degrees of knee flexion at the bottom of the stroke, measured on the same leg position each time.",
            "If the hips rock side to side, the saddle is probably too high. If the knee stays very closed and the rider feels compressed at the top of the stroke, the saddle may be too low.",
            "Change saddle height in small steps, usually 2-3 mm at a time, then test for 2-3 rides before changing anything else.",
          ],
        },
        {
          title: "Saddle setback and pedaling line",
          items: [
            "KOPS is only a reference, not a rule, but it helps you see whether the knee is wildly ahead of or behind the pedal spindle at a neutral crank position.",
            "Too much forward setback can make the rider feel perched and load the front of the knee; too much rearward setback can force a long reach and make the pelvis chase the pedals.",
            "If the rider keeps sliding forward on the saddle or braces through the hands, revisit setback before assuming the knee itself is the problem.",
          ],
        },
        {
          title: "Reach and cleat factors",
          items: [
            "A cockpit that is too long can change pelvic stability enough to affect knee tracking, even when saddle height looks correct in isolation.",
            "Cleat rotation and fore-aft position are secondary checks once height and setback are close; a cleat that forces toe-in or toe-out can irritate the knee very quickly.",
            "If the pain changes side or location after a small fit change, stop and reassess rather than stacking more adjustments.",
          ],
        },
        {
          title: "How to measure",
          items: [
            "You need: a plumb line or a friend, a tape measure, and a hex key to adjust the saddle.",
            "Step 1: Set the bike on a turbo trainer or in a door frame. Clip in with your normal shoes and pedal to a comfortable rhythm, then stop with the crank at the bottom of the stroke.",
            "Step 2: Have a helper check whether your heel can just rest on the pedal with the leg almost fully extended. If the heel has to chase the pedal or the hip drops, the saddle is too high.",
            "Step 3: Check knee tracking from the front. The kneecap should move in a line over the second toe. Deviation in or out may indicate cleat rotation or stance-width issues.",
            "Common mistake: measuring saddle height while wearing soft-soled training shoes rather than the cycling shoes and cleats you actually ride in.",
          ],
        },
        {
          title: "How to adjust",
          items: [
            "Start with saddle height if you have anterior or posterior knee pain: move in 2–3 mm increments only.",
            "Test each saddle height change for at least 2 rides before moving again; one ride is not enough to confirm improvement.",
            "If pain is on the inner or outer knee, address cleat rotation next: rotate in 1–2 degree steps and test for 2 rides per adjustment.",
            "Only change one variable at a time — changing saddle height and cleat rotation simultaneously makes it impossible to know which change helped.",
            "If pain returns after reaching a position that felt right, move back 1–2 mm and hold that for 3–4 rides before concluding the fix is insufficient.",
          ],
        },
        {
          title: "Warning signs",
          items: [
            "Sharp, stabbing knee pain during the pedal stroke (not just after the ride): stop riding and reassess before continuing.",
            "Swelling or warmth around the knee joint: reduce training load immediately; this is not a routine fit adjustment situation.",
            "Pain that changes sides or location after each fit change: indicates a compensating movement pattern that a fitter or physio should assess.",
            "Consistent clicking or grinding in the knee joint: may be structural rather than purely fit-related.",
            "Knee pain that has not improved after 4 careful fit adjustments and 8+ rides: consult a sports physio or certified fitter.",
          ],
        },
        {
          title: "Variations by rider type",
          items: [
            "Road riders optimising for power often run a higher saddle with more leg extension, which loads the posterior knee if the height is even slightly over the optimal range.",
            "Gravel riders with varied terrain often benefit from 2–3 mm lower saddle height than their road setting to improve stability on rough ground, which also reduces the risk of over-extension.",
            "MTB riders using a dropper post should judge fit at the fully extended saddle position for climbing, not at the lowered trail position.",
            "Triathlon riders with a forward saddle position typically have less effective leg extension for the same saddle height number; check feel dynamically rather than relying on static measurements.",
          ],
        },
        {
          title: "Practical recommendation",
          items: [
            "Start with saddle height before anything else — it is the single most common cause of both anterior and posterior knee pain on the bike.",
            "A fit calculator can get you close on saddle height. If you still have knee pain after 3–4 careful adjustments, a full fit session with video gait analysis is the next step.",
            "Once saddle height is stable, check cleat rotation next before assuming the issue requires professional intervention.",
          ],
        },
      ],
      faqs: [
        {
          q: "Anterior vs posterior knee pain - what's the difference for bike fit?",
          a: "Anterior pain usually points toward too much knee compression, often from a saddle that is too low. Posterior pain more often suggests over-extension, commonly from a saddle that sits too high or a position that makes the rider reach for the bottom of the stroke.",
        },
        {
          q: "How much should I change saddle height at once?",
          a: "Small steps work best. Start with 2-3 mm, then test the change over a few rides before deciding whether to move again.",
        },
        {
          q: "When does knee pain require a professional fitter or physio?",
          a: "If the pain is sharp, swelling appears, the symptoms keep returning after sensible fit changes, or the pain affects daily life as well as riding, involve a fitter and a clinician instead of continuing to guess.",
        },
        {
          q: "What is a normal knee flexion angle at the bottom of the pedal stroke?",
          a: "Most riders land somewhere between 25 and 35 degrees of knee flexion at the bottom of the stroke. Outside that window in either direction is worth investigating, but the exact ideal number varies by rider, pedaling style, and crank length.",
        },
        {
          q: "Does cleat float really matter for knee pain?",
          a: "Yes. Float allows the foot to find its natural tracking line during the stroke. Too little float on a cleat that is not perfectly aligned can force the knee off its natural path on every revolution, which adds up quickly over a long ride.",
        },
        {
          q: "Can crank length cause knee pain?",
          a: "Yes, especially at the top of the stroke. A longer crank increases knee flexion, which can create a pinching sensation for riders with limited hip flexibility or those already in an aggressive low position.",
        },
      ],
    },
    nl: {
      heroIntro: "Kniepijn op de fiets is bijna altijd een probleem van belasting en uitlijning in plaats van een mysterieuze blessure. Het ontwikkelt zich doorgaans geleidelijk omdat een iets verkeerde positie zich duizenden keren per uur herhaalt. Deze gids is voor rijders die willen begrijpen welk deel van de knie pijn doet, waarom dat is en welke fitvariabelen je als eerste moet controleren.",
      ctaDescription: "Start de gratis fit flow voor een volledige positiecheck die zadelhoogte, setback en cockpitlengte in één begeleide sessie doorloopt.",
      intro: [
        "Kniepijn op de fiets is meestal een probleem van belasting en uitlijning, niet zomaar een willekeurige klacht. De eerste fitvraag is of de knie te ver moet strekken, te veel wordt samengedrukt of te ver uit zijn lijn beweegt.",
        "Zadelhoogte is de eerste variabele om te controleren, omdat die de kniehoek bij elke omwenteling verandert. Daarna laten zadelterugstand en cockpitlengte zien of de rijder stabiel zit, reikt of op het zadel schuift.",
        "Pijn aan de voorkant wijst vaak op te veel compressie of een zadel dat te laag staat. Pijn achter in de knie past vaker bij overstrekking of een zadel dat te hoog staat.",
      ],
      sections: [
        {
          title: "Welk type kniepijn je hebt",
          items: [
            "Pijn aan de voorkant van de knie hangt vaak samen met een te laag zadel, een cleat die te ver naar voren staat of een trapbeweging waarin de knie te veel buigt onder belasting.",
            "Pijn achter in de knie ontstaat vaker als het zadel te hoog staat, de reach te lang is of de rijder het bekken laat kantelen om het onderste punt van de slag te halen.",
            "Pijn aan de binnen- of buitenkant van de knie is vaak eerst een trackingprobleem: cleatrotatie, standbreedte of zadelterugstand kan de knie uit zijn natuurlijke spoor trekken.",
          ],
        },
        {
          title: "Zadelhoogte: de eerste check",
          items: [
            "Een bruikbare richtwaarde voor veel rijders is ongeveer 25-35 graden knieflexie onderaan de trapbeweging, gemeten met steeds dezelfde beenstand.",
            "Wie met de heupen wiebelt, staat waarschijnlijk te hoog. Wie heel gesloten blijft in de knie en zich bovenin de trapbeweging opgepropt voelt, staat mogelijk te laag.",
            "Pas zadelhoogte in kleine stappen aan, meestal 2-3 mm per keer, en test dat vervolgens 2-3 ritten voordat je verder verandert.",
          ],
        },
        {
          title: "Zadelterugstand en traplijn",
          items: [
            "KOPS is vooral een referentie en geen wet, maar het helpt wel om te zien of de knie ver voor of achter de pedaalas staat in een neutrale crankpositie.",
            "Te veel zadel naar voren kan een gejaagd gevoel geven en de voorkant van de knie extra belasten. Te veel setback kan juist een lange reach afdwingen en het bekken laten zoeken naar de pedalen.",
            "Schuif je steeds naar voren op het zadel of steun je zwaar op je handen, kijk dan eerst opnieuw naar setback in plaats van meteen de knie zelf de schuld te geven.",
          ],
        },
        {
          title: "Reach en cleat-invloeden",
          items: [
            "Een cockpit die te lang is, kan de bekkenstabiliteit genoeg veranderen om ook de knie-uitlijning te verstoren, zelfs als de zadelhoogte op zichzelf goed lijkt.",
            "Cleatrotatie en voor-achterpositie zijn secundaire checks zodra hoogte en setback ongeveer goed staan; een cleat die teen-in of teen-out afdwingt, kan de knie snel irriteren.",
            "Verandert de pijn van kant of locatie na een kleine aanpassing, stop dan en herbeoordeel in plaats van nog meer wijzigingen op te stapelen.",
          ],
        },
      ],
      faqs: [
        {
          q: "Wat is het verschil tussen pijn voorin en achterin de knie voor bikefit?",
          a: "Pijn voorin wijst meestal op te veel kniecompressie, vaak door een zadel dat te laag staat. Pijn achterin past vaker bij overstrekking, meestal door een zadel dat te hoog staat of een houding waarin de rijder naar beneden moet reiken.",
        },
        {
          q: "Hoeveel moet ik zadelhoogte per keer aanpassen?",
          a: "Kleine stappen werken het best. Begin met 2-3 mm en test die wijziging enkele ritten voordat je opnieuw bijstelt.",
        },
        {
          q: "Wanneer heb ik een fitter of fysio nodig bij kniepijn?",
          a: "Als de pijn scherp is, er zwelling ontstaat, klachten terugkomen na logische fitaanpassingen of de pijn ook in het dagelijks leven meespeelt, schakel dan een fitter en een zorgverlener in.",
        },
        {
          q: "Wat is een normale knieflexiehoek onderaan de trapbeweging?",
          a: "De meeste rijders zitten ergens tussen 25 en 35 graden knieflexie onderaan de slag. Buiten dat venster in welke richting dan ook is het onderzoeken waard, maar de exacte ideale waarde verschilt per rijder, trapstijl en cranklengte.",
        },
        {
          q: "Maakt cleat-float echt uit voor kniepijn?",
          a: "Ja. Float laat de voet zijn natuurlijke traklijn zoeken tijdens de trapbeweging. Te weinig float op een cleat die niet perfect uitgelijnd is, kan de knie bij elke omwenteling van zijn natuurlijke baan aftrekken, wat over een lange rit snel oploopt.",
        },
        {
          q: "Kan cranklengte kniepijn veroorzaken?",
          a: "Ja, vooral bovenaan de trapbeweging. Een langere crank vergroot de knieflexie, wat een knellend gevoel kan geven bij rijders met beperkte heupflexibiliteit of bij rijders die al in een agressieve, lage positie zitten.",
        },
      ],
    },
  },
  "bike-fitting-for-lower-back-pain": {
    en: {
      heroIntro: "Lower-back pain on the bike is one of the most common complaints at all fitness levels, and it is almost always related to how the rider's cockpit and pelvic control interact under load. The problem tends to worsen over time because fatigue compounds a marginal setup. This guide is for riders who notice back tightness after longer rides and want to understand which fit variables to address first.",
      ctaDescription: "Start your free fit flow to get a guided check of your cockpit length, saddle height, and reach in a single session.",
      intro: [
        "Lower-back pain on the bike is often a cockpit and pelvic-control problem. When reach or drop exceeds what the rider can support, the pelvis starts to rotate or collapse and the lower back pays the price.",
        "Pelvic tilt is the mechanism to watch. If the rider can hold the position for 20 minutes but not for 2 hours, fatigue is exposing a setup that is only barely sustainable.",
        "Core stability matters as much as handlebar height. A better fit reduces the demand, but it cannot fully compensate for a position that is too long, too low, or too aggressive for the rider's mobility.",
      ],
      sections: [
        {
          title: "Why lower back pain appears on longer rides",
          items: [
            "A position that feels fine in a short test can fail once the hip flexors, glutes, and trunk muscles fatigue and the pelvis begins to drift into a posterior tilt.",
            "Progressive overload matters here: if the rider has recently increased volume, intensity, or time in the drops, the back may be the first structure to complain.",
            "A persistent asymmetry, such as one side of the pelvis moving differently than the other, often points to a setup issue rather than just a fitness issue.",
          ],
        },
        {
          title: "Cockpit length and drop: the primary levers",
          items: [
            "If the rider feels stretched, braces through the shoulders, or struggles to keep a neutral spine, reach is usually the first thing to shorten.",
            "A practical first move is to reduce drop by 5-10 mm or shorten the cockpit slightly, then reassess how easily the rider can hold a calm pelvis.",
            "Compare current reach to what the rider can actually sustain on longer rides, not just what looks good in a static photo.",
          ],
        },
        {
          title: "Saddle height and pelvic stability",
          items: [
            "A saddle that is too high can force the pelvis to rock, which then creates a chain of movement into the lumbar spine.",
            "A saddle that is too low can also irritate the back by closing the hip angle and making the rider curl the lower spine to keep power through the stroke.",
            "Check saddle height before chasing cockpit changes, because a stable pelvis is easier to achieve when the leg extension is correct.",
          ],
        },
        {
          title: "Core and flexibility: what fitting can't fix alone",
          items: [
            "If the rider loses position only when tired, core endurance and hip mobility may need work alongside the fit change.",
            "The fitter can reduce the demand, but the rider still needs enough trunk control to keep the pelvis from collapsing under load.",
            "If symptoms improve after a position change but return when training load rises, the long-term answer is usually a mix of fit and conditioning.",
          ],
        },
      ],
      faqs: [
        {
          q: "Does raising the handlebars always fix lower back pain?",
          a: "No. Higher bars can help if drop is excessive, but reach, saddle height, and pelvic stability all interact. Sometimes the better fix is shortening the cockpit rather than raising the front end.",
        },
        {
          q: "How do I know if my reach is too long?",
          a: "Common signs are locked elbows, shrugged shoulders, sliding forward on the saddle, or a lower back that tightens as soon as the ride gets longer or harder.",
        },
        {
          q: "Is lower back pain on the bike always a fit problem?",
          a: "No. Fit is one likely cause, but back pain can also come from training load, mobility limits, or a medical issue. If the pain is severe, persistent, or non-cycling related, get it checked.",
        },
        {
          q: "How much drop is too much for someone with lower back pain?",
          a: "There is no universal limit, but if the rider cannot maintain a neutral spine angle without strain after the first 30 minutes, the current drop is probably beyond what their hip and core flexibility can support.",
        },
        {
          q: "Does saddle setback affect lower back pain?",
          a: "Yes. Too much rearward setback can make the torso lean forward excessively to reach the bars, which loads the lower back. A small setback adjustment combined with a reach check often helps more than changing bar height alone.",
        },
        {
          q: "When should I see a physio instead of adjusting my bike further?",
          a: "If the pain is one-sided, radiates into the leg, does not improve after two or three sensible fit changes over several weeks, or gets worse during non-cycling activities, a physiotherapist should assess it before you adjust anything else.",
        },
      ],
    },
    nl: {
      heroIntro: "Lage rugpijn op de fiets is een van de meest voorkomende klachten op alle fitheidsniveaus en hangt bijna altijd samen met de manier waarop de cockpit en bekkencontrole onder belasting samenwerken. Het probleem verergert vaak in de loop van de tijd omdat vermoeidheid een marginale afstelling versterkt. Deze gids is voor rijders die na langere ritten rugpijn ervaren en willen weten welke fitvariabelen ze als eerste moeten aanpakken.",
      ctaDescription: "Start de gratis fit flow voor een begeleide check van cockpitlengte, zadelhoogte en reach in één sessie.",
      intro: [
        "Lage rugpijn op de fiets is vaak een probleem van cockpit en bekkencontrole. Als reach of drop groter is dan de rijder kan dragen, gaat het bekken kantelen of instorten en krijgt de onderrug de rekening.",
        "Bekkenkanteling is het mechanisme om op te letten. Als iemand de houding 20 minuten volhoudt maar niet 2 uur, legt vermoeidheid een positie bloot die eigenlijk maar net haalbaar is.",
        "Core-stabiliteit is net zo belangrijk als stuurhoogte. Een betere fit verlaagt de eis, maar kan een houding die te lang, te laag of te agressief is niet volledig compenseren.",
      ],
      sections: [
        {
          title: "Waarom lage rugpijn vooral op langere ritten opkomt",
          items: [
            "Een positie die kort prima voelt, kan falen zodra heupflexoren, bilspieren en rompspieren vermoeien en het bekken achterover begint te kantelen.",
            "Opbouw van belasting speelt hier sterk mee: meer volume, meer intensiteit of langer in de drops rijden kan de rug als eerste laten protesteren.",
            "Een duidelijke asymmetrie, zoals een bekkenhelft die anders beweegt dan de andere, wijst vaak meer op een afstellingsprobleem dan alleen op conditie.",
          ],
        },
        {
          title: "Cockpitlengte en drop: de belangrijkste knoppen",
          items: [
            "Voelt iemand zich uitgerekt, steunt hij op de schouders of lukt het niet om een neutrale rug te houden, dan is reach meestal de eerste knop om korter te maken.",
            "Een praktische eerste stap is de drop met 5-10 mm te verlagen of de cockpit iets korter te maken en daarna opnieuw te voelen hoe rustig het bekken blijft.",
            "Vergelijk de huidige reach met wat de rijder op langere ritten echt kan dragen, niet alleen met wat op een statische foto goed oogt.",
          ],
        },
        {
          title: "Zadelhoogte en bekkenstabiliteit",
          items: [
            "Een zadel dat te hoog staat kan het bekken laten wiebelen, en dat geeft een kettingreactie richting de onderrug.",
            "Een zadel dat te laag staat kan ook rugklachten geven doordat de heuphoek sluit en de onderrug moet meebuigen om toch kracht te leveren.",
            "Controleer zadelhoogte dus eerst, voordat je alleen aan cockpitlengte gaat sleutelen. Een stabiel bekken is makkelijker als de beenstrekking klopt.",
          ],
        },
        {
          title: "Core en mobiliteit: wat fitten niet alleen kan oplossen",
          items: [
            "Als de houding alleen wegzakt zodra iemand moe wordt, dan spelen core-uithoudingsvermogen en heupmobiliteit waarschijnlijk ook mee.",
            "De fitter kan de belasting verlagen, maar de rijder moet nog steeds genoeg rompspanning hebben om het bekken onder belasting te dragen.",
            "Verbeteren de klachten na een aanpassing maar komen ze terug bij hogere trainingsbelasting, dan is de duurzame oplossing meestal een combinatie van fit en training.",
          ],
        },
      ],
      faqs: [
        {
          q: "Lost het hoger zetten van mijn stuur altijd rugpijn op?",
          a: "Nee. Hogere sturen helpen soms als de drop te groot is, maar reach, zadelhoogte en bekkenstabiliteit spelen allemaal mee. Soms werkt korter maken van de cockpit beter dan alleen het front omhoog zetten.",
        },
        {
          q: "Hoe weet ik of mijn reach te lang is?",
          a: "Typische signalen zijn gestrekte ellebogen, opgetrokken schouders, naar voren schuiven op het zadel of een onderrug die strakker wordt zodra de rit langer of zwaarder wordt.",
        },
        {
          q: "Is lage rugpijn op de fiets altijd een fitprobleem?",
          a: "Nee. Fit is een logische oorzaak, maar rugpijn kan ook komen door trainingsbelasting, mobiliteitsbeperkingen of een medische oorzaak. Is de pijn hevig, hardnekkig of ook buiten het fietsen aanwezig, laat het dan beoordelen.",
        },
        {
          q: "Hoeveel drop is te veel voor iemand met lage rugpijn?",
          a: "Er is geen universele grens, maar als de rijder na de eerste 30 minuten al geen neutrale rughoek meer kan houden zonder spanning, is de huidige drop waarschijnlijk meer dan heup- en coreflexibiliteit aankunnen.",
        },
        {
          q: "Heeft zadelsetback invloed op lage rugpijn?",
          a: "Ja. Te veel setback naar achteren kan de romp extra laten kantelen om het stuur te bereiken, waardoor de onderrug meer belast wordt. Een kleine setback-aanpassing in combinatie met een reachcheck helpt vaak meer dan alleen stuurhoogte veranderen.",
        },
        {
          q: "Wanneer ga ik naar een fysio in plaats van nog meer aan mijn fiets te sleutelen?",
          a: "Als de pijn eenzijdig is, uitstraalt naar een been, niet verbetert na twee of drie logische fitwijzigingen over meerdere weken, of erger wordt bij dagelijkse activiteiten buiten het fietsen, laat een fysiotherapeut het beoordelen voordat je verdere aanpassingen doet.",
        },
      ],
    },
  },
  "bike-fit-for-neck-and-shoulder-pain": {
    en: {
      heroIntro: "Neck and shoulder pain on the bike is usually a consequence of too much weight on the front end and a reach that is longer than the rider can comfortably support. It tends to build slowly across a ride and become obvious after one to two hours. This guide is for riders who feel shoulder tension, neck tightness, or upper-back fatigue and want to understand which cockpit variables to investigate first.",
      ctaDescription: "Start your free fit flow to get a guided check of your reach, bar height, and contact-point setup in one session.",
      intro: [
        "Neck and shoulder pain is usually a reach and load-distribution problem first, not just a bar-height problem. When the rider supports too much weight on the front of the bike, the upper body starts to work to hold the head up and keep the torso stable.",
        "Forward head position often builds gradually. The rider feels fine at first, then fatigue makes the shoulders rise, the chin jut forward, and the neck do extra work to keep the eyes level.",
        "A good fix reduces the amount of weight the upper body has to carry and makes the contact points support the rider instead of asking the rider to hang on them.",
      ],
      sections: [
        {
          title: "Where the load comes from",
          items: [
            "Too much arm extension makes the shoulders work isometrically and can turn the neck into a stabilizer instead of a mobile support structure.",
            "Shoulder elevation is a common compensation when the rider is reaching too far or pushing against a bar that is too low for the current mobility level.",
            "When the head is tipped forward for long periods, the neck muscles keep correcting the same small imbalance until they become painful.",
          ],
        },
        {
          title: "Reach as the primary driver",
          items: [
            "Stem length, bar shape, and hood position combine into the effective reach the rider feels in real riding posture.",
            "If the rider locks the elbows or has to slide forward to feel in control, the cockpit is probably too long before bar height is the main issue.",
            "Shortening the reach usually gives a bigger comfort gain than a small bar-height change when the complaint is mainly shoulders and neck.",
          ],
        },
        {
          title: "Bar height vs reach: which to change first",
          items: [
            "If the rider is clearly overextended, shorten reach before making large changes to stack or spacer height.",
            "If the rider already feels compact but still hunches the shoulders, a modest bar-height increase may help more than another reach change.",
            "Think in order: support the pelvis, then set the reach, then fine-tune bar height for comfort and control.",
          ],
        },
        {
          title: "Hood angle and lever reach",
          items: [
            "Poorly rotated hoods can force the wrist to bend and the shoulder to protract, which often shows up as upper-back or neck discomfort.",
            "Lever reach that is too far away makes riders clamp harder with the hands, which increases tension all the way up the chain.",
            "Check that the rider can rest on the hoods with a neutral wrist and relaxed elbows before moving to larger cockpit changes.",
          ],
        },
      ],
      faqs: [
        {
          q: "Should I shorten my stem or raise my bars first?",
          a: "If the rider is clearly stretched, shorten the stem or reduce effective reach first. If the rider is already compact and just too loaded on the front end, a modest bar-height increase may be the better first move.",
        },
        {
          q: "Why does neck pain only appear after 2+ hours?",
          a: "That usually means the position is barely sustainable and fatigue is exposing it. As the ride goes on, posture slips forward, the shoulders lift, and the neck starts doing more support work.",
        },
        {
          q: "Can handlebar width cause shoulder pain?",
          a: "Yes, if it is far outside the rider's natural shoulder width. A bar that is too wide can stress the shoulders; one that is too narrow can feel cramped and unstable.",
        },
        {
          q: "How do I tell if the issue is reach or bar height?",
          a: "If the pain appears quickly and the arms feel overextended, reach is usually the first suspect. If the rider already feels compact but hunches or feels heavy in the upper body, bar height is more likely the problem to address.",
        },
        {
          q: "Can saddle position cause neck and shoulder pain?",
          a: "Yes, indirectly. A saddle that is too low, too far forward, or poorly supported can shift extra weight forward onto the hands and increase the load on the upper body in ways that show up as neck and shoulder tension.",
        },
        {
          q: "When should neck pain on the bike prompt a medical check?",
          a: "If the pain radiates into the arm or hand, causes numbness or pins and needles in the fingers, or does not respond to fit changes over several weeks, see a clinician before making further adjustments.",
        },
      ],
    },
    nl: {
      heroIntro: "Nek- en schouderklachten op de fiets zijn doorgaans het gevolg van te veel gewicht op de voorkant en een reach die langer is dan de rijder comfortabel kan dragen. Ze bouwen zich langzaam op tijdens een rit en worden duidelijk na één tot twee uur. Deze gids is voor rijders die schouderdruk, nekstijfheid of bovenrugvermoeidheid ervaren en willen weten welke cockpitvariabelen ze eerst moeten onderzoeken.",
      ctaDescription: "Start de gratis fit flow voor een begeleide check van reach, stuurhoogte en contactpuntafstelling in één sessie.",
      intro: [
        "Nek- en schouderklachten zijn meestal eerst een probleem van reach en gewichtsverdeling, niet alleen van stuurhoogte. Als te veel gewicht op de voorkant van de fiets rust, moet het bovenlichaam het hoofd omhoog houden en de romp stabiliseren.",
        "Een voorwaartse hoofdpositie bouwt zich vaak langzaam op. In het begin voelt de houding goed, maar vermoeidheid laat de schouders omhoog kruipen, de kin naar voren komen en de nek extra werk doen om de blik recht te houden.",
        "Een goede oplossing verlaagt de last op het bovenlichaam en zorgt dat contactpunten de rijder ondersteunen in plaats van dat de rijder eraan moet hangen.",
      ],
      sections: [
        {
          title: "Waar de belasting vandaan komt",
          items: [
            "Te veel armstrekking maakt de schouders statisch belast en verandert de nek in een stabilisator in plaats van een mobiele steun.",
            "Schouders optrekken is een veelvoorkomende compensatie als iemand te ver reikt of duwt tegen een stuur dat voor de huidige mobiliteit te laag is.",
            "Als het hoofd lang naar voren helt, corrigeren de nekspieren steeds hetzelfde kleine onevenwicht tot ze pijnlijk worden.",
          ],
        },
        {
          title: "Reach als hoofdveroorzaker",
          items: [
            "Stuurpenlengte, barvorm en hoodpositie bepalen samen de effectieve reach die de rijder in praktijk voelt.",
            "Als de rijder de ellebogen op slot zet of naar voren moet schuiven om controle te houden, is de cockpit waarschijnlijk te lang voordat stuurhoogte echt de hoofdvraag wordt.",
            "Reach inkorten levert meestal meer comfort op dan een kleine wijziging in stuurhoogte wanneer vooral nek en schouders klagen.",
          ],
        },
        {
          title: "Stuurhoogte versus reach: wat eerst?",
          items: [
            "Als iemand duidelijk te ver uitgerekt zit, kort dan de reach in voordat je grote veranderingen in stack of spacers doorvoert.",
            "Voelt de rijder juist compact maar blijven de schouders toch opgetrokken, dan helpt een bescheiden verhoging van het stuur vaak meer dan nog korter maken.",
            "Werk in volgorde: eerst het bekken ondersteunen, dan reach vastzetten, daarna stuurhoogte verfijnen voor comfort en controle.",
          ],
        },
        {
          title: "Hoodhoek en remgreepbereik",
          items: [
            "Verkeerd gedraaide hoods kunnen de pols laten knikken en de schouder naar voren trekken, wat vaak als nek- of bovenrugklacht terugkomt.",
            "Een remgreep die te ver weg staat, laat rijders harder knijpen met de handen en verhoogt zo de spanning door de hele keten.",
            "Controleer eerst of de rijder op de hoods met een neutrale pols en losse ellebogen kan steunen, voordat je grote cockpitveranderingen maakt.",
          ],
        },
      ],
      faqs: [
        {
          q: "Moet ik eerst mijn stuurpen inkorten of mijn stuur hoger zetten?",
          a: "Als de rijder duidelijk uitgerekt zit, kort de stuurpen of de effectieve reach eerst in. Zit de rijder al compact en is de voorkant vooral te zwaar belast, dan is iets hoger zetten vaak de betere eerste stap.",
        },
        {
          q: "Waarom krijg ik pas na 2+ uur nekpijn?",
          a: "Dat betekent meestal dat de houding maar net vol te houden is en vermoeidheid de zwakke plek blootlegt. Na verloop van tijd zakt de houding naar voren, komen de schouders omhoog en moet de nek meer ondersteunen.",
        },
        {
          q: "Kan stuurbreedte schouderpijn veroorzaken?",
          a: "Ja, als de breedte ver buiten je natuurlijke schouderbreedte valt. Een te breed stuur belast de schouders extra; een te smal stuur kan juist beklemmend en instabiel voelen.",
        },
        {
          q: "Hoe weet ik of het om reach of stuurhoogte gaat?",
          a: "Als de pijn snel opkomt en de armen te ver uitgestrekt voelen, is reach meestal de eerste verdachte. Voelt de rijder al compact maar hangt of kruipt hij in de schouders, dan is stuurhoogte waarschijnlijk het probleem.",
        },
        {
          q: "Kan zadelpositie nek- en schouderklachten veroorzaken?",
          a: "Ja, indirect. Een zadel dat te laag staat, te ver naar voren staat of onvoldoende steun biedt, kan extra gewicht naar de handen verplaatsen en zo de belasting op het bovenlichaam verhogen op een manier die zich uit als nekspanning of schouderdruk.",
        },
        {
          q: "Wanneer moet nekpijn op de fiets een medische check uitlokken?",
          a: "Als de pijn uitstraalt naar arm of hand, tintelingen of gevoelloosheid in de vingers veroorzaakt, of na meerdere weken en logische fitwijzigingen niet verbetert, laat het dan medisch beoordelen voordat je verdere aanpassingen maakt.",
        },
      ],
    },
  },
  "bike-fit-for-hand-numbness-and-wrist-pain": {
    en: {
      heroIntro: "Hand numbness and wrist pain on the bike are almost always a pressure and wrist-angle issue, not a random circulation problem. When too much body weight loads the hands or the wrist is forced into a bent position for long periods, nerves and soft tissue at the contact point get compressed. This guide is for riders who experience tingling, numbness, or wrist ache on the bike and want to understand which variables to check first.",
      ctaDescription: "Start your free fit flow to get a guided review of your reach, bar height, and hood position in a single session.",
      intro: [
        "Hand numbness is almost always a pressure problem or a wrist-angle problem. When too much body weight rests on the hands, the nerves and soft tissue at the contact point get compressed.",
        "The ulnar and median nerve pathways are the usual suspects, which is why numbness often shows up in the little finger side, the thumb side, or both depending on the exact pressure pattern.",
        "Thicker gloves and bar tape can make the ride feel softer, but they do not remove the force that is creating the numbness in the first place.",
      ],
      sections: [
        {
          title: "Pressure distribution at the contact point",
          items: [
            "Too much reach, too much drop, or a rider who is sliding forward can all move extra weight onto the palms and fingers.",
            "A dropped wrist angle concentrates pressure instead of spreading it, especially when the rider is gripping hard on rough roads or climbing out of the saddle.",
            "If one hand goes numb sooner than the other, look for asymmetry in hood setup, bar rotation, or shoulder loading.",
          ],
        },
        {
          title: "Hood position and wrist angle",
          items: [
            "The goal is a neutral wrist, not an aggressively bent one. The hand should rest on the hood without needing to cock the wrist up or down.",
            "If the rider has to extend the wrist to reach the lever, the hoods may be too low, too far forward, or rotated into a shape that does not match the hand.",
            "Check lever reach in the actual riding grip, because a setup that feels fine in the shop can change completely once the rider is on the bike.",
          ],
        },
        {
          title: "Bar width and grip width",
          items: [
            "Bars that roughly match shoulder width often reduce tension in the shoulders, which can improve hand comfort by loosening the whole chain.",
            "Too wide a bar can spread the arms and overload the outer hand; too narrow can force the rider into an unstable, clenched grip.",
            "If the rider constantly squeezes the bars, the issue may be support and control, not just a local hand problem.",
          ],
        },
        {
          title: "When to suspect something other than fit",
          items: [
            "Numbness that starts at rest, wakes the rider at night, or lasts long after the ride may point beyond bike fit.",
            "Pain or numbness in only one hand after a crash, or after a change that clearly should not have caused it, deserves a medical check.",
            "If symptoms worsen despite reducing load on the hands, stop chasing small fit tweaks and look for nerve or circulation issues.",
          ],
        },
      ],
      faqs: [
        {
          q: "Does bar tape thickness reduce hand numbness?",
          a: "It can reduce vibration and make the bars feel more comfortable, but it does not fix the underlying pressure or wrist-angle problem that usually causes numbness.",
        },
        {
          q: "Which nerve is usually affected?",
          a: "Most often the ulnar nerve on the little-finger side or the median nerve on the thumb side, depending on where the pressure is concentrated.",
        },
        {
          q: "How quickly should numbness clear after a fit change?",
          a: "Some riders feel improvement immediately, but a true test usually takes a few rides. If numbness persists or gets worse, the change was not enough or the cause is not fit-related.",
        },
        {
          q: "Does reach length affect hand numbness?",
          a: "Yes. A cockpit that is too long increases the amount of weight the hands have to carry, which raises pressure at the contact point and can trigger numbness sooner. Shortening the reach is often the most effective first step.",
        },
        {
          q: "Why does one hand go numb but not the other?",
          a: "Asymmetry in hood rotation, bar clamp position, or how the rider leans can create uneven pressure. If one side is consistently worse, check whether the hoods, lever reach, and shoulder loading are equal on both sides.",
        },
        {
          q: "When should hand numbness prompt a medical assessment?",
          a: "If numbness appears at rest or overnight, lasts more than an hour after the ride, or is accompanied by weakness in the hand or fingers, see a clinician before continuing to adjust the bike.",
        },
      ],
    },
    nl: {
      heroIntro: "Gevoelloze handen en polspijn op de fiets zijn bijna altijd een druk- en polshoekkwestie, geen willekeurig doorbloedingsprobleem. Wanneer te veel lichaamsgewicht op de handen rust of de pols lang in een gebogen stand wordt gehouden, worden zenuwen en weke delen op het contactpunt samengedrukt. Deze gids is voor rijders die tinteling, gevoelloosheid of polspijn op de fiets ervaren en willen weten welke variabelen ze als eerste moeten controleren.",
      ctaDescription: "Start de gratis fit flow voor een begeleide check van reach, stuurhoogte en hoodpositie in één sessie.",
      intro: [
        "Gevoelloze handen zijn bijna altijd een drukprobleem of een probleem met de polshoek. Als te veel lichaamsgewicht op de handen rust, komen zenuwen en weke delen op het contactpunt onder druk te staan.",
        "De zenuwbanen van de nervus ulnaris en medianus zijn meestal betrokken. Daarom zit tinteling vaak aan de pinkzijde, duimzijde of aan beide kanten, afhankelijk van het drukpatroon.",
        "Dikkere handschoenen en stuurlint maken het gevoel zachter, maar halen de kracht die de tinteling veroorzaakt niet weg.",
      ],
      sections: [
        {
          title: "Drukverdeling op het contactpunt",
          items: [
            "Te veel reach, te veel drop of naar voren schuiven kan extra gewicht op handpalmen en vingers zetten.",
            "Een afgezakte pols concentreert druk in plaats van die te verdelen, vooral als iemand hard knijpt op slecht wegdek of tijdens klimmen uit het zadel.",
            "Wordt een hand sneller gevoelloos dan de andere, kijk dan naar asymmetrie in hoodopstelling, stuurrotatie of schouderbelasting.",
          ],
        },
        {
          title: "Hoodpositie en polshoek",
          items: [
            "Het doel is een neutrale pols, niet een sterk gebogen houding. De hand moet op de hood kunnen rusten zonder de pols op te trekken of naar beneden te knikken.",
            "Moet de pols strekken om de remgreep te bereiken, dan staan de hoods misschien te laag, te ver naar voren of in een hoek die niet bij de hand past.",
            "Controleer de greep op de echte fietspositie, want een afstelling die in de werkplaats goed lijkt kan op de fiets heel anders voelen.",
          ],
        },
        {
          title: "Stuurbreedte en gripbreedte",
          items: [
            "Een stuur dat ongeveer bij de schouderbreedte past, verlaagt vaak de spanning in schouders en helpt zo indirect ook de handcomfort verbeteren.",
            "Een te breed stuur kan de armen te ver openen en de buitenzijde van de hand overbelasten; een te smal stuur voelt juist krampachtig en instabiel.",
            "Knijp je voortdurend in het stuur, dan ligt het probleem soms meer bij ondersteuning en controle dan bij alleen de hand zelf.",
          ],
        },
        {
          title: "Wanneer het waarschijnlijk iets anders is dan fit",
          items: [
            "Tinteling die al in rust begint, je 's nachts wakker maakt of lang na de rit blijft hangen, kan verder gaan dan bikefit.",
            "Pijn of gevoelloosheid in slechts één hand na een val of na een verandering die dit eigenlijk niet zou moeten veroorzaken, verdient medische beoordeling.",
            "Worden de klachten erger ondanks minder druk op de handen, stop dan met losse fitfijnslijperij en kijk naar zenuw- of doorbloedingsproblemen.",
          ],
        },
      ],
      faqs: [
        {
          q: "Helpt dikker stuurlint tegen gevoelloze handen?",
          a: "Het kan trillingen dempen en het stuur comfortabeler laten aanvoelen, maar het lost het onderliggende druk- of polsprobleem meestal niet op.",
        },
        {
          q: "Welke zenuw is meestal betrokken?",
          a: "Meestal de nervus ulnaris aan de pinkzijde of de nervus medianus aan de duimzijde, afhankelijk van waar de druk zit.",
        },
        {
          q: "Hoe snel moet tinteling verdwijnen na een fitaanpassing?",
          a: "Soms merk je direct verschil, maar een echte test vraagt meestal enkele ritten. Blijft de tinteling of wordt die erger, dan was de wijziging niet genoeg of is de oorzaak niet puur fit.",
        },
        {
          q: "Heeft reachlengte invloed op gevoelloze handen?",
          a: "Ja. Een te lange cockpit verhoogt het gewicht dat de handen moeten dragen, waardoor druk op het contactpunt toeneemt en tinteling eerder optreedt. Reach inkorten is vaak de effectiefste eerste stap.",
        },
        {
          q: "Waarom wordt de ene hand gevoelloos en de andere niet?",
          a: "Asymmetrie in hoodrotatie, stuurklemstand of de manier waarop de rijder leunt, kan ongelijke druk veroorzaken. Als één kant consequent erger is, controleer dan of hoods, remgreepbereik en schouderbelasting aan beide kanten gelijk zijn.",
        },
        {
          q: "Wanneer moet gevoelloosheid in de handen een medische beoordeling uitlokken?",
          a: "Als tinteling ook in rust of 's nachts optreedt, langer dan een uur na de rit aanhoudt, of gepaard gaat met zwakte in hand of vingers, laat het dan medisch beoordelen voordat je verder aan de fiets sleutelt.",
        },
      ],
    },
  },
  "bike-fit-for-saddle-pressure-perineal-numbness-and-saddle-sores": {
    en: {
      heroIntro: "Saddle pressure, perineal numbness, and saddle sores all have the same root cause: the load is landing in the wrong place and the saddle shape or position is not supporting the sit bones properly. These problems rarely resolve on their own and can escalate quickly if the ride time increases. This guide is for riders who are experiencing any saddle-contact discomfort and want to understand the three variables that matter most before changing anything.",
      ctaDescription: "Use the Saddle Width Calculator to get a sit-bone-based starting reference for saddle width selection.",
      intro: [
        "Saddle pressure problems are usually a three-part equation: saddle shape, saddle tilt, and rider position on the saddle. Changing only one of those often fails because the other two still keep the pressure concentrated.",
        "Perineal numbness and saddle sores are not the same complaint, but both can come from poor support under the sit bones and too much soft-tissue pressure where the rider should be carrying weight.",
        "A fit that works spreads load onto the sit bones, keeps the pelvis stable, and avoids forcing the rider to slide or brace against the saddle nose.",
      ],
      sections: [
        {
          title: "Saddle tilt: the most over-adjusted variable",
          items: [
            "Most riders do best close to level or with a very small nose-down tilt, usually in the 0-2 degree range.",
            "Too much nose-up tilt can increase perineal pressure; too much nose-down tilt often makes the rider slide forward and then hang on the hands.",
            "Men and women may feel the same tilt differently because pelvic shape and soft-tissue load patterns are not identical.",
          ],
        },
        {
          title: "Saddle setback and pelvic rocking",
          items: [
            "If the rider keeps sliding forward or rocking side to side, the saddle position is probably not supporting the pelvis cleanly.",
            "Excessive forward slide under load is often a sign that the rider is compensating for too much tilt, too much reach, or a saddle shape that does not match the pelvis.",
            "Watch the pelvis, not just the saddle nose, because stable support is the real goal.",
          ],
        },
        {
          title: "Saddle width and sit-bone support",
          items: [
            "The saddle should support the sit bones, not just feel soft at the nose. A common starting point is a saddle that is roughly 20-30 mm wider than sit-bone width, depending on shape and riding posture.",
            "You can estimate sit-bone width at home with a simple impression test, but the result still needs to match the rider's position and flexibility on the bike.",
            "If the saddle is too narrow, pressure concentrates; if it is too wide, the thighs may rub and the rider may struggle to keep the pelvis stable.",
          ],
        },
        {
          title: "When saddle choice matters more than position",
          items: [
            "If the rider has tried reasonable tilt and fore-aft changes and still gets numbness, the saddle shape itself may be wrong.",
            "Cut-out shape, nose profile, and shell support all matter when the issue is perineal pressure rather than general sit-bone discomfort.",
            "Persistent sores, repeated numbness, or pressure that worsens on every ride often means the saddle needs replacing, not just re-tilting.",
          ],
        },
      ],
      faqs: [
        {
          q: "How do I measure my sit-bone width at home?",
          a: "A simple seated impression test on firm cardboard or foam can give you a usable estimate, but it is only a starting point. Compare the result with the saddle shape and your riding posture.",
        },
        {
          q: "Does saddle height affect perineal pressure?",
          a: "Yes. A saddle that is too high can cause pelvic rocking and extra soft-tissue pressure, while a saddle that is too low can close the hip angle and change how the rider sits on the saddle.",
        },
        {
          q: "When is saddle pressure a medical issue rather than a fit issue?",
          a: "If numbness persists after the ride, there is skin breakdown, swelling, or pain that is not clearly linked to position alone, the problem needs medical attention as well as fit review.",
        },
        {
          q: "How wide should my saddle be?",
          a: "A common guideline is to choose a saddle that is roughly 20 to 30 mm wider than your sit-bone measurement, but saddle shape, riding posture, and flexibility also influence which width actually feels supported in the riding position.",
        },
        {
          q: "Does saddle tilt affect saddle sores?",
          a: "Yes. Too much nose-up tilt increases pressure on soft tissue and can contribute to sores. Small tilt changes of one to two degrees can have a noticeable effect, so measure carefully with a level on the actual riding surface rather than guessing.",
        },
        {
          q: "Can chamois cream replace fixing the underlying fit issue?",
          a: "No. Chamois cream reduces friction and can help manage minor irritation during a transition period, but it cannot prevent sores that come from a saddle that does not match the pelvis, a bad tilt, or an unstable riding position.",
        },
      ],
    },
    nl: {
      heroIntro: "Zadeldruk, gevoelloosheid van het zitgebied en zadelplekken hebben allemaal dezelfde onderliggende oorzaak: de belasting komt op de verkeerde plek terecht en het zadel ondersteunt de zitbotjes niet goed. Deze problemen verdwijnen zelden vanzelf en kunnen snel verergeren naarmate de rijafstand toeneemt. Deze gids is voor rijders die ongemak op het zadel ervaren en de drie variabelen willen begrijpen die er het meest toe doen voordat ze iets veranderen.",
      ctaDescription: "Gebruik de Zadelbreedte Calculator voor een op zitbotmeting gebaseerd startpunt bij het kiezen van een zadelbreedte.",
      intro: [
        "Zadeldruk is meestal een vergelijking van drie dingen: zadelvorm, zadelkanteling en de manier waarop de rijder op het zadel zit. Als je er maar één verandert, blijven de andere twee vaak de druk alsnog vasthouden.",
        "Gevoelloosheid van het zitgebied en zadelplekken zijn niet hetzelfde, maar beide kunnen ontstaan door te weinig steun onder de zitbotjes en te veel druk op weke delen waar eigenlijk gewicht gedragen moet worden.",
        "Een goede afstelling verdeelt de last over de zitbotjes, houdt het bekken stabiel en voorkomt dat de rijder naar voren schuift of zich tegen de neus van het zadel moet afzetten.",
      ],
      sections: [
        {
          title: "Zadelkanteling: de meest over-aangepaste variabele",
          items: [
            "De meeste rijders voelen zich het best met een zadel dat vrijwel vlak staat of heel licht neus omlaag, meestal rond 0-2 graden.",
            "Te veel neus omhoog kan perineale druk verhogen; te veel neus omlaag laat de rijder vaak naar voren glijden en dan op de handen hangen.",
            "Mannen en vrouwen kunnen dezelfde kanteling anders voelen, omdat bekkenvorm en belasting van weke delen niet identiek zijn.",
          ],
        },
        {
          title: "Zadelterugstand en bekkenrocking",
          items: [
            "Als de rijder steeds naar voren glijdt of zijwaarts wiebelt, ondersteunt het zadel het bekken waarschijnlijk niet goed.",
            "Te veel naar voren schuiven onder belasting is vaak een teken dat iemand compenseert voor te veel kanteling, te veel reach of een zadelvorm die niet bij het bekken past.",
            "Kijk naar het bekken en niet alleen naar de neus van het zadel, want stabiele steun is het echte doel.",
          ],
        },
        {
          title: "Zadelbreedte en steun op de zitbotjes",
          items: [
            "Het zadel moet de zitbotjes ondersteunen, niet alleen zacht aanvoelen aan de voorkant. Een bruikbaar startpunt is vaak een zadel dat ongeveer 20-30 mm breder is dan de zitbotbreedte, afhankelijk van vorm en houding.",
            "Je kunt de zitbotbreedte thuis grof inschatten met een afdruktest, maar die uitkomst moet nog steeds passen bij je houding en flexibiliteit op de fiets.",
            "Is het zadel te smal, dan concentreert de druk zich. Is het te breed, dan gaan de bovenbenen vaak schuren en wordt het lastiger om het bekken stabiel te houden.",
          ],
        },
        {
          title: "Wanneer zadelkeuze belangrijker is dan positie",
          items: [
            "Heb je redelijke aanpassingen aan kanteling en voor-achter al geprobeerd en blijft gevoelloosheid terugkomen, dan is de zadelvorm zelf mogelijk de boosdoener.",
            "De vorm van een uitsparing, de neus en de steun van de schaal tellen allemaal mee wanneer het probleem perineale druk is en niet alleen algemene zitbotklachten.",
            "Aanhoudende zadelplekken, terugkerende gevoelloosheid of druk die elke rit erger wordt, betekenen vaak dat het zadel vervangen moet worden in plaats van alleen opnieuw gekanteld.",
          ],
        },
      ],
      faqs: [
        {
          q: "Hoe meet ik mijn zitbotbreedte thuis?",
          a: "Met een eenvoudige afdruktest op stevig karton of schuim kun je een bruikbare schatting maken. Zie die wel als startpunt en niet als definitieve waarheid; vorm en houding blijven meebepalen.",
        },
        {
          q: "Heeft zadelhoogte invloed op perineale druk?",
          a: "Ja. Een te hoog zadel kan bekkenrocking en extra druk op weke delen geven, terwijl een te laag zadel de heuphoek sluit en verandert hoe je op het zadel zit.",
        },
        {
          q: "Wanneer is zadeldruk een medisch probleem en niet alleen een fitprobleem?",
          a: "Als gevoelloosheid blijft na de rit, er huidbeschadiging, zwelling of pijn is die niet duidelijk alleen door de houding komt, moet je het medisch laten beoordelen naast een fitcheck.",
        },
      ],
    },
  },
  "bike-fit-for-foot-pain-hot-foot-and-numb-toes": {
    en: {
      intro: [
        "Foot pain in cycling is primarily a shoe-fit and cleat problem, not a frame problem. The key pressure point is the metatarsal head area under the cleat, where a poor match quickly turns into heat, numbness, or a burning sensation.",
        "Hot foot usually appears when pressure, heat, and swelling build up over time. Numb toes often point to circulation or compression from the shoe closing system rather than pedal choice.",
        "The first goal is to get the shoe and cleat working with the foot shape before adding insoles, spacers, or more exotic solutions.",
      ],
      sections: [
        {
          title: "Hot foot: causes and first checks",
          items: [
            "Check cleat fore-aft position first, because a cleat that sits too far forward can load the forefoot excessively and create hotspots quickly.",
            "A stiff sole helps spread load, but if the shoe is too narrow or the foot sits too far forward in the shoe, stiffness alone will not solve the problem.",
            "If hot foot appears late in the ride, look for swelling, poor ventilation, or closure that gets tighter as the day warms up.",
          ],
        },
        {
          title: "Numb toes: the circulation mechanism",
          items: [
            "Over-tightening the shoe closure can compress the top of the foot and reduce circulation to the toes even when the shoe size seems correct.",
            "A shallow or tight vamp can squeeze the forefoot, especially when the rider swells during longer rides or hot conditions.",
            "If the problem gets worse in cold weather, circulation and insulation become even more important than pure pressure relief.",
          ],
        },
        {
          title: "Cleat fore-aft position",
          items: [
            "The classic starting point is ball-of-foot cleat placement, but some riders benefit from a slightly more rearward position to reduce forefoot load.",
            "Mid-foot experimentation can help in special cases, but it changes leverage and feel enough that it should be tested deliberately rather than guessed at.",
            "Adjust in small increments and reassess pedaling feel, calf load, and hot spot location after each change.",
          ],
        },
        {
          title: "When foot pain signals a need for wider shoes or insoles",
          items: [
            "If the foot spills over the sole, the little toe is compressed, or the shoe only feels good when it is barely tightened, width is likely the real issue.",
            "Insoles and footbeds can help the arch present a more stable platform, but they should not be used to force a shoe that is fundamentally the wrong shape.",
            "If one foot always hurts more than the other, check for left-right size differences before assuming the cleat is the only problem.",
          ],
        },
      ],
      faqs: [
        {
          q: "What is the correct cleat fore-aft position?",
          a: "The usual starting point is under the ball of the foot, but the best position depends on foot shape, shoe volume, and the rider's goals. Use that as a baseline and test carefully from there.",
        },
        {
          q: "Can orthotics help with hot foot?",
          a: "Yes, if the issue is poor support or arch collapse that is creating extra pressure. They help less if the shoe is simply too narrow or the cleat is too far forward.",
        },
        {
          q: "Why does foot pain get worse as the ride goes on?",
          a: "Swelling, heat, and repeated pressure make a borderline shoe or cleat setup fail over time. What feels acceptable at the start can become painful once the foot expands and the tissues tire.",
        },
      ],
    },
    nl: {
      intro: [
        "Voetpijn tijdens fietsen is vooral een probleem van schoenfit en cleat, niet van het frame. Het belangrijkste drukpunt zit onder de bal van de voet, ter hoogte van de metatarsale koppen, waar een slechte match snel verandert in warmte, tinteling of branderigheid.",
        "Hot foot ontstaat vaak wanneer druk, warmte en zwelling zich in de loop van de rit opstapelen. Gevoelloze tenen wijzen meestal eerder op doorbloeding of knelling door het sluitsysteem van de schoen dan op de pedaalkeuze.",
        "Het eerste doel is dat schoen en cleat samenwerken met de voetvorm voordat je naar inlegzolen, spacers of ingewikkelder oplossingen grijpt.",
      ],
      sections: [
        {
          title: "Hot foot: oorzaken en eerste checks",
          items: [
            "Controleer eerst de voor-achterpositie van de cleat, want een cleat die te ver naar voren staat belast de voorvoet snel te veel en geeft hot spots.",
            "Een stijve zool verdeelt de last beter, maar als de schoen te smal is of de voet te ver naar voren in de schoen zit, lost alleen stijfheid het probleem niet op.",
            "Ontstaat hot foot pas laat in de rit, kijk dan ook naar zwelling, ventilatie en sluiting die door warmte gaandeweg strakker gaat voelen.",
          ],
        },
        {
          title: "Gevoelloze tenen: het circulatiemechanisme",
          items: [
            "Te strak aantrekken van de schoen kan de bovenkant van de voet afknellen en de doorbloeding naar de tenen verminderen, ook als de maat op zich goed lijkt.",
            "Een smalle of ondiepe voorvoetvorm kan de voorkant van de voet samendrukken, vooral wanneer de voet tijdens langere ritten of warmte opzet.",
            "Wordt het probleem erger in koud weer, dan spelen doorbloeding en isolatie nog sterker mee dan alleen drukvermindering.",
          ],
        },
        {
          title: "Cleat voor-achterpositie",
          items: [
            "Het klassieke startpunt is cleats onder de bal van de voet, maar sommige rijders hebben baat bij iets verder naar achteren om de voorvoet minder te belasten.",
            "Mid-foot experimenten kunnen in speciale gevallen helpen, maar veranderen hefboom en gevoel genoeg om ze bewust en stap voor stap te testen.",
            "Stel in kleine stappen af en evalueer na elke wijziging trapgevoel, kuitbelasting en de plek van de hot spot opnieuw.",
          ],
        },
        {
          title: "Wanneer voetpijn wijst op bredere schoenen of inlegzolen",
          items: [
            "Steekt de voet over de zool heen, wordt de kleine teen samengedrukt of voelt de schoen alleen goed als hij amper strak staat, dan is breedte waarschijnlijk het echte probleem.",
            "Inlegzolen en footbeds kunnen helpen als de boog extra steun nodig heeft, maar gebruik ze niet om een schoen die qua vorm verkeerd is toch passend te forceren.",
            "Doet altijd dezelfde voet meer pijn dan de andere, check dan eerst links-rechts maatverschil voordat je alleen de cleat de schuld geeft.",
          ],
        },
      ],
      faqs: [
        {
          q: "Wat is de juiste voor-achterpositie van de cleat?",
          a: "Het gebruikelijke startpunt is onder de bal van de voet, maar de beste positie hangt af van voetvorm, schoenvolume en doel van de rijder. Gebruik dat als basis en test van daaruit zorgvuldig verder.",
        },
        {
          q: "Kunnen orthopedische zolen helpen tegen hot foot?",
          a: "Ja, als het probleem komt door onvoldoende steun of doorzakken van de boog waardoor extra druk ontstaat. Ze helpen minder als de schoen simpelweg te smal is of de cleat te ver naar voren staat.",
        },
        {
          q: "Waarom wordt voetpijn erger naarmate de rit langer duurt?",
          a: "Zwelling, warmte en herhaalde druk laten een borderline schoen- of cleatafstelling steeds verder falen. Wat aan het begin nog acceptabel voelt, kan later pijnlijk worden zodra de voet opzet en de weefsels vermoeien.",
        },
      ],
    },
  },
} satisfies GuideContentRecord;

export const PAIN_DISCOMFORT_GUIDE_CONTENT: GuideContentRecord = appendStructuralSections(
  appendGuideCopy(PAIN_DISCOMFORT_GUIDE_CONTENT_BASE),
);
