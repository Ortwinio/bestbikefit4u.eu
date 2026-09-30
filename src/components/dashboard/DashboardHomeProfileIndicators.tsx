import type { Doc } from "../../../convex/_generated/dataModel";
import { Progress } from "@/components/ui";
import type { Locale } from "@/i18n/config";
import type { DashboardMessages } from "@/i18n/dashboardMessages";
import { coreStabilityTests, flexibilityTests } from "@/lib/validations/profile";

const dutchFlexibility = [
  ["Zeer beperkt", "Je reikt zittend met gestrekte benen niet tot je knieën."],
  ["Beperkt", "Je reikt zittend tot halverwege je schenen."],
  ["Gemiddeld", "Je kunt zittend je enkels aanraken."],
  ["Goed", "Je kunt zittend je tenen aanraken."],
  ["Uitstekend", "Je reikt zittend voorbij je tenen."],
];

const dutchCore = [
  ["Zeer laag", "Plank minder dan 20 seconden vasthouden."],
  ["Laag", "Plank 20–40 seconden vasthouden."],
  ["Gemiddeld", "Plank 40–60 seconden vasthouden."],
  ["Goed", "Plank 60–90 seconden vasthouden."],
  ["Uitstekend", "Plank 90+ seconden vasthouden met een goede houding."],
];

export function DashboardHomeProfileIndicators({ profile, locale, messages }: {
  profile: Pick<Doc<"profiles">, "flexibilityScore" | "coreStabilityScore">;
  locale: Locale;
  messages: DashboardMessages;
}) {
  const flexibilityIndex = flexibilityTests.findIndex((test) => test.score === profile.flexibilityScore);
  const coreIndex = Math.max(1, Math.min(5, profile.coreStabilityScore)) - 1;
  const flexibility = flexibilityTests[flexibilityIndex];
  const core = coreStabilityTests[coreIndex];
  const indicators = [
    {
      title: messages.profile.sections.flexibility,
      score: flexibilityIndex + 1,
      label: locale === "nl" ? dutchFlexibility[flexibilityIndex][0] : flexibility.label,
      description: locale === "nl" ? dutchFlexibility[flexibilityIndex][1] : flexibility.description,
      segmented: false,
    },
    {
      title: messages.profile.sections.coreStability,
      score: coreIndex + 1,
      label: locale === "nl" ? dutchCore[coreIndex][0] : core.label,
      description: locale === "nl" ? dutchCore[coreIndex][1] : core.description,
      segmented: true,
    },
  ];

  return (
    <div className="grid gap-6 pt-2 md:grid-cols-2">
      {indicators.map((indicator) => (
        <section key={indicator.title} aria-label={indicator.title} className="min-w-0 space-y-3">
          <h3 className="font-display text-xl font-bold">{indicator.title}</h3>
          <div className="flex items-baseline justify-between gap-3">
            <p className="font-semibold">{indicator.label}</p>
            <span className="font-mono text-sm">{indicator.score}/5</span>
          </div>
          {indicator.segmented ? (
            <div role="meter" aria-label={indicator.title} aria-valuenow={indicator.score} aria-valuemin={0} aria-valuemax={5} className="flex gap-2">
              {[1, 2, 3, 4, 5].map((segment) => (
                <span key={segment} className={`h-2.5 flex-1 rounded-full ${segment <= indicator.score ? "bg-[var(--bbf-lime)]" : "bg-border"}`} />
              ))}
            </div>
          ) : (
            <Progress value={indicator.score} max={5} label={indicator.title} trackClassName="h-2.5" indicatorClassName="bg-[var(--bbf-lime)]" />
          )}
          <p className="text-sm leading-relaxed text-muted-foreground">{indicator.description}</p>
        </section>
      ))}
    </div>
  );
}
