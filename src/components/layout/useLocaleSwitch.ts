"use client";

import type { MouseEvent } from "react";
import { useRouter } from "next/navigation";
import { useConvexAuth, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import type { Locale } from "@/i18n/config";

export function useLocaleSwitch() {
  const { isAuthenticated } = useConvexAuth();
  const setLocale = useMutation(api.users.mutations.setLocale);
  const router = useRouter();

  return (event: MouseEvent<HTMLAnchorElement>, locale: Locale) => {
    if (!isAuthenticated || event.defaultPrevented) return;
    const href = event.currentTarget.href;
    const navigate = !event.metaKey && !event.ctrlKey && !event.shiftKey && !event.altKey && event.button === 0;
    if (navigate) event.preventDefault();
    void setLocale({ locale }).catch(() => undefined).then(() => {
      if (navigate) router.push(href);
    });
  };
}
