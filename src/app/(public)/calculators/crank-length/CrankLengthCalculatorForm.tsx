"use client";

import { useMemo, useState } from "react";
import { ShieldCheck } from "lucide-react";
import {
  PublicCalculatorResultSummary,
  PublicInfoPanel,
  PublicNumberField,
  PublicSelectField,
  PublicSurfaceCard,
} from "@/components/public";
import {
  createPublicCalculatorResultEnvelope,
  createPublicFitBaseline,
  derivePublicCalculatorConfidence,
  getConfidenceLabel,
  PUBLIC_FIT_REQUIREMENTS,
  validateCrankLengthRecommendation,
  validatePublicFitBaseline,
} from "@/lib/publicCalculatorLogic";
import { runCrankLengthCalculation } from "@/lib/public-calculators/fitAdapters";
import type { BikeCategory } from "../../../../../convex/lib/fitAlgorithm/types";

type CrankLengthCalculatorFormProps = {
  isNl: boolean;
  initialInseamCm?: number;
  initialCategory: BikeCategory;
};

const CATEGORY_OPTIONS = [
  { value: "road", label: "Road" },
  { value: "gravel", label: "Gravel" },
  { value: "mtb", label: "Mountain" },
  { value: "city", label: "City" },
];

const GUIDANCE_POINTS = [
  "Crank length should match inseam, bike category, and posture demands.",
  "Shorter is not automatically better. The right choice balances clearance, comfort, and pedaling feel.",
  "Use this together with saddle height and full fit targets rather than in isolation.",
];

