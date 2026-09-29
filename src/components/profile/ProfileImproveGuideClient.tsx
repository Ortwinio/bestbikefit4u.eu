"use client";

import Link from "next/link";
import { useId, useState } from "react";
import { ArrowLeft, Minus, Plus } from "lucide-react";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Button, Card } from "@/components/ui";
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
  const exerciseId = useId();
  const [openExercise, setOpenExercise] = useState<number | null>(0);

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
  const copy = locale === "nl"
    ? {
        eyebrow: "Je profiel · stap voor stap",
        inProfile: "In je profiel",
        current: "Jouw niveau",
        loading: "Je profiel laden…",
        missing: "Nog niet ingevuld",
        levelIntro: isBmi ? "Categorie op basis van je lengte en gewicht." : "Je huidige niveau komt uit je profiel.",
      }
    : {
        eyebrow: "Your profile · step by step",
        inProfile: "In your profile",
        current: "Your level",
        loading: "Loading your profile…",
        missing: "Not yet recorded",
        levelIntro: isBmi ? "Category based on your height and weight." : "Your current level comes from your profile.",
      };
  const hasScore = Boolean(profile && (isFlexibility
    ? profile.flexibilityScore
    : isComfort
      ? profile.hasPain
      : isBmi
        ? profile.heightCm && profile.weightKg
        : profile.coreStabilityScore));
  const localizedComfortLevels = locale === "nl"
    ? [
        { label: "Ernstig ongemak", description: "Duidelijke pijn die fietsen beperkt of verhindert." },
        { label: "Veel ongemak", description: "Terugkerende pijn die je ritten regelmatig beïnvloedt." },
        { label: "Matig ongemak", description: "Merkbaar ongemak op langere of zwaardere ritten." },
        { label: "Licht ongemak", description: "Af en toe licht, beheersbaar ongemak." },
        { label: "Comfortabel", description: "Geen pijn of ongemak tijdens het fietsen." },
      ]
    : comfortLevels;

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
      ? localizedComfortLevels[deriveComfortScore(profile?.hasPain, profile?.painSeverity) - 1]?.label ??
        localizedComfortLevels[4].label
      : isBmi
        ? bmiCategoryLabels[bmiCategoryIndex]
        : localizedCoreStabilityTests[Math.max(0, Math.min(4, (profile?.coreStabilityScore ?? 3) - 1))]?.label ??
          localizedCoreStabilityTests[2].label;

  const scoreIndex = isFlexibility
    ? flexibilityTests.findIndex(
        (test) => test.score === (profile?.flexibilityScore ?? "average")
      )
    : isComfort
      ? deriveComfortScore(profile?.hasPain, profile?.painSeverity) - 1
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
      ? localizedComfortLevels.map((level, index) => ({
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
    <div className="mx-auto min-w-0 max-w-[1080px] space-y-6 text-foreground">
      <Link
        href={withLocalePrefix("/profile", locale)}
        className="inline-flex min-h-11 items-center gap-2 rounded-lg font-bold text-primary hover:text-primary-hover focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary"
      >
        <ArrowLeft className="size-5 shrink-0" aria-hidden="true" />
        {backLabel}
      </Link>

      <header className="rounded-[28px] bg-[var(--bbf-lime)] p-6 text-[var(--bbf-inkt)] sm:px-8 sm:py-7">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="min-w-0">
            <p className="mb-3 text-sm font-bold uppercase tracking-[0.08em]">{copy.eyebrow}</p>
            <h1 className="font-display text-[32px] font-extrabold leading-[1.05] tracking-[-0.03em] sm:text-[42px]">
              {title}
            </h1>
            <p className="mt-3.5 max-w-[650px] text-base leading-relaxed">
              {subtitle}
            </p>
          </div>
          <div className="shrink-0 lg:max-w-[190px] lg:text-right" role="status">
            <p className="text-sm">{copy.inProfile}</p>
            <strong className="mt-2 block text-xl">
              {profile === undefined ? copy.loading : hasScore ? currentScoreLabel : copy.missing}
            </strong>
          </div>
        </div>
      </header>

      <div className="grid items-start gap-6 lg:grid-cols-[340px_minmax(0,1fr)]">
      <Card className="min-w-0 gap-0 p-5 sm:p-6" role="region" aria-labelledby={`${exerciseId}-levels`}>
        <h2 id={`${exerciseId}-levels`} className="font-display text-2xl font-bold">
          {whatItMeansTitle}
        </h2>
        <p className="mb-5 mt-2 text-sm leading-relaxed text-muted-foreground">{copy.levelIntro}</p>
        <div className="space-y-2.5">
          {scoreLevels.map((level) => (
            <div
              key={level.title}
              aria-current={hasScore && level.highlighted ? "true" : undefined}
              className={`rounded-2xl border p-3.5 ${hasScore && level.highlighted ? "border-primary bg-primary-soft" : "border-border bg-card"}`}
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h3 className="font-display text-lg font-bold">{level.title}</h3>
                {hasScore && level.highlighted && <span className="text-xs font-bold">{copy.current}</span>}
              </div>
                <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
                  {level.description}
                </p>
            </div>
          ))}
        </div>
      </Card>

      <Card className="min-w-0 gap-0 p-5 sm:p-6" role="region" aria-labelledby={`${exerciseId}-exercises`}>
        <h2 id={`${exerciseId}-exercises`} className="mb-5 font-display text-2xl font-bold">
          {exercisesTitle}
        </h2>
        <div className="space-y-1.5">
          {exercises.map((exercise, index) => (
            <div key={exercise.name}>
              <h3>
                <Button
                  variant="ghost"
                  aria-expanded={openExercise === index}
                  aria-controls={`${exerciseId}-${index}`}
                  id={`${exerciseId}-trigger-${index}`}
                  onClick={() => setOpenExercise(openExercise === index ? null : index)}
                  className="h-auto min-h-[52px] w-full justify-start gap-3 whitespace-normal rounded-[14px] px-4 py-3 text-left text-[15px] text-[var(--bbf-inkt)]"
                  style={{ backgroundColor: openExercise === index ? "var(--bbf-lime)" : "var(--bbf-papier)" }}
                >
                  <span className="w-7 shrink-0 font-mono" aria-hidden="true">{String(index + 1).padStart(2, "0")}</span>
                  <span className="min-w-0 flex-1">{exercise.name}</span>
                  {openExercise === index ? <Minus className="size-4 shrink-0" aria-hidden="true" /> : <Plus className="size-4 shrink-0" aria-hidden="true" />}
                </Button>
              </h3>
              <div id={`${exerciseId}-${index}`} hidden={openExercise !== index} aria-labelledby={`${exerciseId}-trigger-${index}`} className="space-y-3 px-4 pb-5 pt-3.5">
                <p className="text-sm leading-relaxed text-muted-foreground">
                  {exercise.detail}
                </p>
                <p className="text-sm font-bold text-foreground">
                  {exercise.cadence}
                </p>
                <ol className="list-decimal space-y-2 pl-5 text-sm leading-6 text-muted-foreground">
                  {exercise.steps.map((step) => (
                    <li key={step}>{step}</li>
                  ))}
                </ol>
              </div>
            </div>
          ))}
        </div>
      </Card>
      </div>

      <section className="flex flex-col gap-6 rounded-3xl bg-primary-soft p-6 sm:px-7 lg:flex-row lg:items-center">
        <div className="min-w-0 flex-1">
        <h2 className="font-display text-2xl font-bold">
          {progressTitle}
        </h2>
        <ul className="mt-3.5 list-disc space-y-2 pl-5 text-sm leading-6 text-muted-foreground">
          {progressTips.map((tip) => (
            <li key={tip}>{tip}</li>
          ))}
        </ul>
        </div>
        <div className="lg:w-[210px] lg:shrink-0">
          <Button
            nativeButton={false}
            role="link"
            className="h-auto min-h-12 w-full whitespace-normal py-3 text-center"
            render={<Link href={withLocalePrefix(`/profile?edit=${editTarget}`, locale)} />}
          >
            {updateScoreCta}
          </Button>
        </div>
      </section>
    </div>
  );
}
