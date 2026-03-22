import { createElement, type ReactNode } from "react";
import { AdminStatusPill } from "@/components/admin/layout/AdminUi";

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

const typeLabels: Record<DashboardMessageType, string> = {
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

export function messageTypeTone(type: DashboardMessageType) {
  if (type === "banner" || type === "sticky_warning") return "warning";
  if (type === "modal" || type === "upgrade_prompt") return "info";
  if (type === "release_announcement") return "success";
  if (type === "safety_alert") return "danger";
  if (type === "support_reply") return "success";
  return "neutral";
}

export function messageStatusTone(status: DashboardMessageStatus) {
  if (status === "published") return "success";
  if (status === "scheduled") return "info";
  if (status === "paused") return "warning";
  return "neutral";
}

export function messagePriorityTone(priority: DashboardMessagePriority) {
  if (priority === "urgent") return "danger";
  if (priority === "high") return "warning";
  if (priority === "normal") return "info";
  return "neutral";
}

export function messageTypeLabel(type: DashboardMessageType) {
  return typeLabels[type];
}

export function messageStatusLabel(status: DashboardMessageStatus) {
  return statusLabels[status];
}

export function messagePriorityLabel(priority: DashboardMessagePriority) {
  return priorityLabels[priority];
}

export function MessageTypePill({
  type,
  children,
}: {
  type: DashboardMessageType;
  children?: ReactNode;
}) {
  return createElement(
    AdminStatusPill,
    { tone: messageTypeTone(type), children: children ?? messageTypeLabel(type) }
  );
}

export function MessageStatusPill({
  status,
  children,
}: {
  status: DashboardMessageStatus;
  children?: ReactNode;
}) {
  return createElement(
    AdminStatusPill,
    { tone: messageStatusTone(status), children: children ?? messageStatusLabel(status) }
  );
}

export function MessagePriorityPill({
  priority,
  children,
}: {
  priority: DashboardMessagePriority;
  children?: ReactNode;
}) {
  return createElement(
    AdminStatusPill,
    { tone: messagePriorityTone(priority), children: children ?? messagePriorityLabel(priority) }
  );
}
