"use client";

import { useRouter } from "next/navigation";
import { useMutation } from "convex/react";
import { api } from "../../../../../convex/_generated/api";
import { BikeForm, type BikeFormPayload } from "@/components/bikes";
import { withLocalePrefix } from "@/i18n/navigation";
import { useDashboardMessages } from "@/i18n/useDashboardMessages";

export default function NewBikePage() {
  const router = useRouter();
  const { locale, messages } = useDashboardMessages();
  const createBike = useMutation(api.bikes.mutations.create);

  const handleCreate = async (payload: BikeFormPayload) => {
    await createBike(payload);
    router.push(withLocalePrefix("/bikes", locale));
  };

  return (
    <BikeForm
      title={messages.bikeForm.new.title}
      description={messages.bikeForm.new.description}
      submitLabel={messages.bikeForm.actions.save}
      onSubmit={handleCreate}
      cancelHref={withLocalePrefix("/bikes", locale)}
    />
  );
}
