import { Bike, CheckCircle2, Ruler } from "lucide-react";
import { TrackedCtaLink } from "@/components/analytics/TrackedCtaLink";
import { Button } from "@/components/prototyper-ui/ui/button";
import { PublicSection } from "@/components/public/PublicSection";
import { RatingBadge } from "@/components/public/RatingBadge";
import type { Locale } from "@/i18n/config";
import { cn } from "@/utils/cn";
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

const STEP_COLORS = {
  "01": {
    bg: "bg-[color:color-mix(in_oklch,oklch(0.72_0.14_195)_22%,white_78%)]",
    text: "text-[color:oklch(0.38_0.14_195)]",
    label: "text-[color:oklch(0.42_0.14_195)]",
  },
  "02": {
    bg: "bg-[color:color-mix(in_oklch,var(--primary)_22%,white_78%)]",
    text: "text-[color:color-mix(in_oklch,var(--primary)_90%,black_10%)]",
    label: "text-[color:var(--primary)]",
  },
  "03": {
    bg: "bg-[color:color-mix(in_oklch,oklch(0.72_0.16_145)_22%,white_78%)]",
    text: "text-[color:oklch(0.38_0.16_145)]",
    label: "text-[color:oklch(0.42_0.16_145)]",
  },
} as const;

export function HowItWorksStepper({
  locale,
  homePath,
  fitHref,
}: HowItWorksStepperProps) {
  const content = HOME_STEPPER_CONTENT[locale];

  return (
    <section className="bg-background py-16 sm:py-20">
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
              const color = STEP_COLORS[step.number as keyof typeof STEP_COLORS];

              return (
                <div
                  key={step.number}
                  className="relative rounded-[var(--radius-xl)] border border-[color:var(--border)] bg-[color:color-mix(in_oklch,var(--card)_94%,var(--background)_6%)] p-5 shadow-[0_16px_40px_-28px_color-mix(in_oklch,var(--foreground)_28%,transparent)]"
                >
                  <p className={cn("text-xs font-bold uppercase tracking-[0.2em]", color.label)}>
                    {step.number}
                  </p>
                  <div
                    className={cn(
                      "mt-3 flex h-[4.5rem] w-[4.5rem] items-center justify-center rounded-2xl",
                      color.bg,
                      color.text
                    )}
                  >
                    <Icon className="h-8 w-8" />
                  </div>
                  <h3 className="mt-4 text-xl font-semibold tracking-tight text-[color:var(--foreground)]">
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
            <div className="flex flex-col items-center gap-3">
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
              <div className="mt-2">
                <RatingBadge rating={content.ratingValue} count={content.ratingCount} />
              </div>
            </div>
          </div>
        </PublicSection>
      </div>
    </section>
  );
}
