"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useConvexAuth, useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { DashboardSidebar } from "@/components/layout/DashboardSidebar";
import { Button, LoadingState } from "@/components/ui";
import { DashboardMessageSurface } from "@/components/dashboard-messages";
import { FeedbackDialog, FeedbackFloatingButton } from "@/components/feedback";
import { getFeedbackRouteContext } from "@/components/feedback/route-context";
import { StravaAutoImportTrigger } from "@/components/integrations/StravaAutoImportTrigger";
import { LanguageSwitch } from "@/components/layout/LanguageSwitch";
import { BRAND } from "@/config/brand";
import { stripLocalePrefix, withLocalePrefix } from "@/i18n/navigation";
import { useDashboardMessages } from "@/i18n/useDashboardMessages";
import { Menu, X } from "lucide-react";
import {
  adminNavigationGroups,
  isAdminNavigationActive,
} from "@/components/admin/layout/admin-navigation";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isFeedbackDialogOpen, setIsFeedbackDialogOpen] = useState(false);
  const { isLoading, isAuthenticated } = useConvexAuth();
  const user = useQuery(api.users.queries.getCurrentUser);
  const isSuperAdmin = user?.adminRole === "super_admin";
  const { locale, messages, languageSwitchLabels } = useDashboardMessages();
  const toLocalizedPath = (path: string) => withLocalePrefix(path, locale);
  const loginPath = toLocalizedPath("/login");
  const internalPathname = stripLocalePrefix(pathname ?? "/");
  const { linkedBikeId, linkedSessionId } = getFeedbackRouteContext(pathname);
  const showFloatingFeedbackButton = internalPathname !== "/feedback";

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.replace(loginPath);
    }
  }, [isLoading, isAuthenticated, loginPath, router]);

  if (isLoading || !isAuthenticated) {
    return (
      <div className="min-h-screen bg-background">
        <LoadingState
          label={messages.layout.loading}
          className="min-h-screen"
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="hidden md:block">
        <DashboardSidebar />
      </div>

      <div className="sticky top-0 z-30 flex items-center justify-between border-b border-border bg-card/90 px-4 py-3 backdrop-blur md:hidden">
        <Link
          href={toLocalizedPath("/dashboard")}
          className="text-lg font-semibold text-foreground"
        >
          {BRAND.name}
        </Link>
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
            className="inline-flex h-9 w-9 items-center justify-center px-0 text-muted-foreground"
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
            className="fixed inset-0 z-30 bg-[color:var(--foreground)]/20 md:hidden"
          />
          <nav className="fixed inset-y-0 left-0 z-40 w-72 overflow-y-auto border-r border-border bg-card p-4 md:hidden">
            <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              {messages.layout.sections.dashboard}
            </p>
            <div className="space-y-1">
              {[
                { href: "/dashboard", label: messages.nav.dashboard },
                { href: "/feedback", label: messages.nav.feedback },
                { href: "/profile", label: messages.nav.profile },
                { href: "/bikes", label: messages.nav.myBikes },
                { href: "/bikes/new", label: messages.nav.newBike },
                { href: "/fit-history", label: messages.nav.bikeFitting },
                { href: "/fit", label: messages.nav.newFitSession },
                { href: "/pressure-calculator", label: messages.nav.tirePressure },
                { href: "/settings", label: messages.nav.settings },
              ].map((item) => (
                <Link
                  key={item.href}
                  href={toLocalizedPath(item.href)}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="block rounded-md px-3 py-2 text-sm text-muted-foreground hover:bg-accent hover:text-foreground"
                >
                  {item.label}
                </Link>
              ))}
            </div>
            <p className="mb-3 mt-6 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
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
                  className="block rounded-md px-3 py-2 text-sm text-muted-foreground hover:bg-accent hover:text-foreground"
                >
                  {item.label}
                </Link>
              ))}
            </div>
            {isSuperAdmin && (
              <>
                <p className="mb-3 mt-6 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  {messages.layout.sections.admin}
                </p>
                <div className="space-y-4">
                  {adminNavigationGroups.map((group) => (
                    <div key={group.label}>
                      <p className="mb-1 px-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                        {group.label}
                      </p>
                      <div className="space-y-0.5">
                        {group.items.map((item) => (
                          <Link
                            key={item.href}
                            href={item.href}
                            onClick={() => setIsMobileMenuOpen(false)}
                            className="block rounded-md px-3 py-2 text-sm text-muted-foreground hover:bg-accent hover:text-foreground"
                          >
                            {item.label}
                          </Link>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </nav>
        </>
      )}

      <div className="md:pl-64">
        <main id="main-content" tabIndex={-1} className="p-4 sm:p-6 md:p-8">
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

      {showFloatingFeedbackButton ? (
        <FeedbackFloatingButton
          onClick={() => setIsFeedbackDialogOpen(true)}
          label={messages.nav.feedback}
        />
      ) : null}
      <FeedbackDialog
        open={isFeedbackDialogOpen}
        onClose={() => setIsFeedbackDialogOpen(false)}
        linkedBikeId={linkedBikeId}
        linkedSessionId={linkedSessionId}
      />
      <DashboardMessageSurface showBanners={false} showHomeCards={false} />
    </div>
  );
}
