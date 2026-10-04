"use client";

import { useState } from "react";
import Link from "next/link";
import { useConvexAuth, useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { scoreRiderProfile, type ScoreLevel } from "../../../shared/profileScore";
import { useProfileAccess } from "@/hooks/useProfileAccess";
import { getRefinementScoreLabel } from "@/i18n/account/pricingAccess";
import { ProfileAccessNotice } from "@/components/profile/ProfileAccessNotice";
import type { Locale } from "@/i18n/config";
import { withLocalePrefix } from "@/i18n/navigation";
import { getProfileScoreCopy } from "@/i18n/account/profileScore";
import { getDashboardProfileStrengthCopy } from "@/i18n/account/dashboardProfileStrength";
import { ProfileStrengthRings } from "@/components/profile/ProfileStrengthRings";
import styles from "./DashboardProfileStrength.module.css";

export function DashboardProfileStrength({ locale }: { locale: Locale }) {
  const { isAuthenticated } = useConvexAuth();
  const context = useQuery(api.profiles.queries.getMyProvenance, isAuthenticated ? {} : "skip");
  const profileAccess = useProfileAccess();
  const access = profileAccess.access;
  const [now] = useState(() => Date.now());
  const copy = getDashboardProfileStrengthCopy(locale);
  const scoreCopy = getProfileScoreCopy(locale);
  if (!isAuthenticated) return null;
  if (context === undefined || profileAccess.isLoading) return <section className={styles.hero} aria-busy="true">
    <p role="status">{copy.loading}</p>
  </section>;
  const score = scoreRiderProfile(context, now, profileAccess);
  const levels: ScoreLevel[] = ["basic", "building", "strong", "complete"];
  const next = score.nextStep;
  return <section className={styles.hero} aria-label={copy.title}>
    <ProfileStrengthRings score={score} locale={locale} capped={access?.profileScoreCap === 80} />
    <div className={styles.summary}>
      <p className={styles.eyebrow}>{copy.title}</p>
      <h2 className={styles.heading}>{scoreCopy.levels[score.level]}</h2>
      <p className={styles.description}>{copy.description}</p>
      {access?.enforced && <ProfileAccessNotice locale={locale} capped={access.profileScoreCap === 80} inverse />}
      <div className={styles.levels} aria-hidden="true">
        {levels.map((level, index) => <span className={styles.level} key={level}>
          <span className={index <= levels.indexOf(score.level) ? styles.active : styles.inactive} />
          {scoreCopy.levels[level]}
        </span>)}
      </div>
      <Link className={styles.explanation} href={withLocalePrefix("/profile/score", locale)}>{copy.explanation}</Link>
    </div>
    <div className={styles.next}>
      <p className={styles.nextLabel}>{next ? copy.next : copy.complete}</p>
      {next && <h3 className={styles.nextTitle}>{getRefinementScoreLabel(locale, next.key) ?? scoreCopy.fields[next.key as keyof typeof scoreCopy.fields]}</h3>}
      <p>{next ? copy.check : copy.completeDetail}</p>
      {next && <p className={styles.gain}>{copy.upTo} <span>
        +{new Intl.NumberFormat(locale, { maximumFractionDigits: 1 }).format(next.gain)}
      </span> {copy.gain}</p>}
      <Link className={styles.link} href={withLocalePrefix("/profile", locale)}>{copy.profile}</Link>
    </div>
  </section>;
}
