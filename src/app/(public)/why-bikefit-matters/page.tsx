import type { Metadata } from "next";
import { Button } from "@/components/ui";
import { TrackedCtaLink } from "@/components/analytics/TrackedCtaLink";
import { HOME_QUOTES_BY_LOCALE } from "@/content/homeQuotes";
import type { Locale } from "@/i18n/config";
import { buildLocaleAlternates } from "@/i18n/metadata";
import { withLocalePrefix } from "@/i18n/navigation";
import { getRequestLocale } from "@/i18n/request";

type BenefitBlock = {
  title: string;
  paragraphs: readonly string[];
  bullets?: readonly string[];
};

const copy: Record<
  Locale,
  {
    metadata: { title: string; description: string };
    hero: { eyebrow: string; title: string; paragraphs: string[] };
    quotesTitle: string;
    quotesIntro: string;
    quotesOutro: string;
    whyTitle: string;
    whyIntro: string;
    contactPoints: string[];
    whyParagraphs: string[];
    benefitsTitle: string;
    adjustmentsTitle: string;
    adjustmentsIntro: string;
    methodsIntro: string;
    considerTitle: string;
    considerIntro: string;
    ctaEyebrow: string;
    ctaTitle: string;
    ctaBody: string;
    ctaLabel: string;
    benefits: BenefitBlock[];
    fitAdjustmentItems: string[];
    fitMethodItems: string[];
    considerFitItems: string[];
  }
