"use client";

import { useConvexAuth, useMutation, useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import type { Id } from "../../../../convex/_generated/dataModel";
import { GiftRedeem } from "@/components/gifts/GiftRedeem";
import { giftTokenStorageKey } from "@/components/gifts/giftHelpers";
import { useGiftToken } from "@/components/gifts/useGiftToken";
import { LoadingState } from "@/components/ui";
import { giftsCopy } from "@/i18n/account/gifts";
import { useDashboardMessages } from "@/i18n/useDashboardMessages";

export default function GiftPage() {
  const { locale } = useDashboardMessages();
  const { isAuthenticated, isLoading } = useConvexAuth();
  const token = useGiftToken();
  const user = useQuery(
    api.users.queries.getCurrentUser,
    isAuthenticated ? {} : "skip",
  );
  const preview = useQuery(
    api.gifts.queries.preview,
    token ? { token } : "skip",
  );
  const bikes = useQuery(
    api.bikes.queries.listByUser,
    isAuthenticated ? {} : "skip",
  );
  const redeem = useMutation(api.gifts.mutations.redeem);
  if (
    token === undefined ||
    isLoading ||
    (token && preview === undefined) ||
    (isAuthenticated && (bikes === undefined || user === undefined))
  )
    return <LoadingState label={giftsCopy[locale].loading} />;
  const state =
    preview?.status === "expiring" ? "soon" : (preview?.status ?? "invalid");
  return (
    <GiftRedeem
      key={`${token ?? "missing"}:${isAuthenticated ? (user?._id ?? "anonymous") : "anonymous"}`}
      locale={locale}
      state={state}
      expiresAt={preview && "expiresAt" in preview ? preview.expiresAt : undefined}
      authenticated={isAuthenticated && !!user}
      bikes={(bikes ?? []).map((bike) => ({ id: bike._id, name: bike.name }))}
      onRedeem={async (bikeId) => {
        if (!token) throw new Error("INVALID_TOKEN");
        const result = await redeem({ token, bikeId: bikeId as Id<"bikes"> });
        if (result.status !== "redeemed")
          throw new Error(result.status.toUpperCase());
        try {
          if (window.sessionStorage.getItem(giftTokenStorageKey) === token) {
            window.sessionStorage.removeItem(giftTokenStorageKey);
          }
        } catch {
          return;
        }
      }}
    />
  );
}
