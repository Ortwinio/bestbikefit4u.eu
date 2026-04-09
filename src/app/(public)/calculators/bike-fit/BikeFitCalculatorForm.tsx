"use client";

import { useMemo, useState } from "react";
import { ShieldCheck } from "lucide-react";
import {
  PublicInfoPanel,
  PublicNumberField,
  PublicScaleField,
  PublicSelectField,
  PublicSurfaceCard,
} from "@/components/public";
import {
  calculateBikeFit,
  calculateQuickEstimate,
  mapCoreScore,
  mapFlexibilityScore,
} from "../../../../../convex/lib/fitAlgorithm";
import type { Ambition, BikeCategory } from "../../../../../convex/lib/fitAlgorithm/types";

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

interface Props {
  isNl: boolean;
}

export function BikeFitCalculatorForm({ isNl }: Props) {
  const [heightCm, setHeightCm] = useState<number | undefined>(undefined);
  const [inseamCm, setInseamCm] = useState<number | undefined>(undefined);
  const [category, setCategory] = useState<BikeCategory>("road");
  const [ambition, setAmbition] = useState<Ambition>("balanced");
  const [flexibility, setFlexibility] = useState("3");
  const [core, setCore] = useState("3");

  const result = useMemo(() => {
    if (!heightCm || !inseamCm) return null;
    if (heightCm < 140 || heightCm > 220) return null;
    if (inseamCm < 55 || inseamCm > 105) return null;
    if (inseamCm >= heightCm) return null;

    const flexScore = Number(flexibility) as 1 | 2 | 3 | 4 | 5;
    const coreScore = Number(core) as 1 | 2 | 3 | 4 | 5;

    const fitResult = calculateBikeFit({
      category,
      ambition,
      heightMm: Math.round(heightCm * 10),
      inseamMm: Math.round(inseamCm * 10),
      flexibilityScore: mapFlexibilityScore(flexScore),
      coreScore: mapCoreScore(coreScore),
    });
    const quickEstimate = calculateQuickEstimate({
      category,
      heightMm: Math.round(heightCm * 10),
      inseamMm: Math.round(inseamCm * 10),
    });

    const notes: string[] = [];
    if (flexScore <= 2) {
      notes.push(
        isNl
          ? "Lage flexibiliteit vraagt meestal om minder drop en een gematigde cockpitlengte."
          : "Lower flexibility usually calls for less bar drop and a more moderate cockpit length."
      );
    }
    if (coreScore <= 2) {
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

    return {
      saddleHeightMm: fitResult.saddleHeightMm,
      reachMm: fitResult.saddleToBarReachMm,
      reachRange: fitResult.reachRange,
      barDropMm: fitResult.barDropMm,
      frameStackTargetMm: fitResult.frameStackTargetMm,
      frameReachTargetMm: fitResult.frameReachTargetMm,
      frameSize: quickEstimate.estimatedFrameSize,
      notes,
    };
  }, [heightCm, inseamCm, category, ambition, flexibility, core, isNl]);

  const guidancePoints = isNl
    ? [
        "Gebruik deze uitkomst om je setup te richten, niet om meteen grote sprongen te maken.",
        "Lagere flexibiliteit en core-stabiliteit beperken meestal hoeveel drop en reach duurzaam zijn.",
        "Vergelijk de uitkomst daarna met je huidige fiets in het dashboard.",
      ]
    : [
        "Use this result to steer your setup, not to make large jumps immediately.",
        "Lower flexibility and core stability usually limit how much drop and reach are sustainable.",
        "Then compare the result against your current bike inside the dashboard.",
      ];

  return (
    <>
      <section className="mt-10 grid gap-6 lg:grid-cols-[minmax(0,1fr)_300px]">
        <PublicSurfaceCard
          title={isNl ? "Bouw je eerste fitprofiel" : "Build your first fit profile"}
          description={
            isNl
              ? "Vul je maten en rijcontext in. De uitkomst is bedoeld als sterk startpunt, niet als eindafstelling."
              : "Enter your measurements and riding context. The result is designed as a strong starting point, not the final setup."
          }
          className="public-calculator-card rounded-[1.75rem]"
        >
          <div className="space-y-6">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-primary">
              {isNl ? "Input" : "Inputs"}
            </p>
            <div className="grid gap-5 md:grid-cols-2">
              <PublicNumberField
                label={isNl ? "Lengte" : "Height"}
                description={
                  isNl
                    ? "Meet rechtop zonder schoenen."
                    : "Measure standing tall without shoes."
                }
                min={140}
                max={220}
                step={1}
                unit="cm"
                value={heightCm}
                onChange={setHeightCm}
                placeholder={isNl ? "Bijv. 178" : "e.g. 178"}
              />
              <PublicNumberField
                label={isNl ? "Binnenbeenlengte" : "Inseam"}
                description={
                  isNl
                    ? "Gebruik een boek tegen de wand voor een betrouwbare maat."
                    : "Use a book against the wall for a reliable measurement."
                }
                min={55}
                max={105}
                step={0.5}
                unit="cm"
                value={inseamCm}
                onChange={setInseamCm}
                placeholder={isNl ? "Bijv. 84.5" : "e.g. 84.5"}
              />
            </div>

            <div className="grid gap-5 md:grid-cols-2">
              <PublicSelectField
                label={isNl ? "Fietscategorie" : "Bike category"}
                description={
                  isNl
                    ? "Kies de discipline waarvoor je de positie wilt starten."
                    : "Choose the discipline you want to start the position for."
                }
                options={CATEGORY_OPTIONS}
                value={category}
                onChange={(value) => setCategory(value as BikeCategory)}
              />
              <PublicScaleField
                label={isNl ? "Rijdoel" : "Riding goal"}
                description={
                  isNl
                    ? "Dit bepaalt hoe progressief de cockpit mag worden."
                    : "This sets how progressive the cockpit can become."
                }
                options={AMBITION_OPTIONS}
                value={ambition}
                onChange={(value) => setAmbition(value as Ambition)}
              />
              <PublicScaleField
                label={isNl ? "Flexibiliteit" : "Flexibility"}
                description={
                  isNl
                    ? "Wees conservatief als je niet zeker bent."
                    : "Be conservative if you are unsure."
                }
                options={FLEXIBILITY_OPTIONS}
                value={flexibility}
                onChange={setFlexibility}
              />
              <PublicScaleField
                label={isNl ? "Core-stabiliteit" : "Core stability"}
                description={
                  isNl
                    ? "Dit helpt bepalen hoeveel reach en drop houdbaar zijn."
                    : "This helps determine how much reach and drop are sustainable."
                }
                options={CORE_OPTIONS}
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
              title={isNl ? "Waarom deze intake helpt" : "Why this intake helps"}
              icon={<ShieldCheck />}
            >
              {isNl
                ? "Deze publieke calculator gebruikt dezelfde fitlogica als het product, maar toont bewust een eerste veilige richting in plaats van een volledige eindafstelling."
                : "This public calculator uses the same fit logic as the product, but it intentionally exposes a safe first direction rather than a full final fit prescription."}
            </PublicInfoPanel>
            <PublicSurfaceCard
              title={isNl ? "Uitleg" : "Guidance"}
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
        title={isNl ? "Jouw eerste fitadvies" : "Your first-pass fit recommendation"}
        description={
          isNl
            ? "Controleer de uitkomst daarna altijd op je huidige fiets en bouw veranderingen stap voor stap op."
            : "Always validate the result on your current bike afterwards and build changes step by step."
        }
        className="public-calculator-card mt-6 rounded-[1.75rem]"
      >
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-primary">
          {isNl ? "Output" : "Output"}
        </p>

        {result ? (
          <>
            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <div className="public-calculator-result rounded-2xl border p-5">
                <p className="text-sm text-muted-foreground">
                  {isNl ? "Zadelhoogte" : "Saddle Height"}
                </p>
                <p className="mt-2 text-3xl font-semibold text-foreground">
                  {result.saddleHeightMm} mm
                </p>
              </div>
              <div className="public-calculator-card-subtle rounded-2xl border p-5">
                <p className="text-sm text-muted-foreground">
                  {isNl ? "Reach-doel" : "Reach Target"}
                </p>
                <p className="mt-2 text-3xl font-semibold text-foreground">{result.reachMm} mm</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {isNl ? "Range" : "Range"}: {result.reachRange.min}–{result.reachRange.max} mm
                </p>
              </div>
              <div className="public-calculator-card-subtle rounded-2xl border p-5">
                <p className="text-sm text-muted-foreground">
                  {isNl ? "Stuurdrop" : "Bar Drop"}
                </p>
                <p className="mt-2 text-2xl font-semibold text-foreground">{result.barDropMm} mm</p>
              </div>
              <div className="public-calculator-card-subtle rounded-2xl border p-5">
                <p className="text-sm text-muted-foreground">
                  {isNl ? "Framedoelen" : "Frame Targets"}
                </p>
                <p className="mt-2 text-base font-semibold text-foreground">
                  Stack {result.frameStackTargetMm} / Reach {result.frameReachTargetMm}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {isNl ? "Snelle framemaatinschatting" : "Quick frame-size estimate"}:{" "}
                  {result.frameSize}
                </p>
              </div>
            </div>
            <div className="public-calculator-card-subtle mt-6 rounded-2xl border p-5">
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
          <div className="public-calculator-card-subtle mt-6 rounded-2xl border border-dashed px-4 py-5 text-sm text-muted-foreground">
            {isNl
              ? "Vul lengte en binnenbeenlengte in om een eerste fit-startpunt te berekenen."
              : "Enter height and inseam to calculate a first-pass fit starting point."}
          </div>
        )}
      </PublicSurfaceCard>
    </>
  );
}
