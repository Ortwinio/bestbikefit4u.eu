"use client";

import Link from "next/link";
import { useMemo, useState, type ReactNode } from "react";
import {
  AccessibleDialog,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
  Input,
  Select,
  SegmentedControl,
  SegmentedControlItem,
  Textarea,
  FieldLabel,
  Selectable,
} from "@/components/ui";
import {
  AdminSectionCard,
  AdminStatusPill,
  AdminTable,
  AdminTableCell,
  AdminTableHead,
} from "@/components/admin/layout/AdminUi";

export type DashboardMessageType =
  | "banner"
  | "inbox_card"
  | "modal"
  | "sticky_warning"
  | "release_announcement"
  | "upgrade_prompt"
  | "safety_alert"
  | "re_fit_reminder"
  | "support_reply";

export type DashboardMessageStatus = "draft" | "scheduled" | "published" | "expired" | "paused";

export type DashboardMessagePriority = "low" | "normal" | "high" | "urgent";

type AudienceRule = {
  targetType: "all" | "user" | "plan" | "organization" | "locale" | "strava_connected" | "fit_completed" | "bike_type";
  targetValue?: string;
};

type DashboardMessage = {
  id: string;
  title: string;
  body: string;
  type: DashboardMessageType;
  status: DashboardMessageStatus;
  priority: DashboardMessagePriority;
  targetSummary: string;
  publishedAt?: string;
  scheduledAt?: string;
  expiresAt?: string;
  delivered: number;
  viewed: number;
  clicked: number;
  acknowledged: number;
  dismissed: number;
  locale: "all" | "en" | "nl";
  requiresAck: boolean;
  dismissible: boolean;
  ctaText?: string;
  ctaUrl?: string;
  linkedRelease?: string;
  linkedFeedback?: string;
  audience: AudienceRule[];
};

const messageTypeLabels: Record<DashboardMessageType, string> = {
  banner: "Banner",
  inbox_card: "Inbox card",
  modal: "Modal",
  sticky_warning: "Sticky warning",
  release_announcement: "Release announcement",
  upgrade_prompt: "Upgrade prompt",
  safety_alert: "Safety alert",
  re_fit_reminder: "Re-fit reminder",
  support_reply: "Support reply",
};

const statusLabels: Record<DashboardMessageStatus, string> = {
  draft: "Draft",
  scheduled: "Scheduled",
  published: "Published",
  expired: "Expired",
  paused: "Paused",
};

const priorityLabels: Record<DashboardMessagePriority, string> = {
  low: "Low",
  normal: "Normal",
  high: "High",
  urgent: "Urgent",
};

const messageRecords: DashboardMessage[] = [
  {
    id: "msg_001",
    title: "Spring upgrade prompt",
    body: "Pro riders can now access advanced fit exports and richer history views.",
    type: "upgrade_prompt",
    status: "published",
    priority: "high",
    targetSummary: "Pro users",
    publishedAt: "2026-03-20",
    delivered: 1824,
    viewed: 1041,
    clicked: 211,
    acknowledged: 88,
    dismissed: 93,
    locale: "all",
    requiresAck: false,
    dismissible: true,
    ctaText: "Upgrade now",
    ctaUrl: "/pricing",
    linkedRelease: "v1.18.0",
    linkedFeedback: "feedback_002",
    audience: [{ targetType: "plan", targetValue: "pro" }],
  },
  {
    id: "msg_002",
    title: "Maintenance window notice",
    body: "A short maintenance window will affect fit run publishing at 04:00 UTC.",
    type: "banner",
    status: "scheduled",
    priority: "urgent",
    targetSummary: "All users",
    scheduledAt: "2026-03-23 04:00",
    delivered: 0,
    viewed: 0,
    clicked: 0,
    acknowledged: 0,
    dismissed: 0,
    locale: "all",
    requiresAck: true,
    dismissible: false,
    audience: [{ targetType: "all" }],
  },
  {
    id: "msg_003",
    title: "New fit history export",
    body: "You can now export fit history as CSV or PDF from the dashboard.",
    type: "inbox_card",
    status: "published",
    priority: "normal",
    targetSummary: "Premium users",
    publishedAt: "2026-03-17",
    delivered: 721,
    viewed: 511,
    clicked: 109,
    acknowledged: 41,
    dismissed: 17,
    locale: "en",
    requiresAck: false,
    dismissible: true,
    ctaText: "Open history",
    ctaUrl: "/fit-history",
    audience: [{ targetType: "plan", targetValue: "premium" }, { targetType: "locale", targetValue: "en" }],
  },
  {
    id: "msg_004",
    title: "Support follow-up for billing question",
    body: "Thanks for the follow-up. The billing trail is now visible in the admin portal.",
    type: "support_reply",
    status: "draft",
    priority: "low",
    targetSummary: "1 specific user",
    delivered: 0,
    viewed: 0,
    clicked: 0,
    acknowledged: 0,
    dismissed: 0,
    locale: "all",
    requiresAck: false,
    dismissible: true,
    linkedFeedback: "feedback_004",
    audience: [{ targetType: "user", targetValue: "user_omar" }],
  },
];

