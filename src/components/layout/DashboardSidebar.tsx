"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuthActions } from "@convex-dev/auth/react";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { BrandLogo } from "@/components/branding";
import { AccountLanguageSwitch } from "@/components/account/AccountLanguageSwitch";
import { AccountPlan } from "@/components/account/AccountPlan";
import { accountNavigation, activeAccountPath, accountNavClassName, accountActiveClassName, accountIdleClassName } from "@/components/account/account-navigation";
import { useDashboardMessages } from "@/i18n/useDashboardMessages";
import { stripLocalePrefix, withLocalePrefix } from "@/i18n/navigation";
import { cn } from "@/utils/cn";
import {
  LogOut,
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
import { canAccessAdminRoute } from "@/components/admin/auth/admin-route-access";
import { isAdminRole } from "@/components/admin/auth/admin-auth-shared";

export function DashboardSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { signOut } = useAuthActions();
  const { locale, messages } = useDashboardMessages();
  const internalPathname = stripLocalePrefix(pathname ?? "/");

  const toLocalizedPath = (path: string) => withLocalePrefix(path, locale);
  const navigation = accountNavigation(messages);
  const activePath = activeAccountPath(internalPathname, navigation.map((item) => item.href));

  const user = useQuery(api.users.queries.getCurrentUser);
  const adminRole = isAdminRole(user?.adminRole) ? user.adminRole : null;
  const visibleAdminNavigationGroups = useMemo(
    () =>
      adminRole
        ? adminNavigationGroups
            .map((group) => ({
              ...group,
              items: group.items.filter((item) => canAccessAdminRoute(item.href, adminRole)),
            }))
            .filter((group) => group.items.length > 0)
        : [],
    [adminRole]
  );

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
  const sectionLabelClassName = "px-3 text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--bbf-op-donker)]";
  const navItemClassName = accountNavClassName;
  const navIconClassName = "h-[1.1rem] w-[1.1rem] shrink-0";
  const adminNavIconClassName = "h-[0.95rem] w-[0.95rem] shrink-0";

  return (
    <aside className="sticky top-0 z-40 h-dvh w-[264px] bg-[var(--bbf-inkt)] text-white">
      <div className="flex h-full flex-col overflow-y-auto">
        <div className="flex shrink-0 items-center border-b border-white/10 px-4 py-4">
          <BrandLogo
            href={toLocalizedPath("/")}
            asset="dark"
            className="flex min-h-11 w-[208px] items-center"
            imageClassName="block"
            ariaLabel={messages.layout.website.home}
          />
        </div>
        <div className="shrink-0 px-5 py-2"><AccountLanguageSwitch /></div>

        <div className="min-h-[88px] flex-1 overflow-y-auto px-4 py-3">
          <div className="space-y-6">
            <section className="space-y-2">
              <p className={sectionLabelClassName}>{messages.layout.sections.dashboard}</p>
              <nav aria-label={locale === "nl" ? "Accountpagina’s" : "Account pages"} className="space-y-1">
                {navigation.map((item) => {
                  const isActive = activePath === item.href;
                  return (
                    <Link
                      key={item.href}
                      href={toLocalizedPath(item.href)}
                      aria-current={isActive ? "page" : undefined}
                      className={cn(
                        navItemClassName,
                        isActive
                          ? accountActiveClassName
                          : accountIdleClassName
                      )}
                    >
                      <item.icon className={navIconClassName} />
                      <span className="leading-none">{item.label}</span>
                    </Link>
                  );
                })}
              </nav>
            </section>

            {visibleAdminNavigationGroups.length > 0 && (
              <section className="rounded-[20px] bg-white/5 px-2 py-3">
                <p className={cn(sectionLabelClassName, "pb-2")}>
                  {messages.layout.sections.admin}
                </p>
                <button
                  type="button"
                  aria-expanded={isAdminOpen}
                  aria-controls="account-admin-navigation"
                  onClick={() => setIsAdminOpen((v) => !v)}
                  className={cn(
                    navItemClassName,
                    internalPathname.startsWith("/admin")
                      ? accountActiveClassName
                      : accountIdleClassName
                  )}
                >
                  <CircuitBoard className={navIconClassName} />
                  <span className="flex-1 text-left leading-none">
                    {messages.layout.sections.admin}
                  </span>
                  <ChevronDown
                    className={cn(
                      "h-4 w-4 shrink-0 transition-transform duration-200",
                      isAdminOpen && "rotate-180"
                    )}
                  />
                </button>

                {isAdminOpen && (
                  <div id="account-admin-navigation" className="mt-3 space-y-4 border-t border-white/10 pt-3">
                    {visibleAdminNavigationGroups.map((group) => {
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
                                  aria-current={isActive ? "page" : undefined}
                                  className={cn(
                                    "flex min-h-11 items-center gap-3 rounded-lg px-3 py-2 text-[0.88rem] font-medium tracking-[-0.01em] transition-colors",
                                    isActive
                                      ? accountActiveClassName
                                      : accountIdleClassName
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

        <div className="shrink-0 space-y-3 p-4">
          <AccountPlan />
          <div className="rounded-[20px] bg-white/5 px-3 py-3">
            <p className={cn(sectionLabelClassName, "px-0 pb-3")}>
              {messages.nav.settings}
            </p>
            <div className="flex items-center gap-3">
              <ProfilePhotoUpload source={profileImageSource} size="sidebar" />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold tracking-[-0.01em] text-white">
                  {displayName}
                </p>
                <p className="truncate text-[11px] font-medium text-[var(--bbf-op-donker)]">
                  {email}
                </p>
              </div>
            </div>

            <div className="mt-3 border-t border-[color:oklch(var(--dashboard-border-soft))] pt-3">
              <Button
                variant="ghost"
                onClick={handleSignOut}
                className="min-h-11 w-full justify-start gap-3 rounded-lg px-3 py-2 text-sm font-medium text-[var(--bbf-petrol-zacht)] hover:bg-white/10"
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
