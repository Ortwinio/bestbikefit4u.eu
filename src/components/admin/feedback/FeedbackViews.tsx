"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import {
  AccessibleDialog,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Input,
  Select,
  SegmentedControl,
  SegmentedControlItem,
  Textarea,
  Selectable,
} from "@/components/ui";
import {
  AdminSectionCard,
  AdminStatusPill,
  AdminTable,
  AdminTableCell,
  AdminTableHead,
} from "@/components/admin/layout/AdminUi";
import { cn } from "@/utils/cn";

export type FeedbackType =
  | "bug"
  | "feature_request"
  | "fit_quality"
  | "support"
  | "billing"
  | "general";

export type FeedbackStatus =
  | "new"
  | "triaged"
  | "needs_info"
  | "planned"
  | "in_progress"
  | "in_qa"
  | "released"
  | "closed"
  | "declined";

export type FeedbackPriority = "critical" | "high" | "medium" | "low";

export type FeedbackRecord = {
  id: string;
  title: string;
  type: FeedbackType;
  priority: FeedbackPriority;
  status: FeedbackStatus;
  reporterName: string;
  reporterEmail: string;
  reporterUserId: string;
  reporterPlan: "free" | "pro" | "premium" | "bike_shop";
  reportedAt: string;
  page: string;
  fitRunId?: string;
  bikeId?: string;
  assignedTo?: string;
  linkedRelease?: string;
  productArea: "Fit engine" | "Geometry" | "Billing" | "Mobile" | "Reports" | "Dashboard" | "Integrations" | "Other";
  browserInfo: string;
  summary: string;
  description: string;
  expectedResult?: string;
  actualResult?: string;
  upvoteCount?: number;
  requesterCount?: number;
};

type FeedbackComment = {
  id: string;
  author: string;
  createdAt: string;
  isInternal: boolean;
  body: string;
};

const TYPE_LABELS: Record<FeedbackType, string> = {
  bug: "Bug",
  feature_request: "Feature request",
  fit_quality: "Fit quality",
  support: "Support",
  billing: "Billing",
  general: "General",
};

const STATUS_LABELS: Record<FeedbackStatus, string> = {
  new: "New",
  triaged: "Triaged",
  needs_info: "Needs info",
  planned: "Planned",
  in_progress: "In progress",
  in_qa: "In QA",
  released: "Released",
  closed: "Closed",
  declined: "Declined",
};

const PRIORITY_LABELS: Record<FeedbackPriority, string> = {
  critical: "Critical",
  high: "High",
  medium: "Medium",
  low: "Low",
};

