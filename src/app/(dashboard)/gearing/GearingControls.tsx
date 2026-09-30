"use client";

import { Button, Slider } from "@/components/ui";
import type { ToolsGearingCopy } from "@/i18n/account/toolsGearing";
import { parseCommaSeparatedNumbers, type GearingData } from "./gearingMath";

type ValueSliderProps = {
  label: string;
  value: string;
  onChange: (value: string) => void;
  min: number;
  max: number;
  step?: number;
  unit?: string;
  copy: ToolsGearingCopy;
  optional?: boolean;
};

export function ValueSlider({ value, onChange, copy, optional, min, max, ...props }: ValueSliderProps) {
  const entered = value.trim() !== "" && Number.isFinite(Number(value));
  const number = entered ? Number(value) : min;
  return (
    <div
      className="space-y-1"
      onKeyDownCapture={(event) => {
        if (!entered && event.key === "Home") onChange(String(min));
        if (!entered && event.key === "End") onChange(String(max));
      }}
    >
      <Slider
        {...props}
        min={Math.min(min, number)}
        max={Math.max(max, number)}
        value={number}
        valueLabel={entered ? undefined : copy.unset}
        aria-valuetext={entered ? `${number} ${props.unit ?? ""}` : copy.unset}
        onChange={(next) => onChange(String(next))}
      />
      {optional && entered ? (
        <Button size="sm" variant="ghost" onClick={() => onChange("")} aria-label={`${copy.clear} ${props.label}`}>
          {copy.clear}
        </Button>
      ) : null}
    </div>
  );
}

export function CassetteEditor({
  label,
  value,
  onChange,
  copy,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  copy: ToolsGearingCopy;
}) {
  const cogs = parseCommaSeparatedNumbers(value);
  const write = (next: number[]) => onChange(next.join(", "));
  const endpoint = (side: "min" | "max", next: string) => {
    if (!cogs.length) {
      write([Number(next)]);
      return;
    }
    if (cogs.length === 1) {
      write(side === "min" ? [Number(next), cogs[0]] : [cogs[0], Number(next)]);
      return;
    }
    const target = side === "min" ? Math.min(...cogs) : Math.max(...cogs);
    const index = cogs.indexOf(target);
    write(cogs.map((cog, at) => (at === index ? Number(next) : cog)));
  };
  return (
    <fieldset className="min-w-0 space-y-4">
      <legend className="mb-4 text-base font-semibold">{label}</legend>
      <ValueSlider
        label={`${label} · ${copy.smallest}`}
        min={9}
        max={54}
        step={1}
        unit={copy.teeth}
        value={cogs.length ? String(Math.min(...cogs)) : ""}
        onChange={(next) => endpoint("min", next)}
        copy={copy}
      />
      <ValueSlider
        label={`${label} · ${copy.largest}`}
        min={9}
        max={54}
        step={1}
        unit={copy.teeth}
        value={cogs.length ? String(Math.max(...cogs)) : ""}
        onChange={(next) => endpoint("max", next)}
        copy={copy}
      />
      <div className="flex flex-wrap gap-2" role="group" aria-label={`${label} · ${copy.presets}`}>
        {[
          [11, 30],
          [11, 34],
          [11, 36],
          [10, 44],
          [10, 51],
        ].map(([small, large]) => (
          <Button key={`${small}-${large}`} size="sm" variant="outline" onClick={() => write([small, large])}>
            {small}–{large}
          </Button>
        ))}
      </div>
      <p className="text-sm text-muted-foreground">{copy.cassetteNote}</p>
      <details className="rounded-2xl border border-border p-4">
        <summary className="min-h-11 cursor-pointer py-2.5 font-medium">
          {copy.exact} · {cogs.length}
        </summary>
        <div className="mt-4 space-y-4">
          {cogs.map((cog, index) => (
            <div key={index} className="flex min-w-0 items-center gap-2">
              <div className="min-w-0 flex-1">
                <ValueSlider
                  label={`${label} · ${copy.cog} ${index + 1}`}
                  value={String(cog)}
                  min={9}
                  max={54}
                  step={1}
                  unit={copy.teeth}
                  copy={copy}
                  onChange={(next) => write(cogs.map((current, at) => (at === index ? Number(next) : current)))}
                />
              </div>
              <Button
                size="sm"
                variant="ghost"
                aria-label={`${label} · ${copy.removeCog} ${index + 1}`}
                onClick={() => write(cogs.filter((_, at) => at !== index))}
              >
                ×
              </Button>
            </div>
          ))}
          <Button size="sm" variant="outline" onClick={() => write([...cogs, (cogs.at(-1) ?? 10) + 1])}>
            {copy.addCog}
          </Button>
        </div>
      </details>
      {cogs.length ? (
        <Button size="sm" variant="ghost" onClick={() => onChange("")} aria-label={`${copy.clear} ${label}`}>
          {copy.clear}
        </Button>
      ) : null}
    </fieldset>
  );
}

export function GearLadder({ data, copy, locale }: { data: GearingData; copy: ToolsGearingCopy; locale: string }) {
  const rings = data.chainrings ?? [];
  const cogs = data.cassetteTeeth ?? [];
  const wheel = data.wheelCircumferenceMm;
  if (!rings.length || !cogs.length || !wheel) return <p className="py-12 text-center">{copy.noGears}</p>;
  const maximum = ((Math.max(...rings) / Math.min(...cogs)) * wheel) / 1000;
  const format = (n: number) => new Intl.NumberFormat(locale, { maximumFractionDigits: 1 }).format(n);
  return (
    <div>
      <svg viewBox="0 0 520 240" role="img" aria-label={copy.ladderDescription} className="w-full">
        {[0, 1, 2, 3, 4].map((tick) => (
          <g key={tick}>
            <line
              x1={60 + tick * 105}
              x2={60 + tick * 105}
              y1="28"
              y2="188"
              stroke="currentColor"
              opacity="0.12"
              strokeDasharray="3 5"
            />
            <text x={60 + tick * 105} y="213" textAnchor="middle" fill="currentColor" fontSize="12">
              {format((maximum * tick) / 4)} m
            </text>
          </g>
        ))}
        {rings.map((ring, row) => (
          <g key={`${ring}-${row}`}>
            <text x="4" y={70 + row * 76} fill="currentColor" fontSize="16" fontWeight="700">
              {ring}T
            </text>
            <line x1="60" x2="480" y1={65 + row * 76} y2={65 + row * 76} stroke="currentColor" opacity="0.25" />
            {cogs.map((cog, index) => {
              const development = ((ring / cog) * wheel) / 1000;
              const x = 60 + (development / maximum) * 420;
              return (
                <g key={`${cog}-${index}`}>
                  <title>
                    {ring}/{cog}: {format(development)} m
                  </title>
                  <line
                    x1={x}
                    x2={x}
                    y1={48 + row * 76}
                    y2={82 + row * 76}
                    stroke="currentColor"
                    strokeWidth="5"
                    strokeLinecap="round"
                  />
                </g>
              );
            })}
          </g>
        ))}
      </svg>
      <div className="flex justify-between text-xs font-semibold uppercase tracking-wider">
        <span>{copy.easy}</span>
        <span>{copy.development}</span>
        <span>{copy.hard}</span>
      </div>
      <p className="mt-4 text-sm">{copy.ladderDescription}</p>
    </div>
  );
}
