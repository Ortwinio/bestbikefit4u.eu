"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { ChevronRight } from "lucide-react";
import { cn } from "@/utils/cn";
import { Button, Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui";

type AdminStatusTone = "neutral" | "success" | "warning" | "danger" | "info";

const statusToneClassMap: Record<AdminStatusTone, string> = {
  neutral:
    "border-[color:var(--border)] bg-[color:var(--secondary)] text-[color:var(--secondary-foreground)]",
  success:
    "border-[color:color-mix(in_oklch,var(--success)_30%,var(--border))] bg-[color:color-mix(in_oklch,var(--success)_14%,var(--secondary))] text-[color:var(--foreground)]",
  warning:
    "border-[color:color-mix(in_oklch,var(--warning)_30%,var(--border))] bg-[color:color-mix(in_oklch,var(--warning)_14%,var(--secondary))] text-[color:var(--foreground)]",
  danger:
    "border-[color:color-mix(in_oklch,var(--danger)_30%,var(--border))] bg-[color:color-mix(in_oklch,var(--danger)_10%,var(--secondary))] text-[color:var(--foreground)]",
  info:
    "border-[color:color-mix(in_oklch,var(--primary)_28%,var(--border))] bg-[color:color-mix(in_oklch,var(--primary)_12%,var(--secondary))] text-[color:var(--foreground)]",
};

export function AdminStatusPill({
  tone = "neutral",
  children,
  className,
}: {
  tone?: AdminStatusTone;
  children: ReactNode;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-medium uppercase tracking-wide",
        statusToneClassMap[tone],
        className
      )}
    >
      {children}
    </span>
  );
}

export function AdminMetricCard({
  label,
  value,
  description,
  href,
  tone = "neutral",
}: {
  label: string;
  value: string | number;
  description?: string;
  href?: string;
  tone?: AdminStatusTone;
}) {
  const content = (
    <Card className="h-full border-[color:var(--border)] bg-[color:color-mix(in_oklch,var(--card)_94%,var(--background)_6%)]">
      <CardHeader className="space-y-1">
        <CardDescription className="text-xs font-medium uppercase tracking-wide text-[color:var(--muted-foreground)]">
          {label}
        </CardDescription>
        <CardTitle className={cn("text-3xl font-semibold tracking-tight", tone !== "neutral" ? "text-[color:var(--foreground)]" : "")}>
          {value}
        </CardTitle>
      </CardHeader>
      {description ? (
        <CardContent className="-mt-2">
          <p className="text-sm text-[color:var(--muted-foreground)]">{description}</p>
        </CardContent>
      ) : null}
    </Card>
  );

  if (!href) {
    return content;
  }

  return (
    <Link href={href} className="block transition-transform hover:-translate-y-0.5">
      {content}
    </Link>
  );
}

export function AdminPageHeader({
  eyebrow,
  title,
  description,
  actions,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  actions?: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
      <div className="max-w-3xl space-y-2">
        {eyebrow ? (
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[color:var(--muted-foreground)]">
            {eyebrow}
          </p>
        ) : null}
        <div className="space-y-1">
          <h1 className="text-3xl font-semibold tracking-tight text-[color:var(--foreground)]">
            {title}
          </h1>
          {description ? (
            <p className="text-sm leading-6 text-[color:var(--muted-foreground)]">
              {description}
            </p>
          ) : null}
        </div>
      </div>
      {actions ? <div className="flex flex-wrap items-center gap-2">{actions}</div> : null}
    </div>
  );
}

export function AdminSectionCard({
  title,
  description,
  actions,
  children,
  className,
}: {
  title: string;
  description?: string;
  actions?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <Card className={cn("border-[color:var(--border)] bg-[color:color-mix(in_oklch,var(--card)_94%,var(--background)_6%)]", className)}>
      <CardHeader className="flex flex-row items-start justify-between gap-4">
        <div className="space-y-1">
          <CardTitle className="text-base font-semibold">{title}</CardTitle>
          {description ? (
            <CardDescription className="text-sm">{description}</CardDescription>
          ) : null}
        </div>
        {actions ? <div className="flex flex-wrap items-center gap-2">{actions}</div> : null}
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  );
}

export function AdminTable({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("overflow-hidden rounded-[var(--radius-lg)] border border-[color:var(--border)] bg-[color:var(--card)]", className)}>
      <div className="overflow-x-auto">
        <table className="min-w-full border-collapse text-left text-sm">{children}</table>
      </div>
    </div>
  );
}

export function AdminTableHead({
  columns,
}: {
  columns: string[];
}) {
  return (
    <thead className="bg-[color:color-mix(in_oklch,var(--secondary)_82%,var(--background)_18%)]">
      <tr>
        {columns.map((column) => (
          <th
            key={column}
            className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-[color:var(--muted-foreground)]"
            scope="col"
          >
            {column}
          </th>
        ))}
      </tr>
    </thead>
  );
}

export function AdminTableRow({
  children,
  href,
}: {
  children: ReactNode;
  href?: string;
}) {
  const row = (
    <tr className={cn("border-t border-[color:var(--border)]", href ? "group hover:bg-[color:var(--accent)]" : "")}>
      {children}
    </tr>
  );

  if (!href) {
    return row;
  }

  return (
    <Link href={href} className="contents">
      {row}
    </Link>
  );
}

export function AdminTableCell({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <td className={cn("px-4 py-3 align-top text-[color:var(--foreground)]", className)}>{children}</td>
  );
}

export function AdminSectionLink({
  href,
  children,
}: {
  href: string;
  children: ReactNode;
}) {
  return (
    <Button render={<Link href={href} />} variant="ghost" size="sm" className="gap-1">
      {children}
      <ChevronRight className="h-4 w-4" />
    </Button>
  );
}
