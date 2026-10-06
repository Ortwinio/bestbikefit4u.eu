"use client";

import Link from "next/link";
import { useState } from "react";
import { Button, SegmentedControl, SegmentedControlItem, Slider } from "@/components/ui";
import { HandoffPrefillNotice } from "@/components/calculators/HandoffPrefillNotice";
import { usePublicHandoff } from "@/lib/handoff/usePublicHandoff";
import { HANDOFF_FIELD_UNITS, type HandoffEntry, type HandoffField } from "@/lib/handoff/store";
import type { Locale } from "@/i18n/config";
import { withLocalePrefix } from "@/i18n/navigation";
import { reliabilityMessages } from "@/i18n/calculators/reliability";
import { calculatorExamples, calculatorExampleLine } from "@/i18n/calculators/examples";
import { measurementChoiceMessages } from "@/i18n/calculators/measurementChoice";
import { reliabilityBodyMessages } from "@/i18n/calculators/reliabilityBody";
import { runBikeFitCalculation, runCrankLengthCalculation, runFrameSizeCalculation } from "@/lib/public-calculators/fitAdapters";
import { calculateSaddleWidth } from "@/lib/saddle-width-engine";
import { CRANK_LENGTH_TABLE } from "../../../convex/lib/fitAlgorithm/constants";
import { calculateSaddleHeight, checkInseamPlausibility } from "../../../shared/reliability/saddleHeight";
import { getReliabilityRange, type ReliabilityMetric } from "../../../shared/reliability/calculators";
import { ReliabilityCalculatorTemplate } from "./ReliabilityCalculatorTemplate";
import { ReliabilityResultRows, type ReliabilityResultRow } from "./ReliabilityResultRows";

type BodyCalculator = "bike-fit" | "frame-size" | "crank-length" | "saddle-width";
const categories = ["road", "gravel", "mtb", "city"] as const;
const bounds = {
  heightCm: [130, 210, 1, 190], inseamCm: [55, 105, 0.5, 89], weightKg: [40, 150, 1, 94],
  hipCircumferenceCm: [70, 140, 1, 100], sitBoneWidthMm: [90, 170, 1, 122],
} as const;
type NumericField = keyof typeof bounds;

