"use client";

import { useMemo, useState } from "react";
import { useMutation } from "convex/react";
import type { Id } from "../../../convex/_generated/dataModel";
import { api } from "../../../convex/_generated/api";
import { Button, Input, NumberInput, Select, useToast } from "@/components/ui";
import { useDashboardMessages } from "@/i18n/useDashboardMessages";

type WheelsetWithSummary = {
  _id: Id<"wheelsets">;
  name: string;
  rimType: "hooked" | "hookless";
  internalRimWidthFrontMm?: number;
  internalRimWidthRearMm?: number;
  isActive?: boolean;
  activeTireSetup?: {
    name: string;
    widthFrontMm: number;
    widthRearMm: number;
  } | null;
};

interface BikeWheelsetManagerProps {
  bikeId: Id<"bikes">;
  wheelsets: WheelsetWithSummary[];
}

export function BikeWheelsetManager({
  bikeId,
  wheelsets,
}: BikeWheelsetManagerProps) {
  const { messages } = useDashboardMessages();
  const toast = useToast();
  const createWheelset = useMutation(api.wheelsets.mutations.create);
  const updateWheelset = useMutation(api.wheelsets.mutations.update);
  const removeWheelset = useMutation(api.wheelsets.mutations.remove);

  const [isAdding, setIsAdding] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isMutatingId, setIsMutatingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [rimType, setRimType] = useState<"hooked" | "hookless">("hooked");
  const [frontWidth, setFrontWidth] = useState<number | null>(null);
  const [rearWidth, setRearWidth] = useState<number | null>(null);

  const validationError = useMemo(() => {
    if (!name.trim()) {
      return messages.pressure.wizard.wheelsetNameRequired;
    }
    return null;
  }, [messages.pressure.wizard.wheelsetNameRequired, name]);

  async function handleCreate() {
    if (validationError) {
      setError(validationError);
      return;
    }

    setError(null);
    setIsSaving(true);
    try {
      await createWheelset({
        bikeId,
        name: name.trim(),
        rimType,
        internalRimWidthFrontMm: frontWidth ?? undefined,
        internalRimWidthRearMm: rearWidth ?? undefined,
        isActive: wheelsets.length === 0,
      });
      setName("");
      setRimType("hooked");
      setFrontWidth(null);
      setRearWidth(null);
      setIsAdding(false);
      toast.success({ description: messages.common.toasts.bikeWheelsetSaved });
    } catch (createError) {
      console.error("Failed to create wheelset:", createError);
      setError(messages.bikeForm.errors.saveFailed);
    } finally {
      setIsSaving(false);
    }
  }

  async function handleSetActive(wheelsetId: Id<"wheelsets">) {
    setIsMutatingId(String(wheelsetId));
    setError(null);
    try {
      await updateWheelset({ wheelsetId, isActive: true });
      toast.success({
        description: messages.common.toasts.bikeWheelsetActivated,
      });
    } catch (updateError) {
      console.error("Failed to activate wheelset:", updateError);
      setError(messages.bikeForm.errors.saveFailed);
    } finally {
      setIsMutatingId(null);
    }
  }

  async function handleRemove(wheelsetId: Id<"wheelsets">) {
    setIsMutatingId(String(wheelsetId));
    setError(null);
    try {
      await removeWheelset({ wheelsetId });
      toast.success({ description: messages.common.toasts.bikeWheelsetRemoved });
    } catch (removeError) {
      console.error("Failed to remove wheelset:", removeError);
      setError(messages.bikeForm.errors.deleteFailed);
    } finally {
      setIsMutatingId(null);
    }
  }

  return (
    <div className="space-y-4">
      {wheelsets.length > 0 ? (
        <div className="grid gap-3">
          {wheelsets.map((wheelset) => (
            <div
              key={wheelset._id}
              className="rounded-[var(--radius-lg)] border border-[color:var(--border)] bg-[color:var(--secondary)]/25 p-4"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-semibold text-[color:var(--foreground)]">
                      {wheelset.name}
                    </p>
                    {wheelset.isActive ? (
                      <span className="rounded-full bg-[color:var(--secondary)] px-2.5 py-1 text-xs font-semibold text-[color:var(--secondary-foreground)]">
                        {messages.bikes.wheelsetManager.activeBadge}
                      </span>
                    ) : null}
                  </div>
                  <p className="text-sm text-[color:var(--muted-foreground)]">
                    {messages.bikes.wheelsetManager.rimType}: {wheelset.rimType}
                  </p>
                  <p className="text-sm text-[color:var(--muted-foreground)]">
                    {messages.bikes.wheelsetManager.frontWidth}: {wheelset.internalRimWidthFrontMm ?? "-"} mm
                    {" · "}
                    {messages.bikes.wheelsetManager.rearWidth}: {wheelset.internalRimWidthRearMm ?? "-"} mm
                  </p>
                  <p className="text-sm text-[color:var(--muted-foreground)]">
                    {messages.bikes.wheelsetManager.tireSetup}:{" "}
                    {wheelset.activeTireSetup
                      ? `${wheelset.activeTireSetup.name} (${wheelset.activeTireSetup.widthFrontMm}/${wheelset.activeTireSetup.widthRearMm} mm)`
                      : messages.bikes.wheelsetManager.noTireSetup}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  {!wheelset.isActive ? (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => void handleSetActive(wheelset._id)}
                      isLoading={isMutatingId === String(wheelset._id)}
                    >
                      {messages.bikes.wheelsetManager.activeAction}
                    </Button>
                  ) : null}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => void handleRemove(wheelset._id)}
                    isLoading={isMutatingId === String(wheelset._id)}
                  >
                    {messages.common.delete}
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="rounded-[var(--radius-lg)] border border-dashed border-[color:var(--border)] bg-[color:var(--secondary)]/20 px-4 py-5">
          <p className="text-sm font-semibold text-[color:var(--foreground)]">
            {messages.bikes.wheelsetManager.emptyTitle}
          </p>
          <p className="mt-1 text-sm text-[color:var(--muted-foreground)]">
            {messages.bikes.wheelsetManager.emptyDescription}
          </p>
        </div>
      )}

      {isAdding ? (
        <div className="rounded-[var(--radius-lg)] border border-[color:var(--border)] bg-[color:var(--secondary)]/15 p-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Input
              label={messages.pressure.wizard.wheelsetName}
              value={name}
              onChange={(event) => setName(event.target.value)}
              error={error ?? undefined}
            />
            <Select
              label={messages.bikes.wheelsetManager.rimType}
              value={rimType}
              onChange={(event) =>
                setRimType(event.target.value as "hooked" | "hookless")
              }
              options={[
                { value: "hooked", label: "hooked" },
                { value: "hookless", label: "hookless" },
              ]}
            />
            <NumberInput
              label={messages.bikes.wheelsetManager.frontWidth}
              value={frontWidth}
              min={10}
              max={60}
              onChange={setFrontWidth}
              unit="mm"
            />
            <NumberInput
              label={messages.bikes.wheelsetManager.rearWidth}
              value={rearWidth}
              min={10}
              max={60}
              onChange={setRearWidth}
              unit="mm"
            />
          </div>
          <div className="mt-4 flex flex-wrap gap-3">
            <Button size="sm" onClick={() => void handleCreate()} isLoading={isSaving}>
              {messages.bikes.wheelsetManager.save}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setIsAdding(false);
                setError(null);
              }}
              disabled={isSaving}
            >
              {messages.bikes.wheelsetManager.cancelAdd}
            </Button>
          </div>
        </div>
      ) : (
        <Button variant="outline" size="sm" onClick={() => setIsAdding(true)}>
          {messages.bikes.wheelsetManager.add}
        </Button>
      )}
    </div>
  );
}
