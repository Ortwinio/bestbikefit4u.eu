"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuthActions } from "@convex-dev/auth/react";
import { useConvexAuth } from "convex/react";
import { Button } from "@/components/ui";
import type { Locale } from "@/i18n/config";
import { withLocalePrefix } from "@/i18n/navigation";
import { Menu, X } from "lucide-react";

type HeaderMobileMenuProps = {
  locale: Locale;
  labels: {
    howItWorks: string;
    pricing: string;
    login: string;
    getStarted: string;
  };
};

export function HeaderMobileMenu({ locale, labels }: HeaderMobileMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const { isAuthenticated } = useConvexAuth();
  const { signOut } = useAuthActions();
  const router = useRouter();

  const close = () => setIsOpen(false);

  const handleSignOut = async () => {
    await signOut();
    close();
    router.push(withLocalePrefix("/", locale));
  };

  return (
    <div className="md:hidden">
      <button
        type="button"
        aria-label={isOpen ? "Close navigation menu" : "Open navigation menu"}
        aria-expanded={isOpen}
        onClick={() => setIsOpen((current) => !current)}
        className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-gray-200 bg-white text-gray-700"
      >
        {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </button>

      {isOpen && (
        <div className="absolute inset-x-0 top-full z-50 border-b border-gray-200 bg-white px-4 py-4 shadow-sm">
          <nav className="space-y-2">
            <Link
              href={withLocalePrefix("/about", locale)}
              onClick={close}
              className="block rounded-md px-3 py-2 text-sm text-gray-700 hover:bg-gray-100"
            >
              {labels.howItWorks}
            </Link>
            <Link
              href={withLocalePrefix("/pricing", locale)}
              onClick={close}
              className="block rounded-md px-3 py-2 text-sm text-gray-700 hover:bg-gray-100"
            >
              {labels.pricing}
            </Link>

            {isAuthenticated ? (
              <>
                <Link
                  href={withLocalePrefix("/dashboard", locale)}
                  onClick={close}
                  className="block rounded-md px-3 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  Dashboard
                </Link>
                <Link
                  href={withLocalePrefix("/fit", locale)}
                  onClick={close}
                  className="block rounded-md px-3 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  {locale === "nl" ? "Nieuwe fit-sessie" : "New Fit Session"}
                </Link>
                <Link
                  href={withLocalePrefix("/bikes", locale)}
                  onClick={close}
                  className="block rounded-md px-3 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  {locale === "nl" ? "Mijn fietsen" : "My Bikes"}
                </Link>
                <Link
                  href={withLocalePrefix("/profile", locale)}
                  onClick={close}
                  className="block rounded-md px-3 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  {locale === "nl" ? "Profiel" : "Profile"}
                </Link>
                <button
                  type="button"
                  onClick={handleSignOut}
                  className="mt-2 w-full rounded-md border border-gray-200 px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-100"
                >
                  {locale === "nl" ? "Uitloggen" : "Sign out"}
                </button>
              </>
            ) : (
              <div className="mt-2 flex items-center gap-2">
                <Link href={withLocalePrefix("/login", locale)} onClick={close}>
                  <Button variant="ghost" size="sm">
                    {labels.login}
                  </Button>
                </Link>
                <Link href={withLocalePrefix("/login", locale)} onClick={close}>
                  <Button size="sm">{labels.getStarted}</Button>
                </Link>
              </div>
            )}
          </nav>
        </div>
      )}
    </div>
  );
}
