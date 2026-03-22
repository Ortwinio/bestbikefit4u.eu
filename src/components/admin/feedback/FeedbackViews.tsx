"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import { useMutation } from "convex/react";
import { useRouter } from "next/navigation";
import { api } from "@/../convex/_generated/api";
import type { Id } from "@/../convex/_generated/dataModel";
import {
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
import type { Doc } from "../../../../convex/_generated/dataModel";
import type {
  FeedbackComposeData,
  FeedbackDetailData,
  FeedbackFilters,
  FeedbackInboxRow,
} from "./feedback-data";
import {
  feedbackPriorityLabel,
  feedbackPriorityTone,
  feedbackStatusLabel,
  feedbackStatusTone,
  feedbackTypeLabel,
  feedbackTypeTone,
  type FeedbackPriority,
  type FeedbackStatus,
  type FeedbackType,
} from "./feedback-ui";
import { formatAdminDateTime, getAdminDisplayName } from "../shared/admin-format";

const statusOptions: Array<{ value: "all" | FeedbackStatus; label: string }> = [
  { value: "all", label: "All statuses" },
  { value: "new", label: "New" },
  { value: "triaged", label: "Triaged" },
  { value: "needs_info", label: "Needs info" },
  { value: "planned", label: "Planned" },
  { value: "in_progress", label: "In progress" },
  { value: "in_qa", label: "In QA" },
  { value: "released", label: "Released" },
  { value: "closed", label: "Closed" },
  { value: "declined", label: "Declined" },
];

const typeOptions: Array<{ value: "all" | FeedbackType; label: string }> = [
  { value: "all", label: "All types" },
  { value: "bug", label: "Bugs" },
  { value: "feature_request", label: "Feature requests" },
  { value: "support_case", label: "Support cases" },
];

const priorityOptions: Array<{ value: FeedbackPriority; label: string }> = [
  { value: "low", label: "Low" },
  { value: "normal", label: "Normal" },
  { value: "high", label: "High" },
  { value: "urgent", label: "Urgent" },
];

function buildFeedbackHref({
  type,
  status,
  nextType,
  nextStatus,
}: {
  type: string;
  status: string;
  nextType?: string;
  nextStatus?: string;
}) {
  const params = new URLSearchParams();
  const resolvedType = nextType ?? type;
  const resolvedStatus = nextStatus ?? status;
  if (resolvedType && resolvedType !== "all") params.set("type", resolvedType);
  if (resolvedStatus && resolvedStatus !== "all") params.set("status", resolvedStatus);
  const query = params.toString();
  return query ? `/admin/feedback?${query}` : "/admin/feedback";
}

function buildFeatureRequestsHref(status: string) {
  const params = new URLSearchParams();
  if (status && status !== "all") params.set("status", status);
  const query = params.toString();
  return query ? `/admin/feedback/feature-requests?${query}` : "/admin/feedback/feature-requests";
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

function SnapshotCard({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: ReactNode;
}) {
  return (
    <Card className="border-[color:var(--border)] bg-[color:var(--card)]">
      <CardHeader>
        <CardTitle className="text-base">{title}</CardTitle>
        {description ? <CardDescription>{description}</CardDescription> : null}
      </CardHeader>
      <CardContent className="space-y-3">{children}</CardContent>
    </Card>
  );
}

function LinkedSnapshot({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-[color:var(--border)] bg-[color:var(--secondary)] p-4">
      <p className="text-xs font-semibold uppercase tracking-wide text-[color:var(--muted-foreground)]">
        {title}
      </p>
      <div className="mt-2 text-sm leading-6 text-[color:var(--foreground)]">{children}</div>
    </div>
  );
}

function feedbackBikeLabel(bike: Pick<Doc<"bikes">, "name" | "brand" | "model" | "bikeType"> | null | undefined) {
  if (!bike) {
    return "Unknown bike";
  }

  const branded = [bike.brand, bike.model].filter(Boolean).join(" ");
  return bike.name && branded ? `${bike.name} · ${branded}` : bike.name ?? branded ?? bike.bikeType;
}

export function FeedbackInboxView({
  rows,
  filters,
}: {
  rows: FeedbackInboxRow[];
  filters: FeedbackFilters & { type: string; status: string };
}) {
  const openCount = rows.filter((row) => row.item.status !== "closed" && row.item.status !== "declined").length;
  const featureRequestCount = rows.filter((row) => row.item.type === "feature_request").length;
  const triagedCount = rows.filter((row) => row.item.status === "triaged").length;

  return (
    <div className="space-y-6">
      <AdminSectionCard
        title="Feedback inbox"
        description="Live triage queue from Convex. Filters are backed by the admin feedback query."
        actions={
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" render={<Link href="/admin/feedback/feature-requests" />}>
              Feature requests
            </Button>
          </div>
        }
      >
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {summaryCard("Loaded", rows.length, "Live feedback items")}
          {summaryCard("Open", openCount, "Not closed or declined")}
          {summaryCard("Feature requests", featureRequestCount, "Planning candidates")}
          {summaryCard("Triaged", triagedCount, "Already reviewed")}
        </div>

        <div className="mt-6 space-y-4">
          <div className="flex flex-wrap gap-2">
            {typeOptions.map((option) => {
              const active = filters.type === option.value || (filters.type === "" && option.value === "all");
              return (
                <Button
                  key={option.value}
                  size="sm"
                  variant={active ? "primary" : "outline"}
                  render={
                    <Link
                      href={buildFeedbackHref({
                        type: filters.type,
                        status: filters.status,
                        nextType: option.value,
                      })}
                    />
                  }
                >
                  {option.label}
                </Button>
              );
            })}
          </div>
          <div className="flex flex-wrap gap-2">
            {statusOptions.map((option) => {
              const active = filters.status === option.value || (filters.status === "" && option.value === "all");
              return (
                <Button
                  key={option.value}
                  size="sm"
                  variant={active ? "primary" : "outline"}
                  render={
                    <Link
                      href={buildFeedbackHref({
                        type: filters.type,
                        status: filters.status,
                        nextStatus: option.value,
                      })}
                    />
                  }
                >
                  {option.label}
                </Button>
              );
            })}
          </div>
        </div>

        {rows.length === 0 ? (
          <div className="mt-6">
            <EmptyState
              title="No feedback found"
              description="No live feedback items matched the current filters."
            />
          </div>
        ) : (
          <div className="mt-6">
            <AdminTable>
              <AdminTableHead
                columns={["Title", "Type", "Priority", "Status", "Reporter", "Assigned", "Release", "Action"]}
              />
              <tbody>
                {rows.map((row) => (
                  <AdminTableRow key={row.item._id}>
                    <AdminTableCell className="font-medium">
                      <div>
                        <Link href={`/admin/feedback/${row.item._id}`} className="font-medium hover:underline">
                          {row.item.title}
                        </Link>
                        <p className="mt-1 text-xs text-[color:var(--muted-foreground)]">
                          {row.item.description}
                        </p>
                      </div>
                    </AdminTableCell>
                    <AdminTableCell>
                      <AdminStatusPill tone={feedbackTypeTone(row.item.type)}>
                        {feedbackTypeLabel(row.item.type)}
                      </AdminStatusPill>
                    </AdminTableCell>
                    <AdminTableCell>
                      <AdminStatusPill tone={feedbackPriorityTone(row.item.priority ?? "normal")}>
                        {feedbackPriorityLabel(row.item.priority ?? "normal")}
                      </AdminStatusPill>
                    </AdminTableCell>
                    <AdminTableCell>
                      <AdminStatusPill tone={feedbackStatusTone(row.item.status)}>
                        {feedbackStatusLabel(row.item.status)}
                      </AdminStatusPill>
                    </AdminTableCell>
                    <AdminTableCell>{row.reporterName}</AdminTableCell>
                    <AdminTableCell>{row.assigneeName}</AdminTableCell>
                    <AdminTableCell>{row.releaseName}</AdminTableCell>
                    <AdminTableCell>
                      <Button variant="outline" size="sm" render={<Link href={`/admin/feedback/${row.item._id}`} />}>
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

export function FeatureRequestsBoardView({
  rows,
  status,
}: {
  rows: FeedbackInboxRow[];
  status: string;
}) {
  const grouped = useMemo(() => {
    const buckets: Record<string, FeedbackInboxRow[]> = {};
    for (const row of rows) {
      const key = row.item.status;
      buckets[key] ??= [];
      buckets[key].push(row);
    }
    return buckets;
  }, [rows]);

  const columns: FeedbackStatus[] = ["new", "triaged", "planned", "in_progress", "in_qa", "released"];

  return (
    <div className="space-y-6">
      <AdminSectionCard
        title="Feature request board"
        description="Backend-backed board grouped by live feedback status."
        actions={
          <Button variant="outline" render={<Link href={buildFeatureRequestsHref(status)} />}>
            Open inbox
          </Button>
        }
      >
        <div className="grid gap-4 xl:grid-cols-3">
          {columns.map((column) => {
            const items = grouped[column] ?? [];
            return (
              <Card key={column} className="border-[color:var(--border)] bg-[color:var(--card)]">
                <CardHeader>
                  <CardTitle className="text-base">{feedbackStatusLabel(column)}</CardTitle>
                  <CardDescription>
                    {items.length} request{items.length === 1 ? "" : "s"}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {items.length === 0 ? (
                    <EmptyState
                      title={`No ${feedbackStatusLabel(column).toLowerCase()} requests`}
                      description="No live items in this status."
                      className="border-none bg-transparent p-0 shadow-none"
                    />
                  ) : (
                    items.map((row) => (
                      <div
                        key={row.item._id}
                        className="rounded-2xl border border-[color:var(--border)] bg-[color:var(--secondary)] p-4"
                      >
                        <div className="flex flex-wrap items-center gap-2">
                          <AdminStatusPill tone={feedbackTypeTone(row.item.type)}>
                            {feedbackTypeLabel(row.item.type)}
                          </AdminStatusPill>
                          <AdminStatusPill tone={feedbackPriorityTone(row.item.priority ?? "normal")}>
                            {feedbackPriorityLabel(row.item.priority ?? "normal")}
                          </AdminStatusPill>
                        </div>
                        <p className="mt-3 font-medium">{row.item.title}</p>
                        <p className="mt-1 text-sm text-[color:var(--muted-foreground)]">
                          {row.reporterName} · {row.releaseName}
                        </p>
                        <div className="mt-3">
                          <Button
                            variant="outline"
                            size="sm"
                            render={<Link href={`/admin/feedback/${row.item._id}`} />}
                          >
                            Open item
                          </Button>
                        </div>
                      </div>
                    ))
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      </AdminSectionCard>
    </div>
  );
}

function getReporterName(detail: FeedbackDetailData) {
  return getAdminDisplayName(detail.detail.user ?? null);
}

function getAssigneeOptions(users: FeedbackComposeData["users"]) {
  return [
    { value: "", label: "Unassigned" },
    ...users.map((user) => ({
      value: String(user._id),
      label: getAdminDisplayName(user),
    })),
  ];
}

function getReleaseOptions(releases: FeedbackComposeData["releases"]) {
  return [
    { value: "", label: "No release link" },
    ...releases.map((release) => ({
      value: String(release._id),
      label: release.versionLabel ? `${release.name} · ${release.versionLabel}` : release.name,
    })),
  ];
}

function selectValue(value: Id<"users"> | Id<"releases"> | undefined | null) {
  return value ? String(value) : "";
}

export function FeedbackDetailView({ data }: { data: FeedbackDetailData }) {
  const router = useRouter();
  const toast = useToast();
  const updateFeedback = useMutation(api.admin.mutations.updateFeedbackItem);
  const addComment = useMutation(api.admin.mutations.addFeedbackComment);
  const linkRelease = useMutation(api.admin.mutations.linkFeedbackToRelease);
  const [status, setStatus] = useState<FeedbackStatus>(data.detail.item.status);
  const [priority, setPriority] = useState<FeedbackPriority>(data.detail.item.priority ?? "normal");
  const [assignedTo, setAssignedTo] = useState<string>(selectValue(data.detail.item.assignedTo));
  const [productArea, setProductArea] = useState(data.detail.item.productArea ?? "");
  const [releaseId, setReleaseId] = useState<string>(selectValue(data.detail.item.linkedReleaseId));
  const [commentBody, setCommentBody] = useState("");
  const [isInternal, setIsInternal] = useState(true);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [commentError, setCommentError] = useState<string | null>(null);
  const [savePending, setSavePending] = useState(false);
  const [commentPending, setCommentPending] = useState(false);
  const [linkPending, setLinkPending] = useState(false);

  useEffect(() => {
    setStatus(data.detail.item.status);
    setPriority(data.detail.item.priority ?? "normal");
    setAssignedTo(selectValue(data.detail.item.assignedTo));
    setProductArea(data.detail.item.productArea ?? "");
    setReleaseId(selectValue(data.detail.item.linkedReleaseId));
  }, [data.detail.item]);

  const assigneeOptions = useMemo(() => getAssigneeOptions(data.users), [data.users]);
  const releaseOptions = useMemo(() => getReleaseOptions(data.releases), [data.releases]);

  const saveChanges = async () => {
    setSaveError(null);
    setSavePending(true);
    try {
      await updateFeedback({
        feedbackItemId: data.detail.item._id,
        status,
        priority,
        assignedTo: assignedTo ? (assignedTo as Id<"users">) : undefined,
        productArea: productArea.trim() || undefined,
      });
      router.refresh();
      toast.success({
        description: "Feedback item updated.",
      });
    } catch (error) {
      console.error("Failed to update feedback item:", error);
      setSaveError("Could not save the feedback changes.");
    } finally {
      setSavePending(false);
    }
  };

  const saveComment = async () => {
    const body = commentBody.trim();
    if (!body) {
      setCommentError("Write a comment before saving.");
      return;
    }

    setCommentError(null);
    setCommentPending(true);
    try {
      await addComment({
        feedbackItemId: data.detail.item._id,
        body,
        isInternal,
      });
      setCommentBody("");
      router.refresh();
      toast.success({
        description: isInternal ? "Internal note added." : "Reply added.",
      });
    } catch (error) {
      console.error("Failed to add feedback comment:", error);
      setCommentError("Could not save the comment.");
    } finally {
      setCommentPending(false);
    }
  };

  const saveReleaseLink = async () => {
    if (!releaseId) {
      setSaveError("Choose a release before linking.");
      return;
    }

    setLinkPending(true);
    setSaveError(null);
    try {
      await linkRelease({
        feedbackItemId: data.detail.item._id,
        releaseId: releaseId as Id<"releases">,
      });
      router.refresh();
      toast.success({
        description: "Feedback linked to release.",
      });
    } catch (error) {
      console.error("Failed to link feedback to release:", error);
      setSaveError("Could not link the feedback item to the release.");
    } finally {
      setLinkPending(false);
    }
  };

  const reporterName = getReporterName(data);
  const linkedBike = data.linkedBike;
  const linkedSession = data.linkedSession;

  return (
    <div className="space-y-6">
      <AdminSectionCard
        title={data.detail.item.title}
        description="Item-level triage, assignment, release linking, and user reply handling."
        actions={
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" render={<Link href="/admin/feedback" />}>
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
                  <AdminStatusPill tone={feedbackTypeTone(data.detail.item.type)}>
                    {feedbackTypeLabel(data.detail.item.type)}
                  </AdminStatusPill>
                  <AdminStatusPill tone={feedbackPriorityTone(priority)}>
                    {feedbackPriorityLabel(priority)}
                  </AdminStatusPill>
                  <AdminStatusPill tone={feedbackStatusTone(status)}>
                    {feedbackStatusLabel(status)}
                  </AdminStatusPill>
                </div>
                <CardDescription>
                  Reported by {reporterName} · Created {formatAdminDateTime(data.detail.item.createdAt)}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Textarea
                  label="Description"
                  rows={5}
                  value={data.detail.item.description}
                  readOnly
                />

                <div className="grid gap-4 sm:grid-cols-2">
                  <Select
                    label="Status"
                    value={status}
                    onChange={(event) => setStatus(event.currentTarget.value as FeedbackStatus)}
                    options={statusOptions.filter((option) => option.value !== "all").map((option) => ({
                      value: option.value,
                      label: option.label,
                    }))}
                  />
                  <Select
                    label="Priority"
                    value={priority}
                    onChange={(event) => setPriority(event.currentTarget.value as FeedbackPriority)}
                    options={priorityOptions}
                  />
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <Select
                    label="Assigned to"
                    value={assignedTo}
                    onChange={(event) => setAssignedTo(event.currentTarget.value)}
                    options={assigneeOptions}
                    helperText="Assign to an admin or leave unassigned."
                  />
                  <Input
                    label="Product area"
                    value={productArea}
                    onChange={(event) => setProductArea(event.currentTarget.value)}
                    placeholder="Frame fit, onboarding, billing..."
                    helperText="Optional live metadata field from Convex."
                  />
                </div>

                {saveError ? (
                  <p className="text-sm text-[color:var(--danger)]">{saveError}</p>
                ) : null}

                <div className="flex flex-wrap gap-2">
                  <Button onClick={() => void saveChanges()} isLoading={savePending}>
                    Save changes
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card className="border-[color:var(--border)] bg-[color:var(--card)]">
              <CardHeader>
                <CardTitle className="text-base">Comments</CardTitle>
                <CardDescription>Internal notes and user-facing replies are stored in Convex.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <SegmentedControl
                  aria-label="Comment mode"
                  value={isInternal ? "internal" : "reply"}
                  onValueChange={(value) => setIsInternal(value === "internal")}
                  size="sm"
                >
                  <SegmentedControlItem value="internal" size="sm">
                    Internal note
                  </SegmentedControlItem>
                  <SegmentedControlItem value="reply" size="sm">
                    Reply
                  </SegmentedControlItem>
                </SegmentedControl>
                <Textarea
                  rows={4}
                  value={commentBody}
                  onChange={(event) => {
                    setCommentError(null);
                    setCommentBody(event.currentTarget.value);
                  }}
                  placeholder={isInternal ? "Add triage context for the admin team." : "Draft the user-facing reply."}
                />
                {commentError ? (
                  <p className="text-sm text-[color:var(--danger)]">{commentError}</p>
                ) : null}
                <div className="flex justify-end">
                  <Button isLoading={commentPending} onClick={() => void saveComment()}>
                    Add comment
                  </Button>
                </div>
                <div className="space-y-3">
                  {data.detail.comments.length === 0 ? (
                    <EmptyState
                      title="No comments yet"
                      description="Add the first triage note or reply."
                      className="border-none bg-transparent p-0 shadow-none"
                    />
                  ) : (
                    data.detail.comments.map((entry) => {
                      const author = data.users.find((user) => user._id === entry.authorUserId);
                      return (
                        <div
                          key={entry._id}
                          className="rounded-2xl border border-[color:var(--border)] bg-[color:var(--secondary)] p-4"
                        >
                          <div className="flex flex-wrap items-center gap-2">
                            <AdminStatusPill tone={entry.isInternal ? "warning" : "success"}>
                              {entry.isInternal ? "Internal" : "Reply"}
                            </AdminStatusPill>
                            <span className="text-sm text-[color:var(--muted-foreground)]">
                              {author ? getAdminDisplayName(author) : "Unknown author"} ·{" "}
                              {formatAdminDateTime(entry.createdAt)}
                            </span>
                          </div>
                          <p className="mt-3 text-sm leading-6">{entry.body}</p>
                        </div>
                      );
                    })
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <SnapshotCard title="Triage summary" description="Live metadata from Convex.">
              <FieldValue label="Reporter">{reporterName}</FieldValue>
              <FieldValue label="Assignee">{data.assigneeName}</FieldValue>
              <FieldValue label="Release">
                {data.detail.release ? data.detail.release.name : "No release linked"}
              </FieldValue>
              <FieldValue label="Linked session">
                {data.detail.item.linkedSessionId ? data.detail.item.linkedSessionId : "Not linked"}
              </FieldValue>
              <FieldValue label="Linked bike">
                {data.detail.item.linkedBikeId ? feedbackBikeLabel(linkedBike?.bike) : "Not linked"}
              </FieldValue>
            </SnapshotCard>

            <Card className="border-[color:var(--border)] bg-[color:var(--card)]">
              <CardHeader>
                <CardTitle className="text-base">Release linking</CardTitle>
                <CardDescription>Use the live backend mutation to connect feedback with a release.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Select
                  label="Release"
                  value={releaseId}
                  onChange={(event) => setReleaseId(event.currentTarget.value)}
                  options={releaseOptions}
                  helperText="This write is live. Duplicate/secondary links are not yet modeled."
                />
                <Button
                  className="w-full"
                  variant="outline"
                  isLoading={linkPending}
                  onClick={() => void saveReleaseLink()}
                  disabled={!releaseId}
                >
                  Link release
                </Button>
                <p className="text-xs leading-5 text-[color:var(--muted-foreground)]">
                  Delete and duplicate workflows are not backed by the current backend contract.
                </p>
              </CardContent>
            </Card>

            <Card className="border-[color:var(--border)] bg-[color:var(--card)]">
              <CardHeader>
                <CardTitle className="text-base">Linked fit session</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {linkedSession ? (
                  <div className="space-y-3">
                    <FieldValue label="Session status">{linkedSession.session.status}</FieldValue>
                    <FieldValue label="Session owner">{getAdminDisplayName(linkedSession.user)}</FieldValue>
                    <FieldValue label="Bike">{feedbackBikeLabel(linkedSession.bike)}</FieldValue>
                    <FieldValue label="Engine version">
                      {linkedSession.engineVersion?.versionLabel ?? "No engine version"}
                    </FieldValue>
                    <FieldValue label="Profile">
                      {linkedSession.profile
                        ? `Height ${linkedSession.profile.heightCm} cm · Inseam ${linkedSession.profile.inseamCm} cm`
                        : "No profile"}
                    </FieldValue>
                  </div>
                ) : (
                  <EmptyState
                    title="No linked fit session"
                    description="This item does not currently reference a fit session."
                    className="border-none bg-transparent p-0 shadow-none"
                  />
                )}
              </CardContent>
            </Card>

            <Card className="border-[color:var(--border)] bg-[color:var(--card)]">
              <CardHeader>
                <CardTitle className="text-base">Linked bike</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {linkedBike ? (
                  <div className="space-y-3">
                    <FieldValue label="Bike">{feedbackBikeLabel(linkedBike.bike)}</FieldValue>
                    <FieldValue label="Owner">{getAdminDisplayName(linkedBike.owner)}</FieldValue>
                    <FieldValue label="Fit runs">{linkedBike.fitRuns.length}</FieldValue>
                    <FieldValue label="Geometry">
                      {linkedBike.geometryRecord
                        ? `${linkedBike.geometryRecord.sizeLabel} · v${linkedBike.geometryRecord.version} · ${linkedBike.geometryRecord.status}`
                        : "No geometry record"}
                    </FieldValue>
                  </div>
                ) : (
                  <EmptyState
                    title="No linked bike"
                    description="This item does not currently reference a bike."
                    className="border-none bg-transparent p-0 shadow-none"
                  />
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </AdminSectionCard>
    </div>
  );
}
