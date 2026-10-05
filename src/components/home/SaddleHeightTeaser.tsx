"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Slider } from "@/components/ui/Slider";
import { RangeBar } from "@/components/ui/RangeBar";
import { useMarketingEventLogger } from "@/components/analytics/MarketingEventTracker";
import { useHomeSaddleWidgetAnalytics } from "@/lib/analytics/useHomeSaddleWidgetAnalytics";
import type { Locale } from "@/i18n/config";
import { homeSaddleWidget } from "@/i18n/marketing/homeSaddleWidget";
import { withLocalePrefix } from "@/i18n/navigation";
import { writeHandoffEntry } from "@/lib/handoff/store";
import { calculateSaddleHeight, getPublicSaddleHeightNextStep } from "../../../shared/reliability/saddleHeight";
import styles from "./MarketingHome.module.css";

export function SaddleHeightTeaser({ locale, onUsed }: { locale: Locale; onUsed?: () => void }) {
  const [height, setHeight] = useState(175);
  const { trackHomeSaddleWidgetUsed } = useHomeSaddleWidgetAnalytics(useMarketingEventLogger());
  const copy = homeSaddleWidget[locale];
  const result = calculateSaddleHeight({ heightCm: height });
  const nextStep = getPublicSaddleHeightNextStep({ hasInseam: false, unresolvedLargeWarning: false, result });
  const value = new Intl.NumberFormat(locale).format(height);

  function used() {
    trackHomeSaddleWidgetUsed();
    onUsed?.();
  }

  function refine() {
    writeHandoffEntry({
      field: "heightCm", value: height, unit: "cm", method: "declared",
      calculator: "saddle-height", touchedAt: Date.now(),
    });
    used();
  }

  return <div className={styles.teaser}>
    <div className={styles.teaserCard}>
      <div className={styles.teaserHeading}>
        <p className={styles.eyebrow}>{copy.try}</p>
        <h2>{copy.title}</h2>
      </div>
      <Slider
        id="home-height" label={copy.height} tooltip={copy.heightHelp} tooltipLabel={copy.height}
        min={130} max={220} step={1} value={height} valueLabel={value} unit="cm"
        aria-valuetext={`${value} cm`} onChange={(nextHeight) => { setHeight(nextHeight); used(); }}
      />
      <div className={styles.result}>
        <output aria-label={copy.title} aria-live="polite" htmlFor="home-height">
          {result.adviceMm}<small> mm · ±{result.halfWidthMm} mm</small>
        </output>
      </div>
      <RangeBar
        value={result.adviceMm} low={result.lowerMm} high={result.upperMm}
        min={result.scaleMinMm} max={result.scaleMaxMm} size="compact" locale={locale}
      />
      <p className={styles.context}>{copy.basis}</p>
      <Link
        className={styles.primary}
        href={withLocalePrefix("/calculators/saddle-height", locale) + "#inseam"} onClick={refine}
      >
        {copy.refine}<ArrowRight size={18} aria-hidden="true" />
      </Link>
      <p className={styles.context}>{copy.nextStep.replace("{mm}", String(nextStep.halfWidthMm))}</p>
    </div>
  </div>;
}
