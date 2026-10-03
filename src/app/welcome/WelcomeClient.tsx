"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useConvexAuth, useMutation, useQuery } from "convex/react";
import { BrandLogo } from "@/components/branding/BrandLogo";
import { Button, Input, Select, Slider } from "@/components/ui";
import { ProfileStrengthRings } from "@/components/profile/ProfileStrengthRings";
import { useProfileAccess } from "@/hooks/useProfileAccess";
import { getWelcomeCopy } from "@/i18n/account/welcome";
import { getProfileScoreCopy } from "@/i18n/account/profileScore";
import { useDashboardMessages } from "@/i18n/useDashboardMessages";
import { withLocalePrefix } from "@/i18n/navigation";
import type { Locale } from "@/i18n/config";
import { clearHandoff, readHandoff, type HandoffEntry, type HandoffField } from "@/lib/handoff/store";
import { scoreBike, scoreRiderProfile, type BikeValues, type RiderValues, type ScoreObservation } from "../../../shared/profileScore";
import { asBikeType, bikeTypes, bounds, enumValues, flexibilityValues, getHandoffContext, importHandoff, profileField, profileValue, riderFields, type BikeType, type Conflict, type Context, type Resolution } from "./handoff";
import styles from "./Welcome.module.css";

const subscribeReady = () => () => {};

export default function WelcomeClient() {
  const { locale } = useDashboardMessages();
  const text = getWelcomeCopy(locale);
  const router = useRouter();
  const { isAuthenticated, isLoading } = useConvexAuth();
  const ready = useSyncExternalStore(subscribeReady, () => true, () => false);
  const context = useQuery(getHandoffContext, isAuthenticated ? {} : "skip");

  useEffect(() => {
    if (!isLoading && !isAuthenticated) router.replace(`${withLocalePrefix("/login", locale)}?handoff=1`);
  }, [isLoading, isAuthenticated, locale, router]);

  if (!ready || isLoading || !isAuthenticated || context === undefined) return <main className={styles.status} role="status">{text.loading}</main>;
  return <WelcomeReview locale={locale} context={context} />;
}

