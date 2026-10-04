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
import { AccountLanguageSwitch } from "@/components/account/AccountLanguageSwitch";
import { AccountBottomTabs } from "@/components/account/AccountBottomTabs";
import { AccountMenuFooter } from "@/components/account/AccountMenuFooter";
import { AccountProfileStrength } from "@/components/profile/AccountProfileStrength";
import { accountNavigationGroups, activeAccountPath, accountActiveClassName, accountIdleClassName, accountNavClassName } from "@/components/account/account-navigation";
import { Dialog, DialogContent, DialogTitle } from "@/components/prototyper-ui/ui/dialog";
import { stripLocalePrefix, withLocalePrefix } from "@/i18n/navigation";
import { useDashboardMessages } from "@/i18n/useDashboardMessages";
import { cn } from "@/utils/cn";
import { Menu, X } from "lucide-react";
import { adminNavigationGroups, isAdminNavigationActive } from "@/components/admin/layout/admin-navigation";
import { canAccessAdminRoute } from "@/components/admin/auth/admin-route-access";
import { isAdminRole } from "@/components/admin/auth/admin-auth-shared";

export const DASHBOARD_MOBILE_HEADER_CLASSNAME =
  "sticky top-0 z-30 flex min-h-[76px] flex-wrap items-center justify-between gap-3 bg-[var(--bbf-inkt)] px-4 py-3 text-white md:hidden";

export const DASHBOARD_MOBILE_MENU_OVERLAY_CLASSNAME =
  "panel-backdrop fixed inset-0 z-30 md:hidden";

export const DASHBOARD_MOBILE_MENU_PANEL_CLASSNAME =
  "w-[calc(100%-32px)] max-h-[80dvh] overflow-y-auto rounded-3xl border-0 bg-[var(--bbf-inkt)] p-5 text-white md:hidden";

export default function DashboardLayoutClient({
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
  const { locale, messages } = useDashboardMessages();
  const internalPathname = stripLocalePrefix(pathname ?? "/");
  const toLocalizedPath = (path: string) => withLocalePrefix(path, locale);
  const loginPath = toLocalizedPath("/login");
  const mobileSectionLabelClassName = "px-3 text-xs font-bold uppercase tracking-widest text-[var(--bbf-op-donker)]";
  const mobileNavItemClassName = accountNavClassName;
  const navigationGroups = accountNavigationGroups(messages, locale);
  const activePath = activeAccountPath(internalPathname, navigationGroups.flatMap((group) => group.items.map((item) => item.href)));

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.replace(loginPath);
    }
  }, [isLoading, isAuthenticated, loginPath, router]);

  useEffect(() => {
    if (typeof window.matchMedia !== "function") return;
    const desktop = window.matchMedia("(min-width: 768px)");
    const closeOnDesktop = (event: MediaQueryListEvent) => {
      if (event.matches) setIsMobileMenuOpen(false);
    };
    desktop.addEventListener("change", closeOnDesktop);
    return () => desktop.removeEventListener("change", closeOnDesktop);
  }, []);

  if (isLoading || !isAuthenticated) {
    return (
      <div className="min-h-screen bg-background text-foreground">
        <LoadingState
          label={messages.layout.loading}
          className="min-h-screen"
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground md:grid md:grid-cols-[264px_minmax(0,1fr)]">
      <div className="hidden bg-[var(--bbf-inkt)] md:row-span-2 md:block">
        <DashboardSidebar />
      </div>

      <header className={DASHBOARD_MOBILE_HEADER_CLASSNAME}>
        <BrandLogo
          href={toLocalizedPath("/")}
          asset="dark"
          className="flex min-h-11 w-[140px] shrink-0 items-center sm:w-[170px]"
          imageClassName="block"
        />
        <div className="flex items-center gap-2">
          <AccountLanguageSwitch />
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
            className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-full border-white/30 bg-transparent px-0 text-white hover:bg-white/10"
          >
            {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
        <div className="w-full"><AccountProfileStrength locale={locale} placement="mobile" /></div>
      </header>

      <Dialog open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
        <DialogContent showCloseButton={false} className={DASHBOARD_MOBILE_MENU_PANEL_CLASSNAME}>
          <div className="mb-4 flex items-center justify-between gap-3">
            <DialogTitle className="font-display text-xl font-bold text-white">{locale === "nl" ? "Meer in je account" : "More in your account"}</DialogTitle>
            <Button variant="ghost" aria-label={messages.layout.mobileMenu.closeAria} onClick={() => setIsMobileMenuOpen(false)} className="min-h-11 min-w-11 text-white hover:bg-white/10"><X size={20} /></Button>
          </div>
          <nav>
            <div className="space-y-5">
              {navigationGroups.map((group) => (
              <section key={group.key} aria-label={group.label} className="space-y-2">
                <p className={mobileSectionLabelClassName}>
                  {group.label}
                </p>
                <div className="space-y-1">
                  {group.items.map((item) => (
                    <Link
                      key={item.href}
                      href={toLocalizedPath(item.href)}
                      aria-current={activePath === item.href ? "page" : undefined}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className={cn(
                        mobileNavItemClassName,
                        activePath === item.href
                          ? accountActiveClassName
                          : accountIdleClassName
                      )}
                    >
                      {item.label}
                    </Link>
                  ))}
                </div>
              </section>
              ))}

              <section className="space-y-2">
                <p className={mobileSectionLabelClassName}>
                  {messages.layout.sections.website}
                </p>
                <div className="space-y-1">
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
                          ? accountActiveClassName
                          : accountIdleClassName
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
                  <div className="space-y-4">
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
                              aria-current={isAdminNavigationActive(internalPathname, item.href) ? "page" : undefined}
                              onClick={() => setIsMobileMenuOpen(false)}
                              className={cn(
                                "flex min-h-11 items-center rounded-lg px-3 py-2 text-[0.88rem] font-medium tracking-[-0.01em] transition-colors",
                                isAdminNavigationActive(internalPathname, item.href)
                                  ? accountActiveClassName
                                  : accountIdleClassName
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
          <AccountMenuFooter />
        </DialogContent>
      </Dialog>

      <div className="min-w-0">
        <main
          id="main-content"
          tabIndex={-1}
          className="mx-auto w-full max-w-[1440px] px-4 pt-6 pb-[calc(100px+env(safe-area-inset-bottom))] md:p-12"
        >
          <DashboardMessageSurface
            showHomeCards={false}
            showModal={false}
            className="mb-6"
          />
          {children}
        </main>
      </div>
      <AccountBottomTabs open={isMobileMenuOpen} onOpen={() => setIsMobileMenuOpen(true)} />
      <DashboardMessageSurface showBanners={false} showHomeCards={false} />
    </div>
  );
}
