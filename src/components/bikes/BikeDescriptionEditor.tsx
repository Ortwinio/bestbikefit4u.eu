"use client";

import { useEffect, useMemo, useState } from "react";
import { useAction, useMutation } from "convex/react";
import type { Id } from "../../../convex/_generated/dataModel";
import { api } from "../../../convex/_generated/api";
import { Button, Textarea, useToast } from "@/components/ui";
import { useDashboardMessages } from "@/i18n/useDashboardMessages";

interface BikeDescriptionEditorProps {
  bikeId: Id<"bikes">;
  initialDescription?: string;
  initialSource?: "manual" | "generated" | "template";
}

export function BikeDescriptionEditor({
  bikeId,
  initialDescription,
  initialSource,
}: BikeDescriptionEditorProps) {
  const { locale, messages } = useDashboardMessages();
  const toast = useToast();
  const updateBike = useMutation(api.bikes.mutations.update);
  const generateDescription = useAction(api.bikes.actions.generateDescription);
  const [value, setValue] = useState(initialDescription ?? "");
  const [savedValue, setSavedValue] = useState(initialDescription ?? "");
  const [savedSource, setSavedSource] = useState(initialSource ?? "manual");
  const [isEditing, setIsEditing] = useState(!initialDescription);
  const [isSaving, setIsSaving] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const nextDescription = initialDescription ?? "";
    setValue(nextDescription);
    setSavedValue(nextDescription);
    setSavedSource(initialSource ?? "manual");
    setIsEditing(!nextDescription);
  }, [initialDescription, initialSource]);

  const sourceLabel = useMemo(() => {
    if (savedSource === "generated") {
      return messages.bikes.descriptionCard.sourceGenerated;
    }
    if (savedSource === "template") {
      return messages.bikes.descriptionCard.sourceTemplate;
    }
    return messages.bikes.descriptionCard.sourceManual;
  }, [messages.bikes.descriptionCard, savedSource]);

  async function handleSave() {
    setError(null);
    setIsSaving(true);

    try {
      const nextValue = value.trim();
      await updateBike({
        bikeId,
        description: nextValue || undefined,
        descriptionSource: "manual",
      });
      setSavedValue(nextValue);
      setSavedSource("manual");
      setValue(nextValue);
      setIsEditing(false);
      toast.success({ description: messages.common.toasts.bikeDescriptionSaved });
    } catch (saveError) {
      console.error("Failed to save bike description:", saveError);
      setError(messages.bikeForm.errors.saveFailed);
    } finally {
      setIsSaving(false);
    }
  }

  async function handleGenerate() {
    setError(null);
    setIsGenerating(true);

    try {
      const result = await generateDescription({
        bikeId,
        locale: locale === "nl" ? "nl" : "en",
      });
      setSavedValue(result.description);
      setSavedSource(result.source);
      setValue(result.description);
      setIsEditing(true);
      toast.success({ description: messages.common.toasts.bikeDescriptionGenerated });
    } catch (generationError) {
      console.error("Failed to generate bike description:", generationError);
      setError(messages.bikeForm.errors.saveFailed);
    } finally {
      setIsGenerating(false);
    }
  }

  if (!isEditing) {
    return (
      <div className="space-y-4">
        {savedValue ? (
          <>
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-full bg-[color:var(--secondary)] px-2.5 py-1 text-xs font-semibold text-[color:var(--secondary-foreground)]">
                {sourceLabel}
              </span>
            </div>
            <p className="whitespace-pre-wrap text-sm leading-6 text-[color:var(--foreground)]">
              {savedValue}
            </p>
          </>
        ) : (
          <p className="text-sm text-[color:var(--muted-foreground)]">
            {messages.bikes.descriptionCard.empty}
          </p>
        )}
        <p className="text-xs text-[color:var(--muted-foreground)]">
          {messages.bikes.descriptionCard.disclaimer}
        </p>
        <div className="flex flex-wrap gap-3">
          <Button variant="outline" size="sm" onClick={() => setIsEditing(true)}>
            {messages.bikes.descriptionCard.edit}
          </Button>
          <Button size="sm" onClick={() => void handleGenerate()} isLoading={isGenerating}>
            {savedValue
              ? messages.bikes.descriptionCard.regenerate
              : messages.bikes.descriptionCard.generate}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <Textarea
        label={messages.bikes.descriptionCard.title}
        value={value}
        rows={5}
        onChange={(event) => {
          setError(null);
          setValue(event.target.value.slice(0, 420));
        }}
        placeholder={messages.bikes.descriptionCard.placeholder}
        helperText={`${messages.bikes.descriptionCard.helper} ${value.length}/420`}
        error={error ?? undefined}
      />
      <p className="text-xs text-[color:var(--muted-foreground)]">
        {messages.bikes.descriptionCard.disclaimer}
      </p>
      <div className="flex flex-wrap gap-3">
        <Button size="sm" onClick={() => void handleSave()} isLoading={isSaving}>
          {messages.bikes.descriptionCard.save}
        </Button>
        <Button variant="outline" size="sm" onClick={() => void handleGenerate()} isLoading={isGenerating}>
          {savedValue
            ? messages.bikes.descriptionCard.regenerate
            : messages.bikes.descriptionCard.generate}
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            setValue(savedValue);
            setError(null);
            setIsEditing(Boolean(savedValue));
          }}
          disabled={isSaving || isGenerating}
        >
          {messages.common.cancel}
        </Button>
      </div>
    </div>
  );
}
