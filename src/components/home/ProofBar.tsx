import type { Locale } from "@/i18n/config";
import { HOME_PROOF_BAR_CONTENT } from "./homeRedesignContent";

type ProofBarProps = {
  locale: Locale;
};

export function ProofBar({ locale }: ProofBarProps) {
  const content = HOME_PROOF_BAR_CONTENT[locale];

  return (
    <section className="border-y border-[color:var(--border)] bg-[color:var(--card)] py-4 sm:py-5">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-start gap-4 lg:max-w-[46rem]">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[color:var(--primary)] text-sm font-semibold text-[color:var(--primary-foreground)]">
              {content.quote.initials}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-[color:var(--foreground)]">
                {content.quote.name}
              </p>
              <p className="text-xs text-[color:var(--muted-foreground)]">
                {content.quote.bikeContext}
              </p>
              <p className="mt-1 text-sm italic text-[color:var(--primary)]">
                &ldquo;{content.quote.quote}&rdquo;
              </p>
            </div>
          </div>
          <div className="flex flex-col gap-2 border-t border-[color:var(--border)] pt-4 text-sm font-medium text-[color:var(--foreground)] sm:flex-row sm:flex-wrap sm:items-center sm:gap-3 sm:pt-0 lg:border-l lg:border-t-0 lg:pl-6">
            {content.stats.map((item, index) => (
              <div key={item} className="flex items-center gap-3">
                {index > 0 ? (
                  <span className="hidden h-4 w-px bg-[color:var(--border)] sm:block" aria-hidden="true" />
                ) : null}
                <span>{item}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
