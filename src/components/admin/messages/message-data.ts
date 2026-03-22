import "server-only";

import type { Doc, Id } from "@/../convex/_generated/dataModel";
import { api } from "@/../convex/_generated/api";
import {
  fetchAdminPaginatedQuery,
  fetchAdminQuery,
  fetchAdminUsers,
  getAdminQueryToken,
} from "../shared/admin-live-data";

export type MessageFilters = {
  status?: string;
};

export type MessageInboxRow = {
  message: Doc<"dashboard_messages">;
  creatorName: string;
  targetCount: number;
  deliverySummary: string;
  releaseName: string;
  feedbackName: string;
};

export type MessageDetailRecord = {
  message: Doc<"dashboard_messages">;
  targets: Doc<"message_targets">[];
  receipts: Doc<"message_receipts">[];
};

export type MessageDetailData = {
  detail: MessageDetailRecord;
  users: Doc<"users">[];
  releases: Doc<"releases">[];
  feedbackItems: Doc<"feedback_items">[];
  linkedRelease: Doc<"releases"> | null;
  linkedFeedback: Doc<"feedback_items"> | null;
};

export type MessageComposeData = {
  detail: MessageDetailRecord | null;
  users: Doc<"users">[];
  releases: Doc<"releases">[];
  feedbackItems: Doc<"feedback_items">[];
  linkedRelease: Doc<"releases"> | null;
  linkedFeedback: Doc<"feedback_items"> | null;
};

function getDisplayName(user: Pick<Doc<"users">, "displayName" | "name" | "email"> | null | undefined) {
  return user?.displayName ?? user?.name ?? user?.email ?? "Unknown";
}

function buildDeliverySummary(receipts: Doc<"message_receipts">[]) {
  const delivered = receipts.length;
  const viewed = receipts.filter((receipt) => Boolean(receipt.viewedAt)).length;
  const clicked = receipts.filter((receipt) => Boolean(receipt.clickedAt)).length;
  return `${delivered} delivered · ${viewed} viewed · ${clicked} clicked`;
}

export async function loadMessageInboxData(filters: MessageFilters) {
  const token = await getAdminQueryToken();
  const [messages, users, releases, feedbackItems] = await Promise.all([
    fetchAdminPaginatedQuery<Doc<"dashboard_messages">>(
      api.admin.queries.listDashboardMessages,
      filters.status ? { status: filters.status } : {},
      token,
      200
    ),
    fetchAdminUsers(token),
    fetchAdminPaginatedQuery<Doc<"releases">>(api.admin.queries.listReleases, {}, token, 200),
    fetchAdminPaginatedQuery<Doc<"feedback_items">>(api.admin.queries.listFeedbackItems, {}, token, 200),
  ]);

  const userMap = new Map(users.map((user) => [user._id, user] as const));
  const releaseMap = new Map(releases.map((release) => [release._id, release] as const));
  const feedbackMap = new Map(feedbackItems.map((item) => [item._id, item] as const));

  const rows: MessageInboxRow[] = [];
  for (const message of messages) {
    const detail = await fetchAdminQuery<
      { message: Doc<"dashboard_messages">; targets: Doc<"message_targets">[]; receipts: Doc<"message_receipts">[] } | null
    >(api.admin.queries.getDashboardMessageDetail, { messageId: message._id }, token);
    if (!detail?.message) continue;

    rows.push({
      message: detail.message,
      creatorName: getDisplayName(userMap.get(detail.message.createdBy)),
      targetCount: detail.targets.length,
      deliverySummary: buildDeliverySummary(detail.receipts),
      releaseName: detail.message.linkedReleaseId
        ? releaseMap.get(detail.message.linkedReleaseId)?.name ?? "—"
        : "—",
      feedbackName: detail.message.linkedFeedbackItemId
        ? feedbackMap.get(detail.message.linkedFeedbackItemId)?.title ?? "—"
        : "—",
    });
  }

  return { rows, users, releases, feedbackItems };
}

export async function loadMessageDetailData(messageId: string) {
  const token = await getAdminQueryToken();
  const detail = await fetchAdminQuery<MessageDetailRecord | null>(
    api.admin.queries.getDashboardMessageDetail,
    { messageId: messageId as Id<"dashboard_messages"> },
    token
  );

  if (!detail?.message) {
    return null;
  }

  const [users, releases, feedbackItems] = await Promise.all([
    fetchAdminUsers(token),
    fetchAdminPaginatedQuery<Doc<"releases">>(api.admin.queries.listReleases, {}, token, 200),
    fetchAdminPaginatedQuery<Doc<"feedback_items">>(api.admin.queries.listFeedbackItems, {}, token, 200),
  ]);

  return {
    detail,
    users,
    releases,
    feedbackItems,
    linkedRelease: detail.message.linkedReleaseId
      ? releases.find((release) => release._id === detail.message.linkedReleaseId) ?? null
      : null,
    linkedFeedback: detail.message.linkedFeedbackItemId
      ? feedbackItems.find((item) => item._id === detail.message.linkedFeedbackItemId) ?? null
      : null,
  };
}

export function loadMessageComposeData(): Promise<MessageComposeData>;
export function loadMessageComposeData(messageId: string): Promise<MessageComposeData | null>;
export async function loadMessageComposeData(messageId?: string): Promise<MessageComposeData | null> {
  if (!messageId) {
    const token = await getAdminQueryToken();
    const [users, releases, feedbackItems] = await Promise.all([
      fetchAdminUsers(token),
      fetchAdminPaginatedQuery<Doc<"releases">>(api.admin.queries.listReleases, {}, token, 200),
      fetchAdminPaginatedQuery<Doc<"feedback_items">>(api.admin.queries.listFeedbackItems, {}, token, 200),
    ]);

    return {
      detail: null,
      users,
      releases,
      feedbackItems,
      linkedRelease: null,
      linkedFeedback: null,
    } satisfies MessageComposeData;
  }

  const detailData = await loadMessageDetailData(messageId);
  if (!detailData) {
    return null;
  }

  return detailData satisfies MessageComposeData;
}
