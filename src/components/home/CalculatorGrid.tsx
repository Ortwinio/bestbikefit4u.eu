import Link from "next/link";
import { Button } from "@/components/prototyper-ui/ui/button";
import { PublicSection } from "@/components/public/PublicSection";
import { CalculatorLogo } from "@/components/public/CalculatorLogo";
import type { Locale } from "@/i18n/config";
import type { PublicCalculatorId } from "@/lib/public-calculators";
import { HOME_CALCULATOR_SUBTITLES } from "./homeRedesignContent";

type CalculatorGridProps = {
  locale: Locale;
  tools: Array<{
    calculatorId: PublicCalculatorId;
    href: string;
    label: string;
  }>;
  upsellHref: string;
  copy?: {
    eyebrow: string;
    title: string;
    description: string;
    upsellLabel: string;
  };
};

export function CalculatorGrid({
  locale,
  tools,
  upsellHref,
  copy,
}: CalculatorGridProps) {
  const content =
    copy ??
    (locale === "nl"
      ? {
          eyebrow: "Gratis tools",
          title: "Populaire calculators",
          description: "Gratis tools die je direct kunt gebruiken, zonder account.",
          upsellLabel: "Wil je een compleet afstelplan?",
        }
      : {
          eyebrow: "Free tools",
          title: "Popular Calculators",
          description: "Free tools you can use right now, no account needed.",
          upsellLabel: "Want a complete fit plan?",
        });
  const subtitles = HOME_CALCULATOR_SUBTITLES[locale];

  return (
    <section className="py-12 sm:py-16">
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
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {tools.map((tool) => (
              <Button
                key={tool.href}
                variant="outline"
                size="lg"
                className="h-auto min-h-24 justify-start rounded-2xl border-[color:var(--border)] bg-white px-5 py-4 text-left hover:bg-white"
                render={<Link href={tool.href} />}
              >
                <span className="flex items-start gap-3">
                  <CalculatorLogo
                    calculatorId={tool.calculatorId}
                    className="mt-0.5 h-11 w-11 shrink-0 rounded-2xl [&_svg]:h-10 [&_svg]:w-10"
                  />
                  <span className="space-y-1">
                    <span className="block text-sm font-semibold leading-6">{tool.label}</span>
                    <span className="block text-sm font-normal leading-5 text-[color:var(--muted-foreground)]">
                      {subtitles[tool.calculatorId]}
                    </span>
                  </span>
                </span>
              </Button>
            ))}
          </div>
          <div className="mt-8 text-center">
            <Button
              variant="outline"
              size="lg"
              className="min-h-12 rounded-full px-6 text-base"
              render={<Link href={upsellHref} />}
            >
              {content.upsellLabel}
            </Button>
          </div>
        </PublicSection>
      </div>
    </section>
  );
}
