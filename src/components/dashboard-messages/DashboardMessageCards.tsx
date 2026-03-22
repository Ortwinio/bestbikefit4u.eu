"use client";

import { type ReactNode } from "react";
import { ArrowRight, Inbox, MessageSquareText, Rocket, Sparkles, TriangleAlert } from "lucide-react";
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

const cardIconMap: Record<DashboardMessage["type"], typeof Inbox> = {
  banner: Inbox,
  inbox_card: Inbox,
  modal: MessageSquareText,
  sticky_warning: TriangleAlert,
  release_announcement: Sparkles,
  upgrade_prompt: Rocket,
  safety_alert: TriangleAlert,
  re_fit_reminder: ArrowRight,
  support_reply: MessageSquareText,
};

export function DashboardMessageCard({
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
  const Icon = cardIconMap[message.type];

  return (
    <MessageSurfaceChrome message={message} className={cn("overflow-hidden", className)}>
      <div className="flex items-start gap-4">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[var(--radius-lg)] bg-[color:color-mix(in_oklch,var(--foreground)_8%,transparent)]">
          <Icon className="h-5 w-5 text-[color:var(--foreground)]" />
        </div>
        <div className="min-w-0 flex-1 space-y-3">
          <div className="space-y-1">
            <MessageMeta message={message} />
            <h3 className="text-base font-semibold text-[color:var(--foreground)]">
              {message.title}
            </h3>
          </div>
          <p className="text-sm leading-6 text-[color:var(--muted-foreground)]">
            {message.body}
          </p>
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

export function DashboardMessageCardList({
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
    <div className={cn("grid gap-3", className)}>
      {sortedMessages.map((message) => (
        <DashboardMessageCard
          key={message._id}
          message={message}
          onDismiss={onDismiss}
          onClick={onClick}
        />
      ))}
    </div>
  );
}
