"use client";

import { useState } from "react";
import Link from "next/link";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { scoreRiderProfile } from "../../../shared/profileScore";
import type { Locale } from "@/i18n/config";
import { withLocalePrefix } from "@/i18n/navigation";
import { getProfileScoreCopy } from "@/i18n/account/profileScore";
import { getProfileStrengthCopy } from "@/i18n/account/profileStrength";
import { ProfileStrengthRings } from "./ProfileStrengthRings";
import styles from "./AccountProfileStrength.module.css";

export function AccountProfileStrength({ locale, placement }: {
  locale: Locale;
  placement: "sidebar" | "mobile";
}) {
  const provenance = useQuery(api.profiles.queries.getMyProvenance, {});
  const [now] = useState(() => Date.now());
  const copy = getProfileStrengthCopy(locale);
  const scoreCopy = getProfileScoreCopy(locale);
  if (provenance === undefined) return <p className={styles.loading} role="status">{copy.loading}</p>;
  const score = scoreRiderProfile({ profile: provenance.profile ?? {}, observations: provenance.observations }, now);
  const nextStep = score.nextStep;
  return <Link className={styles.link} href={withLocalePrefix("/profile", locale)}>
    <ProfileStrengthRings locale={locale} score={score} size="sm" compact={placement === "mobile"}
      nextStep={nextStep ? {
        label: scoreCopy.fields[nextStep.key as keyof typeof scoreCopy.fields],
      } : undefined} />
    <span className="sr-only">{copy.open}</span>
  </Link>;
}
