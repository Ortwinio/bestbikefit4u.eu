"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuthActions } from "@convex-dev/auth/react";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { BrandLogo } from "@/components/branding";
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
  ChevronDown,
  CircuitBoard,
} from "lucide-react";
import { ProfilePhotoUpload } from "@/components/profile/ProfilePhotoUpload";
import { Button } from "@/components/ui";
import {
  getEffectiveDisplayName,
  getEffectiveProfileImageSource,
} from "@/lib/userIdentity";
import {
  adminNavigationGroups,
  isAdminNavigationActive,
} from "@/components/admin/layout/admin-navigation";

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
    { name: messages.nav.newBike, href: "/bikes/new", icon: PlusCircle },
    { name: messages.nav.bikeFitting, href: "/fit-history", icon: ClipboardList },
    { name: messages.nav.newFitSession, href: "/fit", icon: PlusCircle },
    { name: messages.nav.tirePressure, href: "/pressure-calculator", icon: Gauge },
    { name: messages.nav.settings, href: "/settings", icon: Settings },
    { name: messages.nav.feedback, href: "/feedback", icon: MessageSquareMore },
  ];

  const user = useQuery(api.users.queries.getCurrentUser);
  const isSuperAdmin = user?.adminRole === "super_admin";

  const [isAdminOpen, setIsAdminOpen] = useState(
    () => internalPathname.startsWith("/admin")
  );

  const handleSignOut = async () => {
    await signOut();
    router.push(toLocalizedPath("/"));
  };

  const displayName = getEffectiveDisplayName(user, messages.userMenu.fallbackUserName);
  const email = user?.email || "";
  const profileImageSource = getEffectiveProfileImageSource(user);

  return (
    <aside className="panel-surface-base panel-theme-context fixed left-0 top-0 z-40 h-screen w-80 border-r">
      <div className="flex h-full flex-col">
        <div className="flex min-h-fit items-center border-b border-[color:var(--border)] px-4 py-4">
          <BrandLogo
            href={toLocalizedPath("/")}
            asset="primary"
            className="block w-[264px]"
            imageClassName="block"
            ariaLabel={messages.layout.website.home}
          />
        </div>
        <div className="border-b border-[color:var(--border)] px-4 py-3">
          <LanguageSwitch locale={locale} labels={languageSwitchLabels} />
        </div>

        <div className="flex-1 overflow-y-auto px-3 py-4">
          <nav className="space-y-1">
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
                      ? "dashboard-nav-item-active"
                      : "dashboard-nav-item hover:dashboard-nav-item-hover"
                  )}
                >
                  <item.icon className="h-5 w-5" />
                  {item.name}
                </Link>
              );
            })}
          </nav>

          {isSuperAdmin && (
            <div className="mt-4">
              {/* Toggle button - styled like a nav item */}
              <button
                type="button"
                onClick={() => setIsAdminOpen((v) => !v)}
                className={cn(
                  "flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                  internalPathname.startsWith("/admin")
                    ? "dashboard-nav-item-active"
                    : "dashboard-nav-item hover:dashboard-nav-item-hover"
                )}
              >
                <CircuitBoard className="h-5 w-5 shrink-0" />
                <span className="flex-1 text-left">{messages.layout.sections.admin}</span>
                <ChevronDown
                  className={cn(
                    "h-4 w-4 shrink-0 transition-transform duration-200",
                    isAdminOpen && "rotate-180"
                  )}
                />
              </button>

              {/* Sub-items — only shown when open */}
              {isAdminOpen && (
                <div className="mt-1 space-y-4 pl-2">
                  {adminNavigationGroups.map((group) => {
                    const hideLabel = ["Command center", "People", "Rider data", "Technical"].includes(group.label);
                    return (
                      <div key={group.label}>
                        {!hideLabel && (
                          <p className="px-3 pb-1 text-xs font-semibold uppercase tracking-wide text-[color:var(--muted-foreground)]">
                            {group.label}
                          </p>
                        )}
                        <div className="space-y-0.5">
                          {group.items.map((item) => {
                            const isActive = isAdminNavigationActive(internalPathname, item.href);
                            return (
                              <Link
                                key={item.href}
                                href={item.href}
                                className={cn(
                                  "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                                  isActive
                                    ? "dashboard-nav-item-active"
                                    : "dashboard-nav-item hover:dashboard-nav-item-hover"
                                )}
                              >
                                <item.icon className="h-4 w-4 shrink-0" />
                                {item.label}
                              </Link>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
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
