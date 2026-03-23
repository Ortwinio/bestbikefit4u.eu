"use client";

import { useEffect } from "react";
import { useAction, useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { getStravaAutoImportLoginSessionKey } from "./strava-auto-import";

const SESSION_RUNNING = "running";
const SESSION_DONE = "done";

type StravaAutoImportTriggerProps = {
  userId: string | null | undefined;
  lastLoginAt: number | null | undefined;
};

export function StravaAutoImportTrigger({
  userId,
  lastLoginAt,
}: StravaAutoImportTriggerProps) {
  const stravaStatus = useQuery(api.integrations.queries.getStravaStatus);
  const syncMissingStravaBikes = useAction(api.integrations.actions.syncMissingStravaBikes);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    if (!userId || !lastLoginAt || stravaStatus === undefined) {
      return;
    }

    if (stravaStatus?.accessStatus !== "active") {
      return;
    }

    const sessionKey = getStravaAutoImportLoginSessionKey(userId, lastLoginAt);
    const sessionState = window.sessionStorage.getItem(sessionKey);
    if (sessionState === SESSION_RUNNING || sessionState === SESSION_DONE) {
      return;
    }

    window.sessionStorage.setItem(sessionKey, SESSION_RUNNING);
    void syncMissingStravaBikes({})
      .catch((error) => {
        console.error("Failed to auto-import Strava bikes", error);
      })
      .finally(() => {
        window.sessionStorage.setItem(sessionKey, SESSION_DONE);
      });
  }, [lastLoginAt, stravaStatus, syncMissingStravaBikes, userId]);

  return null;
}
