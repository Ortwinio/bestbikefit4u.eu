"use client";

import { useRef, useState, type ComponentProps } from "react";
import { quickFixMessages } from "@/i18n/calculators/quickFix";
import { useSaddleReliabilityAnalytics } from "@/lib/analytics/useSaddleReliabilityAnalytics";
import { SaddleHeightCalculatorForm } from "./SaddleHeightCalculatorForm";
import { QuickFixInstructions } from "./QuickFixInstructions";
import styles from "./SaddleHeightExperience.module.css";

type AdviceMode = "full" | "quick";
type Props = Omit<ComponentProps<typeof SaddleHeightCalculatorForm>, "mode"> & {
  initialMode?: AdviceMode;
};

export function SaddleHeightExperience({ initialMode = "full", ...formProps }: Props) {
  const [mode, setMode] = useState<AdviceMode>(initialMode);
  const fullButton = useRef<HTMLButtonElement>(null);
  const { trackQuickFixUsed, trackInseamAdded } = useSaddleReliabilityAnalytics();
  const copy = quickFixMessages[formProps.isNl ? "nl" : "en"];

  function showFullAdvice() {
    setMode("full");
    fullButton.current?.focus();
  }

  return (
    <div className={styles.experience} data-advice-mode={mode}>
      <div className={styles.switcher} role="group" aria-label={copy.modeLabel}>
        <button
          type="button"
          className={styles.modeButton}
          aria-pressed={mode === "quick"}
          onClick={() => { setMode("quick"); trackQuickFixUsed(); }}
        >
          {copy.quick}
        </button>
        <button
          ref={fullButton}
          type="button"
          className={styles.modeButton}
          aria-pressed={mode === "full"}
          onClick={showFullAdvice}
        >
          {copy.full}
        </button>
      </div>
      <SaddleHeightCalculatorForm {...formProps} mode={mode} onInseamAdded={trackInseamAdded} />
      {mode === "quick" && <QuickFixInstructions isNl={Boolean(formProps.isNl)} onFullAdvice={showFullAdvice} />}
    </div>
  );
}
