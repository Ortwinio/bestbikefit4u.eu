"use client";

import { useRef } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { GiftGive } from "@/components/gifts/GiftGive";
import { LoadingState } from "@/components/ui";
import { giftsCopy } from "@/i18n/account/gifts";
import { useDashboardMessages } from "@/i18n/useDashboardMessages";

export default function GiftsPage() {
  const { locale } = useDashboardMessages();
  const overview = useQuery(api.gifts.queries.getOverview, {});
  const give = useMutation(api.gifts.mutations.give);
  const request = useRef<{ input: string; key: string } | null>(null);
  if (overview === undefined)
    return <LoadingState label={giftsCopy[locale].loading} />;
  return (
    <GiftGive
      locale={locale}
      eligible={overview.eligible}
      available={overview.availableCredits}
      gifts={overview.gifts}
      onSend={async (input) => {
        const fingerprint = JSON.stringify(input);
        if (request.current?.input !== fingerprint)
          request.current = { input: fingerprint, key: crypto.randomUUID() };
        await give({ ...input, locale, requestKey: request.current.key });
        request.current = null;
      }}
    />
  );
}
