"use client";

import { useAuthActions } from "@convex-dev/auth/react";
import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import { Button } from "@/components/ui";
import { useDashboardMessages } from "@/i18n/useDashboardMessages";
import { withLocalePrefix } from "@/i18n/navigation";
import { AccountPlan } from "./AccountPlan";

export function AccountMenuFooter() {
  const { signOut } = useAuthActions();
  const router = useRouter();
  const { locale, messages } = useDashboardMessages();
  return <div className="mt-5 space-y-3">
    <AccountPlan />
    <Button variant="ghost" className="min-h-11 w-full justify-start gap-3 text-[var(--bbf-petrol-zacht)] hover:bg-white/10" onClick={async () => {
      await signOut();
      router.push(withLocalePrefix("/", locale));
    }}><LogOut size={20} aria-hidden="true" />{messages.common.signOut}</Button>
  </div>;
}
