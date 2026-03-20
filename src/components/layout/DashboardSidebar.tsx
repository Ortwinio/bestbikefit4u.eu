"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuthActions } from "@convex-dev/auth/react";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { BRAND } from "@/config/brand";
import { LanguageSwitch } from "./LanguageSwitch";
import { useDashboardMessages } from "@/i18n/useDashboardMessages";
import {
  stripLocalePrefix,
  withLocalePrefix,
} from "@/i18n/navigation";
import { cn } from "@/utils/cn";
import {
  LayoutDashboard,
  Bike,
  User,
  Settings,
  LogOut,
  Gauge,
  ClipboardList,
  PlusCircle,
} from "lucide-react";
import { ProfilePhotoUpload } from "@/components/profile/ProfilePhotoUpload";
import { Button } from "@/components/ui";
import {
  getEffectiveDisplayName,
  getEffectiveProfileImageSource,
} from "@/lib/userIdentity";

export function DashboardSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { signOut } = useAuthActions();
  const { locale, messages, languageSwitchLabels } = useDashboardMessages();
  const internalPathname = stripLocalePrefix(pathname ?? "/");

  const toLocalizedPath = (path: string) => withLocalePrefix(path, locale);
  const navigation = [
    { name: messages.nav.dashboard, href: "/dashboard", icon: LayoutDashboard },
    { name: messages.nav.profile, href: "/profile", icon: User },
    { name: messages.nav.myBikes, href: "/bikes", icon: Bike },
    { name: messages.nav.bikeFitting, href: "/fit-history", icon: ClipboardList },
    { name: messages.nav.newFitSession, href: "/fit", icon: PlusCircle },
    { name: messages.nav.tirePressure, href: "/pressure-calculator", icon: Gauge },
    { name: messages.nav.settings, href: "/settings", icon: Settings },
  ];

  const websiteNavigation = [
    { name: messages.layout.website.home, href: "/" },
    { name: messages.layout.website.howItWorks, href: "/about" },
    { name: messages.layout.website.pricing, href: "/pricing" },
  ];

  const user = useQuery(api.users.queries.getCurrentUser);

  const handleSignOut = async () => {
    await signOut();
    router.push(toLocalizedPath("/"));
  };

  const displayName = getEffectiveDisplayName(user, messages.userMenu.fallbackUserName);
  const email = user?.email || "";
  const profileImageSource = getEffectiveProfileImageSource(user);

  return (
    <aside className="fixed left-0 top-0 z-40 h-screen w-64 border-r border-gray-200 bg-white">
      <div className="flex h-full flex-col">
        <div className="flex h-16 items-center border-b border-gray-200 px-6">
          <Link
            href={toLocalizedPath("/dashboard")}
            className="text-xl font-bold text-gray-900"
          >
            {BRAND.name}
          </Link>
        </div>
        <div className="border-b border-gray-100 px-4 py-3">
          <LanguageSwitch locale={locale} labels={languageSwitchLabels} />
        </div>

        <nav className="flex-1 space-y-1 px-3 py-4">
          {navigation.map((item) => {
            const isActive =
              internalPathname === item.href ||
              internalPathname.startsWith(item.href + "/");
            return (
              <Link
                key={item.name}
                href={toLocalizedPath(item.href)}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-blue-50 text-blue-700"
                    : "text-gray-700 hover:bg-gray-100"
                )}
              >
                <item.icon className="h-5 w-5" />
                {item.name}
              </Link>
            );
          })}
        </nav>

        <div className="border-t border-gray-100 px-3 py-3">
          <p className="px-3 text-xs font-semibold uppercase tracking-wide text-gray-400">
            {messages.layout.sections.website}
          </p>
          <div className="mt-2 space-y-1">
            {websiteNavigation.map((item) => (
              <Link
                key={item.href}
                href={toLocalizedPath(item.href)}
                className="block rounded-lg px-3 py-2 text-sm text-gray-600 transition-colors hover:bg-gray-100 hover:text-gray-900"
              >
                {item.name}
              </Link>
            ))}
          </div>
        </div>

        {/* User section */}
        <div className="border-t border-gray-200 p-3">
          {/* User info */}
          <div className="flex items-center gap-3 px-3 py-2 mb-2">
            <ProfilePhotoUpload source={profileImageSource} size="sidebar" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">
                {displayName}
              </p>
              <p className="text-xs text-gray-500 truncate">{email}</p>
            </div>
          </div>

          {/* Sign out button */}
          <Button
            variant="ghost"
            onClick={handleSignOut}
            className="flex w-full items-center justify-start gap-3 rounded-lg px-3 py-2 text-sm font-medium text-gray-700"
          >
            <LogOut className="h-5 w-5" />
            {messages.common.signOut}
          </Button>
        </div>
      </div>
    </aside>
  );
}
