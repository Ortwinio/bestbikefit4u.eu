"use client";

import Link from "next/link";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Button, Card, CardContent, CardHeader, CardTitle } from "@/components/ui";
import { withLocalePrefix } from "@/i18n/navigation";
import { useDashboardMessages } from "@/i18n/useDashboardMessages";
import { comfortLevels, coreStabilityTests, deriveComfortScore, flexibilityTests } from "@/lib/validations/profile";

type GuideVariant = "flexibility" | "coreStability" | "comfort" | "bmi";

interface Exercise {
  name: string;
  detail: string;
  cadence: string;
  steps: string[];
}

function deriveBmiCategoryIndex(heightCm: number | undefined, weightKg: number | undefined): number {
  if (!heightCm || !weightKg) return 1;
  const bmi = weightKg / ((heightCm / 100) ** 2);
  if (bmi < 18.5) return 0;
  if (bmi < 25) return 1;
  if (bmi < 30) return 2;
  return 3;
}

export function ProfileImproveGuideClient({
  variant,
  exercises,
  progressTips,
}: {
  variant: GuideVariant;
  exercises: Exercise[];
  progressTips: string[];
}) {
  const { locale, messages } = useDashboardMessages();
  const profile = useQuery(api.profiles.queries.getMyProfile);

  const isFlexibility = variant === "flexibility";
  const isComfort = variant === "comfort";
  const isBmi = variant === "bmi";
  const improveMessages = isFlexibility
    ? messages.profile.improve.flexibility
    : isComfort
      ? messages.profile.improve.comfort
      : isBmi
        ? messages.profile.improve.bodyMeasurements
        : messages.profile.improve.coreStability;

  const title = improveMessages.title;
  const subtitle = improveMessages.subtitle;
  const backLabel = improveMessages.backLink;
  const whatItMeansTitle = improveMessages.whatItMeansTitle;
  const exercisesTitle = improveMessages.exercisesTitle;
  const progressTitle = improveMessages.progressTitle;
  const updateScoreCta = improveMessages.updateScoreCta;

  const localizedFlexibilityTests = locale === "nl"
    ? [
        { label: "Zeer beperkt", description: "Komt zittend met gestrekte benen niet tot de knieën" },
        { label: "Beperkt", description: "Komt zittend tot halverwege het scheenbeen" },
        { label: "Gemiddeld", description: "Komt zittend tot de enkels" },
        { label: "Goed", description: "Komt zittend tot de tenen" },
        { label: "Uitstekend", description: "Komt zittend voorbij de tenen" },
      ]
    : flexibilityTests.map((test) => ({ label: test.label, description: test.description }));

  const localizedCoreStabilityTests = locale === "nl"
    ? [
        { label: "1 - Zeer laag", description: "Plank korter dan 20 seconden" },
        { label: "2 - Laag", description: "Plank 20-40 seconden" },
        { label: "3 - Gemiddeld", description: "Plank 40-60 seconden" },
        { label: "4 - Goed", description: "Plank 60-90 seconden" },
        { label: "5 - Uitstekend", description: "Plank 90+ seconden met perfecte vorm" },
      ]
    : coreStabilityTests.map((test) => ({
        label: `${test.score} - ${test.label}`,
        description: test.description,
      }));

  const flexibilityImplications = locale === "nl"
    ? [
        "Een vrij rechte positie is het meest realistisch; veel drop is nu nog niet haalbaar.",
        "Een matige drop is mogelijk met een voorzichtige reach.",
        "Een normale sportieve positie past goed bij een standaard racefietsgeometrie.",
        "Een agressievere fit wordt haalbaar voor gran fondo- of wedstrijdfietsen.",
        "Je kunt een volledige racehouding met weinig beperkingen volhouden.",
      ]
    : [
        "Upright position; large bar drop not yet realistic.",
        "Moderate drop possible with a conservative reach.",
        "Standard sportive position with typical road geometry.",
        "Aggressive fit becomes realistic for gran fondo or race bikes.",
        "You can sustain a full race posture with minimal restrictions.",
      ];

  const coreImplications = locale === "nl"
    ? [
        "Een zeer rechte fit met voorzichtige reach en stack is het meest geschikt.",
        "Een gematigd rechte positie met beperkte duurzame drop past beter.",
        "Een standaard racepositie met gebalanceerde reach en drop is haalbaar.",
        "Een agressievere positie wordt ook op langere ritten realistischer.",
        "Een volledige performance-houding is haalbaar met minimale core-beperkingen.",
      ]
    : [
        "Very upright fit with conservative reach and stack.",
        "Moderate upright position with limited sustained drop.",
        "Standard road position with balanced reach and drop.",
        "Aggressive position becomes realistic for longer rides.",
        "Full performance posture with minimal core-related limits.",
      ];

  const bmiImplications = locale === "nl"
    ? [
        "Ondergewicht kan vermogen en herstel beperken. Te weinig eten op lange ritten is een veelvoorkomende oorzaak. Je fit houdt rekening met een lagere belasting op het frame.",
        "Een gunstig bereik voor de meeste fietsers. Deze BMI ondersteunt een sterke power-to-weight, uithoudingsvermogen en comfortabele zadelbelasting.",
        "Verhoogt de belasting op zadel en gewrichten. Je fit legt dan meer nadruk op drukverdeling en gewrichtsvriendelijke posities. Afvallen in dit bereik verbetert de power-to-weight merkbaar.",
        "Een hoger lichaamsgewicht verhoogt de druk op knieën en onderrug, vooral op lange ritten. Je fit prioriteert gewrichtsbescherming, zadelcomfort en een minder agressieve houding.",
      ]
    : [
        "Being underweight can limit power output and recovery. Insufficient fueling on long rides is a common cause. Your fit accounts for a lower frame load.",
        "Optimal range for most cyclists. This BMI supports a strong power-to-weight ratio, endurance, and comfortable saddle pressure distribution.",
        "Increases load on the saddle and joints. Your fit will prioritise saddle pressure distribution and joint-friendly positions. Reducing weight in this range improves power-to-weight ratio meaningfully.",
        "Higher body weight increases pressure on the knees and lower back, particularly on longer rides. Your fit prioritises joint protection, saddle pressure distribution, and a less aggressive posture.",
      ];

  const comfortImplications = locale === "nl"
    ? [
        "Er is duidelijke pijn op vrijwel elke rit. Fit-aanpassingen hebben hier de grootste impact.",
        "Terugkerende pijn beïnvloedt je rijplezier. Gerichte fit-wijzigingen zijn aan te raden.",
        "Merkbaar ongemak beperkt vooral langere of zwaardere ritten. Matige fit-aanpassingen helpen meestal goed.",
        "Licht en beheersbaar. Kleine tweaks kunnen dit vaak volledig oplossen.",
        "Geen pijn of ongemak. Je fit werkt goed voor jouw lichaam.",
      ]
    : [
        "Significant pain on every ride. Fit adjustments will have the highest impact here.",
        "Recurring pain that affects your enjoyment. Targeted fit changes are recommended.",
        "Noticeable discomfort that limits longer efforts. Moderate fit adjustments will help.",
        "Mild and manageable. Minor tweaks can eliminate this entirely.",
        "No pain or discomfort. Your fit is working well for your body.",
      ];

  const bmiCategoryIndex = deriveBmiCategoryIndex(profile?.heightCm, profile?.weightKg);
  const bmiCategoryLabels = [
    messages.profile.bmi.underweight,
    messages.profile.bmi.normal,
    messages.profile.bmi.overweight,
    messages.profile.bmi.obese,
  ];

  const currentScoreLabel = isFlexibility
    ? localizedFlexibilityTests[
        flexibilityTests.findIndex(
          (test) => test.score === (profile?.flexibilityScore ?? "average")
        )
      ]?.label ?? localizedFlexibilityTests[2].label
    : isComfort
      ? comfortLevels[(deriveComfortScore(profile?.hasPain, profile?.painSeverity) ?? 5) - 1]?.label ??
        comfortLevels[4].label
      : isBmi
        ? bmiCategoryLabels[bmiCategoryIndex]
        : localizedCoreStabilityTests[Math.max(0, Math.min(4, (profile?.coreStabilityScore ?? 3) - 1))]?.label ??
          localizedCoreStabilityTests[2].label;

  const scoreIndex = isFlexibility
    ? flexibilityTests.findIndex(
        (test) => test.score === (profile?.flexibilityScore ?? "average")
      )
    : isComfort
      ? comfortLevels[(deriveComfortScore(profile?.hasPain, profile?.painSeverity) ?? 5) - 1]?.label ??
        comfortLevels[4].label
      : isBmi
        ? bmiCategoryIndex
        : Math.max(0, Math.min(4, (profile?.coreStabilityScore ?? 3) - 1));

  const scoreLevels = isFlexibility
    ? localizedFlexibilityTests.map((test, index) => ({
        title: test.label,
        description: flexibilityImplications[index],
        highlighted: index === scoreIndex,
      }))
    : isComfort
      ? comfortLevels.map((level, index) => ({
          title: level.label,
          description: `${level.description} ${comfortImplications[index]}`,
          highlighted: index === scoreIndex,
        }))
      : isBmi
        ? bmiCategoryLabels.map((label, index) => ({
            title: label,
            description: bmiImplications[index],
            highlighted: index === scoreIndex,
          }))
        : localizedCoreStabilityTests.map((test, index) => ({
            title: test.label,
            description: `${test.description} ${coreImplications[index]}`,
            highlighted: index === scoreIndex,
          }));

  const editTarget = isFlexibility ? "flexibility" : isComfort ? "comfort" : isBmi ? "measurements" : "core";

  return (
    <div className="mx-auto max-w-5xl space-y-8">
      <Link
        href={withLocalePrefix("/profile", locale)}
        className="inline-flex text-sm font-semibold text-[color:var(--primary)] hover:opacity-80"
      >
        {backLabel}
      </Link>

      <section className="rounded-[var(--radius-xl)] border border-[color:var(--border)] bg-[color:var(--card)] p-6 shadow-sm">
        <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-[color:var(--foreground)]">
              {title}
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-[color:var(--muted-foreground)]">
              {subtitle}
            </p>
          </div>
          <span className="inline-flex rounded-full bg-[color:var(--secondary)] px-3 py-1 text-sm font-semibold text-[color:var(--secondary-foreground)]">
            {currentScoreLabel}
          </span>
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold text-[color:var(--foreground)]">
          {whatItMeansTitle}
        </h2>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {scoreLevels.map((level) => (
            <Card
              key={level.title}
              variant="bordered"
              className={level.highlighted ? "border-[color:var(--primary)] shadow-sm" : ""}
            >
              <CardHeader>
                <CardTitle>{level.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm leading-6 text-[color:var(--muted-foreground)]">
                  {level.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold text-[color:var(--foreground)]">
          {exercisesTitle}
        </h2>
        <div className="grid gap-4 md:grid-cols-2">
          {exercises.map((exercise) => (
            <Card key={exercise.name} variant="bordered">
              <CardHeader>
                <CardTitle>{exercise.name}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-sm text-[color:var(--muted-foreground)]">
                  {exercise.detail}
                </p>
                <p className="text-sm font-medium text-[color:var(--foreground)]">
                  {exercise.cadence}
                </p>
                <ul className="space-y-1 text-sm leading-6 text-[color:var(--muted-foreground)]">
                  {exercise.steps.map((step) => (
                    <li key={step}>• {step}</li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <section className="rounded-[var(--radius-xl)] border border-[color:var(--border)] bg-[color:var(--card)] p-6 shadow-sm">
        <h2 className="text-xl font-semibold text-[color:var(--foreground)]">
          {progressTitle}
        </h2>
        <ul className="mt-4 space-y-2 text-sm leading-6 text-[color:var(--muted-foreground)]">
          {progressTips.map((tip) => (
            <li key={tip}>• {tip}</li>
          ))}
        </ul>
        <div className="mt-6">
          <Button
            render={<Link href={withLocalePrefix(`/profile?edit=${editTarget}`, locale)} />}
          >
            {updateScoreCta}
          </Button>
        </div>
      </section>
    </div>
  );
}
