"use client";

import Link from "next/link";
import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import {
  calculatePublicSaddleHeight, calculateSaddleHeight, getPublicSaddleHeightNextStep,
  type SaddleHeightProvenance,
} from "../../../../../shared/reliability/saddleHeight";
import { Button, SegmentedControl, SegmentedControlItem, Slider } from "@/components/ui";
import { RangeBar } from "@/components/ui/RangeBar";
import { HandoffPrefillNotice } from "@/components/calculators/HandoffPrefillNotice";
import { PersonalizeAdviceBlock } from "@/components/calculators/PersonalizeAdviceBlock";
import { CalculatorJourneyHeader, CalculatorJourneyNext } from "@/components/calculators/CalculatorJourney";
import { CalculatorAdviceLadder, CalculatorPaidChip } from "@/components/calculators/CalculatorAdviceLadder";
import { calculatorExamples } from "@/i18n/calculators/examples";
import { measurementChoiceMessages } from "@/i18n/calculators/measurementChoice";
import { withLocalePrefix } from "@/i18n/navigation";
import { saddleReliabilityMessages } from "@/i18n/calculators/saddleReliability";
import { quickFixMessages } from "@/i18n/calculators/quickFix";
import { usePublicHandoff } from "@/lib/handoff/usePublicHandoff";
import { clearHomeSaddleStart, hasFreshHomeSaddleStart } from "@/lib/handoff/homeStart";
import type { HandoffField } from "@/lib/handoff/store";
import styles from "./PublicSaddleHeightCalculator.module.css";

function subscribeLandingChange(listener: () => void) {
  window.addEventListener("hashchange", listener);
  return () => window.removeEventListener("hashchange", listener);
}

const getLandingSnapshot = () => window.location.hash === "#inseam" || hasFreshHomeSaddleStart() ? "home" : "other";
const getServerLandingSnapshot = () => "server";

