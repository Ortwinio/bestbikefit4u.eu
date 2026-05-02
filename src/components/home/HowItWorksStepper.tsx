import { Bike, CheckCircle2, Ruler } from "lucide-react";
import { TrackedCtaLink } from "@/components/analytics/TrackedCtaLink";
import { Button } from "@/components/prototyper-ui/ui/button";
import { PublicSection } from "@/components/public/PublicSection";
import type { Locale } from "@/i18n/config";
import { HOME_STEPPER_CONTENT } from "./homeRedesignContent";

type HowItWorksStepperProps = {
  locale: Locale;
  homePath: string;
  fitHref: string;
};

const STEP_ICONS = {
  ruler: Ruler,
  bike: Bike,
  check: CheckCircle2,
} as const;

export function HowItWorksStepper({
  locale,
  homePath,
  fitHref,
}: HowItWorksStepperProps) {
  const content = HOME_STEPPER_CONTENT[locale];

  return (
    <section className="py-16 sm:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <PublicSection
          header={{
            eyebrow: content.eyebrow,
            title: content.title,
            description: content.description,
            align: "center",
          }}
          contentClassName="pt-8"
        >
          <div className="grid gap-5 lg:grid-cols-3">
            {content.steps.map((step, index) => {
              const Icon = STEP_ICONS[step.icon];

              return (
                <div
                  key={step.number}
                  className="relative rounded-[var(--radius-xl)] border border-[color:var(--border)] bg-[color:color-mix(in_oklch,var(--card)_94%,var(--background)_6%)] p-5 shadow-[0_16px_40px_-28px_color-mix(in_oklch,var(--foreground)_28%,transparent)]"
                >
                  {index < content.steps.length - 1 ? (
                    <div
                      className="pointer-events-none absolute left-[calc(50%+2rem)] top-9 hidden h-px w-[calc(100%-4rem)] border-t border-dashed border-[color:var(--border)] lg:block"
                      aria-hidden="true"
                    />
                  ) : null}
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[color:var(--primary)] text-sm font-bold text-[color:var(--primary-foreground)]">
                    {step.number}
                  </div>
                  <div className="mt-5 flex h-12 w-12 items-center justify-center rounded-full border border-[color:var(--border)] bg-[color:color-mix(in_oklch,var(--secondary)_78%,var(--background)_22%)] text-[color:var(--primary)]">
                    <Icon className="h-6 w-6" />
                  </div>
                  <h3 className="mt-5 text-xl font-semibold tracking-tight text-[color:var(--foreground)]">
                    {step.title}
                  </h3>
                  <p className="mt-3 text-sm leading-6 text-[color:var(--muted-foreground)] sm:text-base">
                    {step.description}
                  </p>
                </div>
              );
            })}
          </div>
          <div className="mt-8 flex justify-center">
            <Button
              size="lg"
              className="min-h-12 rounded-full px-6 text-base"
              render={
                <TrackedCtaLink
                  href={fitHref}
                  locale={locale}
                  pagePath={homePath}
                  section="stepper_primary"
                  ctaLabel={content.cta}
                />
              }
            >
              {content.cta}
            </Button>
          </div>
        </PublicSection>
      </div>
    </section>
  );
}
