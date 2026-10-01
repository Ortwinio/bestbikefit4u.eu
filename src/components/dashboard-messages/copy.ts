"use client";

export type DashboardMessageLocale = "en" | "nl";
import { dashboardMessageTypesNl } from "@/i18n/account/dashboardMessages";

const dashboardMessageCopy = {
  en: {
    actions: {
      dismiss: "Dismiss",
      acknowledge: "Acknowledge",
      gotIt: "Got it",
    },
    types: {
      banner: "Banner",
      inbox_card: "Inbox card",
      modal: "Modal",
      sticky_warning: "Sticky warning",
      release_announcement: "Release announcement",
      upgrade_prompt: "Upgrade prompt",
      safety_alert: "Safety alert",
      re_fit_reminder: "Re-fit reminder",
      support_reply: "Support reply",
    },
    priorities: {
      low: "Low",
      normal: "Normal",
      high: "High",
      urgent: "Urgent",
    },
  },
  nl: {
    actions: {
      dismiss: "Sluiten",
      acknowledge: "Bevestigen",
      gotIt: "Begrepen",
    },
    types: dashboardMessageTypesNl,
    priorities: {
      low: "Laag",
      normal: "Normaal",
      high: "Hoog",
      urgent: "Urgent",
    },
  },
} as const;

export function getDashboardMessageCopy(locale: string | null | undefined) {
  return locale === "nl" ? dashboardMessageCopy.nl : dashboardMessageCopy.en;
}
