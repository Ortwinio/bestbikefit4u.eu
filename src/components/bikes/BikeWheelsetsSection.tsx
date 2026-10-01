"use client";
import { useQuery } from "convex/react";
import type { Id } from "../../../convex/_generated/dataModel";
import { api } from "../../../convex/_generated/api";
import { BikeWheelsetManager } from "./BikeWheelsetManager";
import { getBikesAutosaveCopy } from "@/i18n/account/bikesAutosave";
import { useDashboardMessages } from "@/i18n/useDashboardMessages";
import { LoadingState } from "@/components/ui";
export function BikeWheelsetsSection({ bikeId }: { bikeId: Id<"bikes"> }) {
  const { locale } = useDashboardMessages();
  const copy = getBikesAutosaveCopy(locale);
  const detail = useQuery(api.bikes.queries.getDetail, { bikeId });
  if (detail === undefined) return <LoadingState />;
  if (!detail) return null;
  return (
    <section id="wheelsets" className="space-y-4">
      <h2 className="font-display text-2xl font-bold">{copy.wheelset}</h2>
      <BikeWheelsetManager key={bikeId} bikeId={bikeId} wheelsets={detail.wheelsets} />
    </section>
  );
}
