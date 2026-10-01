"use client";

import { useDashboardMessages } from "./useDashboardMessages";
import { sharedUiMessages } from "./account/sharedUi";

export function useSharedUiMessages() {
  const { locale } = useDashboardMessages();
  return sharedUiMessages[locale];
}
