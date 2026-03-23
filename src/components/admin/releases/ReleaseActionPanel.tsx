"use client";

import { useMemo, useState } from "react";
import { useAction, useMutation, usePaginatedQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import type { Doc, Id } from "../../../../convex/_generated/dataModel";
import { Button, EmptyState, Input, Select, useToast } from "@/components/ui";
import { AdminSectionCard, AdminStatusPill, AdminTable, AdminTableCell, AdminTableHead, AdminTableRow } from "@/components/admin/layout/AdminUi";
import { formatAdminDateTime } from "@/components/admin/shared/admin-format";
import { feedbackPriorityLabel, feedbackPriorityTone, feedbackStatusLabel, feedbackStatusTone, feedbackTypeLabel, feedbackTypeTone } from "@/components/admin/feedback/feedback-ui";
import { ReleaseStatusPill } from "./release-ui";

const notificationTargets = [
  { value: "all", label: "All users" },
  { value: "plan", label: "Plan" },
  { value: "organization", label: "Organization" },
  { value: "locale", label: "Locale" },
  { value: "strava_connected", label: "Strava connected" },
  { value: "fit_completed", label: "Fit completed" },
  { value: "bike_type", label: "Bike type" },
] as const;

function isOpenFeedback(item: Doc<"feedback_items">) {
  return item.status !== "closed" && item.status !== "declined";
}

export function ReleaseActionPanel({
  releaseId,
  releaseStatus,
  linkedFeedbackIds,
}: {
  releaseId: Id<"releases">;
  releaseStatus: Doc<"releases">["status"];
  linkedFeedbackIds: Array<string>;
}) {
  const toast = useToast();
  const linkFeedbackToRelease = useMutation(api.admin.mutations.linkFeedbackToRelease);
  const notifyRelease = useAction(api.admin.actions.notifyRelease);
  const [selectedFeedbackId, setSelectedFeedbackId] = useState("");
  const [targetType, setTargetType] = useState<(typeof notificationTargets)[number]["value"]>("all");
  const [targetValue, setTargetValue] = useState("");
  const [sendToAffectedUsers, setSendToAffectedUsers] = useState(true);
  const [sendGeneralAnnouncement, setSendGeneralAnnouncement] = useState(true);
  const [notificationPending, setNotificationPending] = useState(false);
  const [linkingPending, setLinkingPending] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  const feedbackQuery = usePaginatedQuery(
    api.admin.queries.listFeedbackItems,
    {},
    { initialNumItems: 25 }
  );
  const feedbackRows = feedbackQuery.results.filter(isOpenFeedback);
  const feedbackOptions = useMemo(
    () =>
      feedbackRows
        .filter((item) => !linkedFeedbackIds.includes(String(item._id)))
        .map((item) => ({
          value: String(item._id),
          label: `${item.title} · ${feedbackTypeLabel(item.type)} · ${feedbackStatusLabel(item.status)}`,
        })),
    [feedbackRows, linkedFeedbackIds]
  );

  const handleLinkFeedback = async () => {
    if (!selectedFeedbackId) return;
    setActionError(null);
    setLinkingPending(true);
    try {
      await linkFeedbackToRelease({
        feedbackItemId: selectedFeedbackId as Id<"feedback_items">,
        releaseId,
      });
      toast.success({ description: "Feedback item linked to release." });
      setSelectedFeedbackId("");
    } catch (error) {
      console.error("Failed to link feedback item:", error);
      setActionError(error instanceof Error ? error.message : "Could not link the feedback item.");
    } finally {
      setLinkingPending(false);
    }
  };

  const handleNotifyRelease = async () => {
    setActionError(null);
    setNotificationPending(true);
    try {
      await notifyRelease({
        releaseId,
        sendToAffectedUsers,
        sendGeneralAnnouncement,
        announcementTargets: [
          targetType === "all"
            ? { targetType: "all" }
            : {
                targetType,
                targetValue: targetValue.trim() || undefined,
              },
        ],
      });
      toast.success({ description: "Release notification action submitted." });
    } catch (error) {
      console.error("Failed to notify release:", error);
      setActionError(error instanceof Error ? error.message : "Could not submit notification action.");
    } finally {
      setNotificationPending(false);
    }
  };

  return (
    <div className="space-y-6">
      <AdminSectionCard
        title="Release notifications"
        description="Trigger the release announcement flow and target the users who should see it."
      >
        <div className="space-y-4">
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="flex items-center gap-3 rounded-2xl border border-[color:var(--border)] bg-[color:var(--secondary)] px-4 py-3 text-sm">
              <input
                type="checkbox"
                checked={sendToAffectedUsers}
                onChange={(event) => setSendToAffectedUsers(event.currentTarget.checked)}
              />
              Notify affected users
            </label>
            <label className="flex items-center gap-3 rounded-2xl border border-[color:var(--border)] bg-[color:var(--secondary)] px-4 py-3 text-sm">
              <input
                type="checkbox"
                checked={sendGeneralAnnouncement}
                onChange={(event) => setSendGeneralAnnouncement(event.currentTarget.checked)}
              />
              Send general announcement
            </label>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <Select
              label="Announcement target"
              value={targetType}
              onChange={(event) => setTargetType(event.currentTarget.value as (typeof notificationTargets)[number]["value"])}
              options={notificationTargets.map((option) => ({ value: option.value, label: option.label }))}
            />
            <Input
              label="Target value"
              value={targetValue}
              onChange={(event) => setTargetValue(event.currentTarget.value)}
              placeholder="free, nl, org_123..."
              helperText="Optional unless the chosen target type needs a value."
            />
          </div>
          <div className="flex flex-wrap gap-2">
            <Button
              onClick={() => void handleNotifyRelease()}
              isLoading={notificationPending}
              disabled={!sendToAffectedUsers && !sendGeneralAnnouncement}
            >
              Run notification flow
            </Button>
            <ReleaseStatusPill status={releaseStatus}>
              {releaseStatus.replaceAll("_", " ")}
            </ReleaseStatusPill>
          </div>
        </div>
      </AdminSectionCard>

      <AdminSectionCard
        title="Link feedback"
        description="Attach open feedback items to this release without leaving the release surface."
      >
        <div className="space-y-4">
          <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_auto]">
            <Select
              label="Open feedback item"
              value={selectedFeedbackId}
              onChange={(event) => setSelectedFeedbackId(event.currentTarget.value)}
              options={[
                { value: "", label: "Choose feedback item" },
                ...feedbackOptions,
              ]}
              helperText="Closed and declined items are hidden."
            />
            <div className="flex items-end">
              <Button
                onClick={() => void handleLinkFeedback()}
                disabled={!selectedFeedbackId}
                isLoading={linkingPending}
              >
                Link item
              </Button>
            </div>
          </div>

          {feedbackQuery.status === "LoadingFirstPage" && feedbackRows.length === 0 ? (
            <p className="text-sm text-[color:var(--muted-foreground)]">Loading feedback items...</p>
          ) : feedbackRows.length === 0 ? (
            <EmptyState
              title="No open feedback items"
              description="There are no open feedback items available to link right now."
            />
          ) : (
            <AdminTable>
              <AdminTableHead columns={["Title", "Type", "Status", "Priority", "Reporter", "Created"]} />
              <tbody>
                {feedbackRows.slice(0, 5).map((item) => (
                  <AdminTableRow key={String(item._id)}>
                    <AdminTableCell className="font-medium">
                      <div className="space-y-1">
                        <div>{item.title}</div>
                        <div className="text-xs text-[color:var(--muted-foreground)]">
                          {item.description.slice(0, 80)}
                        </div>
                      </div>
                    </AdminTableCell>
                    <AdminTableCell>
                      <AdminStatusPill tone={feedbackTypeTone(item.type)}>{feedbackTypeLabel(item.type)}</AdminStatusPill>
                    </AdminTableCell>
                    <AdminTableCell>
                      <AdminStatusPill tone={feedbackStatusTone(item.status)}>{feedbackStatusLabel(item.status)}</AdminStatusPill>
                    </AdminTableCell>
                    <AdminTableCell>
                      <AdminStatusPill tone={feedbackPriorityTone(item.priority ?? "normal")}>
                        {feedbackPriorityLabel(item.priority ?? "normal")}
                      </AdminStatusPill>
                    </AdminTableCell>
                    <AdminTableCell>{item.userId ? String(item.userId) : "—"}</AdminTableCell>
                    <AdminTableCell>{formatAdminDateTime(item.createdAt)}</AdminTableCell>
                  </AdminTableRow>
                ))}
              </tbody>
            </AdminTable>
          )}
          {actionError ? <p className="text-sm text-[color:var(--danger)]">{actionError}</p> : null}
        </div>
      </AdminSectionCard>
    </div>
  );
}
