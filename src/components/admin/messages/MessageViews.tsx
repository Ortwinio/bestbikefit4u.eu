"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import { useMutation, useQuery } from "convex/react";
import { useRouter } from "next/navigation";
import { api } from "@/../convex/_generated/api";
import type { Id } from "@/../convex/_generated/dataModel";
import {
  AccessibleDialog,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  EmptyState,
  Input,
  Select,
  SegmentedControl,
  SegmentedControlItem,
  Textarea,
  useToast,
} from "@/components/ui";
import {
  AdminSectionCard,
  AdminStatusPill,
  AdminTable,
  AdminTableCell,
  AdminTableHead,
  AdminTableRow,
} from "@/components/admin/layout/AdminUi";
import type {
  MessageComposeData,
  MessageDetailData,
  MessageDetailRecord,
  MessageInboxRow,
} from "./message-data";
import {
  messagePriorityLabel,
  messagePriorityTone,
  messageStatusLabel,
  messageStatusTone,
  messageTypeLabel,
  messageTypeTone,
  type DashboardMessagePriority,
  type DashboardMessageStatus,
  type DashboardMessageType,
} from "./message-ui";
import { formatAdminDate, formatAdminDateTime, getAdminDisplayName } from "../shared/admin-format";

const statusOptions: Array<{ value: "all" | DashboardMessageStatus; label: string }> = [
  { value: "all", label: "All statuses" },
  { value: "draft", label: "Draft" },
  { value: "scheduled", label: "Scheduled" },
  { value: "published", label: "Published" },
  { value: "paused", label: "Paused" },
  { value: "expired", label: "Expired" },
];

const typeOptions: Array<{ value: DashboardMessageType; label: string }> = [
  { value: "banner", label: "Banner" },
  { value: "inbox_card", label: "Inbox card" },
  { value: "sticky_warning", label: "Sticky warning" },
  { value: "release_announcement", label: "Release announcement" },
  { value: "upgrade_prompt", label: "Upgrade prompt" },
  { value: "safety_alert", label: "Safety alert" },
  { value: "re_fit_reminder", label: "Re-fit reminder" },
  { value: "support_reply", label: "Support reply" },
];

const priorityOptions: Array<{ value: DashboardMessagePriority; label: string }> = [
  { value: "low", label: "Low" },
  { value: "normal", label: "Normal" },
  { value: "high", label: "High" },
  { value: "urgent", label: "Urgent" },
];

const localeOptions = [
  { value: "all", label: "All locales" },
  { value: "en", label: "English" },
  { value: "nl", label: "Dutch" },
];

const targetTypeOptions = [
  { value: "all", label: "All users" },
  { value: "user", label: "Specific user" },
  { value: "plan", label: "Plan" },
  { value: "organization", label: "Organization" },
  { value: "locale", label: "Locale" },
  { value: "strava_connected", label: "Strava connected" },
  { value: "fit_completed", label: "Fit completed" },
  { value: "bike_type", label: "Bike type" },
] as const;

type AudienceRuleDraft = {
  targetType: string;
  targetValue: string;
};

function buildMessageHref(status: string) {
  const params = new URLSearchParams();
  if (status && status !== "all") params.set("status", status);
  const query = params.toString();
  return query ? `/admin/messages?${query}` : "/admin/messages";
}

function formatDeliverySummary(detail: MessageDetailRecord) {
  const delivered = detail.receipts.length;
  const viewed = detail.receipts.filter((receipt) => Boolean(receipt.viewedAt)).length;
  const clicked = detail.receipts.filter((receipt) => Boolean(receipt.clickedAt)).length;
  return { delivered, viewed, clicked };
}

function toDateTimeLocalValue(value?: number | null) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  const pad = (part: number) => String(part).padStart(2, "0");
  const year = date.getFullYear();
  const month = pad(date.getMonth() + 1);
  const day = pad(date.getDate());
  const hours = pad(date.getHours());
  const minutes = pad(date.getMinutes());
  return `${year}-${month}-${day}T${hours}:${minutes}`;
}

function fromDateTimeLocalValue(value: string) {
  if (!value) return undefined;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return undefined;
  return date.getTime();
}

