import { Gauge, ShieldCheck } from "lucide-react";
import {
  PublicFeatureCard,
  PublicHero,
  PublicSection,
} from "@/components/public";

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
            icon: <Gauge className="h-5 w-5" />,
          },
          {
            title: "Gemaakt om te verfijnen",
            body: "Begin hier en test daarna kleine aanpassingen op gevoel, terrein en feedback uit echte ritten.",
            icon: <ShieldCheck className="h-5 w-5" />,
          },
        ]
      : [
          {
            title: "Fast starting point",
            body: "Set weight, tyre width, surface, and tyre type to generate a practical first pressure baseline.",
            icon: <Gauge className="h-5 w-5" />,
          },
          {
            title: "Built for refinement",
            body: "Start here, then test small changes based on feel, terrain, and real ride feedback.",
            icon: <ShieldCheck className="h-5 w-5" />,
          },
        ];

  return (
    <>
      <PublicHero
        eyebrow="BestBikeFit4U calculator"
        title={title}
        description={subtitle}
        chips={chips}
      />
      <PublicSection
        className="mt-10"
        header={{
          eyebrow:
            locale === "nl" ? "Waarom deze calculator werkt" : "Why this calculator works",
          title:
            locale === "nl"
              ? "Sterk genoeg voor een eerste testrit, eerlijk over wat daarna telt"
              : "Strong enough for a first test ride, honest about what matters after that",
          description:
            locale === "nl"
              ? "Bandenspanning reageert sterk op een paar invoerwaarden. Daarom werkt een eenvoudige publieke intake hier goed als startpunt."
              : "Tyre pressure reacts strongly to a small set of inputs. That is why a simple public intake works well here as a starting point.",
        }}
      >
        <div className="grid gap-4 md:grid-cols-2">
          {highlights.map((highlight) => (
            <PublicFeatureCard
              key={highlight.title}
              icon={highlight.icon}
              title={highlight.title}
              description={highlight.body}
            />
          ))}
        </div>
      </PublicSection>
    </>
  );
}
