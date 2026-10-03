"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";
import { useMutation, useQuery } from "convex/react";
import type { FunctionReturnType } from "convex/server";
import { api } from "../../../convex/_generated/api";
import type { Id } from "../../../convex/_generated/dataModel";
import { BIKE_MEASURE_POINTS, BIKE_PROFILE_FIELDS } from "../../../shared/bikeProfileFields";
import { ProfileStrengthRings } from "@/components/profile/ProfileStrengthRings";
import { ProfileAccessNotice } from "@/components/profile/ProfileAccessNotice";
import { BikeRefinements } from "./BikeRefinements";
import { BIKE_REFINEMENT_RULES } from "../../../shared/profileScore";
import { isPaidAccessEnforced } from "../../../shared/pricing/flags";
import { getPricingAccessCopy } from "@/i18n/account/pricingAccess";
import { Button, Input, Select } from "@/components/ui";
import type { Locale } from "@/i18n/config";
import { withLocalePrefix } from "@/i18n/navigation";
import { bikeProfileMessages } from "@/i18n/account/bikeProfile";
import { getProfileScoreCopy } from "@/i18n/account/profileScore";
import {
  actualBikeAdvice, bikeFieldUnit, bikeProfileRows, bikeProfileValue, displayBikeProfileValue, parseBikeProfileDraft,
} from "./bikeProfileModel";

export type BikeProfileDetail = FunctionReturnType<typeof api.bikes.queries.getDetail>;
type Draft = {
  field: string; value: string; kind: "declared" | "estimated" | "measured";
  date: string; point: string; expected: number | string | null;
};
const card = "rounded-3xl border border-border bg-card p-5 text-card-foreground sm:p-6";
const rowGrid = "grid grid-cols-2 items-start gap-3 xl:grid-cols-[minmax(100px,1fr)_80px_minmax(110px,1.1fr)_80px_92px]";

