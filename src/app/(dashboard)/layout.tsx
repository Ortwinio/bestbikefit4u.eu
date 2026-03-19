"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useConvexAuth } from "convex/react";
import { DashboardSidebar } from "@/components/layout/DashboardSidebar";
import { Button, LoadingState } from "@/components/ui";
import { LanguageSwitch } from "@/components/layout/LanguageSwitch";
import { BRAND } from "@/config/brand";
import { withLocalePrefix } from "@/i18n/navigation";
import { useDashboardMessages } from "@/i18n/useDashboardMessages";
import { Menu, X } from "lucide-react";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { isLoading, isAuthenticated } = useConvexAuth();
  const { locale, messages, languageSwitchLabels } = useDashboardMessages();
  const toLocalizedPath = (path: string) => withLocalePrefix(path, locale);
  const loginPath = toLocalizedPath("/login");

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.replace(loginPath);
    }
  }, [isLoading, isAuthenticated, loginPath, router]);

  if (isLoading || !isAuthenticated) {
    return (
      <div className="min-h-screen bg-[color:var(--background)]">
        <LoadingState
          label={messages.layout.loading}
          className="min-h-screen"
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[color:var(--background)]">
      <div className="hidden md:block">
        <DashboardSidebar />
      </div>

      <div className="sticky top-0 z-30 flex items-center justify-between border-b border-[color:var(--border)] bg-[color:color-mix(in_oklch,var(--card)_88%,transparent)] px-4 py-3 backdrop-blur md:hidden">
        <Link
          href={toLocalizedPath("/dashboard")}
          className="text-lg font-semibold text-[color:var(--foreground)]"
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
            className="inline-flex h-9 w-9 items-center justify-center px-0 text-[color:var(--muted-foreground)]"
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
            className="fixed inset-0 z-30 bg-black/30 md:hidden"
          />
          <nav className="fixed inset-y-0 left-0 z-40 w-72 overflow-y-auto border-r border-[color:var(--border)] bg-[color:var(--card)] p-4 md:hidden">
            <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-[color:var(--muted-foreground)]">
              {messages.layout.sections.dashboard}
            </p>
            <div className="space-y-1">
              {[
                { href: "/dashboard", label: messages.nav.dashboard },
                { href: "/fit", label: messages.nav.newFitSession },
                { href: "/bikes", label: messages.nav.myBikes },
                { href: "/pressure-calculator", label: messages.nav.tirePressure },
                { href: "/profile", label: messages.nav.profile },
                { href: "/settings", label: messages.nav.settings },
              ].map((item) => (
                <Link
                  key={item.href}
                  href={toLocalizedPath(item.href)}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="block rounded-md px-3 py-2 text-sm text-[color:var(--muted-foreground)] hover:bg-[color:var(--accent)] hover:text-[color:var(--foreground)]"
                >
                  {item.label}
                </Link>
              ))}
            </div>
            <p className="mb-3 mt-6 text-xs font-semibold uppercase tracking-wide text-[color:var(--muted-foreground)]">
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
                  className="block rounded-md px-3 py-2 text-sm text-[color:var(--muted-foreground)] hover:bg-[color:var(--accent)] hover:text-[color:var(--foreground)]"
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </nav>
        </>
      )}

      <div className="md:pl-64">
        <main id="main-content" tabIndex={-1} className="p-4 sm:p-6 md:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
