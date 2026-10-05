"use client";

import { useState, type ReactNode } from "react";
import Link from "next/link";
import { HandoffPrefillNotice } from "@/components/calculators/HandoffPrefillNotice";
import { handoffLoginHref } from "@/components/calculators/PersonalizeAdviceBlock";
import { ReliabilityCalculatorTemplate } from "@/components/reliability/ReliabilityCalculatorTemplate";
import { Slider } from "@/components/ui";
import type { Locale } from "@/i18n/config";
import { performanceMessages } from "@/i18n/calculators/performance";
import { reliabilityPerformance } from "@/i18n/calculators/reliabilityPerformance";
import type { HandoffField } from "@/lib/handoff/store";
import { ftpEstimate } from "@/lib/public-calculators/performance";
import { performanceInputRanges, usePerformanceInputs, type PerformanceNumericField, type PublicPerformanceTool } from "./usePerformanceInputs";
import { PerformanceReliabilityResults } from "./PerformanceReliabilityResults";

export function PublicPerformanceCalculator({ tool, locale }: { tool: PublicPerformanceTool; locale: Locale }) {
  const copy = reliabilityPerformance[locale];
  const input = usePerformanceInputs(tool);
  const [mode, setMode] = useState<"power" | "speed">("power");
  const config = tool === "power-speed" ? copy.speedTool : tool === "climb-planner" ? copy.climbTool
    : tool === "ftp-wkg" ? copy.ftpTool : tool === "gearing" ? copy.gearingTool : copy.fuelTool;
  const format = (value: number) => new Intl.NumberFormat(locale, { maximumFractionDigits: 2 }).format(value);
  const method = input.choice("ftpMethod", input.has("ftpWatts") ? "known" : "twentyMinute");
  const testField = method === "known" ? "ftpWatts" : method === "ramp" ? "rampWatts" : "twentyMinuteWatts";
  const bike = input.choice("bikeCategory", "road");
  const intensity = input.choice("intensity", "endurance");
  const activeFields: HandoffField[] = tool === "power-speed" ? [mode === "power" ? "powerWatts" : "speedKph", "weightKg", "bikeCategory"]
    : tool === "climb-planner" ? ["distanceKm", "gradientPercent", "ftpWatts", "weightKg"]
      : tool === "ftp-wkg" ? ["ftpMethod", testField, "weightKg"]
        : tool === "gearing" ? ["innerChainringTeeth", "cassetteLargestCogTeeth", "gradientPercent", "weightKg", "ftpWatts"]
          : ["durationMinutes", "intensity", "temperatureC"];
  const prefilledFields = activeFields.filter((field) => input.edits[field] === undefined && input.prefill(field));
  const completed = tool === "fuel-hydration" ? input.has("temperatureC")
    : tool === "ftp-wkg" || tool === "power-speed" ? input.has("weightKg")
      : tool === "climb-planner" ? input.has("ftpWatts") && input.has("weightKg")
        : input.has("gradientPercent") && input.has("weightKg");
  const active = activeFields.some(input.has);
  const nextField: PerformanceNumericField = tool === "fuel-hydration" ? "temperatureC"
    : tool === "climb-planner" && !input.has("ftpWatts") ? "ftpWatts"
      : tool === "gearing" && !input.has("gradientPercent") ? "gradientPercent" : "weightKg";

  function changeNumber(field: PerformanceNumericField, value: number) {
    input.change(field, value);
    if (tool === "ftp-wkg" && field === testField) {
      input.change("ftpMethod", method);
      if (method !== "known") {
        const result = ftpEstimate(method, value, input.number("weightKg"));
        input.handoff.touch("ftpWatts", result.ftpWatts, "W", "estimated");
      }
    }
  }

  function slider(field: PerformanceNumericField, label: string, unit: string, optional = false) {
    const range = performanceInputRanges[field];
    const divisor = field === "durationMinutes" ? 60 : 1;
    const value = input.number(field) / divisor;
    return <div key={field} id={`${tool}-${field}`} className="min-w-0 space-y-2">
      <Slider label={label} min={range.min / divisor} max={range.max / divisor} step={range.step / divisor}
        value={value} valueLabel={format(value)} unit={unit}
        helperText={!input.has(field) && !optional ? copy.exampleValue : undefined}
        aria-valuetext={`${format(value)} ${unit}${optional && !input.has(field) ? ` · ${copy.pending}` : ""}`}
        onChange={(next) => changeNumber(field, next * divisor)} />
      {optional && !input.has(field) && <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
        <span>{copy.pending}</span>
        <button type="button" className="min-h-11 rounded-full border border-border px-4 text-foreground hover:bg-muted focus-visible:outline-2 focus-visible:outline-ring"
          onClick={() => input.change(field, input.number(field))}>{copy.confirm}</button>
      </div>}
    </div>;
  }

  function choices(label: string, options: Record<string, string>, selected: string, change: (value: string) => void) {
    return <fieldset className="min-w-0 space-y-2">
      <legend className="mb-2 font-semibold">{label}</legend>
      <div className="flex flex-wrap gap-2">{Object.entries(options).map(([value, text]) => <button key={value}
        type="button" aria-pressed={selected === value} onClick={() => change(value)}
        className="min-h-11 rounded-full border border-border px-4 py-2 text-sm font-semibold text-foreground aria-pressed:border-primary aria-pressed:bg-primary/10 hover:bg-muted focus-visible:outline-2 focus-visible:outline-ring">
        {text}
      </button>)}</div>
    </fieldset>;
  }

  let first: ReactNode;
  let second: ReactNode;
  if (tool === "power-speed") {
    first = <>{choices(copy.speed, { power: copy.powerMode, speed: copy.speedMode }, mode, (value) => setMode(value as "power" | "speed"))}
      {mode === "power" ? slider("powerWatts", copy.power, "W") : slider("speedKph", copy.speed, copy.kmh)}</>;
    second = <>{slider("weightKg", copy.weight, "kg", true)}
      {choices(copy.bike, copy.bikes, bike, (value) => input.change("bikeCategory", value))}</>;
  } else if (tool === "climb-planner") {
    first = <>{slider("distanceKm", copy.distance, "km")}{slider("gradientPercent", copy.gradient, "%")}</>;
    second = <>{slider("ftpWatts", copy.ftp, "W", true)}{slider("weightKg", copy.weight, "kg", true)}</>;
  } else if (tool === "ftp-wkg") {
    first = <>{choices(copy.method, copy.methods, method, (value) => input.change("ftpMethod", value))}
      {slider(testField, method === "known" ? copy.ftp : copy.testPower, "W")}</>;
    second = slider("weightKg", copy.weight, "kg", true);
  } else if (tool === "gearing") {
    first = <>{slider("innerChainringTeeth", copy.ring, copy.teeth)}{slider("cassetteLargestCogTeeth", copy.cog, copy.teeth)}</>;
    second = <>{slider("gradientPercent", copy.steepest, "%", true)}{slider("weightKg", copy.weight, "kg", true)}</>;
  } else {
    first = <>{slider("durationMinutes", copy.duration, copy.hours)}
      {choices(copy.effort, copy.efforts, intensity, (value) => input.change("intensity", value))}</>;
    second = slider("temperatureC", copy.temperature, "°C", true);
  }

  return <ReliabilityCalculatorTemplate locale={locale} calculator={tool}
    title={tool === "gearing" ? copy.gearingTool.title : performanceMessages[locale].titles[tool]}
    description={config.intro}
    notice={<><HandoffPrefillNotice calculator={tool} locale={locale} fields={prefilledFields} />
      {!active && <p className="text-sm text-muted-foreground">{copy.example}</p>}</>}
    steps={[
      { title: `1. ${config.steps[0]}`, content: first },
      { title: `2. ${config.steps[1]}`, content: second, status: completed ? copy.entered : copy.pending },
    ]}
    results={<PerformanceReliabilityResults tool={tool} locale={locale} mode={mode} method={method}
      bike={bike} intensity={intensity} number={input.number} has={input.has} />}
    nextStep={completed
      ? <Link href={handoffLoginHref(tool, locale)} className="underline underline-offset-4">{config.nextAccount}</Link>
      : <button type="button" className="min-h-11 text-left underline underline-offset-4"
        onClick={() => document.getElementById(`${tool}-${nextField}`)?.querySelector<HTMLElement>('[role="slider"], input[type="range"]')?.focus()}>{config.next}</button>}
    meaning={copy.meaning} omitted={tool === "gearing" && input.has("ftpWatts") ? copy.gearingTool.knownOmitted : config.omitted}
    refinement={config.refine.map((text) => ({ text }))}
    warnings={<p className="rounded-2xl border border-border bg-card p-4 text-sm text-foreground">{config.safety}</p>} />;
}
