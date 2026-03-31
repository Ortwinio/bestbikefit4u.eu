"use client";

import type { ReactNode } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui";

type ResultsSectionProps = {
  eyebrow?: string;
  title: string;
  description?: string | null;
  children: ReactNode;
  tone?: "default" | "highlight" | "muted";
  contentClassName?: string;
};

const TONE_CLASSES: Record<NonNullable<ResultsSectionProps["tone"]>, string> = {
  default:
    "border-[color:var(--border)] bg-[color:var(--card)]",
  highlight:
    "border-[color:color-mix(in_oklch,var(--primary)_22%,var(--border))] bg-[linear-gradient(180deg,color-mix(in_oklch,var(--primary)_7%,white_93%)_0%,white_100%)]",
  muted:
    "border-[color:var(--border)] bg-[color:color-mix(in_oklch,var(--secondary)_40%,var(--card)_60%)]",
};

export function ResultsSection({
  eyebrow,
  title,
  description,
  children,
  tone = "default",
  contentClassName,
}: ResultsSectionProps) {
  return (
    <Card variant="bordered" className={`overflow-hidden ${TONE_CLASSES[tone]}`}>
      <CardHeader className="gap-3 border-b border-[color:var(--border)]/70 pb-5">
        {eyebrow ? (
          <div className="inline-flex w-fit rounded-full border border-[color:var(--border)] bg-white/80 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-[color:var(--primary)] shadow-sm">
            {eyebrow}
          </div>
        ) : null}
        <div>
          <CardTitle className="text-2xl tracking-tight text-[color:var(--foreground)]">
            {title}
          </CardTitle>
          {description ? (
            <CardDescription className="mt-2 max-w-3xl text-sm leading-6 text-[color:var(--muted-foreground)]">
              {description}
            </CardDescription>
          ) : null}
        </div>
      </CardHeader>
      <CardContent className={contentClassName ?? "px-6 py-6"}>{children}</CardContent>
    </Card>
  );
}

export function MetricTile({
  label,
  value,
  detail,
  emphasis = "default",
}: {
  label: string;
  value: ReactNode;
  detail?: ReactNode;
  emphasis?: "default" | "primary" | "success" | "warning";
}) {
  const emphasisClass =
    emphasis === "primary"
      ? "border-[color:color-mix(in_oklch,var(--primary)_24%,var(--border))] bg-[color:color-mix(in_oklch,var(--primary)_10%,var(--card)_90%)]"
      : emphasis === "success"
        ? "border-[color:color-mix(in_oklch,var(--success)_22%,var(--border))] bg-[color:color-mix(in_oklch,var(--success)_10%,var(--card)_90%)]"
        : emphasis === "warning"
          ? "border-[color:color-mix(in_oklch,var(--warning)_28%,var(--border))] bg-[color:color-mix(in_oklch,var(--warning)_10%,var(--card)_90%)]"
          : "border-[color:var(--border)] bg-[color:var(--secondary)]/35";

  return (
    <div className={`rounded-[var(--radius-lg)] border px-4 py-4 ${emphasisClass}`}>
      <p className="text-[11px] uppercase tracking-[0.16em] text-[color:var(--muted-foreground)]">
        {label}
      </p>
      <p className="mt-2 text-lg font-semibold text-[color:var(--foreground)]">{value}</p>
      {detail ? (
        <p className="mt-1 text-sm text-[color:var(--muted-foreground)]">{detail}</p>
      ) : null}
    </div>
  );
}

export function StatusPill({
  children,
  tone = "default",
}: {
  children: ReactNode;
  tone?: "default" | "success" | "warning" | "primary";
}) {
  const toneClass =
    tone === "success"
      ? "border-[color:color-mix(in_oklch,var(--success)_28%,var(--border))] bg-[color:color-mix(in_oklch,var(--success)_10%,var(--card)_90%)] text-[color:var(--success)]"
      : tone === "warning"
        ? "border-[color:color-mix(in_oklch,var(--warning)_28%,var(--border))] bg-[color:color-mix(in_oklch,var(--warning)_10%,var(--card)_90%)] text-[color:var(--warning)]"
        : tone === "primary"
          ? "border-[color:color-mix(in_oklch,var(--primary)_24%,var(--border))] bg-[color:color-mix(in_oklch,var(--primary)_10%,var(--card)_90%)] text-[color:var(--primary)]"
          : "border-[color:var(--border)] bg-[color:var(--secondary)] text-[color:var(--muted-foreground)]";

  return (
    <span className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] ${toneClass}`}>
      {children}
    </span>
  );
}
