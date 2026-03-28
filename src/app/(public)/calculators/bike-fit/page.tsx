import type { Metadata } from "next";
import Link from "next/link";
import { Button, Input, Select } from "@/components/ui";
import { JsonLd } from "@/components/seo/JsonLd";
import { RelatedLinksSection } from "@/components/seo/RelatedLinksSection";
import { TrackedCtaLink } from "@/components/analytics/TrackedCtaLink";
import { BRAND } from "@/config/brand";
import { buildFaqPageSchema, buildHowToSchema, buildWebApplicationSchema } from "@/lib/seo/jsonLd";
import { getRelatedLinks } from "@/lib/seo/relatedLinks";
import { buildLocaleAlternates } from "@/i18n/metadata";
import { getRequestLocale } from "@/i18n/request";
import { withLocalePrefix } from "@/i18n/navigation";
import { mapCoreScore, mapFlexibilityScore, calculateBikeFit, calculateQuickEstimate } from "../../../../../convex/lib/fitAlgorithm";
import {
  AMBITION_OPTIONS,
  PUBLIC_BIKE_CATEGORY_OPTIONS,
  getFirstSearchParam,
  parseAmbition,
  parseBikeCategory,
  parsePositiveNumberParam,
  parseScore1to5,
  type SearchParamRecord,
} from "@/lib/publicCalculators";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getRequestLocale();
  const isNl = locale === "nl";

  return {
    title: isNl ? "Gratis bike fit calculator | BestBikeFit4U" : "Free Bike Fit Calculator | BestBikeFit4U",
    description: isNl
      ? "Bereken gratis zadelhoogte, reach, drop en framedoelen op basis van je lichaamsmaten en rijdoel."
      : "Calculate saddle height, reach, drop, and frame targets for free based on your body measurements and riding goal.",
    keywords: isNl
      ? ["bike fit calculator", "gratis bikefit", "online bikefitting"]
      : ["bike fit calculator", "free bike fit", "online bike fitting tool"],
    openGraph: {
      title: isNl ? "Gratis bike fit calculator" : "Free Bike Fit Calculator",
      description: isNl
        ? "Krijg direct een eerste bike fit advies op basis van jouw maten."
        : "Get an immediate first-pass bike-fit recommendation from your measurements.",
      type: "website",
    },
    alternates: buildLocaleAlternates("/calculators/bike-fit", locale),
  };
}

interface BikeFitCalculatorPageProps {
  searchParams: Promise<SearchParamRecord>;
}

function parseHeightParam(params: SearchParamRecord) {
  const value = parsePositiveNumberParam(params, "heightCm");
  if (value === null || value < 140 || value > 220) {
    return null;
  }
  return value;
}

function buildFaqs(isNl: boolean) {
  return isNl
    ? [
        {
          q: "Hoe nauwkeurig is deze gratis bike fit calculator?",
          a: "De calculator geeft een sterke eerste inschatting op basis van de productielogica uit de fit-engine. Voor een volledige analyse heb je in het dashboard meer context en vergelijking met je huidige setup.",
        },
        {
          q: "Welke waarde moet ik als eerste aanpassen?",
          a: "Begin meestal met zadelhoogte en algemene cockpitbalans. Daarna kun je reach, drop en framedoelen verfijnen.",
        },
      ]
    : [
        {
          q: "How accurate is this free bike-fit calculator?",
          a: "It provides a strong first-pass estimate based on the production fit-engine logic. The dashboard fit goes deeper with more context and comparison against your current setup.",
        },
        {
          q: "Which value should I adjust first?",
          a: "Start with saddle height and overall cockpit balance. Then refine reach, drop, and frame targets.",
        },
      ];
}