export function PublicBodyReliabilityCalculator({ calculator, locale = "en" }: {
  calculator: BodyCalculator; locale?: Locale;
}) {
  const copy = reliabilityBodyMessages[locale];
  const common = reliabilityMessages[locale];
  const page = copy.pages[calculator];
  const handoff = usePublicHandoff(calculator);
  const [edits, setEdits] = useState<Partial<Record<HandoffField, HandoffEntry | null>>>({});
  const [confirmedPair, setConfirmedPair] = useState("");
  const [chosenInseamKind, setChosenInseamKind] = useState<"measured" | "estimated">();
  const format = new Intl.NumberFormat(locale, { maximumFractionDigits: 1 });
  function entry(field: HandoffField) {
    return field in edits ? edits[field] ?? undefined : handoff.getPrefill(field);
  }
  function numericEntry(field: NumericField) {
    const item = entry(field);
    const [min, max] = bounds[field];
    return typeof item?.value === "number" && item.value >= min && item.value <= max ? item : undefined;
  }
  function value(field: NumericField): number {
    return numericEntry(field)?.value as number | undefined ?? bounds[field][3];
  }
  function change(field: HandoffField, next: number | string, measured = false, kind?: "measured" | "estimated") {
    const method = kind ?? (measured ? "measured" : field === "bikeCategory" ? "bike" : "declared");
    if (field === "inseamCm") {
      setConfirmedPair("");
      if (calculator === "bike-fit" && handoff.source === "session") handoff.remove(field);
    }
    setEdits(previous => ({ ...previous, [field]: {
      field, value: next, unit: HANDOFF_FIELD_UNITS[field], method, calculator, touchedAt: Date.now(),
    } }));
    handoff.touch(field, next, HANDOFF_FIELD_UNITS[field], method);
  }
  function omit(field: HandoffField) {
    setEdits(previous => ({ ...previous, [field]: null }));
    handoff.remove(field);
  }
  const widthMode = calculator === "saddle-width";
  const height = value("heightCm");
  const inseam = numericEntry("inseamCm");
  const inseamKind = chosenInseamKind ?? (!inseam || (inseam.kind ?? inseam.method) === "measured" ? "measured" : "estimated");
  const measurementCopy = measurementChoiceMessages[locale];
  const sitBones = numericEntry("sitBoneWidthMm");
  const categoryValue = entry("bikeCategory")?.value;
  const category = categories.find(item => item === categoryValue) ?? "road";
  const plausibility = inseam ? checkInseamPlausibility(height, value("inseamCm")) : null;
  const pair = `${height}:${value("inseamCm")}`;
  const warning = plausibility?.status === "large" || (plausibility?.status === "check" && confirmedPair !== pair);
  const useInseam = !!inseam && plausibility?.status !== "large" && plausibility?.status !== "error";
  const provenance = {
    kind: useInseam ? inseam.kind ?? (inseam.method === "bike" ? "declared" : inseam.method) : "derived" as const,
    method: inseam?.measurementMethod,
    repeatCount: inseam?.repeatCount,
    withinTolerance: inseam?.withinTolerance,
    unresolvedWarning: warning || inseam?.unresolvedWarning,
  };
  const saddle = calculateSaddleHeight({ heightCm: height,
    inseamCm: useInseam ? value("inseamCm") : undefined, provenance });
  const effectiveInseam = saddle.inseamMm / 10;
  const basis = useInseam ? provenance.kind === "measured" ? copy.measured : copy.declared : copy.derived;
  const evidence = { inseamCm: effectiveInseam, inseamProvenance: provenance };
  const rows: ReliabilityResultRow[] = [];
  function add(metric: keyof typeof copy.values & ReliabilityMetric, centre: number, letter?: string,
    options?: number[], optionLabels?: string[], rowBasis = basis) {
    const range = getReliabilityRange({ metric, value: centre, options, evidence: {
      ...evidence, sitBonesMeasured: !!sitBones && (sitBones.kind ?? sitBones.method) === "measured",
    } });
    if (range) rows.push({ label: copy.values[metric], unit: metric === "frameSize" ? "" : "mm",
      range, basis: rowBasis, letter, dashed: warning, optionLabels });
  }
  if (calculator === "bike-fit") {
    const { fitResult } = runBikeFitCalculation({ heightCm: height, inseamCm: effectiveInseam,
      category, ridingGoal: "balanced", flexibility: 3, coreStability: 3 });
    add("saddleHeight", fitResult.saddleHeightMm, "A");
    add("saddleSetback", fitResult.saddleSetbackMm, "B");
    add("handlebarDrop", fitResult.barDropMm, "C");
    add("reach", fitResult.saddleToBarReachMm, "D");
  } else if (calculator === "crank-length") {
    const result = runCrankLengthCalculation({ inseamCm: effectiveInseam, category });
    add("crankLength", result, undefined, CRANK_LENGTH_TABLE.map(option => option.crankLength));
  } else if (calculator === "frame-size") {
    const result = runFrameSizeCalculation({ heightCm: height, inseamCm: effectiveInseam, category });
    const labels = [...new Set(Array.from({ length: 81 }, (_, index) => runFrameSizeCalculation({
      heightCm: 130 + index, inseamCm: effectiveInseam, category,
    }).estimatedFrameSize))];
    add("frameSize", labels.indexOf(result.estimatedFrameSize) + 1, undefined,
      labels.map((_, index) => index + 1), labels, copy.frameSizeBasis);
  } else {
    const width = calculateSaddleWidth({ inputMethod: sitBones ? "measured" : "estimated",
      sitBoneWidthMm: sitBones ? value("sitBoneWidthMm") : undefined,
      heightCm: height, weightKg: value("weightKg"), hipCircumferenceCm: value("hipCircumferenceCm"),
      ridingType: "endurance_road", postureCategory: "balanced" });
    add("saddleWidth", width.finalRecommendedWidthMm, undefined, undefined, undefined,
      sitBones ? (sitBones.kind ?? sitBones.method) === "measured"
        ? copy.sitBoneBasis : copy.sitBoneDeclaredBasis : copy.estimatedWidthBasis);
  }
  const fields: NumericField[] = widthMode
    ? ["heightCm", "weightKg", "hipCircumferenceCm", "sitBoneWidthMm"] : ["heightCm", "inseamCm"];
  const prefilled = fields.filter(field => !(field in edits) && numericEntry(field));
  const hasOwnStart = widthMode ? !!sitBones || ["heightCm", "weightKg", "hipCircumferenceCm"]
    .every(field => !!numericEntry(field as NumericField)) : !!numericEntry("heightCm");
  const measuredField: NumericField = widthMode ? "sitBoneWidthMm" : "inseamCm";
  const measurement = numericEntry(measuredField);
  const labels = { heightCm: copy.height, inseamCm: copy.inseam, weightKg: copy.weight,
    hipCircumferenceCm: copy.hip, sitBoneWidthMm: copy.sitBones };
  const exampleFields = fields.filter(field => field !== measuredField && !numericEntry(field));
  const showExample = !chosenInseamKind && exampleFields.length > 0 && Object.keys(edits).length === 0
    && !fields.some(field => numericEntry(field)) && !categories.some(item => item === categoryValue);
  const exampleLine = exampleFields.length === 1 && exampleFields[0] === "heightCm"
    ? calculatorExamples[locale].height.replace("{height}", format.format(height))
    : calculatorExampleLine(locale, exampleFields.map(field =>
      `${labels[field]} ${format.format(value(field))} ${HANDOFF_FIELD_UNITS[field]}`));
  function slider(field: NumericField) {
    const [min, max, step] = bounds[field];
    const isMeasurement = field === measuredField;
    const isExample = exampleFields.includes(field);
    return <div className="grid gap-2" key={field} data-example-field={isExample ? field : undefined}>
      {isExample && <span data-usability="example-label" className="w-fit rounded-full bg-muted px-2 py-1 text-xs font-semibold text-muted-foreground">{calculatorExamples[locale].label}</span>}
      <Slider label={labels[field]} value={value(field)} min={min} max={max} step={step}
        className={isExample ? "[&>div>span[aria-hidden=true]]:text-muted-foreground" : undefined}
        valueLabel={numericEntry(field) ? format.format(value(field)) : isMeasurement ? common.missing : format.format(value(field))}
        unit={numericEntry(field) || !isMeasurement ? HANDOFF_FIELD_UNITS[field] : undefined}
        onChange={next => change(field, next, isMeasurement,
          calculator === "bike-fit" && field === "inseamCm" ? inseamKind : undefined)}
        helperText={field === "inseamCm" ? copy.measureHint : field === "sitBoneWidthMm"
          ? copy.sitBoneHint : field === "hipCircumferenceCm" ? copy.hipHint : undefined} />
      {!numericEntry(field) && !isMeasurement && <Button variant="ghost" size="sm"
        onClick={() => change(field, value(field))}>{copy.confirm}</Button>}
    </div>;
  }
  const next = widthMode ? measurement ? copy.postureNext : copy.widthNext : warning ? copy.measureNext
    : !measurement ? copy.measureNext
    : calculator === "frame-size" ? copy.geometryNext : calculator === "crank-length" ? copy.crankNext : copy.repeatNext;
  return <ReliabilityCalculatorTemplate calculator={calculator} locale={locale} title={page.title}
    reasonValue={rows[0]?.range.kind === "continuous" ? `±${format.format(rows[0].range.halfWidth)} ${rows[0].unit}` : undefined}
    description={page.description} notice={<HandoffPrefillNotice calculator={calculator} locale={locale}
      fields={[...prefilled, ...(!("bikeCategory" in edits) && categories.some(item => item === categoryValue) && !widthMode
        ? ["bikeCategory" as const] : [])]} />}
    steps={[
      { title: copy.first, status: hasOwnStart ? common.filled : common.notFilled,
        content: <>{slider("heightCm")}{widthMode && <>{slider("weightKg")}{slider("hipCircumferenceCm")}</>}</> },
      { title: copy.second, status: measurement ? common.filled : common.notFilled,
        content: <>{calculator === "bike-fit" && <>
          <SegmentedControl data-usability="measurement-kind" aria-label={measurementCopy.label}
            value={inseamKind} className="grid grid-cols-2" onValueChange={next => {
              if (next !== "measured" && next !== "estimated") return;
              setChosenInseamKind(next);
              if (inseam) change("inseamCm", value("inseamCm"), false, next);
            }}>
            <SegmentedControlItem value="measured">{measurementCopy.measured}</SegmentedControlItem>
            <SegmentedControlItem value="estimated">{measurementCopy.estimated}</SegmentedControlItem>
          </SegmentedControl>
          <p className="text-sm text-muted-foreground">{measurementCopy.hint}</p>
        </>}{slider(measuredField)}{measurement && <Button variant="ghost" size="sm"
          onClick={() => omit(measuredField)}>{copy.clear}</Button>}
          {!widthMode && <SegmentedControl aria-label={copy.category} value={category}
            className="grid grid-cols-2" onValueChange={next => {
              if (typeof next === "string" && categories.some(item => item === next)) change("bikeCategory", next);
            }}>
            {categories.map(item => <SegmentedControlItem key={item} value={item}>
              {copy.categories[item]}</SegmentedControlItem>)}
          </SegmentedControl>}
          {!widthMode && warning && <div role="status" className="rounded-xl border border-border bg-muted p-3 text-sm">
            <p>{plausibility?.status === "large" ? copy.large : copy.check}</p>
            {plausibility?.status === "check" && <Button variant="outline" className="mt-3 whitespace-normal"
              onClick={() => setConfirmedPair(pair)}>{copy.confirmCheck}</Button>}
          </div>}
        </>, hint: <Link href={withLocalePrefix("/measurement-guide", locale)}>{copy.measurement}</Link> },
    ]}
    example={showExample && <p data-usability="example" data-calculator-example className="mb-4 rounded-xl bg-muted p-3 text-sm text-muted-foreground">{exampleLine}</p>}
    results={<>
      <ReliabilityResultRows rows={rows} locale={locale} />
      <p className="mt-3 text-xs text-muted-foreground">{copy.assumptions}</p></>}
    nextStep={next} omitted={page.omitted}
    refinement={page.refinement.map(text => ({ text }))} />;
}
