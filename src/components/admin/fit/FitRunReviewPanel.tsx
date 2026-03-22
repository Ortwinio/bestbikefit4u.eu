"use client";

import { useEffect, useState } from "react";
import { useMutation } from "convex/react";
import { useRouter } from "next/navigation";
import { api } from "../../../../convex/_generated/api";
import type { Id } from "../../../../convex/_generated/dataModel";
import { Button, Textarea, useToast } from "@/components/ui";
import { AdminStatusPill } from "@/components/admin/layout/AdminUi";
import { reviewStatusTone } from "./fit-ui";
import type { FitReviewStatus } from "./data";

export function FitRunReviewPanel({
  sessionId,
  reviewStatus,
  initialNotes,
}: {
  sessionId: Id<"fitSessions">;
  reviewStatus: FitReviewStatus | undefined;
  initialNotes?: string | null;
}) {
  const router = useRouter();
  const toast = useToast();
  const markReviewed = useMutation(api.admin.mutations.markFitRunReviewed);
  const [notes, setNotes] = useState(initialNotes ?? "");
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setNotes(initialNotes ?? "");
  }, [initialNotes]);

  const handleSave = async () => {
    setError(null);
    setIsSaving(true);
    try {
      await markReviewed({
        sessionId,
        reviewNotes: notes.trim() || undefined,
      });
      router.refresh();
      toast.success({ description: "Fit run marked as reviewed." });
    } catch (mutationError) {
      console.error("Failed to mark fit run as reviewed:", mutationError);
      setError("Could not save the review note.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm text-[color:var(--muted-foreground)]">
          Update the review note and persist the reviewed state in Convex.
        </p>
        <AdminStatusPill tone={reviewStatusTone(reviewStatus ?? "not_required")}>
          {reviewStatus ?? "not_required"}
        </AdminStatusPill>
      </div>
      <Textarea
        rows={4}
        value={notes}
        onChange={(event) => {
          setError(null);
          setNotes(event.target.value);
        }}
        placeholder="Add review notes, override context, or a summary of the final decision."
      />
      {error ? <p className="text-sm text-[color:var(--danger)]">{error}</p> : null}
      <div className="flex flex-wrap gap-2">
        <Button onClick={() => void handleSave()} isLoading={isSaving}>
          Mark reviewed
        </Button>
      </div>
    </div>
  );
}