function WelcomeReview({ locale, context }: { locale: Locale; context: Context }) {
  const access = useProfileAccess();
  const text = getWelcomeCopy(locale);
  const router = useRouter();
  const save = useMutation(importHandoff);
  const [entries, setEntries] = useState(() => readHandoff().entries);
  const [omitted, setOmitted] = useState<Set<HandoffField>>(() => new Set());
  const [editing, setEditing] = useState<HandoffField | null>(null);
  const [bikeKeep, setBikeKeep] = useState(false);
  const [bikeName, setBikeName] = useState("");
  const [bikeType, setBikeType] = useState<BikeType | "">(() => asBikeType(entries.find(entry => entry.field === "bikeCategory")?.value));
  const [measurePoint, setMeasurePoint] = useState(false);
  const [flex, setFlex] = useState(3);
  const [flexEntry, setFlexEntry] = useState<HandoffEntry | null>(null);
  const [resolutions, setResolutions] = useState<Resolution[]>([]);
  const [serverConflicts, setServerConflicts] = useState<Conflict[]>([]);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState(false);
  const [scoreTime] = useState(() => Date.now());
  const saving = useRef(false);
  const selected = entries.filter(entry => !omitted.has(entry.field) && (riderFields.has(entry.field) || bikeKeep));
  if (flexEntry) selected.push(flexEntry);
  const currentProfile = context.profile as Record<string, unknown> | null;
  const conflicts: Conflict[] = selected.flatMap(entry => {
    if (!riderFields.has(entry.field)) return [];
    const server = serverConflicts.find(conflict => conflict.field === entry.field);
    if (server) return [server];
    const current = currentProfile?.[profileField(entry.field)];
    return (typeof current === "number" || typeof current === "string") && current !== profileValue(entry)
      ? [{ field: entry.field, currentValue: current, incomingValue: profileValue(entry), unit: entry.unit }] : [];
  });
  const resolutionFor = (conflict: Conflict) => resolutions.find(resolution => resolution.field === conflict.field && resolution.expectedCurrentValue === conflict.currentValue);
  const unresolved = conflicts.some(conflict => !resolutionFor(conflict));
  const saddleSelected = selected.some(entry => entry.field === "currentSaddleHeightMm");
  const bikeValid = !bikeKeep || (bikeName.trim().length > 0 && bikeName.trim().length <= 100 && bikeType !== "" && (!saddleSelected || measurePoint));
  const showFlex = !entries.some(entry => entry.field === "flexibilityScore") && !context.profile?.flexibilityScore;
  const preview: Record<string, unknown> = { ...context.profile };
  let observations: ScoreObservation[] = [...context.observations];
  for (const entry of selected.filter(entry => riderFields.has(entry.field))) {
    const conflict = conflicts.find(conflict => conflict.field === entry.field);
    if (conflict && resolutionFor(conflict)?.choice !== "today") continue;
    const field = profileField(entry.field);
    preview[field] = profileValue(entry);
    observations = observations.filter(observation => observation.field !== field);
    observations.push({ field, value: profileValue(entry), kind: entry.method === "bike" ? "declared" : entry.method, method: entry.method, recordedAt: entry.touchedAt, status: "current" });
  }
  const score = scoreRiderProfile({ profile: preview as RiderValues, observations }, scoreTime, access);
  const bikePreview: BikeValues = { ...(bikeType ? { bikeType } : {}), currentSetup: {} };
  const bikeObservations: ScoreObservation[] = [];
  for (const entry of selected.filter(entry => !riderFields.has(entry.field))) {
    const setting = entry.field === "currentSaddleHeightMm" && measurePoint ? "saddleHeightMm"
      : entry.field === "currentCrankLengthMm" ? "crankLengthMm" : null;
    if (setting && typeof entry.value === "number") bikePreview.currentSetup![setting] = entry.value;
    const field = setting ? `currentSetup.${setting}` : entry.field === "bikeCategory" ? "bikeType" : entry.field;
    bikeObservations.push({ field, value: entry.field === "bikeCategory" ? bikeType || entry.value : entry.value,
      kind: entry.method === "bike" ? "declared" : entry.method, method: entry.method,
      recordedAt: entry.touchedAt, source: "public_handoff", status: "current",
      ...(setting === "saddleHeightMm" ? { measurePoint: "bb_center_to_saddle_top" } : {}),
    });
  }
  const bikeAccess = { enforced: access.enforced, fullReport: !access.enforced || access.access?.fullReport === true };
  const bikeScore = scoreBike({ bike: bikeKeep ? bikePreview : null, observations: bikeObservations }, scoreTime, bikeAccess);
  const labelValue = (value: number | string) => typeof value === "number" ? value.toLocaleString(locale) : text.values[value as keyof typeof text.values] ?? text.extraValues[value as keyof typeof text.extraValues] ?? value;
  const unitLabel = (unit: string) => unit === "none" || unit === "score" ? "" : unit === "teeth" ? "T" : unit;
  const resetResolution = (field: string) => {
    setResolutions(previous => previous.filter(resolution => resolution.field !== field));
    setServerConflicts(previous => previous.filter(conflict => conflict.field !== field));
  };
  const editEntry = (field: HandoffField, value: number | string) => {
    setEntries(previous => previous.map(entry => entry.field === field ? { ...entry, value, touchedAt: Date.now() } : entry));
    if (field === "bikeCategory") setBikeType(asBikeType(value));
    resetResolution(field);
  };

  async function confirm(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (saving.current || unresolved || !bikeValid) return;
    saving.current = true;
    setPending(true);
    setError(false);
    try {
      const result = await save({ records: selected,
        ...(resolutions.length ? { resolutions: resolutions.filter(resolution => selected.some(entry => entry.field === resolution.field)) } : {}),
        ...(bikeKeep && bikeType ? { bike: { name: bikeName.trim(), bikeType, ...(saddleSelected && measurePoint ? { saddleHeightMeasurePoint: "bb_center_to_saddle_top" as const } : {}) } } : {}),
      });
      if (result.status === "conflicts") {
        setServerConflicts(result.conflicts);
        setResolutions(previous => previous.filter(resolution => !result.conflicts.some(conflict => conflict.field === resolution.field)));
        saving.current = false;
        setPending(false);
        return;
      }
      clearHandoff();
      router.replace(withLocalePrefix("/dashboard", locale));
    } catch {
      setError(true);
      saving.current = false;
      setPending(false);
    }
  }

  function renderEntry(entry: HandoffEntry) {
    const keep = !omitted.has(entry.field);
    const active = keep && (riderFields.has(entry.field) || bikeKeep);
    const options = enumValues[entry.field];
    const numeric = entry.unit !== "none";
    const fieldLabel = text.fields[entry.field];
    return <div key={entry.field} className={`${styles.row} ${keep ? "" : styles.omitted}`}>
      <div><strong>{fieldLabel}</strong><div className={styles.source}>{text.calculators[entry.calculator]} · {new Date(entry.touchedAt).toLocaleDateString(locale)}</div></div>
      <span className={`${styles.value} ${options || entry.field === "flexibilityScore" ? styles.enumValue : ""}`}>{labelValue(entry.field === "flexibilityScore" ? profileValue(entry) : entry.value)} {unitLabel(entry.unit)}</span>
      <span className={styles.chip}>{text.methods[entry.method]}</span>
      <div className={styles.actions}>
        <Button type="button" variant="outline" aria-label={`${keep ? text.omit : text.keep}: ${fieldLabel}`} aria-pressed={keep} className={keep ? styles.selected : undefined} onClick={() => {
          setOmitted(previous => { const next = new Set(previous); if (next.has(entry.field)) next.delete(entry.field); else next.add(entry.field); return next; });
          resetResolution(entry.field);
        }}>{keep ? `${text.keep} ✓` : text.omit}</Button>
        <Button type="button" variant="ghost" className={styles.textAction} aria-label={`${text.adjust}: ${fieldLabel}`} aria-expanded={editing === entry.field} aria-controls={`edit-${entry.field}`} onClick={() => setEditing(editing === entry.field ? null : entry.field)}>{text.adjust}</Button>
      </div>
      {editing === entry.field && <div className={styles.editor} id={`edit-${entry.field}`}>
        {options ? <Select label={fieldLabel} value={String(entry.value)} disabled={!active} options={[...new Set([String(entry.value), ...options])].map(value => ({ value, label: String(labelValue(value)) }))} onChange={event => editEntry(entry.field, event.target.value)} />
          : <Input label={fieldLabel} type={numeric ? "number" : "text"} value={entry.value} disabled={!active} min={bounds[entry.field]?.[0]} max={bounds[entry.field]?.[1]} maxLength={100} step={entry.unit === "score" || entry.unit === "teeth" ? 1 : "any"} required={active} onChange={event => editEntry(entry.field, numeric && event.target.value !== "" ? Number(event.target.value) : event.target.value)} />}
      </div>}
    </div>;
  }

  return <div className={styles.page}>
    <header className={styles.header}><BrandLogo href={withLocalePrefix("/dashboard", locale)} className={styles.logo} /><span className={styles.muted}>{text.step}</span></header>
    <form onSubmit={confirm}>
      <fieldset disabled={pending} className={styles.main}>
        <main className={styles.stack}>
          <div className={styles.intro}><span className={styles.eyebrow}>{text.welcome}</span><h1>{text.title}</h1><p className={styles.muted}>{text.intro}</p></div>
          {conflicts.map(conflict => <section key={conflict.field} className={styles.conflict} role="alert" aria-label={`${text.conflict}: ${text.fields[conflict.field as HandoffField]}`}>
            <h2>{text.conflict}: {text.fields[conflict.field as HandoffField]}</h2>
            <p>{text.profileValue}: <strong>{labelValue(conflict.currentValue)} {unitLabel(conflict.unit)}</strong> · {text.incomingValue}: <strong>{labelValue(conflict.incomingValue)} {unitLabel(conflict.unit)}</strong></p>
            <div className={styles.actions}>{(["profile", "today", "remeasure"] as const).map(choice => <Button key={choice} type="button" variant="outline" aria-pressed={resolutionFor(conflict)?.choice === choice} onClick={() => setResolutions(previous => [...previous.filter(resolution => resolution.field !== conflict.field), { field: conflict.field, choice, expectedCurrentValue: conflict.currentValue }])}>{text[choice]}</Button>)}</div>
            {resolutionFor(conflict)?.choice === "remeasure" && <p>{text.remeasureHint}</p>}
          </section>)}
          <section className={styles.card} aria-label={text.rider}>
            <div className={styles.cardHeader}><h2>{text.rider}</h2><span>{text.riderHint}</span></div>
            {entries.filter(entry => riderFields.has(entry.field)).map(renderEntry)}
            {!entries.some(entry => riderFields.has(entry.field)) && <p className={styles.notice}>{text.empty}</p>}
          </section>
          {entries.some(entry => !riderFields.has(entry.field)) && <section className={styles.card} aria-label={text.bike}>
            <div className={styles.cardHeader}><h2>{text.bike}</h2><span>{text.bikeHint}</span></div>
            <div className={styles.bikeSettings}>
              <Button type="button" variant="outline" aria-pressed={bikeKeep} onClick={() => setBikeKeep(!bikeKeep)}>{bikeKeep ? `${text.createBike} ✓` : text.later}</Button>
              {bikeKeep && <>
                <Input label={text.bikeName} value={bikeName} maxLength={100} required onChange={event => setBikeName(event.target.value)} />
                <Select label={text.bikeType} placeholder={text.choose} value={bikeType} options={bikeTypes.map(value => ({ value, label: text.values[value] }))} onChange={event => {
                  setBikeType(asBikeType(event.target.value));
                  if (entries.some(entry => entry.field === "bikeCategory")) editEntry("bikeCategory", event.target.value);
                }} />
                {saddleSelected && <Select label={text.measurePoint} helperText={text.measurePointHint} placeholder={text.choose} value={measurePoint ? "bb_center_to_saddle_top" : ""} options={[{ value: "bb_center_to_saddle_top", label: text.measurePointOption }]} onChange={event => setMeasurePoint(event.target.value === "bb_center_to_saddle_top")} />}
              </>}
            </div>
            {entries.filter(entry => !riderFields.has(entry.field)).map(renderEntry)}
          </section>}
          {error && <p role="alert" className={styles.conflict}>{text.error}</p>}
        </main>
        <aside className={styles.aside}>
          <section className={styles.scores} aria-label={text.start}>
            <h2>{text.start}</h2>
            {access.isLoading ? <p role="status">{text.loading}</p> :
              <ProfileStrengthRings score={score} locale={locale} size="lg" title={text.riderScore}
                capped={access.enforced && !access.fullProfile} />}
            {bikeKeep && !access.isLoading && <ProfileStrengthRings score={bikeScore} locale={locale} size="sm"
              capped={bikeAccess.enforced && !bikeAccess.fullReport} title={bikeName.trim() ? `${text.bikeScore} · ${bikeName.trim()}` : text.bikeScore} />}
            <p>{text.scoreHint}</p>
            <p><Link className={styles.scoreExplanation} href={withLocalePrefix("/profile/score", locale)}>{getProfileScoreCopy(locale).explanationLink}</Link></p>
          </section>
          {showFlex && <section className={styles.question}>
            <div className={styles.questionHeader}><span>{text.first}</span><span>{text.gain}</span></div>
            <h2>{text.question}</h2>
            <Slider label={text.fields.flexibilityScore} min={1} max={5} step={1} value={flex} valueLabel={text.values[flexibilityValues[flex - 1]]} onChange={value => { setFlex(value); setFlexEntry(null); resetResolution("flexibilityScore"); }} />
            <p>{text.flexHint}</p>
            {flexEntry && <p role="status">{text.flexKept}</p>}
            <Button type="button" variant="outline" aria-pressed={Boolean(flexEntry)} onClick={() => {
              setFlexEntry(flexEntry ? null : { field: "flexibilityScore", value: flex, unit: "score", calculator: "bike-fit", method: "estimated", touchedAt: Date.now() });
              resetResolution("flexibilityScore");
            }}>{flexEntry ? text.omit : text.keep}</Button>
          </section>}
        </aside>
        <div className={`${styles.actions} ${styles.footer}`}>
          <Button type="submit" disabled={unresolved || !bikeValid} isPending={pending}>{pending ? text.saving : text.confirm}</Button>
          <Button type="button" variant="ghost" className={styles.textAction} onClick={() => { if (saving.current) return; clearHandoff(); router.replace(withLocalePrefix("/dashboard", locale)); }}>{text.cancel}</Button>
        </div>
      </fieldset>
    </form>
  </div>;
}
