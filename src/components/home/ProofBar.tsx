import type { Locale } from "@/i18n/config";
import { HOME_PROOF_BAR_CONTENT } from "./homeRedesignContent";

type ProofBarProps = {
  locale: Locale;
};

export function ProofBar({ locale }: ProofBarProps) {
  const content = HOME_PROOF_BAR_CONTENT[locale];

  return (
    <section className="border-y border-[color:var(--border)] bg-[color:color-mix(in_oklch,var(--card)_88%,var(--background)_12%)] py-6 sm:py-7">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-start gap-4 lg:max-w-[44rem]">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[color:var(--primary)] text-sm font-semibold text-[color:var(--primary-foreground)] shadow-[0_16px_36px_-24px_color-mix(in_oklch,var(--primary)_80%,transparent)]">
              {content.quote.initials}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-[color:var(--foreground)]">
                {content.quote.name}
              </p>
              <p className="text-xs text-[color:var(--muted-foreground)]">
                {content.quote.bikeContext}
              </p>
              <p className="mt-2 text-[15px] font-medium italic leading-6 text-[color:var(--primary)]">
                &ldquo;{content.quote.quote}&rdquo;
              </p>
            </div>
          </div>
          <div className="grid gap-3 border-t border-[color:var(--border)] pt-5 sm:grid-cols-3 sm:pt-0 lg:min-w-[26rem] lg:border-l lg:border-t-0 lg:pl-6">
            {content.stats.map((item) => (
              <div
                key={`${item.value}-${item.label}`}
                className="rounded-2xl border border-[color:var(--border)] bg-background/80 px-4 py-3 shadow-[0_18px_40px_-34px_color-mix(in_oklch,var(--foreground)_28%,transparent)]"
              >
                <p className="text-xl font-semibold tracking-tight text-[color:var(--foreground)]">
                  {item.value}
                </p>
                <p className="mt-1 text-xs font-medium uppercase tracking-[0.18em] text-[color:var(--muted-foreground)]">
                  {item.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