> = {
  en: {
    metadata: {
      title: "Why a good bike fit matters | BestBikeFit4U",
      description:
        "See why a good bike fit improves comfort, control, efficiency, and repeatability, and what a fit actually changes on the bike.",
    },
    hero: {
      eyebrow: "Why bike fit matters",
      title: "Why so many riders feel the difference after a good bike fit",
      paragraphs: [
        "Most riders do not need a new bike to feel better and ride more confidently. They need a position that matches their body, flexibility, goals, and the terrain they ride.",
        "A proper bike fit turns vague problems into measurable adjustments in millimeters and degrees, then confirms those changes on the bike. Small changes often matter most on longer rides.",
      ],
    },
    quotesTitle: "What riders notice after a proper fit",
    quotesIntro:
      "These are typical outcomes riders describe after getting their position dialed in:",
    quotesOutro:
      "These are not cosmetic improvements. They map directly to the core areas a fit influences: comfort, joint load, breathing space, stability, and repeatability.",
    whyTitle: "Why a bike fit works",
    whyIntro:
      "A bike fit is not magic. It is biomechanics and basic physics applied to three contact points:",
    contactPoints: [
      "Feet (cleats, shoes, pedals)",
      "Pelvis (saddle height, setback, tilt, saddle choice)",
      "Hands and upper body (reach, drop, bar shape, hood position)",
    ],
    whyParagraphs: [
      "If one of these contact points is wrong, your body compensates. Compensation is what creates many recurring issues: numb hands, knee pain, hot foot, neck tightness, low-back fatigue, unstable descending, and flat-feeling power on climbs.",
      "Small adjustments matter because the body repeats the same movement thousands of times per hour. A minor misalignment can feel harmless for 20 minutes and become a real issue after 2 to 4 hours.",
    ],
    benefitsTitle: "The most common reasons riders feel immediate benefits",
    adjustmentsTitle: "What actually gets adjusted in a bike fit",
    adjustmentsIntro: "A fit typically covers:",
    methodsIntro:
      "Methods and principles commonly used, depending on rider and goal:",
    considerTitle: "When you should consider a fit",
    considerIntro: "A fit is worth considering if you recognize any of these:",
    ctaEyebrow: "Personal recommendations",
    ctaTitle: "Start your free bike fit today",
    ctaBody:
      "No guesswork. No generic tips. Review fit guidance matched to your body and riding goals.",
    ctaLabel: "Start Free Fit",
    benefits: [
      {
        title: "Reduced pain and overload",
        paragraphs: [
          'Many riders start from a "tolerance-based" position: it works until it does not. A fit reduces unnecessary joint stress by aligning the knee-ankle-hip chain and stabilizing the pelvis.',
          "Typical wins:",
        ],
        bullets: [
          "Less anterior knee stress from saddle height and cleat changes",
          "Less low-back strain from correcting reach, drop, and pelvic control",
          "Fewer numb hands from better weight distribution and hood position",
        ],
      },
      {
        title: "Better power transfer without forcing an aggressive posture",
        paragraphs: [
          "Comfort and performance are not opposites. The goal is to keep you stable so you can push power without sliding, rocking, or bracing through the shoulders.",
          "When the pelvis is stable and the feet are supported, the pedal stroke becomes more even and efficient.",
        ],
      },
      {
        title: "Better control and confidence",
        paragraphs: [
          "Handling improves when your center of mass is balanced between saddle and bars. Riders often notice this first on:",
        ],
        bullets: [
          'Descents with more control and less "nervous" steering',
          "Rough surfaces with less bouncing and more stability",
          "Long rides with less fatigue-driven wobble",
        ],
      },
      {
        title: "A position that matches your terrain",
        paragraphs: [
          "A good fit is not one fixed setup for everything. The position should change with your riding style:",
        ],
        bullets: [
          "Mountain or technical riding: more stability, less aggressive drop, more room to move",
          "Endurance: comfort-first, reduced lumbar load, sustainable reach",
          "Performance or race: more aerodynamic while keeping the hip angle workable",
          "TT or triathlon: very aero, but sensitive to saddle position, hip angle, and cockpit length",
        ],
      },
      {
        title: "Clarity through repeatable numbers",
        paragraphs: [
          "Most riders guess their setup. A proper fit produces exact values in millimeters and degrees so you can:",
        ],
        bullets: [
          "Rebuild your position after travel or maintenance",
          "Replicate it on a new frame",
          "Fine-tune for different bikes such as road, gravel, or indoor setups",
        ],
      },
    ],
    fitAdjustmentItems: [
      "Saddle height (mm)",
      "Saddle setback (mm)",
      "Saddle tilt (degrees)",
      "Handlebar reach (mm)",
      "Handlebar drop (mm)",
      "Stem length suggestion",
      "Crank length suggestion where relevant",
      "Cleat position (fore-aft, angle, stance width)",
      "Frame size range based on stack and reach",
    ],
    fitMethodItems: [
      "LeMond as an inseam-based starting point for saddle height",
      "Holmes as a knee-angle validation check",
      "KOPS as a reference point for knee and pedal alignment, not a one-size rule",
      "Stack and reach for frame selection and cockpit balance",
    ],
    considerFitItems: [
      "Recurring discomfort after 60 to 90 minutes",
      "Numb hands, hot foot, or saddle discomfort",
      "Knee pain, hip tightness, or back fatigue",
      "You changed shoes, cleats, saddle, cranks, or bike",
      "You are training more or returning after time off",
      "You want a more aerodynamic position without losing comfort",
    ],
  },
  nl: {
    metadata: {
      title: "Waarom een goede bike fit telt | BestBikeFit4U",
      description:
        "Bekijk waarom een goede bike fit comfort, controle, efficientie en herhaalbaarheid verbetert en wat een fit daadwerkelijk op de fiets verandert.",
    },
    hero: {
      eyebrow: "Waarom bike fit telt",
      title: "Waarom zoveel rijders direct verschil voelen na een goede bike fit",
      paragraphs: [
        "De meeste rijders hebben geen nieuwe fiets nodig om zich beter te voelen of met meer vertrouwen te rijden. Ze hebben een positie nodig die past bij hun lichaam, flexibiliteit, doelen en het terrein waarop ze rijden.",
        "Een goede bike fit vertaalt vage problemen naar meetbare aanpassingen in millimeters en graden en controleert die veranderingen daarna op de fiets. Kleine verschillen tellen juist op langere ritten.",
      ],
    },
    quotesTitle: "Wat rijders merken na een goede fit",
    quotesIntro:
      "Dit zijn typische uitkomsten die rijders beschrijven nadat hun positie beter is afgesteld:",
    quotesOutro:
      "Dit zijn geen cosmetische verbeteringen. Ze raken precies de gebieden die een fit beinvloedt: comfort, gewrichtsbelasting, ademruimte, stabiliteit en herhaalbaarheid.",
    whyTitle: "Waarom een bike fit werkt",
    whyIntro:
      "Een bike fit is geen magie. Het is biomechanica en basisfysica toegepast op drie contactpunten:",
    contactPoints: [
      "Voeten (schoenplaatjes, schoenen, pedalen)",
      "Bekken (zadelhoogte, setback, tilt, zadelkeuze)",
      "Handen en bovenlichaam (reach, drop, stuurvorm, remgreeppositie)",
    ],
    whyParagraphs: [
      "Als een van deze contactpunten niet klopt, gaat je lichaam compenseren. Compensatie veroorzaakt veel terugkerende klachten: dove handen, kniepijn, brandende voeten, nekspanning, lage-rugvermoeidheid, onrustige afdalingen en vlak aanvoelende kracht op klimmen.",
      "Kleine aanpassingen doen ertoe omdat het lichaam dezelfde beweging duizenden keren per uur herhaalt. Een kleine misalignering kan 20 minuten onschuldig voelen en na 2 tot 4 uur een echt probleem worden.",
    ],
    benefitsTitle: "De meest voorkomende redenen waarom rijders direct voordeel merken",
    adjustmentsTitle: "Wat er daadwerkelijk wordt aangepast in een bike fit",
    adjustmentsIntro: "Een fit behandelt meestal:",
    methodsIntro:
      "Veelgebruikte methodes en principes, afhankelijk van rijder en doel:",
    considerTitle: "Wanneer een fit logisch is",
    considerIntro: "Een fit is het overwegen waard als je een of meer van deze punten herkent:",
    ctaEyebrow: "Persoonlijke aanbevelingen",
    ctaTitle: "Start vandaag je gratis bike fit",
    ctaBody:
      "Geen giswerk. Geen generieke tips. Bekijk fitbegeleiding die past bij jouw lichaam en rijdoelen.",
    ctaLabel: "Start gratis fit",
    benefits: [
      {
        title: "Minder pijn en overbelasting",
        paragraphs: [
          'Veel rijders vertrekken vanuit een "tolerantiepositie": het werkt tot het niet meer werkt. Een fit verlaagt onnodige gewrichtsbelasting door de knie-enkel-heuplijn beter uit te lijnen en het bekken te stabiliseren.',
          "Typische winst:",
        ],
        bullets: [
          "Minder belasting aan de voorkant van de knie door zadelhoogte en schoenplaatjes te corrigeren",
          "Minder lage-rugspanning door reach, drop en bekkencontrole beter te balanceren",
          "Minder dove handen door betere gewichtsverdeling en remgreeppositie",
        ],
      },
      {
        title: "Betere krachtoverdracht zonder geforceerde houding",
        paragraphs: [
          "Comfort en prestaties zijn geen tegenpolen. Het doel is stabiliteit zodat je vermogen kunt leveren zonder te schuiven, te wiegen of spanning in de schouders op te bouwen.",
          "Als het bekken stabiel is en de voeten goed ondersteund zijn, wordt de pedaalslag gelijkmatiger en efficienter.",
        ],
      },
      {
        title: "Meer controle en vertrouwen",
        paragraphs: [
          "Sturen voelt beter zodra het zwaartepunt evenwichtiger tussen zadel en stuur ligt. Rijders merken dat vaak als eerste op:",
        ],
        bullets: [
          "Afdalingen met meer controle en minder nerveus stuurgedrag",
          "Ruwe ondergrond met minder stuiteren en meer stabiliteit",
          "Lange ritten met minder slingeren door vermoeidheid",
        ],
      },
      {
        title: "Een positie die past bij je terrein",
        paragraphs: [
          "Een goede fit is geen vaste setup voor alles. De positie moet veranderen met je rijstijl:",
        ],
        bullets: [
          "Mountainbike of technisch terrein: meer stabiliteit, minder agressieve drop, meer bewegingsruimte",
          "Endurance: comfort eerst, minder lumbale belasting, duurzame reach",
          "Prestatie of koers: aerodynamischer terwijl de heuphoek werkbaar blijft",
          "TT of triathlon: zeer aero, maar gevoelig voor zadelpositie, heuphoek en cockpitlengte",
        ],
      },
      {
        title: "Duidelijkheid door herhaalbare getallen",
        paragraphs: [
          "Veel rijders gokken hun setup. Een goede fit levert exacte waarden in millimeters en graden op zodat je:",
        ],
        bullets: [
          "Je positie opnieuw kunt opbouwen na onderhoud of reizen",
          "Die op een nieuw frame kunt reproduceren",
          "Kunt finetunen voor verschillende fietsen zoals race, gravel of indoor",
        ],
      },
    ],
    fitAdjustmentItems: [
      "Zadelhoogte (mm)",
      "Zadelterugstand (mm)",
      "Zadeltilt (graden)",
      "Stuurreach (mm)",
      "Stuurdrop (mm)",
      "Advies voor stuurpenlengte",
      "Advies voor cranklengte waar relevant",
      "Schoenplaatjespositie (voor-achter, hoek, stance width)",
      "Framemaatbereik op basis van stack en reach",
    ],
    fitMethodItems: [
      "LeMond als startpunt voor zadelhoogte op basis van binnenbeenlengte",
      "Holmes als controle op kniehoeken",
      "KOPS als referentiepunt voor knie- en pedaallijn, niet als vaste regel",
      "Stack en reach voor framekeuze en cockpitbalans",
    ],
    considerFitItems: [
      "Terugkerend ongemak na 60 tot 90 minuten",
      "Dove handen, brandende voeten of zadelongemak",
      "Kniepijn, heupspanning of rugvermoeidheid",
      "Je veranderde schoenen, schoenplaatjes, zadel, cranks of fiets",
      "Je traint meer of komt terug na een pauze",
      "Je wilt aerodynamischer zitten zonder comfort te verliezen",
    ],
  },
};

