"use client";

import { useState, useMemo } from "react";
import { NumberSlider } from "@/components/measurements/NumberSlider";
import { SliderQuestion } from "@/components/profile/RidingStyleCard";
import {
  calculateBikeFit,
  calculateQuickEstimate,
  mapCoreScore,
  mapFlexibilityScore,
} from "../../../../../convex/lib/fitAlgorithm";
import type { Ambition, BikeCategory } from "../../../../../convex/lib/fitAlgorithm/types";

const CATEGORY_OPTIONS = [
  { key: "road", label: "Road" },
  { key: "gravel", label: "Gravel" },
  { key: "mtb", label: "Mountain" },
  { key: "city", label: "City" },
];

const AMBITION_OPTIONS = [
  { key: "comfort", label: "Comfort" },
  { key: "balanced", label: "Balanced" },
  { key: "performance", label: "Performance" },
  { key: "aero", label: "Aero" },
];

const FLEXIBILITY_OPTIONS = [
  { key: "1", label: "Very Limited" },
  { key: "2", label: "Limited" },
  { key: "3", label: "Average" },
  { key: "4", label: "Good" },
  { key: "5", label: "Excellent" },
];

const CORE_OPTIONS = [
  { key: "1", label: "Very Low" },
  { key: "2", label: "Low" },
  { key: "3", label: "Average" },
  { key: "4", label: "Good" },
  { key: "5", label: "Excellent" },
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
        {/* Form card */}
        <div className="space-y-8 rounded-3xl border border-border bg-card p-6 shadow-sm sm:p-8">
          <div>
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

          <NumberSlider
            label={isNl ? "Lengte" : "Height"}
            min={140}
            max={220}
            step={1}
            unit="cm"
            value={heightCm}
            onChange={setHeightCm}
          />

          <NumberSlider
            label={isNl ? "Binnenbeenlengte" : "Inseam"}
            min={55}
            max={105}
            step={0.5}
            unit="cm"
            value={inseamCm}
            onChange={setInseamCm}
          />

          <SliderQuestion
            label={isNl ? "Fietscategorie" : "Bike Category"}
            options={CATEGORY_OPTIONS}
            value={category}
            onChange={(v) => setCategory(v as BikeCategory)}
          />

          <SliderQuestion
            label={isNl ? "Rijdoel" : "Riding Goal"}
            options={AMBITION_OPTIONS}
            value={ambition}
            onChange={(v) => setAmbition(v as Ambition)}
          />

          <SliderQuestion
            label={isNl ? "Flexibiliteit" : "Flexibility"}
            options={FLEXIBILITY_OPTIONS}
            value={flexibility}
            onChange={setFlexibility}
          />

          <SliderQuestion
            label={isNl ? "Core-stabiliteit" : "Core Stability"}
            options={CORE_OPTIONS}
            value={core}
            onChange={setCore}
          />
        </div>

        {/* Guidance sidebar */}
        <aside>
          <div className="rounded-3xl border border-border bg-[color:var(--secondary)] p-6 shadow-sm">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-primary">
              {isNl ? "Uitleg" : "Guidance"}
            </p>
            <ul className="mt-4 space-y-3 text-sm text-muted-foreground">
              {guidancePoints.map((point) => (
                <li key={point} className="rounded-2xl border border-border/60 bg-card px-4 py-3">
                  {point}
                </li>
              ))}
            </ul>
          </div>
        </aside>
      </section>

      {/* Output — updates live */}
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
                <p className="text-sm text-muted-foreground">
                  {isNl ? "Zadelhoogte" : "Saddle Height"}
                </p>
                <p className="mt-2 text-3xl font-semibold text-foreground">
                  {result.saddleHeightMm} mm
                </p>
              </div>
              <div className="rounded-2xl border border-border bg-[color:var(--secondary)] p-5">
                <p className="text-sm text-muted-foreground">
                  {isNl ? "Reach-doel" : "Reach Target"}
                </p>
                <p className="mt-2 text-3xl font-semibold text-foreground">{result.reachMm} mm</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {isNl ? "Range" : "Range"}: {result.reachRange.min}–{result.reachRange.max} mm
                </p>
              </div>
              <div className="rounded-2xl border border-border bg-[color:var(--secondary)] p-5">
                <p className="text-sm text-muted-foreground">
                  {isNl ? "Stuurdrop" : "Bar Drop"}
                </p>
                <p className="mt-2 text-2xl font-semibold text-foreground">{result.barDropMm} mm</p>
              </div>
              <div className="rounded-2xl border border-border bg-[color:var(--secondary)] p-5">
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
              ? "Beweeg de lengte- en binnenbeenschuifregelaars om een eerste bike-fitadvies te genereren."
              : "Move the height and inseam sliders to generate a first-pass bike-fit recommendation."}
          </div>
        )}
      </section>
    </>
  );
}
