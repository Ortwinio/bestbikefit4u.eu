"use client";

import { useEffect, useState } from "react";
import { useMutation } from "convex/react";
import type { Id } from "../../../convex/_generated/dataModel";
import { api } from "../../../convex/_generated/api";
import { Button, Textarea, useToast } from "@/components/ui";
import { useDashboardMessages } from "@/i18n/useDashboardMessages";

interface BikeNotesEditorProps {
  bikeId: Id<"bikes">;
  initialNotes?: string;
}

export function BikeNotesEditor({
  bikeId,
  initialNotes,
}: BikeNotesEditorProps) {
  const { messages } = useDashboardMessages();
  const toast = useToast();
  const updateBike = useMutation(api.bikes.mutations.update);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [value, setValue] = useState(initialNotes ?? "");
  const [savedValue, setSavedValue] = useState(initialNotes ?? "");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const nextValue = initialNotes ?? "";
    setValue(nextValue);
    setSavedValue(nextValue);
  }, [initialNotes]);

  const handleSave = async () => {
    setError(null);
    setIsSaving(true);
    try {
      const nextValue = value.trim();
      await updateBike({
        bikeId,
        notes: nextValue || undefined,
      });
      setSavedValue(nextValue);
      setValue(nextValue);
      setIsEditing(false);
      toast.success({ description: messages.common.toasts.bikeNotesSaved });
    } catch (saveError) {
      console.error("Failed to save bike notes:", saveError);
      setError(messages.bikeForm.errors.saveFailed);
    } finally {
      setIsSaving(false);
    }
  };

  if (!isEditing) {
    return (
      <div className="space-y-3">
        <p className="whitespace-pre-wrap text-sm text-gray-700">
          {savedValue || messages.bikeForm.fields.notes.placeholder}
        </p>
        <Button variant="outline" size="sm" onClick={() => setIsEditing(true)}>
          {messages.bikeForm.actions.editNotes}
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <Textarea
        label={messages.bikeForm.fields.notes.label}
        value={value}
        onChange={(event) => setValue(event.target.value.slice(0, 500))}
        placeholder={messages.bikeForm.fields.notes.placeholder}
        helperText={`${messages.bikeForm.fields.notes.helper} ${value.length}/500`}
      />
      {error ? <p className="text-sm text-[color:var(--danger)]">{error}</p> : null}
      <div className="flex flex-wrap gap-3">
        <Button size="sm" onClick={() => void handleSave()} isLoading={isSaving}>
          {messages.bikeForm.actions.saveNotes}
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            setValue(savedValue);
            setIsEditing(false);
            setError(null);
          }}
          disabled={isSaving}
        >
          {messages.common.cancel}
        </Button>
      </div>
    </div>
  );
}
