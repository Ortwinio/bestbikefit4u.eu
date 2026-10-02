"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { useConvexAuth, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { extractLocaleFromPathname } from "@/i18n/navigation";

export function LoginLocaleBackfill() {
  const { isAuthenticated, isLoading } = useConvexAuth();
  const setLocaleIfMissing = useMutation(api.users.mutations.setLocaleIfMissing);
  const pathname = usePathname();
  const locale = extractLocaleFromPathname(pathname ?? "");
  const attempted = useRef(false);

  useEffect(() => {
    if (isLoading) return;
    if (!isAuthenticated) {
      attempted.current = false;
      return;
    }
    if (!locale || attempted.current) return;
    attempted.current = true;
    void setLocaleIfMissing({ locale }).catch(() => undefined);
  }, [isAuthenticated, isLoading, locale, setLocaleIfMissing]);

  return null;
}
