"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Slider } from "@/components/ui/Slider";
import type { Locale } from "@/i18n/config";
import { homeMarketing } from "@/i18n/marketing/home";
import { withLocalePrefix } from "@/i18n/navigation";
import styles from "./MarketingHome.module.css";

export function saddleTeaserEstimate(inseam: number) {
  const inseamMm = Math.round(inseam * 10);
  return { height: Math.round(inseamMm * 0.883), min: Math.round(inseamMm * 0.86), max: Math.round(inseamMm * 0.91) };
}

export function SaddleHeightTeaser({ locale }: { locale: Locale }) {
  const [inseam, setInseam] = useState(84);
  const copy = homeMarketing[locale].teaser;
  const estimate = saddleTeaserEstimate(inseam);
  const value = new Intl.NumberFormat(locale).format(inseam);

  return <div className={styles.teaser}>
    <svg className={styles.bike} viewBox="0 0 520 340" fill="none" aria-hidden="true">
      <g stroke="currentColor" strokeWidth="7" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="120" cy="240" r="78" /><circle cx="400" cy="240" r="78" />
        <path d="M120 240L230 250L198 120L120 240M198 122L360 114M230 250L368 150M372 160L400 240M360 112L372 160M198 120L192 98M170 96L224 93M360 112L392 106q26 0 26 24q0 20-18 22" />
        <circle cx="230" cy="250" r="13" /><path d="M230 250L250 284" />
      </g>
      <path d="M214 252L180 100" stroke="#0A7263" strokeWidth="3" strokeDasharray="7 7" />
    </svg>
    <div className={styles.teaserCard}>
      <div className={`${styles.teaserHeading} max-sm:!flex-col`}>
        <div><p className={styles.eyebrow}>{copy.try}</p><h2>{copy.title}</h2></div>
        <div className={styles.result}><output aria-label={copy.title} aria-live="polite" htmlFor="home-inseam">{estimate.height}<small> mm</small></output><p>{copy.direction}</p></div>
      </div>
      <Slider id="home-inseam" label={copy.inseam} tooltip={homeMarketing[locale].tools[7].description} tooltipLabel={copy.inseam} min={55} max={105} step={0.5} value={inseam} valueLabel={value} unit="cm" aria-valuetext={`${value} cm`} onChange={setInseam} />
      <p className={styles.context}>{copy.context} <span>{estimate.min}–{estimate.max} mm</span>.</p>
      <Link className={styles.textLink} href={withLocalePrefix("/calculators/saddle-height", locale)}>{copy.refine}<ArrowRight size={18} aria-hidden="true" /></Link>
    </div>
  </div>;
}
