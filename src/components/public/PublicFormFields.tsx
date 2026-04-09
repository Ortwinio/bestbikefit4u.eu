"use client";

import { useId, type ChangeEvent, type ReactNode } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/prototyper-ui/ui/select";
import { Input } from "@/components/prototyper-ui/ui/input";
import { Label } from "@/components/prototyper-ui/ui/label";
import {
  ScaleSliderQuestion,
} from "@/components/shared/ScaleSlider";
import { cn } from "@/utils/cn";

type PublicFieldOption = {
  value: string;
  label: string;
};

type PublicFieldShellProps = {
  fieldId?: string;
  descriptionId?: string;
  label: string;
  description?: string;
  className?: string;
  children: ReactNode;
};

type PublicNumberFieldProps = {
  label: string;
  value?: number;
  onChange: (value: number | undefined) => void;
  min: number;
  max: number;
  step?: number;
  unit?: string;
  description?: string;
  placeholder?: string;
  className?: string;
};

type PublicSelectFieldProps = {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: PublicFieldOption[];
  description?: string;
  placeholder?: string;
  className?: string;
};

type PublicScaleFieldProps = {
  label: string;
  value: string | null;
  onChange: (value: string) => void;
  options: PublicFieldOption[];
  description?: string;
  className?: string;
};

function PublicFieldShell({
  fieldId,
  descriptionId,
  label,
  description,
  className,
  children,
}: PublicFieldShellProps) {
  return (
    <div className={cn("space-y-3", className)}>
      <div className="space-y-1">
        <Label
          htmlFor={fieldId}
          className="text-sm font-semibold text-[color:var(--foreground)]"
        >
          {label}
        </Label>
        {description ? (
          <p
            id={descriptionId}
            className="text-sm leading-6 text-[color:var(--muted-foreground)]"
          >
            {description}
          </p>
        ) : null}
      </div>
      {children}
    </div>
  );
}

export function PublicNumberField({
  label,
  value,
  onChange,
  min,
  max,
  step = 1,
  unit,
  description,
  placeholder,
  className,
}: PublicNumberFieldProps) {
  const fieldId = useId();
  const descriptionId = description ? `${fieldId}-description` : undefined;

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    const nextValue = event.target.value;

    if (nextValue.trim() === "") {
      onChange(undefined);
      return;
    }

    const parsedValue = Number(nextValue);
    onChange(Number.isFinite(parsedValue) ? parsedValue : undefined);
  };

  return (
    <PublicFieldShell
      fieldId={fieldId}
      descriptionId={descriptionId}
      label={label}
      description={description}
      className={className}
    >
      <div className="relative">
        <Input
          id={fieldId}
          type="number"
          inputMode="decimal"
          min={min}
          max={max}
          step={step}
          value={value ?? ""}
          placeholder={placeholder}
          onChange={handleChange}
          aria-describedby={descriptionId}
          className={cn("h-11 rounded-xl border-[color:var(--border)] pr-16 text-base", unit ? "pr-20" : null)}
        />
        {unit ? (
          <span className="pointer-events-none absolute inset-y-0 right-4 flex items-center text-sm font-medium text-[color:var(--muted-foreground)]">
            {unit}
          </span>
        ) : null}
      </div>
    </PublicFieldShell>
  );
}

export function PublicSelectField({
  label,
  value,
  onChange,
  options,
  description,
  placeholder,
  className,
}: PublicSelectFieldProps) {
  const fieldId = useId();
  const descriptionId = description ? `${fieldId}-description` : undefined;

  return (
    <PublicFieldShell
      fieldId={fieldId}
      descriptionId={descriptionId}
      label={label}
      description={description}
      className={className}
    >
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger
          id={fieldId}
          aria-describedby={descriptionId}
          className="h-11 rounded-xl border-[color:var(--border)] bg-[color:var(--card)] text-sm"
        >
          <SelectValue placeholder={placeholder ?? label} />
        </SelectTrigger>
        <SelectContent>
          {options.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </PublicFieldShell>
  );
}

export function PublicScaleField({
  label,
  value,
  onChange,
  options,
  description,
  className,
}: PublicScaleFieldProps) {
  return (
    <ScaleSliderQuestion
      label={label}
      description={description}
      options={options.map((option) => ({ key: option.value, label: option.label }))}
      value={value}
      onChange={onChange}
      className={className}
    />
  );
}
