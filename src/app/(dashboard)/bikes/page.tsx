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
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">{messages.nav.myBikes}</h1>
          <p className="mt-2 text-sm text-muted-foreground">{messages.bikes.subtitle}</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <Button
            variant="outline"
            {...linkButtonProps(withLocalePrefix("/bikes/import/marktplaats", locale))}
          >
            <Store className="h-4 w-4" />
            {messages.bikeForm.marktplaatsImport.entryCta}
          </Button>
          <Button
            variant="outline"
            {...linkButtonProps(withLocalePrefix("/bikes/import/passport", locale))}
          >
            <CopyPlus className="h-4 w-4" />
            {messages.bikeForm.passportImport.entryCta}
          </Button>
          <Link
            href={withLocalePrefix("/bikes/new", locale)}
            className="inline-flex items-center gap-2 text-sm font-semibold text-primary hover:text-primary-dark"
          >
            <Plus className="h-4 w-4" />
            {messages.nav.newBike}
          </Link>
        </div>
      </div>

      {bikes.length === 0 ? (
        <Card variant="bordered" className="dashboard-card-surface">
          <CardContent className="pt-6">
            <EmptyState
              title={messages.bikes.empty.title}
              description={messages.bikes.empty.description}
              action={
                <div className="flex flex-wrap justify-center gap-3">
                  <Button {...linkButtonProps(withLocalePrefix("/bikes/new", locale))}>
                    {messages.bikes.empty.cta}
                  </Button>
                  <Button
                    variant="outline"
                    {...linkButtonProps(withLocalePrefix("/bikes/import/marktplaats", locale))}
                  >
                    {messages.bikeForm.marktplaatsImport.entryCta}
                  </Button>
                  <Button
                    variant="outline"
                    {...linkButtonProps(withLocalePrefix("/bikes/import/passport", locale))}
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
