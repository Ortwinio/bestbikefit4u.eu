"use client";

import Link from "next/link";
import { useMemo } from "react";
import { useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { BikeGarageRow, buildLatestFitByBike } from "@/components/bikes/BikeGarageOverview";
import { Button, Card, CardContent, EmptyState, LoadingState } from "@/components/ui";
import { withLocalePrefix } from "@/i18n/navigation";
import { useDashboardMessages } from "@/i18n/useDashboardMessages";
import { Plus } from "lucide-react";

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

  const latestFitByBike = useMemo(
    () =>
      buildLatestFitByBike(
        sessionsWithBikes as Parameters<typeof buildLatestFitByBike>[0]
      ),
    [sessionsWithBikes]
  );

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
        <Link
          href={withLocalePrefix("/bikes/new", locale)}
          className="inline-flex items-center gap-2 text-sm font-semibold text-primary hover:text-primary-dark"
        >
          <Plus className="h-4 w-4" />
          {messages.nav.newBike}
        </Link>
      </div>

      {bikes.length === 0 ? (
        <Card variant="bordered" className="dashboard-card-surface">
          <CardContent className="pt-6">
            <EmptyState
              title={messages.bikes.empty.title}
              description={messages.bikes.empty.description}
              action={
                <Button {...linkButtonProps(withLocalePrefix("/bikes/new", locale))}>
                  {messages.bikes.empty.cta}
                </Button>
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
