"use client";

import { useState, type ChangeEvent, type ReactNode } from "react";
import { Field as BaseField } from "@base-ui/react/field";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/prototyper-ui/ui/select";
import { Input } from "@/components/prototyper-ui/ui/input";
import { Label } from "@/components/prototyper-ui/ui/label";
import { cn } from "@/utils/cn";

type PublicFieldOption = {
  value: string;
  label: string;
};

type PublicFieldShellProps = {
  label: string;
  description?: string;
  className?: string;
  children: ReactNode;
  mounted: boolean;
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

function PublicFieldShell({
  label,
  description,
  className,
  children,
  mounted,
}: PublicFieldShellProps) {
  const Shell = mounted ? BaseField.Root : "div";

  return (
    <Shell className={cn("space-y-3", className)}>
      <div className="space-y-1">
        <Label className="text-sm font-semibold text-[color:var(--foreground)]">{label}</Label>
        {description ? (
          <p className="text-sm leading-6 text-[color:var(--muted-foreground)]">{description}</p>
        ) : null}
      </div>
      {children}
    </Shell>
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
  const [isMounted] = useState(() => typeof window !== "undefined");

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
      label={label}
      description={description}
      className={className}
      mounted={isMounted}
    >
      <div className="relative">
        {isMounted ? (
          <Input
            type="number"
            inputMode="decimal"
            min={min}
            max={max}
            step={step}
            value={value ?? ""}
            placeholder={placeholder}
            onChange={handleChange}
            className={cn("h-11 rounded-xl border-[color:var(--border)] pr-16 text-base", unit ? "pr-20" : null)}
          />
        ) : (
          <input
            type="number"
            inputMode="decimal"
            min={min}
            max={max}
            step={step}
            value={value ?? ""}
            placeholder={placeholder}
            onChange={handleChange}
            className={cn(
              "h-11 w-full min-w-0 rounded-xl border border-[color:var(--border)] bg-[color:var(--card)] px-3 py-1 text-base text-[color:var(--foreground)] shadow-field outline-none transition-[color,background-color,border-color,box-shadow,opacity] duration-150 ease-smooth placeholder:text-[color:var(--muted-foreground)] hover-only:hover:border-field-border-hover focus-visible:border-field-border-focus focus-visible:focus-field-ring motion-reduce:transition-none",
              unit ? "pr-20" : "pr-16"
            )}
          />
        )}
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
  const [isMounted] = useState(() => typeof window !== "undefined");

  return (
    <PublicFieldShell
      label={label}
      description={description}
      className={className}
      mounted={isMounted}
    >
      {isMounted ? (
        <Select value={value} onValueChange={onChange}>
          <SelectTrigger className="h-11 rounded-xl border-[color:var(--border)] bg-[color:var(--card)] text-sm">
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
      ) : (
        <select
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className="h-11 w-full rounded-xl border border-[color:var(--border)] bg-[color:var(--card)] px-3 py-1 text-sm text-[color:var(--foreground)] shadow-field outline-none transition-[color,background-color,border-color,box-shadow,opacity] duration-150 ease-smooth focus-visible:border-field-border-focus focus-visible:focus-field-ring motion-reduce:transition-none"
        >
          {placeholder && !value ? (
            <option value="" disabled>
              {placeholder}
            </option>
          ) : null}
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      )}
    </PublicFieldShell>
  );
}
