import { createElement, type ReactNode } from "react";
import { AdminStatusPill } from "@/components/admin/layout/AdminUi";

export type FeedbackType = "bug" | "feature_request" | "support_case" | "review";
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

const typeLabels: Record<FeedbackType, string> = {
  bug: "Bug",
  feature_request: "Feature request",
  support_case: "Support case",
  review: "Review",
};

const statusLabels: Record<FeedbackStatus, string> = {
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

const priorityLabels: Record<FeedbackPriority, string> = {
  low: "Low",
  normal: "Normal",
  high: "High",
  urgent: "Urgent",
};

export function feedbackTypeTone(type: FeedbackType) {
  if (type === "bug") return "danger";
  if (type === "feature_request") return "info";
  if (type === "review") return "success";
  return "neutral";
}

export function feedbackStatusTone(status: FeedbackStatus) {
  if (status === "released") return "success";
  if (status === "declined") return "danger";
  if (status === "planned" || status === "in_progress" || status === "in_qa") return "info";
  if (status === "triaged" || status === "needs_info") return "warning";
  return "neutral";
}

export function feedbackPriorityTone(priority: FeedbackPriority) {
  if (priority === "urgent") return "danger";
  if (priority === "high") return "warning";
  if (priority === "normal") return "info";
  return "neutral";
}

export function feedbackTypeLabel(type: FeedbackType) {
  return typeLabels[type];
}

export function feedbackStatusLabel(status: FeedbackStatus) {
  return statusLabels[status];
}

export function feedbackPriorityLabel(priority: FeedbackPriority) {
  return priorityLabels[priority];
}

export function FeedbackTypePill({
  type,
  children,
}: {
  type: FeedbackType;
  children?: ReactNode;
}) {
  return createElement(
    AdminStatusPill,
    { tone: feedbackTypeTone(type), children: children ?? feedbackTypeLabel(type) }
  );
}

export function FeedbackStatusPill({
  status,
  children,
}: {
  status: FeedbackStatus;
  children?: ReactNode;
}) {
  return createElement(
    AdminStatusPill,
    { tone: feedbackStatusTone(status), children: children ?? feedbackStatusLabel(status) }
  );
}

export function FeedbackPriorityPill({
  priority,
  children,
}: {
  priority: FeedbackPriority;
  children?: ReactNode;
}) {
  return createElement(
    AdminStatusPill,
    { tone: feedbackPriorityTone(priority), children: children ?? feedbackPriorityLabel(priority) }
  );
}