function formatDate(dateString?: string) {
  if (!dateString) return "—";
  return new Intl.DateTimeFormat("en", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(dateString));
}

function percent(part: number, whole: number) {
  if (whole === 0) return "0%";
  return `${Math.round((part / whole) * 100)}%`;
}

function typeTone(type: DashboardMessageType) {
  switch (type) {
    case "banner":
    case "sticky_warning":
      return "warning";
    case "modal":
      return "info";
    case "support_reply":
      return "success";
    case "upgrade_prompt":
      return "info";
    case "release_announcement":
      return "success";
    case "safety_alert":
      return "danger";
    case "re_fit_reminder":
      return "neutral";
    case "inbox_card":
    default:
      return "neutral";
  }
}

function statusTone(status: DashboardMessageStatus) {
  switch (status) {
    case "published":
      return "success";
    case "scheduled":
      return "info";
    case "paused":
      return "warning";
    case "expired":
      return "neutral";
    case "draft":
    default:
      return "neutral";
  }
}

function priorityTone(priority: DashboardMessagePriority) {
  switch (priority) {
    case "urgent":
      return "danger";
    case "high":
      return "warning";
    case "normal":
      return "info";
    case "low":
    default:
      return "neutral";
  }
}

function FieldBlock({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="space-y-1.5">
      <FieldLabel label={label} />
      {children}
    </div>
  );
}

function toneCard(selected: boolean) {
  return selected
    ? "border-[color:color-mix(in_oklch,var(--primary)_28%,var(--border))] bg-[color:color-mix(in_oklch,var(--primary)_8%,var(--card))]"
    : "border-[color:var(--border)] bg-[color:var(--card)]";
}

