"use client";

import { useEffect, useRef, type ReactNode } from "react";
import Link from "next/link";
import { Button } from "@/components/ui";
import { buttonVariants } from "@/components/ui/Button";
import { useDashboardMessages } from "@/i18n/useDashboardMessages";
import { withLocalePrefix } from "@/i18n/navigation";
import { cn } from "@/utils/cn";
import type { DashboardMessage, DashboardMessageId, DashboardMessageTone } from "./types";
import { formatDashboardMessageDate, getDashboardMessageTone, isExternalMessageUrl } from "./utils";
import { getDashboardMessageCopy } from "./copy";

const toneStyles: Record<
  DashboardMessageTone,
  { border: string; surface: string; icon: string; pill: string }
> = {
  info: {
    border: "border-[color:color-mix(in_oklch,var(--primary)_28%,var(--border))]",
    surface: "bg-[color:color-mix(in_oklch,var(--card)_92%,var(--primary)_8%)]",
    icon: "text-[color:var(--primary)]",
    pill: "bg-[color:color-mix(in_oklch,var(--primary)_15%,var(--secondary))] text-[color:var(--primary)]",
  },
  success: {
    border: "border-[color:color-mix(in_oklch,var(--success)_28%,var(--border))]",
    surface: "bg-[color:color-mix(in_oklch,var(--card)_92%,var(--success)_8%)]",
    icon: "text-[color:var(--success)]",
    pill: "bg-[color:color-mix(in_oklch,var(--success)_15%,var(--secondary))] text-[color:var(--success)]",
  },
  warning: {
    border: "border-[color:color-mix(in_oklch,var(--warning)_28%,var(--border))]",
    surface: "bg-[color:color-mix(in_oklch,var(--card)_92%,var(--warning)_8%)]",
    icon: "text-[color:var(--warning)]",
    pill: "bg-[color:color-mix(in_oklch,var(--warning)_15%,var(--secondary))] text-[color:var(--warning)]",
  },
  danger: {
    border: "border-[color:color-mix(in_oklch,var(--danger)_30%,var(--border))]",
    surface: "bg-[color:color-mix(in_oklch,var(--card)_92%,var(--danger)_8%)]",
    icon: "text-[color:var(--danger)]",
    pill: "bg-[color:color-mix(in_oklch,var(--danger)_15%,var(--secondary))] text-[color:var(--danger)]",
  },
  neutral: {
    border: "border-[color:var(--border)]",
    surface: "bg-[color:var(--card)]",
    icon: "text-[color:var(--muted-foreground)]",
    pill: "bg-[color:var(--secondary)] text-[color:var(--muted-foreground)]",
  },
};

export function getMessageToneStyles(tone: DashboardMessageTone) {
  return toneStyles[tone];
}

export function getMessageTypeLabel(type: DashboardMessage["type"]) {
  return getDashboardMessageCopy("en").types[type];
}

export function getMessagePriorityLabel(priority: DashboardMessage["priority"]) {
  return getDashboardMessageCopy("en").priorities[priority];
}

export function useMarkMessagesViewed(
  messages: DashboardMessage[] | undefined,
  markViewed: (messageId: DashboardMessageId) => Promise<void>
) {
  const viewedIdsRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    if (!messages?.length) {
      return;
    }

    for (const message of messages) {
      const messageId = String(message._id);
      if (viewedIdsRef.current.has(messageId)) {
        continue;
      }

      viewedIdsRef.current.add(messageId);
      void markViewed(message._id);
    }
  }, [markViewed, messages]);
}

export function MessageMeta({
  message,
  className,
}: {
  message: DashboardMessage;
  className?: string;
}) {
  const { locale } = useDashboardMessages();
  const copy = getDashboardMessageCopy(locale);
  const tone = getDashboardMessageTone(message);
  const styles = getMessageToneStyles(tone);

  return (
    <div className={cn("flex flex-wrap items-center gap-2 text-xs font-medium", className)}>
      <span className={cn("inline-flex items-center rounded-full px-2.5 py-1", styles.pill)}>
        {copy.types[message.type]}
      </span>
      <span className="text-[color:var(--muted-foreground)]">
        {copy.priorities[message.priority]}
      </span>
      <span className="text-[color:var(--muted-foreground)]">
        {formatDashboardMessageDate(message.publishedAt ?? message.createdAt)}
      </span>
    </div>
  );
}

export function MessageCtaLink({
  message,
  onClick,
  className,
}: {
  message: DashboardMessage;
  onClick?: () => void;
  className?: string;
}) {
  const { locale } = useDashboardMessages();

  if (!message.ctaUrl || !message.ctaText) {
    return null;
  }

  const sharedClassName = cn(
    buttonVariants({ variant: "default", size: "default" }),
    "justify-center",
    className
  );

  if (isExternalMessageUrl(message.ctaUrl)) {
    return (
      <a
        href={message.ctaUrl}
        onClick={onClick}
        target="_blank"
        rel="noreferrer"
        className={sharedClassName}
      >
        {message.ctaText}
      </a>
    );
  }

  return (
    <Link
      href={withLocalePrefix(message.ctaUrl, locale)}
      onClick={onClick}
      className={sharedClassName}
    >
      {message.ctaText}
    </Link>
  );
}

export function MessageSecondaryButton({
  label,
  onClick,
  variant = "ghost",
  className,
}: {
  label: string;
  onClick: () => void;
  variant?: "ghost" | "outline" | "secondary";
  className?: string;
}) {
  return (
    <Button variant={variant} onClick={onClick} className={className}>
      {label}
    </Button>
  );
}

export function MessageSurfaceChrome({
  message,
  className,
  children,
}: {
  message: DashboardMessage;
  className?: string;
  children: ReactNode;
}) {
  const styles = getMessageToneStyles(getDashboardMessageTone(message));

  return (
    <div
      className={cn(
        "rounded-[var(--radius-xl)] border p-4 shadow-sm",
        styles.border,
        styles.surface,
        className
      )}
    >
      {children}
    </div>
  );
}
