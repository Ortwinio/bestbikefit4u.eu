"use client";

import { useRouter } from "next/navigation";
import { useMutation } from "convex/react";
import { api } from "../../../../../convex/_generated/api";
import { BikeForm, type BikeFormPayload } from "@/components/bikes";

export default function NewBikePage() {
  const router = useRouter();
  const createBike = useMutation(api.bikes.mutations.create);

  const handleCreate = async (payload: BikeFormPayload) => {
    await createBike(payload);
    router.push("/bikes");
  };

  return (
    <BikeForm
      title="Add New Bike"
      description="Save your bike geometry and current setup for better fit comparisons."
      submitLabel="Save Bike"
      onSubmit={handleCreate}
      cancelHref="/bikes"
    />
  );
}
