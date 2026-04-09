"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/../convex/_generated/api";
import { useDashboardMessages } from "@/i18n/useDashboardMessages";
import type { DashboardMessage, DashboardMessageGroups, DashboardMessageId } from "./types";
import { groupDashboardMessages } from "./utils";

const SUPPRESSED_MODAL_STORAGE_KEY = "dashboard-message-modal-suppressed-v1";

function readStoredSet(key: string) {
  if (typeof window === "undefined") {
    return new Set<string>();
  }

  try {
    const raw = window.sessionStorage.getItem(key);
    if (!raw) {
      return new Set<string>();
    }

    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) {
      return new Set<string>();
    }

    return new Set(parsed.filter((value) => typeof value === "string"));
  } catch {
    return new Set<string>();
  }
}

function writeStoredSet(key: string, values: Set<string>) {
  if (typeof window === "undefined") {
    return;
  }

  try {
    window.sessionStorage.setItem(key, JSON.stringify([...values]));
  } catch {
    // Ignore storage quota and privacy-mode failures.
  }
}

function addIdToSet(
  current: Set<string>,
  id: string
): Set<string> {
  if (current.has(id)) {
    return current;
  }

  const next = new Set(current);
  next.add(id);
  return next;
}

export type UseDashboardMessageFeedResult = {
  messages: DashboardMessage[] | undefined;
  groups: DashboardMessageGroups;
  modalMessage: DashboardMessage | null;
  isLoading: boolean;
  isReady: boolean;
  markViewed: (messageId: DashboardMessageId) => Promise<void>;
  clickMessage: (messageId: DashboardMessageId) => Promise<void>;
  dismissMessage: (messageId: DashboardMessageId) => Promise<void>;
  acknowledgeMessage: (messageId: DashboardMessageId) => Promise<void>;
  suppressModalMessage: (messageId: DashboardMessageId) => void;
  closeModalMessage: (message: DashboardMessage) => Promise<void>;
  acknowledgeModalMessage: (message: DashboardMessage) => Promise<void>;
  isModalSuppressed: (messageId: DashboardMessageId) => boolean;
};

export function useDashboardMessageFeed(): UseDashboardMessageFeedResult {
  const { locale } = useDashboardMessages();
  const messages = useQuery(api.messages.queries.getMyMessages, { locale });
  const markViewedMutation = useMutation(api.messages.mutations.markMessageViewed);
  const clickMutation = useMutation(api.messages.mutations.markMessageClicked);
  const dismissMutation = useMutation(api.messages.mutations.markMessageDismissed);
  const acknowledgeMutation = useMutation(api.messages.mutations.markMessageAcknowledged);
  const [isReady] = useState(() => typeof window !== "undefined");
  const [suppressedModalIds, setSuppressedModalIds] = useState<Set<string>>(() =>
    readStoredSet(SUPPRESSED_MODAL_STORAGE_KEY)
  );

  useEffect(() => {
    if (!isReady) {
      return;
    }

    writeStoredSet(SUPPRESSED_MODAL_STORAGE_KEY, suppressedModalIds);
  }, [isReady, suppressedModalIds]);

  const groups = useMemo(
    () => groupDashboardMessages(messages ?? []),
    [messages]
  );

  const modalMessage = useMemo(() => {
    if (!isReady) {
      return null;
    }

    return (
      groups.modalCandidates.find(
        (message) => !suppressedModalIds.has(String(message._id))
      ) ?? null
    );
  }, [groups.modalCandidates, isReady, suppressedModalIds]);

  const markViewed = useCallback(
    async (messageId: DashboardMessageId) => {
      await markViewedMutation({ messageId });
    },
    [markViewedMutation]
  );

  const clickMessage = useCallback(
    async (messageId: DashboardMessageId) => {
      await clickMutation({ messageId });
    },
    [clickMutation]
  );

  const dismissMessage = useCallback(
    async (messageId: DashboardMessageId) => {
      await dismissMutation({ messageId });
    },
    [dismissMutation]
  );

  const acknowledgeMessage = useCallback(
    async (messageId: DashboardMessageId) => {
      await acknowledgeMutation({ messageId });
    },
    [acknowledgeMutation]
  );

  const suppressModalMessage = useCallback((messageId: DashboardMessageId) => {
    setSuppressedModalIds((current) => addIdToSet(current, String(messageId)));
  }, []);

  const closeModalMessage = useCallback(
    async (message: DashboardMessage) => {
      suppressModalMessage(message._id);
      if (message.dismissible) {
        await dismissMessage(message._id);
      }
    },
    [dismissMessage, suppressModalMessage]
  );

  const acknowledgeModalMessage = useCallback(
    async (message: DashboardMessage) => {
      suppressModalMessage(message._id);
      await acknowledgeMessage(message._id);
    },
    [acknowledgeMessage, suppressModalMessage]
  );

  const isModalSuppressed = useCallback(
    (messageId: DashboardMessageId) => suppressedModalIds.has(String(messageId)),
    [suppressedModalIds]
  );

  return {
    messages,
    groups,
    modalMessage,
    isLoading: messages === undefined,
    isReady,
    markViewed,
    clickMessage,
    dismissMessage,
    acknowledgeMessage,
    suppressModalMessage,
    closeModalMessage,
    acknowledgeModalMessage,
    isModalSuppressed,
  };
}
