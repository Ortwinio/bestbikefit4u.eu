"use client";

import { useState } from "react";
import Link from "next/link";
import {
  AdjustOrder,
  Button,
  ConfiguratorLayout,
  OptionCard,
  ResultHero,
  SizeScale,
  Slider,
  StepCard,
} from "@/components/ui";
import type { Locale } from "@/i18n/config";
import { withLocalePrefix } from "@/i18n/navigation";
import type { CrankLengthCopy } from "@/i18n/calculators/crankLength";
import { runCrankLengthCalculation } from "@/lib/public-calculators/fitAdapters";
import { validateCrankLengthRecommendation } from "@/lib/publicCalculatorLogic";
import { CRANK_LENGTH_TABLE } from "../../../../../convex/lib/fitAlgorithm/constants";
import type { BikeCategory } from "../../../../../convex/lib/fitAlgorithm/types";

interface CrankLengthCalculatorFormProps {
  locale: Locale;
  copy: CrankLengthCopy;
  initialInseamCm?: number;
  initialCategory: BikeCategory;
}

export function CrankLengthCalculatorForm({
  locale,
  copy,
  initialInseamCm,
  initialCategory,
}: CrankLengthCalculatorFormProps) {
  const validInitial =
    initialInseamCm !== undefined &&
    Number.isFinite(initialInseamCm) &&
    initialInseamCm >= 55 &&
    initialInseamCm <= 105;
  const [inseamCm, setInseamCm] = useState(
    validInitial ? Math.round(initialInseamCm * 10) / 10 : 84,
  );
  const [category, setCategory] = useState(initialCategory);
  const [edited, setEdited] = useState(false);
  const hasPersonalInput = validInitial || edited;
  const resultLabel = hasPersonalInput ? copy.result : copy.exampleResult;
  const result = runCrankLengthCalculation({
    inseamCm,
    category,
    inseamSource: hasPersonalInput ? "measured" : "estimated",
  });
  const warning = validateCrankLengthRecommendation(category, result, locale === "nl").length > 0;
  const format = new Intl.NumberFormat(locale, { maximumFractionDigits: 1 });
  const pedalX = 150 + result * 1.6;
  const pedalY = 85 + result * 0.6;
  return (
    <ConfiguratorLayout
      eyebrow={copy.eyebrow}
      title={copy.title}
      description={validInitial ? copy.personalIntro : copy.intro}
      inputs={
        <>
          <StepCard number={1} title={copy.measure}>
            <Slider
              label={copy.inseam}
              min={55}
              max={105}
              step={0.1}
              value={inseamCm}
              valueLabel={format.format(inseamCm)}
              unit="cm"
              onChange={(value) => {
                setInseamCm(value);
                setEdited(true);
              }}
              ticks={[
                { value: 55, label: "55 cm" },
                { value: 105, label: "105 cm" },
              ]}
              helperText={copy.measureHint}
            />
            {initialInseamCm !== undefined && !validInitial && !edited && (
              <p role="status" className="mt-4 text-sm text-muted-foreground">
                {copy.invalid}
              </p>
            )}
          </StepCard>
          <StepCard number={2} title={copy.choose}>
            <div
              role="group"
              aria-label={copy.category}
              className="grid grid-cols-2 gap-2 sm:grid-cols-4"
            >
              {(Object.keys(copy.categories) as BikeCategory[]).map((option) => (
                <OptionCard
                  key={option}
                  label={copy.categories[option]}
                  selected={category === option}
                  onClick={() => setCategory(option)}
                  showCheck={false}
                  className="justify-center px-2 text-center text-sm"
                />
              ))}
            </div>
            <p className="mt-4 text-sm text-muted-foreground">{copy.categoryHint}</p>
          </StepCard>
          <section className="rounded-3xl border border-border bg-card p-6 text-card-foreground">
            <h2 className="font-display text-2xl font-bold">{copy.scope}</h2>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{copy.scopeText}</p>
          </section>
        </>
      }
      results={
        <>
          <div id="crank-result">
            <ResultHero
              label={resultLabel}
              value={format.format(result)}
              unit="mm"
              subtext={copy.resultHint}
            >
              <svg
                viewBox="0 0 620 280"
                fill="none"
                role="img"
                aria-label={copy.visual}
                className="h-auto w-full"
              >
                <circle cx="150" cy="85" r="66" stroke="var(--bbf-inkt)" strokeWidth="3" />
                <circle
                  cx="150"
                  cy="85"
                  r="53"
                  stroke="var(--bbf-inkt)"
                  strokeWidth="2"
                  strokeDasharray="3 8"
                />
                <path
                  d="M150 32V138M97 85H203M113 48L187 122M113 122L187 48"
                  stroke="var(--bbf-inkt)"
                  strokeWidth="2"
                />
                <line
                  x1="155"
                  y1="89"
                  x2={pedalX + 5}
                  y2={pedalY + 4}
                  stroke="var(--bbf-lime-zacht)"
                  strokeWidth="37"
                  strokeLinecap="round"
                />
                <line
                  data-testid="crank-arm"
                  x1="150"
                  y1="85"
                  x2={pedalX}
                  y2={pedalY}
                  stroke="var(--bbf-inkt)"
                  strokeWidth="32"
                  strokeLinecap="round"
                />
                <line
                  x1="150"
                  y1="85"
                  x2={pedalX}
                  y2={pedalY}
                  stroke="var(--bbf-wit)"
                  strokeWidth="22"
                  strokeLinecap="round"
                />
                <circle cx="150" cy="85" r="9" fill="var(--bbf-inkt)" />
                <circle cx={pedalX} cy={pedalY} r="8" fill="var(--bbf-inkt)" />
                <rect
                  x={pedalX - 32}
                  y={pedalY + 10}
                  width="64"
                  height="17"
                  rx="5"
                  fill="var(--bbf-inkt)"
                />
                <text
                  x="300"
                  y="260"
                  textAnchor="middle"
                  fill="var(--bbf-inkt)"
                  className="font-mono text-xl"
                >
                  {format.format(result)} mm
                </text>
              </svg>
              <SizeScale
                label={copy.sizes}
                options={CRANK_LENGTH_TABLE.map(({ crankLength }) => ({ value: crankLength }))}
                recommended={result}
                recommendedLabel={copy.recommended}
                locale={locale}
                unit="mm"
              />
            </ResultHero>
          </div>
          <p role="status" aria-label={copy.recommendation} aria-live="polite" className="sr-only">
            {copy.recommendation}: {format.format(result)} mm
          </p>
          {warning && (
            <p className="rounded-2xl bg-[var(--bbf-warning)] p-4 text-sm text-[var(--bbf-inkt)]">
              {copy.warning}
            </p>
          )}
          <AdjustOrder title={copy.adjustment} steps={copy.steps.map((title) => ({ title }))} />
          <section className="rounded-3xl bg-[var(--bbf-inkt)] p-6 text-[var(--bbf-wit)]">
            <h2 className="font-display text-2xl font-bold text-[var(--bbf-wit)]">{copy.save}</h2>
            <p className="mt-3 text-sm text-[var(--bbf-op-donker)]">{copy.saveHint}</p>
            <Button
              className="mt-5 bg-[var(--bbf-lime)] text-[var(--bbf-inkt)] hover:bg-[var(--bbf-lime-zacht)]"
              render={<Link href={withLocalePrefix("/login", locale)} />}
            >
              {copy.save}
            </Button>
          </section>
        </>
      }
      stickyResult={
        <div className="flex items-center justify-between gap-3">
          <span className="text-sm">{resultLabel}</span>
          <a
            href="#crank-result"
            className="inline-flex min-h-11 items-center gap-1 font-mono text-2xl text-foreground"
          >
            {format.format(result)} <span className="text-sm text-muted-foreground">mm</span>
          </a>
        </div>
      }
    />
  );
}
