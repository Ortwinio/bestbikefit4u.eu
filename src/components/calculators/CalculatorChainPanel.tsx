"use client";

import Link from "next/link";
import { useState, type ReactNode } from "react";
import type { Locale } from "@/i18n/config";
import { withLocalePrefix } from "@/i18n/navigation";
import { calculatorChainMessages } from "@/i18n/account/calculatorChain";
import { handoffMessages } from "@/i18n/calculators/handoff";
import type { HandoffCalculator } from "@/lib/handoff/store";
import { accountCalculatorPath, chooseNextCalculator } from "@/lib/calculators/nextCalculator";
import type { ChainInput, ChainKind, ChainValue } from "@/lib/calculators/chain";
import type { ChainPanelController } from "./useCalculatorChain";
import { Button, Select } from "@/components/ui";
import { AdviceReliability } from "@/components/profile/AdviceReliability";
import { CalculatorChainSlotsContext } from "./CalculatorChainSlots";
import { BIKE_RULES, RIDER_RULES, scoreAdviceReliability,
  type RiderValues, type BikeValues, type ScoreObservation } from "../../../shared/profileScore";

export interface CalculatorChainContext {
  profile: (RiderValues & { sweatProfile?: string }) | null;
  bikes: Array<BikeValues & { _id: string; name?: string }>;
  observations: readonly ScoreObservation[];
  bikeObservations: readonly ScoreObservation[];
  advice?: readonly { calculator: string; updatedAt?: number; bikeId?: string; stale?: boolean }[];
  activeTireSetup?: { widthFrontMm?: number; widthRearMm?: number; tubeType?: string } | null;
}
export interface CalculatorChainPanelProps {
  calculator: HandoffCalculator;
  locale: Locale;
  chain: ChainPanelController;
  context?: CalculatorChainContext | null;
  bikeId?: string;
}

function displayValue(value: ChainValue | undefined, unit: string | undefined, locale: Locale) {
  if (value === undefined || value === null) return calculatorChainMessages[locale].missing;
  if (Array.isArray(value)) return value.join(" / ");
  if (typeof value === "string") return calculatorChainMessages[locale].values[value] ?? handoffMessages[locale].values[value] ?? value;
  const result = new Intl.NumberFormat(locale, { maximumFractionDigits: 2 }).format(value);
  return unit && !["none", "score"].includes(unit) ? `${result} ${unit}` : result;
}
function setPath(target: Record<string, unknown>, path: string, value: unknown) {
  const keys = path.split(".");
  let node = target;
  for (const key of keys.slice(0, -1)) {
    node[key] = { ...(node[key] as Record<string, unknown> | undefined) };
    node = node[key] as Record<string, unknown>;
  }
  node[keys.at(-1)!] = value;
}
function adviceScore({ chain, context, bikeId }: CalculatorChainPanelProps, now: number) {
  const profile: Record<string, unknown> = { ...context?.profile };
  const bike: Record<string, unknown> = { ...context?.bikes.find((item) => item._id === bikeId) };
  if (context?.activeTireSetup) bike.tires = context.activeTireSetup;
  const observations = [...context?.observations ?? [],
    ...context?.bikeObservations.filter((item) => item.bikeId === bikeId) ?? []];
  const overrides = [...new Map([...chain.trialChanges, ...chain.pendingChanges]
    .map((change) => [`${change.source}:${change.field}`, change])).values()];
  for (const change of overrides) {
    setPath(change.source === "profile" ? profile : bike, change.field, change.value);
    const existing = observations.findIndex((item) => item.field === change.field
      && (change.source === "bike" ? item.bikeId === bikeId : !item.bikeId));
    if (existing >= 0) observations.splice(existing, 1);
    observations.push({ field: change.field, value: change.value ?? undefined, kind: change.kind,
      status: "current", ...(change.source === "bike" ? { bikeId } : {}), measurePoint: change.measurePoint });
  }
  const fields = (source: "profile" | "bike", allowed: readonly string[]) => chain.usedInputs
    .filter((input) => input.source === source && allowed.includes(input.field)).map((input) => input.field);
  return scoreAdviceReliability({ profile, bike, observations,
    riderFields: fields("profile", RIDER_RULES.flatMap((rule) => rule.fields)),
    bikeFields: fields("bike", BIKE_RULES.flatMap((rule) => rule.fields)),
  }, now);
}

