import type { ComponentPropsWithoutRef, ReactNode } from "react";
import { InfoBox } from "@/components/ui/InfoBox";
import { cn } from "@/utils/cn";

type PublicInfoPanelProps = Omit<ComponentPropsWithoutRef<typeof InfoBox>, "children"> & {
  title?: ReactNode;
  children: ReactNode;
  tone?: "primary" | "secondary" | "success" | "warning";
};

export function PublicInfoPanel({
  title,
  children,
  icon,
  tone = "secondary",
  className,
}: PublicInfoPanelProps) {
  return (
    <InfoBox
      variant={tone}
      icon={icon}
      className={cn("rounded-[var(--radius-xl)] p-4 sm:p-5", className)}
    >
      <div className="space-y-2">
        {title ? (
          <p className="text-sm font-semibold tracking-tight text-[color:var(--foreground)]">
            {title}
          </p>
        ) : null}
        <div className="text-sm leading-6 text-[color:var(--muted-foreground)]">{children}</div>
      </div>
    </InfoBox>
  );
}
