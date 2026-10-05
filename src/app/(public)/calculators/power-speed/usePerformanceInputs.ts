"use client";

import { useState } from "react";
import { usePublicHandoff } from "@/lib/handoff/usePublicHandoff";
import { HANDOFF_FIELD_UNITS, type HandoffField } from "@/lib/handoff/store";
import type { MoreTool } from "@/components/ui/MoreToolsNav";

export type PublicPerformanceTool = MoreTool | "gearing";

export const performanceInputRanges = {
  powerWatts: { min: 50, max: 600, step: 5, defaultValue: 220 },
  speedKph: { min: 10, max: 50, step: 0.5, defaultValue: 30 },
  weightKg: { min: 40, max: 150, step: 0.5, defaultValue: 75 },
  distanceKm: { min: 1, max: 30, step: 0.5, defaultValue: 12 },
  gradientPercent: { min: 2, max: 15, step: 0.5, defaultValue: 7 },
  ftpWatts: { min: 80, max: 500, step: 5, defaultValue: 225 },
  twentyMinuteWatts: { min: 100, max: 550, step: 5, defaultValue: 290 },
  rampWatts: { min: 150, max: 700, step: 5, defaultValue: 360 },
  innerChainringTeeth: { min: 22, max: 60, step: 1, defaultValue: 34 },
  cassetteLargestCogTeeth: { min: 21, max: 52, step: 1, defaultValue: 32 },
  durationMinutes: { min: 60, max: 360, step: 30, defaultValue: 180 },
  temperatureC: { min: 5, max: 35, step: 1, defaultValue: 20 },
} as const;

export type PerformanceNumericField = keyof typeof performanceInputRanges;
type ChoiceField = "ftpMethod" | "bikeCategory" | "intensity";
const choices = {
  ftpMethod: ["known", "twentyMinute", "ramp"],
  bikeCategory: ["road", "gravel", "mtb", "city"],
  intensity: ["easy", "endurance", "tempo", "race"],
} as const;

export function usePerformanceInputs(tool: PublicPerformanceTool) {
  const handoff = usePublicHandoff(tool);
  const [edits, setEdits] = useState<Partial<Record<HandoffField, number | string>>>({});

  function prefill(field: HandoffField) {
    const entry = handoff.getPrefill(field);
    if (!entry) return undefined;
    if (field in performanceInputRanges) {
      const range = performanceInputRanges[field as PerformanceNumericField];
      const isToothCount = field === "innerChainringTeeth" || field === "cassetteLargestCogTeeth";
      return typeof entry.value === "number" && Number.isFinite(entry.value)
        && (!isToothCount || Number.isInteger(entry.value))
        && entry.value >= range.min && entry.value <= range.max ? entry : undefined;
    }
    if (field in choices) {
      const value = field === "bikeCategory" && entry.value === "commuter" ? "city" : entry.value;
      return typeof value === "string" && (choices[field as ChoiceField] as readonly string[]).includes(value)
        ? { ...entry, value } : undefined;
    }
    return undefined;
  }

  function has(field: HandoffField) {
    return edits[field] !== undefined || prefill(field) !== undefined;
  }

  function number(field: PerformanceNumericField) {
    return Number(edits[field] ?? prefill(field)?.value
      ?? (field === "gradientPercent" && tool === "gearing" ? 10 : performanceInputRanges[field].defaultValue));
  }

  function choice<Field extends ChoiceField>(field: Field, fallback: (typeof choices)[Field][number]) {
    return (edits[field] ?? prefill(field)?.value ?? fallback) as (typeof choices)[Field][number];
  }

  function change(field: HandoffField, value: number | string) {
    setEdits((current) => ({ ...current, [field]: value }));
    handoff.touch(field, value, HANDOFF_FIELD_UNITS[field],
      field === "innerChainringTeeth" || field === "cassetteLargestCogTeeth" || field === "bikeCategory" ? "bike" : "declared");
  }

  return { handoff, has, number, choice, change, prefill, edits };
}
