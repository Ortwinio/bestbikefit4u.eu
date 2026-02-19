"use client";

import Link from "next/link";
import { useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import type { Id } from "../../../../convex/_generated/dataModel";
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  LoadingState,
  EmptyState,
} from "@/components/ui";
import { BIKE_TYPE_LABELS } from "@/lib/bikes";
import { withLocalePrefix } from "@/i18n/navigation";
import { useDashboardMessages } from "@/i18n/useDashboardMessages";
import { Plus, Pencil, Trash2 } from "lucide-react";

export default function BikesPage() {
  const { locale, messages } = useDashboardMessages();
  const bikes = useQuery(api.bikes.queries.listByUser);
  const removeBike = useMutation(api.bikes.mutations.remove);

  const [deletingBikeId, setDeletingBikeId] = useState<Id<"bikes"> | null>(
    null
  );

  const handleDelete = async (bikeId: Id<"bikes">, bikeName: string) => {
    const confirmed = window.confirm(
      messages.bikes.delete.confirm.replace("{bikeName}", bikeName)
    );
    if (!confirmed) {
      return;
    }

    setDeletingBikeId(bikeId);
    try {
      await removeBike({ bikeId });
    } catch (error) {
      console.error("Failed to delete bike:", error);
      alert(messages.bikes.delete.failed);
    } finally {
      setDeletingBikeId(null);
    }
  };

  if (bikes === undefined) {
    return <LoadingState label={messages.bikes.loading} />;
  }

  return (
    <div className="max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{messages.bikes.title}</h1>
          <p className="text-gray-600 mt-2">{messages.bikes.subtitle}</p>
        </div>
        <Link href={withLocalePrefix("/bikes/new", locale)}>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            {messages.bikes.actions.addBike}
          </Button>
        </Link>
      </div>

      {bikes.length === 0 ? (
        <EmptyState
          title={messages.bikes.empty.title}
          description={messages.bikes.empty.description}
          action={
            <Link href={withLocalePrefix("/bikes/new", locale)}>
              <Button>{messages.bikes.empty.cta}</Button>
            </Link>
          }
        />
      ) : (
        <div className="grid gap-4">
          {bikes.map((bike) => {
            const bikeTypeLabel = BIKE_TYPE_LABELS[bike.bikeType];

            return (
              <Card key={bike._id} variant="bordered">
                <CardHeader className="mb-2">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <CardTitle>{bike.name}</CardTitle>
                      <p className="text-sm text-gray-500 mt-1">{bikeTypeLabel}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Link href={withLocalePrefix(`/bikes/${bike._id}/edit`, locale)}>
                        <Button variant="outline" size="sm">
                          <Pencil className="h-4 w-4 mr-1" />
                          {messages.common.edit}
                        </Button>
                      </Link>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDelete(bike._id, bike.name)}
                        isLoading={deletingBikeId === bike._id}
                      >
                        <Trash2 className="h-4 w-4 mr-1" />
                        {messages.common.delete}
                      </Button>
                    </div>
                  </div>
                </CardHeader>

                <CardContent>
                  <div className="grid gap-3 sm:grid-cols-2 text-sm text-gray-600">
                    <div>
                      <p className="font-medium text-gray-800 mb-1">
                        {messages.bikes.sections.geometry}
                      </p>
                      <p>
                        {messages.bikes.fields.stack}: {bike.currentGeometry?.stackMm ?? "-"} mm |{" "}
                        {messages.bikes.fields.reach}: {bike.currentGeometry?.reachMm ?? "-"} mm
                      </p>
                      <p>
                        {messages.bikes.fields.sta}: {bike.currentGeometry?.seatTubeAngle ?? "-"} deg |{" "}
                        {messages.bikes.fields.hta}: {bike.currentGeometry?.headTubeAngle ?? "-"} deg
                      </p>
                      <p>
                        {messages.bikes.fields.frameSize}: {bike.currentGeometry?.frameSize ?? "-"}
                      </p>
                    </div>
                    <div>
                      <p className="font-medium text-gray-800 mb-1">
                        {messages.bikes.sections.currentSetup}
                      </p>
                      <p>
                        {messages.bikes.fields.saddle}: {bike.currentSetup?.saddleHeightMm ?? "-"} mm |{" "}
                        {messages.bikes.fields.setback}: {bike.currentSetup?.saddleSetbackMm ?? "-"} mm
                      </p>
                      <p>
                        {messages.bikes.fields.stem}: {bike.currentSetup?.stemLengthMm ?? "-"} mm @{" "}
                        {bike.currentSetup?.stemAngle ?? "-"} deg
                      </p>
                      <p>
                        {messages.bikes.fields.bar}: {bike.currentSetup?.handlebarWidthMm ?? "-"} mm |{" "}
                        {messages.bikes.fields.crank}: {bike.currentSetup?.crankLengthMm ?? "-"} mm
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
