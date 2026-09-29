"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  Button,
  ConfiguratorLayout,
  OptionCard,
  ResultHero,
  ResultTile,
  SizeScale,
  Slider,
  StatusChip,
  StepCard,
} from "@/components/ui";
import {
  createPublicFitBaseline,
  PUBLIC_FIT_REQUIREMENTS,
  validatePublicFitBaseline,
} from "@/lib/publicCalculatorLogic";
import { runFrameSizeCalculation } from "@/lib/public-calculators/fitAdapters";
import { frameSizeMessages, type FrameSizeCalculatorCopy } from "@/i18n/calculators/frameSize";
import type { Locale } from "@/i18n/config";
import { withLocalePrefix } from "@/i18n/navigation";
import type { BikeCategory } from "../../../../../convex/lib/fitAlgorithm/types";

const CATEGORIES: BikeCategory[] = ["road", "gravel", "mtb", "city"];
// The existing public page domains; sizing itself stays entirely in the adapter.
const HEIGHT = { min: 130, max: 210, step: 1 };
const INSEAM = { min: 55, max: 105, step: 0.5 };

export function FrameSizeCalculatorForm({
  isNl = false,
  locale = isNl ? "nl" : "en",
  copy = frameSizeMessages[locale],
}: {
  isNl?: boolean;
  locale?: Locale;
  copy?: FrameSizeCalculatorCopy;
}) {
  const [heightCm, setHeightCm] = useState(180);
  const [inseamCm, setInseamCm] = useState(84);
  const [heightConfirmed, confirmHeight] = useState(false);
  const [inseamConfirmed, confirmInseam] = useState(false);
  const [category, setCategory] = useState<BikeCategory>("road");
  const confirmed = heightConfirmed && inseamConfirmed;
  const format = new Intl.NumberFormat(locale === "nl" ? "nl-NL" : "en-GB", {
    maximumFractionDigits: 3,
  });
  const baseline = createPublicFitBaseline({ heightCm, inseamCm, bikeCategory: category });
  const issues = validatePublicFitBaseline(
    baseline,
    PUBLIC_FIT_REQUIREMENTS.frameSize,
    locale === "nl",
  );
  const result = runFrameSizeCalculation({
    heightCm,
    inseamCm,
    category,
    inseamSource: confirmed ? "measured" : "estimated",
  });
  // Enumerate actual returned bands, rather than maintaining a second sizing formula.
  const bands = useMemo(
    () =>
      Array.from(
        new Set(
          Array.from(
            { length: HEIGHT.max - HEIGHT.min + 1 },
            (_, i) =>
              runFrameSizeCalculation({ heightCm: HEIGHT.min + i, inseamCm: 84, category })
                .estimatedFrameSize,
          ),
        ),
      ),
    [category],
  );
  const ratio = inseamCm / heightCm;
  // The graphic shows the measured fraction of total height; no invented sizing zones.
  const ratioX = 16 + ratio * 288;
  const shortLabel = confirmed ? copy.shortlist : copy.exampleResult;
  const frameLabel = result.estimatedFrameSize.replaceAll("-", "–").replace(" cm", "");
  const unit = result.estimatedFrameSize.endsWith(" cm") ? "cm" : undefined;

  return (
    <ConfiguratorLayout
      eyebrow={copy.eyebrow}
      title={copy.title}
      description={copy.description}
      inputs={
        <>
          <StepCard number={1} title={copy.bike}>
            <div role="group" aria-label={copy.bike} className="grid gap-3 sm:grid-cols-2">
              {CATEGORIES.map((value) => (
                <OptionCard
                  key={value}
                  label={copy.categories[value].label}
                  description={copy.categories[value].description}
                  selected={category === value}
                  onClick={() => setCategory(value)}
                />
              ))}
            </div>
          </StepCard>
          <StepCard number={2} title={copy.body}>
            <p className="text-sm text-muted-foreground">
              {confirmed ? copy.confirmed : copy.example}
            </p>
            <Slider
              id="frame-height"
              label={copy.height}
              {...HEIGHT}
              value={heightCm}
              unit="cm"
              valueLabel={format.format(heightCm)}
              helperText={copy.heightHint}
              onChange={(value) => {
                setHeightCm(value);
                confirmHeight(true);
              }}
              ticks={[130, 150, 170, 190, 210].map((value) => ({ value }))}
            />
            {!heightConfirmed && (
              <Button variant="outline" size="sm" onClick={() => confirmHeight(true)}>
                {copy.confirmHeight}
              </Button>
            )}
            <Slider
              id="frame-inseam"
              label={copy.inseam}
              {...INSEAM}
              value={inseamCm}
              unit="cm"
              valueLabel={format.format(inseamCm)}
              helperText={copy.inseamHint}
              onChange={(value) => {
                setInseamCm(value);
                confirmInseam(true);
              }}
            />
            {!inseamConfirmed && (
              <Button variant="outline" size="sm" onClick={() => confirmInseam(true)}>
                {copy.confirmInseam}
              </Button>
            )}
            {issues.length > 0 && (
              <div role="status" className="space-y-2">
                <StatusChip status="warn">{copy.measurementCheck}</StatusChip>
                <ul className="space-y-2 text-sm">
                  {issues.map((issue) => (
                    <li key={issue.code}>{issue.message}</li>
                  ))}
                </ul>
              </div>
            )}
          </StepCard>
        </>
      }
      results={
        <>
          <div id="frame-result" aria-live="polite" aria-atomic="true">
            <ResultHero label={shortLabel} value={frameLabel} unit={unit} subtext={copy.limit}>
              <SizeScale
                label={copy.scale}
                options={bands.map((value) => ({
                  value,
                  label: value.replaceAll("-", "–").replace(" cm", ""),
                }))}
                recommended={result.estimatedFrameSize}
                recommendedLabel={copy.recommended}
                unit={unit}
                locale={locale}
              />
            </ResultHero>
          </div>
          <section className="rounded-3xl border border-border bg-card p-6 text-card-foreground">
            <h2 className="font-display text-2xl font-bold">{copy.proportions}</h2>
            <p className="mt-3 text-sm text-muted-foreground">
              {copy.ratio}{" "}
              <span className="font-mono text-lg text-foreground">{format.format(ratio)}</span>
            </p>
            <svg
              viewBox="0 0 320 58"
              className="mt-3 w-full"
              role="img"
              aria-label={`${copy.ratio}: ${format.format(ratio)}`}
            >
              <path
                d="M16 30H304"
                stroke="var(--bbf-rand)"
                strokeWidth="14"
                strokeLinecap="round"
              />
              <path
                d={`M16 30H${ratioX}`}
                stroke="currentColor"
                className="text-primary"
                strokeWidth="14"
                strokeLinecap="round"
              />
              <path
                d={`M${ratioX} 14V46`}
                stroke="currentColor"
                className="text-foreground"
                strokeWidth="4"
                strokeLinecap="round"
              />
            </svg>
            <p className="text-sm text-muted-foreground">{copy.ratioHint}</p>
          </section>
          <ResultTile
            label={copy.saddle}
            value={result.estimatedSaddleHeight}
            unit="mm"
            status={copy.saddleHint}
          />
          <section className="rounded-3xl bg-[var(--bbf-inkt)] p-6 text-[var(--bbf-wit)]">
            <h2 className="font-display text-2xl font-bold text-[var(--bbf-wit)]">
              {copy.nextTitle}
            </h2>
            <p className="mt-3 text-[var(--bbf-op-donker)]">{copy.nextBody}</p>
            <div className="mt-5 flex flex-col gap-3">
              <Link
                className={
                  "inline-flex min-h-12 items-center justify-center rounded-full bg-[var(--bbf-lime)] " +
                  "px-5 py-3 text-center font-bold text-[var(--bbf-inkt)]"
                }
                href={withLocalePrefix("/calculators/bike-fit", locale)}
              >
                {copy.startFit}
              </Link>
              <Link
                className={
                  "inline-flex min-h-12 items-center justify-center rounded-full border " +
                  "border-[var(--bbf-op-donker)] px-5 py-3 text-center font-bold"
                }
                href={withLocalePrefix("/science/stack-and-reach", locale)}
              >
                {copy.geometry}
              </Link>
            </div>
          </section>
        </>
      }
      stickyResult={
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-xs text-muted-foreground">{shortLabel}</p>
            <p className="font-mono text-xl">
              {frameLabel} <span className="text-sm">{unit}</span>
            </p>
          </div>
          <a
            href="#frame-result"
            className={
              "inline-flex min-h-11 items-center rounded-full bg-primary px-4 text-sm font-bold " +
              "text-primary-foreground"
            }
          >
            {copy.resultLink}
          </a>
        </div>
      }
    />
  );
}
