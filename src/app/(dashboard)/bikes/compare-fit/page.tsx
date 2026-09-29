"use client";

import Link from "next/link";
import { ArrowRight, Bike, Ruler } from "lucide-react";
import { Button, Card, CardContent } from "@/components/ui";
import { withLocalePrefix } from "@/i18n/navigation";
import { useDashboardMessages } from "@/i18n/useDashboardMessages";
import { getBikesCopy } from "@/i18n/account/bikes";

export default function CompareBikeFitPage() {
  const { locale } = useDashboardMessages();
  const copy = getBikesCopy(locale);
  return (
    <div className="mx-auto max-w-6xl space-y-8">
      <header className="space-y-3">
        <p className="text-sm font-semibold text-primary">{copy.garage}</p>
        <h1 className="font-display text-3xl font-bold tracking-tight md:text-4xl">{copy.compare}</h1>
        <p className="max-w-2xl text-muted-foreground">{copy.compareIntro}</p>
      </header>
      <Card variant="bordered" className="overflow-hidden">
        <CardContent className="grid gap-8 p-6 md:p-8 lg:grid-cols-[1fr_2fr] lg:items-center">
          <div className="flex min-h-44 items-center justify-center rounded-3xl bg-primary-soft text-primary">
            <Bike className="h-28 w-28" strokeWidth={1.25} aria-hidden="true" />
            <Ruler className="h-12 w-12" aria-hidden="true" />
          </div>
          <div className="space-y-5">
            <h2 className="font-display text-2xl font-bold">{copy.compareTitle}</h2>
            <p className="max-w-2xl leading-relaxed text-muted-foreground">{copy.compareBody}</p>
            <Button render={<Link href={withLocalePrefix("/bikes", locale)} />}>
              {copy.openGarage}
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
      <div className="grid gap-4 md:grid-cols-3">
        {copy.compareSteps.map((step, index) => (
          <Card key={step.title} variant="bordered">
            <CardContent className="space-y-4 p-6">
              <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-accent font-mono">
                {index + 1}
              </span>
              <h2 className="font-display text-xl font-bold">{step.title}</h2>
              <p className="text-sm leading-relaxed text-muted-foreground">{step.body}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
