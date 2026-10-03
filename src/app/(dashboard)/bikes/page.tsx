"use client";

import Link from "next/link";
import { useEffect, useMemo } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { BikeGarageRow, buildLatestFitByBike } from "@/components/bikes/BikeGarageOverview";
import { Button, Card, CardContent, EmptyState, LoadingState } from "@/components/ui";
import { withLocalePrefix } from "@/i18n/navigation";
import { getBikesCopy } from "@/i18n/account/bikes";
import { useDashboardMessages } from "@/i18n/useDashboardMessages";
import { CopyPlus, Plus } from "lucide-react";
import { isPaidAccessEnforced } from "../../../../shared/pricing/flags";
import { BikeAccessNotice } from "@/components/bikes/BikeAccessNotice";

function linkButtonProps(href: string) {
  return {
    render: <Link href={href} />,
    nativeButton: false as const,
  };
}

export default function BikesPage() {
  const { locale, messages } = useDashboardMessages();
  const bikes = useQuery(api.bikes.queries.listSummariesByUser);
  const access = useQuery(api.pricing.queries.getAccess, isPaidAccessEnforced() ? {} : "skip");
  const atLimit = Boolean(access?.enforced && access.maxBikes !== null && bikes && bikes.length >= access.maxBikes);
  const sessionsWithBikes = useQuery(api.sessions.queries.getAllSessionsWithBikes);
  const ensurePassportIdsForOwnedBikes = useMutation(api.bikes.mutations.ensurePassportIdsForOwnedBikes);

  const latestFitByBike = useMemo(
    () => buildLatestFitByBike(sessionsWithBikes as Parameters<typeof buildLatestFitByBike>[0]),
    [sessionsWithBikes],
  );

  useEffect(() => {
    if (
      !bikes?.some((bike) => {
        const bikePassportId =
          "bikePassportId" in bike ? ((bike as { bikePassportId?: string }).bikePassportId ?? null) : null;
        return !bikePassportId;
      })
    ) {
      return;
    }

    void ensurePassportIdsForOwnedBikes({});
  }, [bikes, ensurePassportIdsForOwnedBikes]);

  if (bikes === undefined || sessionsWithBikes === undefined) {
    return <LoadingState label={messages.bikes.loading} />;
  }

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <Card variant="bordered" className="bg-card overflow-hidden">
        <CardContent className="flex flex-col gap-6 p-6 md:p-8 lg:flex-row lg:items-end lg:justify-between">
          <div className="space-y-3">
            <h1 className="font-display text-3xl font-bold tracking-tight md:text-4xl text-foreground">
              {messages.nav.myBikes}
            </h1>
            <p className="max-w-2xl text-sm leading-6 text-muted-foreground">{messages.bikes.subtitle}</p>
          </div>
          <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row sm:flex-wrap lg:justify-end">
            <Button
              {...linkButtonProps(withLocalePrefix(atLimit ? "/checkout?product=annual" : "/bikes/new", locale))}
              className="w-full justify-center sm:w-auto"
            >
              <Plus className="h-4 w-4" />
              {messages.nav.newBike}
            </Button>
            <Button
              variant="outline"
              {...linkButtonProps(withLocalePrefix(atLimit ? "/checkout?product=annual" : "/bikes/import/passport", locale))}
              className="w-full justify-center sm:w-auto"
            >
              <CopyPlus className="h-4 w-4" />
              {messages.bikeForm.passportImport.entryCta}
            </Button>
          </div>
        </CardContent>
      </Card>

      {access?.enforced && access.maxBikes === 1 && <BikeAccessNotice locale={locale} />}

      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="font-semibold text-foreground">
          {messages.nav.myBikes}{" "}
          <span className="ml-2 rounded-full bg-accent px-3 py-1 font-mono text-accent-foreground">
            {bikes.length}
          </span>
        </p>
        <Button variant="outline" {...linkButtonProps(withLocalePrefix("/bikes/compare-fit", locale))}>
          {getBikesCopy(locale).compare}
        </Button>
      </div>
      {bikes.length === 0 ? (
        <Card variant="bordered" className="bg-muted/40">
          <CardContent className="pt-6">
            <EmptyState
              title={messages.bikes.empty.title}
              description={messages.bikes.empty.description}
              action={
                <div className="flex flex-col justify-center gap-3 sm:flex-row sm:flex-wrap">
                  <Button
                    {...linkButtonProps(withLocalePrefix("/bikes/new", locale))}
                    className="w-full justify-center sm:w-auto"
                  >
                    {messages.bikes.empty.cta}
                  </Button>
                  <Button
                    variant="outline"
                    {...linkButtonProps(withLocalePrefix("/bikes/import/passport", locale))}
                    className="w-full justify-center sm:w-auto"
                  >
                    {messages.bikeForm.passportImport.entryCta}
                  </Button>
                </div>
              }
              className="border-0 p-0 shadow-none"
            />
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {bikes.map((bike) => (
            <BikeGarageRow
              key={bike._id}
              bike={bike}
              latestFit={latestFitByBike.get(bike._id) ?? null}
              locale={locale}
              messages={messages}
            />
          ))}
        </div>
      )}
    </div>
  );
}
