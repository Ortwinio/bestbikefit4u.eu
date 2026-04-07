"use client";

import { useMemo, useState } from "react";
import { ShieldCheck } from "lucide-react";
import {
  PublicInfoPanel,
  PublicNumberField,
  PublicSelectField,
  PublicSurfaceCard,
} from "@/components/public";
import { calculateQuickEstimate } from "../../../../../convex/lib/fitAlgorithm";
import type { BikeCategory } from "../../../../../convex/lib/fitAlgorithm/types";

const CATEGORY_OPTIONS = [
  { value: "road", label: "Road" },
  { value: "gravel", label: "Gravel" },
  { value: "mtb", label: "Mountain" },
  { value: "city", label: "City" },
];

const GUIDANCE_POINTS = [
  "Frame size is the first filter, not the final answer.",
  "Inseam changes your realistic saddle-height baseline and therefore the sizes that make sense.",
  "Use this to shortlist bikes before you compare full fit targets.",
];

export function FrameSizeCalculatorForm({ isNl = false }: { isNl?: boolean }) {
  const [heightCm, setHeightCm] = useState<number | undefined>(undefined);
  const [inseamCm, setInseamCm] = useState<number | undefined>(undefined);
  const [category, setCategory] = useState<BikeCategory>("road");
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
        "Framemaat is de eerste filter, niet het eindantwoord.",
        "Binnenbeenlengte beïnvloedt je realistische zadelhoogte en daarmee welke maten logisch zijn.",
        "Gebruik dit om fietsen te shortlistten voordat je volledige fitdoelen vergelijkt.",
      ]
    : GUIDANCE_POINTS;

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
        <PublicSurfaceCard
          title={isNl ? "Schat je maatbereik" : "Estimate your size band"}
          description={
            isNl
              ? "Lengte, binnenbeenlengte en categorie zijn genoeg voor een bruikbare eerste maatinschatting."
              : "Height, inseam, and category are enough for a practical first-pass size estimate."
          }
          className="rounded-[1.75rem]"
        >
          <div className="space-y-6">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-primary">
              {isNl ? "Invoer" : "Inputs"}
            </p>
            <div className="grid gap-5 md:grid-cols-2">
              <PublicNumberField
                label={isNl ? "Lengte" : "Height"}
                description={
                  isNl
                    ? "Meet rechtop zonder schoenen."
                    : "Measure standing tall without shoes."
                }
                min={130}
                max={210}
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
                    ? "Gebruik dezelfde maatmethode als voor zadelhoogte."
                    : "Use the same measurement method as for saddle height."
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
            <PublicSelectField
              label={isNl ? "Fietscategorie" : "Bike category"}
              description={
                isNl
                  ? "Framemaatinschatting verschilt per discipline."
                  : "Frame-size estimates differ by discipline."
              }
              options={categoryOptions}
              value={category}
              onChange={(value) => setCategory(value as BikeCategory)}
            />
          </div>
        </PublicSurfaceCard>

        <aside>
          <div className="space-y-4">
            <PublicInfoPanel
              tone="secondary"
              title={isNl ? "Wat je hiermee wel en niet krijgt" : "What this does and does not tell you"}
              icon={<ShieldCheck />}
            >
              {isNl
                ? "Deze uitkomst helpt je om onrealistische maten te schrappen. Reach, stack en contactpunten bepalen daarna of een fiets ook echt werkt."
                : "This result helps you remove unrealistic sizes. Reach, stack, and contact points still determine whether a bike will actually work."}
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
        title={isNl ? "Jouw shortlist-basis" : "Your shortlist baseline"}
        description={
          isNl
            ? "Gebruik dit om modellen te filteren voordat je geometrie en cockpit vergelijkt."
            : "Use this to filter models before you compare geometry and cockpit targets."
        }
        className="mt-6 rounded-[1.75rem]"
      >
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-primary">
          {isNl ? "Uitkomst" : "Output"}
        </p>

        {result ? (
          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <div className="rounded-2xl border border-primary/20 bg-primary-soft p-5">
              <p className="text-sm text-muted-foreground">
                {isNl ? "Geschatte framemaat" : "Estimated frame size"}
              </p>
              <p className="mt-2 text-3xl font-semibold text-foreground">{result.frameSize}</p>
            </div>
            <div className="rounded-2xl border border-border bg-[color:var(--secondary)] p-5">
              <p className="text-sm text-muted-foreground">
                {isNl ? "Basis voor zadelhoogte" : "Saddle-height baseline"}
              </p>
              <p className="mt-2 text-2xl font-semibold text-foreground">
                {result.saddleHeightMm} mm
              </p>
            </div>
          </div>
        ) : (
          <div className="mt-6 rounded-2xl border border-dashed border-border bg-[color:var(--secondary)] px-4 py-5 text-sm text-muted-foreground">
            {isNl
              ? "Vul lengte en binnenbeenlengte in om een realistisch framemaatbereik te schatten."
              : "Enter height and inseam to estimate a realistic frame-size range."}
          </div>
        )}
      </PublicSurfaceCard>
    </>
  );
}
