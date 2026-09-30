import type { ReactNode } from "react";
import { cn } from "@/utils/cn";

export interface ConfiguratorLayoutProps {
  eyebrow: ReactNode;
  title: ReactNode;
  description?: ReactNode;
  navigation?: ReactNode;
  inputs: ReactNode;
  results: ReactNode;
  /** A compact summary or result anchor shown at the bottom on smaller screens. */
  stickyResult?: ReactNode;
  className?: string;
}

export function ConfiguratorLayout({
  eyebrow,
  title,
  description,
  navigation,
  inputs,
  results,
  stickyResult,
  className,
}: ConfiguratorLayoutProps) {
  return (
    <div
      className={cn(
        "mx-auto w-full max-w-[1440px] min-w-0 px-4 py-6 text-foreground sm:px-8 xl:px-16",
        stickyResult && "pb-24 xl:pb-6",
        className,
      )}
    >
      {navigation && <div className="mb-6 min-w-0">{navigation}</div>}
      <header className="mb-8">
        <p className="text-sm font-bold tracking-[0.08em] text-primary uppercase">{eyebrow}</p>
        <h1 className="mt-2 font-display text-4xl font-bold leading-[1.05] tracking-[-0.03em] sm:text-5xl">
          {title}
        </h1>
        {description && (
          <div className="mt-3 max-w-3xl text-base leading-relaxed text-muted-foreground">
            {description}
          </div>
        )}
      </header>
      <div className="grid min-w-0 items-start gap-6 xl:grid-cols-[minmax(520px,540px)_minmax(0,1fr)] xl:gap-8">
        <div data-slot="configurator-inputs" className="flex min-w-0 flex-col gap-4">
          {inputs}
        </div>
        <div data-slot="configurator-results" className="flex min-w-0 flex-col gap-4">
          {results}
        </div>
      </div>
      {stickyResult && (
        <div
          data-slot="configurator-sticky-result"
          className={
            "fixed inset-x-0 bottom-0 z-30 border-t border-[color:var(--bbf-rand)] bg-card " +
            "text-card-foreground px-4 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] " +
            "xl:hidden"
          }
        >
          {stickyResult}
        </div>
      )}
    </div>
  );
}
