"use client";

import { OptionCard, Slider } from "@/components/ui";

type ProfileQuestionProps = {
  label: string;
  description?: string;
  options: { key: string; label: string }[];
  value: string | null;
  onChange: (key: string) => void;
  className?: string;
};

export function ProfileChoiceQuestion({ label, description, options, value, onChange, className }: ProfileQuestionProps) {
  return (
    <fieldset className={`min-w-0 space-y-3 ${className ?? ""}`}>
      <legend className="font-semibold">{label}</legend>
      {description && <p className="text-sm text-muted-foreground">{description}</p>}
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
        {options.map((option) => <OptionCard key={option.key} label={option.label} selected={value === option.key} onClick={() => onChange(option.key)} />)}
      </div>
    </fieldset>
  );
}

export function ProfileAssessmentSlider({ label, description, options, value, onChange, className }: ProfileQuestionProps) {
  const selectedIndex = options.findIndex((option) => option.key === value);
  const numericKeys = options.every((option) => Number.isFinite(Number(option.key)));
  const score = numericKeys ? value : selectedIndex + 1;
  const maximum = numericKeys ? options[options.length - 1].key : options.length;
  return (
    <div className={`min-w-0 space-y-3 ${className ?? ""}`}>
      <Slider label={label} helperText={description} value={Math.max(0, selectedIndex)} min={0} max={options.length - 1} step={1} valueLabel={selectedIndex < 0 ? "—" : `${score} / ${maximum}`} aria-valuetext={options[selectedIndex]?.label} onChange={(index) => onChange(options[index].key)} />
      <div className="flex flex-wrap gap-2" role="group" aria-label={label}>
        {options.map((option) => <OptionCard key={option.key} className="w-auto flex-1 basis-24 p-3 text-sm" showCheck={false} label={option.label} selected={value === option.key} onClick={() => onChange(option.key)} />)}
      </div>
    </div>
  );
}
