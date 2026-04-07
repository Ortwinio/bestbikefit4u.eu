import type { ReactNode } from "react";
import { Card, CardContent } from "@/components/prototyper-ui/ui/card";
import { cn } from "@/utils/cn";

type PublicCtaBandProps = {
  eyebrow?: string;
  title: string;
  description?: string;
  actions?: ReactNode;
  aside?: ReactNode;
  className?: string;
};

export function PublicCtaBand({
  eyebrow,
  title,
  description,
  actions,
  aside,
  className,
}: PublicCtaBandProps) {
  return (
    <Card
      variant="secondary"
      className={cn(
        "public-cta-surface overflow-hidden gap-0 border",
        className
      )}
    >
      <CardContent className="px-5 py-6 sm:px-6 sm:py-7">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="max-w-3xl space-y-3">
            {eyebrow ? (
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[color:var(--primary)]">
                {eyebrow}
              </p>
            ) : null}
            <h2 className="text-balance text-2xl font-semibold tracking-tight text-[color:var(--foreground)] sm:text-[2rem]">
              {title}
            </h2>
            {description ? (
              <p className="text-pretty text-sm leading-6 text-[color:var(--muted-foreground)] sm:text-base">
                {description}
              </p>
            ) : null}
          </div>
          <div className="flex w-full flex-col gap-4 lg:w-auto lg:items-end">
            {actions ? (
              <div className="flex w-full flex-col gap-3 sm:flex-row lg:w-auto">{actions}</div>
            ) : null}
            {aside ? (
              <div className="text-sm leading-6 text-[color:var(--muted-foreground)]">{aside}</div>
            ) : null}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
