import type { Locale } from "@/i18n/config";
import { getAdviceReliabilityCopy } from "@/i18n/account/adviceReliability";
import type { AdviceReliabilityScore } from "../../../shared/profileScore";
import styles from "./AdviceReliability.module.css";

export type AdviceReliabilityProps = {
  score: AdviceReliabilityScore;
  locale: Locale;
  reason?: string;
};

export function AdviceReliability({ score, locale, reason }: AdviceReliabilityProps) {
  const copy = getAdviceReliabilityCopy(locale);
  const value = Number.isFinite(score.reliability) ? Math.round(Math.max(0, Math.min(100, score.reliability))) : 0;
  return <section className={styles.card} aria-label={copy.title}>
    <div className={styles.heading}>
      <h3>{copy.title}</h3>
      <span className={styles.value}>{value}%</span>
    </div>
    <div className={styles.track} role="meter" aria-label={copy.title} aria-valuemin={0} aria-valuemax={100}
      aria-valuenow={value} aria-valuetext={copy.value(value)}>
      <span className={styles.fill} style={{ width: `${value}%` }} />
    </div>
    <p>{reason ?? copy.reason}</p>
    {score.items.length === 0 && <p>{copy.empty}</p>}
    {score.missingFields.length > 0 && <p className={styles.signal}>{copy.missing(score.missingFields.length)}</p>}
    {score.items.some(item => item.missingDate) && <p>{copy.dated}</p>}
  </section>;
}
