"use client";

import { useMutation } from "convex/react";
import type { Doc, Id } from "../../../convex/_generated/dataModel";
import { api } from "../../../convex/_generated/api";
import { BikeForm, type BikeAutosavePayload } from "./BikeForm";
import { useDashboardMessages } from "@/i18n/useDashboardMessages";
import { getBikesAutosaveCopy } from "@/i18n/account/bikesAutosave";

export function BikeSettingsEditor({ bike, embedded = false }: { bike: Doc<"bikes">; embedded?: boolean }) {
  const { locale } = useDashboardMessages();
  const copy = getBikesAutosaveCopy(locale);
  const update = useMutation(api.bikes.mutations.update);
  const enable = useMutation(api.bikes.mutations.assignPublicFitCode);
  const disable = useMutation(api.bikes.mutations.revokePublicFitCode);
  async function save(payload: BikeAutosavePayload) {
    const { geometryRecordId, ...values } = payload;
    await update({
      bikeId: bike._id,
      ...values,
      ...(geometryRecordId !== undefined
        ? { geometryRecordId: geometryRecordId as Id<"geometry_records"> | null }
        : {}),
    });
  }
  return (
    <div id="bike-settings">
      <BikeForm
        key={bike._id}
        bikeId={bike._id}
        title={copy.title}
        description={copy.intro}
        submitLabel=""
        embedded={embedded}
        initialData={bike}
        bikePassportId={bike.bikePassportId}
        publicFitState={{
          publicFitCode: bike.publicFitCode ?? null,
          publicFitEnabled: bike.publicFitEnabled === true,
          geometryQuality: bike.publicFitSnapshot?.geometryQuality ?? null,
        }}
        onEnablePublicFitPreview={async () => {
          await enable({ bikeId: bike._id });
        }}
        onDisablePublicFitPreview={async () => {
          await disable({ bikeId: bike._id });
        }}
        onAutosave={save}
      />
    </div>
  );
}
