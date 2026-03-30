"use client";

import { useRef, useEffect, useMemo } from "react";
import { Controller, useFormContext } from "react-hook-form";
import { InfoBox } from "@/components/ui";
import { AlertCircle, Info, HelpCircle, Sparkles } from "lucide-react";
import { IllustratedMeasurementHelp } from "./IllustratedMeasurementHelp";
import { NumberSlider } from "./NumberSlider";

// Anthropometric predictions based on height
// Sources: standard biomechanics ratios used in bike fitting literature
function clamp(v: number, min: number, max: number) {
  return Math.min(max, Math.max(min, v));
}

function predictedTorso(h: number) {
  // Seated torso (C7 to seat): ~37% of standing height
  return clamp(Math.round(h * 0.37), 45, 75);
}

function predictedArm(h: number) {
  // Acromion to middle fingertip: ~33% of height
  return clamp(Math.round(h * 0.33), 45, 75);
}

function predictedShoulder(h: number) {
  // Biacromial width (acromion to acromion): ~23% of height
  return clamp(Math.round(h * 0.23), 30, 55);
}

function predictedFemur(h: number) {
  // Greater trochanter to knee centre: ~24.5% of height
  return clamp(Math.round(h * 0.245), 35, 60);
}

function deviation(actual: number, predicted: number) {
  return Math.abs(actual - predicted) / predicted;
}

