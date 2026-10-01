"use client";

import { useState } from "react";
import { useMutation } from "convex/react";
import type { Id } from "../../../convex/_generated/dataModel";
import { api } from "../../../convex/_generated/api";
import { AutosaveField, AutosaveStatus, Textarea, useAutosave } from "@/components/ui";
import { autosaveMessages } from "@/i18n/account/autosave";
import { getBikesAutosaveCopy } from "@/i18n/account/bikesAutosave";
import { useDashboardMessages } from "@/i18n/useDashboardMessages";

type Props = { bikeId: Id<"bikes">; initialNotes?: string };
export function BikeNotesEditor(props: Props) {
  return <Notes key={props.bikeId} {...props} />;
}
function Notes({ bikeId, initialNotes }: Props) {
  const { locale, messages } = useDashboardMessages();
  const copy = getBikesAutosaveCopy(locale);
  const update = useMutation(api.bikes.mutations.update);
  const [value, setValue] = useState(initialNotes ?? "");
  const autosave = useAutosave({
    value,
    debounceMs: 800,
    validate: (next) => (next.length > 500 ? copy.length : null),
    onSave: async (next) => {
      await update({ bikeId, notes: next.trim() });
    },
  });
  return (
    <AutosaveField flush={autosave.flush} className="space-y-3">
      <Textarea
        label={messages.bikeForm.fields.notes.label}
        aria-label={messages.bikeForm.fields.notes.label}
        value={value}
        onChange={(event) => setValue(event.target.value)}
        maxLength={500}
        placeholder={messages.bikeForm.fields.notes.placeholder}
        helperText={`${messages.bikeForm.fields.notes.helper} ${value.length}/500`}
      />
      <AutosaveStatus {...autosave} messages={autosaveMessages[locale]} onRetry={autosave.retry} />
    </AutosaveField>
  );
}
