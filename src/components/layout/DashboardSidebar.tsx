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
  const sectionLabelClassName =
    "px-3 text-[10px] font-semibold uppercase tracking-[0.22em] text-[color:oklch(var(--dashboard-nav-foreground))]";
  const navItemClassName =
    "flex items-center gap-3 rounded-lg px-3 py-2.5 text-[0.95rem] font-medium tracking-[-0.01em] transition-colors";
  const navIconClassName = "h-[1.1rem] w-[1.1rem] shrink-0";
  const adminNavIconClassName = "h-[0.95rem] w-[0.95rem] shrink-0";

  return (
    <aside className="dashboard-sidebar-surface dashboard-theme-context fixed left-0 top-0 z-40 h-screen w-80 border-r">
      <div className="flex h-full flex-col">
        <div className="flex min-h-fit items-center border-b border-[color:oklch(var(--dashboard-border-soft))] px-4 py-4">
          <BrandLogo
            href={toLocalizedPath("/")}
            asset="primary"
            className="block w-[264px]"
            imageClassName="block"
            ariaLabel={messages.layout.website.home}
          />
        </div>
        <div className="border-b border-[color:oklch(var(--dashboard-border-soft))] px-4 py-4">
          <div className="dashboard-card-surface-muted rounded-[calc(var(--radius-xl)+0.125rem)] border px-3 py-3">
            <p className={cn(sectionLabelClassName, "px-0 pb-2")}>
              {languageSwitchLabels.language}
            </p>
            <LanguageSwitch locale={locale} labels={languageSwitchLabels} />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-3 py-5">
          <div className="space-y-6">
            <section className="space-y-2">
              <p className={sectionLabelClassName}>{messages.layout.sections.dashboard}</p>
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
                        navItemClassName,
                        isActive
                          ? "dashboard-nav-item-active"
                          : "dashboard-nav-item hover:dashboard-nav-item-hover"
                      )}
                    >
                      <item.icon className={navIconClassName} />
                      <span className="leading-none">{item.name}</span>
                    </Link>
                  );
                })}
              </nav>
            </section>

            {isSuperAdmin && (
              <section className="dashboard-card-surface-muted rounded-[calc(var(--radius-xl)+0.125rem)] border px-2 py-3">
                <p className={cn(sectionLabelClassName, "pb-2")}>
                  {messages.layout.sections.admin}
                </p>
                <button
                  type="button"
                  onClick={() => setIsAdminOpen((v) => !v)}
                  className={cn(
                    navItemClassName,
                    internalPathname.startsWith("/admin")
                      ? "dashboard-nav-item-active"
                      : "dashboard-nav-item hover:dashboard-nav-item-hover"
                  )}
                >
                  <CircuitBoard className={navIconClassName} />
                  <span className="flex-1 text-left leading-none">
                    {messages.layout.sections.admin}
                  </span>
                  <ChevronDown
                    className={cn(
                      "h-4 w-4 shrink-0 text-[color:oklch(var(--dashboard-nav-foreground))] transition-transform duration-200",
                      isAdminOpen && "rotate-180"
                    )}
                  />
                </button>

                {isAdminOpen && (
                  <div className="mt-3 space-y-4 border-t border-[color:oklch(var(--dashboard-border-soft))] pt-3">
                    {adminNavigationGroups.map((group) => {
                      const hideLabel = ["Command center", "People", "Rider data", "Technical"].includes(group.label);
                      return (
                        <div key={group.label}>
                          {!hideLabel && (
                            <p className={cn(sectionLabelClassName, "pb-1")}>{group.label}</p>
                          )}
                          <div className="space-y-0.5">
                            {group.items.map((item) => {
                              const isActive = isAdminNavigationActive(internalPathname, item.href);
                              return (
                                <Link
                                  key={item.href}
                                  href={item.href}
                                  className={cn(
                                    "flex items-center gap-3 rounded-lg px-3 py-2 text-[0.88rem] font-medium tracking-[-0.01em] transition-colors",
                                    isActive
                                      ? "dashboard-nav-item-active"
                                      : "dashboard-nav-item hover:dashboard-nav-item-hover"
                                  )}
                                >
                                  <item.icon className={adminNavIconClassName} />
                                  <span className="leading-none">{item.label}</span>
                                </Link>
                              );
                            })}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </section>
            )}
          </div>
        </div>

        <div className="border-t border-[color:oklch(var(--dashboard-border-soft))] p-3">
          <div className="dashboard-card-surface-muted rounded-[calc(var(--radius-xl)+0.125rem)] border px-3 py-3">
            <p className={cn(sectionLabelClassName, "px-0 pb-3")}>
              {messages.nav.settings}
            </p>
            <div className="flex items-center gap-3">
              <ProfilePhotoUpload source={profileImageSource} size="sidebar" />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold tracking-[-0.01em] text-[color:var(--foreground)]">
                  {displayName}
                </p>
                <p className="truncate text-[11px] font-medium text-[color:var(--muted-foreground)]">
                  {email}
                </p>
              </div>
            </div>

            <div className="mt-3 border-t border-[color:oklch(var(--dashboard-border-soft))] pt-3">
              <Button
                variant="ghost"
                onClick={handleSignOut}
                className="w-full justify-start gap-3 rounded-lg px-3 py-2 text-sm font-medium text-[color:oklch(var(--dashboard-nav-foreground-strong))] hover:bg-[color:color-mix(in_oklch,var(--dashboard-surface-muted)_86%,var(--primary)_14%)]"
              >
                <LogOut className="h-5 w-5" />
                {messages.common.signOut}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}
