import { Calculator } from "lucide-react";
import { TrackedCtaLink } from "@/components/analytics/TrackedCtaLink";
import type { Locale } from "@/i18n/config";

type GuideSoftToolCtaProps = {
  toolLabel: string;
  toolHref: string;
  locale: Locale;
  pagePath: string;
};

export function GuideSoftToolCta({
  toolLabel,
  toolHref,
  locale,
  pagePath,
}: GuideSoftToolCtaProps) {
  const isNl = locale === "nl";
  const ctaLabel = isNl ? "Open calculator" : "Open calculator";

  return (
    <aside className="rounded-xl border border-border/50 bg-muted/50 p-4">
      <div className="flex items-start gap-3">
        <div className="mt-0.5 rounded-full border border-border/60 bg-background p-2 text-primary">
          <Calculator className="h-4 w-4" />
        </div>
        <div className="space-y-1.5">
          <p className="text-sm font-semibold text-foreground">
            {isNl ? "Tijdens het lezen" : "While you read"}
          </p>
          <p className="text-sm leading-6 text-muted-foreground">
            {isNl
              ? `Probeer de ${toolLabel} voor een snelle eerste richtwaarde bij dit onderwerp.`
              : `Try the ${toolLabel} for a fast first-pass starting point on this topic.`}
          </p>
          <TrackedCtaLink
            href={toolHref}
            locale={locale}
            pagePath={pagePath}
            section="guide_soft_tool_cta"
            ctaLabel={ctaLabel}
            className="inline-flex text-sm font-semibold text-primary"
          >
            {isNl ? "Open calculator →" : "Open calculator →"}
          </TrackedCtaLink>
        </div>
      </div>
    </aside>
  );
}
