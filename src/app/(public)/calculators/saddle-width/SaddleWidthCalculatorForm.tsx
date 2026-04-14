"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useMutation } from "convex/react";
import { ShieldCheck } from "lucide-react";
import { api } from "../../../../../convex/_generated/api";
import {
  PublicCalculatorResultSummary,
  PublicInfoPanel,
  PublicNumberField,
  PublicSelectField,
  PublicSurfaceCard,
} from "@/components/public";
import { Button } from "@/components/ui";
import {
  createPublicCalculatorRange,
  createPublicCalculatorResultEnvelope,
  getConfidenceLabel,
} from "@/lib/publicCalculatorLogic";
import {
  calculateSaddleWidth,
  classifySaddleSuitability,
  type SaddlePostureCategory,
  type SaddleRidingType,
} from "@/lib/saddle-width-engine";

const RIDING_TYPE_OPTIONS_EN = [
  { value: "road_race", label: "Road race" },
  { value: "endurance_road", label: "Endurance road" },
  { value: "gravel", label: "Gravel" },
  { value: "mtb", label: "MTB" },
  { value: "commuter_leisure", label: "Commuter / leisure" },
  { value: "tt_triathlon", label: "TT / triathlon" },
  { value: "indoor_only", label: "Indoor only" },
];

const RIDING_TYPE_OPTIONS_NL = [
  { value: "road_race", label: "Race" },
  { value: "endurance_road", label: "Endurance" },
  { value: "gravel", label: "Gravel" },
  { value: "mtb", label: "MTB" },
  { value: "commuter_leisure", label: "Woon-werk / recreatief" },
  { value: "tt_triathlon", label: "TT / triathlon" },
  { value: "indoor_only", label: "Alleen indoor" },
];

const POSTURE_OPTIONS_EN = [
  { value: "aggressive", label: "Aggressive" },
  { value: "balanced", label: "Balanced" },
  { value: "upright", label: "Upright" },
];

const POSTURE_OPTIONS_NL = [
  { value: "aggressive", label: "Agressief" },
  { value: "balanced", label: "Gebalanceerd" },
  { value: "upright", label: "Rechtop" },
];

function formatFamilyLabel(family: string, isNl: boolean) {
  switch (family) {
    case "short_nose_performance":
      return isNl ? "Performance / short-nose" : "Performance / short-nose";
    case "gravel_mtb_support":
      return isNl ? "Gravel / MTB support" : "Gravel / MTB support";
    case "comfort_upright":
      return isNl ? "Comfort / upright" : "Comfort / upright";
    default:
      return isNl ? "Endurance / all-road" : "Endurance / all-road";
  }
}

function formatExplanation(
  explanationKey: "measured_result" | "estimated_result",
  params: Record<string, string | number>,
  isNl: boolean
) {
  if (explanationKey === "measured_result") {
    return isNl
      ? `Je gemeten zitbeenbreedte van ${params.sbw} mm en je ${params.posture}-houding wijzen op ongeveer ${params.targetSupportWidth} mm achterste steun. Daarom is een ${params.primaryWidthClass}-zadel in het bereik ${params.rangeMin}-${params.rangeMax} mm een logisch eerste testvenster.`
      : `Your measured sit-bone width of ${params.sbw} mm and ${params.posture} posture point to about ${params.targetSupportWidth} mm of rear support. That makes a ${params.primaryWidthClass} saddle in the ${params.rangeMin}-${params.rangeMax} mm range a practical first test window.`;
  }

  return isNl
    ? `Op basis van lengte, gewicht en heupomtrek schatten we je zitbeenbreedte rond ${params.sbwEstMin}-${params.sbwEstMax} mm. Dat maakt een ${params.primaryWidthClass}-zadel in het bereik ${params.rangeMin}-${params.rangeMax} mm een bruikbaar startpunt, met lagere betrouwbaarheid dan een directe meting.`
    : `Based on your height, weight, and hip circumference, your sit-bone width is estimated around ${params.sbwEstMin}-${params.sbwEstMax} mm. That makes a ${params.primaryWidthClass} saddle in the ${params.rangeMin}-${params.rangeMax} mm range a useful starting point, with lower confidence than a direct measurement.`;
}

