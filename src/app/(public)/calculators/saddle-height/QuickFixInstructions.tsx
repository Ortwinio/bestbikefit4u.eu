"use client";

import { quickFixMessages } from "@/i18n/calculators/quickFix";
import styles from "./SaddleHeightExperience.module.css";

export function QuickFixInstructions({ isNl, onFullAdvice }: {
  isNl: boolean;
  onFullAdvice: () => void;
}) {
  const copy = quickFixMessages[isNl ? "nl" : "en"];

  return (
    <section className={styles.practical} aria-labelledby="quick-fix-practical-title">
      <h2 id="quick-fix-practical-title" className={styles.title}>{copy.practicalTitle}</h2>
      <ol className={styles.steps}>
        {copy.steps.map((step, index) => (
          <li key={step.title} className={styles.step}>
            <span className={styles.number} aria-hidden="true">{index + 1}</span>
            <div>
              <h3 className={styles.stepTitle}>{step.title}</h3>
              <p>{step.description}</p>
            </div>
          </li>
        ))}
      </ol>
      <p className={styles.safety}>{copy.safety}</p>
      <button className={styles.fullButton} type="button" onClick={onFullAdvice}>{copy.full}</button>
    </section>
  );
}
