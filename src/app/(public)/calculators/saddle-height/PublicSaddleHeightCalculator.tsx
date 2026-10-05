"use client";

import Link from "next/link";
import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { calculatePublicSaddleHeight } from "../../../../../shared/reliability/saddleHeight";
import { Button, Slider } from "@/components/ui";
import { RangeBar } from "@/components/ui/RangeBar";
import { HandoffPrefillNotice } from "@/components/calculators/HandoffPrefillNotice";
import { handoffLoginHref } from "@/components/calculators/PersonalizeAdviceBlock";
import { withLocalePrefix } from "@/i18n/navigation";
import { saddleReliabilityMessages } from "@/i18n/calculators/saddleReliability";
import { quickFixMessages } from "@/i18n/calculators/quickFix";
import { usePublicHandoff } from "@/lib/handoff/usePublicHandoff";
import type { HandoffField } from "@/lib/handoff/store";
import styles from "./PublicSaddleHeightCalculator.module.css";

function subscribeLandingChange(listener: () => void) {
  window.addEventListener("hashchange", listener);
  return () => window.removeEventListener("hashchange", listener);
}

const getLandingSnapshot = () => window.location.hash === "#inseam" ? "home" : "other";
const getServerLandingSnapshot = () => "server";

export function PublicSaddleHeightCalculator({ isNl = false, mode = "full", onInseamAdded }: {
  isNl?: boolean;
  mode?: "full" | "quick";
  onInseamAdded?: () => void;
}) {
  const locale = isNl ? "nl" : "en";
  const copy = saddleReliabilityMessages[locale];
  const quick = mode === "quick";
  const handoff = usePublicHandoff("saddle-height");
  const landing = useSyncExternalStore(subscribeLandingChange, getLandingSnapshot, getServerLandingSnapshot);
  const homeStart = landing === "home";
  const [heightCm, setHeightCm] = useState(190);
  const [heightKnown, setHeightKnown] = useState(false);
  const [inseamCm, setInseamCm] = useState<number>();
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
    if (!homeStart && typeof inseam?.value === "number" && inseam.method === "measured"
      && inseam.value >= 55 && inseam.value <= 105) {
      setInseamCm(inseam.value);
      setShowInseam(true);
      fields.push("inseamCm");
    }
    setPrefilledFields(fields);
  }

  useEffect(() => {
    if (!homeStart || !prefilled || quick || landingFocused.current) return;
    const slider = inseamCard.current?.querySelector<HTMLElement>('[role="slider"], input[type="range"]');
    if (!slider) return;
    landingFocused.current = true;
    slider.focus({ preventScroll: true });
    inseamCard.current?.scrollIntoView?.({ block: "center" });
  }, [homeStart, prefilled, quick]);

  const state = calculatePublicSaddleHeight({ heightCm, inseamCm, confirmed, override });
  const result = state.result;
  const estimated = calculatePublicSaddleHeight({ heightCm }).result;
  const nextWidth = state.nextStep.halfWidthMm;
  const guideHref = withLocalePrefix("/measurement-guide", locale);
  const saveHref = handoffLoginHref("saddle-height", locale);

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

  function updateInseam(value: number) {
    setInseamCm(value);
    setConfirmed(false);
    setOverride(false);
    if (calculatePublicSaddleHeight({ heightCm, inseamCm: value }).canRefine) {
      handoff.touch("inseamCm", value, "cm", "measured");
      onInseamAdded?.();
    } else {
      handoff.remove("inseamCm");
    }
  }

  function remeasure() {
    setInseamCm(undefined);
    setConfirmed(false);
    setOverride(false);
    setShowInseam(true);
    handoff.remove("inseamCm");
    inseamCard.current?.querySelector<HTMLElement>('[role="slider"], input[type="range"]')?.focus();
  }

  function saveMeasurements() {
    if (!state.canRefine || inseamCm === undefined) return;
    handoff.touch("heightCm", heightCm, "cm", "declared");
    handoff.touch("inseamCm", inseamCm, "cm", "measured");
  }

  const measurementCard = (
    <div ref={inseamCard} id="inseam" className={styles.card}>
      <h2 className={styles.inputTitle}>{copy.inseamTitle}</h2>
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
      <HandoffPrefillNotice calculator="saddle-height" locale={locale} fields={prefilledFields} />
      <div className={styles.layout}>
        <div className={styles.inputs}>
          <div className={styles.card}>
            <h2 className={styles.inputTitle}>{copy.heightTitle}</h2>
            <Slider label={copy.height} min={130} max={220} step={1} value={heightCm}
              valueLabel={number.format(heightCm)} unit="cm" onChange={updateHeight} />
            {!heightKnown && <p className={styles.hint}>{copy.example}</p>}
          </div>
          {!quick && measurementCard}
          {!quick && <details className={styles.card}>
            <summary>{copy.omittedTitle}</summary>
            <p className={styles.hint}>{copy.omittedBody}</p>
          </details>}
        </div>
        <div className={styles.results}>
          {result ? <section className={styles.card} aria-label={copy.result} id="saddle-result">
            <div className={styles.resultHeader}>
              <div className={styles.resultTitle}>
                <span className={styles.letter} aria-hidden="true">A</span>
                <div><h2>{copy.result}</h2><p className={styles.reference}>{copy.reference}</p></div>
              </div>
              <div className={styles.value} aria-live="polite" aria-atomic="true">
                <div>{result.adviceMm}<span>mm</span></div>
                <p>±{result.halfWidthMm} mm</p>
              </div>
            </div>
            <RangeBar value={result.adviceMm} low={result.lowerMm} high={result.upperMm}
              dashed={state.dashed} locale={locale} size={quick ? "compact" : "large"} />
            {!quick && <p className={styles.sentence}>
              {copy.sentence.replace("{low}", String(result.lowerMm)).replace("{high}", String(result.upperMm))
                .replace("{basis}", copy.bases[state.basis])}
            </p>}
            {!quick && state.canRefine && estimated && estimated.halfWidthMm > result.halfWidthMm
              && <p className={styles.improvement}>
                {copy.narrower.replace("{from}", String(estimated.halfWidthMm))
                  .replace("{to}", String(result.halfWidthMm))}
              </p>}
            {!quick && <p className={styles.nextStep} data-slot="saddle-next-step">
              <span aria-hidden="true">→</span>
              {copy.nextSteps[state.nextStep.kind].replace("{width}", String(nextWidth ?? ""))}
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
                if (inseamCm !== undefined) handoff.touch("inseamCm", inseamCm, "cm", "measured");
                onInseamAdded?.();
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
          {!quick && state.canRefine && <section className={styles.refinement}>
            <h2>{copy.refineTitle}</h2>
            <ul>
              <li>{copy.repeat.replace("{width}", String(nextWidth))}</li>
              <li>{copy.context}</li>
              <li>{copy.saved}</li>
            </ul>
            <Link href={saveHref} className={styles.save} onClick={saveMeasurements}>{copy.save}</Link>
            <p>{copy.carry}</p>
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