export function StepAdvancedMeasurements() {
  const {
    watch,
    setValue,
    formState: { errors },
  } = useFormContext();

  const heightCm     = watch("heightCm")      as number | undefined;
  const torsoLengthCm  = watch("torsoLengthCm")  as number | undefined;
  const armLengthCm    = watch("armLengthCm")    as number | undefined;
  const shoulderWidthCm = watch("shoulderWidthCm") as number | undefined;
  const femurLengthCm  = watch("femurLengthCm")  as number | undefined;

  // Track whether each field has been manually moved by the user
  const userEditedTorso    = useRef(false);
  const userEditedArm      = useRef(false);
  const userEditedShoulder = useRef(false);
  const userEditedFemur    = useRef(false);

  // Auto-populate from height whenever height changes (unless user has manually set the field)
  useEffect(() => {
    if (!heightCm) return;
    if (!userEditedTorso.current)
      setValue("torsoLengthCm", predictedTorso(heightCm), { shouldValidate: true });
    if (!userEditedArm.current)
      setValue("armLengthCm", predictedArm(heightCm), { shouldValidate: true });
    if (!userEditedShoulder.current)
      setValue("shoulderWidthCm", predictedShoulder(heightCm), { shouldValidate: true });
    if (!userEditedFemur.current)
      setValue("femurLengthCm", predictedFemur(heightCm), { shouldValidate: true });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [heightCm]);

  // Warnings: >20% deviation from height-based prediction
  const torsoWarning = useMemo(() => {
    if (!heightCm || !torsoLengthCm) return null;
    const pred = predictedTorso(heightCm);
    if (deviation(torsoLengthCm, pred) > 0.2) {
      const dir = torsoLengthCm > pred ? "longer" : "shorter";
      return `Your torso (${torsoLengthCm} cm) is more than 20% ${dir} than expected for your height. Expected around ${pred} cm.`;
    }
    return null;
  }, [heightCm, torsoLengthCm]);

  const armWarning = useMemo(() => {
    if (!heightCm || !armLengthCm) return null;
    const pred = predictedArm(heightCm);
    if (deviation(armLengthCm, pred) > 0.2) {
      const dir = armLengthCm > pred ? "longer" : "shorter";
      return `Your arm length (${armLengthCm} cm) is more than 20% ${dir} than expected. Expected around ${pred} cm.`;
    }
    return null;
  }, [heightCm, armLengthCm]);

  const shoulderWarning = useMemo(() => {
    if (!heightCm || !shoulderWidthCm) return null;
    const pred = predictedShoulder(heightCm);
    if (deviation(shoulderWidthCm, pred) > 0.2) {
      const dir = shoulderWidthCm > pred ? "wider" : "narrower";
      return `Your shoulder width (${shoulderWidthCm} cm) is more than 20% ${dir} than expected. Expected around ${pred} cm.`;
    }
    return null;
  }, [heightCm, shoulderWidthCm]);

  const femurWarning = useMemo(() => {
    if (!heightCm || !femurLengthCm) return null;
    const pred = predictedFemur(heightCm);
    if (deviation(femurLengthCm, pred) > 0.2) {
      const dir = femurLengthCm > pred ? "longer" : "shorter";
      return `Your femur (${femurLengthCm} cm) is more than 20% ${dir} than expected. Expected around ${pred} cm.`;
    }
    return null;
  }, [heightCm, femurLengthCm]);

  return (
    <div className="space-y-6">
      <InfoBox
        variant="primary"
        icon={<HelpCircle className="h-4 w-4 text-[color:var(--primary)]" />}
      >
        <p className="font-medium text-[color:var(--foreground)]">Optional — but worth it</p>
        <p className="mt-1 text-[color:var(--muted-foreground)]">
          Sliders are pre-set to the typical value for your height. Adjust them to match your
          actual measurements — each one refines a different part of your fit.
          Torso and arm length determine handlebar reach. Shoulder width influences
          handlebar width. Femur length fine-tunes saddle setback.
        </p>
      </InfoBox>

      {/* Torso Length */}
      <div className="space-y-2">
        <Controller
          name="torsoLengthCm"
          render={({ field }) => (
            <NumberSlider
              label="Torso Length"
              min={45}
              max={75}
              step={1}
              unit="cm"
              value={
                typeof field.value === "number" && !Number.isNaN(field.value)
                  ? field.value
                  : undefined
              }
              onChange={(v) => { field.onChange(v); field.onBlur(); }}
              onUserInteract={() => { userEditedTorso.current = true; }}
              error={errors.torsoLengthCm?.message as string}
            />
          )}
        />
        <IllustratedMeasurementHelp measurement="torsoLength">
          <InfoBox variant="secondary" icon={<Info className="h-4 w-4 text-[color:var(--primary)]" />}>
            <p className="font-medium text-[color:var(--foreground)]">How to measure torso length</p>
            <ul className="mt-1 list-inside list-disc space-y-1 text-[color:var(--muted-foreground)]">
              <li>Sit upright on a firm chair, back straight</li>
              <li>Measure from the seat surface to the bony bump at the base of your neck (C7 vertebra)</li>
            </ul>
            <p className="mt-2 text-xs text-[color:var(--muted-foreground)]">
              <span className="font-medium">Affects:</span> handlebar reach and stack
            </p>
          </InfoBox>
        </IllustratedMeasurementHelp>
        {torsoWarning && (
          <InfoBox variant="warning" icon={<AlertCircle className="h-4 w-4 text-[color:var(--warning)]" />}>
            <p className="font-medium">Check your torso measurement</p>
            <p className="mt-1 text-[color:var(--muted-foreground)]">{torsoWarning}</p>
          </InfoBox>
        )}
      </div>

      {/* Arm Length */}
      <div className="space-y-2">
        <Controller
          name="armLengthCm"
          render={({ field }) => (
            <NumberSlider
              label="Arm Length"
              min={45}
              max={75}
              step={1}
              unit="cm"
              value={
                typeof field.value === "number" && !Number.isNaN(field.value)
                  ? field.value
                  : undefined
              }
              onChange={(v) => { field.onChange(v); field.onBlur(); }}
              onUserInteract={() => { userEditedArm.current = true; }}
              error={errors.armLengthCm?.message as string}
            />
          )}
        />
        <IllustratedMeasurementHelp measurement="armLength">
          <InfoBox variant="secondary" icon={<Info className="h-4 w-4 text-[color:var(--primary)]" />}>
            <p className="font-medium text-[color:var(--foreground)]">How to measure arm length</p>
            <ul className="mt-1 list-inside list-disc space-y-1 text-[color:var(--muted-foreground)]">
              <li>Stand with arm relaxed at your side</li>
              <li>Measure from the bony shoulder tip (acromion) to the middle finger tip</li>
            </ul>
            <p className="mt-2 text-xs text-[color:var(--muted-foreground)]">
              <span className="font-medium">Affects:</span> handlebar reach and stem length
            </p>
          </InfoBox>
        </IllustratedMeasurementHelp>
        {armWarning && (
          <InfoBox variant="warning" icon={<AlertCircle className="h-4 w-4 text-[color:var(--warning)]" />}>
            <p className="font-medium">Check your arm measurement</p>
            <p className="mt-1 text-[color:var(--muted-foreground)]">{armWarning}</p>
          </InfoBox>
        )}
      </div>

      {/* Shoulder Width */}
      <div className="space-y-2">
        <Controller
          name="shoulderWidthCm"
          render={({ field }) => (
            <NumberSlider
              label="Shoulder Width"
              min={30}
              max={55}
              step={1}
              unit="cm"
              value={
                typeof field.value === "number" && !Number.isNaN(field.value)
                  ? field.value
                  : undefined
              }
              onChange={(v) => { field.onChange(v); field.onBlur(); }}
              onUserInteract={() => { userEditedShoulder.current = true; }}
              error={errors.shoulderWidthCm?.message as string}
            />
          )}
        />
        <IllustratedMeasurementHelp measurement="shoulderWidth">
          <InfoBox variant="secondary" icon={<Info className="h-4 w-4 text-[color:var(--primary)]" />}>
            <p className="font-medium text-[color:var(--foreground)]">How to measure shoulder width</p>
            <ul className="mt-1 list-inside list-disc space-y-1 text-[color:var(--muted-foreground)]">
              <li>Stand relaxed with arms at sides</li>
              <li>Measure between the outermost bony points of both shoulders (acromion to acromion)</li>
            </ul>
            <p className="mt-2 text-xs text-[color:var(--muted-foreground)]">
              <span className="font-medium">Affects:</span> handlebar width recommendation
            </p>
          </InfoBox>
        </IllustratedMeasurementHelp>
        {shoulderWarning && (
          <InfoBox variant="warning" icon={<AlertCircle className="h-4 w-4 text-[color:var(--warning)]" />}>
            <p className="font-medium">Check your shoulder measurement</p>
            <p className="mt-1 text-[color:var(--muted-foreground)]">{shoulderWarning}</p>
          </InfoBox>
        )}
      </div>

      {/* Femur Length */}
      <div className="space-y-2">
        <Controller
          name="femurLengthCm"
          render={({ field }) => (
            <NumberSlider
              label="Femur Length"
              min={35}
              max={60}
              step={1}
              unit="cm"
              value={
                typeof field.value === "number" && !Number.isNaN(field.value)
                  ? field.value
                  : undefined
              }
              onChange={(v) => { field.onChange(v); field.onBlur(); }}
              onUserInteract={() => { userEditedFemur.current = true; }}
              error={errors.femurLengthCm?.message as string}
            />
          )}
        />
        <InfoBox variant="secondary" icon={<Info className="h-4 w-4 text-[color:var(--primary)]" />}>
          <p className="font-medium text-[color:var(--foreground)]">How to measure femur length</p>
          <ul className="mt-1 list-inside list-disc space-y-1 text-[color:var(--muted-foreground)]">
            <li>Sit on a hard surface with your thigh horizontal</li>
            <li>Measure from the bony hip point (greater trochanter) to the outside of the knee</li>
          </ul>
          <p className="mt-2 text-xs text-[color:var(--muted-foreground)]">
            <span className="font-medium">Affects:</span> saddle setback and fore-aft position
          </p>
        </InfoBox>
        {femurWarning && (
          <InfoBox variant="warning" icon={<AlertCircle className="h-4 w-4 text-[color:var(--warning)]" />}>
            <p className="font-medium">Check your femur measurement</p>
            <p className="mt-1 text-[color:var(--muted-foreground)]">{femurWarning}</p>
          </InfoBox>
        )}
      </div>

      <InfoBox
        variant="primary"
        icon={<Sparkles className="h-4 w-4 text-[color:var(--primary)]" />}
      >
        <p className="font-medium text-[color:var(--foreground)]">How advanced measurements improve your fit</p>
        <p className="mt-1 text-[color:var(--muted-foreground)]">
          A basic fit uses height and inseam only. Adding torso and arm length lets us
          calculate reach precisely, rather than estimating it from height alone. Shoulder
          width gives a starting point for handlebar width. Femur length refines saddle
          setback. Each additional measurement reduces the range of uncertainty in the final numbers.
        </p>
      </InfoBox>
    </div>
  );
}