export function PublicSaddleHeightCalculator({ isNl = false, mode = "full", onInseamAdded }: {
  isNl?: boolean;
  mode?: "full" | "quick";
  onInseamAdded?: () => void;
}) {
  const locale = isNl ? "nl" : "en";
  const copy = saddleReliabilityMessages[locale];
  const measurementCopy = measurementChoiceMessages[locale];
  const quick = mode === "quick";
  const handoff = usePublicHandoff("saddle-height");
  const landing = useSyncExternalStore(subscribeLandingChange, getLandingSnapshot, getServerLandingSnapshot);
  const homeStart = landing === "home";
  const [heightCm, setHeightCm] = useState(190);
  const [heightKnown, setHeightKnown] = useState(false);
  const [inseamEdited, setInseamEdited] = useState(false);
  const [inseamCm, setInseamCm] = useState<number>();
  const [inseamProvenance, setInseamProvenance] = useState<SaddleHeightProvenance>({ kind: "measured" });
  const [confirmed, setConfirmed] = useState(false);
  const [override, setOverride] = useState(false);
  const [prefilled, setPrefilled] = useState(false);
  const [prefilledFields, setPrefilledFields] = useState<HandoffField[]>([]);
  const [showInseam, setShowInseam] = useState(false);
  const inseamCard = useRef<HTMLDivElement>(null);
  const landingFocused = useRef(false);
  const number = new Intl.NumberFormat(isNl ? "nl-NL" : "en-GB", { maximumFractionDigits: 1 });

  if (handoff.ready && landing !== "server" && !prefilled) {
    setPrefilled(true);
    const fields: HandoffField[] = [];
    const height = homeStart
      ? handoff.initialEntries.find((entry) => entry.field === "heightCm")
      : handoff.getPrefill("heightCm");
    const inseam = handoff.getPrefill("inseamCm");
    if (typeof height?.value === "number" && Number.isFinite(height.value)
      && (homeStart || (height.value >= 130 && height.value <= 220))) {
      setHeightCm(homeStart ? Math.min(220, Math.max(130, Math.round(height.value))) : height.value);
      setHeightKnown(true);
      fields.push("heightCm");
    }
    if (typeof inseam?.value === "number"
      && inseam.value >= 55 && inseam.value <= 105) {
      setInseamCm(inseam.value);
      setInseamProvenance({ kind: inseam.kind ?? (inseam.method === "bike" ? "declared" : inseam.method),
        method: inseam.measurementMethod, repeatCount: inseam.repeatCount,
        withinTolerance: inseam.withinTolerance, unresolvedWarning: inseam.unresolvedWarning });
      setShowInseam(true);
      fields.push("inseamCm");
    }
    setPrefilledFields(fields);
  }

  useEffect(() => {
    if (!homeStart || !prefilled || quick || landingFocused.current) return;
    clearHomeSaddleStart();
    const slider = inseamCard.current?.querySelector<HTMLElement>('[role="slider"], input[type="range"]');
    if (!slider) return;
    landingFocused.current = true;
    slider.focus({ preventScroll: true });
    inseamCard.current?.scrollIntoView?.({ block: "center" });
  }, [homeStart, prefilled, quick]);

  const state = calculatePublicSaddleHeight({ heightCm, inseamCm, confirmed, override });
  const unresolvedWarning = state.unresolvedWarning || Boolean(inseamProvenance.unresolvedWarning);
  const result = state.result && state.basis === "measured" && inseamCm !== undefined
    ? calculateSaddleHeight({ heightCm, inseamCm, provenance: { ...inseamProvenance, unresolvedWarning } })
    : state.result;
  const estimated = calculatePublicSaddleHeight({ heightCm }).result;
  const measured = inseamCm !== undefined && inseamProvenance.kind === "measured";
  const inseamKind = inseamProvenance.kind === "measured" ? "measured" : "estimated";
  const nextStep = getPublicSaddleHeightNextStep({ hasInseam: measured,
    unresolvedLargeWarning: state.status === "large" || Boolean(inseamProvenance.unresolvedWarning), result });
  const nextWidth = nextStep.halfWidthMm;
  const canRefine = state.canRefine && !unresolvedWarning;
  const basis = state.basis !== "measured" ? copy.bases[state.basis]
    : !measured ? copy.reusedUnmeasured
      : (inseamProvenance.repeatCount ?? 1) > 1 ? copy.reusedRepeated.replace("{count}", String(inseamProvenance.repeatCount))
        : copy.bases.measured;
  const guideHref = withLocalePrefix("/measurement-guide", locale);

  function updateHeight(value: number) {
    setHeightCm(value);
    setHeightKnown(true);
    setConfirmed(false);
    setOverride(false);
    handoff.touch("heightCm", value, "cm", "declared");
    if (inseamCm !== undefined && !calculatePublicSaddleHeight({ heightCm: value, inseamCm }).canRefine) {
      handoff.remove("inseamCm");
    }
  }

  function updateInseam(value: number, kind: "measured" | "estimated" = inseamKind) {
    setInseamEdited(true);
    setInseamCm(value);
    setInseamProvenance({ kind });
    setConfirmed(false);
    setOverride(false);
    if (calculatePublicSaddleHeight({ heightCm, inseamCm: value }).canRefine) {
      if (handoff.source === "session") handoff.remove("inseamCm");
      handoff.touch("inseamCm", value, "cm", kind);
      if (kind === "measured") onInseamAdded?.();
    } else {
      handoff.remove("inseamCm");
    }
  }

  function remeasure() {
    setInseamCm(undefined);
    setInseamProvenance({ kind: "measured" });
    setConfirmed(false);
    setOverride(false);
    setShowInseam(true);
    handoff.remove("inseamCm");
    inseamCard.current?.querySelector<HTMLElement>('[role="slider"], input[type="range"]')?.focus();
  }

  function saveMeasurements() {
    if (!result || unresolvedWarning) return;
    setHeightKnown(true);
    if (handoff.entries.find(entry => entry.field === "heightCm")?.value !== heightCm) {
      handoff.touch("heightCm", heightCm, "cm", "declared");
    }
    if (inseamCm !== undefined && canRefine && handoff.entries.find(entry => entry.field === "inseamCm")?.value !== inseamCm) {
      const method = inseamProvenance.kind === "derived" ? "estimated" : inseamProvenance.kind;
      handoff.touch("inseamCm", inseamCm, "cm", method);
    }
  }

  const measurementCard = (
    <div ref={inseamCard} id="inseam" className={styles.card}>
      <h2 className={styles.inputTitle}>{copy.inseamTitle}</h2>
      <SegmentedControl data-usability="measurement-kind" aria-label={measurementCopy.label}
        value={inseamKind} className="grid grid-cols-2" onValueChange={next => {
          if (next !== "measured" && next !== "estimated") return;
          setInseamEdited(true);
          if (inseamCm === undefined) setInseamProvenance({ kind: next });
          else updateInseam(inseamCm, next);
        }}>
        <SegmentedControlItem value="measured">{measurementCopy.measured}</SegmentedControlItem>
        <SegmentedControlItem value="estimated">{measurementCopy.estimated}</SegmentedControlItem>
      </SegmentedControl>
      <p className={styles.hint}>{measurementCopy.hint}</p>
      <Slider label={copy.inseam} min={55} max={105} step={0.5} value={inseamCm ?? 89}
        valueLabel={inseamCm === undefined ? copy.missing : number.format(inseamCm)}
        unit={inseamCm === undefined ? undefined : "cm"}
        aria-valuetext={inseamCm === undefined ? copy.missing : `${number.format(inseamCm)} cm`}
        onChange={updateInseam} />
      <p className={styles.hint}>{copy.measuring}{" "}
        <Link href={guideHref} className={styles.inlineLink}>{copy.guide}</Link>
      </p>
      {inseamCm === undefined && <p className={styles.prompt}>{copy.slide}</p>}
    </div>
  );

  return (
    <section className={`${styles.calculator} ${quick ? styles.quick : ""}`}>
      <header className={styles.heading}>
        {!quick && <p className={styles.eyebrow}>{copy.eyebrow}</p>}
        <h1>{copy.title}</h1>
        {!quick && <p>{copy.description}</p>}
      </header>
      {!quick && <CalculatorJourneyHeader calculator="saddle-height" locale={locale} />}
      <HandoffPrefillNotice calculator="saddle-height" locale={locale} fields={prefilledFields} />
      <div className={styles.layout}>
        <div className={styles.inputs}>
          <div className={styles.card}>
            <h2 className={styles.inputTitle}>{copy.heightTitle}</h2>
            <div data-example-field={!heightKnown ? "heightCm" : undefined}>
              {!heightKnown && <span data-usability="example-label" className="inline-block rounded-full bg-muted px-2 py-1 text-xs font-semibold text-muted-foreground">{calculatorExamples[locale].label}</span>}
              <Slider label={copy.height} min={130} max={220} step={1} value={heightCm}
                className={!heightKnown ? "[&>div>span[aria-hidden=true]]:text-muted-foreground" : undefined}
                valueLabel={number.format(heightCm)} unit="cm" onChange={updateHeight} />
            </div>
          </div>
          {!quick && measurementCard}
          {!quick && <section className={styles.card} aria-label={copy.safety.title} data-usability="safety">
            <h2 className={styles.inputTitle}>{copy.safety.title}</h2>
            <p><strong>{copy.safety.highLabel}</strong> {copy.safety.high}</p>
            <p><strong>{copy.safety.lowLabel}</strong> {copy.safety.low}</p>
            <p>{copy.safety.adjustment}</p>
            <div role="note" className="rounded-xl border border-border bg-muted p-3 font-semibold">
              <p>{copy.safety.stop}</p>
              <Link href={withLocalePrefix("/bike-fitting", locale)}
                className="inline-flex min-h-11 items-center underline underline-offset-4 focus-visible:focus-ring">{copy.fitter}</Link>
            </div>
          </section>}
          {!quick && <details className={styles.card}>
            <summary>{copy.omittedTitle}</summary>
            <p className={styles.hint}>{copy.omittedBody}</p>
          </details>}
        </div>
        <div className={styles.results}>
          {!heightKnown && !inseamEdited && inseamCm === undefined && prefilledFields.length === 0 && <p data-usability="example" data-calculator-example className="rounded-xl bg-muted p-3 text-sm text-muted-foreground">{calculatorExamples[locale].height.replace("{height}", number.format(heightCm))}</p>}
          {result ? <section className={styles.card} aria-label={copy.result} id="saddle-result">
            <div className={styles.resultHeader}>
              <div className={styles.resultTitle}>
                <span className={styles.letter} aria-hidden="true">A</span>
                <div><h2>{copy.result}</h2><p className={styles.reference}>{copy.reference}</p></div>
              </div>
              <div className={styles.value} aria-live="polite" aria-atomic="true">
                <div data-usability="result-value">{result.adviceMm}<span>mm</span></div>
                <p>±{result.halfWidthMm} mm</p>
              </div>
            </div>
            <RangeBar value={result.adviceMm} low={result.lowerMm} high={result.upperMm}
              dashed={unresolvedWarning} locale={locale} size={quick ? "compact" : "large"} />
            {!quick && <CalculatorPaidChip locale={locale} />}
            {!quick && !unresolvedWarning && <PersonalizeAdviceBlock calculator="saddle-height" locale={locale}
              reasonValue={`±${number.format(result.halfWidthMm)} mm`} onSave={saveMeasurements} />}
            {!quick && unresolvedWarning && <CalculatorJourneyNext calculator="saddle-height" locale={locale} />}
            {!quick && <CalculatorAdviceLadder locale={locale} currentRange={`±${number.format(result.halfWidthMm)} mm`} />}
            {!quick && <p className={styles.sentence}>
              {copy.sentence.replace("{low}", String(result.lowerMm)).replace("{high}", String(result.upperMm))
                .replace("{basis}", basis)}
            </p>}
            {!quick && canRefine && estimated && estimated.halfWidthMm > result.halfWidthMm
              && <p className={styles.improvement}>
                {copy.narrower.replace("{from}", String(estimated.halfWidthMm))
                  .replace("{to}", String(result.halfWidthMm))}
              </p>}
            {!quick && <p className={styles.nextStep} data-slot="saddle-next-step">
              <span aria-hidden="true">→</span>
              {copy.nextSteps[nextStep.kind].replace("{width}", String(nextWidth ?? ""))}
            </p>}
            {!quick && <details className={styles.explanation}>
              <summary>{copy.rangeTitle}</summary><p className={styles.hint}>{copy.rangeBody}</p>
            </details>}
          </section> : <p role="alert" className={`${styles.card} ${styles.error}`}>{copy.error}</p>}
          {state.status === "check" && !confirmed && <section role="status"
            className={`${styles.card} ${styles.warning}`}>
            <h2 className={styles.inputTitle}>{copy.checkTitle}</h2>
            <p>{copy.checkBody.replace("{direction}",
              state.plausibility?.direction === "longer" ? copy.longer : copy.shorter)}</p>
            <div className={styles.actions}>
              <Button onClick={() => {
                setConfirmed(true);
                setInseamProvenance({ kind: inseamProvenance.kind });
                if (handoff.source === "session") handoff.remove("inseamCm");
                if (inseamCm !== undefined) handoff.touch("inseamCm", inseamCm, "cm",
                  inseamProvenance.kind === "derived" ? "estimated" : inseamProvenance.kind);
                if (inseamProvenance.kind === "measured") onInseamAdded?.();
              }}>{copy.confirm}</Button>
              <Button variant="outline" onClick={remeasure}>{copy.remeasure}</Button>
            </div>
          </section>}
          {state.status === "large" && <section role="alert" className={`${styles.card} ${styles.error}`}>
            <h2 className={styles.inputTitle}>{copy.nextSteps.remeasure}</h2>
            <p>{copy.largeBody}</p>
            <p>{override ? copy.overridden : copy.heightFallback}</p>
            <div className={styles.actions}>
              <Button onClick={remeasure}>{copy.remeasure}</Button>
              {!override && <Button variant="outline" onClick={() => setOverride(true)}>{copy.override}</Button>}
              <Link href={withLocalePrefix("/bike-fitting", locale)} className={styles.inlineLink}>{copy.fitter}</Link>
            </div>
          </section>}
        </div>
        {quick && <div className={styles.quickInseam}>
          <button type="button" className={styles.disclosure} aria-expanded={showInseam}
            aria-controls="quick-inseam" onClick={() => setShowInseam(!showInseam)}>
            {quickFixMessages[locale].optionalInseam}
          </button>
          {showInseam && <div id="quick-inseam">{measurementCard}</div>}
        </div>}
      </div>
    </section>
  );
}
