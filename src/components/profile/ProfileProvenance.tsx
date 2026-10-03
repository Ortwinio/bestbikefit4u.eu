"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { useMutation, useQuery } from "convex/react";
import type { Doc } from "../../../convex/_generated/dataModel";
import { scoreRiderProfile, type ScoreObservation } from "../../../shared/profileScore";
import { PROFILE_OBSERVATION_FIELDS, validateProfileObservationValue, type ProfileObservationValue } from "../../../shared/profileObservationFields";
import { Button, Input, Select } from "@/components/ui";
import { ProfileStrengthRings } from "./ProfileStrengthRings";
import { NewsletterPreference } from "./NewsletterPreference";
import { formatProfileBirthDate, getProfileProvenanceCopy, type ProvenanceField, type ProvenanceGroup } from "@/i18n/account/profileProvenance";
import { getProfileScoreCopy } from "@/i18n/account/profileScore";
import { withLocalePrefix } from "@/i18n/navigation";
import type { Locale } from "@/i18n/config";
import { currentObservation, fieldGroups, getMyProvenance, saveObservation, scoreGroups, type ObservationDraft, type ObservationResult } from "./ProfileProvenanceModel";
import styles from "./ProfileProvenance.module.css";

type Edit = { field: ProvenanceField; text: string; method: ObservationDraft["method"] | ""; expected: ProfileObservationValue | null };

