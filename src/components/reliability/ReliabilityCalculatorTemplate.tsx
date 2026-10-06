import type { ReactNode } from "react";
import type { Locale } from "@/i18n/config";
import { reliabilityMessages } from "@/i18n/calculators/reliability";
import type { HandoffCalculator } from "@/lib/handoff/store";
import { PersonalizeAdviceBlock } from "@/components/calculators/PersonalizeAdviceBlock";
import { CalculatorJourneyHeader } from "@/components/calculators/CalculatorJourney";
import { CalculatorAdviceLadder, CalculatorPaidChip } from "@/components/calculators/CalculatorAdviceLadder";
import styles from "./ReliabilityCalculatorTemplate.module.css";

export interface ReliabilityCalculatorTemplateProps {
  locale: Locale;
  calculator: HandoffCalculator;
  title: string;
  description: string;
  eyebrow?: string;
  omittedTitle?: string;
  steps: Array<{ title: string; content: ReactNode; status?: string; hint?: ReactNode }>;
  inputContent?: ReactNode;
  unframedResults?: boolean;
  results: ReactNode;
  nextStep: ReactNode;
  omitted?: ReactNode;
  meaning?: ReactNode;
  refinement?: Array<{ text: string; gain?: string; tier?: "account" | "paid" }>;
  notice?: ReactNode;
  warnings?: ReactNode;
  canRefine?: boolean;
  onSave?: () => void;
  example?: ReactNode;
  reasonValue?: string;
}

export function ReliabilityCalculatorTemplate({
  locale, calculator, title, description, steps, results, nextStep, omitted, meaning,
  notice, warnings, canRefine = true, onSave, eyebrow, omittedTitle,
  inputContent, unframedResults = false, example, reasonValue,
}: ReliabilityCalculatorTemplateProps) {
  const copy = reliabilityMessages[locale];
  return (
    <section className={styles.calculator} data-reliability-calculator={calculator}>
      <header className={styles.header}>
        <p className={styles.eyebrow}>{eyebrow ?? copy.eyebrow}</p>
        <h1>{title}</h1><p>{description}</p>
        {canRefine && <CalculatorJourneyHeader calculator={calculator} locale={locale} />}
      </header>
      {notice}
      <div className={styles.layout}>
        <div className={styles.column}>
          {inputContent}
          {steps.map((step, index) => <section key={step.title} className={styles.card}
            data-reliability-step={index + 1}>
            <div className={styles.stepHeading}><h2>{step.title}</h2><span>{step.status}</span></div>
            <div className={styles.fields}>{step.content}</div>
            {step.hint && <div className={styles.hint}>{step.hint}</div>}
          </section>)}
          {omitted && <details className={styles.card}><summary>{omittedTitle ?? copy.omitted}</summary>
            <div className={styles.hint}>{omitted}</div>
          </details>}
        </div>
        <div className={styles.column}>
          <section className={unframedResults ? styles.column : styles.card} aria-label={title}>
            {example}
            {results}
            {canRefine && <CalculatorPaidChip locale={locale} />}
            {canRefine && <PersonalizeAdviceBlock calculator={calculator} locale={locale}
              onSave={onSave} reasonValue={reasonValue} />}
            {nextStep != null && <div className={styles.next} data-reliability-next-step="">
              <span aria-hidden="true">→</span><div>{nextStep}</div>
            </div>}
            <details className={styles.meaning}><summary>{copy.meaning}</summary>
              <div className={styles.hint}>{meaning ?? copy.meaningBody}</div>
            </details>
            {canRefine && <CalculatorAdviceLadder locale={locale} currentRange={reasonValue} />}
          </section>
          {warnings && <div data-usability="safety">{warnings}</div>}
        </div>
      </div>
    </section>
  );
}
