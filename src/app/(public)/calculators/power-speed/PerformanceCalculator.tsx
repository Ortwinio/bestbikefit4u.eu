"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { usePublicHandoff } from "@/lib/handoff/usePublicHandoff";
import { PersonalizeAdviceBlock } from "@/components/calculators/PersonalizeAdviceBlock";
import { HandoffPrefillNotice } from "@/components/calculators/HandoffPrefillNotice";
import type { HandoffField } from "@/lib/handoff/store";
import type { PerformanceValues } from "../../../../../convex/calculatorStates/validators";
import { performanceDefaults } from "@/lib/calculators/accountState";
import { getFtpSliderStart } from "../../../../../shared/riderEstimates/ftpSliderStart";
import type { RiderSex } from "../../../../../shared/riderDemographics";
import { ftpSliderStartCopy } from "@/i18n/calculators/ftpSliderStart";
import { useCalculatorValuesChange } from "@/components/calculators/useCalculatorValuesChange";
import Link from "next/link";
import {
  AdjustOrder,
  Gauge,
  ConfiguratorLayout,
  MoreToolsNav,
  OptionCard,
  ResultHero,
  ResultTile,
  Slider,
  StepCard,
} from "@/components/ui";
import type { MoreTool } from "@/components/ui/MoreToolsNav";
import type { Locale } from "@/i18n/config";
import { performanceMessages } from "@/i18n/calculators/performance";
import { withLocalePrefix } from "@/i18n/navigation";
import {
  bikeDefaults,
  climbPlan,
  ftpEstimate,
  ftpRating,
  fuelTimeline,
  fuelHydration,
  type SweatLevel,
  powerAtSpeed,
  powerSplit,
  speedAtPower,
  TOOL_RANGES,
  type FtpMethod,
  type PerformanceBike,
  type PerformanceSurface,
} from "@/lib/public-calculators/performance";

import { FtpRatings, FuelHeadline, FuelResults, Sources } from "./SourcedResults";
import { PublicPerformanceCalculator } from "./PublicPerformanceCalculator";

type PerformanceCalculatorProps = {
  tool: MoreTool; locale: Locale; initialValues?: PerformanceValues;
  onValuesChange?: (values: PerformanceValues, confirmedFields?: readonly string[]) => void; navigation?: ReactNode; account?: boolean;
  riderProfile?: { sex?: RiderSex; weightKg?: number };
  ftpKnown?: boolean;
};

export function PerformanceCalculator(props: PerformanceCalculatorProps) {
  return props.account
    ? <AccountPerformanceForm {...props} />
    : <PublicPerformanceCalculator tool={props.tool} locale={props.locale} />;
}

