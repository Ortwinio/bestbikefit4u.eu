"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useConvexAuth, useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { DashboardSidebar } from "@/components/layout/DashboardSidebar";
import { BrandLogo } from "@/components/branding";
import { Button, LoadingState } from "@/components/ui";
import { DashboardMessageSurface } from "@/components/dashboard-messages";
import { StravaAutoImportTrigger } from "@/components/integrations/StravaAutoImportTrigger";
import { LanguageSwitch } from "@/components/layout/LanguageSwitch";
import { stripLocalePrefix, withLocalePrefix } from "@/i18n/navigation";
import { DASHBOARD_PRESSURE_CALCULATOR_PATH } from "@/lib/pressureRoutes";
import { useDashboardMessages } from "@/i18n/useDashboardMessages";
import { cn } from "@/utils/cn";
import { Menu, X } from "lucide-react";
import { adminNavigationGroups } from "@/components/admin/layout/admin-navigation";
import { canAccessAdminRoute } from "@/components/admin/auth/admin-route-access";
import { isAdminRole } from "@/components/admin/auth/admin-auth-shared";

export const DASHBOARD_MOBILE_HEADER_CLASSNAME =
  "dashboard-sidebar-surface dashboard-theme-context sticky top-0 z-30 flex items-center justify-between border-b px-4 py-3 md:hidden";

export const DASHBOARD_MOBILE_MENU_OVERLAY_CLASSNAME =
  "panel-backdrop fixed inset-0 z-30 md:hidden";

