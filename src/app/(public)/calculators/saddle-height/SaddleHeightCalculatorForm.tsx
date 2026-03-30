"use client";

import { useState, useMemo } from "react";
import { NumberSlider } from "@/components/measurements/NumberSlider";
import { SliderQuestion } from "@/components/profile/RidingStyleCard";
import { mapCoreScore, mapFlexibilityScore } from "../../../../../convex/lib/fitAlgorithm";
import { calculateSaddleHeight } from "../../../../../convex/lib/fitAlgorithm/calculations";
import type { Ambition, BikeCategory } from "../../../../../convex/lib/fitAlgorithm/types";
import type { CalculationContext } from "../../../../../convex/lib/fitAlgorithm/types";

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

const GUIDANCE_POINTS = [
  "Use a careful barefoot inseam measurement rather than trouser size.",
  "Treat the result as a starting point, then validate it over a few rides.",
  "Flexibility and core stability matter because they change how sustainable the position feels.",
];

export function SaddleHeightCalculatorForm() {
  const [inseamCm, setInseamCm] = useState<number | undefined>(undefined);
  const [category, setCategory] = useState<BikeCategory>("road");
  const [ambition, setAmbition] = useState<Ambition>("balanced");
  const [flexibility, setFlexibility] = useState("3");
  const [core, setCore] = useState("3");

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
        {/* Form card */}
        <div className="space-y-8 rounded-3xl border border-border bg-card p-6 shadow-sm sm:p-8">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-primary">
              Inputs
            </p>
            <h2 className="mt-2 text-2xl font-semibold text-foreground">
              Build your starting point
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Inseam sets the baseline. Category, ambition, flexibility, and core help refine how aggressive the recommendation can be.
            </p>
          </div>

          <NumberSlider
            label="Inseam"
            min={55}
            max={105}
            step={0.5}
            unit="cm"
            value={inseamCm}
            onChange={setInseamCm}
          />

          <SliderQuestion
            label="Bike Category"
            options={CATEGORY_OPTIONS}
            value={category}
            onChange={(v) => setCategory(v as BikeCategory)}
          />

          <SliderQuestion
            label="Riding Goal"
            options={AMBITION_OPTIONS}
            value={ambition}
            onChange={(v) => setAmbition(v as Ambition)}
          />

          <SliderQuestion
            label="Flexibility"
            options={FLEXIBILITY_OPTIONS}
            value={flexibility}
            onChange={setFlexibility}
          />

          <SliderQuestion
            label="Core Stability"
            options={CORE_OPTIONS}
            value={core}
            onChange={setCore}
          />
        </div>

        {/* Guidance sidebar */}
        <aside>
          <div className="rounded-3xl border border-border bg-[color:var(--secondary)] p-6 shadow-sm">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-primary">
              Guidance
            </p>
            <ul className="mt-4 space-y-3 text-sm text-muted-foreground">
              {GUIDANCE_POINTS.map((point) => (
                <li
                  key={point}
                  className="rounded-2xl border border-border/60 bg-card px-4 py-3"
                >
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
          Output
        </p>
        <h2 className="mt-2 text-2xl font-semibold text-foreground">Your baseline</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Use this as a safe starting point, not as the final word.
        </p>

        {recommendation ? (
          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <div className="rounded-2xl border border-primary/20 bg-primary-soft p-5">
              <p className="text-sm text-muted-foreground">Recommended saddle height</p>
              <p className="mt-2 text-3xl font-semibold text-foreground">
                {recommendation.saddleHeightMm} mm
              </p>
            </div>
            <div className="rounded-2xl border border-border bg-[color:var(--secondary)] p-5">
              <p className="text-sm text-muted-foreground">Safe starting band</p>
              <p className="mt-2 text-2xl font-semibold text-foreground">
                {recommendation.minMm}–{recommendation.maxMm} mm
              </p>
            </div>
          </div>
        ) : (
          <div className="mt-6 rounded-2xl border border-dashed border-border bg-[color:var(--secondary)] px-4 py-5 text-sm text-muted-foreground">
            Move the inseam slider to generate a first-pass saddle-height recommendation.
          </div>
        )}
      </section>
    </>
  );
}
