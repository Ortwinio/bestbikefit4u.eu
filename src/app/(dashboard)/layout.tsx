"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useConvexAuth } from "convex/react";
import { DashboardSidebar } from "@/components/layout/DashboardSidebar";
import { LoadingState } from "@/components/ui";
import { BRAND } from "@/config/brand";
import { extractLocaleFromPathname, withLocalePrefix } from "@/i18n/navigation";
import { Menu, X } from "lucide-react";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { isLoading, isAuthenticated } = useConvexAuth();
  const locale = extractLocaleFromPathname(pathname ?? "");
  const toLocalizedPath = (path: string) =>
    locale ? withLocalePrefix(path, locale) : path;

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.replace(toLocalizedPath("/login"));
    }
  }, [isLoading, isAuthenticated, router, locale]);

  if (isLoading || !isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50">
        <LoadingState label="Loading dashboard..." className="min-h-screen" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="hidden md:block">
        <DashboardSidebar />
      </div>

      <div className="sticky top-0 z-30 flex items-center justify-between border-b border-gray-200 bg-white px-4 py-3 md:hidden">
        <Link href={toLocalizedPath("/dashboard")} className="text-lg font-semibold text-gray-900">
          {BRAND.name}
        </Link>
        <button
          type="button"
          aria-expanded={isMobileMenuOpen}
          aria-label={isMobileMenuOpen ? "Close dashboard menu" : "Open dashboard menu"}
          onClick={() => setIsMobileMenuOpen((current) => !current)}
          className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-gray-200 bg-white text-gray-700"
        >
          {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {isMobileMenuOpen && (
        <>
          <button
            type="button"
            aria-label="Close dashboard menu overlay"
            onClick={() => setIsMobileMenuOpen(false)}
            className="fixed inset-0 z-30 bg-black/30 md:hidden"
          />
          <nav className="fixed inset-y-0 left-0 z-40 w-72 overflow-y-auto border-r border-gray-200 bg-white p-4 md:hidden">
            <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-gray-400">
              Dashboard
            </p>
            <div className="space-y-1">
              {[
                { href: "/dashboard", label: "Dashboard" },
                { href: "/fit", label: locale === "nl" ? "Nieuwe fit-sessie" : "New Fit Session" },
                { href: "/bikes", label: locale === "nl" ? "Mijn fietsen" : "My Bikes" },
                { href: "/profile", label: locale === "nl" ? "Profiel" : "Profile" },
              ].map((item) => (
                <Link
                  key={item.href}
                  href={toLocalizedPath(item.href)}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="block rounded-md px-3 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  {item.label}
                </Link>
              ))}
            </div>
            <p className="mb-3 mt-6 text-xs font-semibold uppercase tracking-wide text-gray-400">
              Website
            </p>
            <div className="space-y-1">
              {[
                { href: "/", label: locale === "nl" ? "Home" : "Home" },
                { href: "/about", label: locale === "nl" ? "Hoe het werkt" : "How It Works" },
                { href: "/pricing", label: locale === "nl" ? "Prijzen" : "Pricing" },
              ].map((item) => (
                <Link
                  key={item.href}
                  href={toLocalizedPath(item.href)}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="block rounded-md px-3 py-2 text-sm text-gray-700 hover:bg-gray-100"
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
