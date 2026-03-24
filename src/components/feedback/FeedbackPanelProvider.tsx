"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type PropsWithChildren,
} from "react";
import { usePathname } from "next/navigation";
import type { Id } from "../../../convex/_generated/dataModel";
import { extractLocaleFromPathname, stripLocalePrefix } from "@/i18n/navigation";
import { FeedbackDialog } from "./FeedbackDialog";
import { trackFeedbackPanelOpen, trackFeedbackRouteVisit } from "./feedback-activity";
import { getFeedbackCopy, getFeedbackLocale } from "./feedback-copy";
import { FeedbackFloatingButton } from "./FeedbackFloatingButton";
import { getFeedbackRouteContext } from "./route-context";
import type { FeedbackType } from "./feedback-api";

type FeedbackPanelOptions = {
  defaultType?: FeedbackType;
  linkedSessionId?: Id<"fitSessions">;
  linkedBikeId?: Id<"bikes">;
  pagePath?: string;
};

type FeedbackPanelContextValue = {
  openPanel: (options?: FeedbackPanelOptions) => void;
  closePanel: () => void;
};

const FeedbackPanelContext = createContext<FeedbackPanelContextValue | null>(null);

export function resolveFeedbackPanelDefaultType(
  pathname: string
): FeedbackType | undefined {
  if (pathname.startsWith("/fit/") && pathname.includes("/results")) {
    return "bug";
  }

  if (pathname === "/pricing" || pathname.startsWith("/settings")) {
    return "support_case";
  }

  if (pathname.startsWith("/bikes") || pathname.startsWith("/profile")) {
    return "support_case";
  }

  return undefined;
}

export function getFeedbackPanelRouteState(pathname: string) {
  const internalPathname = stripLocalePrefix(pathname);
  const isAdminRoute =
    internalPathname === "/admin" || internalPathname.startsWith("/admin/");

  return {
    internalPathname,
    isAdminRoute,
    showFloatingButton: !isAdminRoute && internalPathname !== "/feedback",
    routeContext: getFeedbackRouteContext(pathname),
  };
}

export function resolveFeedbackPanelOptions(
  pathname: string,
  options: FeedbackPanelOptions = {}
) {
  const routeState = getFeedbackPanelRouteState(pathname);

  return {
    defaultType:
      options.defaultType ??
      resolveFeedbackPanelDefaultType(routeState.internalPathname),
    linkedBikeId: options.linkedBikeId ?? routeState.routeContext.linkedBikeId,
    linkedSessionId:
      options.linkedSessionId ?? routeState.routeContext.linkedSessionId,
    pagePath: options.pagePath ?? pathname,
  };
}

export function FeedbackPanelProvider({ children }: PropsWithChildren) {
  const pathname = usePathname() ?? "/";
  const routeState = getFeedbackPanelRouteState(pathname);
  const locale = getFeedbackLocale(extractLocaleFromPathname(pathname));
  const copy = getFeedbackCopy(locale);
  const [isOpen, setIsOpen] = useState(false);
  const [panelOptions, setPanelOptions] = useState<FeedbackPanelOptions>({});

  const contextValue = useMemo<FeedbackPanelContextValue>(
    () => ({
      openPanel: (options = {}) => {
        trackFeedbackPanelOpen(pathname);
        setPanelOptions(resolveFeedbackPanelOptions(pathname, options));
        setIsOpen(true);
      },
      closePanel: () => {
        setIsOpen(false);
      },
    }),
    [pathname]
  );

  useEffect(() => {
    trackFeedbackRouteVisit(pathname);
  }, [pathname]);

  return (
    <FeedbackPanelContext.Provider value={contextValue}>
      {children}
      {!routeState.isAdminRoute ? (
        <>
          {routeState.showFloatingButton ? (
            <FeedbackFloatingButton
              onClick={() => contextValue.openPanel()}
              label={copy.page.floatingCta}
            />
          ) : null}
          <FeedbackDialog
            open={isOpen}
            onClose={contextValue.closePanel}
            defaultType={panelOptions.defaultType}
            linkedBikeId={panelOptions.linkedBikeId}
            linkedSessionId={panelOptions.linkedSessionId}
            pagePath={panelOptions.pagePath}
          />
        </>
      ) : null}
    </FeedbackPanelContext.Provider>
  );
}

export function useFeedbackPanel() {
  const value = useContext(FeedbackPanelContext);
  if (!value) {
    throw new Error("useFeedbackPanel must be used within FeedbackPanelProvider");
  }

  return value;
}
