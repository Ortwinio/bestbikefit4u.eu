"use client";

import { type ReactNode } from "react";
import { BellRing, ShieldAlert, Sparkles, TriangleAlert } from "lucide-react";
import { Button } from "@/components/ui";
import { useDashboardMessages } from "@/i18n/useDashboardMessages";
import { cn } from "@/utils/cn";
import type { DashboardMessage, DashboardMessageId } from "./types";
import { sortDashboardMessages } from "./utils";
import { getDashboardMessageCopy } from "./copy";
import {
  MessageCtaLink,
  MessageMeta,
  MessageSurfaceChrome,
  useMarkMessagesViewed,
} from "./shared";

const bannerIconMap: Record<DashboardMessage["type"], typeof BellRing> = {
  banner: BellRing,
  sticky_warning: TriangleAlert,
  safety_alert: ShieldAlert,
  inbox_card: BellRing,
  modal: BellRing,
  release_announcement: Sparkles,
  upgrade_prompt: BellRing,
  re_fit_reminder: BellRing,
  support_reply: BellRing,
};

export function DashboardMessageBanner({
  message,
  onDismiss,
  onClick,
  className,
}: {
  message: DashboardMessage;
  onDismiss: (messageId: DashboardMessageId) => void | Promise<void>;
  onClick: (messageId: DashboardMessageId) => void | Promise<void>;
  className?: string;
}) {
  const { locale } = useDashboardMessages();
  const copy = getDashboardMessageCopy(locale);
  const Icon = bannerIconMap[message.type];

  return (
    <MessageSurfaceChrome message={message} className={cn("overflow-hidden", className)}>
      <div className="flex gap-4">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[var(--radius-lg)] bg-[color:color-mix(in_oklch,var(--foreground)_8%,transparent)]">
          <Icon className="h-5 w-5 text-[color:var(--foreground)]" />
        </div>
        <div className="min-w-0 flex-1 space-y-2">
          <MessageMeta message={message} />
          <div className="space-y-1">
            <h3 className="text-base font-semibold text-[color:var(--foreground)]">
              {message.title}
            </h3>
            <p className="text-sm leading-6 text-[color:var(--muted-foreground)]">
              {message.body}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <MessageCtaLink
              message={message}
              onClick={() => {
                void onClick(message._id);
              }}
            />
            {message.dismissible ? (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  void onDismiss(message._id);
                }}
                className="text-[color:var(--muted-foreground)]"
              >
                {copy.actions.dismiss}
              </Button>
            ) : null}
          </div>
        </div>
      </div>
    </MessageSurfaceChrome>
  );
}

export function DashboardMessageBannerList({
  messages,
  onDismiss,
  onClick,
  markViewed,
  className,
  emptyState,
}: {
  messages: DashboardMessage[] | undefined;
  onDismiss: (messageId: DashboardMessageId) => void | Promise<void>;
  onClick: (messageId: DashboardMessageId) => void | Promise<void>;
  markViewed: (messageId: DashboardMessageId) => Promise<void>;
  className?: string;
  emptyState?: ReactNode;
}) {
  useMarkMessagesViewed(messages, markViewed);

  if (!messages?.length) {
    return emptyState ? <>{emptyState}</> : null;
  }

  const sortedMessages = sortDashboardMessages(messages);

  return (
    <div className={cn("space-y-3", className)}>
      {sortedMessages.map((message) => (
        <DashboardMessageBanner
          key={message._id}
          message={message}
          onDismiss={onDismiss}
          onClick={onClick}
        />
      ))}
    </div>
  );
}
