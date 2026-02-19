"use client";

import { useMemo } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useMutation } from "convex/react";
import { api } from "../../../../../convex/_generated/api";
import { BikeForm, type BikeFormPayload } from "@/components/bikes";
import { DEFAULT_LOCALE } from "@/i18n/config";
import { extractLocaleFromPathname, withLocalePrefix } from "@/i18n/navigation";

export default function NewBikePage() {
  const router = useRouter();
  const pathname = usePathname();
  const locale = useMemo(
    () => extractLocaleFromPathname(pathname ?? "") ?? DEFAULT_LOCALE,
    [pathname]
  );
  const createBike = useMutation(api.bikes.mutations.create);

  const handleCreate = async (payload: BikeFormPayload) => {
    await createBike(payload);
    router.push(withLocalePrefix("/bikes", locale));
  };

  return (
    <BikeForm
      title="Add New Bike"
      description="Save your bike geometry and current setup for better fit comparisons."
      submitLabel="Save Bike"
      onSubmit={handleCreate}
      cancelHref={withLocalePrefix("/bikes", locale)}
    />
  );
}
