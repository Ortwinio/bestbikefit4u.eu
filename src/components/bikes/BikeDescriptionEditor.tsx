"use client";

import { useRef, useState } from "react";
import { useAction, useMutation } from "convex/react";
import type { Id } from "../../../convex/_generated/dataModel";
import { api } from "../../../convex/_generated/api";
import { AutosaveField, AutosaveStatus, Button, Textarea, useAutosave } from "@/components/ui";
import { autosaveMessages } from "@/i18n/account/autosave";
import { getBikesAutosaveCopy } from "@/i18n/account/bikesAutosave";
import { useDashboardMessages } from "@/i18n/useDashboardMessages";

type Props = {
  bikeId: Id<"bikes">;
  initialDescription?: string;
  initialSource?: "manual" | "generated" | "template" | "marketplace_import";
};
export function BikeDescriptionEditor(props: Props) {
  return <Description key={props.bikeId} {...props} />;
}
function Description({ bikeId, initialDescription, initialSource }: Props) {
  const { locale, messages } = useDashboardMessages();
  const copy = getBikesAutosaveCopy(locale);
  const update = useMutation(api.bikes.mutations.update);
  const generate = useAction(api.bikes.actions.generateDescription);
  const [value, setValue] = useState(initialDescription ?? "");
  const [source, setSource] = useState(initialSource ?? "manual");
  const [generating, setGenerating] = useState(false);
  const [generationError, setGenerationError] = useState(false);
  const acknowledged = useRef(value);
  const saveFailed = useRef(false);
  const autosave = useAutosave({
    value,
    debounceMs: 800,
    validate: (next) => (next.length > 420 ? copy.length : null),
    onSave: async (next) => {
      if (next === acknowledged.current) return;
      try {
        await update({ bikeId, description: next.trim(), descriptionSource: "manual" });
        acknowledged.current = next;
        saveFailed.current = false;
        setSource("manual");
      } catch (error) {
        saveFailed.current = true;
        throw error;
      }
    },
  });
  async function handleGenerate() {
    setGenerating(true);
    setGenerationError(false);
    try {
      await autosave.flush();
      if (saveFailed.current || value.length > 420) return;
      const result = await generate({ bikeId, locale });
      // The action already persisted this exact result; don't overwrite its source with a manual save.
      acknowledged.current = result.description;
      setValue(result.description);
      setSource(result.source);
    } catch {
      setGenerationError(true);
    } finally {
      setGenerating(false);
    }
  }
  const sourceLabel =
    source === "generated"
      ? messages.bikes.descriptionCard.sourceGenerated
      : source === "template"
        ? messages.bikes.descriptionCard.sourceTemplate
        : messages.bikes.descriptionCard.sourceManual;
  return (
    <AutosaveField flush={autosave.flush} className="space-y-4">
      <p className="text-xs text-muted-foreground">{sourceLabel}</p>
      <Textarea
        label={messages.bikes.descriptionCard.title}
        aria-label={messages.bikes.descriptionCard.title}
        value={value}
        rows={5}
        maxLength={420}
        disabled={generating}
        onChange={(event) => setValue(event.target.value)}
        placeholder={messages.bikes.descriptionCard.placeholder}
        helperText={`${messages.bikes.descriptionCard.helper} ${value.length}/420`}
      />
      <AutosaveStatus {...autosave} messages={autosaveMessages[locale]} onRetry={autosave.retry} />
      {generationError && (
        <p role="alert" className="text-sm text-destructive-text">
          {copy.generationFailed}
        </p>
      )}
      <p className="text-xs text-muted-foreground">{messages.bikes.descriptionCard.disclaimer}</p>
      <Button
        variant="outline"
        onClick={() => void handleGenerate()}
        isLoading={generating}
        disabled={autosave.state === "error" || autosave.state === "invalid"}
      >
        {value ? messages.bikes.descriptionCard.regenerate : messages.bikes.descriptionCard.generate}
      </Button>
    </AutosaveField>
  );
}