const framedSectionClass =
  "rounded-[2rem] border border-border/70 bg-card/95 p-8 shadow-sm sm:p-10";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getRequestLocale();
  const page = copy[locale];
  const alternates = buildLocaleAlternates("/why-bikefit-matters", locale);

  return {
    title: page.metadata.title,
    description: page.metadata.description,
    openGraph: {
      title: page.metadata.title,
      description: page.metadata.description,
      type: "website",
      url: alternates.canonical,
    },
    alternates,
  };
}

export default async function WhyBikeFitMattersPage() {
  const locale = await getRequestLocale();
  const page = copy[locale];
  const pagePath = withLocalePrefix("/why-bikefit-matters", locale);
  const quotes = HOME_QUOTES_BY_LOCALE[locale];

  return (
    <div className="bg-[linear-gradient(180deg,var(--background)_0%,color-mix(in_oklch,var(--secondary)_35%,var(--background)_65%)_100%)] py-16">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <section className="rounded-[2.25rem] border border-border/70 bg-card/95 px-6 py-10 shadow-sm sm:px-10 sm:py-12">
          <p className="text-sm font-semibold uppercase tracking-[0.28em] text-primary">
            {page.hero.eyebrow}
          </p>
          <h1 className="mt-4 text-4xl font-bold text-foreground sm:text-5xl">
            {page.hero.title}
          </h1>
          {page.hero.paragraphs.map((paragraph) => (
            <p key={paragraph} className="mt-5 text-lg leading-relaxed text-muted-foreground">
              {paragraph}
            </p>
          ))}
        </section>

        <section className="mt-14">
          <div className={framedSectionClass}>
            <h2 className="text-3xl font-semibold text-foreground">{page.quotesTitle}</h2>
            <p className="mt-4 text-muted-foreground">{page.quotesIntro}</p>
            <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {quotes.map((quote) => (
                <article
                  key={quote}
                  className="rounded-xl border border-border bg-card p-5 shadow-sm"
                >
                  <blockquote className="text-base font-bold italic leading-relaxed text-primary">
                    &ldquo;{quote}&rdquo;
                  </blockquote>
                </article>
              ))}
            </div>
            <p className="mt-6 text-muted-foreground">{page.quotesOutro}</p>
          </div>
        </section>

        <section className="mt-14">
          <div className={framedSectionClass}>
            <h2 className="text-3xl font-semibold text-foreground">{page.whyTitle}</h2>
            <p className="mt-4 text-muted-foreground">{page.whyIntro}</p>
            <ul className="mt-4 list-disc space-y-2 pl-5 text-muted-foreground">
              {page.contactPoints.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
            {page.whyParagraphs.map((paragraph) => (
              <p key={paragraph} className="mt-4 text-muted-foreground">
                {paragraph}
              </p>
            ))}
          </div>
        </section>

        <section className="mt-14">
          <div className={framedSectionClass}>
            <h2 className="text-3xl font-semibold text-foreground">{page.benefitsTitle}</h2>
            <div className="mt-6 space-y-8">
              {page.benefits.map((block, index) => (
                <article key={block.title} className="rounded-[1.75rem] border border-border/70 bg-muted/35 p-6 shadow-sm">
                  <h3 className="text-xl font-semibold text-foreground">
                    {index + 1}) {block.title}
                  </h3>
                  {block.paragraphs.map((paragraph) => (
                    <p key={paragraph} className="mt-3 text-muted-foreground">
                      {paragraph}
                    </p>
                  ))}
                  {block.bullets ? (
                    <ul className="mt-4 list-disc space-y-2 pl-5 text-muted-foreground">
                      {block.bullets.map((item) => (
                        <li key={item}>{item}</li>
                      ))}
                    </ul>
                  ) : null}
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="mt-14">
          <div className={framedSectionClass}>
            <h2 className="text-3xl font-semibold text-foreground">{page.adjustmentsTitle}</h2>
            <p className="mt-4 text-muted-foreground">{page.adjustmentsIntro}</p>
            <ul className="mt-4 list-disc space-y-2 pl-5 text-muted-foreground">
              {page.fitAdjustmentItems.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
            <p className="mt-6 text-muted-foreground">{page.methodsIntro}</p>
            <ul className="mt-4 list-disc space-y-2 pl-5 text-muted-foreground">
              {page.fitMethodItems.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
        </section>

        <section className="mt-14">
          <div className={framedSectionClass}>
            <h2 className="text-3xl font-semibold text-foreground">{page.considerTitle}</h2>
            <p className="mt-4 text-muted-foreground">{page.considerIntro}</p>
            <ul className="mt-4 list-disc space-y-2 pl-5 text-muted-foreground">
              {page.considerFitItems.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
        </section>
      </div>

      <section className="mt-16 py-16">
        <div className="mx-auto max-w-7xl px-4 text-center sm:px-6 lg:px-8">
          <div className="rounded-[2rem] bg-primary px-6 py-12 shadow-lg sm:px-10">
            <p className="text-sm font-semibold uppercase tracking-[0.28em] text-primary-foreground/70">
              {page.ctaEyebrow}
            </p>
            <h2 className="mt-3 text-3xl font-bold text-primary-foreground">
              {page.ctaTitle}
            </h2>
            <p className="mt-4 text-lg text-primary-foreground/80">{page.ctaBody}</p>
            <div className="mt-8">
              <Button
                render={
                  <TrackedCtaLink
                    href={withLocalePrefix("/login", locale)}
                    locale={locale}
                    pagePath={pagePath}
                    section="why_bikefit_matters_final_cta"
                    ctaLabel={page.ctaLabel}
                  />
                }
                size="lg"
                className="bg-background text-primary hover:bg-muted"
              >
                {page.ctaLabel}
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
