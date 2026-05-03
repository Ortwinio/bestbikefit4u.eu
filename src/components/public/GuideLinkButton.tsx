import type { ReactNode } from "react";
import Link from "next/link";
import { ChevronRight, Activity, ArrowUp, Gauge, HeartPulse, Mountain, PersonStanding, Timer, TreePine } from "lucide-react";
import { cn } from "@/utils/cn";

const GUIDE_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  "heart-pulse": HeartPulse,
  "activity": Activity,
  "gauge": Gauge,
  "mountain": Mountain,
  "person-standing": PersonStanding,
  "tree-pine": TreePine,
  "timer": Timer,
  "arrow-up": ArrowUp,
};

type GuideLinkButtonProps = {
  href: string;
  icon: ReactNode | string;
  title: string;
  subtitle?: string;
  className?: string;
};

export function GuideLinkButton({ href, icon, title, subtitle, className }: GuideLinkButtonProps) {
  const resolvedIcon =
    typeof icon === "string"
      ? (() => {
          const IconComponent = GUIDE_ICONS[icon];
          if (!IconComponent) {
            console.warn(`GuideLinkButton: unknown icon key "${icon}"`);
            return null;
          }
          return <IconComponent className="h-5 w-5" />;
        })()
      : icon;

  return (
    <Link
      href={href}
      className={cn(
        "group flex w-full items-center gap-4 rounded-2xl border border-[color:var(--border)] bg-[color:color-mix(in_oklch,var(--card)_90%,var(--background)_10%)] px-5 py-4 transition-all hover:border-[color:color-mix(in_oklch,var(--primary)_40%,var(--border)_60%)] hover:bg-[color:var(--primary-soft)] hover:shadow-[var(--public-shadow)]",
        className
      )}
    >
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[color:var(--primary-soft)] text-[color:var(--primary)] transition-colors group-hover:bg-[color:color-mix(in_oklch,var(--primary)_18%,transparent)]">
        {resolvedIcon}
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold text-[color:var(--foreground)]">{title}</p>
        {subtitle ? (
          <p className="mt-0.5 text-xs leading-5 text-[color:var(--muted-foreground)]">{subtitle}</p>
        ) : null}
      </div>
      <ChevronRight className="h-4 w-4 shrink-0 text-[color:var(--muted-foreground)] transition-colors group-hover:text-[color:var(--primary)]" />
    </Link>
  );
}
