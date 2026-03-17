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
    <section className="bg-gradient-to-br from-blue-50 via-white to-cyan-50 py-16">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-blue-700">
            BestBikeFit4U
          </p>
          <h1 className="mt-4 text-4xl font-bold text-gray-900 sm:text-5xl">
            {title}
          </h1>
          <p className="mt-5 text-lg text-gray-600">{subtitle}</p>
          <div className="mt-8 flex flex-wrap gap-3">
            {chips.map((chip) => (
              <span
                key={chip}
                className="rounded-full border border-blue-100 bg-white px-4 py-2 text-sm font-medium text-blue-700 shadow-sm"
              >
                {chip}
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
