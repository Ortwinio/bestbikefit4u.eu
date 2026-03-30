"use client";

import { useState, useMemo } from "react";
import { NumberSlider } from "@/components/measurements/NumberSlider";
import { SliderQuestion } from "@/components/profile/RidingStyleCard";
import { calculateQuickEstimate } from "../../../../../convex/lib/fitAlgorithm";
import type { BikeCategory } from "../../../../../convex/lib/fitAlgorithm/types";

const CATEGORY_OPTIONS = [
  { key: "road", label: "Road" },
  { key: "gravel", label: "Gravel" },
  { key: "mtb", label: "Mountain" },
  { key: "city", label: "City" },
];

const GUIDANCE_POINTS = [
  "Frame size is the first filter, not the final answer.",
  "Inseam changes your realistic saddle-height baseline and therefore the sizes that make sense.",
  "Use this to shortlist bikes before you compare full fit targets.",
];

export function FrameSizeCalculatorForm() {
  const [heightCm, setHeightCm] = useState<number | undefined>(undefined);
  const [inseamCm, setInseamCm] = useState<number | undefined>(undefined);
  const [category, setCategory] = useState<BikeCategory>("road");

  const result = useMemo(() => {
    if (!heightCm || !inseamCm) return null;
    if (heightCm < 130 || heightCm > 210) return null;
    if (inseamCm < 55 || inseamCm > 105) return null;
    if (inseamCm >= heightCm) return null;

    const estimate = calculateQuickEstimate({
      heightMm: Math.round(heightCm * 10),
      inseamMm: Math.round(inseamCm * 10),
      category,
    });
    return {
      frameSize: estimate.estimatedFrameSize,
      saddleHeightMm: estimate.estimatedSaddleHeight,
    };
  }, [heightCm, inseamCm, category]);

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
              Estimate your size band
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Height, inseam, and category are enough for a reliable first-pass size estimate.
            </p>
          </div>

          <NumberSlider
            label="Height"
            min={130}
            max={210}
            step={1}
            unit="cm"
            value={heightCm}
            onChange={setHeightCm}
          />

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
        <h2 className="mt-2 text-2xl font-semibold text-foreground">Your shortlist baseline</h2>

        {result ? (
          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <div className="rounded-2xl border border-primary/20 bg-primary-soft p-5">
              <p className="text-sm text-muted-foreground">Estimated frame size</p>
              <p className="mt-2 text-3xl font-semibold text-foreground">{result.frameSize}</p>
            </div>
            <div className="rounded-2xl border border-border bg-[color:var(--secondary)] p-5">
              <p className="text-sm text-muted-foreground">Saddle-height baseline</p>
              <p className="mt-2 text-2xl font-semibold text-foreground">
                {result.saddleHeightMm} mm
              </p>
            </div>
          </div>
        ) : (
          <div className="mt-6 rounded-2xl border border-dashed border-border bg-[color:var(--secondary)] px-4 py-5 text-sm text-muted-foreground">
            Move the height and inseam sliders to estimate a realistic frame-size range.
          </div>
        )}
      </section>
    </>
  );
}
