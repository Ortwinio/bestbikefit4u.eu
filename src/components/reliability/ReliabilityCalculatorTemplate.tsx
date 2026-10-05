import Link from "next/link";
import type { ReactNode } from "react";
import type { Locale } from "@/i18n/config";
import { reliabilityMessages } from "@/i18n/calculators/reliability";
import type { HandoffCalculator } from "@/lib/handoff/store";
import { handoffLoginHref } from "@/components/calculators/PersonalizeAdviceBlock";
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
}

export function ReliabilityCalculatorTemplate({
  locale, calculator, title, description, steps, results, nextStep, omitted, meaning,
  refinement = [], notice, warnings, canRefine = true, onSave, eyebrow, omittedTitle,
  inputContent, unframedResults = false,
}: ReliabilityCalculatorTemplateProps) {
  const copy = reliabilityMessages[locale];
  return (
    <section className={styles.calculator} data-reliability-calculator={calculator}>
      <header className={styles.header}>
        <p className={styles.eyebrow}>{eyebrow ?? copy.eyebrow}</p>
        <h1>{title}</h1><p>{description}</p>
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
            {results}
            {nextStep != null && <div className={styles.next} data-reliability-next-step="">
              <span aria-hidden="true">→</span><div>{nextStep}</div>
            </div>}
            <details className={styles.meaning}><summary>{copy.meaning}</summary>
              <div className={styles.hint}>{meaning ?? copy.meaningBody}</div>
            </details>
          </section>
          {warnings}
          {canRefine && <section className={styles.refine}>
            <h2>{copy.refine}</h2>
            <ul>{refinement.map((item) => <li key={item.text}>
              <span className={styles.tier}>{copy[item.tier ?? "account"]}</span>
              <span>{item.text}</span><span className={styles.gain}>{item.gain}</span>
            </li>)}</ul>
            <Link className={styles.save} href={handoffLoginHref(calculator, locale)} onClick={onSave}>
              {copy.save}
            </Link>
            <p>{copy.carry}</p>
          </section>}
        </div>
      </div>
    </section>
  );
}