export function SaddleWidthCalculatorForm({ isNl = false }: { isNl?: boolean }) {
  const [inputMode, setInputMode] = useState<"measured" | "estimated">("measured");
  const [sitBoneWidthMm, setSitBoneWidthMm] = useState<number | undefined>(undefined);
  const [heightCm, setHeightCm] = useState<number | undefined>(undefined);
  const [weightKg, setWeightKg] = useState<number | undefined>(undefined);
  const [hipCircumferenceCm, setHipCircumferenceCm] = useState<number | undefined>(undefined);
  const [ridingType, setRidingType] = useState<SaddleRidingType>("endurance_road");
  const [postureCategory, setPostureCategory] = useState<SaddlePostureCategory>("balanced");
  const saveSession = useMutation(api.saddleWidth.mutations.createPublicSaddleWidthSession);
  const savedSignatureRef = useRef<string | null>(null);

  const ridingTypeOptions = isNl ? RIDING_TYPE_OPTIONS_NL : RIDING_TYPE_OPTIONS_EN;
  const postureOptions = isNl ? POSTURE_OPTIONS_NL : POSTURE_OPTIONS_EN;

  const result = useMemo(() => {
    try {
      const width = calculateSaddleWidth({
        inputMethod: inputMode,
        sitBoneWidthMm,
        heightCm,
        weightKg,
        hipCircumferenceCm,
        ridingType,
        postureCategory,
      });
      const suitability = classifySaddleSuitability(
        {
          inputMethod: inputMode,
          sitBoneWidthMm,
          heightCm,
          weightKg,
          hipCircumferenceCm,
          ridingType,
          postureCategory,
        },
        width
      );

      const summary = createPublicCalculatorResultEnvelope({
        calculatorKey: "saddle-width",
        recommended: {
          widthMm: width.finalRecommendedWidthMm,
          saddleFamily: suitability.saddleFamily,
        },
        range: createPublicCalculatorRange(
          width.widthRangeMinMm,
          width.widthRangeMaxMm,
          width.finalRecommendedWidthMm
        ),
        confidence: {
          score: width.confidenceScore,
          level: width.confidenceLevel,
          reasons: [],
        },
        primaryDrivers: [
          inputMode === "measured"
            ? isNl
              ? "Gemeten zitbeenbreedte"
              : "Measured sit-bone width"
            : isNl
              ? "Geschatte zitbeenbreedte uit lichaamsgegevens"
              : "Estimated sit-bone width from body data",
          isNl ? "Houding en rijtype" : "Posture and riding type",
        ],
        secondaryModifiers: [
          isNl
            ? "Zadelcategorie volgt uit houding, discipline en drukverdeling."
            : "Saddle family follows from posture, discipline, and pressure pattern.",
        ],
        notCovered: [
          isNl
            ? "Tilt, setback en individuele zadelmodellen."
            : "Tilt, setback, and specific saddle models.",
        ],
        nextAction: isNl
          ? "Gebruik dit om een shortlist te maken en test daarna rustig op de fiets."
          : "Use this to build a shortlist, then test conservatively on the bike.",
      });

      return { width, suitability, summary };
    } catch {
      return null;
    }
  }, [
    inputMode,
    sitBoneWidthMm,
    heightCm,
    weightKg,
    hipCircumferenceCm,
    ridingType,
    postureCategory,
    isNl,
  ]);

  useEffect(() => {
    if (!result) return;

    const signature = JSON.stringify({
      measurementMethod: inputMode,
      recommendedWidthMm: result.width.finalRecommendedWidthMm,
      widthRangeMinMm: result.width.widthRangeMinMm,
      widthRangeMaxMm: result.width.widthRangeMaxMm,
      primaryWidthClass: result.width.primaryWidthClass,
      saddleFamily: result.suitability.saddleFamily,
      noseType: result.suitability.noseType,
      profileShape: result.suitability.profileShape,
      cutoutRecommended: result.suitability.cutoutRecommended,
      paddingPreference: result.suitability.paddingPreference,
      confidenceScore: result.width.confidenceScore,
      confidenceLevel: result.width.confidenceLevel,
      explanationKey: result.width.explanationKey,
    });

    if (savedSignatureRef.current === signature) {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      savedSignatureRef.current = signature;

      void saveSession({
        measurementMethod: inputMode,
        sitBoneWidthMm,
        heightCm,
        weightKg,
        hipCircumferenceCm,
        ridingType,
        postureCategory,
        recommendedWidthMm: result.width.finalRecommendedWidthMm,
        widthRangeMinMm: result.width.widthRangeMinMm,
        widthRangeMaxMm: result.width.widthRangeMaxMm,
        primaryWidthClass: result.width.primaryWidthClass,
        saddleFamily: result.suitability.saddleFamily,
        noseType: result.suitability.noseType,
        profileShape: result.suitability.profileShape,
        cutoutRecommended: result.suitability.cutoutRecommended,
        paddingPreference: result.suitability.paddingPreference,
        confidenceScore: result.width.confidenceScore,
        confidenceLevel: result.width.confidenceLevel,
        explanationKey: result.width.explanationKey,
      });
    }, 400);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [
    result,
    saveSession,
    inputMode,
    sitBoneWidthMm,
    heightCm,
    weightKg,
    hipCircumferenceCm,
    ridingType,
    postureCategory,
  ]);

  const confidenceLabel = result
    ? getConfidenceLabel(result.width.confidenceLevel, isNl)
    : getConfidenceLabel(inputMode === "measured" ? "high" : "lower", isNl);

  return (
    <>
      <section className="mt-10 grid gap-6 lg:grid-cols-[minmax(0,1fr)_300px]">
        <PublicSurfaceCard
          title={isNl ? "Kies je invoerpad" : "Choose your input path"}
          description={
            isNl
              ? "Een directe zitbeenmeting is het sterkst. Zonder die meting kun je nog steeds een bruikbaar startpunt krijgen via lichaamsgegevens."
              : "A direct sit-bone measurement is strongest. Without it, body data still gives a useful starting point."
          }
          className="public-calculator-card rounded-[1.75rem]"
        >
          <div className="space-y-6">
            <div className="flex flex-wrap gap-3">
              <Button
                type="button"
                variant={inputMode === "measured" ? "primary" : "outline"}
                onClick={() => {
                  setInputMode("measured");
                  setHeightCm(undefined);
                  setWeightKg(undefined);
                  setHipCircumferenceCm(undefined);
                }}
              >
                {isNl ? "Ik ken mijn zitbeenbreedte" : "I know my sit-bone width"}
              </Button>
              <Button
                type="button"
                variant={inputMode === "estimated" ? "primary" : "outline"}
                onClick={() => {
                  setInputMode("estimated");
                  setSitBoneWidthMm(undefined);
                }}
              >
                {isNl ? "Ik heb deze meting niet" : "I don't have this measurement"}
              </Button>
            </div>

            <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-border/70 bg-card px-4 py-3">
              <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
                {confidenceLabel}
              </span>
              <p className="text-sm text-muted-foreground">
                {inputMode === "measured"
                  ? isNl
                    ? "De gemeten route geeft de sterkste basis voor een zadelbreedteadvies."
                    : "The measured path gives the strongest basis for a saddle-width recommendation."
                  : isNl
                    ? "De geschatte route blijft bruikbaar, maar is bewust minder zeker."
                    : "The estimated path remains useful, but with deliberately lower confidence."}
              </p>
            </div>

            {inputMode === "measured" ? (
              <>
                <PublicNumberField
                  label={isNl ? "Zitbeenbreedte" : "Sit-bone width"}
                  description={
                    isNl
                      ? "Meet hart-op-hart tussen de twee diepste afdrukken."
                      : "Measure center-to-center between the two deepest indentations."
                  }
                  min={60}
                  max={200}
                  step={1}
                  unit="mm"
                  value={sitBoneWidthMm}
                  onChange={setSitBoneWidthMm}
                  placeholder={isNl ? "Bijv. 130" : "e.g. 130"}
                />
                <details className="rounded-2xl border border-border/70 bg-card px-4 py-3 text-sm text-muted-foreground">
                  <summary className="cursor-pointer font-semibold text-foreground">
                    {isNl ? "Hoe meet ik dit thuis?" : "How do I measure this at home?"}
                  </summary>
                  <ol className="mt-3 space-y-2 list-decimal pl-5">
                    <li>
                      {isNl
                        ? "Leg golfkarton of folie op een harde stoel."
                        : "Place corrugated cardboard or foil on a hard chair."}
                    </li>
                    <li>
                      {isNl
                        ? "Ga normaal zitten voor ongeveer 30 seconden."
                        : "Sit normally for about 30 seconds."}
                    </li>
                    <li>
                      {isNl
                        ? "Meet de hart-op-hart afstand tussen de twee diepste afdrukken."
                        : "Measure the center-to-center distance between the two deepest impressions."}
                    </li>
                  </ol>
                </details>
              </>
            ) : (
              <div className="grid gap-5 md:grid-cols-3">
                <PublicNumberField
                  label={isNl ? "Lengte" : "Height"}
                  description={isNl ? "Zonder schoenen." : "Without shoes."}
                  min={140}
                  max={220}
                  step={1}
                  unit="cm"
                  value={heightCm}
                  onChange={setHeightCm}
                />
                <PublicNumberField
                  label={isNl ? "Gewicht" : "Weight"}
                  description={isNl ? "Rijklaar lichaamsgewicht." : "Your current body weight."}
                  min={40}
                  max={150}
                  step={1}
                  unit="kg"
                  value={weightKg}
                  onChange={setWeightKg}
                />
                <PublicNumberField
                  label={isNl ? "Heupomtrek" : "Hip circumference"}
                  description={
                    isNl
                      ? "Meet rondom het breedste deel van de heupen."
                      : "Measure around the widest part of the hips."
                  }
                  min={70}
                  max={160}
                  step={1}
                  unit="cm"
                  value={hipCircumferenceCm}
                  onChange={setHipCircumferenceCm}
                />
              </div>
            )}

            <div className="grid gap-5 md:grid-cols-2">
              <PublicSelectField
                label={isNl ? "Rijtype" : "Riding type"}
                value={ridingType}
                onChange={(value) => setRidingType(value as SaddleRidingType)}
                options={ridingTypeOptions}
                description={
                  isNl
                    ? "Dit bepaalt hoeveel ondersteuning logisch is voor jouw discipline."
                    : "This changes how much support makes sense for your discipline."
                }
              />
              <PublicSelectField
                label={isNl ? "Houding" : "Posture"}
                value={postureCategory}
                onChange={(value) => setPostureCategory(value as SaddlePostureCategory)}
                options={postureOptions}
                description={
                  isNl
                    ? "Meer rechtop vraagt meestal meer achterste steun."
                    : "More upright posture usually needs more rear support."
                }
              />
            </div>
          </div>
        </PublicSurfaceCard>

        <aside>
          <div className="space-y-4">
            <PublicInfoPanel
              tone="secondary"
              title={isNl ? "Wat je hieruit haalt" : "What you get from this"}
              icon={<ShieldCheck />}
            >
              {isNl
                ? "Geen schijnprecies nummer, maar een realistisch testbereik inclusief zadelcategorie."
                : "Not a fake-precise number, but a realistic test range with a saddle-family suggestion."}
            </PublicInfoPanel>
            <PublicSurfaceCard
              title={isNl ? "Waar je op let" : "What to watch for"}
              compact
              className="public-calculator-card-subtle rounded-[1.5rem]"
            >
              <ul className="space-y-3 text-sm text-muted-foreground">
                {[ 
                  isNl
                    ? "Gebruik gemeten zitbeenbreedte wanneer mogelijk."
                    : "Use measured sit-bone width when possible.",
                  isNl
                    ? "Gebruik de uitkomst om 2-3 zadels te shortlistten."
                    : "Use the result to shortlist 2-3 saddles.",
                  isNl
                    ? "Controleer daarna tilt en setback op de fiets."
                    : "Then validate tilt and setback on the bike.",
                ].map((point) => (
                  <li key={point} className="rounded-2xl border border-border/60 bg-card px-4 py-3">
                    {point}
                  </li>
                ))}
              </ul>
            </PublicSurfaceCard>
          </div>
        </aside>
      </section>

      <PublicSurfaceCard
        title={isNl ? "Jouw zadelbreedte-startpunt" : "Your saddle-width starting point"}
        description={
          isNl
            ? "Gebruik dit als shortlist, niet als definitief eindantwoord."
            : "Use this as a shortlist, not the final answer."
        }
        className="public-calculator-card mt-6 rounded-[1.75rem]"
      >
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-primary">
          {isNl ? "Uitkomst" : "Output"}
        </p>

        {result ? (
          <>
            <div className="mt-6 grid gap-4 md:grid-cols-3">
              <div className="public-calculator-result rounded-2xl border p-5">
                <p className="text-sm text-muted-foreground">
                  {isNl ? "Doelbreedte" : "Target width"}
                </p>
                <p className="mt-2 text-3xl font-semibold text-foreground">
                  {result.width.finalRecommendedWidthMm} mm
                </p>
              </div>
              <div className="public-calculator-card-subtle rounded-2xl border p-5">
                <p className="text-sm text-muted-foreground">
                  {isNl ? "Aanbevolen bereik" : "Recommended range"}
                </p>
                <p className="mt-2 text-2xl font-semibold text-foreground">
                  {result.width.widthRangeMinMm}-{result.width.widthRangeMaxMm} mm
                </p>
              </div>
              <div className="public-calculator-card-subtle rounded-2xl border p-5">
                <p className="text-sm text-muted-foreground">
                  {isNl ? "Zadelcategorie" : "Saddle family"}
                </p>
                <p className="mt-2 text-lg font-semibold text-foreground">
                  {formatFamilyLabel(result.suitability.saddleFamily, isNl)}
                </p>
                <p className="mt-1 text-sm text-muted-foreground">
                  {isNl ? "Klasse" : "Class"}: {result.width.primaryWidthClass}
                </p>
              </div>
            </div>

            <div className="mt-4 rounded-2xl border border-border/70 bg-card px-5 py-4">
              <div className="flex flex-wrap items-center gap-3">
                <ShieldCheck className="h-4 w-4 text-primary" />
                <p className="text-sm font-semibold text-foreground">
                  {isNl ? "Waarom dit bereik" : "Why this range"}
                </p>
              </div>
              <p className="mt-2 text-sm text-muted-foreground">
                {formatExplanation(
                  result.width.explanationKey,
                  result.width.explanationParams,
                  isNl
                )}
              </p>
            </div>

            <PublicCalculatorResultSummary
              result={result.summary}
              isNl={isNl}
              extraNotes={result.suitability.shapeFlags}
            />
          </>
        ) : (
          <div className="public-calculator-card-subtle mt-6 rounded-2xl border border-dashed px-4 py-5 text-sm text-muted-foreground">
            {isNl
              ? "Vul je metingen en rijprofiel in om een zadelbreedtebereik te berekenen."
              : "Enter your measurements and riding profile to calculate a saddle-width range."}
          </div>
        )}
      </PublicSurfaceCard>
    </>
  );
}
