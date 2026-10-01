"use client";

import Link from "next/link";
import { Button } from "@/components/ui";

import { use, useState } from "react";
import { useQuery } from "convex/react";
import { api } from "../../../../../../convex/_generated/api";
import { type Doc, type Id } from "../../../../../../convex/_generated/dataModel";
import { BikeWheelsetsSection } from "@/components/bikes/BikeWheelsetsSection";
import { BikeSettingsEditor } from "@/components/bikes/BikeSettingsEditor";
import { BikePressureSection } from "@/components/features/pressure/BikePressureSection";
import { EmptyState, LoadingState } from "@/components/ui";
import { withLocalePrefix } from "@/i18n/navigation";
import { useDashboardMessages } from "@/i18n/useDashboardMessages";
import { DeleteBikeAction } from "@/components/bikes/DeleteBikeAction";

interface EditBikePageProps {
  params: Promise<{ bikeId: string }>;
}

export default function EditBikePage({ params }: EditBikePageProps) {
  const { bikeId } = use(params);
  const { locale, messages } = useDashboardMessages();

  const [deletion, setDeletion] = useState<{ pending: boolean; bike: Doc<"bikes"> } | null>(null);
  const liveBike = useQuery(api.bikes.queries.getById,
    deletion?.pending ? "skip" : { bikeId: bikeId as Id<"bikes"> });
  const bike = liveBike === undefined ? deletion?.bike : liveBike;
  if (bike === undefined) {
    return <LoadingState label={messages.bikeForm.edit.loading} />;
  }

  if (bike === null) {
    return (
      <EmptyState
        title={messages.bikeForm.edit.notFound.title}
        description={messages.bikeForm.edit.notFound.description}
        action={<Button render={<Link href={withLocalePrefix("/bikes", locale)} />}>
          {messages.nav.myBikes}
        </Button>}
      />
    );
  }

  return (
    <div className="space-y-6">
      <BikeSettingsEditor key={bike._id} bike={bike} />
      <DeleteBikeAction
        bikeId={bike._id}
        bikeName={bike.name}
        onPendingChange={(pending) => setDeletion({ pending, bike })}
      />
      {!deletion?.pending && <BikeWheelsetsSection bikeId={bike._id} />}
      {!deletion?.pending && <BikePressureSection bikeId={bike._id} />}
    </div>
  );
}
