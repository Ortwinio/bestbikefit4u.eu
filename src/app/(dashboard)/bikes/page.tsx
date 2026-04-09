"use client";

import Link from "next/link";
import { useEffect, useMemo } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { BikeGarageRow, buildLatestFitByBike } from "@/components/bikes/BikeGarageOverview";
import { Button, Card, CardContent, EmptyState, LoadingState } from "@/components/ui";
import { withLocalePrefix } from "@/i18n/navigation";
import { useDashboardMessages } from "@/i18n/useDashboardMessages";
import { CopyPlus, Plus, Store } from "lucide-react";

function linkButtonProps(href: string) {
  return {
    render: <Link href={href} />,
    nativeButton: false as const,
  };
}

export default function BikesPage() {
  const { locale, messages } = useDashboardMessages();
  const bikes = useQuery(api.bikes.queries.listSummariesByUser);
  const sessionsWithBikes = useQuery(api.sessions.queries.getAllSessionsWithBikes);
  const ensurePassportIdsForOwnedBikes = useMutation(
    api.bikes.mutations.ensurePassportIdsForOwnedBikes
  );

  const latestFitByBike = useMemo(
    () =>
      buildLatestFitByBike(
        sessionsWithBikes as Parameters<typeof buildLatestFitByBike>[0]
      ),
    [sessionsWithBikes]
  );

  useEffect(() => {
    if (
      !bikes?.some((bike) => {
        const bikePassportId =
          "bikePassportId" in bike
            ? ((bike as { bikePassportId?: string }).bikePassportId ?? null)
            : null;
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
    <div className="space-y-6">
      <Card variant="bordered" className="dashboard-hero-surface overflow-hidden">
        <CardContent className="flex flex-col gap-6 p-6 md:p-8 lg:flex-row lg:items-end lg:justify-between">
          <div className="space-y-3">
            <h1 className="text-3xl font-semibold tracking-tight text-[color:var(--foreground)]">
              {messages.nav.myBikes}
            </h1>
            <p className="max-w-2xl text-sm leading-6 text-[color:var(--muted-foreground)]">
              {messages.bikes.subtitle}
            </p>
          </div>
          <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row sm:flex-wrap lg:justify-end">
            <Button
              {...linkButtonProps(withLocalePrefix("/bikes/new", locale))}
              className="w-full justify-center sm:w-auto"
            >
              <Plus className="h-4 w-4" />
              {messages.nav.newBike}
            </Button>
            <Button
              variant="outline"
              {...linkButtonProps(withLocalePrefix("/bikes/import/marktplaats", locale))}
              className="w-full justify-center sm:w-auto"
            >
              <Store className="h-4 w-4" />
              {messages.bikeForm.marktplaatsImport.entryCta}
            </Button>
            <Button
              variant="outline"
              {...linkButtonProps(withLocalePrefix("/bikes/import/passport", locale))}
              className="w-full justify-center sm:w-auto"
            >
              <CopyPlus className="h-4 w-4" />
              {messages.bikeForm.passportImport.entryCta}
            </Button>
          </div>
        </CardContent>
      </Card>

      {bikes.length === 0 ? (
        <Card variant="bordered" className="dashboard-card-surface-muted">
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
                    {...linkButtonProps(withLocalePrefix("/bikes/import/marktplaats", locale))}
                    className="w-full justify-center sm:w-auto"
                  >
                    {messages.bikeForm.marktplaatsImport.entryCta}
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
