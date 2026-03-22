"use client";

import type { ReactNode } from "react";
import { DashboardMessageBannerList } from "./DashboardMessageBanners";
import { DashboardMessageCardList } from "./DashboardMessageCards";
import { DashboardMessageModal } from "./DashboardMessageModal";
import { useDashboardMessageFeed } from "./use-dashboard-message-feed";

export function DashboardMessageSurface({
  showBanners = true,
  showHomeCards = true,
  showModal = true,
  className,
  bannerEmptyState,
  cardEmptyState,
}: {
  showBanners?: boolean;
  showHomeCards?: boolean;
  showModal?: boolean;
  className?: string;
  bannerEmptyState?: ReactNode;
  cardEmptyState?: ReactNode;
}) {
  const feed = useDashboardMessageFeed();

  return (
    <div className={className}>
      {showBanners ? (
        <DashboardMessageBannerList
          messages={feed.groups.banners}
          onDismiss={feed.dismissMessage}
          onClick={feed.clickMessage}
          markViewed={feed.markViewed}
          emptyState={bannerEmptyState}
        />
      ) : null}
      {showHomeCards ? (
        <DashboardMessageCardList
          messages={feed.groups.homeCards}
          onDismiss={feed.dismissMessage}
          onClick={feed.clickMessage}
          markViewed={feed.markViewed}
          emptyState={cardEmptyState}
        />
      ) : null}
      {showModal ? (
        <DashboardMessageModal
          open={Boolean(feed.modalMessage)}
          message={feed.modalMessage}
          onClose={() => {
            if (feed.modalMessage) {
              void feed.closeModalMessage(feed.modalMessage);
            }
          }}
          onAcknowledge={() => {
            if (feed.modalMessage) {
              void feed.acknowledgeModalMessage(feed.modalMessage);
            }
          }}
          onDismiss={() => {
            if (feed.modalMessage) {
              void feed.closeModalMessage(feed.modalMessage);
            }
          }}
          onClick={() => {
            if (feed.modalMessage) {
              void feed.clickMessage(feed.modalMessage._id);
            }
          }}
          markViewed={feed.markViewed}
        />
      ) : null}
    </div>
  );
}