const feedbackItems: FeedbackRecord[] = [
  {
    id: "feedback_001",
    title: "Saddle height recommendation overshoots by a full notch",
    type: "bug",
    priority: "critical",
    status: "triaged",
    reporterName: "Ellie Vermeer",
    reporterEmail: "ellie@example.com",
    reporterUserId: "user_ellie",
    reporterPlan: "premium",
    reportedAt: "2026-03-20",
    page: "/dashboard/fit/fit_18255/results",
    fitRunId: "fit_18255",
    bikeId: "bike_road_01",
    assignedTo: "Morgan Reed",
    linkedRelease: "v1.18.0",
    productArea: "Fit engine",
    browserInfo: "Chrome 124 on macOS 14.4",
    summary: "A recent fit run placed the saddle 12mm higher than the validated baseline.",
    description: "The recommendation jumps beyond the prior seatpost mark and does not match the earlier fit history.",
    expectedResult: "Recommendation should stay within the validated range.",
    actualResult: "Recommendation moved outside the expected limit.",
  },
  {
    id: "feedback_002",
    title: "Bulk import of rider notes would save admin time",
    type: "feature_request",
    priority: "high",
    status: "planned",
    reporterName: "Northwind Cycles",
    reporterEmail: "ops@northwindcycles.com",
    reporterUserId: "user_omar",
    reporterPlan: "bike_shop",
    reportedAt: "2026-03-19",
    page: "/admin/rider-data",
    assignedTo: "Tess Novak",
    linkedRelease: "Backlog",
    productArea: "Dashboard",
    browserInfo: "Chrome 123 on Windows 11",
    summary: "The team wants CSV import for notes and manual review tags.",
    description: "Repetitive copy/paste work is slowing support triage on the shop account.",
    requesterCount: 5,
    upvoteCount: 18,
  },
  {
    id: "feedback_003",
    title: "The flexibility prompt feels too aggressive for recovery riders",
    type: "fit_quality",
    priority: "medium",
    status: "needs_info",
    reporterName: "Sara Jansen",
    reporterEmail: "sara@example.com",
    reporterUserId: "user_sara",
    reporterPlan: "free",
    reportedAt: "2026-03-18",
    page: "/dashboard/profile/improve/flexibility",
    assignedTo: "Unassigned",
    linkedRelease: "Investigating",
    productArea: "Fit engine",
    browserInfo: "Safari 17 on iPhone 15",
    summary: "The guidance nudges toward a more aggressive position than expected.",
    description: "The user is recovering from an injury and wants a gentler progression plan.",
    expectedResult: "Suggestion should allow a conservative progression path.",
    actualResult: "The current flow suggests a larger adjustment too early.",
  },
  {
    id: "feedback_004",
    title: "Need a billing email trail for suspended shop accounts",
    type: "billing",
    priority: "high",
    status: "triaged",
    reporterName: "Omar de Wit",
    reporterEmail: "omar@example.com",
    reporterUserId: "user_omar",
    reporterPlan: "pro",
    reportedAt: "2026-03-17",
    page: "/settings",
    assignedTo: "Morgan Reed",
    linkedRelease: "v1.18.1",
    productArea: "Billing",
    browserInfo: "Chrome 124 on macOS 14.4",
    summary: "Support wants a clearer chain of events for suspension and restore actions.",
    description: "Without a visible audit trail, the billing support team needs to ask engineering for context.",
    requesterCount: 2,
    upvoteCount: 7,
  },
  {
    id: "feedback_005",
    title: "Question about dashboard banner dismissal",
    type: "support",
    priority: "low",
    status: "closed",
    reporterName: "Jules Vermeer",
    reporterEmail: "jules@example.com",
    reporterUserId: "user_jules",
    reporterPlan: "premium",
    reportedAt: "2026-03-16",
    page: "/dashboard",
    assignedTo: "Tess Novak",
    linkedRelease: "Resolved",
    productArea: "Dashboard",
    browserInfo: "Firefox 124 on Linux",
    summary: "User asked when a sticky warning can be dismissed.",
    description: "This was answered by support and linked to the updated product note.",
  },
];

const commentsByItem: Record<string, FeedbackComment[]> = {
  feedback_001: [
    {
      id: "comment_001",
      author: "Morgan Reed",
      createdAt: "2026-03-20 09:12",
      isInternal: true,
      body: "Confirmed against the current fit baseline. Needs a follow-up with the measurement pipeline.",
    },
    {
      id: "comment_002",
      author: "Support",
      createdAt: "2026-03-20 11:05",
      isInternal: false,
      body: "Thanks for the report. We confirmed the issue and are working on a fix.",
    },
  ],
  feedback_002: [
    {
      id: "comment_003",
      author: "Tess Novak",
      createdAt: "2026-03-19 14:40",
      isInternal: true,
      body: "High-value request for shops. Adding to the dashboard roadmap.",
    },
  ],
  feedback_003: [
    {
      id: "comment_004",
      author: "Morgan Reed",
      createdAt: "2026-03-18 17:30",
      isInternal: true,
      body: "Need clarification on the recovery timeline before we can tune the hint wording.",
    },
  ],
  feedback_004: [
    {
      id: "comment_005",
      author: "Support",
      createdAt: "2026-03-17 10:04",
      isInternal: false,
      body: "We are adding a clearer history view to the admin billing surface.",
    },
  ],
};

function formatDate(dateString: string) {
  return new Intl.DateTimeFormat("en", {
    dateStyle: "medium",
  }).format(new Date(dateString));
}

function formatRelativeDate(dateString: string) {
  const date = new Date(dateString);
  const diffDays = Math.round((Date.now() - date.getTime()) / (1000 * 60 * 60 * 24));

  if (diffDays <= 0) return "Today";
  if (diffDays === 1) return "1 day ago";
  if (diffDays < 30) return `${diffDays} days ago`;
  return `${Math.round(diffDays / 30)} months ago`;
}