export function ProfileProvenance({ profile, locale, onWeightSaved, onEditDetails }: {
  profile: Doc<"profiles">; locale: Locale; onWeightSaved: (weight: number) => void; onEditDetails: () => void;
}) {
  const context = useQuery(getMyProvenance, {});
  const save = useMutation(saveObservation);
  const copy = getProfileProvenanceCopy(locale);
  const scoreCopy = getProfileScoreCopy(locale);
  const [group, setGroup] = useState<ProvenanceGroup>("all");
  const [edit, setEdit] = useState<Edit | null>(null);
  const [conflict, setConflict] = useState<Extract<ObservationResult, { status: "conflict" }> | null>(null);
  const [pending, setPending] = useState(false);
  const [status, setStatus] = useState<"saved" | "error" | "remeasure" | null>(null);
  const [now] = useState(() => Date.now());
  const saving = useRef(false);
  const values = context?.profile ?? profile;
  const observations = context?.observations ?? [];
  const scoreObservations: ScoreObservation[] = observations.filter(observation =>
    currentObservation(observations, observation.field, (values as Record<string, unknown>)[observation.field]) === observation
  ).map(observation => {
    const { value, ...metadata } = observation;
    return Array.isArray(value) ? metadata : { ...metadata, value };
  });
  const score = context === undefined ? null : scoreRiderProfile({ profile: values, observations: scoreObservations }, now);
  const names: Record<ProvenanceField, string> = { ...copy.fields, ...copy.additionalFields };
  const valueOf = (field: string) => (values as Record<string, unknown>)[field];
  const labelValue = (value: unknown, field?: string): string => {
    if (field === "birthDate") return formatProfileBirthDate(value, locale) ?? "—";
    if (value === undefined || value === null || value === "") return "—";
    if (Array.isArray(value)) return value.map(item => labelValue(item)).join(", ") || "—";
    if (typeof value === "number") return value.toLocaleString(locale);
    return copy.values[String(value) as keyof typeof copy.values] ?? copy.protocols[String(value) as keyof typeof copy.protocols] ?? String(value);
  };
  const unit = (field: string) => {
    const value = PROFILE_OBSERVATION_FIELDS[field]?.unit ?? currentObservation(observations, field, valueOf(field))?.unit
      ?? (field === "hipCircumferenceCm" ? "cm" : "");
    return ["none", "score", "date"].includes(value) ? "" : value;
  };
  const fields = (group === "all" ? Object.values(fieldGroups).flat() : fieldGroups[group])
    .filter(field => PROFILE_OBSERVATION_FIELDS[field] || valueOf(field) !== undefined);
  const groupStats = (key: ProvenanceGroup) => {
    const items = key === "all" ? score?.items ?? [] : (score?.items ?? []).filter(item => scoreGroups[key].includes(item.key));
    const weight = items.reduce((sum, item) => sum + item.weight, 0);
    return { complete: Math.round(items.reduce((sum, item) => sum + item.completeness, 0) / (weight || 1) * 100),
      reliable: Math.round(items.reduce((sum, item) => sum + item.reliability, 0) / (weight || 1) * 100) };
  };
  const tips = (score?.items ?? []).filter(item => item.key !== "complaints" && item.gain > .5).sort((first, second) => second.gain - first.gain).slice(0, 3);

  function startEdit(field: ProvenanceField) {
    if (field === "painAreas") { onEditDetails(); return; }
    const value = valueOf(field);
    setEdit({ field, text: value === undefined ? "" : String(value), method: "", expected: value === undefined ? null : value as ProfileObservationValue });
    setConflict(null);
    setStatus(null);
  }

  async function submit(expected?: ProfileObservationValue | null) {
    if (!edit || !edit.method || saving.current) return;
    let value: ProfileObservationValue;
    try {
      if (!edit.text.trim()) throw new Error();
      value = validateProfileObservationValue(edit.field, PROFILE_OBSERVATION_FIELDS[edit.field].range ? Number(edit.text) : edit.text);
    } catch { setStatus("error"); return; }
    saving.current = true;
    setPending(true);
    setStatus(null);
    try {
      const result = await save({ field: edit.field, value, method: edit.method,
        kind: edit.method === "self_assessment" ? "estimated" : edit.method === "self_report" ? "declared" : "measured",
        expectedCurrentValue: expected === undefined ? edit.expected : expected });
      if (result.status === "conflict") { setConflict(result); return; }
      setEdit(null);
      setConflict(null);
      setStatus("saved");
      if (edit.field === "weightKg" && typeof value === "number" && value !== (expected === undefined ? edit.expected : expected)) onWeightSaved(value);
    } catch { setStatus("error"); }
    finally { saving.current = false; setPending(false); }
  }

  return <div className={styles.view}>
    {conflict && <section className={styles.conflict} role="alert">
      <h2 className={styles.heading}>{copy.conflict} {names[conflict.field as ProvenanceField]}</h2>
      {(conflict.field === "sex" || conflict.field === "birthDate") && <p>{copy.demographicReasons[conflict.field]} {copy.demographicNote}</p>}
      <p>{copy.current}: <strong>{labelValue(conflict.currentValue, conflict.field)} {unit(conflict.field)}</strong> · {copy.incoming}: <strong>{labelValue(conflict.incomingValue, conflict.field)} {unit(conflict.field)}</strong></p>
      <p>{copy.noOverwrite}</p>
      <div className={styles.actions}>
        <Button variant="outline" disabled={pending} onClick={() => { setConflict(null); setEdit(null); setStatus(null); }}>{copy.keepCurrent}</Button>
        <Button disabled={pending} isPending={pending} onClick={() => void submit(conflict.currentValue)}>{copy.useIncoming}</Button>
        <Button variant="outline" disabled={pending} onClick={() => { setConflict(null); setEdit(null); setStatus("remeasure"); }}>{copy.remeasure}</Button>
      </div>
    </section>}
    {score ? <section className={styles.summary}>
      <ProfileStrengthRings score={score} locale={locale} title={copy.score} />
      <div className={styles.summaryText}>
        <div><h2 className={styles.heading}>{scoreCopy.levels[score.level]}</h2><Link className={styles.link} href={withLocalePrefix("/profile/score", locale)}>{copy.explanation}</Link></div>
        <p>{copy.scoreDescription}</p>
        <div className={styles.filters} role="group" aria-label={copy.filter}>
          {(Object.keys(copy.groups) as ProvenanceGroup[]).map(key => {
            const stats = groupStats(key);
            return <Button key={key} variant="outline" aria-pressed={group === key} onClick={() => setGroup(key)}>
              <strong>{copy.groups[key]}</strong>
              <progress className={styles.bar} max={100} value={stats.complete} aria-label={`${copy.groups[key]}: ${copy.complete}`} />
              <progress className={`${styles.bar} ${styles.reliable}`} max={100} value={stats.reliable} aria-label={`${copy.groups[key]}: ${copy.reliable}`} />
              <small>{stats.complete}% · {stats.reliable}%</small>
            </Button>;
          })}
        </div>
        <p>{copy.complete} · {copy.reliable}</p>
      </div>
    </section> : <p role="status">{copy.loading}</p>}
    {status && <p role={status === "error" ? "alert" : "status"}>{status === "remeasure" ? copy.remeasureHint : copy[status]}</p>}
    <div className={styles.columns}>
      <section className={styles.card} aria-label={group === "all" ? copy.allData : copy.groups[group]}>
        <div className={styles.cardHeader}><h2 className={styles.heading}>{group === "all" ? copy.allData : copy.groups[group]}</h2><p>{copy.provenance}</p></div>
        {fields.map(field => {
          const value = valueOf(field);
          const missing = value === undefined || value === null || value === "" || (Array.isArray(value) && value.length === 0);
          const observation = currentObservation(observations, field, value);
          const definition = PROFILE_OBSERVATION_FIELDS[field];
          const date = observation && Number.isFinite(observation.recordedAt) && observation.recordedAt > 0 ? new Date(observation.recordedAt) : null;
          const editing = edit?.field === field;
          const allowedMethods: ObservationDraft["method"][] = definition?.kind === "declared" ? ["self_report"] : definition?.kind === "estimated" ? ["self_assessment"] : field === "ftpWatts" ? ["single_measurement", "ftp_test", "self_assessment"] : ["single_measurement", "self_assessment"];
          return <div key={field} className={styles.row}>
            <div className={styles.rowMain}>
              <strong>{names[field]}</strong><span className={styles.value}>{labelValue(value, field)} {!missing && unit(field)}</span>
              <div className={styles.metadata}>
                <span className={`${styles.chip} ${observation ? styles[observation.kind] ?? "" : ""}`}>{missing ? copy.missing : observation ? copy.kinds[observation.kind] : copy.unknown}</span>
                {!missing && <>
                  <span>{observation ? observation.method === "legacy_height_formula" ? copy.legacyFormula : observation.method === "legacy_default" ? copy.legacyDefault : copy.saveMethods[observation.method as keyof typeof copy.saveMethods] ?? copy.methodLabels[observation.method as keyof typeof copy.methodLabels] ?? copy.unknownMethod : copy.unknownMethod}</span>
                  <span>{observation ? copy.sourceLabels[observation.source as keyof typeof copy.sourceLabels] ?? copy.unknownSource : copy.unknownSource}</span>
                  {date ? <time dateTime={date.toISOString()}>{copy.recorded} {date.toLocaleDateString(locale === "nl" ? "nl-NL" : "en-GB", { day: "numeric", month: "short", year: "numeric" })}</time> : <span>{copy.unknownDate}</span>}
                </>}
              </div>
              {definition && <Button variant="outline" disabled={pending || Boolean(conflict) || context === undefined} aria-label={`${missing ? copy.add : copy.edit}: ${names[field]}`} onClick={() => startEdit(field)}>{missing ? copy.add : copy.edit}</Button>}
            </div>
            {(field === "sex" || field === "birthDate") && <p>{copy.demographicReasons[field]} {copy.demographicNote}</p>}
            {editing && definition && <form className={styles.editor} onSubmit={event => { event.preventDefault(); if (!conflict) void submit(); }}>
              {definition.options ? <Select label={names[field]} tooltip={copy.valueHelp} tooltipLabel={names[field]} placeholder={copy.choose} value={edit.text} disabled={pending || Boolean(conflict)} options={definition.options.map(option => ({ value: option, label: labelValue(option) }))} onChange={event => setEdit({ ...edit, text: event.target.value })} />
                : <Input label={`${names[field]}${unit(field) ? ` (${unit(field)})` : ""}`} tooltip={field === "birthDate" ? copy.dateHelp : copy.valueHelp} tooltipLabel={names[field]} type={field === "birthDate" ? "date" : definition.range ? "number" : "text"} min={definition.range?.[0]} max={definition.range?.[1]} step={["coreStabilityScore", "painSeverity", "age"].includes(field) ? 1 : "any"} maxLength={100} required value={edit.text} disabled={pending || Boolean(conflict)} onChange={event => setEdit({ ...edit, text: event.target.value })} />}
              <Select label={copy.kind} tooltip={copy.methodHelp} tooltipLabel={copy.kind} value={edit.method} placeholder={copy.choose} disabled={pending || Boolean(conflict)} options={allowedMethods.map(method => ({ value: method, label: copy.saveMethods[method] }))} onChange={event => setEdit({ ...edit, method: event.target.value as ObservationDraft["method"] })} />
              <div className={styles.actions}><Button type="submit" disabled={!edit.method || !edit.text.trim() || Boolean(conflict)} isPending={pending}>{copy.save}</Button><Button type="button" variant="ghost" disabled={pending} onClick={() => { setEdit(null); setConflict(null); setStatus(null); }}>{copy.cancel}</Button></div>
            </form>}
          </div>;
        })}
      </section>
      <aside className={styles.aside}>
        <section className={styles.tips}><h2>{copy.improve}</h2>{tips.map(tip => <div key={tip.key} className={styles.tip}><strong>{scoreCopy.fields[tip.key as keyof typeof scoreCopy.fields]}</strong><span>{copy.upTo} +{tip.gain.toLocaleString(locale, { maximumFractionDigits: 1 })} {copy.points}</span><p>{copy.improveHint}</p></div>)}{!score ? <p>{copy.loading}</p> : !tips.length && <p>{copy.allComplete}</p>}</section>
        <section className={styles.legend}><h2>{copy.legend}</h2>{(["measured", "estimated", "derived", "declared"] as const).map(kind => <div key={kind} className={styles.legendItem}><span className={`${styles.chip} ${styles[kind] ?? ""}`}>{copy.kinds[kind]}</span><p>{copy.kindHints[kind]}</p></div>)}<p>{copy.legacy}</p><p>{copy.ruleNote}</p></section>
        <section className={styles.privacy}><h2>{copy.privacy}</h2><p>{copy.privacyText}</p><Link className={styles.link} href={withLocalePrefix("/settings", locale)}>{copy.privacyLink}</Link><NewsletterPreference locale={locale} /></section>
      </aside>
    </div>
  </div>;
}