function normalizeTargets(targets: AudienceRuleDraft[]) {
  return targets
    .map((target) => ({
      targetType: target.targetType,
      targetValue:
        target.targetType === "all"
          ? undefined
          : target.targetValue.trim() || undefined,
    }))
    .filter((target) => target.targetType);
}

function summaryCard(label: string, value: string | number, description: string) {
  return (
    <Card className="border-[color:var(--border)] bg-[color:var(--card)]">
      <CardHeader>
        <CardDescription className="text-xs uppercase tracking-wide text-[color:var(--muted-foreground)]">
          {label}
        </CardDescription>
        <CardTitle className="text-2xl">{value}</CardTitle>
      </CardHeader>
      <CardContent className="-mt-2">
        <p className="text-sm text-[color:var(--muted-foreground)]">{description}</p>
      </CardContent>
    </Card>
  );
}

function FieldValue({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <p className="text-xs font-semibold uppercase tracking-wide text-[color:var(--muted-foreground)]">
        {label}
      </p>
      <div className="text-sm leading-6 text-[color:var(--foreground)]">{children}</div>
    </div>
  );
}

function MessageSnapshotCard({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <Card className="border-[color:var(--border)] bg-[color:var(--card)]">
      <CardHeader>
        <CardTitle className="text-base">{title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">{children}</CardContent>
    </Card>
  );
}

function AudienceRuleEditor({
  rule,
  users,
  releases,
  onChange,
  onRemove,
  canRemove,
}: {
  rule: AudienceRuleDraft;
  users: MessageComposeData["users"];
  releases: MessageComposeData["releases"];
  onChange: (next: AudienceRuleDraft) => void;
  onRemove: () => void;
  canRemove: boolean;
}) {
  const targetValuePlaceholder = (() => {
    switch (rule.targetType) {
      case "user":
        return "User ID";
      case "plan":
        return "free, premium, pro";
      case "organization":
        return "Organization ID";
      case "locale":
        return "en or nl";
      case "strava_connected":
      case "fit_completed":
        return "true or false";
      case "bike_type":
        return "road, gravel, mtb...";
      default:
        return "";
    }
  })();

  const suggestions = (() => {
    switch (rule.targetType) {
      case "user":
        return users.slice(0, 6).map((user) => ({ value: String(user._id), label: getAdminDisplayName(user) }));
      case "plan":
        return [
          { value: "free", label: "free" },
          { value: "premium", label: "premium" },
          { value: "pro", label: "pro" },
        ];
      case "organization":
        return [];
      case "locale":
        return localeOptions.filter((option) => option.value !== "all");
      case "strava_connected":
      case "fit_completed":
        return [
          { value: "true", label: "true" },
          { value: "false", label: "false" },
        ];
      case "bike_type":
        return [
          { value: "road", label: "road" },
          { value: "gravel", label: "gravel" },
          { value: "mtb", label: "mtb" },
          { value: "tri", label: "tri" },
        ];
      default:
        return [];
    }
  })();

  return (
    <div className="rounded-2xl border border-[color:var(--border)] bg-[color:var(--secondary)] p-4">
      <div className="grid gap-3 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_auto]">
        <Select
          label="Target type"
          value={rule.targetType}
          onChange={(event) =>
            onChange({
              targetType: event.currentTarget.value,
              targetValue: event.currentTarget.value === "all" ? "" : rule.targetValue,
            })
          }
          options={targetTypeOptions.map((option) => ({ value: option.value, label: option.label }))}
        />
        {rule.targetType === "all" ? (
          <div className="rounded-[var(--radius-md)] border border-dashed border-[color:var(--border)] p-3 text-sm text-[color:var(--muted-foreground)]">
            This rule matches the full audience.
          </div>
        ) : suggestions.length > 0 ? (
          <Select
            label="Target value"
            value={rule.targetValue}
            onChange={(event) => onChange({ ...rule, targetValue: event.currentTarget.value })}
            options={[{ value: "", label: "Choose a value" }, ...suggestions]}
            helperText={targetValuePlaceholder}
          />
        ) : (
          <Input
            label="Target value"
            value={rule.targetValue}
            onChange={(event) => onChange({ ...rule, targetValue: event.currentTarget.value })}
            placeholder={targetValuePlaceholder}
          />
        )}
        <div className="flex items-end">
          <Button type="button" variant="outline" onClick={onRemove} disabled={!canRemove}>
            Remove
          </Button>
        </div>
      </div>
      {rule.targetType === "all" ? (
        <p className="mt-3 text-xs text-[color:var(--muted-foreground)]">
          `all` is a real backend target type. Use it alone when the message should reach every user.
        </p>
      ) : rule.targetType === "organization" ? (
        <p className="mt-3 text-xs text-[color:var(--muted-foreground)]">
          Organization ID targeting is live, but the current loader does not have a dedicated organization lookup for suggestions.
        </p>
      ) : null}
    </div>
  );
}

export function MessageListView({
  rows,
  filters,
}: {
  rows: MessageInboxRow[];
  filters: { status: string };
}) {
  const publishedCount = rows.filter((message) => message.message.status === "published").length;
  const scheduledCount = rows.filter((message) => message.message.status === "scheduled").length;
  const deliveredCount = rows.reduce((sum, row) => sum + row.targetCount, 0);

  return (
    <div className="space-y-6">
      <AdminSectionCard
        title="Dashboard messages"
        description="Compose, schedule, target, and review dashboard messages in a single admin surface."
        actions={
          <Button render={<Link href="/admin/messages/new" />}>New message</Button>
        }
      >
        <div className="grid gap-4 md:grid-cols-4">
          {summaryCard("Messages", rows.length, "Live messages from Convex")}
          {summaryCard("Published", publishedCount, "Currently visible")}
          {summaryCard("Scheduled", scheduledCount, "Queued for release")}
          {summaryCard("Targets", deliveredCount, "Total audience rows")}
        </div>

        <div className="mt-6 flex flex-wrap gap-2">
          {statusOptions.map((option) => {
            const active = filters.status === option.value || (filters.status === "" && option.value === "all");
            return (
              <Button
                key={option.value}
                size="sm"
                variant={active ? "primary" : "outline"}
                render={<Link href={buildMessageHref(option.value)} />}
              >
                {option.label}
              </Button>
            );
          })}
        </div>

        {rows.length === 0 ? (
          <div className="mt-6">
            <EmptyState
              title="No messages found"
              description="No live dashboard messages matched the current filter."
            />
          </div>
        ) : (
          <div className="mt-6">
            <AdminTable>
              <AdminTableHead
                columns={["Title", "Type", "Priority", "Audience", "Timing", "Status", "Action"]}
              />
              <tbody>
                {rows.map((row) => (
                  <AdminTableRow key={row.message._id}>
                    <AdminTableCell className="font-medium">
                      <Link href={`/admin/messages/${row.message._id}`} className="font-medium hover:underline">
                        {row.message.title}
                      </Link>
                      <p className="mt-1 text-xs text-[color:var(--muted-foreground)]">
                        {row.message.body}
                      </p>
                    </AdminTableCell>
                    <AdminTableCell>
                      <AdminStatusPill tone={messageTypeTone(row.message.type)}>
                        {messageTypeLabel(row.message.type)}
                      </AdminStatusPill>
                    </AdminTableCell>
                    <AdminTableCell>
                      <AdminStatusPill tone={messagePriorityTone(row.message.priority)}>
                        {messagePriorityLabel(row.message.priority)}
                      </AdminStatusPill>
                    </AdminTableCell>
                    <AdminTableCell>
                      <div className="space-y-1">
                        <p>{row.targetCount} rows</p>
                        <p className="text-xs text-[color:var(--muted-foreground)]">
                          {row.creatorName}
                        </p>
                      </div>
                    </AdminTableCell>
                    <AdminTableCell>
                      <div className="space-y-1">
                        <p>{row.message.startsAt ? formatAdminDateTime(row.message.startsAt) : "Draft"}</p>
                        <p className="text-xs text-[color:var(--muted-foreground)]">
                          Expires {formatAdminDate(row.message.expiresAt) }
                        </p>
                      </div>
                    </AdminTableCell>
                    <AdminTableCell>
                      <AdminStatusPill tone={messageStatusTone(row.message.status)}>
                        {messageStatusLabel(row.message.status)}
                      </AdminStatusPill>
                      <p className="mt-2 text-xs text-[color:var(--muted-foreground)]">
                        {row.deliverySummary}
                      </p>
                    </AdminTableCell>
                    <AdminTableCell>
                      <Button variant="outline" size="sm" render={<Link href={`/admin/messages/${row.message._id}`} />}>
                        Open
                      </Button>
                    </AdminTableCell>
                  </AdminTableRow>
                ))}
              </tbody>
            </AdminTable>
          </div>
        )}
      </AdminSectionCard>
    </div>
  );
}

function getUserOptions(users: MessageComposeData["users"]) {
  return [
    { value: "", label: "Select a user" },
    ...users.map((user) => ({ value: String(user._id), label: getAdminDisplayName(user) })),
  ];
}

function getReleaseOptions(releases: MessageComposeData["releases"]) {
  return [
    { value: "", label: "No release link" },
    ...releases.map((release) => ({
      value: String(release._id),
      label: release.versionLabel ? `${release.name} · ${release.versionLabel}` : release.name,
    })),
  ];
}

function getFeedbackOptions(feedbackItems: MessageComposeData["feedbackItems"]) {
  return [
    { value: "", label: "No feedback link" },
    ...feedbackItems.map((item) => ({ value: String(item._id), label: item.title })),
  ];
}

function getAudienceInitialTargets(detail: MessageDetailRecord | null) {
  if (!detail) {
    return [{ targetType: "all", targetValue: "" }];
  }

  return detail.targets.length > 0
    ? detail.targets.map((target) => ({
        targetType: target.targetType,
        targetValue: target.targetValue ?? "",
      }))
    : [{ targetType: "all", targetValue: "" }];
}

function MessageLifecycleControls({
  messageId,
  status,
}: {
  messageId: Id<"dashboard_messages">;
  status: DashboardMessageStatus;
}) {
  const router = useRouter();
  const toast = useToast();
  const publish = useMutation(api.admin.mutations.publishDashboardMessage);
  const pause = useMutation(api.admin.mutations.pauseDashboardMessage);
  const expire = useMutation(api.admin.mutations.expireDashboardMessage);
  const remove = useMutation(api.admin.mutations.deleteDashboardMessage);
  const [pending, setPending] = useState<"publish" | "pause" | "expire" | "delete" | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [reason, setReason] = useState("");
  const [error, setError] = useState<string | null>(null);

  const run = async (
    action: "publish" | "pause" | "expire" | "delete",
    fn: () => Promise<void>
  ) => {
    setError(null);
    setPending(action);
    try {
      await fn();
      router.refresh();
      toast.success({
        description: `Message ${action}d.`,
      });
    } catch (mutationError) {
      console.error(`Failed to ${action} dashboard message:`, mutationError);
      setError(`Could not ${action} the message.`);
    } finally {
      setPending(null);
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2">
        {status !== "published" ? (
          <Button
            isLoading={pending === "publish"}
            onClick={() =>
              void run("publish", async () => {
                await publish({ messageId });
              })
            }
          >
            Publish
          </Button>
        ) : null}
        {status !== "paused" ? (
          <Button
            variant="outline"
            isLoading={pending === "pause"}
            onClick={() =>
              void run("pause", async () => {
                await pause({ messageId, reason: reason.trim() || undefined });
              })
            }
          >
            Pause
          </Button>
        ) : null}
        {status !== "expired" ? (
          <Button
            variant="outline"
            isLoading={pending === "expire"}
            onClick={() =>
              void run("expire", async () => {
                await expire({ messageId, reason: reason.trim() || undefined });
              })
            }
          >
            Expire now
          </Button>
        ) : null}
        <Button variant="outline" render={<Link href={`/admin/messages/${messageId}/edit`} />}>
          Edit
        </Button>
        <Button variant="destructive" isLoading={pending === "delete"} onClick={() => setDeleteOpen(true)}>
          Delete
        </Button>
      </div>
      <Input
        label="Reason"
        value={reason}
        onChange={(event) => setReason(event.currentTarget.value)}
        placeholder="Optional operational note"
        helperText="Used when pausing, expiring, or deleting."
      />
      {error ? <p className="text-sm text-[color:var(--danger)]">{error}</p> : null}
      <AccessibleDialog
        open={deleteOpen}
        title="Delete dashboard message"
        description="This permanently removes the message, targets, and receipts."
        onClose={() => setDeleteOpen(false)}
      >
        <div className="space-y-4">
          <p className="text-sm text-[color:var(--muted-foreground)]">
            Confirm deletion only if the message should no longer exist in admin or user-facing history.
          </p>
          <div className="flex justify-end gap-2">
            <Button variant="outline" type="button" onClick={() => setDeleteOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              type="button"
              isLoading={pending === "delete"}
              onClick={() =>
                void run("delete", async () => {
                  await remove({ messageId, reason: reason.trim() || undefined });
                  setDeleteOpen(false);
                })
              }
            >
              Delete
            </Button>
          </div>
        </div>
      </AccessibleDialog>
    </div>
  );
}

export function MessageDetailView({ data }: { data: MessageDetailData }) {
  const summary = formatDeliverySummary(data.detail);

  return (
    <div className="space-y-6">
      <AdminSectionCard
        title={data.detail.message.title}
        description="Delivery stats, audience shape, and status controls for a dashboard message."
        actions={
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" render={<Link href="/admin/messages" />}>
              Back to inbox
            </Button>
          </div>
        }
      >
        <div className="grid gap-6 xl:grid-cols-[minmax(0,1.2fr)_minmax(20rem,0.8fr)]">
          <div className="space-y-6">
            <Card className="border-[color:var(--border)] bg-[color:var(--card)]">
              <CardHeader className="space-y-3">
                <div className="flex flex-wrap items-center gap-2">
                  <AdminStatusPill tone={messageTypeTone(data.detail.message.type)}>
                    {messageTypeLabel(data.detail.message.type)}
                  </AdminStatusPill>
                  <AdminStatusPill tone={messagePriorityTone(data.detail.message.priority)}>
                    {messagePriorityLabel(data.detail.message.priority)}
                  </AdminStatusPill>
                  <AdminStatusPill tone={messageStatusTone(data.detail.message.status)}>
                    {messageStatusLabel(data.detail.message.status)}
                  </AdminStatusPill>
                </div>
                <CardDescription>
                  Created by {getAdminDisplayName(data.users.find((user) => user._id === data.detail.message.createdBy) ?? null)}
                  {" "}· {formatAdminDateTime(data.detail.message.createdAt)}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Textarea label="Body" rows={5} value={data.detail.message.body} readOnly />

                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                  <MessageSnapshotCard title="Delivered">
                    <div className="text-3xl font-semibold">{summary.delivered.toLocaleString()}</div>
                  </MessageSnapshotCard>
                  <MessageSnapshotCard title="Viewed">
                    <div className="text-3xl font-semibold">
                      {summary.delivered === 0 ? "0%" : `${Math.round((summary.viewed / summary.delivered) * 100)}%`}
                    </div>
                  </MessageSnapshotCard>
                  <MessageSnapshotCard title="Clicked">
                    <div className="text-3xl font-semibold">
                      {summary.delivered === 0 ? "0%" : `${Math.round((summary.clicked / summary.delivered) * 100)}%`}
                    </div>
                  </MessageSnapshotCard>
                  <MessageSnapshotCard title="Targets">
                    <div className="text-3xl font-semibold">{data.detail.targets.length}</div>
                  </MessageSnapshotCard>
                </div>

                <MessageLifecycleControls
                  messageId={data.detail.message._id}
                  status={data.detail.message.status}
                />
                <p className="text-xs leading-5 text-[color:var(--muted-foreground)]">
                  Linked release and feedback references are read-only until the backend exposes write fields for those relationships.
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <MessageSnapshotCard title="Audience">
              {data.detail.targets.length === 0 ? (
                <EmptyState
                  title="No audience rules"
                  description="This message currently targets the default audience."
                  className="border-none bg-transparent p-0 shadow-none"
                />
              ) : (
                data.detail.targets.map((rule, index) => (
                  <div
                    key={`${rule.targetType}-${index}`}
                    className="rounded-[var(--radius-lg)] border border-[color:var(--border)] p-3"
                  >
                    <div className="flex flex-wrap items-center gap-2">
                      <AdminStatusPill tone="info">{rule.targetType}</AdminStatusPill>
                      <span className="text-sm text-[color:var(--muted-foreground)]">
                        {rule.targetValue ?? "all"}
                      </span>
                    </div>
                  </div>
                ))
              )}
              <AdminStatusPill tone="info">Estimated reach: {summary.delivered.toLocaleString()}</AdminStatusPill>
            </MessageSnapshotCard>

            <MessageSnapshotCard title="Scheduling">
              <FieldValue label="Published at">{formatAdminDateTime(data.detail.message.publishedAt)}</FieldValue>
              <FieldValue label="Starts at">{formatAdminDateTime(data.detail.message.startsAt)}</FieldValue>
              <FieldValue label="Expires at">{formatAdminDateTime(data.detail.message.expiresAt)}</FieldValue>
              <FieldValue label="Locale">{data.detail.message.locale ?? "all"}</FieldValue>
              <FieldValue label="Dismissible">{data.detail.message.dismissible ? "Yes" : "No"}</FieldValue>
              <FieldValue label="Acknowledgement">{data.detail.message.requiresAcknowledgement ? "Required" : "Optional"}</FieldValue>
              <FieldValue label="Linked release">
                {data.linkedRelease ? data.linkedRelease.name : "Not linked"}
              </FieldValue>
              <FieldValue label="Linked feedback">
                {data.linkedFeedback ? data.linkedFeedback.title : "Not linked"}
              </FieldValue>
            </MessageSnapshotCard>

            <MessageSnapshotCard title="Lifecycle">
              <FieldValue label="Created at">{formatAdminDateTime(data.detail.message.createdAt)}</FieldValue>
              <FieldValue label="Published at">{formatAdminDateTime(data.detail.message.publishedAt)}</FieldValue>
              <FieldValue label="Paused at">{formatAdminDateTime(data.detail.message.pausedAt)}</FieldValue>
              <FieldValue label="Expired at">{formatAdminDateTime(data.detail.message.expiresAt)}</FieldValue>
            </MessageSnapshotCard>
          </div>
        </div>
      </AdminSectionCard>
    </div>
  );
}

function getComposeBaseState(data: MessageComposeData) {
  return {
    title: data.detail?.message.title ?? "",
    body: data.detail?.message.body ?? "",
    type: (data.detail?.message.type ?? "banner") as DashboardMessageType,
    priority: (data.detail?.message.priority ?? "normal") as DashboardMessagePriority,
    ctaText: data.detail?.message.ctaText ?? "",
    ctaUrl: data.detail?.message.ctaUrl ?? "",
    locale: (data.detail?.message.locale ?? "all") as "all" | "en" | "nl",
    dismissible: data.detail?.message.dismissible ?? true,
    requiresAcknowledgement: data.detail?.message.requiresAcknowledgement ?? false,
    startsAt: toDateTimeLocalValue(data.detail?.message.startsAt),
    expiresAt: toDateTimeLocalValue(data.detail?.message.expiresAt),
    targets: getAudienceInitialTargets(data.detail),
  };
}

export function MessageComposeView({
  data,
  mode,
}: {
  data: MessageComposeData;
  mode: "create" | "edit";
}) {
  const router = useRouter();
  const toast = useToast();
  const createMessage = useMutation(api.admin.mutations.createDashboardMessage);
  const updateMessage = useMutation(api.admin.mutations.updateDashboardMessage);
  const [form, setForm] = useState(() => getComposeBaseState(data));
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const normalizedTargets = useMemo(() => normalizeTargets(form.targets), [form.targets]);
  const estimatedReach = useQuery(
    api.admin.queries.estimateMessageReach,
    normalizedTargets.length > 0 ? { targets: normalizedTargets } : { targets: [{ targetType: "all" }] }
  );

  useEffect(() => {
    setForm(getComposeBaseState(data));
  }, [data]);

  const setField = <K extends keyof typeof form>(key: K, value: (typeof form)[K]) => {
    setForm((current) => ({ ...current, [key]: value }));
  };

  const updateTarget = (index: number, next: AudienceRuleDraft) => {
    setForm((current) => ({
      ...current,
      targets: current.targets.map((target, targetIndex) => (targetIndex === index ? next : target)),
    }));
  };

  const addTarget = () => {
    setForm((current) => ({
      ...current,
      targets: [...current.targets, { targetType: "plan", targetValue: "" }],
    }));
  };

  const removeTarget = (index: number) => {
    setForm((current) => ({
      ...current,
      targets: current.targets.length === 1 ? current.targets : current.targets.filter((_, targetIndex) => targetIndex !== index),
    }));
  };

  const saveMessage = async () => {
    setError(null);
    setIsSaving(true);
    try {
      const payload = {
        title: form.title.trim(),
        body: form.body.trim(),
        type: form.type,
        priority: form.priority,
        ctaText: form.ctaText.trim() || undefined,
        ctaUrl: form.ctaUrl.trim() || undefined,
        locale: form.locale,
        dismissible: form.dismissible,
        requiresAcknowledgement: form.requiresAcknowledgement,
        startsAt: fromDateTimeLocalValue(form.startsAt),
        expiresAt: fromDateTimeLocalValue(form.expiresAt),
        targets: normalizedTargets,
      } as const;

      if (!payload.title || !payload.body) {
        setError("Title and body are required.");
        return;
      }

      if (mode === "create" || !data.detail) {
        const messageId = await createMessage(payload);
        router.push(`/admin/messages/${messageId}`);
        toast.success({ description: "Dashboard message created." });
      } else {
        await updateMessage({
          messageId: data.detail.message._id,
          ...payload,
        });
        router.refresh();
        toast.success({ description: "Dashboard message updated." });
      }
    } catch (mutationError) {
      console.error("Failed to save dashboard message:", mutationError);
      setError("Could not save the dashboard message.");
    } finally {
      setIsSaving(false);
    }
  };

  const editMode = mode === "edit" && Boolean(data.detail);

  return (
    <div className="space-y-6">
      <AdminSectionCard
        title={editMode ? "Edit message" : "New message"}
        description="Draft, target, preview, and schedule a dashboard message."
        actions={
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" render={<Link href="/admin/messages" />}>
              Back to inbox
            </Button>
          </div>
        }
      >
        <div className="grid gap-6 xl:grid-cols-[minmax(0,1.2fr)_minmax(20rem,0.8fr)]">
          <div className="space-y-6">
            <Card className="border-[color:var(--border)] bg-[color:var(--card)]">
              <CardHeader>
                <CardTitle className="text-base">Message content</CardTitle>
                <CardDescription>All fields below write to the live Convex mutation contract.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Input
                  label="Title"
                  value={form.title}
                  onChange={(event) => setField("title", event.currentTarget.value)}
                  placeholder="Short, visible headline"
                />
                <Textarea
                  label="Body"
                  rows={6}
                  value={form.body}
                  onChange={(event) => setField("body", event.currentTarget.value)}
                  placeholder="Main message copy"
                />
                <div className="grid gap-4 sm:grid-cols-2">
                  <Select
                    label="Message type"
                    value={form.type}
                    onChange={(event) => setField("type", event.currentTarget.value as DashboardMessageType)}
                    options={typeOptions}
                  />
                  <Select
                    label="Priority"
                    value={form.priority}
                    onChange={(event) =>
                      setField("priority", event.currentTarget.value as DashboardMessagePriority)
                    }
                    options={priorityOptions}
                  />
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <Input
                    label="CTA text"
                    value={form.ctaText}
                    onChange={(event) => setField("ctaText", event.currentTarget.value)}
                    placeholder="Upgrade now"
                  />
                  <Input
                    label="CTA URL"
                    value={form.ctaUrl}
                    onChange={(event) => setField("ctaUrl", event.currentTarget.value)}
                    placeholder="/pricing"
                  />
                </div>
                <div className="grid gap-4 sm:grid-cols-3">
                  <Select
                    label="Locale"
                    value={form.locale}
                    onChange={(event) =>
                      setField("locale", event.currentTarget.value as "all" | "en" | "nl")
                    }
                    options={localeOptions}
                  />
                  <Input
                    label="Starts at"
                    type="datetime-local"
                    value={form.startsAt}
                    onChange={(event) => setField("startsAt", event.currentTarget.value)}
                  />
                  <Input
                    label="Expires at"
                    type="datetime-local"
                    value={form.expiresAt}
                    onChange={(event) => setField("expiresAt", event.currentTarget.value)}
                  />
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <Select
                    label="Dismissible"
                    value={form.dismissible ? "true" : "false"}
                    onChange={(event) => setField("dismissible", event.currentTarget.value === "true")}
                    options={[
                      { value: "true", label: "Yes" },
                      { value: "false", label: "No" },
                    ]}
                  />
                  <Select
                    label="Acknowledgement required"
                    value={form.requiresAcknowledgement ? "true" : "false"}
                    onChange={(event) =>
                      setField("requiresAcknowledgement", event.currentTarget.value === "true")
                    }
                    options={[
                      { value: "true", label: "Yes" },
                      { value: "false", label: "No" },
                    ]}
                  />
                </div>
                <div className="rounded-2xl border border-[color:var(--border)] bg-[color:var(--secondary)] p-4">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-sm font-medium text-[color:var(--foreground)]">Audience</p>
                      <p className="text-sm text-[color:var(--muted-foreground)]">
                        Estimate reach against the live Convex user base.
                      </p>
                    </div>
                    <Button type="button" variant="outline" onClick={addTarget}>
                      Add rule
                    </Button>
                  </div>
                  <div className="mt-4 space-y-3">
                    {form.targets.map((rule, index) => (
                      <AudienceRuleEditor
                        key={`${rule.targetType}-${index}`}
                        rule={rule}
                        users={data.users}
                        releases={data.releases}
                        onChange={(next) => updateTarget(index, next)}
                        onRemove={() => removeTarget(index)}
                        canRemove={form.targets.length > 1}
                      />
                    ))}
                  </div>
                </div>
                {error ? <p className="text-sm text-[color:var(--danger)]">{error}</p> : null}
                <div className="flex flex-wrap gap-2">
                  <Button onClick={() => void saveMessage()} isLoading={isSaving}>
                    {editMode ? "Update message" : "Create message"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <MessageSnapshotCard title="Live reach">
              {estimatedReach ? (
                <div className="space-y-2">
                  <div className="text-3xl font-semibold">{estimatedReach.estimatedReach.toLocaleString()}</div>
                  <p className="text-sm text-[color:var(--muted-foreground)]">
                    Estimate from the current audience rule set.
                  </p>
                </div>
              ) : (
                <p className="text-sm text-[color:var(--muted-foreground)]">Estimating audience...</p>
              )}
            </MessageSnapshotCard>

            <MessageSnapshotCard title="Read-only links">
              <FieldValue label="Linked release">
                {data.linkedRelease ? data.linkedRelease.name : "No live link"}
              </FieldValue>
              <FieldValue label="Linked feedback">
                {data.linkedFeedback ? data.linkedFeedback.title : "No live link"}
              </FieldValue>
              <p className="text-xs text-[color:var(--muted-foreground)]">
                These relationships are visible in live data, but the current write contract does not persist them.
              </p>
            </MessageSnapshotCard>

            {editMode && data.detail ? (
              <MessageSnapshotCard title="Current record">
                <FieldValue label="Status">
                <AdminStatusPill tone={messageStatusTone(data.detail.message.status)}>
                  {messageStatusLabel(data.detail.message.status)}
                </AdminStatusPill>
              </FieldValue>
              <FieldValue label="Created at">{formatAdminDateTime(data.detail.message.createdAt)}</FieldValue>
              <FieldValue label="Published at">{formatAdminDateTime(data.detail.message.publishedAt)}</FieldValue>
              <FieldValue label="Created time">{formatAdminDateTime(data.detail.message._creationTime)}</FieldValue>
            </MessageSnapshotCard>
            ) : null}
          </div>
        </div>
      </AdminSectionCard>
    </div>
  );
}