function typeTone(type: FeedbackType) {
  switch (type) {
    case "bug":
      return "danger";
    case "feature_request":
      return "info";
    case "fit_quality":
      return "warning";
    case "billing":
      return "neutral";
    case "support":
      return "success";
    case "general":
    default:
      return "neutral";
  }
}

function statusTone(status: FeedbackStatus) {
  switch (status) {
    case "released":
      return "success";
    case "closed":
      return "neutral";
    case "declined":
      return "danger";
    case "planned":
    case "in_progress":
    case "in_qa":
      return "info";
    case "triaged":
    case "needs_info":
      return "warning";
    case "new":
    default:
      return "neutral";
  }
}

function priorityTone(priority: FeedbackPriority) {
  switch (priority) {
    case "critical":
      return "danger";
    case "high":
      return "warning";
    case "medium":
      return "info";
    case "low":
    default:
      return "neutral";
  }
}

function cardBorder(selected: boolean) {
  return selected
    ? "border-[color:color-mix(in_oklch,var(--primary)_30%,var(--border))] bg-[color:color-mix(in_oklch,var(--primary)_8%,var(--card))]"
    : "border-[color:var(--border)] bg-[color:var(--card)]";
}

function getItemLinks(item: FeedbackRecord) {
  return [
    item.page ? { label: "Page", href: item.page } : null,
    item.fitRunId ? { label: "Fit run", href: `/admin/fit-runs/${item.fitRunId}` } : null,
    item.bikeId ? { label: "Bike", href: `/admin/bikes/${item.bikeId}` } : null,
  ].filter(Boolean) as Array<{ label: string; href: string }>;
}

function ItemPill({
  label,
  tone,
}: {
  label: string;
  tone: Parameters<typeof AdminStatusPill>[0]["tone"];
}) {
  return <AdminStatusPill tone={tone}>{label}</AdminStatusPill>;
}

