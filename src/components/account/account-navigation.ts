import { ArrowUpDown, Bike, ClipboardList, Gauge, LayoutDashboard, MessageSquareMore, PlusCircle, Settings, User, Armchair } from "lucide-react";
import { DASHBOARD_PRESSURE_CALCULATOR_PATH } from "@/lib/pressureRoutes";
import type { getDashboardMessages } from "@/i18n/dashboardMessages";

export function accountNavigation(messages: ReturnType<typeof getDashboardMessages>) {
  return [
    { href: "/dashboard", label: messages.nav.dashboard, icon: LayoutDashboard },
    { href: "/profile", label: messages.nav.profile, icon: User },
    { href: "/bikes", label: messages.nav.myBikes, icon: Bike },
    { href: "/bikes/new", label: messages.nav.newBike, icon: PlusCircle },
    { href: "/fit-history", label: messages.nav.bikeFitting, icon: ClipboardList },
    { href: "/fit", label: messages.nav.newFitSession, icon: PlusCircle },
    { href: DASHBOARD_PRESSURE_CALCULATOR_PATH, label: messages.nav.tirePressure, icon: Gauge },
    { href: "/gearing", label: messages.nav.gearing, icon: ArrowUpDown },
    { href: "/saddle-selector", label: messages.nav.saddleSelector, icon: Armchair },
    { href: "/settings", label: messages.nav.settings, icon: Settings },
    { href: "/feedback", label: messages.nav.feedback, icon: MessageSquareMore },
  ];
}

export function activeAccountPath(pathname: string, paths: readonly string[]) {
  return paths.filter((path) => pathname === path || pathname.startsWith(`${path}/`))
    .sort((first, second) => second.length - first.length)[0];
}

export const accountNavClassName = "flex min-h-11 items-center gap-3 rounded-xl px-3.5 py-2 text-[15px] font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--bbf-lime)]";
export const accountActiveClassName = "bg-[var(--bbf-lime)] text-[var(--bbf-inkt)]";
export const accountIdleClassName = "text-[var(--bbf-petrol-zacht)] hover:bg-white/10";