function AccountPerformanceForm({ tool, locale, initialValues, onValuesChange, navigation, account = false, riderProfile, ftpKnown = initialValues !== undefined }: PerformanceCalculatorProps) {
  const copy = performanceMessages[locale];
  const handoff = usePublicHandoff(tool, !account);
  const prefilled = useRef(false);
  const [edited, setEdited] = useState(false);
  const [prefilledFields, setPrefilledFields] = useState<HandoffField[]>([]);
  const initial = initialValues ?? performanceDefaults;
  const [values, setValues] = useState(() => ({
    ...initial.values,
    riderMass: initialValues?.values.riderMass ?? riderProfile?.weightKg ?? initial.values.riderMass,
  }));
  const [ftpTouched, setFtpTouched] = useState(false);
  const [weightTouched, setWeightTouched] = useState(false);
  const [bike, setBike] = useState<PerformanceBike>(initial.bike);
  const [surface, setSurface] = useState<PerformanceSurface>(initial.surface);
  const [mode, setMode] = useState<"power" | "speed">(initial.mode);
  const [comparison, setComparison] = useState<"both" | "men" | "women">(initial.comparison);
  const [method, setMethod] = useState<FtpMethod>(initial.method);
  const [intensity, setIntensity] = useState<PerformanceValues["intensity"]>(initial.intensity);
  const [sweat, setSweat] = useState<SweatLevel>(initial.sweat);
  const ftpStartCopy = ftpSliderStartCopy[locale];
  const hasFtpSlider = tool === "climb-planner" || (tool === "ftp-wkg" && method === "known");
  const rememberedFtp = (handoff.getPrefill("ftpWatts")
    ?? handoff.initialEntries.find((entry) => entry.field === "ftpWatts"))?.value;
  const hasRememberedFtp = typeof rememberedFtp === "number"
    && rememberedFtp >= TOOL_RANGES.ftp.min && rememberedFtp <= TOOL_RANGES.ftp.max;
  const profileWeight = riderProfile?.weightKg;
  const hasValidProfileWeight = typeof profileWeight === "number" && Number.isFinite(profileWeight)
    && profileWeight >= TOOL_RANGES.riderMass.min && profileWeight <= TOOL_RANGES.riderMass.max;
  const ftpStart = hasFtpSlider && !ftpKnown && !ftpTouched && !hasRememberedFtp
    ? getFtpSliderStart({
      sex: riderProfile?.sex,
      weightKg: hasValidProfileWeight || weightTouched || prefilledFields.includes("weightKg")
        ? values.riderMass : undefined,
      ...TOOL_RANGES.ftp,
    }) : null;
  const ftpPending = ftpStart !== null;
  useEffect(() => {
    if (!handoff.ready || prefilled.current || account) return;
    prefilled.current = true;
    const fields: HandoffField[] = [];
    const next: Partial<PerformanceValues["values"]> = {};
    const weight = handoff.getPrefill("weightKg");
    if (tool !== "fuel-hydration" && typeof weight?.value === "number" &&
      weight.value >= 40 && weight.value <= 150) {
      next.riderMass = weight.value;
      fields.push("weightKg");
    }
    const ftp = handoff.getPrefill("ftpWatts")
      ?? handoff.initialEntries.find((entry) => entry.field === "ftpWatts");
    if (!ftpKnown && !ftpTouched && (tool === "ftp-wkg" || tool === "climb-planner") && typeof ftp?.value === "number" &&
      ftp.value >= 80 && ftp.value <= 500) {
      next.ftp = ftp.value;
      if (tool === "ftp-wkg") {
        setMethod("known");
        // Stored FTP is an FTP value, never the raw protocol power expected by other modes.
        if (handoff.getPrefill("ftpMethod")?.value === "known") fields.push("ftpMethod");
      }
      fields.push("ftpWatts");
    }
    const sweatEntry = handoff.getPrefill("sweatProfile");
    if (tool === "fuel-hydration" && ["low", "medium", "high"].includes(String(sweatEntry?.value))) {
      setSweat(sweatEntry!.value as SweatLevel);
      fields.push("sweatProfile");
    }
    setValues((current) => ({ ...current, ...next }));
    setPrefilledFields(fields);
    if (fields.length) setEdited(true);
  }, [handoff, account, tool, ftpKnown, ftpTouched]);
  useCalculatorValuesChange({ values, bike, surface, mode, comparison, method, intensity, sweat },
    ftpPending ? undefined : onValuesChange);
  const format = (value: number, digits = 1) =>
    new Intl.NumberFormat(locale, {
      maximumFractionDigits: digits,
    }).format(value);
  const conditions = {
    riderMassKg: values.riderMass,
    bikeMassKg: values.bikeMass,
    bike,
    surface,
    gradientPct: values.gradient,
  };
  const forward = speedAtPower(conditions, values.power);
  const speed = mode === "power" ? forward.speedKmh : values.speed;
  const watts = mode === "power" ? values.power : powerAtSpeed(conditions, values.speed);
  const split = mode === "power" ? forward.split : powerSplit(conditions, values.speed);
  const climb = tool === "climb-planner" && !ftpPending ? climbPlan({
    distanceKm: values.distance,
    gradientPct: values.climbGradient,
    ftpWatts: values.ftp,
    riderMassKg: values.riderMass,
    bike,
  }) : null;
  const ftp = tool === "ftp-wkg" && !ftpPending
    ? ftpEstimate(method, values[method === "known" ? "ftp" : method], values.riderMass) : null;
  const fuel = tool === "fuel-hydration";
  const guidance = fuelHydration({
    durationHours: values.duration,
    temperatureC: values.temperature,
    sweat,
    bottleSizeMl: values.bottleSize,
  });
  const timeline = fuelTimeline(values.duration, values.temperature);
  const carbs = guidance.carbohydrate;
  const fuelValue = carbs.band === "none" ? copy.noCarbs : carbs.gramsPerHour === null ? copy.smallCarbs
    : `${copy.upTo} ${format(carbs.gramsPerHour)}`;
  const mainValue = ftpPending ? "—" : fuel
    ? fuelValue
    : tool === "ftp-wkg"
      ? format(ftp!.wattsPerKg, 2)
      : tool === "climb-planner"
        ? climb!.minutes === null
          ? "—"
          : format(climb!.minutes)
        : format(mode === "power" ? speed : watts);
  const unit = ftpPending ? "" : fuel
    ? carbs.gramsPerHour && carbs.band !== "none" ? copy.carbsPerHour : ""
    : tool === "ftp-wkg"
      ? "W/kg"
      : tool === "climb-planner"
        ? "min"
        : mode === "power"
          ? copy.kmh
          : "W";
  const metric = fuel
    ? copy.carbohydrate
    : tool === "ftp-wkg"
      ? copy.wattsPerKg
      : tool === "climb-planner"
        ? copy.time
        : mode === "power"
          ? copy.estimatedSpeed
          : copy.requiredPower;
  const isLimited =
    tool === "power-speed" && mode === "power"
      ? forward.limit
      : tool === "climb-planner"
        ? climb?.limit
        : null;
  const resultId = `${tool}-result`;

  function changeFtp(value: number) {
    setFtpTouched(true);
    if (ftpPending && value === values.ftp) {
      onValuesChange?.({ values, bike, surface, mode, comparison, method, intensity, sweat }, ["ftpWatts"]);
    }
    setValues((current) => ({ ...current, ftp: value }));
    handoff.touch("ftpWatts", value, "W");
    if (tool === "ftp-wkg") handoff.touch("ftpMethod", "known", "none");
    else handoff.remove("ftpMethod");
    setEdited(true);
  }

  function slider(key: keyof typeof TOOL_RANGES, unit: string) {
    const displayValue = key === "ftp" ? ftpStart ?? values[key] : values[key];
    return (
      <div key={key}>
      <Slider
        key={key}
        label={copy[key]}
        min={TOOL_RANGES[key].min}
        max={TOOL_RANGES[key].max}
        step={TOOL_RANGES[key].step}
        value={displayValue}
        valueLabel={format(displayValue, 2)}
        unit={unit}
        aria-valuetext={`${format(displayValue, 2)} ${unit}`}
        onChange={(value) => {
          if (key === "ftp") {
            changeFtp(value);
            return;
          }
          setValues((current) => ({ ...current, [key]: value }));
          if (key === "riderMass") {
            setWeightTouched(true);
            handoff.touch("weightKg", value, "kg");
          }
          setEdited(true);
        }}
      />
      {key === "ftp" && ftpPending && (
        <div className="mt-2 space-y-2">
          <p className="text-sm text-muted-foreground">{ftpStartCopy.hint}</p>
          <button type="button" className="min-h-11 rounded-full border border-border px-4 text-sm font-semibold focus-visible:focus-ring"
            onClick={() => changeFtp(ftpStart)}>
            {ftpStartCopy.confirm}
          </button>
        </div>
      )}
      </div>
    );
  }
  function choices<T extends string>(
    label: string,
    options: Record<T, string>,
    selected: T,
    onChange: (value: T) => void,
  ) {
    return (
      <fieldset className="min-w-0">
        <legend className="mb-3 text-base font-semibold">{label}</legend>
        <div className="grid grid-cols-2 gap-2">
          {(Object.entries(options) as [T, string][]).map(([value, label]) => (
            <OptionCard
              key={value}
              label={label}
              selected={selected === value}
              showCheck={false}
              className="min-w-0 px-3 text-sm"
              onClick={() => {
                onChange(value);
                setEdited(true);
              }}
            />
          ))}
        </div>
      </fieldset>
    );
  }
  const bikeChoices = choices(copy.bike, copy.bikes, bike, (value) => {
    setBike(value);
    const defaults = bikeDefaults(value);
    setValues((current) => ({ ...current, bikeMass: defaults.bikeMassKg }));
    setSurface(defaults.surface);
  });
  return (
    <ConfiguratorLayout
      notice={!account && <HandoffPrefillNotice calculator={tool} locale={locale} fields={prefilledFields} />}
      afterResults={!account && <PersonalizeAdviceBlock calculator={tool} locale={locale} />}
      eyebrow={copy.eyebrow}
      title={copy.titles[tool]}
      description={copy.intro}
      navigation={navigation ?? <MoreToolsNav activeTool={tool} locale={locale} />}
      inputs={
        <>
          <StepCard number={1} title={copy.effort}>
            {tool === "power-speed" && (
              <>
                {choices(copy.effort, copy.modes, mode, setMode)}
                {slider(mode, mode === "power" ? "W" : copy.kmh)}
              </>
            )}
            {tool === "climb-planner" && (
              <>
                {slider("distance", "km")}
                {slider("climbGradient", "%")}
                {slider("ftp", "W")}
              </>
            )}
            {tool === "ftp-wkg" && (
              <>
                {choices(copy.method, copy.methods, method, (value) => {
                  setMethod(value);
                  // A different protocol must not relabel an earlier FTP or carry its untouched default.
                  handoff.remove("ftpWatts");
                  handoff.touch("ftpMethod", value, "none");
                })}
                {slider(method === "known" ? "ftp" : method, "W")}
                <p className="text-sm text-muted-foreground">{copy.convention}</p>
              </>
            )}
            {fuel && (
              <>
                {slider("duration", copy.hour)}
                {choices(copy.intensity, copy.intensities, intensity, setIntensity)}
              </>
            )}
          </StepCard>
          <StepCard number={2} title={fuel ? copy.fuelConditions : copy.rider}>
            {fuel ? (
              <>
                {slider("temperature", "°C")}
                {slider("bottleSize", "ml")}
                {choices(copy.sweat, copy.sweats, sweat, (value) => {
                  setSweat(value);
                  handoff.touch("sweatProfile", value, "none");
                })}
              </>
            ) : (
              slider("riderMass", "kg")
            )}
            {tool === "power-speed" && (
              <>
                {bikeChoices}
                {slider("bikeMass", "kg")}
              </>
            )}
          </StepCard>
          {(tool === "power-speed" || tool === "climb-planner") && (
            <StepCard number={3} title={copy.conditions}>
              {tool === "climb-planner" && bikeChoices}
              {tool === "power-speed" && (
                <>
                  {slider("gradient", "%")}
                  {choices(copy.surface, copy.surfaces, surface, setSurface)}
                </>
              )}
            </StepCard>
          )}
        </>
      }
      results={
        ftpPending ? <p id={resultId} role="status" className="rounded-3xl border border-border bg-card p-6">{ftpStartCopy.pending}</p> :
        <>
          <div id={resultId} className="scroll-mt-8">
            {fuel ? (
              <FuelHeadline locale={locale} carbohydrate={carbs} durationHours={values.duration}
                fluid={guidance.fluidLitresPerHour} />
            ) : <ResultHero
              label={edited ? metric : `${copy.example} · ${metric}`}
              value={mainValue}
              unit={tool === "ftp-wkg" && comparison !== "both"
                ? `${unit} · ${copy.comparisons[comparison]} · ${copy.ratings[ftpRating(ftp!.wattsPerKg, comparison)]}`
                : unit}
              subtext={fuel ? copy.fuelStart : copy.noWind}
            >
              {isLimited && (
                <p role="status" className="font-bold">
                  {copy.capped}
                </p>
              )}
              {tool === "power-speed" && (
                <Gauge
                  label={copy.speed}
                  value={speed}
                  max={54}
                  unit={copy.kmh}
                  locale={locale}
                  className="ml-auto max-w-40"
                />
              )}
              {tool === "climb-planner" && (
                <svg
                  viewBox="0 0 500 180"
                  className="w-full"
                  role="img"
                  aria-label={`${copy.climbGradient}: ${format(values.climbGradient)}%`}
                >
                  <path
                    data-testid="climb-profile"
                    d={`M15 160L485 ${160 - values.climbGradient * 9}V170H15Z`}
                    fill="var(--bbf-inkt)"
                  />
                </svg>
              )}
            </ResultHero>}
          </div>
          <p role="status" aria-label={metric} aria-live="polite" aria-atomic="true" className="sr-only">
            {metric}: {mainValue} {unit}. {isLimited ? copy.capped : fuel ? copy.fuelStart : ""}
          </p>
          {tool === "power-speed" && (
            <section className="rounded-3xl border border-border bg-card p-6">
              <h2 className="font-display text-2xl font-bold">{copy.split}</h2>
              <svg viewBox="0 0 100 8" className="my-5 w-full" aria-hidden="true">
                <rect width="100" height="8" rx="2" fill="currentColor" className="text-foreground" />
                <rect
                  width={(100 * (split.climbing + split.rolling)) / split.total}
                  height="8"
                  fill="currentColor"
                  className="text-primary"
                />
                <rect width={(100 * split.climbing) / split.total} height="8" fill="var(--bbf-lime)" />
              </svg>
              <dl className="space-y-3">
                {(["climbing", "rolling", "air"] as const).map((key) => (
                  <div key={key} className="flex items-center justify-between gap-3">
                    <dt>{copy[key]}</dt>
                    <dd className="font-mono">{format(split[key])} W</dd>
                  </div>
                ))}
              </dl>
            </section>
          )}
          {tool === "power-speed" && (
            <>
              <div className="grid grid-cols-2 gap-3">
                <ResultTile
                  label={copy.totalMass}
                  value={format(values.riderMass + values.bikeMass)}
                  unit="kg"
                />
                <ResultTile label={copy.speed} value={format(speed)} unit={copy.kmh} />
              </div>
              <AdjustOrder title={copy.orderTitle} steps={copy.orderSteps.map((title) => ({ title }))} />
            </>
          )}
          {tool === "climb-planner" && (
            <>
              <div className="grid grid-cols-2 gap-3">
                <ResultTile label={copy.targetPower} value={format(climb!.targetPowerWatts)} unit="W" />
                <ResultTile label={copy.estimatedSpeed} value={format(climb!.speedKmh)} unit={copy.kmh} />
              </div>
              <p className="px-2 text-sm text-muted-foreground">{copy.pacing}</p>
            </>
          )}
          {tool === "ftp-wkg" && (
            <>
              <FtpRatings locale={locale} wattsPerKg={ftp!.wattsPerKg} onComparisonChange={setComparison} />
              <ResultTile label={copy.ftpResult} value={format(ftp!.ftpWatts)} unit="W" />
              <div className="grid grid-cols-2 gap-3">
                <ResultTile
                  label={copy.flat}
                  value={format(ftp!.flat.speedKmh)}
                  unit={copy.kmh}
                  status={ftp!.flat.limit ? copy.capped : undefined}
                />
                <ResultTile
                  label={copy.referenceClimb}
                  value={ftp!.climbMinutes === null ? "—" : format(ftp!.climbMinutes)}
                  unit="min"
                />
              </div>
              <p className="px-2 text-sm text-muted-foreground">
                {copy.reference}
              </p>
            </>
          )}
          {fuel && <FuelResults locale={locale} guidance={guidance} easy={intensity === "easy"} />}
          {(fuel || tool === "ftp-wkg") && <Sources locale={locale} fuel={fuel} />}
          {fuel && (
            <section className="rounded-3xl border border-border bg-card p-6">
              <h2 className="font-display text-2xl font-bold">{copy.timeline}</h2>
              <p className="my-4 text-sm text-muted-foreground">
                {copy.intensities[intensity as keyof typeof copy.intensities]} · {format(values.temperature)}{" "}
                °C · {copy.sweat} {copy.sweats[sweat as keyof typeof copy.sweats].toLowerCase()}
              </p>
              <ol className="grid grid-cols-3 gap-2 border-t-4 border-primary pt-4">
                {timeline.markersMinutes.map((minutes, index) => (
                  <li key={minutes} className="text-center">
                    <p className="font-mono">{format(minutes)} min</p>
                    <p className="mt-2 text-sm">{[copy.start, copy.middle, copy.finish][index]}</p>
                  </li>
                ))}
              </ol>
            </section>
          )}
          {!fuel && !account && (
            <section className="rounded-3xl bg-[var(--bbf-inkt)] p-6 text-[var(--bbf-wit)]">
              <h2 className="font-display text-2xl font-bold text-[var(--bbf-wit)]">{copy.next}</h2>
              <p className="my-4 text-[var(--bbf-op-donker)]">{copy.nextBody}</p>
              <Link
                href={withLocalePrefix("/calculators/gearing", locale)}
                className={
                  "inline-flex min-h-11 items-center rounded-full bg-primary px-5 " +
                  "font-bold text-primary-foreground"
                }
              >
                {copy.nextLink}
              </Link>
            </section>
          )}
        </>
      }
      stickyResult={
        <a href={`#${resultId}`} className="flex min-h-11 items-center justify-between gap-3">
          <span className="min-w-0 text-sm font-bold">{copy.resultLink}</span>
          <span className={fuel && carbs.gramsPerHour === null
            ? "min-w-0 flex-1 text-right font-mono text-sm" : "shrink-0 font-mono text-2xl"}>
            {isLimited ? "≥ " : ""}
            {mainValue}
            <span className="ml-1 text-sm text-muted-foreground">{unit}</span>
          </span>
        </a>
      }
    />
  );
}
