import type { ReactNode } from "react";
import { cn } from "@/utils/cn";

type FeatureIconCardProps = {
  icon: ReactNode;
  title: string;
  description: string;
  className?: string;
};

export function FeatureIconCard({ icon, title, description, className }: FeatureIconCardProps) {
  return (
    <div
      className={cn(
        "public-card-surface-subtle flex h-full flex-col gap-4 rounded-[14px] border p-6",
        className
      )}
    >
      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[color:var(--primary-soft)] text-[color:var(--primary)] [&_svg]:h-6 [&_svg]:w-6">
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