export function CrankLengthCalculatorForm({
  isNl,
  initialInseamCm,
  initialCategory,
}: CrankLengthCalculatorFormProps) {
  const [inseamCm, setInseamCm] = useState<number | undefined>(initialInseamCm);
  const [category, setCategory] = useState<BikeCategory>(initialCategory);

  const categoryOptions = isNl
    ? [
        { value: "road", label: "Race" },
        { value: "gravel", label: "Gravel" },
        { value: "mtb", label: "Mountainbike" },
        { value: "city", label: "Stadsfiets" },
      ]
    : CATEGORY_OPTIONS;

  const guidancePoints = isNl
    ? [
        "Cranklengte moet passen bij binnenbeenlengte, fietsdiscipline en houdingsdoelen.",
        "Korter is niet automatisch beter. De juiste keuze balanceert ruimte, comfort en trapgevoel.",
        "Gebruik dit samen met zadelhoogte en volledige fit-doelen, niet los daarvan.",
      ]
    : GUIDANCE_POINTS;

  const baseline = useMemo(
    () =>
      createPublicFitBaseline({
        inseamCm,
        bikeCategory: category,
      }),
    [inseamCm, category]
  );

  const baselineIssues = useMemo(
    () => validatePublicFitBaseline(baseline, PUBLIC_FIT_REQUIREMENTS.crankLength),
    [baseline]
  );
  const baselineConfidence = useMemo(
    () =>
      derivePublicCalculatorConfidence({
        baseline,
        issues: baselineIssues,
        requirements: PUBLIC_FIT_REQUIREMENTS.crankLength,
      }),
    [baseline, baselineIssues]
  );

  const result = useMemo(() => {
    if (!inseamCm) return null;
    if (baselineIssues.some((issue) => issue.severity === "error")) return null;

    const crankLengthMm = runCrankLengthCalculation({
      inseamCm,
      category,
      inseamSource: baseline.inseamSource,
    });
    const outputIssues = [
      ...baselineIssues,
      ...validateCrankLengthRecommendation(category, crankLengthMm, isNl),
    ];
    const resultModel = createPublicCalculatorResultEnvelope({
      calculatorKey: "crank-length",
      recommended: {
        label: isNl ? "Aanbevolen cranklengte" : "Recommended crank length",
        value: crankLengthMm,
        unit: "mm",
      },
      confidence: baselineConfidence,
      primaryDrivers: [isNl ? "Binnenbeenlengte" : "Inseam"],
      secondaryModifiers: [
        isNl
          ? "De categorie beïnvloedt hoe conservatief de componentkeuze moet blijven."
          : "Bike category changes how conservative the component choice should stay.",
      ],
      notCovered: [
        isNl
          ? "Heupcompressie, pedaalgevoel en zadelhoogte."
          : "Hip compression, pedaling feel, and saddle height.",
      ],
      nextAction: isNl
        ? "Controleer daarna of zadelhoogte en kniehoek nog logisch blijven."
        : "Then recheck whether saddle height and knee angle still make sense.",
      issues: outputIssues,
    });

    return {
      crankLengthMm,
      resultModel,
    };
  }, [category, inseamCm, baselineIssues, baselineConfidence, isNl, baseline.inseamSource]);

  const error =
    baselineIssues.find((issue) => issue.severity === "error")?.message ??
    (inseamCm !== undefined && (inseamCm < 55 || inseamCm > 105)
      ? isNl
        ? "Voer een binnenbeenlengte tussen 55 en 105 cm in."
        : "Please enter inseam between 55 and 105 cm."
      : null);

  const confidenceLabel = useMemo(
    () => getConfidenceLabel(baselineConfidence.level, isNl),
    [baselineConfidence.level, isNl]
  );

  return (
    <>
      <section className="mt-10 grid gap-6 lg:grid-cols-[minmax(0,1fr)_300px]">
        <PublicSurfaceCard
          title={isNl ? "Maak je startpunt" : "Generate a baseline"}
          description={
            isNl
              ? "Binnenbeenlengte en discipline zijn genoeg voor een bruikbaar eerste cranklengte-advies."
              : "Inseam and bike category are enough for a practical first-pass crank-length recommendation."
          }
          className="public-calculator-card rounded-[1.75rem]"
        >
          <div className="space-y-6">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-primary">
              {isNl ? "Invoer" : "Inputs"}
            </p>
            <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-border/70 bg-card px-4 py-3">
              <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
                {confidenceLabel}
              </span>
              <p className="text-sm text-muted-foreground">
                {baselineConfidence.level === "high"
                  ? isNl
                    ? "Een gemeten binnenbeenlengte maakt deze componentkeuze betrouwbaarder."
                    : "A measured inseam makes this component recommendation more reliable."
                  : isNl
                    ? "De betrouwbaarheid stijgt wanneer je nauwkeurig meet."
                    : "Confidence increases when your inseam is measured precisely."}
              </p>
            </div>

            <div className="grid gap-5 md:grid-cols-2">
              <PublicNumberField
                label={isNl ? "Binnenbeenlengte" : "Inseam"}
                description={
                  isNl
                    ? "Meet vanaf de vloer tot de bovenkant van een boek dat stevig tussen de benen wordt gehouden."
                    : "Measure from the floor to the top of a book held firmly between the legs."
                }
                min={55}
                max={105}
                step={0.1}
                unit="cm"
                value={inseamCm}
                onChange={setInseamCm}
                placeholder={isNl ? "Bijv. 84.5" : "e.g. 84.5"}
              />
              <PublicSelectField
                label={isNl ? "Fietsdiscipline" : "Bike category"}
                description={
                  isNl
                    ? "Kies de discipline die past bij je fiets en gebruik."
                    : "Choose the category that matches your bike and intended use."
                }
                options={categoryOptions}
                value={category}
                onChange={(value) => setCategory(value as BikeCategory)}
              />
            </div>

            {error ? (
              <div className="rounded-2xl border border-destructive/20 bg-destructive-soft px-4 py-3 text-sm text-destructive">
                {error}
              </div>
            ) : null}
            {!error && baselineIssues.length > 0 ? (
              <div className="rounded-2xl border border-amber-500/25 bg-amber-500/10 px-4 py-3 text-sm text-amber-700 dark:text-amber-300">
                <ul className="space-y-1">
                  {baselineIssues.map((issue) => (
                    <li key={`${issue.code}-${issue.field}-${issue.message}`}>{issue.message}</li>
                  ))}
                </ul>
              </div>
            ) : null}
          </div>
        </PublicSurfaceCard>

        <aside>
          <div className="space-y-4">
            <PublicInfoPanel
              tone="secondary"
              title={isNl ? "Wat dit advies wel en niet doet" : "What this guidance does and does not tell you"}
              icon={<ShieldCheck />}
            >
              {isNl
                ? "Deze uitkomst helpt je om onlogische crankopties weg te strepen. Zadelhoogte, houding en gebruiksdoel bepalen daarna of een verandering echt zinvol is."
                : "This result helps you rule out unrealistic crank options. Saddle height, posture, and intended use still determine whether a change is actually worth making."}
            </PublicInfoPanel>
            <PublicSurfaceCard
              title={isNl ? "Richtlijnen" : "Guidance"}
              compact
              className="public-calculator-card-subtle rounded-[1.5rem]"
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
        title={isNl ? "Componentadvies" : "Component recommendation"}
        description={
          isNl
            ? "Gebruik dit als praktisch startpunt voordat je onderdelen wisselt."
            : "Use this as a practical starting point before you change components."
        }
        className="public-calculator-card mt-6 rounded-[1.75rem]"
      >
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-primary">
          {isNl ? "Uitkomst" : "Output"}
        </p>

        {result !== null ? (
          <>
            <div className="public-calculator-result mt-6 rounded-2xl border p-5">
              <p className="text-sm text-muted-foreground">
                {isNl ? "Aanbevolen cranklengte" : "Recommended crank length"}
              </p>
              <p className="mt-2 text-3xl font-semibold text-foreground">
                {result.crankLengthMm} mm
              </p>
            </div>
            <PublicCalculatorResultSummary
              result={result.resultModel}
              isNl={isNl}
            />
          </>
        ) : (
          <div className="public-calculator-card-subtle mt-6 rounded-2xl border border-dashed px-4 py-5 text-sm text-muted-foreground">
            {isNl
              ? "Vul je gegevens in om een eerste cranklengte-aanbeveling te genereren."
              : "Enter your details to generate a first-pass crank-length recommendation."}
          </div>
        )}
      </PublicSurfaceCard>
    </>
  );
}
