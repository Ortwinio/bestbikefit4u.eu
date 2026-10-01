import { ArrowUpDown, Bike, ClipboardList, Gauge, LayoutDashboard, MessageSquareMore, PlusCircle, Settings, User, Armchair, Ruler, Mountain, Zap, Utensils } from "lucide-react";
import { DASHBOARD_PRESSURE_CALCULATOR_PATH } from "@/lib/pressureRoutes";
import type { getDashboardMessages } from "@/i18n/dashboardMessages";
import type { Locale } from "@/i18n/config";
import { calculatorNavigationMessages } from "@/i18n/account/calculatorNavigation";

export const accountCalculatorRegistry = [
  { href: "/tools/bike-fit", key: "bikeFit", icon: Bike },
  { href: "/tools/saddle-height", key: "saddleHeight", icon: Ruler },
  { href: "/tools/frame-size", key: "frameSize", icon: Bike },
  { href: "/tools/crank-length", key: "crankLength", icon: Ruler },
  { href: DASHBOARD_PRESSURE_CALCULATOR_PATH, key: "pressure", icon: Gauge },
  { href: "/gearing", key: "gearing", icon: ArrowUpDown },
  { href: "/saddle-selector", key: "saddle", icon: Armchair },
  { href: "/tools/power-speed", key: "powerSpeed", icon: Zap },
  { href: "/tools/climb-planner", key: "climb", icon: Mountain },
  { href: "/tools/ftp-wkg", key: "ftp", icon: Gauge },
  { href: "/tools/fuel-hydration", key: "fuel", icon: Utensils },
] as const;

export function accountCalculatorNavigation(locale: Locale) {
  return accountCalculatorRegistry.map((item) => ({
    ...item,
    label: calculatorNavigationMessages[locale].tools[item.key],
  }));
}

export function accountNavigationGroups(messages: ReturnType<typeof getDashboardMessages>, locale: Locale) {
  return [
    { key: "account", label: messages.layout.sections.dashboard, items: accountNavigation(messages) },
    { key: "calculators", label: calculatorNavigationMessages[locale].title, items: accountCalculatorNavigation(locale) },
  ];
}

export function accountNavigation(messages: ReturnType<typeof getDashboardMessages>) {
  return [
    { href: "/dashboard", label: messages.nav.dashboard, icon: LayoutDashboard },
    { href: "/profile", label: messages.nav.profile, icon: User },
    { href: "/bikes", label: messages.nav.myBikes, icon: Bike },
    { href: "/bikes/new", label: messages.nav.newBike, icon: PlusCircle },
    { href: "/fit-history", label: messages.nav.bikeFitting, icon: ClipboardList },
    { href: "/fit", label: messages.nav.newFitSession, icon: PlusCircle },
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
