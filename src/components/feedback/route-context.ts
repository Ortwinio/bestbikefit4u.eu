import type { Id } from "../../../convex/_generated/dataModel";
import { stripLocalePrefix } from "@/i18n/navigation";

export function getFeedbackRouteContext(pathname: string | null | undefined): {
  linkedBikeId?: Id<"bikes">;
  linkedSessionId?: Id<"fitSessions">;
} {
  const internalPathname = pathname ? stripLocalePrefix(pathname) : "/";
  const linkedBikeId =
    internalPathname.match(/^\/bikes\/([^/]+)(?:\/edit)?$/)?.[1] as Id<"bikes"> | undefined;
  const linkedSessionId =
    internalPathname.match(/^\/fit\/([^/]+)\/(?:questionnaire|results)(?:\/.*)?$/)?.[1] as
      | Id<"fitSessions">
      | undefined;

  return {
    linkedBikeId,
    linkedSessionId,
  };
}
