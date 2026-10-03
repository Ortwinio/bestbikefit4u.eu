"use client";

import { useState } from "react";
import Link from "next/link";
import { ADVICE_GROUPS, type AdviceGroup, type AdviceItem } from "../../../shared/advice/types";
import type { Locale } from "@/i18n/config";
import { withLocalePrefix } from "@/i18n/navigation";
import { getAdviceCopy } from "@/i18n/account/advice";
import { Button } from "@/components/ui";
import { AdviceProgressActions, type AdviceProgressHandlers } from "./AdviceProgressActions";
import styles from "./AdviceGroupsView.module.css";

export type AdviceGroupsViewProps = {
  groups: AdviceGroup[];
  locale: Locale;
  bikes: Array<{ _id: string; name: string }>;
  onOpenAdvice?: (item: AdviceItem) => void;
} & AdviceProgressHandlers;

function ownLabel(labels: object, key: string, fallback: string): string {
  if (!Object.hasOwn(labels, key)) return fallback;
  const value: unknown = Reflect.get(labels, key);
  return typeof value === "string" ? value : fallback;
}

export function AdviceGroupsView({ groups, locale, bikes, onOpenAdvice, onMarkPerformed, onSubmitFeedback }: AdviceGroupsViewProps) {
  const [filter, setFilter] = useState("all");
  const copy = getAdviceCopy(locale);
  const activeFilter = filter.startsWith("bike:") && !bikes.some(bike => `bike:${bike._id}` === filter) ? "all" : filter;
  const number = (value: number) => value.toLocaleString(locale, { maximumFractionDigits: 2 });
  const unitLabel = (unit: string | null) => unit ? ownLabel(copy.units, unit, copy.unknownUnit) : "";
  const sourceHref = (link: string) => {
    if (!link.startsWith("/") || link.startsWith("//")) return withLocalePrefix("/profile/advice", locale);
    const path = withLocalePrefix(link.split(/[?#]/)[0], locale);
    const params = new URLSearchParams(link.split("?")[1]?.split("#")[0]);
    const bikeId = params.get("bikeId");
    return bikeId && bikes.some(bike => bike._id === bikeId) ? `${path}?${new URLSearchParams({ bikeId })}` : path;
  };
  const inputLabel = (field: string) => ownLabel(copy.inputFields, field, ownLabel(copy.fields, field, copy.unknownField));
  const value = (amount: number | string | null, unit: string | null, signed = false) => <>
    <span className={styles.value}>{typeof amount === "string" ? amount : typeof amount === "number" && Number.isFinite(amount) ? `${signed && amount > 0 ? "+" : ""}${number(amount)}` : "—"}</span>
    {typeof amount === "number" && Number.isFinite(amount) && unitLabel(unit) && <span className={styles.unit}> {unitLabel(unit)}</span>}
  </>;

  return <div className={styles.view}>
    <div className={styles.filters} role="group" aria-label={copy.filter}>
      {[{ key: "all", label: copy.all }, { key: "rider", label: copy.rider }, ...bikes.map(bike => ({ key: `bike:${bike._id}`, label: bike.name }))].map(option => <Button key={option.key} variant="outline" aria-pressed={activeFilter === option.key} onClick={() => setFilter(option.key)}>{option.label}</Button>)}
    </div>
    {ADVICE_GROUPS.map(key => {
      const group = groups.find(group => group.key === key);
      const items = (group?.items ?? []).filter(item => activeFilter === "all" || (activeFilter === "rider" ? item.bikeId === null : `bike:${item.bikeId}` === activeFilter))
        .slice().sort((first, second) => first.changeOrder - second.changeOrder);
      const improvements = (group?.improvements ?? []).filter(action => Number.isFinite(action.gain) && action.gain > 0)
        .slice().sort((first, second) => second.gain - first.gain).slice(0, 3);
      return <section key={key} className={styles.group} aria-label={copy.groups[key]}>
        <header className={styles.groupHeader}><span className={styles.count}><span aria-hidden="true">{items.length}</span><span className="sr-only">{copy.count(items.length)}</span></span><h2>{copy.groups[key]}</h2></header>
        <div className={styles.columns}>
          <div className={styles.items}>
            {!items.length && <p className={styles.empty}>{copy.empty}</p>}
            {items.map(item => {
              const name = ownLabel(copy.fields, item.key, copy.unknownAdvice);
              const unknown = item.staleness.status === "unknown";
              const status = item.status === "needs_calculation" ? "needs_calculation" : item.status === "stale" || item.staleness.stale || item.staleness.status === "stale" ? "stale"
                : item.progress ? item.progress.feedback ? "performed" : "waiting_feedback" : unknown ? "unknown" : "new";
              const confidence = item.reliability.value;
              const confidenceKnown = typeof confidence === "number" && Number.isFinite(confidence) && confidence >= 0 && confidence <= 100;
              const candidateDate = new Date(item.date);
              const date = item.date > 0 && Number.isFinite(candidateDate.getTime()) ? candidateDate : null;
              const reasons = [...new Set(item.staleness.reasons.map(reason => `${reason.field ? `${inputLabel(reason.field)}: ` : ""}${ownLabel(copy.reasons, reason.reason, copy.unknownReason)}`))];
              return <article key={item.id} className={styles.row} aria-label={name}>
                <div className={styles.identity}><h3>{name}</h3><p>{item.bikeId === null ? copy.rider : bikes.find(bike => bike._id === item.bikeId)?.name ?? copy.unknownBike}</p>
                  {date ? <time dateTime={date.toISOString()}>{item.status === "needs_calculation" ? copy.savedDate : copy.date} {date.toLocaleDateString(locale === "nl" ? "nl-NL" : "en-GB", { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" })}</time> : <p>{copy.unknownDate}</p>}
                  <Link className={styles.link} href={sourceHref(item.sourceLink)} onClick={() => onOpenAdvice?.(item)}>{copy.open}</Link>
                </div>
                <dl className={styles.facts}>
                  <div><dt>{copy.target}</dt><dd>{value(item.value, item.unit)}</dd>{item.range && typeof item.value !== "string" && <><dt className={styles.rangeLabel}>{copy.range}</dt><dd className={styles.range}>{value(item.range.min, null)}–{value(item.range.max, item.unit)}</dd></>}</div>
                  <div><dt>{copy.current}</dt><dd>{value(item.current, item.unit)}</dd><dt className={styles.rangeLabel}>{copy.difference}</dt><dd>{value(item.difference, item.unit, true)}</dd></div>
                  <div><dt>{copy.confidence}</dt><dd><span className={styles.confidence}>{confidenceKnown ? `${number(confidence)}%` : copy.unknownValue}</span><p className={styles.detail}>{ownLabel(copy.reliability, item.reliability.reason, copy.reliability.unknown)}</p></dd></div>
                  <div><dt>{copy.status}</dt><dd><span className={`${styles.badge} ${styles[status]}`}>{copy.statuses[status]}</span>{unknown && <p className={styles.detail}>{copy.freshnessUnknown}</p>}{reasons.map(reason => <p key={reason} className={styles.detail}>{reason}</p>)}</dd></div>
                </dl>
                <AdviceProgressActions key={`${item.id}:${item.adviceRevision}:${item.progress?.performedAt}:${item.progress?.feedback?.recordedAt}`}
                  item={item} locale={locale} onMarkPerformed={onMarkPerformed} onSubmitFeedback={onSubmitFeedback} />
              </article>;
            })}
          </div>
          <aside className={styles.improvements} aria-label={`${copy.groups[key]}: ${copy.improvements}`}><h3>{copy.improvements}</h3>
            {improvements.length ? <><p>{copy.gainNote}</p>{improvements.map((action, index) => <Link className={styles.improvement} key={`${action.key}:${action.field}:${index}`} href={sourceHref(action.sourceLink)}>
              <strong>{ownLabel(copy.improvementFields, action.key, inputLabel(action.field))}</strong>
              <span>{copy.upTo} <span className={styles.gain}>+{number(action.gain)}</span> {copy.points}</span>
            </Link>)}</> : <p>{copy.noImprovements}</p>}
          </aside>
        </div>
      </section>;
    })}
  </div>;
}
