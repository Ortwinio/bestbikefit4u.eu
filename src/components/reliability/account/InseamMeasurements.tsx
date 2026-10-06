"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { BikeNumberField } from "@/components/bikes/BikeFormControls";
import { Select } from "@/components/ui/Select";
import { usabilityFormsCopy } from "@/i18n/account/usabilityForms";
import type { AccountReliabilityCopy } from "@/i18n/account/reliability";
import { checkInseamPlausibility } from "../../../../shared/reliability/saddleHeight";

export interface InseamMeasurementChip { valueCm: number; recordedAt?: number; }

export function InseamMeasurements({ heightCm, measurements, withinTolerance, locale, copy, onSave, onSaveEstimate }: {
  heightCm?: number;
  measurements: InseamMeasurementChip[];
  withinTolerance: boolean;
  locale: "nl" | "en";
  copy: AccountReliabilityCopy;
  onSave: (valueCm: number, confirmed: boolean) => Promise<unknown>;
  onSaveEstimate?: (valueCm: number, confirmed: boolean) => Promise<unknown>;
}) {
  const [method, setMethod] = useState("measured");
  const formsCopy = usabilityFormsCopy[locale];
  const [draft, setDraft] = useState("");
  const [pending, setPending] = useState(false);
  const [status, setStatus] = useState<"saved" | "error" | null>(null);
  const [attempted, setAttempted] = useState(false);
  const value = Number(draft);
  const plausibility = heightCm ? checkInseamPlausibility(heightCm, value) : null;
  const invalid = !draft || !Number.isFinite(value) || value < 55 || value > 105 || plausibility?.status === "error";
  const warning = plausibility?.status === "check" || plausibility?.status === "large";
  const format = new Intl.NumberFormat(locale, { maximumFractionDigits: 2 });

  async function save(confirmed = false) {
    if (pending) return;
    setAttempted(true);
    if (invalid || (warning && !confirmed)) return;
    setPending(true);
    setStatus(null);
    try { await (method === "estimated" && onSaveEstimate ? onSaveEstimate : onSave)(value, confirmed); setDraft(""); setAttempted(false); setStatus("saved"); }
    catch { setStatus("error"); }
    finally { setPending(false); }
  }

  return <Card className="space-y-4 p-6">
    <h2 className="text-lg font-semibold">{copy.measurements}</h2>
    <ul className="flex flex-wrap gap-2" aria-label={copy.measurements}>{measurements.map((measurement, index) => <li key={`${measurement.recordedAt}-${index}`} className="rounded-2xl bg-muted px-3 py-2 text-sm">
      <span className="font-mono">{format.format(measurement.valueCm)} cm</span><span className="block text-xs text-muted-foreground">{copy.measured} · {measurement.recordedAt ? new Intl.DateTimeFormat(locale, { dateStyle: "medium" }).format(measurement.recordedAt) : copy.unknownDate}</span>
    </li>)}</ul>
    {!measurements.length && <p className="text-sm text-muted-foreground">{copy.noMeasurements}</p>}
    {measurements.length > 0 && <p className="text-sm">{copy.mean}: {format.format(measurements.reduce((sum, measurement) => sum + measurement.valueCm, 0) / measurements.length)} cm</p>}
    {measurements.length >= 2 && !withinTolerance && <p role="status" className="rounded-xl border border-border bg-muted p-3 text-sm">{copy.spread}</p>}
    <p className="text-sm text-muted-foreground">{copy.measureHelp}</p>
    <form onSubmit={(event) => { event.preventDefault(); void save(); }} className="space-y-3">
      <div data-usability="measurement-kind"><Select label={formsCopy.method} tooltip={formsCopy.methodHelp} value={method}
        options={[{ value: "measured", label: formsCopy.measured },
          ...(onSaveEstimate ? [{ value: "estimated", label: formsCopy.estimated }] : [])]}
        disabled={pending} onChange={event => setMethod(event.target.value)} /></div>
      <BikeNumberField label={copy.newMeasurement} tooltip={copy.measureHelp} min={55} max={105} step={0.1}
        value={draft === "" ? null : Number(draft)} disabled={pending}
        onChange={value => { setDraft(value === null ? "" : String(value)); setAttempted(false); setStatus(null); }}
        error={attempted && invalid ? copy.invalid : undefined} />
      {attempted && !invalid && warning && <div role="alert" className="space-y-3 rounded-xl border border-border bg-muted p-4">
        <p>{plausibility?.status === "large" ? copy.large : copy.check}</p>
        <div className="flex flex-wrap gap-2"><Button type="button" disabled={pending} onClick={() => void save(true)}>{plausibility?.status === "large" ? copy.override : copy.confirm}</Button><Button type="button" variant="outline" onClick={() => { setDraft(""); setAttempted(false); }}>{copy.remeasure}</Button></div>
      </div>}
      <Button type="submit" disabled={!draft || pending}>{pending ? copy.saving : copy.saveMeasurement}</Button>
      {status && <p role={status === "error" ? "alert" : "status"}>{copy[status]}</p>}
    </form>
  </Card>;
}
