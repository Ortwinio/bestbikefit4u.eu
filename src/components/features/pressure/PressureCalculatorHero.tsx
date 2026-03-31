import { Card } from "@/components/ui";

interface PressureCalculatorHeroProps {
  locale: "en" | "nl";
  title: string;
  subtitle: string;
  chips: [string, string, string];
}

export function PressureCalculatorHero({
  locale,
  title,
  subtitle,
  chips,
}: PressureCalculatorHeroProps) {
  const highlights =
    locale === "nl"
      ? [
          {
            title: "Snel startpunt",
            body: "Vul gewicht, bandbreedte, ondergrond en bandtype in voor een bruikbaar eerste drukadvies.",
          },
          {
            title: "Gemaakt om te verfijnen",
            body: "Begin hier en test daarna kleine aanpassingen op gevoel, terrein en feedback uit echte ritten.",
          },
        ]
      : [
          {
            title: "Fast starting point",
            body: "Set weight, tyre width, surface, and tyre type to generate a practical first pressure baseline.",
          },
          {
            title: "Built for refinement",
            body: "Start here, then test small changes based on feel, terrain, and real ride feedback.",
          },
        ];

  return (
    <section className="py-16">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        <Card
          variant="bordered"
          className="relative overflow-hidden bg-[color:color-mix(in_oklch,var(--card)_90%,var(--primary)_10%)]"
        >
          <div className="absolute -right-16 top-0 h-40 w-40 rounded-full bg-[color:color-mix(in_oklch,var(--primary)_18%,transparent)] blur-3xl" />
          <div className="absolute -left-12 bottom-0 h-32 w-32 rounded-full bg-[color:color-mix(in_oklch,var(--secondary)_22%,transparent)] blur-3xl" />
          <div className="relative grid gap-8 px-6 py-10 sm:px-10 sm:py-12 lg:grid-cols-[minmax(0,1fr)_280px]">
            <div className="max-w-3xl">
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

            <div className="space-y-3 self-start">
              {highlights.map((highlight) => (
                <div
                  key={highlight.title}
                  className="rounded-2xl border border-[color:var(--border)] bg-[color:var(--card)] px-4 py-4 shadow-sm"
                >
                  <p className="text-sm font-semibold text-[color:var(--foreground)]">
                    {highlight.title}
                  </p>
                  <p className="mt-2 text-sm text-[color:var(--muted-foreground)]">
                    {highlight.body}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </Card>
      </div>
    </section>
  );
}
