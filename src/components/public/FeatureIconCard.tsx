import type { ReactNode } from "react";
import { cn } from "@/utils/cn";

export type FeatureIconCardColor =
  | "primary"
  | "teal"
  | "amber"
  | "violet"
  | "green"
  | "orange"
  | "slate";

const COLOR_CLASSES: Record<FeatureIconCardColor, { bg: string; text: string }> = {
  primary: {
    bg: "bg-[color:var(--primary-soft)]",
    text: "text-[color:var(--primary)]",
  },
  teal: {
    bg: "bg-[color:color-mix(in_oklch,oklch(0.72_0.14_195)_22%,white_78%)]",
    text: "text-[color:oklch(0.38_0.14_195)]",
  },
  amber: {
    bg: "bg-[color:color-mix(in_oklch,var(--warning)_20%,white_80%)]",
    text: "text-[color:color-mix(in_oklch,var(--warning)_90%,black_10%)]",
  },
  violet: {
    bg: "bg-[color:color-mix(in_oklch,oklch(0.70_0.16_285)_20%,white_80%)]",
    text: "text-[color:oklch(0.40_0.16_285)]",
  },
  green: {
    bg: "bg-[color:color-mix(in_oklch,oklch(0.72_0.16_145)_22%,white_78%)]",
    text: "text-[color:oklch(0.38_0.16_145)]",
  },
  orange: {
    bg: "bg-[color:color-mix(in_oklch,oklch(0.70_0.18_55)_20%,white_80%)]",
    text: "text-[color:oklch(0.40_0.18_55)]",
  },
  slate: {
    bg: "bg-[color:color-mix(in_oklch,oklch(0.66_0.10_260)_22%,white_78%)]",
    text: "text-[color:oklch(0.38_0.10_260)]",
  },
};

type FeatureIconCardProps = {
  icon: ReactNode;
  title: string;
  description: string;
  color?: FeatureIconCardColor;
  className?: string;
};

export function FeatureIconCard({
  icon,
  title,
  description,
  color = "primary",
  className,
}: FeatureIconCardProps) {
  const resolvedColor = COLOR_CLASSES[color];

  return (
    <div
      className={cn(
        "public-card-surface-subtle flex h-full flex-col gap-4 rounded-[14px] border p-6",
        className
      )}
    >
      <div
        className={cn(
          "flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl [&_svg]:h-6 [&_svg]:w-6",
          resolvedColor.bg,
          resolvedColor.text
        )}
      >
        {icon}
      </div>
      <div className="space-y-2">
        <h3 className="text-xl font-semibold tracking-tight text-[color:var(--foreground)]">
          {title}
        </h3>
        <p className="text-sm leading-6 text-[color:var(--muted-foreground)] sm:text-base">
          {description}
        </p>
      </div>
    </div>
  );
}
