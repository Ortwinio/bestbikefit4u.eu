"use client";

import { useId } from "react";
import { Button, Slider, SegmentedControl, SegmentedControlItem } from "@/components/ui";
import type { NumberInputProps } from "@/components/ui/NumberInput";
import { useDashboardMessages } from "@/i18n/useDashboardMessages";
import { getBikesCopy } from "@/i18n/account/bikes";

/** Null remains null until the rider explicitly supplies a measurement. */
export function BikeNumberField({
  value,
  onChange,
  min = 0,
  max = 100,
  step = 1,
  disabled,
  allowClear = true,
  ...props
}: NumberInputProps & { allowClear?: boolean }) {
  const { locale } = useDashboardMessages();
  const copy = getBikesCopy(locale);
  const id = useId();
  const known = value !== null;
  // Retain legacy measurements outside the board range without clamping saved data.
  const lower = Math.min(min, value ?? min);
  const upper = Math.max(max, value ?? max);
  return (
    <div className="min-w-0 space-y-2 rounded-2xl border border-border bg-background/50 p-4">
      <Slider
        label={props.label}
        tooltip={props.tooltip}
        tooltipLabel={props.tooltipLabel}
        error={props.error}
        helperText={props.helperText}
        min={lower}
        max={upper}
        step={step === "any" ? 0.1 : step}
        value={value ?? min}
        valueLabel={known ? String(value) : copy.unknown}
        unit={known ? props.unit : undefined}
        onChange={onChange}
        disabled={disabled || !known}
        aria-describedby={allowClear ? id : undefined}
      />
      {allowClear && (
        <Button
          id={id}
          type="button"
          variant="outline"
          size="sm"
          disabled={disabled}
          aria-label={`${known ? copy.clear : copy.enter}: ${props.label ?? ""}`}
          onClick={() => onChange(known ? null : min)}
        >
          {known ? copy.clear : copy.enter}
        </Button>
      )}
    </div>
  );
}

export function BikeChoiceField({
  label,
  tooltip,
  value,
  onChange,
  options,
  optional = false,
}: {
  label: string;
  tooltip?: string;
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
  optional?: boolean;
}) {
  const { locale } = useDashboardMessages();
  const copy = getBikesCopy(locale);
  const id = useId();
  return (
    <div className="min-w-0 space-y-2">
      <p id={id} className="text-sm font-semibold text-foreground">
        {label}
      </p>
      {tooltip && <p className="text-sm text-muted-foreground">{tooltip}</p>}
      <SegmentedControl
        aria-labelledby={id}
        value={value}
        onValueChange={(next) => onChange(String(next))}
        className="flex flex-wrap"
      >
        {optional && <SegmentedControlItem value="">{copy.unknown}</SegmentedControlItem>}
        {options.map((option) => (
          <SegmentedControlItem key={option.value} value={option.value} className="whitespace-normal">
            {option.label}
          </SegmentedControlItem>
        ))}
      </SegmentedControl>
    </div>
  );
}

export function BikeCassetteField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  const { locale } = useDashboardMessages();
  const copy = getBikesCopy(locale);
  const teeth = value
    .split(/[,\s]+/)
    .filter(Boolean)
    .map(Number)
    .filter(Number.isFinite);
  return (
    <fieldset className="min-w-0 space-y-3 rounded-2xl border border-border p-4 sm:col-span-2">
      <legend className="px-2 text-sm font-semibold">{label}</legend>
      {teeth.map((tooth, index) => (
        <div key={index} className="flex items-end gap-3">
          <Slider
            label={`${label} ${index + 1}`}
            min={Math.min(8, tooth)}
            max={Math.max(60, tooth)}
            step={1}
            unit="t"
            value={tooth}
            onChange={(next) =>
              onChange(teeth.map((current, at) => (at === index ? next : current)).join(", "))
            }
          />
          <Button
            type="button"
            variant="outline"
            aria-label={`${copy.removeCog} ${index + 1}`}
            onClick={() => onChange(teeth.filter((_, at) => at !== index).join(", "))}
          >
            −
          </Button>
        </div>
      ))}
      <Button type="button" variant="outline" onClick={() => onChange([...teeth, 11].join(", "))}>
        {copy.addCog}
      </Button>
    </fieldset>
  );
}

/** Preserve named manufacturer sizes; numeric frame measurements use the same slider control. */
export function BikeFrameSizeField({ label, tooltip, value, onChange }: {
  label: string; tooltip?: string; value: string; onChange: (value: string) => void;
}) {
  const named = value.trim() !== "" && !Number.isFinite(Number(value));
  return <div className="space-y-3">
    {named && <p className="text-sm font-semibold">{label}: {value}</p>}
    <BikeNumberField label={label} tooltip={tooltip} min={35} max={75} step={0.5} unit="cm"
      value={named || value === "" ? null : Number(value)}
      onChange={next => onChange(next === null ? "" : String(next))} />
  </div>;
}
