"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import type { AccountReliabilityCopy } from "@/i18n/account/reliability";

export function KneeMeasurementForm({ copy, currentSaddleHeightMm, onSave }: {
  copy: AccountReliabilityCopy;
  currentSaddleHeightMm?: number;
  onSave: (angleDegrees: number, currentSaddleHeightMm: number) => Promise<unknown>;
}) {
  const [angle, setAngle] = useState("");
  const [heightDraft, setHeight] = useState<string>();
  const height = heightDraft ?? currentSaddleHeightMm?.toString() ?? "";
  const [pending, setPending] = useState(false);
  const [status, setStatus] = useState<"saved" | "error" | "angleInvalid" | null>(null);
  async function save() {
    if (pending) return;
    const angleValue = Number(angle), heightValue = Number(height);
    if (!angle || !height || !Number.isFinite(angleValue) || angleValue < 15 || angleValue > 45 || !Number.isFinite(heightValue) || heightValue < 300 || heightValue > 1200) { setStatus("angleInvalid"); return; }
    setPending(true); setStatus(null);
    try { await onSave(angleValue, heightValue); setAngle(""); setStatus("saved"); }
    catch { setStatus("error"); }
    finally { setPending(false); }
  }
  return <Card className="p-6"><form noValidate onSubmit={(event) => { event.preventDefault(); void save(); }} className="space-y-4">
    <Input label={copy.angleInput} tooltip={copy.angleHelp} helperText={copy.angleHelp} type="number" min={15} max={45} step="0.1" inputMode="decimal" value={angle} disabled={pending} onChange={(event) => { setAngle(event.target.value); setStatus(null); }} />
    <Input label={copy.current} tooltip={copy.reference} helperText={heightDraft === undefined && currentSaddleHeightMm !== undefined ? copy.fromProfile : copy.reference} type="number" min={300} max={1200} step={1} value={height} disabled={pending} onChange={(event) => { setHeight(event.target.value); setStatus(null); }} />
    <Button type="submit" disabled={pending || !angle || !height}>{pending ? copy.saving : copy.saveAngle}</Button>
    {status && <p role={status === "saved" ? "status" : "alert"}>{copy[status]}</p>}
  </form></Card>;
}
