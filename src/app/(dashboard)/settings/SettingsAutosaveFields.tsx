"use client";

import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { AutosaveField, AutosaveStatus, Input, RadioGroup, Selectable, useAutosave } from "@/components/ui";
import { autosaveMessages } from "@/i18n/account/autosave";
import { useDashboardMessages } from "@/i18n/useDashboardMessages";

export function SettingsNameField({ initialValue }: { initialValue: string }) {
  const { locale, messages } = useDashboardMessages();
  const [value, setValue] = useState(initialValue);
  const update = useMutation(api.users.mutations.updateProfile);
  const autosave = useAutosave({
    value: value.trim(),
    onSave: async (displayName) => { await update({ displayName }); },
  });
  return (
    <AutosaveField flush={autosave.flush} className="space-y-3">
      <Input label={messages.settings.account.displayNameLabel}
        placeholder={messages.settings.account.displayNamePlaceholder}
        value={value} onChange={(event) => setValue(event.target.value)} />
      <AutosaveStatus {...autosave} messages={autosaveMessages[locale]} onRetry={autosave.retry} />
    </AutosaveField>
  );
}

export function SettingsUnitsField({ initialValue }: { initialValue: "metric" | "imperial" }) {
  const { locale, messages } = useDashboardMessages();
  const copy = messages.settings.preferences;
  const [value, setValue] = useState(initialValue);
  const update = useMutation(api.users.mutations.updateProfile);
  const autosave = useAutosave({
    value, debounceMs: 500,
    onSave: async (unit_preference) => { await update({ unit_preference }); },
  });
  return (
    <AutosaveField flush={autosave.flush} commitOn="release" className="space-y-3">
      <RadioGroup aria-label={copy.units} className="flex flex-wrap gap-2" value={value}
        onValueChange={(next) => setValue(next as "metric" | "imperial")}>
        {(["metric", "imperial"] as const).map((unit) => (
          <Selectable key={unit} mode="radio" value={unit}>{copy[unit]}</Selectable>
        ))}
      </RadioGroup>
      <AutosaveStatus {...autosave} messages={autosaveMessages[locale]} onRetry={autosave.retry} />
    </AutosaveField>
  );
}
