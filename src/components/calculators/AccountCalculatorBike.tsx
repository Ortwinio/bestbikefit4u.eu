"use client";
import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Select } from "@/components/ui";
import type { Locale } from "@/i18n/config";
import { calculatorChainMessages } from "@/i18n/account/calculatorChain";

export function useAccountCalculatorBike() {
  const params = useSearchParams();
  const bikes = useQuery(api.bikes.queries.list, {});
  const [selected, setSelected] = useState<string | null>(null);
  const requested = selected ?? params?.get("bikeId") ?? "";
  const bikeId = bikes?.find((bike) => bike._id === requested)?._id;
  return { bikes: bikes ?? [], bikeId, setSelected, ready: bikes !== undefined };
}
export function AccountCalculatorBike({ selection, locale }: {
  selection: ReturnType<typeof useAccountCalculatorBike>;
  locale: Locale;
}) {
  const copy = calculatorChainMessages[locale];
  if (!selection.bikes.length) return null;
  return <div className="mx-auto max-w-[1440px] px-4 pt-6 sm:px-8 xl:px-16">
    <Select label={copy.selectBike} tooltip={copy.selectBike} value={selection.bikeId ?? ""}
      options={[{ value: "", label: copy.noBike }, ...selection.bikes.map((bike) =>
        ({ value: bike._id, label: bike.name }))]}
      onChange={(event) => selection.setSelected(event.target.value)} />
  </div>;
}
