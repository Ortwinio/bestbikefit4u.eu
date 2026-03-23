"use client";

import { useState } from "react";
import { useMutation } from "convex/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { api } from "../../../../convex/_generated/api";
import { Button, Card, CardContent, CardDescription, CardHeader, CardTitle, Input, Select, Textarea, useToast } from "@/components/ui";
import { releaseTypeLabel, releaseTypeTone } from "./release-ui";
import { AdminStatusPill } from "@/components/admin/layout/AdminUi";

const releaseTypeOptions = [
  { value: "app", label: "App" },
  { value: "fit_engine", label: "Fit engine" },
  { value: "geometry_data", label: "Geometry data" },
  { value: "content", label: "Content" },
  { value: "integration", label: "Integration" },
  { value: "internal", label: "Internal" },
] as const;

function fromDateTimeLocalValue(value: string) {
  if (!value) return undefined;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? undefined : date.getTime();
}

export function ReleaseCreateCard() {
  const router = useRouter();
  const toast = useToast();
  const createRelease = useMutation(api.admin.mutations.createRelease);
  const [name, setName] = useState("");
  const [type, setType] = useState<(typeof releaseTypeOptions)[number]["value"]>("app");
  const [versionLabel, setVersionLabel] = useState("");
  const [description, setDescription] = useState("");
  const [rolloutDate, setRolloutDate] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCreate = async () => {
    setError(null);
    setIsSaving(true);
    try {
      const releaseId = await createRelease({
        name: name.trim(),
        type,
        versionLabel: versionLabel.trim() || undefined,
        description: description.trim() || undefined,
        rolloutDate: fromDateTimeLocalValue(rolloutDate),
      });
      toast.success({ description: "Release draft created." });
      router.push(`/admin/releases/${String(releaseId)}`);
      router.refresh();
    } catch (mutationError) {
      console.error("Failed to create release:", mutationError);
      setError(mutationError instanceof Error ? mutationError.message : "Could not create the release.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Card className="border-[color:var(--border)] bg-[color:color-mix(in_oklch,var(--card)_94%,var(--background)_6%)]">
      <CardHeader className="space-y-2">
        <div className="flex items-center justify-between gap-3">
          <CardTitle className="text-base">New release</CardTitle>
          <AdminStatusPill tone={releaseTypeTone(type)}>{releaseTypeLabel(type)}</AdminStatusPill>
        </div>
        <CardDescription>
          Create a live Convex release record, then move it through QA and rollout from the detail page.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Input
          label="Name"
          value={name}
          onChange={(event) => setName(event.currentTarget.value)}
          placeholder="Fit Engine v2.7.0"
          required
        />
        <div className="grid gap-3 sm:grid-cols-2">
          <Select
            label="Type"
            value={type}
            onChange={(event) => setType(event.currentTarget.value as (typeof releaseTypeOptions)[number]["value"])}
            options={releaseTypeOptions.map((option) => ({
              value: option.value,
              label: option.label,
            }))}
          />
          <Input
            label="Version label"
            value={versionLabel}
            onChange={(event) => setVersionLabel(event.currentTarget.value)}
            placeholder="v2.7.0"
          />
        </div>
        <Textarea
          label="Description"
          value={description}
          onChange={(event) => setDescription(event.currentTarget.value)}
          rows={4}
          placeholder="Short release summary for ops and support."
        />
        <Input
          label="Rollout date"
          type="datetime-local"
          value={rolloutDate}
          onChange={(event) => setRolloutDate(event.currentTarget.value)}
          helperText="Optional. This sets the initial rollout window."
        />
        {error ? <p className="text-sm text-[color:var(--danger)]">{error}</p> : null}
        <div className="flex flex-wrap gap-2">
          <Button
            onClick={() => void handleCreate()}
            isLoading={isSaving}
            disabled={!name.trim()}
          >
            Create release
          </Button>
          <Button variant="outline" render={<Link href="/admin/releases/calendar" />}>
            View calendar
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