export const DASHBOARD_MOBILE_MENU_PANEL_CLASSNAME =
  "dashboard-sidebar-surface dashboard-theme-context fixed inset-y-0 left-0 z-40 w-72 overflow-y-auto border-r p-4 md:hidden";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { isLoading, isAuthenticated } = useConvexAuth();
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
  const { locale, messages, languageSwitchLabels } = useDashboardMessages();
  const internalPathname = stripLocalePrefix(pathname ?? "/");
  const toLocalizedPath = (path: string) => withLocalePrefix(path, locale);
  const loginPath = toLocalizedPath("/login");
  const mobileSectionLabelClassName =
    "px-3 text-[10px] font-semibold uppercase tracking-[0.22em] text-[color:oklch(var(--dashboard-nav-foreground))]";
  const mobileNavItemClassName =
    "block rounded-lg px-3 py-2.5 text-[0.95rem] font-medium tracking-[-0.01em] transition-colors";

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.replace(loginPath);
    }
  }, [isLoading, isAuthenticated, loginPath, router]);

  if (isLoading || !isAuthenticated) {
    return (
      <div className="dashboard-shell-surface min-h-screen bg-background">
        <LoadingState
          label={messages.layout.loading}
          className="min-h-screen"
        />
      </div>
    );
  }

  return (
    <div className="dashboard-shell-surface min-h-screen bg-background">
      <div className="hidden md:block">
        <DashboardSidebar />
      </div>

      <div className={DASHBOARD_MOBILE_HEADER_CLASSNAME}>
        <BrandLogo
          href={toLocalizedPath("/")}
          asset="appIcon"
          className="block w-10 shrink-0"
          imageClassName="block"
          ariaLabel={messages.layout.website.home}
        />
        <div className="flex items-center gap-2">
          <LanguageSwitch locale={locale} labels={languageSwitchLabels} />
          <Button
            type="button"
            variant="outline"
            aria-expanded={isMobileMenuOpen}
            aria-label={
              isMobileMenuOpen
                ? messages.layout.mobileMenu.closeAria
                : messages.layout.mobileMenu.openAria
            }
            onClick={() => setIsMobileMenuOpen((current) => !current)}
            className="inline-flex h-9 w-9 items-center justify-center rounded-full border-[color:oklch(var(--dashboard-border-soft))] bg-[color:color-mix(in_oklch,var(--dashboard-surface-muted)_92%,var(--background)_8%)] px-0 text-[color:oklch(var(--dashboard-nav-foreground-strong))] hover:bg-[color:color-mix(in_oklch,var(--dashboard-surface-strong)_84%,var(--background)_16%)]"
          >
            {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
      </div>

      {isMobileMenuOpen && (
        <>
          <button
            type="button"
            aria-label={messages.layout.mobileMenu.overlayCloseAria}
            onClick={() => setIsMobileMenuOpen(false)}
            className={DASHBOARD_MOBILE_MENU_OVERLAY_CLASSNAME}
          />
          <nav className={DASHBOARD_MOBILE_MENU_PANEL_CLASSNAME}>
            <BrandLogo
              href={toLocalizedPath("/")}
              asset="appIcon"
              className="mb-5 block w-14"
              imageClassName="block"
              ariaLabel={messages.layout.website.home}
            />
            <div className="space-y-5">
              <section className="space-y-2">
                <p className={mobileSectionLabelClassName}>
                  {messages.layout.sections.dashboard}
                </p>
                <div className="dashboard-card-surface-muted space-y-1 rounded-[calc(var(--radius-xl)+0.125rem)] border p-2">
                  {[
                    { href: "/dashboard", label: messages.nav.dashboard },
                    { href: "/feedback", label: messages.nav.feedback },
                    { href: "/profile", label: messages.nav.profile },
                    { href: "/bikes", label: messages.nav.myBikes },
                    { href: "/bikes/new", label: messages.nav.newBike },
                    { href: "/fit-history", label: messages.nav.bikeFitting },
                    { href: "/fit", label: messages.nav.newFitSession },
                    { href: "/saddle-selector", label: messages.nav.saddleSelector },
                    { href: DASHBOARD_PRESSURE_CALCULATOR_PATH, label: messages.nav.tirePressure },
                    { href: "/settings", label: messages.nav.settings },
                  ].map((item) => (
                    <Link
                      key={item.href}
                      href={toLocalizedPath(item.href)}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className={cn(
                        mobileNavItemClassName,
                        internalPathname === item.href || internalPathname.startsWith(`${item.href}/`)
                          ? "dashboard-nav-item-active"
                          : "dashboard-nav-item hover:dashboard-nav-item-hover"
                      )}
                    >
                      {item.label}
                    </Link>
                  ))}
                </div>
              </section>

              <section className="space-y-2">
                <p className={mobileSectionLabelClassName}>
                  {messages.layout.sections.website}
                </p>
                <div className="dashboard-card-surface-muted space-y-1 rounded-[calc(var(--radius-xl)+0.125rem)] border p-2">
                  {[
                    { href: "/", label: messages.layout.website.home },
                    { href: "/about", label: messages.layout.website.howItWorks },
                    { href: "/pricing", label: messages.layout.website.pricing },
                  ].map((item) => (
                    <Link
                      key={item.href}
                      href={toLocalizedPath(item.href)}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className={cn(
                        mobileNavItemClassName,
                        internalPathname === item.href || internalPathname.startsWith(`${item.href}/`)
                          ? "dashboard-nav-item-active"
                          : "dashboard-nav-item hover:dashboard-nav-item-hover"
                      )}
                    >
                      {item.label}
                    </Link>
                  ))}
                </div>
              </section>

              {visibleAdminNavigationGroups.length > 0 && (
                <section className="space-y-2">
                  <p className={mobileSectionLabelClassName}>
                    {messages.layout.sections.admin}
                  </p>
                  <div className="dashboard-card-surface-muted space-y-4 rounded-[calc(var(--radius-xl)+0.125rem)] border p-2">
                    {visibleAdminNavigationGroups.map((group) => (
                      <div key={group.label}>
                        <p className={cn(mobileSectionLabelClassName, "pb-1")}>
                          {group.label}
                        </p>
                        <div className="space-y-0.5">
                          {group.items.map((item) => (
                            <Link
                              key={item.href}
                              href={item.href}
                              onClick={() => setIsMobileMenuOpen(false)}
                              className={cn(
                                "block rounded-lg px-3 py-2 text-[0.88rem] font-medium tracking-[-0.01em] transition-colors",
                                internalPathname === item.href || internalPathname.startsWith(`${item.href}/`)
                                  ? "dashboard-nav-item-active"
                                  : "dashboard-nav-item hover:dashboard-nav-item-hover"
                              )}
                            >
                              {item.label}
                            </Link>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              )}
            </div>
          </nav>
        </>
      )}

      <div className="md:pl-80">
        <main
          id="main-content"
          tabIndex={-1}
          className="mx-auto w-full max-w-7xl p-4 sm:p-6 md:p-8"
        >
          <StravaAutoImportTrigger
            userId={user?._id ?? null}
            lastLoginAt={user?.lastLoginAt ?? null}
          />
          <DashboardMessageSurface
            showHomeCards={false}
            showModal={false}
            className="mb-6"
          />
          {children}
        </main>
      </div>
      <DashboardMessageSurface showBanners={false} showHomeCards={false} />
    </div>
  );
}
