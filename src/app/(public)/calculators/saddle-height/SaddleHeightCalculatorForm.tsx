"use client";

import { useMemo, useState } from "react";
import { ShieldCheck } from "lucide-react";
import {
  PublicInfoPanel,
  PublicNumberField,
  PublicSelectField,
  PublicSurfaceCard,
} from "@/components/public";
import { mapCoreScore, mapFlexibilityScore } from "../../../../../convex/lib/fitAlgorithm";
import { calculateSaddleHeight } from "../../../../../convex/lib/fitAlgorithm/calculations";
import type { Ambition, BikeCategory, CalculationContext } from "../../../../../convex/lib/fitAlgorithm/types";

const CATEGORY_OPTIONS = [
  { value: "road", label: "Road" },
  { value: "gravel", label: "Gravel" },
  { value: "mtb", label: "Mountain" },
  { value: "city", label: "City" },
];

const AMBITION_OPTIONS = [
  { value: "comfort", label: "Comfort" },
  { value: "balanced", label: "Balanced" },
  { value: "performance", label: "Performance" },
  { value: "aero", label: "Aero" },
];

const FLEXIBILITY_OPTIONS = [
  { value: "1", label: "Very Limited" },
  { value: "2", label: "Limited" },
  { value: "3", label: "Average" },
  { value: "4", label: "Good" },
  { value: "5", label: "Excellent" },
];

const CORE_OPTIONS = [
  { value: "1", label: "Very Low" },
  { value: "2", label: "Low" },
  { value: "3", label: "Average" },
  { value: "4", label: "Good" },
  { value: "5", label: "Excellent" },
];

const GUIDANCE_POINTS = [
  "Use a careful barefoot inseam measurement rather than trouser size.",
  "Treat the result as a starting point, then validate it over a few rides.",
  "Flexibility and core stability matter because they change how sustainable the position feels.",
];

