"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuthActions } from "@convex-dev/auth/react";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { BRAND } from "@/config/brand";
import { LanguageSwitch } from "./LanguageSwitch";
import { useDashboardMessages } from "@/i18n/useDashboardMessages";
import { stripLocalePrefix, withLocalePrefix } from "@/i18n/navigation";
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
  MessageSquareMore,
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
    { name: messages.nav.feedback, href: "/feedback", icon: MessageSquareMore },
    { name: messages.nav.profile, href: "/profile", icon: User },
    { name: messages.nav.myBikes, href: "/bikes", icon: Bike },
    { name: messages.nav.newBike, href: "/bikes/new", icon: PlusCircle },
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

  const adminNavigation = [
    { name: messages.layout.admin.overview, href: "/admin/overview" },
    { name: messages.layout.admin.users, href: "/admin/users" },
    { name: messages.layout.admin.bikes, href: "/admin/bikes" },
    { name: messages.layout.admin.feedback, href: "/admin/feedback" },
    { name: messages.layout.admin.messages, href: "/admin/messages" },
    { name: messages.layout.admin.releases, href: "/admin/releases" },
    { name: messages.layout.admin.geometry, href: "/admin/geometry" },
    { name: messages.layout.admin.fitRuns, href: "/admin/fit-runs" },
    { name: messages.layout.admin.settings, href: "/admin/settings" },
  ];

  const user = useQuery(api.users.queries.getCurrentUser);
  const isSuperAdmin = user?.adminRole === "super_admin";

  const handleSignOut = async () => {
    await signOut();
    router.push(toLocalizedPath("/"));
  };

  const displayName = getEffectiveDisplayName(user, messages.userMenu.fallbackUserName);
  const email = user?.email || "";
  const profileImageSource = getEffectiveProfileImageSource(user);

  return (
    <aside className="fixed left-0 top-0 z-40 h-screen w-64 border-r border-[color:var(--border)] bg-[color:color-mix(in_oklch,var(--card)_94%,var(--background)_6%)]">
      <div className="flex h-full flex-col">
        <div className="flex h-16 items-center border-b border-[color:var(--border)] px-6">
          <Link
            href={toLocalizedPath("/dashboard")}
            className="text-xl font-bold text-[color:var(--foreground)]"
          >
            {BRAND.name}
          </Link>
        </div>
        <div className="border-b border-[color:var(--border)] px-4 py-3">
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
                    ? "bg-[color:color-mix(in_oklch,var(--primary)_14%,var(--secondary)_86%)] text-[color:var(--foreground)] shadow-sm"
                    : "text-[color:var(--muted-foreground)] hover:bg-[color:var(--accent)] hover:text-[color:var(--foreground)]"
                )}
              >
                <item.icon className="h-5 w-5" />
                {item.name}
              </Link>
            );
          })}
        </nav>

        {isSuperAdmin && (
          <div className="border-t border-[color:var(--border)] px-3 py-3">
            <p className="px-3 text-xs font-semibold uppercase tracking-wide text-[color:var(--muted-foreground)]">
              {messages.layout.sections.admin}
            </p>
            <div className="mt-2 space-y-1">
              {adminNavigation.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="block rounded-lg px-3 py-2 text-sm text-[color:var(--muted-foreground)] transition-colors hover:bg-[color:var(--accent)] hover:text-[color:var(--foreground)]"
                >
                  {item.name}
                </Link>
              ))}
            </div>
          </div>
        )}

        <div className="border-t border-[color:var(--border)] px-3 py-3">
          <p className="px-3 text-xs font-semibold uppercase tracking-wide text-[color:var(--muted-foreground)]">
            {messages.layout.sections.website}
          </p>
          <div className="mt-2 space-y-1">
            {websiteNavigation.map((item) => (
              <Link
                key={item.href}
                href={toLocalizedPath(item.href)}
                className="block rounded-lg px-3 py-2 text-sm text-[color:var(--muted-foreground)] transition-colors hover:bg-[color:var(--accent)] hover:text-[color:var(--foreground)]"
              >
                {item.name}
              </Link>
            ))}
          </div>
        </div>

        <div className="border-t border-[color:var(--border)] p-3">
          <div className="mb-2 flex items-center gap-3 px-3 py-2">
            <ProfilePhotoUpload source={profileImageSource} size="sidebar" />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-[color:var(--foreground)]">
                {displayName}
              </p>
              <p className="truncate text-xs text-[color:var(--muted-foreground)]">{email}</p>
            </div>
          </div>

          <Button
            variant="ghost"
            onClick={handleSignOut}
            className="w-full justify-start gap-3 rounded-lg px-3 py-2 text-sm font-medium"
          >
            <LogOut className="h-5 w-5" />
            {messages.common.signOut}
          </Button>
        </div>
      </div>
    </aside>
  );
}
