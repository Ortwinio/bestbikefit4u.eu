import "server-only";

import type { Doc, Id } from "@/../convex/_generated/dataModel";
import { api } from "@/../convex/_generated/api";
import {
  fetchAdminPaginatedQuery,
  fetchAdminQuery,
  fetchAdminUsers,
  getAdminQueryToken,
} from "../shared/admin-live-data";

export type FeedbackFilters = {
  type?: string;
  status?: string;
  assignedTo?: Id<"users">;
};

export type FeedbackInboxRow = {
  item: Doc<"feedback_items">;
  reporterName: string;
  assigneeName: string;
  releaseName: string;
  linkedSessionLabel: string;
  linkedBikeLabel: string;
};

export type FeedbackDetailRecord = {
  item: Doc<"feedback_items">;
  comments: Doc<"feedback_comments">[];
  user: Doc<"users"> | null;
  release: Doc<"releases"> | null;
};

export type FeedbackSessionTrace = {
  session: Doc<"fitSessions">;
  user: Doc<"users"> | null;
  bike: Doc<"bikes"> | null;
  profile: Doc<"profiles"> | null;
  engineVersion: Doc<"engine_versions"> | null;
};

export type FeedbackBikeDetail = {
  bike: Doc<"bikes">;
  owner: Doc<"users"> | null;
  fitRuns: Doc<"fitSessions">[];
  geometryRecord: Doc<"geometry_records"> | null;
};

export type FeedbackDetailData = {
  detail: FeedbackDetailRecord;
  assigneeName: string;
  reporterName: string;
  linkedSession: FeedbackSessionTrace | null;
  linkedBike: FeedbackBikeDetail | null;
  releases: Doc<"releases">[];
  users: Doc<"users">[];
};

export type FeedbackComposeData = {
  detail: FeedbackDetailRecord | null;
  assigneeName: string;
  reporterName: string;
  linkedSession: FeedbackSessionTrace | null;
  linkedBike: FeedbackBikeDetail | null;
  releases: Doc<"releases">[];
  users: Doc<"users">[];
};

function getDisplayName(user: Pick<Doc<"users">, "displayName" | "name" | "email"> | null | undefined) {
  return user?.displayName ?? user?.name ?? user?.email ?? "Unknown";
}

function getBikeLabel(bike: Pick<Doc<"bikes">, "name" | "brand" | "model" | "bikeType"> | null | undefined) {
  if (!bike) return "Unknown bike";
  const branded = [bike.brand, bike.model].filter(Boolean).join(" ");
  return bike.name && branded ? `${bike.name} · ${branded}` : bike.name ?? branded ?? bike.bikeType;
}

export async function loadFeedbackInboxData(filters: FeedbackFilters) {
  const token = await getAdminQueryToken();
  const [items, users, releases] = await Promise.all([
    fetchAdminPaginatedQuery<Doc<"feedback_items">>(
      api.admin.queries.listFeedbackItems,
      {
        ...(filters.type ? { type: filters.type } : {}),
        ...(filters.status ? { status: filters.status } : {}),
        ...(filters.assignedTo ? { assignedTo: filters.assignedTo } : {}),
      },
      token,
      200
    ),
    fetchAdminUsers(token),
    fetchAdminPaginatedQuery<Doc<"releases">>(api.admin.queries.listReleases, {}, token, 200),
  ]);

  const userMap = new Map(users.map((user) => [user._id, user] as const));
  const releaseMap = new Map(releases.map((release) => [release._id, release] as const));

  return {
    items: items.map<FeedbackInboxRow>((item) => {
      const release = item.linkedReleaseId ? releaseMap.get(item.linkedReleaseId) : null;
      return {
        item,
        reporterName: getDisplayName(item.userId ? userMap.get(item.userId) : undefined),
        assigneeName: getDisplayName(item.assignedTo ? userMap.get(item.assignedTo) : undefined),
        releaseName: release?.versionLabel ? `${release.name} · ${release.versionLabel}` : release?.name ?? "—",
        linkedSessionLabel: item.linkedSessionId ? String(item.linkedSessionId) : "—",
        linkedBikeLabel: item.linkedBikeId ? String(item.linkedBikeId) : "—",
      };
    }),
    users,
    releases,
  };
}

export async function loadFeedbackDetailData(itemId: string): Promise<FeedbackDetailData | null> {
  const token = await getAdminQueryToken();
  const detail = await fetchAdminQuery<FeedbackDetailRecord | null>(
    api.admin.queries.getFeedbackDetail,
    { feedbackItemId: itemId as Id<"feedback_items"> },
    token
  );

  if (!detail) {
    return null;
  }

  const [users, releases] = await Promise.all([
    fetchAdminUsers(token),
    fetchAdminPaginatedQuery<Doc<"releases">>(api.admin.queries.listReleases, {}, token, 200),
  ]);

  const assigneeName = getDisplayName(
    detail.item.assignedTo ? users.find((user) => user._id === detail.item.assignedTo) : undefined
  );
  const reporterName = getDisplayName(detail.user);

  const linkedSession = detail.item.linkedSessionId
    ? await fetchAdminQuery<FeedbackSessionTrace | null>(
        api.admin.queries.getFitRunTrace,
        { sessionId: detail.item.linkedSessionId },
        token
      )
    : null;
  const linkedBike = detail.item.linkedBikeId
    ? await fetchAdminQuery<FeedbackBikeDetail | null>(
        api.admin.queries.getAdminBikeDetail,
        { bikeId: detail.item.linkedBikeId },
        token
      )
    : null;

  return {
    detail,
    assigneeName,
    reporterName,
    linkedSession,
    linkedBike,
    releases,
    users,
  };
}

export async function loadFeedbackComposeData(itemId?: string): Promise<FeedbackComposeData | null> {
  if (!itemId) {
    const token = await getAdminQueryToken();
    const [users, releases] = await Promise.all([
      fetchAdminUsers(token),
      fetchAdminPaginatedQuery<Doc<"releases">>(api.admin.queries.listReleases, {}, token, 200),
    ]);

    return {
      detail: null,
      assigneeName: "Unassigned",
      reporterName: "Unknown",
      linkedSession: null,
      linkedBike: null,
      releases,
      users,
    } satisfies FeedbackComposeData;
  }

  const detailData = await loadFeedbackDetailData(itemId);
  if (!detailData) {
    return null;
  }

  return detailData satisfies FeedbackComposeData;
}

export function feedbackBikeLabel(bike: Pick<Doc<"bikes">, "name" | "brand" | "model" | "bikeType"> | null | undefined) {
  return getBikeLabel(bike);
}
