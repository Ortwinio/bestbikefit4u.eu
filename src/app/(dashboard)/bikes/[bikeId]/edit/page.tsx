"use client";

import { use, useMemo } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../../../../../convex/_generated/api";
import { type Id } from "../../../../../../convex/_generated/dataModel";
import {
  BikeForm,
  type BikeFormInitialData,
  type BikeFormPayload,
} from "@/components/bikes";
import { EmptyState, LoadingState } from "@/components/ui";
import { DEFAULT_LOCALE } from "@/i18n/config";
import { extractLocaleFromPathname, withLocalePrefix } from "@/i18n/navigation";

interface EditBikePageProps {
  params: Promise<{ bikeId: string }>;
}

export default function EditBikePage({ params }: EditBikePageProps) {
  const { bikeId } = use(params);
  const router = useRouter();
  const pathname = usePathname();
  const locale = useMemo(
    () => extractLocaleFromPathname(pathname ?? "") ?? DEFAULT_LOCALE,
    [pathname]
  );

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
    router.push(withLocalePrefix("/bikes", locale));
  };

  const handleDelete = async () => {
    await removeBike({ bikeId: bikeId as Id<"bikes"> });
    router.push(withLocalePrefix("/bikes", locale));
  };

  if (bike === undefined) {
    return <LoadingState label="Loading bike..." />;
  }

  if (bike === null) {
    return (
      <EmptyState
        title="Bike not found"
        description="This bike does not exist or you do not have access to it."
      />
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
      cancelHref={withLocalePrefix("/bikes", locale)}
    />
  );
}
