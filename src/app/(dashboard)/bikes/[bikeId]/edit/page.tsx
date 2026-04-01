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
} from "../../../../../components/bikes/BikeForm";
import { BikePressureSection } from "@/components/features/pressure/BikePressureSection";
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
  const assignPublicFitCode = useMutation(api.bikes.mutations.assignPublicFitCode);
  const revokePublicFitCode = useMutation(api.bikes.mutations.revokePublicFitCode);
  const removeBike = useMutation(api.bikes.mutations.remove);

  const handleUpdate = async (payload: BikeFormPayload) => {
    await updateBike({
      bikeId: bikeId as Id<"bikes">,
      name: payload.name,
      bikeType: payload.bikeType,
      brand: payload.brand,
      model: payload.model,
      geometryRecordId: payload.geometryRecordId
        ? (payload.geometryRecordId as Id<"geometry_records">)
        : null,
      ridingStyle: payload.ridingStyle,
      primaryGoal: payload.primaryGoal,
      notes: payload.notes,
      currentGeometry: payload.currentGeometry,
      currentSetup: payload.currentSetup,
    });
    router.replace(withLocalePrefix("/bikes", locale));
  };

  const handleDelete = async () => {
    await removeBike({ bikeId: bikeId as Id<"bikes"> });
    router.replace(withLocalePrefix("/bikes", locale));
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
    brand: bike.brand,
    model: bike.model,
    geometryRecordId: bike.geometryRecordId ? String(bike.geometryRecordId) : null,
    ridingStyle: bike.ridingStyle,
    primaryGoal: bike.primaryGoal,
    notes: bike.notes,
    currentGeometry: bike.currentGeometry,
    currentSetup: bike.currentSetup,
  };

  const bikePassportId =
    typeof (bike as { bikePassportId?: unknown }).bikePassportId === "string"
      ? ((bike as { bikePassportId?: string }).bikePassportId ?? null)
      : null;

  return (
    <div className="space-y-6">
      <BikeForm
        bikeId={bikeId}
        title={messages.bikeForm.edit.title}
        description={messages.bikeForm.edit.description}
        submitLabel={messages.bikeForm.actions.saveChanges}
        initialData={initialData}
        bikePassportId={bikePassportId}
        publicFitState={{
          publicFitCode:
            typeof bike.publicFitCode === "string" ? bike.publicFitCode : null,
          publicFitEnabled: bike.publicFitEnabled === true,
          geometryQuality: bike.publicFitSnapshot?.geometryQuality ?? null,
        }}
        onEnablePublicFitPreview={async () => {
          await assignPublicFitCode({ bikeId: bikeId as Id<"bikes"> });
        }}
        onDisablePublicFitPreview={async () => {
          await revokePublicFitCode({ bikeId: bikeId as Id<"bikes"> });
        }}
        onSubmit={handleUpdate}
        onDelete={handleDelete}
        cancelHref={withLocalePrefix("/bikes", locale)}
      />
      <BikePressureSection bikeId={bike._id} />
    </div>
  );
}
