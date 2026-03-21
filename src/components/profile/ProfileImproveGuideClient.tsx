"use client";

import Link from "next/link";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Button, Card, CardContent, CardHeader, CardTitle } from "@/components/ui";
import { withLocalePrefix } from "@/i18n/navigation";
import { useDashboardMessages } from "@/i18n/useDashboardMessages";
import { flexibilityTests, coreStabilityTests } from "@/lib/validations/profile";

type GuideVariant = "flexibility" | "coreStability";

interface Exercise {
  name: string;
  detail: string;
  cadence: string;
  steps: string[];
}

const flexibilityImplications = [
  "Upright position; large bar drop not yet realistic.",
  "Moderate drop possible with a conservative reach.",
  "Standard sportive position with typical road geometry.",
  "Aggressive fit becomes realistic for gran fondo or race bikes.",
  "You can sustain a full race posture with minimal restrictions.",
];

const coreImplications = [
  "Very upright fit with conservative reach and stack.",
  "Moderate upright position with limited sustained drop.",
  "Standard road position with balanced reach and drop.",
  "Aggressive position becomes realistic for longer rides.",
  "Full performance posture with minimal core-related limits.",
];

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
  const title = isFlexibility
    ? messages.profile.improve.flexibility.title
    : messages.profile.improve.coreStability.title;
  const subtitle = isFlexibility
    ? messages.profile.improve.flexibility.subtitle
    : messages.profile.improve.coreStability.subtitle;
  const backLabel = isFlexibility
    ? messages.profile.improve.flexibility.backLink
    : messages.profile.improve.coreStability.backLink;
  const whatItMeansTitle = isFlexibility
    ? messages.profile.improve.flexibility.whatItMeansTitle
    : messages.profile.improve.coreStability.whatItMeansTitle;
  const exercisesTitle = isFlexibility
    ? messages.profile.improve.flexibility.exercisesTitle
    : messages.profile.improve.coreStability.exercisesTitle;
  const progressTitle = isFlexibility
    ? messages.profile.improve.flexibility.progressTitle
    : messages.profile.improve.coreStability.progressTitle;
  const updateScoreCta = isFlexibility
    ? messages.profile.improve.flexibility.updateScoreCta
    : messages.profile.improve.coreStability.updateScoreCta;

  const currentScoreLabel = isFlexibility
    ? flexibilityTests.find(
        (test) => test.score === (profile?.flexibilityScore ?? "average")
      )?.label ?? flexibilityTests[2].label
    : coreStabilityTests[(profile?.coreStabilityScore ?? 3) - 1]?.label ??
      coreStabilityTests[2].label;

  const scoreIndex = isFlexibility
    ? flexibilityTests.findIndex(
        (test) => test.score === (profile?.flexibilityScore ?? "average")
      )
    : Math.max(0, Math.min(4, (profile?.coreStabilityScore ?? 3) - 1));

  const scoreLevels = isFlexibility
    ? flexibilityTests.map((test, index) => ({
        title: test.label,
        description: flexibilityImplications[index],
        highlighted: index === scoreIndex,
      }))
    : coreStabilityTests.map((test, index) => ({
        title: `${test.score} - ${test.label}`,
        description: `${test.description} ${coreImplications[index]}`,
        highlighted: index === scoreIndex,
      }));

  const editTarget = isFlexibility ? "flexibility" : "core";

  return (
    <div className="mx-auto max-w-5xl space-y-8">
      <Link
        href={withLocalePrefix("/profile", locale)}
        className="inline-flex text-sm font-semibold text-blue-700 hover:text-blue-800"
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