export function FeedbackInboxView() {
  const [typeFilter, setTypeFilter] = useState<"all" | FeedbackType>("all");
  const [statusFilter, setStatusFilter] = useState<"all" | FeedbackStatus>("all");
  const [priorityFilter, setPriorityFilter] = useState<"all" | FeedbackPriority>("all");
  const [assignedFilter, setAssignedFilter] = useState<"all" | "me">("all");
  const [search, setSearch] = useState("");
  const [selectedIds, setSelectedIds] = useState<string[]>(["feedback_001"]);

  const filteredItems = useMemo(() => {
    const query = search.trim().toLowerCase();

    return feedbackItems.filter((item) => {
      const matchesType = typeFilter === "all" || item.type === typeFilter;
      const matchesStatus = statusFilter === "all" || item.status === statusFilter;
      const matchesPriority = priorityFilter === "all" || item.priority === priorityFilter;
      const matchesAssigned = assignedFilter === "all" || item.assignedTo === "Morgan Reed";
      const matchesQuery =
        !query ||
        item.title.toLowerCase().includes(query) ||
        item.reporterName.toLowerCase().includes(query) ||
        item.summary.toLowerCase().includes(query);

      return matchesType && matchesStatus && matchesPriority && matchesAssigned && matchesQuery;
    });
  }, [assignedFilter, priorityFilter, search, statusFilter, typeFilter]);

  const selectedCount = selectedIds.length;

  return (
    <div className="space-y-6">
      <AdminSectionCard
        title="Feedback inbox"
        description="Bug reports, feature requests, fit concerns, and support cases in one triage surface."
        actions={
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" size="sm">
              Assign
            </Button>
            <Button variant="outline" size="sm">
              Change status
            </Button>
            <Button variant="outline" size="sm">
              Mark duplicate
            </Button>
          </div>
        }
      >
        <div className="space-y-4">
          <div className="grid gap-3 xl:grid-cols-[minmax(0,1.5fr)_repeat(3,minmax(0,1fr))]">
            <Input value={search} onChange={(event) => setSearch(event.currentTarget.value)} placeholder="Search title, reporter, or summary" />
            <Select
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.currentTarget.value as typeof statusFilter)}
              options={[
                { value: "all", label: "All statuses" },
                { value: "new", label: "New" },
                { value: "triaged", label: "Triaged" },
                { value: "needs_info", label: "Needs info" },
                { value: "planned", label: "Planned" },
                { value: "in_progress", label: "In progress" },
                { value: "in_qa", label: "In QA" },
                { value: "released", label: "Released" },
                { value: "closed", label: "Closed" },
              ]}
            />
            <Select
              value={priorityFilter}
              onChange={(event) => setPriorityFilter(event.currentTarget.value as typeof priorityFilter)}
              options={[
                { value: "all", label: "All priorities" },
                { value: "critical", label: "Critical" },
                { value: "high", label: "High" },
                { value: "medium", label: "Medium" },
                { value: "low", label: "Low" },
              ]}
            />
            <Select
              value={assignedFilter}
              onChange={(event) => setAssignedFilter(event.currentTarget.value as typeof assignedFilter)}
              options={[
                { value: "all", label: "All assignees" },
                { value: "me", label: "Assigned to me" },
              ]}
            />
          </div>

          <SegmentedControl
            aria-label="Feedback type filter"
            value={typeFilter}
            onValueChange={(value) => setTypeFilter(value as typeof typeFilter)}
            size="sm"
            className="flex-wrap"
          >
            <SegmentedControlItem value="all" size="sm">
              All
            </SegmentedControlItem>
            <SegmentedControlItem value="bug" size="sm">
              Bugs
            </SegmentedControlItem>
            <SegmentedControlItem value="feature_request" size="sm">
              Feature requests
            </SegmentedControlItem>
            <SegmentedControlItem value="fit_quality" size="sm">
              Fit quality
            </SegmentedControlItem>
            <SegmentedControlItem value="support" size="sm">
              Support
            </SegmentedControlItem>
          </SegmentedControl>

          {selectedCount > 0 ? (
            <div className="flex flex-wrap items-center justify-between gap-3 rounded-[var(--radius-lg)] border border-[color:color-mix(in_oklch,var(--primary)_20%,var(--border))] bg-[color:color-mix(in_oklch,var(--primary)_8%,var(--card))] px-4 py-3 text-sm">
              <p className="text-[color:var(--foreground)]">
                {selectedCount} item{selectedCount === 1 ? "" : "s"} selected
              </p>
              <div className="flex flex-wrap gap-2">
                <Button variant="outline" size="sm">
                  Change status
                </Button>
                <Button variant="outline" size="sm">
                  Assign to admin
                </Button>
                <Button variant="ghost" size="sm" onClick={() => setSelectedIds([])}>
                  Clear selection
                </Button>
              </div>
            </div>
          ) : null}

          <AdminTable>
            <AdminTableHead
              columns={["", "Title", "Type", "Priority", "Status", "Reporter", "Reported", "Assigned to", "Linked release"]}
            />
            <tbody>
              {filteredItems.map((item) => {
                const selected = selectedIds.includes(item.id);
                return (
                  <tr key={item.id} className={cn("border-t border-[color:var(--border)]", selected ? "bg-[color:color-mix(in_oklch,var(--primary)_8%,var(--card))]" : "")}>
                    <AdminTableCell className="w-16">
                      <Selectable
                        selected={selected}
                        variant="pill"
                        mode="button"
                        className="min-w-[4.5rem] justify-center"
                        onClick={() =>
                          setSelectedIds((current) =>
                            current.includes(item.id)
                              ? current.filter((selectedId) => selectedId !== item.id)
                              : [...current, item.id]
                          )
                        }
                      >
                        {selected ? "Selected" : "Select"}
                      </Selectable>
                    </AdminTableCell>
                    <AdminTableCell className="font-medium">
                      <Button variant="ghost" size="sm" className="h-auto p-0 text-left font-medium" render={<Link href={`/admin/feedback/${item.id}`} />}>
                        {item.title}
                      </Button>
                      <p className="mt-1 max-w-xl text-xs leading-5 text-[color:var(--muted-foreground)]">
                        {item.summary}
                      </p>
                    </AdminTableCell>
                    <AdminTableCell>
                      <ItemPill label={TYPE_LABELS[item.type]} tone={typeTone(item.type)} />
                    </AdminTableCell>
                    <AdminTableCell>
                      <ItemPill label={PRIORITY_LABELS[item.priority]} tone={priorityTone(item.priority)} />
                    </AdminTableCell>
                    <AdminTableCell>
                      <ItemPill label={STATUS_LABELS[item.status]} tone={statusTone(item.status)} />
                    </AdminTableCell>
                    <AdminTableCell>
                      <div>{item.reporterName}</div>
                      <div className="text-xs text-[color:var(--muted-foreground)]">{item.reporterPlan}</div>
                    </AdminTableCell>
                    <AdminTableCell>{formatRelativeDate(item.reportedAt)}</AdminTableCell>
                    <AdminTableCell>{item.assignedTo ?? "Unassigned"}</AdminTableCell>
                    <AdminTableCell>{item.linkedRelease ?? "—"}</AdminTableCell>
                  </tr>
                );
              })}
            </tbody>
          </AdminTable>
        </div>
      </AdminSectionCard>
    </div>
  );
}

