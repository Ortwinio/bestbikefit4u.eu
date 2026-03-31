import { TrackedCtaLink } from "@/components/analytics/TrackedCtaLink";
import { withLocalePrefix } from "@/i18n/navigation";
import { Button, Card, CardContent } from "@/components/ui";

interface PressureCalculatorCtaProps {
  locale: "en" | "nl";
  pagePath: string;
  labels: {
    heading: string;
    body: string;
    primaryButton: string;
    secondaryButton: string;
    loginPrompt: string;
    loginLink: string;
  };
}

export function PressureCalculatorCta({
  locale,
  pagePath,
  labels,
}: PressureCalculatorCtaProps) {
  const helperNote =
    locale === "nl"
      ? "Sla je setup op, vergelijk fietsen en houd het advies gekoppeld aan je volledige fietscontext in plaats van aan een losse calculatoruitkomst."
      : "Save your setup, compare bikes, and keep the recommendation tied to your broader bike context instead of a standalone calculator result.";

  return (
    <section className="py-14">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <Card
          variant="bordered"
          className="overflow-hidden bg-[color:color-mix(in_oklch,var(--card)_84%,var(--primary)_16%)]"
        >
          <CardContent className="px-6 py-10 sm:px-10">
            <h2 className="text-3xl font-bold text-[color:var(--foreground)]">{labels.heading}</h2>
            <p className="mt-4 max-w-2xl text-[color:var(--muted-foreground)]">{labels.body}</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button
                render={
                  <TrackedCtaLink
                    href={withLocalePrefix("/login", locale)}
                    locale={locale}
                    pagePath={pagePath}
                    section="pressure_cta_primary"
                    ctaLabel={labels.primaryButton}
                    conversionKey="pricing_signup"
                  />
                }
                variant="primary"
              >
                {labels.primaryButton}
              </Button>
              <Button
                render={
                  <TrackedCtaLink
                    href={withLocalePrefix("/how-it-works", locale)}
                    locale={locale}
                    pagePath={pagePath}
                    section="pressure_cta_secondary"
                    ctaLabel={labels.secondaryButton}
                  />
                }
                variant="outline"
              >
                {labels.secondaryButton}
              </Button>
            </div>
            <p className="mt-5 text-sm text-[color:var(--muted-foreground)]">
              {labels.loginPrompt}{" "}
              <TrackedCtaLink
                href={withLocalePrefix("/login", locale)}
                locale={locale}
                pagePath={pagePath}
                section="pressure_cta_text_link"
                ctaLabel={labels.loginLink}
                className="font-semibold text-[color:var(--foreground)] underline decoration-[color:var(--border)] underline-offset-4"
              >
                {labels.loginLink}
              </TrackedCtaLink>
            </p>
            <div className="mt-6 rounded-2xl border border-[color:var(--border)] bg-[color:var(--card)] px-4 py-4 text-sm text-[color:var(--muted-foreground)] shadow-sm">
              {helperNote}
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
