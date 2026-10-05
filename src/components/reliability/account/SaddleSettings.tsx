"use client";

import { useState } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Slider } from "@/components/ui/Slider";
import type { AccountReliabilityCopy } from "@/i18n/account/reliability";

export interface SaddleSettingsValues {
  bikeType?: "road" | "gravel" | "mtb" | "city";
  goal?: "comfort" | "balanced" | "performance" | "aero";
  flexibility?: number;
  core?: number;
  climbing?: "low" | "medium" | "high" | "veryHigh";
  currentSaddleHeightMm?: number;
}

export function SaddleSettings({ initial, copy, onSave, supportsClimbing = false, hasBike = true, savedStatus }: {
  initial: SaddleSettingsValues;
  copy: AccountReliabilityCopy;
  onSave: (values: SaddleSettingsValues) => Promise<unknown>;
  supportsClimbing?: boolean;
  hasBike?: boolean;
  savedStatus?: string;
}) {
  const [changes, setChanges] = useState<Partial<SaddleSettingsValues>>({});
  const [pending, setPending] = useState(false);
  const [status, setStatus] = useState<"saved" | "error" | null>(null);
  const values = { ...initial, ...changes };
  function change<K extends keyof SaddleSettingsValues>(key: K, value: SaddleSettingsValues[K]) {
    setChanges((previous) => ({ ...previous, [key]: value })); setStatus(null);
  }
  function choices<K extends "bikeType" | "goal" | "climbing">(key: K, options: NonNullable<SaddleSettingsValues[K]>[], label: string) {
    return <fieldset className="space-y-2" disabled={pending}><legend className="mb-2 text-sm font-medium">{label}</legend><div className="flex flex-wrap gap-2">{options.map((option) => <Button key={option} type="button" variant={values[key] === option ? "primary" : "outline"} aria-pressed={values[key] === option} onClick={() => change(key, option)}>{copy[option]}</Button>)}</div></fieldset>;
  }
  async function save() {
    if (pending || !Object.keys(changes).length) return;
    setPending(true); setStatus(null);
    try { await onSave(changes); setChanges({}); setStatus("saved"); }
    catch { setStatus("error"); }
    finally { setPending(false); }
  }
  return <form onSubmit={(event) => { event.preventDefault(); void save(); }} className="space-y-4">
    <Card className="space-y-4 p-6"><h2 className="text-lg font-semibold">{copy.bikeGoal}</h2><p className="text-xs text-muted-foreground">{copy.fromProfile}</p>
      {savedStatus && <p className="text-xs text-muted-foreground">{savedStatus}</p>}
      {hasBike && choices("bikeType", ["road", "gravel", "mtb", "city"], copy.bike)}
      {choices("goal", hasBike ? ["comfort", "balanced", "performance", "aero"] : ["comfort", "balanced", "performance"], copy.goal)}
      {supportsClimbing && choices("climbing", ["low", "medium", "high", "veryHigh"], copy.climbing)}
    </Card>
    <Card className="space-y-4 p-6"><h2 className="text-lg font-semibold">{copy.assessments}</h2><span className="inline-block rounded-full bg-muted px-3 py-1 text-xs font-semibold">{copy.selfAssessed}</span>
      <p className="text-sm text-muted-foreground">{copy.assessmentHelp}</p>
      {(["flexibility", "core"] as const).map((key) => {
        const score = values[key];
        const levels = key === "flexibility" ? copy.flexibilityLevels : copy.coreLevels;
        return <Slider key={key} label={`${copy[key]} (1–5)`} min={1} max={5} step={1}
          value={score ?? 3} valueLabel={score === undefined ? copy.scoreUnknown : `${score}/5 · ${levels[score - 1]}`}
          disabled={pending} onChange={(value) => change(key, value)} />;
      })}
      {hasBike && <Input label={copy.current} tooltip={copy.reference} type="number" min={300} max={1200} step={1} value={values.currentSaddleHeightMm ?? ""} disabled={pending} onChange={(event) => change("currentSaddleHeightMm", event.target.value === "" ? undefined : Number(event.target.value))} />}
      <Button type="submit" disabled={pending || !Object.keys(changes).length}>{pending ? copy.saving : copy.save}</Button>
      {status && <p role={status === "error" ? "alert" : "status"}>{copy[status]}</p>}
    </Card>
  </form>;
}
