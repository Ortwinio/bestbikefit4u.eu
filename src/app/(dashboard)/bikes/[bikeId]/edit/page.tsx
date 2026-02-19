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
import { EmptyState, LoadingState } from "@/components/ui";
import { withLocalePrefix } from "@/i18n/navigation";
import { useDashboardMessages } from "@/i18n/useDashboardMessages";

interface EditBikePageProps {
  params: Promise<{ bikeId: string }>;
}

export default function EditBikePage({ params }: EditBikePageProps) {
  const { bikeId } = use(params);
  const router = useRouter();
  const { locale, messages } = useDashboardMessages();

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
    return <LoadingState label={messages.bikeForm.edit.loading} />;
  }

  if (bike === null) {
    return (
      <EmptyState
        title={messages.bikeForm.edit.notFound.title}
        description={messages.bikeForm.edit.notFound.description}
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
      title={messages.bikeForm.edit.title}
      description={messages.bikeForm.edit.description}
      submitLabel={messages.bikeForm.actions.saveChanges}
      initialData={initialData}
      showBikeTypeSelect={false}
      onSubmit={handleUpdate}
      onDelete={handleDelete}
      cancelHref={withLocalePrefix("/bikes", locale)}
    />
  );
}