export function CalculatorChainPanel(props: CalculatorChainPanelProps) {
  const { chain, locale } = props;
  const copy = calculatorChainMessages[locale];
  const [now] = useState(() => Date.now());
  const used = chain.usedInputs.filter((input) => input.value !== undefined && input.value !== null);
  const missing = chain.usedInputs.filter((input) => input.value === undefined || input.value === null);
  const changes = [...chain.pendingChanges, ...chain.trialChanges].filter((change, index, all) =>
    all.findIndex((item) => item.field === change.field && item.source === change.source) === index);
  const inputDate = (input: ChainInput) => !changes.some((item) => item.field === input.field) && input.recordedAt
    ? new Intl.DateTimeFormat(locale, { day: "numeric", month: "short", year: "numeric" }).format(input.recordedAt)
    : copy.unknownDate;
  const label = (field: string) => copy.fields[field] ?? field;
  const score = adviceScore(props, now);
  return <div className="space-y-4" data-slot="calculator-chain-panel">
    <section className="rounded-3xl border border-border bg-card p-5 text-card-foreground sm:p-6">
      <h2 className="font-display text-2xl font-bold">{copy.used}</h2>
      <p className="mt-2 text-sm text-muted-foreground">{copy.usedHint}</p>
      <dl className="mt-4 divide-y divide-border">
        {used.map((input) => <div key={`${input.source}:${input.field}`}
          className="flex flex-wrap items-center justify-between gap-3 py-3">
          <dt><strong>{label(input.field)}</strong><p className="text-xs text-muted-foreground">
            {changes.some((item) => item.field === input.field)
              ? chain.autoSaveProfile ? copy.pendingSave : copy.trial : input.source === "bike" ? copy.bike : copy.profile}
          </p></dt>
          <dd className="flex flex-wrap items-center gap-2">
            <span className="font-mono">{displayValue(input.value, input.unit, locale)}</span>
            <span className="rounded-full bg-muted px-2 py-1 text-xs text-muted-foreground">
              {copy.kinds[input.kind ?? "declared"]}{" · "}{inputDate(input)}
            </span>
          </dd>
        </div>)}
      </dl>
      {missing.length > 0 && <div className="mt-4 rounded-2xl bg-muted p-4">
        <h3 className="font-semibold">{copy.missingTitle}</h3>
        <ul className="mt-2 space-y-2 text-sm">
          {missing.map((input) => <li key={`${input.source}:${input.field}`}>
            <strong>{label(input.field)}</strong>{" · "}{copy.gain[input.field] ?? copy.gain.default}
          </li>)}
        </ul><p className="mt-3 text-sm text-muted-foreground">{copy.missingHint}</p>
      </div>}
      {changes.length > 0 && <div className="mt-4 space-y-3 rounded-2xl bg-muted p-4">
        <h3 className="font-semibold">{chain.autoSaveProfile ? copy.automaticChoice : copy.choice}</h3>
        {chain.autoSaveProfile && <p className="text-sm">{copy.automaticHint}</p>}
        {changes.map((change) => <div key={`${change.source}:${change.field}`} className="space-y-2">
          <p className="text-sm"><strong>{label(change.field)}</strong>{": "}
            <span className="font-mono">{displayValue(change.expectedCurrentValue, undefined, locale)}</span>
            {" → "}<span className="font-mono">{displayValue(change.value, undefined, locale)}</span>
          </p>
          {typeof change.value === "number" && change.kind !== "derived" && <Select
            label={`${copy.method} · ${label(change.field)}`}
            tooltip={copy.method}
            options={(change.field === "flexibilityScore" || change.field === "coreStabilityScore"
              ? ["estimated", "declared"] : ["measured", "estimated", "declared"]).map((kind) =>
                ({ value: kind, label: copy.kinds[kind as ChainKind] }))}
            value={change.kind}
            onChange={(event) => chain.setChangeKind(change.field, event.target.value as ChainKind)}
          />}
          {change.field === "currentSetup.saddleHeightMm" && change.kind === "measured" && <Select
            label={copy.measurePoint} tooltip={copy.measurePointHint}
            placeholder={copy.measurePoint} value={change.measurePoint ?? ""}
            options={[{ value: "bb_center_to_saddle_top", label: copy.measurePointLabel }]}
            onChange={(event) => chain.setChangeKind(change.field, "measured",
              event.target.value === "bb_center_to_saddle_top" ? "bb_center_to_saddle_top" : undefined)}
          />}
        </div>)}
        <div className="flex flex-wrap gap-2">
          <Button disabled={chain.status === "saving" || changes.some((change) =>
            change.field === "currentSetup.saddleHeightMm" && change.kind === "measured" && !change.measurePoint)}
            onClick={() => { void chain.saveToProfile(); }}>{chain.status === "saving" ? copy.saving : copy.save}</Button>
          {!chain.autoSaveProfile && <Button variant="outline" onClick={chain.useForThisCalculation}>{copy.trial}</Button>}
          <Button variant="ghost" onClick={chain.discardChanges}>{copy.reset}</Button>
        </div>
      </div>}
      {chain.trial && <p role="status" className="mt-4 text-sm font-semibold">{copy.trialStatus}</p>}
      {chain.status === "conflict" && <p role="alert" className="mt-4 text-sm text-warning-text">{copy.conflict}</p>}
      {chain.status === "error" && <p role="alert" className="mt-4 text-sm text-destructive-text">{copy.error}</p>}
      {chain.status === "saved" && <div role="status" className="mt-4 rounded-2xl bg-success-soft p-4">
        <h3 className="font-semibold">{chain.savedChanges.some((item) => item.source === "bike")
          && chain.savedChanges.some((item) => item.source === "profile") ? copy.updatedBoth : copy.updated}</h3>
        <ul className="mt-2 text-sm">{chain.savedChanges.map((change) =>
          <li key={`${change.source}:${change.field}`}>{label(change.field)}{" · "}
            {displayValue(change.value, undefined, locale)}</li>)}</ul>
      </div>}
    </section>
    <AdviceReliability score={score} locale={locale} reason={copy.reliabilityReason} />
  </div>;
}

