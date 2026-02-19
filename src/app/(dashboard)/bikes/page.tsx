"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { usePathname } from "next/navigation";
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
import { DEFAULT_LOCALE } from "@/i18n/config";
import { extractLocaleFromPathname, withLocalePrefix } from "@/i18n/navigation";
import { Plus, Pencil, Trash2 } from "lucide-react";

export default function BikesPage() {
  const pathname = usePathname();
  const locale = useMemo(
    () => extractLocaleFromPathname(pathname ?? "") ?? DEFAULT_LOCALE,
    [pathname]
  );
  const bikes = useQuery(api.bikes.queries.listByUser);
  const removeBike = useMutation(api.bikes.mutations.remove);

  const [deletingBikeId, setDeletingBikeId] = useState<Id<"bikes"> | null>(
    null
  );

  const handleDelete = async (bikeId: Id<"bikes">, bikeName: string) => {
    const confirmed = window.confirm(
      `Delete \"${bikeName}\"? This action cannot be undone.`
    );
    if (!confirmed) {
      return;
    }

    setDeletingBikeId(bikeId);
    try {
      await removeBike({ bikeId });
    } catch (error) {
      console.error("Failed to delete bike:", error);
      alert("Could not delete bike. Please try again.");
    } finally {
      setDeletingBikeId(null);
    }
  };

  if (bikes === undefined) {
    return <LoadingState label="Loading bikes..." />;
  }

  return (
    <div className="max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Bikes</h1>
          <p className="text-gray-600 mt-2">
            Save your bikes to keep fit sessions tied to real setups.
          </p>
        </div>
        <Link href={withLocalePrefix("/bikes/new", locale)}>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Add Bike
          </Button>
        </Link>
      </div>

      {bikes.length === 0 ? (
        <EmptyState
          title="No bikes added yet"
          description="Save your first bike to compare fit sessions over time."
          action={
            <Link href={withLocalePrefix("/bikes/new", locale)}>
              <Button>Add Your First Bike</Button>
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
                          Edit
                        </Button>
                      </Link>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDelete(bike._id, bike.name)}
                        isLoading={deletingBikeId === bike._id}
                      >
                        <Trash2 className="h-4 w-4 mr-1" />
                        Delete
                      </Button>
                    </div>
                  </div>
                </CardHeader>

                <CardContent>
                  <div className="grid gap-3 sm:grid-cols-2 text-sm text-gray-600">
                    <div>
                      <p className="font-medium text-gray-800 mb-1">Geometry</p>
                      <p>
                        Stack: {bike.currentGeometry?.stackMm ?? "-"} mm | Reach: {bike.currentGeometry?.reachMm ?? "-"} mm
                      </p>
                      <p>
                        STA: {bike.currentGeometry?.seatTubeAngle ?? "-"} deg | HTA: {bike.currentGeometry?.headTubeAngle ?? "-"} deg
                      </p>
                      <p>Frame size: {bike.currentGeometry?.frameSize ?? "-"}</p>
                    </div>
                    <div>
                      <p className="font-medium text-gray-800 mb-1">Current Setup</p>
                      <p>
                        Saddle: {bike.currentSetup?.saddleHeightMm ?? "-"} mm | Setback: {bike.currentSetup?.saddleSetbackMm ?? "-"} mm
                      </p>
                      <p>
                        Stem: {bike.currentSetup?.stemLengthMm ?? "-"} mm @ {bike.currentSetup?.stemAngle ?? "-"} deg
                      </p>
                      <p>
                        Bar: {bike.currentSetup?.handlebarWidthMm ?? "-"} mm | Crank: {bike.currentSetup?.crankLengthMm ?? "-"} mm
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
