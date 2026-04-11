import type { ComponentPropsWithoutRef, ReactNode } from "react";
import {
  Card,
  CardContent,
  CardHeader,
} from "@/components/prototyper-ui/ui/card";
import { cn } from "@/utils/cn";

type PublicInfoPanelProps = ComponentPropsWithoutRef<"div"> & {
  title?: ReactNode;
  children: ReactNode;
  tone?: "primary" | "secondary" | "success" | "warning" | "danger";
  icon?: ReactNode;
  role?: "status" | "alert" | "note";
  titleAs?: "h2" | "h3" | "h4" | "p";
};

const toneStyles: Record<NonNullable<PublicInfoPanelProps["tone"]>, string> = {
  primary:
    "border-[color:color-mix(in_oklch,var(--primary)_18%,var(--border))] bg-[color:color-mix(in_oklch,var(--primary)_10%,var(--card)_90%)]",
  secondary:
    "border-[color:var(--border)] bg-[color:color-mix(in_oklch,var(--secondary)_88%,var(--background)_12%)]",
  success:
    "border-[color:color-mix(in_oklch,var(--success)_20%,var(--border))] bg-[color:color-mix(in_oklch,var(--success)_10%,var(--card)_90%)]",
  warning:
    "border-[color:color-mix(in_oklch,var(--warning)_24%,var(--border))] bg-[color:color-mix(in_oklch,var(--warning)_12%,var(--card)_88%)]",
  danger:
    "border-[color:color-mix(in_oklch,var(--danger)_24%,var(--border))] bg-[color:color-mix(in_oklch,var(--danger)_12%,var(--card)_88%)]",
};

export function PublicInfoPanel({
  title,
  children,
  icon,
  tone = "secondary",
  className,
  role = "note",
  titleAs = "h3",
  ...props
}: PublicInfoPanelProps) {
  const TitleTag = titleAs;

  return (
    <Card
      variant="secondary"
      role={role}
      className={cn(
        "gap-0 rounded-[var(--radius-xl)] border p-0 shadow-sm",
        toneStyles[tone],
        className
      )}
      {...props}
    >
      <CardContent className="gap-0 p-4 sm:p-5">
        <div className="flex gap-3">
          {icon ? (
            <div className="mt-0.5 shrink-0 text-[color:var(--primary)] [&_svg]:h-4 [&_svg]:w-4">
              {icon}
            </div>
          ) : null}
          <div className="min-w-0 space-y-2">
            {title ? (
              <CardHeader className="p-0">
                <TitleTag className="text-sm font-semibold tracking-tight text-[color:var(--foreground)]">
                  {title}
                </TitleTag>
              </CardHeader>
            ) : null}
            <div className="text-sm leading-6 text-[color:var(--muted-foreground)]">{children}</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