export function CalculatorNextStep({ calculator, locale, context, bikeId }: CalculatorChainPanelProps) {
  const copy = calculatorChainMessages[locale];
  const advice = context?.advice?.filter((item) => !item.bikeId || item.bikeId === bikeId);
  const next = chooseNextCalculator(calculator, context?.profile ?? null, advice);
  const suffix = bikeId && !["fit", "dashboard"].includes(next) ? `?bikeId=${encodeURIComponent(bikeId)}` : "";
  return <section className="flex flex-wrap items-center justify-between gap-5 rounded-3xl bg-[var(--bbf-inkt)] p-6">
    <div className="max-w-2xl">
      <p className="text-sm font-bold uppercase text-[var(--bbf-lime)]">{copy.next}</p>
      <h2 className="mt-2 font-display text-2xl font-bold text-[var(--bbf-wit)]">{copy.titles[next]}</h2>
      <p className="mt-2 text-sm text-[var(--bbf-op-donker)]">
        {next === "fit" ? copy.painReason : next === "dashboard" ? copy.dashboardReason : copy.nextReason}
      </p>
    </div>
    <Link href={withLocalePrefix(`${accountCalculatorPath[next]}${suffix}`, locale)}
      className="inline-flex min-h-11 items-center rounded-full bg-[var(--bbf-lime)] px-5 py-3 font-bold text-[var(--bbf-inkt)] focus-visible:focus-ring">
      {copy.nextAction}
    </Link>
  </section>;
}

export function CalculatorChainLayout(props: CalculatorChainPanelProps & { children: ReactNode }) {
  const copy = calculatorChainMessages[props.locale];
  return <CalculatorChainSlotsContext value={{ inputs: <CalculatorChainPanel {...props} />,
    afterResults: <CalculatorNextStep {...props} />, editLabel: copy.edit,
    expandInputs: props.chain.usedInputs.some((input) => input.value === undefined || input.value === null),
  }}>{props.children}</CalculatorChainSlotsContext>;
}
