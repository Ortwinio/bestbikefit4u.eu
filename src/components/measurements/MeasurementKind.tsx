"use client";

import { useFormContext } from "react-hook-form";
import { Select } from "@/components/ui";
import { useDashboardMessages } from "@/i18n/useDashboardMessages";
import { usabilityFormsCopy } from "@/i18n/account/usabilityForms";
import type { WizardFormData } from "@/lib/validations/measurementWizard";

export function MeasurementKind({ field, label }: {
  field: keyof NonNullable<WizardFormData["measurementKinds"]>; label: string;
}) {
  const { locale } = useDashboardMessages();
  const copy = usabilityFormsCopy[locale];
  const { watch, setValue } = useFormContext<WizardFormData>();
  const path = `measurementKinds.${field}` as const;
  return <div data-usability="measurement-kind">
    <Select label={`${label}: ${copy.method}`} value={watch(path) ?? "measured"} tooltip={copy.methodHelp} tooltipLabel={copy.method}
      options={[{ value: "measured", label: copy.measured }, { value: "estimated", label: copy.estimated }]}
      onChange={event => setValue(path, event.target.value as "measured" | "estimated", { shouldDirty: true })} />
  </div>;
}
