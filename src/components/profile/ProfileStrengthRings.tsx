"use client";

import Link from "next/link";
import type { Locale } from "@/i18n/config";
import { getProfileScoreCopy } from "@/i18n/account/profileScore";
import { getPricingAccessCopy } from "@/i18n/account/pricingAccess";
import { profileScoreLevel } from "../../../shared/profileScore";
import styles from "./ProfileStrengthRings.module.css";

export type ProfileStrengthRingsProps = {
  score: { completeness: number; reliability: number };
  locale: Locale;
  size?: "sm" | "lg";
  compact?: boolean;
  capped?: boolean;
  title?: string;
  nextStep?: { label: string; href?: string; gain?: number };
};

const percentage = (value: number) => Number.isFinite(value) ? Math.round(Math.max(0, Math.min(100, value))) : 0;

export function ProfileStrengthRings({ score, locale, size = "lg", compact = false, capped = false, title, nextStep }: ProfileStrengthRingsProps) {
  const copy = getProfileScoreCopy(locale);
  const completeness = percentage(score.completeness);
  const reliability = percentage(score.reliability);
  const heading = title ?? copy.title;
  return <section aria-label={heading} className={`${styles.card} ${size === "sm" ? styles.small : ""} ${compact ? styles.compact : ""}`}>
    <div className={styles.header}>
      <span className={styles.title}>{heading}</span>
      <strong className={styles.level}>{copy.levels[profileScoreLevel(completeness)]}</strong>
    </div>
    <div className={styles.grid}>
      {[{ key: "completeness", label: copy.completeness, value: completeness, color: styles.complete },
        { key: "reliability", label: copy.reliability, value: reliability, color: styles.reliable }].map(meter =>
        <div className={styles.item} key={meter.key}>
          <div className={styles.meter} role="meter" aria-label={`${heading}: ${meter.label}`}
            aria-valuemin={0} aria-valuemax={100} aria-valuenow={meter.value} aria-valuetext={`${copy.meterValue(meter.value)}${capped && meter.key === "completeness" ? `, ${getPricingAccessCopy(locale).capMeter}` : ""}`}>
            <svg className={styles.svg} viewBox="0 0 120 120" aria-hidden="true">
              <circle className={styles.track} cx="60" cy="60" r="48" fill="none" strokeWidth="13" />
              <circle className={`${styles.arc} ${meter.color}`} cx="60" cy="60" r="48" fill="none" strokeWidth="13"
                pathLength="100" strokeDasharray="100 100" strokeDashoffset={100 - meter.value}
                strokeLinecap={meter.value === 0 ? "butt" : "round"} transform="rotate(-90 60 60)" />
              {capped && meter.key === "completeness" && <line x1="60" y1="4" x2="60" y2="20"
                stroke="currentColor" strokeWidth="3" transform="rotate(288 60 60)" />}
            </svg>
            <span className={styles.value}>{meter.value}<span className={styles.percent}>%</span></span>
          </div>
          <span className={styles.label}>{meter.label}</span>
        </div>)}
    </div>
    {nextStep && <p className={styles.next}>
      {copy.nextStep}: {nextStep.href ? <Link href={nextStep.href}>{nextStep.label}</Link> : <strong>{nextStep.label}</strong>}
      {nextStep.gain !== undefined && nextStep.gain > 0 && <span className={styles.gain}>
        {" · "}{copy.upTo} +{new Intl.NumberFormat(locale, { maximumFractionDigits: 1 }).format(nextStep.gain)} {copy.points}
      </span>}
    </p>}
  </section>;
}
