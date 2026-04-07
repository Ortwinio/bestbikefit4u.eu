import { Button } from "@/components/prototyper-ui/ui/button";
import { TrackedCtaLink } from "@/components/analytics/TrackedCtaLink";
import { PublicCtaBand } from "@/components/public";
import { withLocalePrefix } from "@/i18n/navigation";

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
  const isNl = locale === "nl";

  const disclaimer = isNl
    ? "De calculator geeft een praktisch startpunt. Een persoonlijke fitter kan toegevoegde waarde bieden bij complexe biomechanische kwesties."
    : "The calculator gives a practical starting point. An in-person fitter can add value for complex biomechanical issues.";

  return (
    <PublicCtaBand
      className="mt-14"
      eyebrow={labels.heading}
      title={
        isNl
          ? "Sla dit advies op en verfijn het per fiets"
          : "Save this recommendation and refine it per bike"
      }
      description={labels.body}
      actions={
        <>
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
          >
            {labels.primaryButton}
          </Button>
          <Button
            render={
              <TrackedCtaLink
                href={withLocalePrefix("/pricing", locale)}
                locale={locale}
                pagePath={pagePath}
                section="tire_pressure_pricing_cta"
                ctaLabel={labels.secondaryButton}
              />
            }
            variant="outline"
          >
            {labels.secondaryButton}
          </Button>
          <Button
            render={
              <TrackedCtaLink
                href={withLocalePrefix("/calculators/bike-fit", locale)}
                locale={locale}
                pagePath={pagePath}
                section="pressure_bike_fit_cta"
                ctaLabel={isNl ? "Ga naar bike fit calculator" : "Open bike-fit calculator"}
              />
            }
            variant="outline"
          >
            {isNl ? "Ga naar bike fit calculator" : "Open bike-fit calculator"}
          </Button>
        </>
      }
      aside={
        <>
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
          {" · "}
          {disclaimer}
        </>
      }
    />
  );
}
