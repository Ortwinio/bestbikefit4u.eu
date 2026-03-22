"use client";

import { useState } from "react";
import { useMutation } from "convex/react";
import { useRouter } from "next/navigation";
import { api } from "../../../../convex/_generated/api";
import type { Id } from "../../../../convex/_generated/dataModel";
import { Button, useToast } from "@/components/ui";
import type { ReleaseWorkflowStatus } from "./release-ui";

const statusButtons: Array<{ value: ReleaseWorkflowStatus; label: string }> = [
  { value: "draft", label: "Set draft" },
  { value: "in_qa", label: "Move to QA" },
  { value: "approved", label: "Approve" },
  { value: "scheduled", label: "Schedule" },
  { value: "rolling_out", label: "Start rollout" },
  { value: "live", label: "Mark live" },
  { value: "rolled_back", label: "Roll back" },
  { value: "archived", label: "Archive" },
];

export function ReleaseStatusControls({
  releaseId,
  currentStatus,
}: {
  releaseId: Id<"releases">;
  currentStatus: ReleaseWorkflowStatus;
}) {
  const router = useRouter();
  const toast = useToast();
  const updateStatus = useMutation(api.admin.mutations.updateReleaseStatus);
  const [pendingStatus, setPendingStatus] = useState<ReleaseWorkflowStatus | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleChange = async (status: ReleaseWorkflowStatus) => {
    setError(null);
    setPendingStatus(status);
    try {
      if (status === "archived") {
        await updateStatus({ releaseId, status: "archived" });
      } else {
        await updateStatus({ releaseId, status });
      }
      router.refresh();
      toast.success({
        description: `Release moved to ${status.replaceAll("_", " ")}.`,
      });
    } catch (mutationError) {
      console.error("Failed to update release status:", mutationError);
      setError("Could not update the release status.");
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
      {error ? <p className="text-sm text-[color:var(--danger)]">{error}</p> : null}
    </div>
  );
}