export function BikeProfilePanel({ bikeId, locale, detail }: {
  bikeId: Id<"bikes">; locale: Locale; detail: BikeProfileDetail;
}) {
  const copy = bikeProfileMessages[locale];
  const pricing = getPricingAccessCopy(locale);
  const access = useQuery(api.pricing.queries.getAccess, isPaidAccessEnforced() ? { bikeId } : "skip");
  const locked = isPaidAccessEnforced() && !access?.fullReport;
  const scoreCopy = getProfileScoreCopy(locale);
  const update = useMutation(api.bikes.profile.updateFields);
  const [draft, setDraft] = useState<Draft | null>(null);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<"saved" | "failed" | "conflict" | "invalid" | "goalChanged" | null>(null);
  if (!detail) return null;
  if (isPaidAccessEnforced() && !access) return <p role="status">{pricing.loading}</p>;
  const { bike, profileScore: score, bikeObservations, riderProfile, adjustmentRoom } = detail;
  const current = { ...bike, tires: detail.activeTireSetup ?? undefined };
  const editHref = withLocalePrefix(`/bikes/${bikeId}/edit`, locale);
  const fieldLabel = (field: string) => copy.fields[field as keyof typeof copy.fields] ?? field;
  const pointLabel = (point: string) => copy.points[point as keyof typeof copy.points] ?? copy.referenceUnknown;
  const format = (value: unknown, field: string) => {
    if (field === "year" && typeof value === "number") return String(value);
    if (field === "gearing.cassetteTeeth" && Array.isArray(value) && value.length
      && value.every((tooth) => typeof tooth === "number" && Number.isFinite(tooth))) {
      return `${Math.min(...value)}–${Math.max(...value)}`;
    }
    return displayBikeProfileValue(value, bikeFieldUnit(field), locale, copy);
  };
  const next = score.nextStep;
  const nextTitle = next ? pricing.bikeFields[next.key as keyof typeof pricing.bikeFields] ?? scoreCopy.fields[next.key as keyof typeof scoreCopy.fields] : copy.complete;
  const evidence = (field: string) => bikeObservations.find((observation) => observation.field === field
    && JSON.stringify(observation.value) === JSON.stringify(bikeProfileValue(current, field)));
  function open(field: string) {
    const value = bikeProfileValue(current, field);
    setMessage(null);
    setDraft({ field, value: typeof value === "number" || typeof value === "string" ? String(value) : "",
      expected: typeof value === "number" || typeof value === "string" ? value : null,
      kind: "declared", date: "", point: "" });
  }
  async function save(event: FormEvent) {
    event.preventDefault();
    if (!draft || saving) return;
    const value = parseBikeProfileDraft(draft.field, draft.value);
    const measuredAt = draft.date ? new Date(`${draft.date}T00:00:00`).getTime() : undefined;
    const requiredPoint = BIKE_MEASURE_POINTS[draft.field];
    if (value === null || (draft.kind === "measured" && (!measuredAt || measuredAt > Date.now()
      || (requiredPoint && draft.point !== requiredPoint)))) {
      setMessage("invalid");
      return;
    }
    setSaving(true);
    setMessage(null);
    try {
      const result = await update({ bikeId, changes: [{ field: draft.field, value,
        expectedCurrentValue: draft.expected, kind: draft.kind,
        ...(draft.kind === "measured" ? { measuredAt, ...(requiredPoint ? { measurePoint: draft.point } : {}) } : {}),
      }] });
      if (result.status === "conflict") setMessage("conflict");
      else { setDraft(null); setMessage("saved"); }
    } catch { setMessage("failed"); }
    finally { setSaving(false); }
  }
  async function chooseGoal(value: string) {
    if (saving || value === bike.primaryGoal) return;
    setSaving(true);
    setMessage(null);
    try {
      const result = await update({ bikeId, changes: [{ field: "primaryGoal", value,
        expectedCurrentValue: bike.primaryGoal ?? null, kind: "declared" }] });
      setMessage(result.status === "conflict" ? "conflict" : "goalChanged");
    } catch { setMessage("failed"); }
    finally { setSaving(false); }
  }
  return <div className="space-y-6" data-slot="bike-profile-panel">
    <section className={`${card} grid items-center gap-6 xl:grid-cols-[280px_minmax(0,1fr)_250px]`}>
      <ProfileStrengthRings score={score} locale={locale} title={copy.title} size="lg" capped={locked} />
      <div className="min-w-0">
        <h2 className="font-display text-2xl font-bold">{copy.title}</h2>
        <p className="mt-2 text-sm text-muted-foreground">{copy.intro}</p>
        {access?.enforced && <ProfileAccessNotice locale={locale} capped={locked} bike />}
        <div className="mt-5 space-y-3">
          {score.groups.map((group) => {
            const complete = group.weight ? group.completeness / group.weight * 100 : 0;
            const reliable = group.weight ? group.reliability / group.weight * 100 : 0;
            const label = copy.groups[group.key as keyof typeof copy.groups] ?? (group.key === "riding" ? pricing.riding : group.key);
            return <div key={group.key} className="grid grid-cols-[minmax(110px,1fr)_1fr_42px] items-center gap-3 text-xs">
              <span className="font-semibold">{label}</span>
              <div className="space-y-1">
                {[{ value: complete, label: scoreCopy.completeness, color: "bg-primary" },
                  { value: reliable, label: scoreCopy.reliability, color: `${reliable > 0 ? "border border-foreground " : ""}bg-[var(--bbf-lime)]` }].map((bar) =>
                  <div key={bar.label} role="meter" aria-label={`${label}: ${bar.label}`}
                    aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(bar.value)}
                    className="h-1.5 overflow-hidden rounded-full bg-secondary">
                    <div className={`h-full rounded-full ${bar.color}`} style={{ width: `${bar.value}%` }} />
                  </div>)}
              </div>
              <span className="text-right font-mono text-muted-foreground">{Math.round(complete)}%</span>
            </div>;
          })}
        </div>
      </div>
      <div className="rounded-3xl bg-[var(--bbf-lime)] p-5 text-[var(--bbf-inkt)]">
        <p className="text-xs font-bold uppercase tracking-wide">{copy.biggestGain}</p>
        <h3 className="mt-3 font-display text-xl font-bold text-inherit">{nextTitle}</h3>
        <p className="mt-2 text-sm">{next ? copy.gainHint : copy.completeHint}</p>
        {next && <a href={`#bike-profile-${next.key}`}
          className="mt-4 inline-flex min-h-11 items-center rounded-full bg-[var(--bbf-inkt)] px-4 text-sm font-bold text-[var(--bbf-wit)] focus-visible:focus-ring">
          {copy.gain.replace("{points}", new Intl.NumberFormat(locale, { maximumFractionDigits: 1 }).format(next.gain))}
        </a>}
      </div>
    </section>
    {access?.enforced && <BikeRefinements bike={bike} locale={locale} locked={locked} />}
    <Link href={`${editHref}#bike-geometry-library`}
      className="flex min-h-14 flex-wrap items-center justify-between gap-2 rounded-2xl bg-primary px-5 py-4 text-primary-foreground focus-visible:focus-ring">
      <strong>{copy.lookup}</strong><span className="text-sm">{copy.lookupHint}</span>
    </Link>
    {message && <p role={message === "saved" || message === "goalChanged" ? "status" : "alert"}
      className="rounded-2xl border border-border bg-card p-4 text-sm">{copy[message]}</p>}
    <div className="grid items-start gap-6 xl:grid-cols-[minmax(0,1fr)_300px]">
      <section className="min-w-0 overflow-hidden rounded-3xl border border-border bg-card text-card-foreground">
        <header className="border-b border-border p-5 sm:p-6">
          <h2 className="font-display text-2xl font-bold">{copy.rowsTitle}</h2>
          <p className="mt-1 text-sm text-muted-foreground">{copy.evidence}</p>
        </header>
        <div className={`${rowGrid} hidden px-5 py-3 text-xs font-bold uppercase text-muted-foreground xl:grid`}>
          {[copy.part, copy.current, copy.provenance, copy.advice, ""].map((label, index) => <span key={index}>{label}</span>)}
        </div>
        {bikeProfileRows.map((row) => {
          const rowLocked = locked && BIKE_REFINEMENT_RULES.some(rule => rule.key === row.key);
          const editing = !rowLocked && draft && row.fields.includes(draft.field as never);
          const missingField = row.editable.find((field) => bikeProfileValue(current, field) === undefined);
          return <div id={`bike-profile-${row.key}`} key={row.key} className="scroll-mt-24 border-t border-border px-5 py-4">
            <div className={rowGrid}>
              <div><h3 className="font-semibold">{scoreCopy.fields[row.key]}</h3>
                <p className="mt-1 text-xs text-muted-foreground">{copy.groups[row.group]}</p></div>
              <div className="space-y-1 font-mono text-sm">{row.fields.map((field) =>
                <p key={field}>{format(bikeProfileValue(current, field), field)}</p>)}</div>
              <div className="col-span-2 space-y-2 text-xs text-muted-foreground xl:col-span-1">
                {row.fields.map((field) => {
                  const record = evidence(field);
                  const reference = record && "measurePoint" in record ? record.measurePoint : undefined;
                  const value = bikeProfileValue(current, field);
                  return <div key={field}>
                    {row.fields.length > 1 && <p className="font-semibold">{fieldLabel(field)}</p>}
                    <span className="inline-block rounded-full bg-secondary px-2 py-1 font-semibold text-secondary-foreground">
                      {value === undefined ? copy.missing : record ? copy.kinds[record.kind] : copy.unknown}
                    </span>
                    {record && <p className="mt-1">
                      {copy.importSources[record.method as keyof typeof copy.importSources]
                        ?? copy.sources[record.source as keyof typeof copy.sources] ?? copy.sourceUnknown}
                      {" · "}{Number.isFinite(record.recordedAt)
                        ? new Intl.DateTimeFormat(locale, { dateStyle: "medium" }).format(record.recordedAt) : copy.dateUnknown}
                    </p>}
                    {!record && value !== undefined && <p className="mt-1">{copy.sourceUnknown} · {copy.dateUnknown}</p>}
                    {typeof reference === "string" && <p className="mt-1">{pointLabel(reference)}</p>}
                    {record?.kind === "measured" && BIKE_MEASURE_POINTS[field] && !reference
                      && record.source !== "geometry_database" && <p className="mt-1">{copy.referenceUnknown}</p>}
                  </div>;
                })}
              </div>
              <div className="space-y-1 font-mono text-sm">
                <span className="block font-sans text-xs text-muted-foreground xl:hidden">{copy.advice}</span>
                {row.fields.map((field) => {
                  const target = actualBikeAdvice(detail.latestRecommendation?.calculatedFit, field);
                  const now = bikeProfileValue(current, field);
                  const delta = target !== undefined && typeof now === "number" ? target - now : undefined;
                  return <p key={field}>
                    {format(target, field)}
                    {delta !== undefined && <span className="block text-xs text-muted-foreground">
                      ({delta > 0 ? "+" : ""}{new Intl.NumberFormat(locale, { maximumFractionDigits: 1 }).format(delta)})
                    </span>}
                  </p>;
                })}
              </div>
              <div className="flex justify-end">
                {rowLocked ? <p className="text-sm text-muted-foreground">{pricing.locked}</p> : row.editable.length > 0 && <Button size="sm" variant="outline" disabled={saving}
                  aria-label={`${missingField ? copy.measure : copy.edit}: ${scoreCopy.fields[row.key]}`}
                  onClick={() => open(missingField ?? row.editable[0])}>
                  {missingField ? copy.measure : copy.edit}
                </Button>}
                {!rowLocked && !row.editable.length && <Link href={`${editHref}${row.group === "drivetrain"
                  ? "#bike-settings-gearing" : row.group === "identity" ? "#bike-settings-details" : ""}`}
                  aria-label={`${copy.edit}: ${scoreCopy.fields[row.key]}`}
                  className="inline-flex min-h-11 min-w-11 items-center text-sm font-semibold text-primary underline focus-visible:focus-ring">
                  {copy.edit}
                </Link>}
              </div>
            </div>
            {editing && draft && <form onSubmit={save} className="mt-4 space-y-4 rounded-2xl bg-secondary p-4">
              {row.editable.length > 1 && <Select label={copy.part} tooltip={copy.part} tooltipLabel={copy.part} value={draft.field}
                options={row.editable.map((field) => ({ value: field, label: fieldLabel(field) }))}
                onChange={(event) => open(event.target.value)} disabled={saving} />}
              <Input label={`${fieldLabel(draft.field)}${bikeFieldUnit(draft.field) !== "none" ? ` (${bikeFieldUnit(draft.field)})` : ""}`}
                tooltip={copy.instructions[draft.field as keyof typeof copy.instructions] ?? copy.numericHint}
                tooltipLabel={fieldLabel(draft.field)} value={draft.value} disabled={saving}
                type={BIKE_PROFILE_FIELDS[draft.field].range ? "number" : "text"} step="any" maxLength={100}
                min={BIKE_PROFILE_FIELDS[draft.field].range?.[0]} max={BIKE_PROFILE_FIELDS[draft.field].range?.[1]}
                onChange={(event) => setDraft({ ...draft, value: event.target.value })} />
              <p className="text-sm text-muted-foreground">
                {copy.instructions[draft.field as keyof typeof copy.instructions] ?? copy.numericHint}
              </p>
              <Select label={copy.howDetermined} tooltip={copy.measuredHint} tooltipLabel={copy.howDetermined}
                value={draft.kind} disabled={saving}
                options={(BIKE_MEASURE_POINTS[draft.field]
                  ? ["declared", "estimated", "measured"] as const : ["declared"] as const)
                  .map((kind) => ({ value: kind, label: copy.kinds[kind] }))}
                onChange={(event) => setDraft({ ...draft, kind: event.target.value as Draft["kind"] })} />
              {draft.kind === "measured" && <>
                <Input type="date" label={copy.recordedAt} tooltip={copy.measuredHint} tooltipLabel={copy.recordedAt}
                  value={draft.date} max={new Date().toISOString().slice(0, 10)} disabled={saving}
                  onChange={(event) => setDraft({ ...draft, date: event.target.value })} />
                {BIKE_MEASURE_POINTS[draft.field] && <Select label={copy.measurePoint} tooltip={copy.measuredHint}
                  tooltipLabel={copy.measurePoint} value={draft.point} disabled={saving}
                  options={[{ value: "", label: copy.choose },
                    { value: BIKE_MEASURE_POINTS[draft.field], label: pointLabel(BIKE_MEASURE_POINTS[draft.field]) }]}
                  onChange={(event) => setDraft({ ...draft, point: event.target.value })} />}
              </>}
              <div className="flex flex-wrap gap-2">
                <Button type="submit" disabled={saving || !draft.value.trim()}>{copy.save}</Button>
                <Button type="button" variant="ghost" disabled={saving} onClick={() => { setDraft(null); setMessage(null); }}>
                  {copy.cancel}
                </Button>
              </div>
            </form>}
          </div>;
        })}
      </section>
      <aside className="space-y-5">
        <section className={card} id="bike-profile-bikeGoal">
          <h2 className="font-display text-xl font-bold">{copy.goal}</h2>
          <p className="mt-3 text-sm text-muted-foreground">{copy.goalHint}</p>
          {riderProfile?.positionPriority && <p className="mt-2 text-sm text-muted-foreground">
            {copy.goalDefault.replace("{goal}", copy.goals[riderProfile.positionPriority])}
          </p>}
          <div role="group" aria-label={copy.goal} className="mt-4 grid grid-cols-2 gap-2">
            {Object.entries(copy.goals).map(([goal, label]) => <Button key={goal} size="sm"
              variant={bike.primaryGoal === goal ? "primary" : "outline"} aria-pressed={bike.primaryGoal === goal}
              disabled={saving} onClick={() => { void chooseGoal(goal); }}>{label}</Button>)}
          </div>
        </section>
        <section className="rounded-3xl bg-[var(--bbf-inkt)] p-6 text-[var(--bbf-wit)]">
          <h2 className="font-display text-xl font-bold text-[var(--bbf-lime)]">{copy.roomTitle}</h2>
          <p className="mt-3 text-sm text-[var(--bbf-op-donker)]">
            {adjustmentRoom.status === "exceeds" ? copy.roomInsufficient : copy.roomUnknown}
          </p>
          <dl className="mt-4 space-y-2 text-sm text-[var(--bbf-op-donker)]">
            {["maxSeatpostMm", "maxSpacerStackMm"].map((field) => <div key={field}>
              <dt>{fieldLabel(field)}</dt><dd className="font-mono">{format(bikeProfileValue(current, field), field)}</dd>
            </div>)}
          </dl>
          <a href="#bike-profile-adjustment"
            className="mt-4 inline-flex min-h-11 items-center rounded-full bg-[var(--bbf-lime)] px-4 text-sm font-bold text-[var(--bbf-inkt)] focus-visible:focus-ring">
            {copy.roomAction}
          </a>
        </section>
        <section className={card}>
          <h2 className="font-display text-xl font-bold">{copy.riderTitle}</h2>
          <p className="mt-3 text-sm text-muted-foreground">{copy.riderHint}</p>
          <dl className="mt-4 grid grid-cols-2 gap-2">
            {["inseamCm", "heightCm", "sitBoneWidthMm", "armLengthCm"].map((field) =>
              <div key={field} className="rounded-2xl bg-secondary p-3">
                <dt className="text-xs text-muted-foreground">{fieldLabel(field)}</dt>
                <dd className="mt-1 font-mono">{format(bikeProfileValue(riderProfile, field), field)}</dd>
              </div>)}
          </dl>
          <Link href={withLocalePrefix("/profile", locale)} className="mt-3 inline-flex min-h-11 items-center text-sm font-semibold text-primary underline focus-visible:focus-ring">
            {copy.riderAction}
          </Link>
        </section>
      </aside>
    </div>
  </div>;
}