export function MessageListView() {
  const [statusFilter, setStatusFilter] = useState<"all" | DashboardMessageStatus>("all");
  const [typeFilter, setTypeFilter] = useState<"all" | DashboardMessageType>("all");

  const filteredMessages = useMemo(
    () =>
      messageRecords.filter((message) => {
        const matchesStatus = statusFilter === "all" || message.status === statusFilter;
        const matchesType = typeFilter === "all" || message.type === typeFilter;
        return matchesStatus && matchesType;
      }),
    [statusFilter, typeFilter]
  );

  const totalDelivered = messageRecords.reduce((sum, message) => sum + message.delivered, 0);

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
          <Card className={toneCard(false)}>
            <CardContent className="p-4">
              <div className="text-xs uppercase tracking-[0.18em] text-[color:var(--muted-foreground)]">Messages</div>
              <div className="mt-2 text-3xl font-semibold">{messageRecords.length}</div>
            </CardContent>
          </Card>
          <Card className={toneCard(false)}>
            <CardContent className="p-4">
              <div className="text-xs uppercase tracking-[0.18em] text-[color:var(--muted-foreground)]">Published</div>
              <div className="mt-2 text-3xl font-semibold">
                {messageRecords.filter((message) => message.status === "published").length}
              </div>
            </CardContent>
          </Card>
          <Card className={toneCard(false)}>
            <CardContent className="p-4">
              <div className="text-xs uppercase tracking-[0.18em] text-[color:var(--muted-foreground)]">Scheduled</div>
              <div className="mt-2 text-3xl font-semibold">
                {messageRecords.filter((message) => message.status === "scheduled").length}
              </div>
            </CardContent>
          </Card>
          <Card className={toneCard(false)}>
            <CardContent className="p-4">
              <div className="text-xs uppercase tracking-[0.18em] text-[color:var(--muted-foreground)]">Delivered</div>
              <div className="mt-2 text-3xl font-semibold">{totalDelivered.toLocaleString()}</div>
            </CardContent>
          </Card>
        </div>

        <div className="mt-6 space-y-4">
          <SegmentedControl
            aria-label="Message status filter"
            value={statusFilter}
            onValueChange={(value) => setStatusFilter(value as typeof statusFilter)}
            size="sm"
            className="flex-wrap"
          >
            <SegmentedControlItem value="all" size="sm">All</SegmentedControlItem>
            <SegmentedControlItem value="draft" size="sm">Draft</SegmentedControlItem>
            <SegmentedControlItem value="scheduled" size="sm">Scheduled</SegmentedControlItem>
            <SegmentedControlItem value="published" size="sm">Published</SegmentedControlItem>
            <SegmentedControlItem value="paused" size="sm">Paused</SegmentedControlItem>
            <SegmentedControlItem value="expired" size="sm">Expired</SegmentedControlItem>
          </SegmentedControl>

          <Select
            value={typeFilter}
            onChange={(event) => setTypeFilter(event.currentTarget.value as typeof typeFilter)}
            options={[
              { value: "all", label: "All types" },
              { value: "banner", label: "Banner" },
              { value: "inbox_card", label: "Inbox card" },
              { value: "modal", label: "Modal" },
              { value: "sticky_warning", label: "Sticky warning" },
              { value: "release_announcement", label: "Release announcement" },
              { value: "upgrade_prompt", label: "Upgrade prompt" },
              { value: "safety_alert", label: "Safety alert" },
            ]}
          />

          <AdminTable>
            <AdminTableHead
              columns={["Title", "Type", "Priority", "Target", "Timing", "Delivery", "Status", "Actions"]}
            />
            <tbody>
              {filteredMessages.map((message) => (
                <tr key={message.id} className="border-t border-[color:var(--border)]">
                  <AdminTableCell className="font-medium">
                    <Button variant="ghost" size="sm" className="h-auto p-0 text-left font-medium" render={<Link href={`/admin/messages/${message.id}`} />}>
                      {message.title}
                    </Button>
                    <p className="mt-1 text-xs text-[color:var(--muted-foreground)]">{message.body}</p>
                  </AdminTableCell>
                  <AdminTableCell>
                    <AdminStatusPill tone={typeTone(message.type)}>{messageTypeLabels[message.type]}</AdminStatusPill>
                  </AdminTableCell>
                  <AdminTableCell>
                    <AdminStatusPill tone={priorityTone(message.priority)}>{priorityLabels[message.priority]}</AdminStatusPill>
                  </AdminTableCell>
                  <AdminTableCell>{message.targetSummary}</AdminTableCell>
                  <AdminTableCell>{formatDate(message.publishedAt ?? message.scheduledAt)}</AdminTableCell>
                  <AdminTableCell>
                    <div className="text-sm">
                      <div>Delivered {message.delivered.toLocaleString()}</div>
                      <div className="text-xs text-[color:var(--muted-foreground)]">
                        Viewed {percent(message.viewed, message.delivered)} · Clicked {percent(message.clicked, message.delivered)}
                      </div>
                    </div>
                  </AdminTableCell>
                  <AdminTableCell>
                    <AdminStatusPill tone={statusTone(message.status)}>{statusLabels[message.status]}</AdminStatusPill>
                  </AdminTableCell>
                  <AdminTableCell>
                    <Button variant="outline" size="sm" render={<Link href={`/admin/messages/${message.id}`} />}>
                      View / Edit
                    </Button>
                  </AdminTableCell>
                </tr>
              ))}
            </tbody>
          </AdminTable>
        </div>
      </AdminSectionCard>
    </div>
  );
}

