import { Database, ListOrdered, Target } from "lucide-react";
import { PublicSection } from "@/components/public/PublicSection";
import { PublicSurfaceCard } from "@/components/public/PublicSurfaceCard";
import type { Locale } from "@/i18n/config";
import { HOME_DIFFERENTIATORS } from "./homeRedesignContent";

type DifferentiatorTripleProps = {
  locale: Locale;
};

const DIFFERENTIATOR_ICONS = {
  database: Database,
  ordered: ListOrdered,
  target: Target,
} as const;

export function DifferentiatorTriple({ locale }: DifferentiatorTripleProps) {
  const content = HOME_DIFFERENTIATORS[locale];

  return (
    <section className="bg-secondary/55 py-16 sm:py-20">
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
          <div className="grid gap-6 lg:grid-cols-3">
            {content.items.map((item) => {
              const Icon = DIFFERENTIATOR_ICONS[item.icon];

              return (
                <PublicSurfaceCard
                  key={item.title}
                  title={item.title}
                  description={item.description}
                  leading={<Icon />}
                />
              );
            })}
          </div>
        </PublicSection>
      </div>
    </section>
  );
}
