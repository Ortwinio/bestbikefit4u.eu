"use client";

import { useState } from "react";
import { useMutation } from "convex/react";
import { useRouter } from "next/navigation";
import { api } from "../../../../convex/_generated/api";
import type { Id } from "../../../../convex/_generated/dataModel";
import { Button, useToast } from "@/components/ui";
import type { EngineVersionStatus } from "./data";

const statusButtons: Array<{ value: EngineVersionStatus; label: string }> = [
  { value: "draft", label: "Set draft" },
  { value: "qa", label: "Move to QA" },
  { value: "active", label: "Activate" },
  { value: "deprecated", label: "Deprecate" },
];

export function FitEngineStatusControls({
  versionId,
  currentStatus,
}: {
  versionId: Id<"engine_versions">;
  currentStatus: EngineVersionStatus;
}) {
  const router = useRouter();
  const toast = useToast();
  const updateStatus = useMutation(api.admin.mutations.updateEngineVersionStatus);
  const [pendingStatus, setPendingStatus] = useState<EngineVersionStatus | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleChange = async (status: EngineVersionStatus) => {
    setError(null);
    setPendingStatus(status);
    try {
      await updateStatus({ versionId, status });
      router.refresh();
      toast.success({
        description: `Engine version moved to ${status.replaceAll("_", " ")}.`,
      });
    } catch (mutationError) {
      console.error("Failed to update engine version status:", mutationError);
      setError("Could not update the engine version status.");
    } finally {
      setPendingStatus(null);
    }
  };

  return (
    <div className="space-y-3">
      <div className="grid gap-2 sm:grid-cols-2">
        {statusButtons.map((button) => (
          <Button
            key={button.value}
            variant={button.value === currentStatus ? "primary" : "outline"}
            size="sm"
            onClick={() => void handleChange(button.value)}
            isLoading={pendingStatus === button.value}
            disabled={pendingStatus !== null && pendingStatus !== button.value}
          >
            {button.label}
          </Button>
        ))}
      </div>
      {error ? (
        <p className="text-sm text-[color:var(--danger)]">{error}</p>
      ) : null}
    </div>
  );
}
