import { makeFunctionReference } from "convex/server";
import type { Id } from "../../../convex/_generated/dataModel";
import type { FeedbackLocale } from "./feedback-copy";

export type FeedbackType = "bug" | "feature_request" | "support_case";
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
export type FeedbackPriority = "low" | "normal" | "high" | "urgent";
export type ReleaseStatus = "rolling_out" | "live";

export type FeedbackCommentView = {
  _id?: string;
  authorName?: string;
  body: string;
  createdAt: number;
  isInternal?: boolean;
};

export type FeedbackReleaseSummary = {
  _id?: string;
  name: string;
  versionLabel?: string;
  status?: ReleaseStatus;
  liveAt?: number;
  releaseNotes?: string;
};

export type FeedbackOverviewRow = {
  _id: Id<"feedback_items">;
  type: FeedbackType;
  title: string;
  description: string;
  status: FeedbackStatus;
  category?: string;
  pagePath?: string;
  linkedSessionId?: Id<"fitSessions">;
  linkedBikeId?: Id<"bikes">;
  expectedResult?: string;
  actualResult?: string;
  browserInfoJson?: string;
  upvoteCount?: number;
  requesterCount?: number;
  commentCount?: number;
  releaseSummary?: string;
  createdAt: number;
  updatedAt?: number;
};

export type FeatureRequestRow = FeedbackOverviewRow & {
  hasUpvoted: boolean;
  upvoteCount: number;
  requesterCount?: number;
};

export type PublicFeedbackDetail = {
  item: FeedbackOverviewRow & {
    comments: FeedbackCommentView[];
    linkedRelease?: FeedbackReleaseSummary | null;
  };
};

export type PublicReleaseItem = {
  _id?: string;
  title: string;
  status: FeedbackStatus;
  type?: FeedbackType;
  upvoteCount?: number;
  requesterCount?: number;
};

export type PublicReleaseRow = {
  _id: Id<"releases">;
  name: string;
  versionLabel?: string;
  type: string;
  status: ReleaseStatus;
  releaseNotes?: string;
  liveAt?: number;
  publishedAt?: number;
  items: PublicReleaseItem[];
};

export type SubmitFeedbackArgs = {
  type: FeedbackType;
  title: string;
  description: string;
  category?: string;
  pagePath?: string;
  linkedSessionId?: Id<"fitSessions">;
  linkedBikeId?: Id<"bikes">;
  expectedResult?: string;
  actualResult?: string;
  browserInfoJson?: string;
};

export type UpvoteFeedbackArgs = {
  feedbackItemId: Id<"feedback_items">;
};

export const feedbackApi = {
  queries: {
    getMyFeedback: makeFunctionReference<"query", Record<string, never>, FeedbackOverviewRow[]>(
      "feedback/queries:getMyFeedback"
    ),
    getFeatureBoard: makeFunctionReference<"query", Record<string, never>, FeatureRequestRow[]>(
      "feedback/queries:getFeatureBoard"
    ),
    getPublicFeedbackDetail: makeFunctionReference<
      "query",
      { feedbackItemId: Id<"feedback_items"> },
      PublicFeedbackDetail | null
    >("feedback/queries:getPublicFeedbackDetail"),
  },
  mutations: {
    submitFeedback: makeFunctionReference<"mutation", SubmitFeedbackArgs, string>(
      "feedback/mutations:submitFeedback"
    ),
    upvoteFeedbackItem: makeFunctionReference<
      "mutation",
      UpvoteFeedbackArgs,
      { hasUpvoted: boolean; upvoteCount: number }
    >("feedback/mutations:upvoteFeedbackItem"),
  },
  releases: {
    getPublicReleases: makeFunctionReference<"query", Record<string, never>, PublicReleaseRow[]>(
      "releases/queries:getPublicReleases"
    ),
  },
} as const;

export function getFeedbackLocale(locale: string | null | undefined): FeedbackLocale {
  return locale === "nl" ? "nl" : "en";
}