export function SaddleHeightCalculatorForm({ isNl = false }: { isNl?: boolean }) {
  const [inseamCm, setInseamCm] = useState<number | undefined>(undefined);
  const [category, setCategory] = useState<BikeCategory>("road");
  const [ambition, setAmbition] = useState<Ambition>("balanced");
  const [flexibility, setFlexibility] = useState("3");
  const [core, setCore] = useState("3");
  const categoryOptions = isNl
    ? [
        { value: "road", label: "Race" },
        { value: "gravel", label: "Gravel" },
        { value: "mtb", label: "Mountainbike" },
        { value: "city", label: "Stadsfiets" },
      ]
    : CATEGORY_OPTIONS;
  const ambitionOptions = isNl
    ? [
        { value: "comfort", label: "Comfort" },
        { value: "balanced", label: "Balans" },
        { value: "performance", label: "Prestatie" },
        { value: "aero", label: "Aero" },
      ]
    : AMBITION_OPTIONS;
  const flexibilityOptions = isNl
    ? [
        { value: "1", label: "Zeer beperkt" },
        { value: "2", label: "Beperkt" },
        { value: "3", label: "Gemiddeld" },
        { value: "4", label: "Goed" },
        { value: "5", label: "Uitstekend" },
      ]
    : FLEXIBILITY_OPTIONS;
  const coreOptions = isNl
    ? [
        { value: "1", label: "Zeer laag" },
        { value: "2", label: "Laag" },
        { value: "3", label: "Gemiddeld" },
        { value: "4", label: "Goed" },
        { value: "5", label: "Uitstekend" },
      ]
    : CORE_OPTIONS;
  const guidancePoints = isNl
    ? [
        "Gebruik een zorgvuldige binnenbeenmeting op blote voeten in plaats van je broekmaat.",
        "Zie de uitkomst als startpunt en controleer die daarna in een paar ritten.",
        "Flexibiliteit en core-stabiliteit tellen mee omdat ze bepalen hoe houdbaar de positie aanvoelt.",
      ]
    : GUIDANCE_POINTS;

  const recommendation = useMemo(() => {
    if (!inseamCm || inseamCm < 55 || inseamCm > 105) return null;

    const flexScore = Number(flexibility) as 1 | 2 | 3 | 4 | 5;
    const coreScore = Number(core) as 1 | 2 | 3 | 4 | 5;
    const inseamMm = Math.round(inseamCm * 10);
    const mappedFlex = mapFlexibilityScore(flexScore);
    const mappedCore = mapCoreScore(coreScore);

    const ctx: CalculationContext = {
      inputs: {
        category,
        ambition,
        heightMm: 1750,
        inseamMm,
        flexibilityScore: mappedFlex,
        coreScore: mappedCore,
      },
      flexIndex: mappedFlex - 5,
      coreIndex: mappedCore - 5,
    };

    const result = calculateSaddleHeight(ctx);
    return {
      saddleHeightMm: result.height,
      minMm: result.range.min,
      maxMm: result.range.max,
    };
  }, [inseamCm, category, ambition, flexibility, core]);

  return (
    <>
      <section className="mt-10 grid gap-6 lg:grid-cols-[minmax(0,1fr)_300px]">
        <PublicSurfaceCard
          title={isNl ? "Bouw je startpunt" : "Build your starting point"}
          description={
            isNl
              ? "Binnenbeenlengte zet de basis. Categorie, rijdoel, flexibiliteit en core helpen om dat startpunt verder te verfijnen."
              : "Inseam sets the baseline. Category, ambition, flexibility, and core help refine how progressive the starting point can be."
          }
          className="rounded-[1.75rem]"
        >
          <div className="space-y-6">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-primary">
              {isNl ? "Invoer" : "Inputs"}
            </p>
            <PublicNumberField
              label={isNl ? "Binnenbeenlengte" : "Inseam"}
              description={
                isNl
                  ? "Meet op blote voeten met een boek tegen de muur."
                  : "Measure barefoot with a book firmly against the wall."
              }
              min={55}
              max={105}
              step={0.5}
              unit="cm"
              value={inseamCm}
              onChange={setInseamCm}
              placeholder={isNl ? "Bijv. 84.5" : "e.g. 84.5"}
            />
            <div className="grid gap-5 md:grid-cols-2">
              <PublicSelectField
                label={isNl ? "Fietscategorie" : "Bike category"}
                description={
                  isNl
                    ? "Kies de discipline waarvoor je het zadel startpunt wilt bepalen."
                    : "Choose the discipline you want the saddle starting point for."
                }
                options={categoryOptions}
                value={category}
                onChange={(value) => setCategory(value as BikeCategory)}
              />
              <PublicSelectField
                label={isNl ? "Rijdoel" : "Riding goal"}
                description={
                  isNl
                    ? "Dit bepaalt of het startpunt rustiger of progressiever mag zijn."
                    : "This sets whether the starting point should stay calmer or more progressive."
                }
                options={ambitionOptions}
                value={ambition}
                onChange={(value) => setAmbition(value as Ambition)}
              />
              <PublicSelectField
                label={isNl ? "Flexibiliteit" : "Flexibility"}
                options={flexibilityOptions}
                value={flexibility}
                onChange={setFlexibility}
              />
              <PublicSelectField
                label={isNl ? "Core-stabiliteit" : "Core stability"}
                options={coreOptions}
                value={core}
                onChange={setCore}
              />
            </div>
          </div>
        </PublicSurfaceCard>

        <aside>
          <div className="space-y-4">
            <PublicInfoPanel
              tone="secondary"
              title={isNl ? "Waarom dit conservatief blijft" : "Why this stays conservative"}
              icon={<ShieldCheck />}
            >
              {isNl
                ? "De publieke zadelhoogtecalculator geeft bewust een veilige basiszone. Zo verklein je de kans op te grote aanpassingen voordat je op de fiets hebt gevalideerd."
                : "The public saddle-height calculator intentionally gives a safe baseline band. That reduces the risk of making large changes before you validate on the bike."}
            </PublicInfoPanel>
            <PublicSurfaceCard
              title={isNl ? "Richtlijnen" : "Guidance"}
              compact
              className="rounded-[1.5rem]"
            >
              <ul className="space-y-3 text-sm text-muted-foreground">
                {guidancePoints.map((point) => (
                  <li
                    key={point}
                    className="rounded-2xl border border-border/60 bg-card px-4 py-3"
                  >
                    {point}
                  </li>
                ))}
              </ul>
            </PublicSurfaceCard>
          </div>
        </aside>
      </section>

      <PublicSurfaceCard
        title={isNl ? "Jouw basislijn" : "Your baseline"}
        description={
          isNl
            ? "Gebruik dit als veilig startpunt, niet als definitief eindwoord."
            : "Use this as a safe starting point, not as the final word."
        }
        className="mt-6 rounded-[1.75rem]"
      >
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-primary">
          {isNl ? "Uitkomst" : "Output"}
        </p>

        {recommendation ? (
          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <div className="rounded-2xl border border-primary/20 bg-primary-soft p-5">
              <p className="text-sm text-muted-foreground">
                {isNl ? "Aanbevolen zadelhoogte" : "Recommended saddle height"}
              </p>
              <p className="mt-2 text-3xl font-semibold text-foreground">
                {recommendation.saddleHeightMm} mm
              </p>
            </div>
            <div className="rounded-2xl border border-border bg-[color:var(--secondary)] p-5">
              <p className="text-sm text-muted-foreground">
                {isNl ? "Veilige startzone" : "Safe starting band"}
              </p>
              <p className="mt-2 text-2xl font-semibold text-foreground">
                {recommendation.minMm}–{recommendation.maxMm} mm
              </p>
            </div>
          </div>
        ) : (
          <div className="mt-6 rounded-2xl border border-dashed border-border bg-[color:var(--secondary)] px-4 py-5 text-sm text-muted-foreground">
            {isNl
              ? "Vul je binnenbeenlengte in om een eerste zadelhoogte-startpunt te berekenen."
              : "Enter your inseam to generate a first-pass saddle-height starting point."}
          </div>
        )}
      </PublicSurfaceCard>
    </>
  );
}
