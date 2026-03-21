import { Card } from "@/components/ui";

interface PressureCalculatorHeroProps {
  title: string;
  subtitle: string;
  chips: [string, string, string];
}

export function PressureCalculatorHero({
  title,
  subtitle,
  chips,
}: PressureCalculatorHeroProps) {
  return (
    <section className="py-16">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        <Card
          variant="bordered"
          className="relative overflow-hidden bg-[color:color-mix(in_oklch,var(--card)_90%,var(--primary)_10%)]"
        >
          <div className="absolute -right-16 top-0 h-40 w-40 rounded-full bg-[color:color-mix(in_oklch,var(--primary)_18%,transparent)] blur-3xl" />
          <div className="absolute -left-12 bottom-0 h-32 w-32 rounded-full bg-[color:color-mix(in_oklch,var(--secondary)_22%,transparent)] blur-3xl" />
          <div className="relative max-w-3xl px-6 py-10 sm:px-10 sm:py-12">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[color:var(--primary)]">
              BestBikeFit4U
            </p>
            <h1 className="mt-4 text-4xl font-bold text-[color:var(--foreground)] sm:text-5xl">
              {title}
            </h1>
            <p className="mt-5 text-lg text-[color:var(--muted-foreground)]">{subtitle}</p>
            <div className="mt-8 flex flex-wrap gap-3">
              {chips.map((chip) => (
                <span
                  key={chip}
                  className="rounded-full border border-[color:var(--border)] bg-[color:var(--card)] px-4 py-2 text-sm font-medium text-[color:var(--foreground)] shadow-sm"
                >
                  {chip}
                </span>
              ))}
            </div>
          </div>
        </Card>
      </div>
    </section>
  );
}
