import type { ReactNode } from "react";
import { cn } from "@/utils/cn";

type PublicIllustrationPanelProps = {
  children: ReactNode;
  caption?: ReactNode;
  className?: string;
};

export function PublicIllustrationPanel({
  children,
  caption,
  className,
}: PublicIllustrationPanelProps) {
  return (
    <figure
      className={cn(
        "overflow-hidden rounded-[calc(var(--radius-xl)+4px)] border border-[color:var(--border)]/80 bg-[linear-gradient(180deg,color-mix(in_oklch,var(--secondary)_84%,var(--background)_16%)_0%,color-mix(in_oklch,var(--card)_94%,var(--background)_6%)_100%)] shadow-[0_16px_36px_-28px_color-mix(in_oklch,var(--foreground)_24%,transparent)]",
        className
      )}
    >
      <div className="flex min-h-56 items-center justify-center p-5 sm:p-6">{children}</div>
      {caption ? (
        <figcaption className="border-t border-[color:var(--border)]/70 px-5 py-3 text-sm leading-6 text-[color:var(--muted-foreground)] sm:px-6">
          {caption}
        </figcaption>
      ) : null}
    </figure>
  );
}
