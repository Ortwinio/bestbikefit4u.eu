import type { DashboardMessage, DashboardMessageGroups, DashboardMessageSurface, DashboardMessageTone } from "./types";

const bannerTypes = new Set<DashboardMessage["type"]>([
  "banner",
  "sticky_warning",
  "safety_alert",
]);

const modalTypes = new Set<DashboardMessage["type"]>(["modal"]);

const priorityRank: Record<DashboardMessage["priority"], number> = {
  urgent: 0,
  high: 1,
  normal: 2,
  low: 3,
};

const toneByType: Record<DashboardMessage["type"], DashboardMessageTone> = {
  banner: "info",
  inbox_card: "neutral",
  modal: "info",
  sticky_warning: "warning",
  release_announcement: "success",
  upgrade_prompt: "info",
  safety_alert: "danger",
  re_fit_reminder: "info",
  support_reply: "success",
};

export function getDashboardMessageSurface(
  message: DashboardMessage
): DashboardMessageSurface {
  if (bannerTypes.has(message.type)) {
    return "banner";
  }

  if (modalTypes.has(message.type)) {
    return "modal";
  }

  return "home_card";
}

export function getDashboardMessageTone(message: DashboardMessage): DashboardMessageTone {
  return toneByType[message.type];
}

export function sortDashboardMessages(messages: DashboardMessage[]) {
  return [...messages].sort((a, b) => {
    const priorityDelta = priorityRank[a.priority] - priorityRank[b.priority];
    if (priorityDelta !== 0) {
      return priorityDelta;
    }

    const aPublishedAt = a.publishedAt ?? a.createdAt;
    const bPublishedAt = b.publishedAt ?? b.createdAt;
    return bPublishedAt - aPublishedAt;
  });
}

export function groupDashboardMessages(messages: DashboardMessage[]): DashboardMessageGroups {
  const sortedMessages = sortDashboardMessages(messages);
  return {
    all: sortedMessages,
    banners: sortedMessages.filter((message) => getDashboardMessageSurface(message) === "banner"),
    homeCards: sortedMessages.filter(
      (message) => getDashboardMessageSurface(message) === "home_card"
    ),
    modalCandidates: sortedMessages.filter(
      (message) => getDashboardMessageSurface(message) === "modal"
    ),
  };
}

export function formatDashboardMessageDate(value?: number | null) {
  if (!value) {
    return "";
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "";
  }

  return new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

export function formatDashboardMessageCount(value: number, noun: string) {
  return `${value} ${noun}${value === 1 ? "" : "s"}`;
}

export function isExternalMessageUrl(url: string) {
  return /^https?:\/\//i.test(url);
}
