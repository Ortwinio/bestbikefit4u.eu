import type { Doc, Id } from "@/../convex/_generated/dataModel";

export type DashboardMessage = Doc<"dashboard_messages">;
export type DashboardMessageId = Id<"dashboard_messages">;
export type DashboardMessageSurface = "banner" | "home_card" | "modal";
export type DashboardMessageTone = "info" | "success" | "warning" | "danger" | "neutral";

export type DashboardMessageGroups = {
  all: DashboardMessage[];
  banners: DashboardMessage[];
  homeCards: DashboardMessage[];
  modalCandidates: DashboardMessage[];
};

export const dashboardMessageTypeLabels: Record<DashboardMessage["type"], string> = {
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

export const dashboardMessagePriorityLabels: Record<
  DashboardMessage["priority"],
  string
> = {
  low: "Low",
  normal: "Normal",
  high: "High",
  urgent: "Urgent",
};

export const dashboardMessageSurfaceLabels: Record<DashboardMessageSurface, string> = {
  banner: "Banner",
  home_card: "Dashboard card",
  modal: "Modal",
};
