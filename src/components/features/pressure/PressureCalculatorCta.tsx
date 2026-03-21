import Link from "next/link";
import { withLocalePrefix } from "@/i18n/navigation";
import { Button, Card, CardContent } from "@/components/ui";

interface PressureCalculatorCtaProps {
  locale: "en" | "nl";
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
  labels,
}: PressureCalculatorCtaProps) {
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
                render={<Link href={withLocalePrefix("/login", locale)} />}
                variant="primary"
              >
                {labels.primaryButton}
              </Button>
              <Button
                render={<Link href={withLocalePrefix("/about", locale)} />}
                variant="outline"
              >
                {labels.secondaryButton}
              </Button>
            </div>
            <p className="mt-5 text-sm text-[color:var(--muted-foreground)]">
              {labels.loginPrompt}{" "}
              <Link
                href={withLocalePrefix("/login", locale)}
                className="font-semibold text-[color:var(--foreground)] underline decoration-[color:var(--border)] underline-offset-4"
              >
                {labels.loginLink}
              </Link>
            </p>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
