"use client";

import Link from "next/link";
import { Bike, ClipboardList, LayoutDashboard, Menu, User } from "lucide-react";
import { usePathname } from "next/navigation";
import { useDashboardMessages } from "@/i18n/useDashboardMessages";
import { stripLocalePrefix, withLocalePrefix } from "@/i18n/navigation";
import { cn } from "@/utils/cn";

export function AccountBottomTabs({ open, onOpen }: { open: boolean; onOpen: () => void }) {
  const { locale } = useDashboardMessages();
  const pathname = stripLocalePrefix(usePathname() ?? "/");
  const dutch = locale === "nl";
  const tabs = [
    { href: "/dashboard", label: dutch ? "Overzicht" : "Overview", icon: LayoutDashboard },
    { href: "/profile", label: dutch ? "Profiel" : "Profile", icon: User },
    { href: "/bikes", label: dutch ? "Fietsen" : "Bikes", icon: Bike },
    { href: "/fit-history", label: dutch ? "Afstelling" : "Fitting", icon: ClipboardList },
  ];
  const tabClass = "flex min-h-[60px] flex-col items-center justify-center gap-1 rounded-xl px-1 text-[11px] font-semibold";
  const isMoreRoute = !tabs.some((tab) => pathname === tab.href || pathname.startsWith(`${tab.href}/`));
  return <nav aria-label={dutch ? "Accountnavigatie" : "Account navigation"} className="fixed inset-x-0 bottom-0 z-30 grid grid-cols-5 gap-1 border-t border-[var(--bbf-rand)] bg-white px-2 pt-2 pb-[max(8px,env(safe-area-inset-bottom))] text-[var(--bbf-gedempt)] md:hidden">
    {tabs.map((tab) => {
      const active = pathname === tab.href || pathname.startsWith(`${tab.href}/`);
      return <Link key={tab.href} href={withLocalePrefix(tab.href, locale)} aria-current={active ? "page" : undefined} className={cn(tabClass, active && "bg-[var(--bbf-lime)] text-[var(--bbf-inkt)]")}><tab.icon size={20} aria-hidden="true" />{tab.label}</Link>;
    })}
    <button type="button" aria-expanded={open} aria-haspopup="dialog" onClick={onOpen} className={cn(tabClass, (open || isMoreRoute) && "bg-[var(--bbf-lime)] text-[var(--bbf-inkt)]")}><Menu size={20} aria-hidden="true" />{dutch ? "Meer" : "More"}</button>
  </nav>;
}
