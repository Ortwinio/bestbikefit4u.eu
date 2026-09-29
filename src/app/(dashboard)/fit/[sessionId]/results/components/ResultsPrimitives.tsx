"use client";

import { useDashboardMessages } from "@/i18n/useDashboardMessages";
import { FitResultsValue } from "@/components/account/FitResultsValue";
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
    "border-border bg-card",
  highlight:
    "border-border bg-primary-soft",
  muted:
    "border-border bg-primary-soft",
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
    <Card variant="bordered" className={`min-w-0 overflow-hidden rounded-3xl ${TONE_CLASSES[tone]}`}>
      <CardHeader className="gap-3 border-b border-border/70 pb-5">
        {eyebrow ? (
          <div className="inline-flex w-fit rounded-full border border-border bg-card px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-primary shadow-sm">
            {eyebrow}
          </div>
        ) : null}
        <div>
          <CardTitle className="text-2xl tracking-tight text-foreground">
            {title}
          </CardTitle>
          {description ? (
            <CardDescription className="mt-2 max-w-3xl text-sm leading-6 text-muted-foreground">
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
  formatNumbers = true,
}: {
  label: string;
  value: ReactNode;
  detail?: ReactNode;
  emphasis?: "default" | "primary" | "success" | "warning";
  formatNumbers?: boolean;
}) {
  const { locale } = useDashboardMessages();
  const emphasisClass =
    emphasis === "primary"
      ? "border-border bg-primary-soft"
      : emphasis === "success"
        ? "border-border bg-primary-soft"
        : emphasis === "warning"
          ? "border-border bg-primary-soft"
          : "border-border bg-secondary/35";

  return (
    <div className={`rounded-[var(--radius-lg)] border px-4 py-4 ${emphasisClass}`}>
      <p className="text-[11px] uppercase tracking-[0.16em] text-muted-foreground">
        {label}
      </p>
      <p className="mt-2 break-words text-lg font-semibold text-foreground">{formatNumbers && (typeof value === "number" || typeof value === "string") ? <FitResultsValue value={value} locale={locale} /> : value}</p>
      {detail ? (
        <p className="mt-1 text-sm text-muted-foreground">{typeof detail === "number" || typeof detail === "string" ? <FitResultsValue value={detail} locale={locale} /> : detail}</p>
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
      ? "border-border bg-primary-soft text-primary"
      : tone === "warning"
        ? "border-border bg-primary-soft text-foreground"
        : tone === "primary"
          ? "border-border bg-primary-soft text-primary"
          : "border-border bg-secondary text-muted-foreground";

  return (
    <span className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] ${toneClass}`}>
      {children}
    </span>
  );
}