export function FeedbackDetailView({ itemId }: { itemId: string }) {
  const item = feedbackItems.find((entry) => entry.id === itemId) ?? feedbackItems[0];
  const [status, setStatus] = useState<FeedbackStatus>(item.status);
  const [priority, setPriority] = useState<FeedbackPriority>(item.priority);
  const [assignedTo, setAssignedTo] = useState(item.assignedTo ?? "Unassigned");
  const [productArea, setProductArea] = useState(item.productArea);
  const [replyMode, setReplyMode] = useState<"internal" | "reply">("internal");
  const [comment, setComment] = useState("");
  const [duplicateQuery, setDuplicateQuery] = useState("");
  const [releaseDialogOpen, setReleaseDialogOpen] = useState(false);
  const comments = commentsByItem[item.id] ?? [];

  const duplicateMatches = feedbackItems.filter((candidate) => candidate.id !== item.id && candidate.title.toLowerCase().includes(duplicateQuery.trim().toLowerCase()));

  return (
    <div className="space-y-6">
      <AdminSectionCard
        title={item.title}
        description="Admin detail view with the planned triage controls."
        actions={
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" size="sm" onClick={() => setReleaseDialogOpen(true)}>
              Link to release
            </Button>
            <Button variant="outline" size="sm">
              Create new release
            </Button>
          </div>
        }
      >
        <div className="grid gap-6 xl:grid-cols-[minmax(0,1.3fr)_minmax(22rem,0.7fr)]">
          <div className="space-y-6">
            <Card className={cardBorder(false)}>
              <CardHeader className="space-y-3">
                <div className="flex flex-wrap items-center gap-2">
                  <ItemPill label={TYPE_LABELS[item.type]} tone={typeTone(item.type)} />
                  <ItemPill label={PRIORITY_LABELS[priority]} tone={priorityTone(priority)} />
                  <ItemPill label={STATUS_LABELS[status]} tone={statusTone(status)} />
                </div>
                <CardDescription>
                  Reported by {item.reporterName} on {formatDate(item.reportedAt)} from {item.page}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <div className="text-xs uppercase tracking-[0.18em] text-[color:var(--muted-foreground)]">Reporter</div>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="-ml-2 h-auto px-2 py-1 font-medium"
                      render={<Link href={`/admin/rider-data/${item.reporterUserId}`} />}
                    >
                      {item.reporterName}
                    </Button>
                    <p className="text-sm text-[color:var(--muted-foreground)]">{item.reporterEmail}</p>
                  </div>
                  <div>
                    <div className="text-xs uppercase tracking-[0.18em] text-[color:var(--muted-foreground)]">Assigned to</div>
                    <Select
                      value={assignedTo}
                      onChange={(event) => setAssignedTo(event.currentTarget.value)}
                      options={[
                        { value: "Unassigned", label: "Unassigned" },
                        { value: "Morgan Reed", label: "Morgan Reed" },
                        { value: "Tess Novak", label: "Tess Novak" },
                        { value: "Alex Morgan", label: "Alex Morgan" },
                      ]}
                    />
                  </div>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <Select
                    label="Status"
                    value={status}
                    onChange={(event) => setStatus(event.currentTarget.value as FeedbackStatus)}
                    options={Object.entries(STATUS_LABELS).map(([value, label]) => ({ value, label }))}
                  />
                  <Select
                    label="Priority"
                    value={priority}
                    onChange={(event) => setPriority(event.currentTarget.value as FeedbackPriority)}
                    options={Object.entries(PRIORITY_LABELS).map(([value, label]) => ({ value, label }))}
                  />
                </div>
                <Select
                  label="Product area"
                  value={productArea}
                  onChange={(event) => setProductArea(event.currentTarget.value as FeedbackRecord["productArea"])}
                  options={["Fit engine", "Geometry", "Billing", "Mobile", "Reports", "Dashboard", "Integrations", "Other"].map((value) => ({ value, label: value }))}
                />
                <Textarea label="Description" rows={4} value={item.description} readOnly />
                {item.expectedResult ? <Textarea label="Expected result" rows={3} value={item.expectedResult} readOnly /> : null}
                {item.actualResult ? <Textarea label="Actual result" rows={3} value={item.actualResult} readOnly /> : null}

                <details className="rounded-[var(--radius-lg)] border border-[color:var(--border)] bg-[color:var(--secondary)] p-4">
                  <summary className="cursor-pointer text-sm font-medium">Browser info</summary>
                  <p className="mt-3 text-sm text-[color:var(--muted-foreground)]">{item.browserInfo}</p>
                </details>

                <div className="space-y-2">
                  <div className="text-xs uppercase tracking-[0.18em] text-[color:var(--muted-foreground)]">Attached records</div>
                  <div className="flex flex-wrap gap-2">
                    {getItemLinks(item).map((link) => (
                      <Button key={link.href} variant="outline" size="sm" render={<Link href={link.href} />}>
                        {link.label}
                      </Button>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card className={cardBorder(false)}>
              <CardHeader>
                <CardTitle className="text-base">Workflow</CardTitle>
                <CardDescription>Apply the triage, planning, and release-state controls.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Select
                  label="Workflow status"
                  value={status}
                  onChange={(event) => setStatus(event.currentTarget.value as FeedbackStatus)}
                  options={Object.entries(STATUS_LABELS).map(([value, label]) => ({ value, label }))}
                />
                <Select
                  label="Assignee"
                  value={assignedTo}
                  onChange={(event) => setAssignedTo(event.currentTarget.value)}
                  options={[
                    { value: "Unassigned", label: "Unassigned" },
                    { value: "Morgan Reed", label: "Morgan Reed" },
                    { value: "Tess Novak", label: "Tess Novak" },
                    { value: "Alex Morgan", label: "Alex Morgan" },
                  ]}
                />
                <Button variant="outline" className="w-full" onClick={() => setReleaseDialogOpen(true)}>
                  Link release
                </Button>
              </CardContent>
            </Card>

            <Card className={cardBorder(false)}>
              <CardHeader>
                <CardTitle className="text-base">Duplicate search</CardTitle>
                <CardDescription>Mark the item as a duplicate of another feedback record.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <Input
                  placeholder="Search feedback title"
                  value={duplicateQuery}
                  onChange={(event) => setDuplicateQuery(event.currentTarget.value)}
                />
                <div className="space-y-2">
                  {duplicateMatches.slice(0, 4).map((candidate) => (
                    <button
                      key={candidate.id}
                      type="button"
                      className="flex w-full items-start justify-between rounded-[var(--radius-md)] border border-[color:var(--border)] px-3 py-2 text-left text-sm hover:bg-[color:var(--accent)]"
                    >
                      <span>{candidate.title}</span>
                      <span className="text-xs text-[color:var(--muted-foreground)]">{candidate.status}</span>
                    </button>
                  ))}
                  {duplicateMatches.length === 0 ? (
                    <p className="text-sm text-[color:var(--muted-foreground)]">No matching items found.</p>
                  ) : null}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </AdminSectionCard>

      <AdminSectionCard
        title="Comment thread"
        description="Internal notes stay hidden from users. Replies create dashboard messages."
      >
        <div className="space-y-4">
          <SegmentedControl
            aria-label="Comment mode"
            value={replyMode}
            onValueChange={(value) => setReplyMode(value as typeof replyMode)}
            size="sm"
          >
            <SegmentedControlItem value="internal" size="sm">
              Internal note
            </SegmentedControlItem>
            <SegmentedControlItem value="reply" size="sm">
              Reply to user
            </SegmentedControlItem>
          </SegmentedControl>

          <Textarea
            label={replyMode === "internal" ? "Internal note" : "Reply to user"}
            rows={4}
            value={comment}
            onChange={(event) => setComment(event.currentTarget.value)}
            placeholder={replyMode === "internal" ? "Add triage context for the admin team." : "Draft the user-facing reply."}
          />
          <div className="flex justify-end">
            <Button>Submit comment</Button>
          </div>

          <div className="space-y-3">
            {comments.map((entry) => (
              <div
                key={entry.id}
                className={cn(
                  "rounded-[var(--radius-lg)] border p-4 text-sm",
                  entry.isInternal
                    ? "border-[color:var(--border)] bg-[color:var(--secondary)]"
                    : "border-[color:color-mix(in_oklch,var(--primary)_20%,var(--border))] bg-[color:color-mix(in_oklch,var(--primary)_8%,var(--card))]"
                )}
              >
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-medium">{entry.author}</span>
                  <span className="text-xs text-[color:var(--muted-foreground)]">{entry.createdAt}</span>
                  <AdminStatusPill tone={entry.isInternal ? "neutral" : "info"}>
                    {entry.isInternal ? "Internal note" : "Reply sent"}
                  </AdminStatusPill>
                </div>
                <p className="mt-2 text-[color:var(--foreground)]">{entry.body}</p>
              </div>
            ))}
          </div>
        </div>
      </AdminSectionCard>

      <AccessibleDialog
        open={releaseDialogOpen}
        title="Link to release"
        description="Select a release to associate with this feedback item."
        onClose={() => setReleaseDialogOpen(false)}
      >
        <div className="space-y-4">
          <Select
            label="Release"
            value={item.linkedRelease ?? "v1.18.0"}
            onChange={() => undefined}
            options={[
              { value: "v1.18.0", label: "v1.18.0" },
              { value: "v1.18.1", label: "v1.18.1" },
              { value: "Backlog", label: "Backlog" },
              { value: "Investigating", label: "Investigating" },
            ]}
          />
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setReleaseDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={() => setReleaseDialogOpen(false)}>Link release</Button>
          </div>
        </div>
      </AccessibleDialog>
    </div>
  );
}

export function FeatureRequestsBoardView() {
  const featureRequests = feedbackItems.filter((item) => item.type === "feature_request");
  const grouped = {
    backlog: featureRequests.filter((item) => item.status === "new" || item.status === "triaged" || item.status === "needs_info"),
    planned: featureRequests.filter((item) => item.status === "planned"),
    progress: featureRequests.filter((item) => item.status === "in_progress" || item.status === "in_qa"),
    shipped: featureRequests.filter((item) => item.status === "released"),
  } satisfies Record<string, FeedbackRecord[]>;

  return (
    <div className="space-y-6">
      <AdminSectionCard
        title="Feature request board"
        description="Grouped view of planned, in-flight, and released feature requests."
        actions={
          <Button variant="outline" size="sm">
            Merge selected
          </Button>
        }
      >
        <div className="grid gap-4 xl:grid-cols-4">
          {Object.entries(grouped).map(([groupName, items]) => (
            <Card key={groupName} className="border-[color:var(--border)] bg-[color:var(--card)]">
              <CardHeader>
                <CardTitle className="text-base capitalize">{groupName}</CardTitle>
                <CardDescription>{items.length} request{items.length === 1 ? "" : "s"}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {items
                  .sort((left, right) => (right.upvoteCount ?? 0) - (left.upvoteCount ?? 0))
                  .map((item) => (
                    <div key={item.id} className="space-y-3 rounded-[var(--radius-lg)] border border-[color:var(--border)] p-4">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <p className="font-medium">{item.title}</p>
                          <p className="mt-1 text-xs text-[color:var(--muted-foreground)]">{item.reporterName}</p>
                        </div>
                        <AdminStatusPill tone={priorityTone(item.priority)}>{item.upvoteCount ?? 0} votes</AdminStatusPill>
                      </div>
                      <p className="text-sm text-[color:var(--muted-foreground)]">
                        {item.requesterCount ? `${item.requesterCount} reporters` : "Single reporter"} • {item.productArea}
                      </p>
                      <div className="flex flex-wrap gap-2">
                        <Button variant="outline" size="sm" render={<Link href={`/admin/feedback/${item.id}`} />}>
                          Open
                        </Button>
                        <Button variant="ghost" size="sm">
                          Merge duplicate
                        </Button>
                      </div>
                    </div>
                  ))}
              </CardContent>
            </Card>
          ))}
        </div>
      </AdminSectionCard>
    </div>
  );
}