export default async function BikeFitCalculatorPage({
  searchParams,
}: BikeFitCalculatorPageProps) {
  const locale = await getRequestLocale();
  const isNl = locale === "nl";
  const params = await searchParams;
  const pagePath = withLocalePrefix("/calculators/bike-fit", locale);
  const pageUrl = new URL(pagePath, BRAND.siteUrl).toString();
  const submittedHeight = getFirstSearchParam(params, "heightCm");
  const submittedInseam = getFirstSearchParam(params, "inseamCm");
  const hasSubmitted = submittedHeight !== undefined || submittedInseam !== undefined;
  const heightCm = parseHeightParam(params);
  const inseamCm = parsePositiveNumberParam(params, "inseamCm");
  const category = parseBikeCategory(getFirstSearchParam(params, "category"));
  const ambition = parseAmbition(getFirstSearchParam(params, "ambition"));
  const flexibility = parseScore1to5(getFirstSearchParam(params, "flexibility"), 3);
  const core = parseScore1to5(getFirstSearchParam(params, "core"), 3);
  const faqs = buildFaqs(isNl);

  let error: string | null = null;
  let result:
    | {
        saddleHeightMm: number;
        reachMm: number;
        reachRange: { min: number; max: number };
        barDropMm: number;
        frameStackTargetMm: number;
        frameReachTargetMm: number;
        frameSize: string;
        notes: string[];
      }
    | null = null;

  if (hasSubmitted) {
    if (heightCm === null) {
      error = isNl
        ? "Voer een lengte in tussen 140 en 220 cm."
        : "Please enter height between 140 and 220 cm.";
    } else if (inseamCm === null || inseamCm < 55 || inseamCm > 105) {
      error = isNl
        ? "Voer een binnenbeenlengte in tussen 55 en 105 cm."
        : "Please enter inseam between 55 and 105 cm.";
    } else if (inseamCm >= heightCm) {
      error = isNl
        ? "Binnenbeenlengte kan niet gelijk aan of groter dan lengte zijn."
        : "Inseam cannot be equal to or greater than height.";
    } else {
      const fitResult = calculateBikeFit({
        category,
        ambition,
        heightMm: Math.round(heightCm * 10),
        inseamMm: Math.round(inseamCm * 10),
        flexibilityScore: mapFlexibilityScore(flexibility),
        coreScore: mapCoreScore(core),
      });
      const quickEstimate = calculateQuickEstimate({
        category,
        heightMm: Math.round(heightCm * 10),
        inseamMm: Math.round(inseamCm * 10),
      });
      const notes: string[] = [];

      if (flexibility <= 2) {
        notes.push(
          isNl
            ? "Lage flexibiliteit vraagt meestal om minder drop en een gematigde cockpitlengte."
            : "Lower flexibility usually calls for less bar drop and a more moderate cockpit length."
        );
      }
      if (core <= 2) {
        notes.push(
          isNl
            ? "Beperk agressieve reach en drop zolang core-stabiliteit nog in opbouw is."
            : "Avoid an aggressive reach/drop combination while core stability is still developing."
        );
      }
      if (ambition === "aero") {
        notes.push(
          isNl
            ? "Een aero-doel is alleen zinvol als je de houding ook onder vermoeidheid kunt vasthouden."
            : "An aero target is only valuable if you can sustain the posture under fatigue."
        );
      }
      notes.push(
        isNl
          ? "Gebruik dit als startpunt en vergelijk daarna met je huidige setup in het dashboard."
          : "Use this as a starting point, then compare it with your current setup inside the dashboard."
      );

      result = {
        saddleHeightMm: fitResult.saddleHeightMm,
        reachMm: fitResult.saddleToBarReachMm,
        reachRange: fitResult.reachRange,
        barDropMm: fitResult.barDropMm,
        frameStackTargetMm: fitResult.frameStackTargetMm,
        frameReachTargetMm: fitResult.frameReachTargetMm,
        frameSize: quickEstimate.estimatedFrameSize,
        notes,
      };
    }
  }

  return (
    <div className="py-16 text-foreground">
      <JsonLd
        schema={[
          buildWebApplicationSchema({
            name: isNl ? "BestBikeFit4U bike fit calculator" : "BestBikeFit4U Bike Fit Calculator",
            description: isNl
              ? "Gratis bike fit calculator voor zadelhoogte, reach, drop en framedoelen."
              : "Free bike-fit calculator for saddle height, reach, drop, and frame targets.",
            url: pageUrl,
          }),
          buildFaqPageSchema(faqs),
          buildHowToSchema({
            name: isNl ? "Hoe gebruik je de bike fit calculator" : "How to use the bike-fit calculator",
            description: isNl
              ? "Meet lengte en binnenbeenlengte, kies je rijdoel en beoordeel flexibiliteit en core."
              : "Measure height and inseam, choose your riding goal, and rate flexibility and core stability.",
            steps: isNl
              ? [
                  "Meet lengte en binnenbeenlengte zorgvuldig.",
                  "Kies je fietscategorie en rijdoel.",
                  "Vul flexibiliteit en core-stabiliteit in.",
                  "Gebruik de uitkomst als startpunt voor je setup.",
                ]
              : [
                  "Measure height and inseam carefully.",
                  "Choose your bike category and riding goal.",
                  "Enter flexibility and core stability.",
                  "Use the result as a starting point for your setup.",
                ],
          }),
        ]}
      />
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        <section className="rounded-[28px] border border-border bg-[color:color-mix(in_oklch,var(--card)_88%,var(--primary)_12%)] p-8 shadow-sm sm:p-10">
          <div className="max-w-3xl">
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-primary">
              BestBikeFit4U calculator
            </p>
            <h1 className="mt-4 text-4xl font-bold text-foreground sm:text-5xl">
              {isNl ? "Gratis bike fit calculator" : "Free Bike Fit Calculator"}
            </h1>
            <p className="mt-4 text-lg text-muted-foreground">
              {isNl
                ? "Bereken zadelhoogte, reach, drop en framedoelen op basis van je lichaamsmaten en rijdoel. Dit is dezelfde fit-logica als in de app, verpakt als snelle publieke intake."
                : "Calculate saddle height, reach, drop, and frame targets from your body measurements and riding goal. It uses the same fit logic as the app, packaged as a faster public intake."}
            </p>
          </div>
        </section>

        <section className="mt-10 grid gap-6 lg:grid-cols-[minmax(0,1fr)_300px]">
          <form className="rounded-3xl border border-border bg-card p-6 shadow-sm sm:p-8" method="GET">
            <div className="max-w-2xl">
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-primary">
                {isNl ? "Input" : "Inputs"}
              </p>
              <h2 className="mt-2 text-2xl font-semibold text-foreground">
                {isNl ? "Bouw je eerste fitprofiel" : "Build your first fit profile"}
              </h2>
              <p className="mt-2 text-sm text-muted-foreground">
                {isNl
                  ? "Vul je maten en rijcontext in. De uitkomst is bedoeld als sterk startpunt, niet als eindafstelling."
                  : "Enter your measurements and riding context. The result is designed as a strong starting point, not the final setup."}
              </p>
            </div>

            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <Input
                label={isNl ? "Lengte (cm)" : "Height (cm)"}
                id="bike-fit-height"
                name="heightCm"
                type="number"
                min={140}
                max={220}
                step="0.1"
                defaultValue={submittedHeight ?? ""}
                tooltip={
                  isNl
                    ? "Meet staand zonder schoenen van vloer tot bovenkant hoofd. Gebruik centimeters."
                    : "Measure standing barefoot from floor to top of head. Use centimeters."
                }
                required
              />
              <Input
                label={isNl ? "Binnenbeenlengte (cm)" : "Inseam (cm)"}
                id="bike-fit-inseam"
                name="inseamCm"
                type="number"
                min={55}
                max={105}
                step="0.1"
                defaultValue={submittedInseam ?? ""}
                tooltip={
                  isNl
                    ? "Meet blootsvoets met een boek stevig tussen de benen van vloer tot bovenzijde boek."
                    : "Measure barefoot with a book held firmly between the legs from floor to the top of the book."
                }
                required
              />
              <Select
                label={isNl ? "Fietscategorie" : "Bike Category"}
                id="bike-fit-category"
                name="category"
                defaultValue={category}
                tooltip={
                  isNl
                    ? "Kies de fietssoort die het best past bij je normale gebruik."
                    : "Choose the bike type that best matches your normal use."
                }
                options={PUBLIC_BIKE_CATEGORY_OPTIONS}
              />
              <Select
                label={isNl ? "Rijdoel" : "Riding Goal"}
                id="bike-fit-ambition"
                name="ambition"
                defaultValue={ambition}
                tooltip={
                  isNl
                    ? "Kies of je setup vooral comfort, balans, prestaties of aerodynamica moet ondersteunen."
                    : "Choose whether your setup should prioritize comfort, balance, performance, or aerodynamics."
                }
                options={AMBITION_OPTIONS}
              />
              <Input
                label={isNl ? "Flexibiliteit (1-5)" : "Flexibility (1-5)"}
                id="bike-fit-flexibility"
                name="flexibility"
                type="number"
                min={1}
                max={5}
                defaultValue={flexibility}
                tooltip={
                  isNl
                    ? "1 = erg stijf, 5 = zeer soepel."
                    : "1 = very stiff, 5 = very flexible."
                }
              />
              <Input
                label={isNl ? "Core-stabiliteit (1-5)" : "Core Stability (1-5)"}
                id="bike-fit-core"
                name="core"
                type="number"
                min={1}
                max={5}
                defaultValue={core}
                tooltip={
                  isNl
                    ? "1 = laag, 5 = sterk."
                    : "1 = low, 5 = strong."
                }
              />
            </div>

            <Button type="submit" className="mt-6">
              {isNl ? "Bereken bike fit" : "Calculate Bike Fit"}
            </Button>
          </form>

          <aside className="space-y-4">
            <div className="rounded-3xl border border-border bg-[color:var(--secondary)] p-6 shadow-sm">
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-primary">
                {isNl ? "Uitleg" : "Guidance"}
              </p>
              <ul className="mt-4 space-y-3 text-sm text-muted-foreground">
                {[
                  isNl
                    ? "Gebruik deze uitkomst om je setup te richten, niet om meteen grote sprongen te maken."
                    : "Use this result to steer your setup, not to make large jumps immediately.",
                  isNl
                    ? "Lagere flexibiliteit en core-stabiliteit beperken meestal hoeveel drop en reach duurzaam zijn."
                    : "Lower flexibility and core stability usually limit how much drop and reach are sustainable.",
                  isNl
                    ? "Vergelijk de uitkomst daarna met je huidige fiets in het dashboard."
                    : "Then compare the result against your current bike inside the dashboard.",
                ].map((point) => (
                  <li key={point} className="rounded-2xl border border-border/60 bg-card px-4 py-3">
                    {point}
                  </li>
                ))}
              </ul>
            </div>
          </aside>
        </section>

        {error ? (
          <div className="mt-6 rounded-lg border border-destructive/20 bg-destructive-soft px-4 py-3 text-sm text-destructive">
            {error}
          </div>
        ) : null}

        <section className="mt-6 rounded-3xl border border-border bg-card p-6 shadow-sm sm:p-8">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-primary">
            {isNl ? "Output" : "Output"}
          </p>
          <h2 className="mt-2 text-2xl font-semibold text-foreground">
            {isNl ? "Jouw eerste fitadvies" : "Your first-pass fit recommendation"}
          </h2>

          {result ? (
            <>
              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                <div className="rounded-2xl border border-primary/20 bg-primary-soft p-5">
                  <p className="text-sm text-muted-foreground">{isNl ? "Zadelhoogte" : "Saddle Height"}</p>
                  <p className="mt-2 text-3xl font-semibold text-foreground">{result.saddleHeightMm} mm</p>
                </div>
                <div className="rounded-2xl border border-border bg-[color:var(--secondary)] p-5">
                  <p className="text-sm text-muted-foreground">{isNl ? "Reach-doel" : "Reach Target"}</p>
                  <p className="mt-2 text-3xl font-semibold text-foreground">{result.reachMm} mm</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {isNl ? "Range" : "Range"}: {result.reachRange.min}-{result.reachRange.max} mm
                  </p>
                </div>
                <div className="rounded-2xl border border-border bg-[color:var(--secondary)] p-5">
                  <p className="text-sm text-muted-foreground">{isNl ? "Stuurdrop" : "Bar Drop"}</p>
                  <p className="mt-2 text-2xl font-semibold text-foreground">{result.barDropMm} mm</p>
                </div>
                <div className="rounded-2xl border border-border bg-[color:var(--secondary)] p-5">
                  <p className="text-sm text-muted-foreground">{isNl ? "Framedoelen" : "Frame Targets"}</p>
                  <p className="mt-2 text-base font-semibold text-foreground">
                    Stack {result.frameStackTargetMm} / Reach {result.frameReachTargetMm}
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {isNl ? "Snelle framemaatinschatting" : "Quick frame-size estimate"}: {result.frameSize}
                  </p>
                </div>
              </div>
              <div className="mt-6 rounded-2xl border border-border bg-[color:var(--secondary)] p-5">
                <h3 className="text-lg font-semibold text-foreground">
                  {isNl ? "Interpretatie" : "How to interpret this"}
                </h3>
                <ul className="mt-3 list-inside list-disc space-y-2 text-muted-foreground">
                  {result.notes.map((note) => (
                    <li key={note}>{note}</li>
                  ))}
                </ul>
              </div>
            </>
          ) : (
            <div className="mt-6 rounded-2xl border border-dashed border-border bg-[color:var(--secondary)] px-4 py-5 text-sm text-muted-foreground">
              {isNl
                ? "Vul je gegevens in om een eerste bike-fitadvies te genereren."
                : "Enter your details to generate a first-pass bike-fit recommendation."}
            </div>
          )}
        </section>

        <section className="mt-10 rounded-3xl border border-border bg-[color:color-mix(in_oklch,var(--card)_88%,var(--secondary)_12%)] p-6 shadow-sm sm:p-8">
          <h2 className="text-2xl font-semibold text-foreground">
            {isNl ? "Volgende stap" : "Next step"}
          </h2>
          <p className="mt-3 max-w-2xl text-muted-foreground">
            {isNl
              ? "Gebruik dit als vertrekpunt en verfijn daarna je setup, druk en huidige fietsgegevens in het dashboard."
              : "Use this as your starting point, then refine the setup, tire pressure, and current bike details inside the dashboard."}
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Button
              render={
                <TrackedCtaLink
                  href={withLocalePrefix("/login", locale)}
                  locale={locale}
                  pagePath={pagePath}
                  section="bike_fit_result"
                  ctaLabel={isNl ? "Ga verder in dashboard" : "Continue in Dashboard"}
                />
              }
            >
              {isNl ? "Ga verder in dashboard" : "Continue in Dashboard"}
            </Button>
            <Button
              render={<Link href={withLocalePrefix("/bandenspanning-calculator", locale)} />}
              variant="outline"
            >
              {isNl ? "Open bandenspanning calculator" : "Open Tire Pressure Calculator"}
            </Button>
          </div>
        </section>

        <section className="mt-10 rounded-2xl border border-border bg-card p-6">
          <h2 className="text-2xl font-semibold text-foreground">FAQ</h2>
          <div className="mt-4 space-y-4">
            {faqs.map((faq) => (
              <div key={faq.q}>
                <h3 className="font-semibold text-foreground">{faq.q}</h3>
                <p className="mt-1 text-muted-foreground">{faq.a}</p>
              </div>
            ))}
          </div>
        </section>

        <RelatedLinksSection
          title={isNl ? "Gerelateerde tools en gidsen" : "Related tools and guides"}
          links={getRelatedLinks("bike-fit", locale)}
          locale={locale}
        />
      </div>
    </div>
  );
}
