"use client";

import { use } from "react";
import { useRouter } from "next/navigation";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../../../../../convex/_generated/api";
import { type Id } from "../../../../../../convex/_generated/dataModel";
import {
  BikeForm,
  type BikeFormInitialData,
  type BikeFormPayload,
} from "@/components/bikes";

interface EditBikePageProps {
  params: Promise<{ bikeId: string }>;
}

export default function EditBikePage({ params }: EditBikePageProps) {
  const { bikeId } = use(params);
  const router = useRouter();

  const bike = useQuery(api.bikes.queries.getById, {
    bikeId: bikeId as Id<"bikes">,
  });
  const updateBike = useMutation(api.bikes.mutations.update);
  const removeBike = useMutation(api.bikes.mutations.remove);

  const handleUpdate = async (payload: BikeFormPayload) => {
    await updateBike({
      bikeId: bikeId as Id<"bikes">,
      name: payload.name,
      currentGeometry: payload.currentGeometry,
      currentSetup: payload.currentSetup,
    });
    router.push("/bikes");
  };

  const handleDelete = async () => {
    await removeBike({ bikeId: bikeId as Id<"bikes"> });
    router.push("/bikes");
  };

  if (bike === undefined) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
      </div>
    );
  }

  if (bike === null) {
    return (
      <div className="max-w-2xl mx-auto text-center py-12">
        <h1 className="text-2xl font-bold text-gray-900">Bike Not Found</h1>
        <p className="text-gray-600 mt-2">
          This bike does not exist or you do not have access to it.
        </p>
      </div>
    );
  }

  const initialData: BikeFormInitialData = {
    name: bike.name,
    bikeType: bike.bikeType,
    currentGeometry: bike.currentGeometry,
    currentSetup: bike.currentSetup,
  };

  return (
    <BikeForm
      title="Edit Bike"
      description="Update bike details and current setup values."
      submitLabel="Save Changes"
      initialData={initialData}
      showBikeTypeSelect={false}
      onSubmit={handleUpdate}
      onDelete={handleDelete}
      cancelHref="/bikes"
    />
  );
}
