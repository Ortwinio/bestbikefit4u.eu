"use client";

import { useState, type ReactNode } from "react";
import { useCalculatorChainSlots } from "@/components/calculators/CalculatorChainSlots";
import { cn } from "@/utils/cn";

export interface ConfiguratorLayoutProps {
  eyebrow: ReactNode;
  title: ReactNode;
  description?: ReactNode;
  navigation?: ReactNode;
  notice?: ReactNode;
  afterResults?: ReactNode;
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
  notice,
  afterResults,
  inputs,
  results,
  stickyResult,
  className,
}: ConfiguratorLayoutProps) {
  const chain = useCalculatorChainSlots();
  const [expanded, setExpanded] = useState(chain?.expandInputs ?? false);
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
      {notice && <div className="mb-6">{notice}</div>}
      <div className="grid min-w-0 items-start gap-6 xl:grid-cols-[minmax(520px,540px)_minmax(0,1fr)] xl:gap-8">
        <div data-slot="configurator-inputs" className="flex min-w-0 flex-col gap-4">
          {chain?.inputs}
          {chain ? <details open={expanded} onToggle={(event) => setExpanded(event.currentTarget.open)}
            className="group min-w-0">
            <summary className="mb-4 flex min-h-11 cursor-pointer items-center rounded-2xl bg-muted px-4 font-semibold">
              {chain.editLabel}
            </summary>
            <div className="flex min-w-0 flex-col gap-4">{inputs}</div>
          </details> : inputs}
        </div>
        <div data-slot="configurator-results" className="flex min-w-0 flex-col gap-4">
          {results}
        </div>
      </div>
      {chain?.afterResults && <div className="mt-8">{chain.afterResults}</div>}
      {afterResults && <div className="mt-8">{afterResults}</div>}
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
