"use client";

import {
  BellRing,
  Rocket,
  ShieldAlert,
  Sparkles,
  TriangleAlert,
  MessageSquareText,
} from "lucide-react";
import { Button, AccessibleDialog } from "@/components/ui";
import { useDashboardMessages } from "@/i18n/useDashboardMessages";
import { cn } from "@/utils/cn";
import type { DashboardMessage, DashboardMessageId } from "./types";
import { MessageCtaLink, MessageMeta, MessageSurfaceChrome, useMarkMessagesViewed } from "./shared";
import { getDashboardMessageCopy } from "./copy";

const modalIconMap: Record<DashboardMessage["type"], typeof MessageSquareText> = {
  banner: BellRing,
  inbox_card: MessageSquareText,
  modal: MessageSquareText,
  sticky_warning: TriangleAlert,
  release_announcement: Sparkles,
  upgrade_prompt: Rocket,
  safety_alert: ShieldAlert,
  re_fit_reminder: BellRing,
  support_reply: MessageSquareText,
};

export function DashboardMessageModal({
  open,
  message,
  onClose,
  onAcknowledge,
  onDismiss,
  onClick,
  markViewed,
  className,
}: {
  open: boolean;
  message: DashboardMessage | null;
  onClose: () => void;
  onAcknowledge: () => void | Promise<void>;
  onDismiss: () => void | Promise<void>;
  onClick: () => void | Promise<void>;
  markViewed: (messageId: DashboardMessageId) => Promise<void>;
  className?: string;
}) {
  const { locale } = useDashboardMessages();
  const copy = getDashboardMessageCopy(locale);
  useMarkMessagesViewed(open && message ? [message] : undefined, markViewed);

  if (!message) {
    return null;
  }

  const Icon = modalIconMap[message.type];

  return (
    <AccessibleDialog
      open={open}
      title={message.title}
      description={message.body}
      onClose={onClose}
    >
      <MessageSurfaceChrome message={message} className={cn("space-y-4", className)}>
        <div className="flex items-start gap-4">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[var(--radius-lg)] bg-[color:color-mix(in_oklch,var(--foreground)_8%,transparent)]">
            <Icon className="h-5 w-5 text-[color:var(--foreground)]" />
          </div>
          <div className="min-w-0 flex-1 space-y-2">
            <MessageMeta message={message} />
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <MessageCtaLink
            message={message}
            onClick={() => {
              void onClick();
            }}
          />
          <Button
            variant={message.requiresAcknowledgement ? "primary" : "outline"}
            onClick={() => {
              void onAcknowledge();
            }}
          >
            {message.requiresAcknowledgement
              ? copy.actions.acknowledge
              : copy.actions.gotIt}
          </Button>
          {message.dismissible ? (
            <Button
              variant="ghost"
              onClick={() => {
                void onDismiss();
              }}
              className="text-[color:var(--muted-foreground)]"
            >
              {copy.actions.dismiss}
            </Button>
          ) : null}
        </div>
      </MessageSurfaceChrome>
    </AccessibleDialog>
  );
}