export function MessageComposeView() {
  const [messageType, setMessageType] = useState<DashboardMessageType>("banner");
  const [title, setTitle] = useState("Maintenance banner");
  const [body, setBody] = useState("A short maintenance window will affect publishing.");
  const [ctaText, setCtaText] = useState("Learn more");
  const [ctaUrl, setCtaUrl] = useState("/admin/audit");
  const [priority, setPriority] = useState<DashboardMessagePriority>("high");
  const [dismissible, setDismissible] = useState(true);
  const [requiresAck, setRequiresAck] = useState(false);
  const [locale, setLocale] = useState("all");
  const [sendTiming, setSendTiming] = useState<"now" | "scheduled">("scheduled");
  const [startsAt, setStartsAt] = useState("2026-03-24T04:00");
  const [expiresMode, setExpiresMode] = useState<"none" | "date">("date");
  const [expiresAt, setExpiresAt] = useState("2026-04-10T00:00");
  const [audience, setAudience] = useState<AudienceRule[]>([
    { targetType: "all" },
    { targetType: "plan", targetValue: "pro" },
  ]);
  const [previewOpen, setPreviewOpen] = useState(false);

  const estimatedReach = useMemo(() => {
    const base = audience.length * 182;
    const typeBonus = messageType === "banner" ? 160 : messageType === "inbox_card" ? 120 : 80;
    return Math.max(20, base + typeBonus);
  }, [audience.length, messageType]);

  return (
    <div className="grid gap-6 xl:grid-cols-[minmax(0,1.3fr)_minmax(24rem,0.7fr)]">
      <AdminSectionCard
        title="Compose message"
        description="Build a dashboard message using the planned admin contract."
        actions={<Button variant="outline" size="sm" onClick={() => setPreviewOpen(true)}>Preview</Button>}
      >
        <div className="space-y-6">
          <Card className={toneCard(false)}>
            <CardHeader>
              <CardTitle className="text-base">Content</CardTitle>
              <CardDescription>Message type, body, priority, and delivery controls.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Select
                label="Type"
                value={messageType}
                onChange={(event) => setMessageType(event.currentTarget.value as DashboardMessageType)}
                options={Object.entries(messageTypeLabels).map(([value, label]) => ({ value, label }))}
              />
              <FieldBlock label="Title">
                <Input value={title} onChange={(event) => setTitle(event.currentTarget.value)} />
              </FieldBlock>
              <Textarea label="Body" rows={5} value={body} onChange={(event) => setBody(event.currentTarget.value)} />
              <div className="grid gap-4 sm:grid-cols-2">
                <FieldBlock label="CTA text">
                  <Input value={ctaText} onChange={(event) => setCtaText(event.currentTarget.value)} />
                </FieldBlock>
                <FieldBlock label="CTA URL">
                  <Input value={ctaUrl} onChange={(event) => setCtaUrl(event.currentTarget.value)} />
                </FieldBlock>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <SegmentedControl
                  aria-label="Priority"
                  value={priority}
                  onValueChange={(value) => setPriority(value as DashboardMessagePriority)}
                  size="sm"
                  className="flex-wrap"
                >
                  <SegmentedControlItem value="low" size="sm">Low</SegmentedControlItem>
                  <SegmentedControlItem value="normal" size="sm">Normal</SegmentedControlItem>
                  <SegmentedControlItem value="high" size="sm">High</SegmentedControlItem>
                  <SegmentedControlItem value="urgent" size="sm">Urgent</SegmentedControlItem>
                </SegmentedControl>
                <Select
                  label="Locale"
                  value={locale}
                  onChange={(event) => setLocale(event.currentTarget.value)}
                  options={[
                    { value: "all", label: "All languages" },
                    { value: "en", label: "EN only" },
                    { value: "nl", label: "NL only" },
                  ]}
                />
              </div>
              <div className="flex flex-wrap gap-2">
                <Selectable selected={dismissible} onClick={() => setDismissible((value) => !value)} variant="pill">
                  {dismissible ? "Dismissible" : "Locked"}
                </Selectable>
                <Selectable selected={requiresAck} onClick={() => setRequiresAck((value) => !value)} variant="pill">
                  {requiresAck ? "Acknowledgement required" : "No acknowledgement"}
                </Selectable>
              </div>
            </CardContent>
          </Card>

          <Card className={toneCard(false)}>
            <CardHeader>
              <CardTitle className="text-base">Audience</CardTitle>
              <CardDescription>OR-combined rules with estimated reach.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                {audience.map((rule, index) => (
                  <div key={`${rule.targetType}-${index}`} className="grid gap-3 rounded-[var(--radius-lg)] border border-[color:var(--border)] p-4 sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_auto]">
                    <Select
                      label={`Rule ${index + 1} type`}
                      value={rule.targetType}
                      onChange={(event) =>
                        setAudience((current) =>
                          current.map((entry, entryIndex) =>
                            entryIndex === index ? { ...entry, targetType: event.currentTarget.value as AudienceRule["targetType"] } : entry
                          )
                        )
                      }
                      options={[
                        { value: "all", label: "All users" },
                        { value: "user", label: "Specific user" },
                        { value: "plan", label: "Plan / tier" },
                        { value: "organization", label: "Organization" },
                        { value: "locale", label: "Locale" },
                        { value: "strava_connected", label: "Strava connected" },
                        { value: "fit_completed", label: "Fit completed" },
                        { value: "bike_type", label: "Bike type" },
                      ]}
                    />
                    <FieldBlock label="Value">
                      <Input
                        value={rule.targetValue ?? ""}
                        onChange={(event) =>
                          setAudience((current) =>
                            current.map((entry, entryIndex) =>
                              entryIndex === index ? { ...entry, targetValue: event.currentTarget.value } : entry
                            )
                          )
                        }
                        placeholder="Optional target value"
                      />
                    </FieldBlock>
                    <div className="flex items-end">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setAudience((current) => current.filter((_, entryIndex) => entryIndex !== index))}
                      >
                        Remove
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
              <div className="flex flex-wrap items-center justify-between gap-3">
                <Button variant="outline" size="sm" onClick={() => setAudience((current) => [...current, { targetType: "organization" }])}>
                  Add audience rule
                </Button>
                <AdminStatusPill tone="info">Estimated reach: {estimatedReach.toLocaleString()}</AdminStatusPill>
              </div>
            </CardContent>
          </Card>

          <Card className={toneCard(false)}>
            <CardHeader>
              <CardTitle className="text-base">Scheduling</CardTitle>
              <CardDescription>Send now or schedule, with optional expiry.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <SegmentedControl
                aria-label="Send timing"
                value={sendTiming}
                onValueChange={(value) => setSendTiming(value as typeof sendTiming)}
                size="sm"
              >
                <SegmentedControlItem value="now" size="sm">Now</SegmentedControlItem>
                <SegmentedControlItem value="scheduled" size="sm">Scheduled</SegmentedControlItem>
              </SegmentedControl>
              {sendTiming === "scheduled" ? (
                <FieldBlock label="Starts at">
                  <Input type="datetime-local" value={startsAt} onChange={(event) => setStartsAt(event.currentTarget.value)} />
                </FieldBlock>
              ) : null}
              <SegmentedControl
                aria-label="Expiry"
                value={expiresMode}
                onValueChange={(value) => setExpiresMode(value as typeof expiresMode)}
                size="sm"
              >
                <SegmentedControlItem value="none" size="sm">None</SegmentedControlItem>
                <SegmentedControlItem value="date" size="sm">On date</SegmentedControlItem>
              </SegmentedControl>
              {expiresMode === "date" ? (
                <FieldBlock label="Expires at">
                  <Input type="datetime-local" value={expiresAt} onChange={(event) => setExpiresAt(event.currentTarget.value)} />
                </FieldBlock>
              ) : null}
            </CardContent>
            <CardFooter className="flex-wrap justify-end gap-2">
              <Button variant="outline">Save draft</Button>
              <Button variant="outline" onClick={() => setPreviewOpen(true)}>
                Preview
              </Button>
              <Button variant="outline">Publish now</Button>
              <Button>Schedule</Button>
            </CardFooter>
          </Card>
        </div>
      </AdminSectionCard>

      <div className="space-y-6">
        <Card className={toneCard(false)}>
          <CardHeader>
            <CardTitle className="text-base">Preview</CardTitle>
            <CardDescription>How the message will look in the dashboard.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="rounded-[var(--radius-lg)] border border-[color:var(--border)] bg-[color:var(--secondary)] p-4">
              <div className="flex flex-wrap items-center gap-2">
                <AdminStatusPill tone={typeTone(messageType)}>{messageTypeLabels[messageType]}</AdminStatusPill>
                <AdminStatusPill tone={priorityTone(priority)}>{priorityLabels[priority]}</AdminStatusPill>
              </div>
              <p className="mt-3 text-lg font-semibold">{title}</p>
              <p className="mt-2 text-sm text-[color:var(--muted-foreground)]">{body}</p>
              <div className="mt-4 flex flex-wrap gap-2">
                {ctaText ? <Button size="sm">{ctaText}</Button> : null}
                {dismissible ? <Button variant="outline" size="sm">Dismiss</Button> : null}
              </div>
            </div>
            <AdminStatusPill tone="info">Estimated reach: {estimatedReach.toLocaleString()}</AdminStatusPill>
          </CardContent>
        </Card>

        <Card className={toneCard(false)}>
          <CardHeader>
            <CardTitle className="text-base">Current payload</CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="overflow-auto rounded-[var(--radius-md)] bg-[color:var(--secondary)] p-4 text-xs leading-6">
{JSON.stringify(
  {
    type: messageType,
    title,
    body,
    ctaText,
    ctaUrl,
    priority,
    dismissible,
    requiresAck,
    locale,
    sendTiming,
    startsAt,
    expiresMode,
    expiresAt,
    audience,
  },
  null,
  2
)}
            </pre>
          </CardContent>
        </Card>
      </div>

      <AccessibleDialog
        open={previewOpen}
        title="Preview message"
        description="Rendered using the current form values."
        onClose={() => setPreviewOpen(false)}
      >
        <div className="space-y-4">
          <div className="rounded-[var(--radius-lg)] border border-[color:var(--border)] bg-[color:var(--secondary)] p-4">
            <div className="flex flex-wrap items-center gap-2">
              <AdminStatusPill tone={typeTone(messageType)}>{messageTypeLabels[messageType]}</AdminStatusPill>
              <AdminStatusPill tone={priorityTone(priority)}>{priorityLabels[priority]}</AdminStatusPill>
            </div>
            <p className="mt-3 text-lg font-semibold">{title}</p>
            <p className="mt-2 text-sm text-[color:var(--muted-foreground)]">{body}</p>
          </div>
          <div className="flex justify-end">
            <Button onClick={() => setPreviewOpen(false)}>Close</Button>
          </div>
        </div>
      </AccessibleDialog>
    </div>
  );
}

export function MessageDetailView({ messageId }: { messageId: string }) {
  const message = messageRecords.find((entry) => entry.id === messageId) ?? messageRecords[0];
  const [status, setStatus] = useState<DashboardMessageStatus>(message.status);
  const [priority, setPriority] = useState<DashboardMessagePriority>(message.priority);

  return (
    <div className="space-y-6">
      <AdminSectionCard
        title={message.title}
        description="Delivery statistics, audience shape, and status controls."
        actions={
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" size="sm" render={<Link href="/admin/messages/new" />}>
              Duplicate
            </Button>
            <Button variant="outline" size="sm">
              Pause
            </Button>
            <Button variant="outline" size="sm">
              Expire now
            </Button>
          </div>
        }
      >
        <div className="grid gap-6 xl:grid-cols-[minmax(0,1.2fr)_minmax(20rem,0.8fr)]">
          <div className="space-y-6">
            <Card className={toneCard(false)}>
              <CardHeader className="space-y-3">
                <div className="flex flex-wrap items-center gap-2">
                  <AdminStatusPill tone={typeTone(message.type)}>{messageTypeLabels[message.type]}</AdminStatusPill>
                  <AdminStatusPill tone={priorityTone(priority)}>{priorityLabels[priority]}</AdminStatusPill>
                  <AdminStatusPill tone={statusTone(status)}>{statusLabels[status]}</AdminStatusPill>
                </div>
                <CardDescription>
                  Published {formatDate(message.publishedAt ?? message.scheduledAt)} · Target {message.targetSummary}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Textarea label="Body" rows={5} value={message.body} readOnly />
                <div className="grid gap-4 sm:grid-cols-2">
                  <Select
                    label="Status"
                    value={status}
                    onChange={(event) => setStatus(event.currentTarget.value as DashboardMessageStatus)}
                    options={Object.entries(statusLabels).map(([value, label]) => ({ value, label }))}
                  />
                  <Select
                    label="Priority"
                    value={priority}
                    onChange={(event) => setPriority(event.currentTarget.value as DashboardMessagePriority)}
                    options={Object.entries(priorityLabels).map(([value, label]) => ({ value, label }))}
                  />
                </div>
                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                  <Card className="border-[color:var(--border)] bg-[color:var(--card)]">
                    <CardContent className="p-4">
                      <div className="text-xs uppercase tracking-[0.18em] text-[color:var(--muted-foreground)]">Delivered</div>
                      <div className="mt-2 text-3xl font-semibold">{message.delivered.toLocaleString()}</div>
                    </CardContent>
                  </Card>
                  <Card className="border-[color:var(--border)] bg-[color:var(--card)]">
                    <CardContent className="p-4">
                      <div className="text-xs uppercase tracking-[0.18em] text-[color:var(--muted-foreground)]">Viewed</div>
                      <div className="mt-2 text-3xl font-semibold">{percent(message.viewed, message.delivered)}</div>
                    </CardContent>
                  </Card>
                  <Card className="border-[color:var(--border)] bg-[color:var(--card)]">
                    <CardContent className="p-4">
                      <div className="text-xs uppercase tracking-[0.18em] text-[color:var(--muted-foreground)]">Clicked</div>
                      <div className="mt-2 text-3xl font-semibold">{percent(message.clicked, message.delivered)}</div>
                    </CardContent>
                  </Card>
                  <Card className="border-[color:var(--border)] bg-[color:var(--card)]">
                    <CardContent className="p-4">
                      <div className="text-xs uppercase tracking-[0.18em] text-[color:var(--muted-foreground)]">Acknowledged</div>
                      <div className="mt-2 text-3xl font-semibold">{percent(message.acknowledged, message.delivered)}</div>
                    </CardContent>
                  </Card>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card className={toneCard(false)}>
              <CardHeader>
                <CardTitle className="text-base">Audience</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {message.audience.map((rule, index) => (
                  <div key={`${rule.targetType}-${index}`} className="rounded-[var(--radius-lg)] border border-[color:var(--border)] p-3">
                    <div className="flex flex-wrap items-center gap-2">
                      <AdminStatusPill tone="info">{rule.targetType}</AdminStatusPill>
                      <span className="text-sm text-[color:var(--muted-foreground)]">{rule.targetValue ?? "all"}</span>
                    </div>
                  </div>
                ))}
                <AdminStatusPill tone="info">Estimated reach: {message.delivered.toLocaleString()}</AdminStatusPill>
              </CardContent>
            </Card>

            <Card className={toneCard(false)}>
              <CardHeader>
                <CardTitle className="text-base">Scheduling</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm text-[color:var(--muted-foreground)]">
                <p>Published at: {formatDate(message.publishedAt)}</p>
                <p>Starts at: {formatDate(message.scheduledAt)}</p>
                <p>Expires at: {formatDate(message.expiresAt)}</p>
                <p>Linked release: {message.linkedRelease ?? "—"}</p>
                <p>Linked feedback: {message.linkedFeedback ?? "—"}</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </AdminSectionCard>
    </div>
  );
}
